from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class LocationOut(BaseModel):
    id: str
    name: str
    kind: str
    latitude: float | None
    longitude: float | None

    model_config = ConfigDict(from_attributes=True)


class SensorReadingCreate(BaseModel):
    device_code: str = Field(min_length=2, max_length=64)
    device_name: str = Field(min_length=2, max_length=120)
    location_id: str | None = None
    temperature: float
    humidity: float = Field(ge=0, le=100)
    condition: str
    action: str | None = None
    confidence: float | None = Field(default=None, ge=0, le=1)
    recorded_at: datetime | None = None
    previous_hash: str | None = None
    current_hash: str | None = None
    firmware_version: str | None = None


class SensorReadingOut(BaseModel):
    id: str
    recorded_at: datetime
    temperature: float
    humidity: float
    condition: str
    action: str | None
    confidence: float | None

    model_config = ConfigDict(from_attributes=True)


class SensorDeviceOut(BaseModel):
    id: str
    device_code: str
    name: str
    location_name: str
    status: str
    firmware_version: str | None
    last_seen: datetime | None
    latest_temperature: float | None
    latest_humidity: float | None
    latest_condition: str | None


class TemperatureSeriesPoint(BaseModel):
    timestamp: datetime
    temperature: float
    humidity: float
    condition: str


class BatchOut(BaseModel):
    id: str
    batch_code: str
    vaccine_name: str
    location_name: str
    current_status: str
    thermal_stress_score: float
    viability_percent: int
    last_vvm_stage: int | None
    last_vvm_classification: str | None
    updated_at: datetime


class BatchDetailOut(BatchOut):
    last_scan_image: str | None = None


class AlertOut(BaseModel):
    id: str
    severity: str
    category: str
    title: str
    message: str
    acknowledged: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CameraDeviceCreate(BaseModel):
    camera_code: str = Field(min_length=2, max_length=64)
    device_name: str = Field(min_length=2, max_length=120)
    location_id: str
    ip_address: str = Field(min_length=7, max_length=64)


class CameraDeviceOut(BaseModel):
    id: str
    camera_code: str
    device_name: str
    location_name: str
    ip_address: str
    status: str
    last_seen: datetime | None
    latest_capture: str | None = None


class CameraCaptureRequest(BaseModel):
    batch_id: str | None = None


class CameraCaptureOut(BaseModel):
    capture_id: str
    camera_id: str
    image_reference: str
    captured_at: datetime
    vvm_stage: int
    classification: str
    confidence: float


class DashboardSummary(BaseModel):
    active_locations: int
    active_sensor_devices: int
    registered_cameras: int
    monitored_batches: int
    open_alerts: int
    latest_capture_at: datetime | None
