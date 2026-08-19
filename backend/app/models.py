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
    kind: Mapped[str] = mapped_column(String(32))
    latitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    longitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class Device(Base):
    __tablename__ = "devices"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid_str)
    device_code: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(120))
    status: Mapped[str] = mapped_column(String(24), default="online")
    location_id: Mapped[str] = mapped_column(String(36), ForeignKey("locations.id"))
    firmware_version: Mapped[str | None] = mapped_column(String(32), nullable=True)
    last_seen: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    location: Mapped[Location] = relationship()
    readings: Mapped[list["SensorReading"]] = relationship(back_populates="device")


class SensorReading(Base):
    __tablename__ = "sensor_readings"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid_str)
    device_id: Mapped[str] = mapped_column(String(36), ForeignKey("devices.id"), index=True)
    recorded_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)
    temperature: Mapped[float] = mapped_column(Float)
    humidity: Mapped[float] = mapped_column(Float)
    condition: Mapped[str] = mapped_column(String(32))
    action: Mapped[str | None] = mapped_column(String(120), nullable=True)
    confidence: Mapped[float | None] = mapped_column(Float, nullable=True)
    previous_hash: Mapped[str | None] = mapped_column(String(128), nullable=True)
    current_hash: Mapped[str | None] = mapped_column(String(128), nullable=True)

    device: Mapped[Device] = relationship(back_populates="readings")


class ConditionEvent(Base):
    __tablename__ = "condition_events"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid_str)
    device_id: Mapped[str] = mapped_column(String(36), ForeignKey("devices.id"), index=True)
    reading_id: Mapped[str] = mapped_column(String(36), ForeignKey("sensor_readings.id"), index=True)
    condition: Mapped[str] = mapped_column(String(32))
    severity: Mapped[str] = mapped_column(String(24))
    message: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class VaccineBatch(Base):
    __tablename__ = "vaccine_batches"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid_str)
    batch_code: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    vaccine_name: Mapped[str] = mapped_column(String(120))
    location_id: Mapped[str] = mapped_column(String(36), ForeignKey("locations.id"))
    current_status: Mapped[str] = mapped_column(String(32), default="stable")
    thermal_stress_score: Mapped[float] = mapped_column(Float, default=0)
    viability_percent: Mapped[int] = mapped_column(Integer, default=100)
    last_vvm_stage: Mapped[int | None] = mapped_column(Integer, nullable=True)
    last_vvm_classification: Mapped[str | None] = mapped_column(String(64), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    location: Mapped[Location] = relationship()


class Alert(Base):
    __tablename__ = "alerts"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid_str)
    source_type: Mapped[str] = mapped_column(String(32))
    source_id: Mapped[str] = mapped_column(String(36), index=True)
    severity: Mapped[str] = mapped_column(String(16))
    category: Mapped[str] = mapped_column(String(32))
    title: Mapped[str] = mapped_column(String(120))
    message: Mapped[str] = mapped_column(Text)
    acknowledged: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)


class AuditRecord(Base):
    __tablename__ = "audit_records"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid_str)
    entity_type: Mapped[str] = mapped_column(String(32))
    entity_id: Mapped[str] = mapped_column(String(36), index=True)
    previous_hash: Mapped[str | None] = mapped_column(String(128), nullable=True)
    current_hash: Mapped[str | None] = mapped_column(String(128), nullable=True)
    payload_summary: Mapped[str] = mapped_column(Text)
    verified: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class CameraDevice(Base):
    __tablename__ = "camera_devices"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid_str)
    camera_code: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    device_name: Mapped[str] = mapped_column(String(120))
    location_id: Mapped[str] = mapped_column(String(36), ForeignKey("locations.id"))
    ip_address: Mapped[str] = mapped_column(String(64))
    status: Mapped[str] = mapped_column(String(24), default="online")
    last_seen: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
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
    camera_id: Mapped[str] = mapped_column(String(36), ForeignKey("camera_devices.id"), index=True)
    batch_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("vaccine_batches.id"), nullable=True)
    capture_id: Mapped[str] = mapped_column(String(36), ForeignKey("camera_captures.id"), index=True)
    scanned_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)
    vvm_stage: Mapped[int] = mapped_column(Integer)
    classification: Mapped[str] = mapped_column(String(64))
    confidence: Mapped[float] = mapped_column(Float)
    image_reference: Mapped[str] = mapped_column(String(255))
