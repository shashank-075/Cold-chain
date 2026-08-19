from __future__ import annotations

from contextlib import asynccontextmanager
from datetime import datetime

import httpx
from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import desc, func, select
from sqlalchemy.orm import Session

from .database import Base, SessionLocal, STORAGE_DIR, engine, ensure_storage
from .models import Alert, CameraCapture, CameraDevice, Device, Location, SensorReading, VaccineBatch, VvmScan
from .schemas import (
    AlertOut,
    BatchDetailOut,
    BatchOut,
    CameraCaptureOut,
    CameraCaptureRequest,
    CameraDeviceCreate,
    CameraDeviceOut,
    DashboardSummary,
    LocationOut,
    SensorDeviceOut,
    SensorReadingCreate,
    SensorReadingOut,
    TemperatureSeriesPoint,
)
from .services import (
    calculate_thermal_stress,
    create_sensor_side_effects,
    fetch_camera_capture,
    latest_batch_image,
    latest_capture_path,
    persist_capture,
    seed_demo_data,
    sync_batches_for_location,
    upsert_sensor_device,
    vvm_from_bytes,
)


@asynccontextmanager
async def lifespan(_: FastAPI):
    ensure_storage()
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as session:
        seed_demo_data(session)
    yield


app = FastAPI(title="Cold-chain Backend", version="1.0.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.mount("/storage", StaticFiles(directory=STORAGE_DIR), name="storage")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.get("/health")
def healthcheck():
    return {"status": "ok", "timestamp": datetime.utcnow().isoformat()}


@app.get("/api/v1/dashboard/summary", response_model=DashboardSummary)
def dashboard_summary(db: Session = Depends(get_db)):
    latest_capture = db.scalar(select(func.max(CameraCapture.captured_at)))
    return DashboardSummary(
        active_locations=db.scalar(select(func.count(Location.id))) or 0,
        active_sensor_devices=db.scalar(select(func.count(Device.id))) or 0,
        registered_cameras=db.scalar(select(func.count(CameraDevice.id))) or 0,
        monitored_batches=db.scalar(select(func.count(VaccineBatch.id))) or 0,
        open_alerts=db.scalar(select(func.count(Alert.id)).where(Alert.acknowledged.is_(False))) or 0,
        latest_capture_at=latest_capture,
    )


@app.get("/api/v1/locations", response_model=list[LocationOut])
def list_locations(db: Session = Depends(get_db)):
    return db.scalars(select(Location).order_by(Location.name)).all()


@app.get("/api/v1/devices", response_model=list[SensorDeviceOut])
def list_devices(db: Session = Depends(get_db)):
    devices = db.scalars(select(Device).order_by(Device.name)).all()
    response: list[SensorDeviceOut] = []
    for device in devices:
        latest = db.scalar(
            select(SensorReading)
            .where(SensorReading.device_id == device.id)
            .order_by(desc(SensorReading.recorded_at))
            .limit(1)
        )
        response.append(
            SensorDeviceOut(
                id=device.id,
                device_code=device.device_code,
                name=device.name,
                location_name=device.location.name,
                status=device.status,
                firmware_version=device.firmware_version,
                last_seen=device.last_seen,
                latest_temperature=latest.temperature if latest else None,
                latest_humidity=latest.humidity if latest else None,
                latest_condition=latest.condition if latest else None,
            )
        )
    return response


@app.get("/api/v1/devices/{device_id}/temperature", response_model=list[TemperatureSeriesPoint])
def device_temperature(device_id: str, db: Session = Depends(get_db)):
    readings = db.scalars(
        select(SensorReading)
        .where(SensorReading.device_id == device_id)
        .order_by(desc(SensorReading.recorded_at))
        .limit(24)
    ).all()
    return [
        TemperatureSeriesPoint(
            timestamp=reading.recorded_at,
            temperature=reading.temperature,
            humidity=reading.humidity,
            condition=reading.condition,
        )
        for reading in reversed(readings)
    ]


@app.post("/api/v1/sensor/readings", response_model=SensorReadingOut, status_code=status.HTTP_201_CREATED)
def create_sensor_reading(payload: SensorReadingCreate, db: Session = Depends(get_db)):
    location = None
    if payload.location_id:
        location = db.get(Location, payload.location_id)
    if location is None:
        location = db.scalar(select(Location).order_by(Location.created_at).limit(1))
    if location is None:
        raise HTTPException(status_code=400, detail="No location available for device registration")

    recorded_at = payload.recorded_at or datetime.utcnow()
    device = upsert_sensor_device(
        db,
        device_code=payload.device_code,
        device_name=payload.device_name,
        location_id=location.id,
        firmware_version=payload.firmware_version,
        seen_at=recorded_at,
    )
    reading = SensorReading(
        device_id=device.id,
        recorded_at=recorded_at,
        temperature=payload.temperature,
        humidity=payload.humidity,
        condition=payload.condition,
        action=payload.action,
        confidence=payload.confidence,
        previous_hash=payload.previous_hash,
        current_hash=payload.current_hash,
    )
    db.add(reading)
    db.flush()

    create_sensor_side_effects(db, device=device, reading=reading)
    stress_score = calculate_thermal_stress(payload.temperature, payload.humidity)
    sync_batches_for_location(db, location.id, stress_score)
    db.commit()
    db.refresh(reading)
    return reading


@app.get("/api/v1/batches", response_model=list[BatchOut])
def list_batches(db: Session = Depends(get_db)):
    batches = db.scalars(select(VaccineBatch).order_by(desc(VaccineBatch.updated_at))).all()
    return [
        BatchOut(
            id=batch.id,
            batch_code=batch.batch_code,
            vaccine_name=batch.vaccine_name,
            location_name=batch.location.name,
            current_status=batch.current_status,
            thermal_stress_score=batch.thermal_stress_score,
            viability_percent=batch.viability_percent,
            last_vvm_stage=batch.last_vvm_stage,
            last_vvm_classification=batch.last_vvm_classification,
            updated_at=batch.updated_at,
        )
        for batch in batches
    ]


@app.get("/api/v1/batches/{batch_id}", response_model=BatchDetailOut)
def get_batch(batch_id: str, db: Session = Depends(get_db)):
    batch = db.get(VaccineBatch, batch_id)
    if batch is None:
        raise HTTPException(status_code=404, detail="Batch not found")
    return BatchDetailOut(
        id=batch.id,
        batch_code=batch.batch_code,
        vaccine_name=batch.vaccine_name,
        location_name=batch.location.name,
        current_status=batch.current_status,
        thermal_stress_score=batch.thermal_stress_score,
        viability_percent=batch.viability_percent,
        last_vvm_stage=batch.last_vvm_stage,
        last_vvm_classification=batch.last_vvm_classification,
        updated_at=batch.updated_at,
        last_scan_image=latest_batch_image(db, batch.id),
    )


@app.get("/api/v1/alerts", response_model=list[AlertOut])
def list_alerts(db: Session = Depends(get_db)):
    return db.scalars(select(Alert).order_by(desc(Alert.created_at)).limit(20)).all()


@app.get("/api/v1/cameras", response_model=list[CameraDeviceOut])
def list_cameras(db: Session = Depends(get_db)):
    cameras = db.scalars(select(CameraDevice).order_by(CameraDevice.device_name)).all()
    return [
        CameraDeviceOut(
            id=camera.id,
            camera_code=camera.camera_code,
            device_name=camera.device_name,
            location_name=camera.location.name,
            ip_address=camera.ip_address,
            status=camera.status,
            last_seen=camera.last_seen,
            latest_capture=latest_capture_path(db, camera.id),
        )
        for camera in cameras
    ]


@app.post("/api/v1/cameras", response_model=CameraDeviceOut, status_code=status.HTTP_201_CREATED)
def register_camera(payload: CameraDeviceCreate, db: Session = Depends(get_db)):
    location = db.get(Location, payload.location_id)
    if location is None:
        raise HTTPException(status_code=404, detail="Location not found")
    camera = CameraDevice(
        camera_code=payload.camera_code,
        device_name=payload.device_name,
        location_id=payload.location_id,
        ip_address=payload.ip_address,
        status="registered",
        last_seen=datetime.utcnow(),
    )
    db.add(camera)
    db.commit()
    db.refresh(camera)
    return CameraDeviceOut(
        id=camera.id,
        camera_code=camera.camera_code,
        device_name=camera.device_name,
        location_name=location.name,
        ip_address=camera.ip_address,
        status=camera.status,
        last_seen=camera.last_seen,
        latest_capture=None,
    )


@app.post("/api/v1/cameras/{camera_id}/capture", response_model=CameraCaptureOut, status_code=status.HTTP_201_CREATED)
async def capture_from_camera(camera_id: str, payload: CameraCaptureRequest, db: Session = Depends(get_db)):
    camera = db.get(CameraDevice, camera_id)
    if camera is None:
        raise HTTPException(status_code=404, detail="Camera not found")
    if payload.batch_id and db.get(VaccineBatch, payload.batch_id) is None:
        raise HTTPException(status_code=404, detail="Batch not found")

    try:
        image_bytes, content_type = await fetch_camera_capture(camera.ip_address)
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=502, detail=f"Camera capture failed: {exc}") from exc

    image_reference = persist_capture(image_bytes, camera.camera_code)
    stage, classification, confidence = vvm_from_bytes(image_bytes)
    capture = CameraCapture(
        camera_id=camera.id,
        batch_id=payload.batch_id,
        image_reference=image_reference,
        content_type=content_type,
        size_bytes=len(image_bytes),
    )
    db.add(capture)
    db.flush()

    scan = VvmScan(
        camera_id=camera.id,
        batch_id=payload.batch_id,
        capture_id=capture.id,
        vvm_stage=stage,
        classification=classification,
        confidence=confidence,
        image_reference=image_reference,
    )
    db.add(scan)
    camera.last_seen = datetime.utcnow()
    camera.status = "online"

    if payload.batch_id:
        batch = db.get(VaccineBatch, payload.batch_id)
        if batch:
            batch.last_vvm_stage = stage
            batch.last_vvm_classification = classification
            if stage >= 3:
                batch.current_status = "critical"
                batch.viability_percent = min(batch.viability_percent, 45)
                db.add(
                    Alert(
                        source_type="batch",
                        source_id=batch.id,
                        severity="critical",
                        category="vvm",
                        title=f"VVM escalation for {batch.batch_code}",
                        message=f"Latest scan classified the vial monitor as {classification}.",
                    )
                )

    db.commit()
    db.refresh(capture)
    return CameraCaptureOut(
        capture_id=capture.id,
        camera_id=camera.id,
        image_reference=image_reference,
        captured_at=capture.captured_at,
        vvm_stage=stage,
        classification=classification,
        confidence=confidence,
    )


@app.get("/api/v1/cameras/{camera_id}/latest-image")
def latest_camera_image(camera_id: str, db: Session = Depends(get_db)):
    camera = db.get(CameraDevice, camera_id)
    if camera is None:
        raise HTTPException(status_code=404, detail="Camera not found")
    image_reference = latest_capture_path(db, camera.id)
    if image_reference is None:
        raise HTTPException(status_code=404, detail="No captures available")
    return {"camera_id": camera.id, "image_reference": image_reference}
