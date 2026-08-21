from __future__ import annotations

from datetime import datetime
from uuid import uuid4

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


def uuid_str() -> str:
    return str(uuid4())


class Location(Base):
    __tablename__ = "locations"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid_str)
    name: Mapped[str] = mapped_column(String(120), unique=True, index=True)
    code: Mapped[str] = mapped_column(String(32), unique=True, index=True)
    kind: Mapped[str] = mapped_column(String(32))  # phc, regional_store, transport_carrier, sub_center
    state_province: Mapped[str] = mapped_column(String(64), default="Telangana")
    district: Mapped[str] = mapped_column(String(64), default="Hyderabad")
    latitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    longitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    power_status: Mapped[str] = mapped_column(String(32), default="grid_normal")  # grid_normal, battery_backup, power_cut
    battery_backup_hours: Mapped[float] = mapped_column(Float, default=8.0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    devices: Mapped[list["Device"]] = relationship(back_populates="location")
    batches: Mapped[list["VaccineBatch"]] = relationship(back_populates="location")


class Device(Base):
    __tablename__ = "devices"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid_str)
    device_code: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(120))
    equipment_type: Mapped[str] = mapped_column(String(64), default="ILR Refrigerator")  # ILR, Deep Freezer, Cold Box, SDD
    status: Mapped[str] = mapped_column(String(24), default="online")  # online, warning, critical, offline
    location_id: Mapped[str] = mapped_column(String(36), ForeignKey("locations.id"))
    firmware_version: Mapped[str | None] = mapped_column(String(32), default="v2.4.0-TVCE")
    last_seen: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    battery_level: Mapped[int] = mapped_column(Integer, default=95)
    power_cut_detected: Mapped[bool] = mapped_column(Boolean, default=False)
    offline_buffer_count: Mapped[int] = mapped_column(Integer, default=0)
    baseline_vibration_rms: Mapped[float] = mapped_column(Float, default=1.2)  # mm/s healthy baseline
    current_vibration_rms: Mapped[float] = mapped_column(Float, default=1.3)  # current reading
    vibration_health_score: Mapped[int] = mapped_column(Integer, default=96)  # 0-100%
    compressor_drift_alert: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    location: Mapped[Location] = relationship(back_populates="devices")
    readings: Mapped[list["SensorReading"]] = relationship(back_populates="device")


class SensorReading(Base):
    __tablename__ = "sensor_readings"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid_str)
    device_id: Mapped[str] = mapped_column(String(36), ForeignKey("devices.id"), index=True)
    record_number: Mapped[int] = mapped_column(Integer, default=0, index=True)
    recorded_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)
    temperature: Mapped[float] = mapped_column(Float)
    humidity: Mapped[float] = mapped_column(Float)
    vibration_rms: Mapped[float] = mapped_column(Float, default=1.2)
    vibration_frequency_hz: Mapped[float] = mapped_column(Float, default=50.0)
    condition: Mapped[str] = mapped_column(String(32))  # NORMAL, FREEZE_RISK, WARNING, HOLD
    action: Mapped[str | None] = mapped_column(String(120), nullable=True)  # CONTINUE, VERIFY, HOLD_VERIFY
    confidence: Mapped[float | None] = mapped_column(Float, nullable=True)
    previous_hash: Mapped[str | None] = mapped_column(String(128), nullable=True)
    current_hash: Mapped[str | None] = mapped_column(String(128), nullable=True)
    is_offline_synced: Mapped[bool] = mapped_column(Boolean, default=False)

    device: Mapped[Device] = relationship(back_populates="readings")


class VaccineBatch(Base):
    __tablename__ = "vaccine_batches"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid_str)
    batch_code: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    vaccine_name: Mapped[str] = mapped_column(String(120))  # COVID-19 (Pfizer), MMR, BCG, Polio (IPV), Hepatitis B, etc.
    vaccine_type: Mapped[str] = mapped_column(String(64), default="Type B (Heat Sensitive)")
    manufacturer: Mapped[str] = mapped_column(String(120), default="Serum Institute of India")
    location_id: Mapped[str] = mapped_column(String(36), ForeignKey("locations.id"))
    current_status: Mapped[str] = mapped_column(String(32), default="safe")  # safe, warning, critical, discard
    initial_doses: Mapped[int] = mapped_column(Integer, default=500)
    remaining_doses: Mapped[int] = mapped_column(Integer, default=480)
    expiry_date: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    thermal_stress_score: Mapped[float] = mapped_column(Float, default=0.0)  # 0 to 100%
    viability_percent: Mapped[int] = mapped_column(Integer, default=100)
    total_excursions: Mapped[int] = mapped_column(Integer, default=0)
    max_excursion_delta: Mapped[float] = mapped_column(Float, default=0.0)  # e.g., 3.2°C above
    excursion_duration_hours: Mapped[float] = mapped_column(Float, default=0.0)  # e.g. 6.5h
    last_vvm_stage: Mapped[int | None] = mapped_column(Integer, nullable=True)  # 1, 2, 3, 4
    last_vvm_classification: Mapped[str | None] = mapped_column(String(64), nullable=True)
    vvm_match_status: Mapped[str] = mapped_column(String(32), default="verified_match")  # verified_match, discrepancy_alert
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    location: Mapped[Location] = relationship(back_populates="batches")
    scans: Mapped[list["VvmScan"]] = relationship(back_populates="batch")


class CameraDevice(Base):
    __tablename__ = "camera_devices"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid_str)
    camera_code: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    device_name: Mapped[str] = mapped_column(String(120))
    location_id: Mapped[str] = mapped_column(String(36), ForeignKey("locations.id"))
    ip_address: Mapped[str] = mapped_column(String(64))
    status: Mapped[str] = mapped_column(String(24), default="online")
    last_seen: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    resolution: Mapped[str] = mapped_column(String(32), default="QQVGA (RGB565)")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    location: Mapped[Location] = relationship()


class CameraCapture(Base):
    __tablename__ = "camera_captures"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid_str)
    camera_id: Mapped[str] = mapped_column(String(36), ForeignKey("camera_devices.id"), index=True)
    batch_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("vaccine_batches.id"), nullable=True)
    captured_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)
    image_reference: Mapped[str] = mapped_column(String(255))
    content_type: Mapped[str] = mapped_column(String(64), default="image/jpeg")
    size_bytes: Mapped[int] = mapped_column(Integer)


class VvmScan(Base):
    __tablename__ = "vvm_scans"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid_str)
    camera_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("camera_devices.id"), nullable=True, index=True)
    batch_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("vaccine_batches.id"), nullable=True, index=True)
    capture_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("camera_captures.id"), nullable=True)
    scanned_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)
    vvm_stage: Mapped[int] = mapped_column(Integer)  # 1 (Fresh), 2 (Monitor), 3 (Do not use), 4 (Discard)
    classification: Mapped[str] = mapped_column(String(64))  # Fresh / Usable, Monitor / Use First, Endpoint / Discard, Beyond Discard
    confidence: Mapped[float] = mapped_column(Float)
    delta_e: Mapped[float] = mapped_column(Float, default=18.5)  # Color distance between inner square and outer circle
    inner_rgb: Mapped[str] = mapped_column(String(32), default="#FFFFFF")
    outer_rgb: Mapped[str] = mapped_column(String(32), default="#4B5563")
    image_reference: Mapped[str] = mapped_column(String(255))
    verified_against_temp: Mapped[bool] = mapped_column(Boolean, default=True)
    discrepancy_note: Mapped[str | None] = mapped_column(String(255), nullable=True)

    batch: Mapped[VaccineBatch | None] = relationship(back_populates="scans")


class PredictiveMaintenanceEvent(Base):
    __tablename__ = "predictive_maintenance_events"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid_str)
    device_id: Mapped[str] = mapped_column(String(36), ForeignKey("devices.id"), index=True)
    component: Mapped[str] = mapped_column(String(64))  # Compressor, Door Seal, Condenser Fan, Evaporator
    anomaly_type: Mapped[str] = mapped_column(String(64))  # Baseline Vibration Drift, Harmonic Distortion, Seal Thermal Leak
    current_value: Mapped[float] = mapped_column(Float)  # e.g., 3.8 mm/s
    baseline_value: Mapped[float] = mapped_column(Float)  # e.g., 1.2 mm/s
    drift_percent: Mapped[float] = mapped_column(Float)  # +216%
    estimated_ttf_days: Mapped[float] = mapped_column(Float)  # 4.5 days before catastrophic failure
    recommendation: Mapped[str] = mapped_column(Text)
    severity: Mapped[str] = mapped_column(String(24), default="warning")  # warning, critical
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    device: Mapped[Device] = relationship()


class Alert(Base):
    __tablename__ = "alerts"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid_str)
    source_type: Mapped[str] = mapped_column(String(32))  # sensor, batch, vvm, predictive, power
    source_id: Mapped[str] = mapped_column(String(36), index=True)
    severity: Mapped[str] = mapped_column(String(16))  # safe, warning, critical
    category: Mapped[str] = mapped_column(String(32))  # temperature, vibration, vvm_discrepancy, power_cut, blockchain
    title: Mapped[str] = mapped_column(String(120))
    message: Mapped[Text] = mapped_column(Text)
    action_required: Mapped[str | None] = mapped_column(String(255), nullable=True)
    acknowledged: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)


class AuditRecord(Base):
    __tablename__ = "audit_records"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid_str)
    record_number: Mapped[int] = mapped_column(Integer, index=True)
    entity_type: Mapped[str] = mapped_column(String(32), default="sensor_reading")
    entity_id: Mapped[str] = mapped_column(String(36), default=uuid_str, index=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    temperature: Mapped[float] = mapped_column(Float)
    humidity: Mapped[float] = mapped_column(Float)
    condition: Mapped[str] = mapped_column(String(32))
    previous_hash: Mapped[str] = mapped_column(String(128))
    current_hash: Mapped[str] = mapped_column(String(128), index=True)
    payload_summary: Mapped[str] = mapped_column(Text)
    verified: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
