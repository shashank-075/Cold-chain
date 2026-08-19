from __future__ import annotations

import hashlib
from datetime import datetime
from pathlib import Path

import httpx
from sqlalchemy import desc, func, select
from sqlalchemy.orm import Session

from .database import CAPTURES_DIR
from .models import (
    Alert,
    AuditRecord,
    CameraCapture,
    CameraDevice,
    ConditionEvent,
    Device,
    Location,
    SensorReading,
    VaccineBatch,
    VvmScan,
)


def calculate_thermal_stress(temperature: float, humidity: float) -> float:
    baseline_penalty = max(0.0, temperature - 8.0) * 9.0 + max(0.0, 2.0 - temperature) * 12.0
    humidity_penalty = max(0.0, humidity - 75.0) * 0.15
    return round(min(100.0, baseline_penalty + humidity_penalty), 2)


def classify_status(stress_score: float) -> tuple[str, int]:
    if stress_score >= 70:
        return "critical", 50
    if stress_score >= 35:
        return "warning", 75
    return "stable", 96


def vvm_from_bytes(image_bytes: bytes) -> tuple[int, str, float]:
    digest = hashlib.sha1(image_bytes).digest()[0]
    stage = (digest % 4) + 1
    labels = {
        1: "Fresh",
        2: "Monitor",
        3: "Use soon",
        4: "Discard",
    }
    confidence = round(0.72 + (digest / 255) * 0.27, 2)
    return stage, labels[stage], min(confidence, 0.99)


def upsert_sensor_device(
    session: Session,
    *,
    device_code: str,
    device_name: str,
    location_id: str,
    firmware_version: str | None,
    seen_at: datetime,
) -> Device:
    device = session.scalar(select(Device).where(Device.device_code == device_code))
    if device is None:
        device = Device(
            device_code=device_code,
            name=device_name,
            location_id=location_id,
            firmware_version=firmware_version,
            last_seen=seen_at,
            status="online",
        )
        session.add(device)
        session.flush()
        return device

    device.name = device_name
    device.location_id = location_id
    device.firmware_version = firmware_version or device.firmware_version
    device.last_seen = seen_at
    device.status = "online"
    session.flush()
    return device


def create_sensor_side_effects(
    session: Session,
    *,
    device: Device,
    reading: SensorReading,
) -> None:
    if reading.condition.upper() not in {"WARNING", "HOLD", "FREEZE_RISK"}:
        return

    severity = "critical" if reading.condition.upper() in {"HOLD", "FREEZE_RISK"} else "warning"
    event = ConditionEvent(
        device_id=device.id,
        reading_id=reading.id,
        condition=reading.condition,
        severity=severity,
        message=f"{device.name} reported {reading.condition} at {reading.temperature:.1f}C",
    )
    alert = Alert(
        source_type="device",
        source_id=device.id,
        severity=severity,
        category="sensor",
        title=f"{reading.condition} on {device.name}",
        message=event.message,
    )
    audit = AuditRecord(
        entity_type="sensor_reading",
        entity_id=reading.id,
        previous_hash=reading.previous_hash,
        current_hash=reading.current_hash,
        payload_summary=f"{device.device_code}|{reading.recorded_at.isoformat()}|{reading.temperature}|{reading.humidity}|{reading.condition}",
        verified=bool(reading.current_hash),
    )
    session.add_all([event, alert, audit])


def sync_batches_for_location(session: Session, location_id: str, stress_score: float) -> None:
    batches = session.scalars(select(VaccineBatch).where(VaccineBatch.location_id == location_id)).all()
    for batch in batches:
        batch.thermal_stress_score = max(batch.thermal_stress_score, stress_score)
        batch.current_status, batch.viability_percent = classify_status(batch.thermal_stress_score)
        batch.updated_at = datetime.utcnow()
    session.flush()


async def fetch_camera_capture(ip_address: str) -> tuple[bytes, str]:
    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.get(f"http://{ip_address}/capture")
        response.raise_for_status()
        return response.content, response.headers.get("content-type", "image/jpeg")


def persist_capture(image_bytes: bytes, camera_code: str) -> str:
    timestamp = datetime.utcnow().strftime("%Y%m%d%H%M%S")
    digest = hashlib.sha1(image_bytes).hexdigest()[:10]
    filename = f"{camera_code}-{timestamp}-{digest}.jpg"
    target = Path(CAPTURES_DIR) / filename
    target.write_bytes(image_bytes)
    return f"/storage/captures/{filename}"


def latest_capture_path(session: Session, camera_id: str) -> str | None:
    return session.scalar(
        select(CameraCapture.image_reference)
        .where(CameraCapture.camera_id == camera_id)
        .order_by(desc(CameraCapture.captured_at))
        .limit(1)
    )


def latest_batch_image(session: Session, batch_id: str) -> str | None:
    return session.scalar(
        select(VvmScan.image_reference)
        .where(VvmScan.batch_id == batch_id)
        .order_by(desc(VvmScan.scanned_at))
        .limit(1)
    )


def seed_demo_data(session: Session) -> None:
    if session.scalar(select(func.count(Location.id))) > 0:
        return

    locations = [
        Location(name="PHC Central", kind="phc", latitude=13.0827, longitude=80.2707),
        Location(name="District Store South", kind="storage", latitude=12.9716, longitude=77.5946),
    ]
    session.add_all(locations)
    session.flush()

    devices = [
        Device(
            device_code="SENSOR-001",
            name="Refrigerator A1",
            location_id=locations[0].id,
            status="online",
            firmware_version="1.0.0",
            last_seen=datetime.utcnow(),
        ),
        Device(
            device_code="SENSOR-002",
            name="Cold Box Carrier 7",
            location_id=locations[1].id,
            status="warning",
            firmware_version="1.0.2",
            last_seen=datetime.utcnow(),
        ),
    ]
    session.add_all(devices)
    session.flush()

    readings = [
        SensorReading(device_id=devices[0].id, temperature=4.8, humidity=63, condition="NORMAL", action="Continue monitoring", confidence=0.93),
        SensorReading(device_id=devices[0].id, temperature=5.1, humidity=65, condition="NORMAL", action="Continue monitoring", confidence=0.94),
        SensorReading(device_id=devices[1].id, temperature=8.9, humidity=70, condition="WARNING", action="Inspect cooling pack", confidence=0.87),
    ]
    session.add_all(readings)

    camera = CameraDevice(
        camera_code="CAM-001",
        device_name="VVM Camera A1",
        location_id=locations[0].id,
        ip_address="192.168.4.10",
        status="registered",
        last_seen=datetime.utcnow(),
    )
    session.add(camera)
    session.flush()

    batches = [
        VaccineBatch(
            batch_code="BATCH-COV-101",
            vaccine_name="COVID-19 mRNA",
            location_id=locations[0].id,
            current_status="stable",
            thermal_stress_score=12,
            viability_percent=96,
            last_vvm_stage=1,
            last_vvm_classification="Fresh",
        ),
        VaccineBatch(
            batch_code="BATCH-MMR-204",
            vaccine_name="MMR",
            location_id=locations[1].id,
            current_status="warning",
            thermal_stress_score=41,
            viability_percent=75,
            last_vvm_stage=2,
            last_vvm_classification="Monitor",
        ),
    ]
    session.add_all(batches)

    alert = Alert(
        source_type="device",
        source_id=devices[1].id,
        severity="warning",
        category="sensor",
        title="Temperature excursion",
        message="Cold Box Carrier 7 crossed the upper range and needs inspection.",
    )
    session.add(alert)
    session.commit()
