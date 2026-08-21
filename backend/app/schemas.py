from __future__ import annotations

from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class LocationOut(BaseModel):
    id: str
    name: str
    code: str
    kind: str
    state_province: str
    district: str
    latitude: float | None
    longitude: float | None
    power_status: str
    battery_backup_hours: float
    status: str = "safe"
    active_devices: int = 0
    active_batches: int = 0

    model_config = ConfigDict(from_attributes=True)


class SensorReadingCreate(BaseModel):
    device_code: str = Field(min_length=2, max_length=64)
    device_name: str = Field(min_length=2, max_length=120)
    record_number: int | None = None
    location_id: str | None = None
    temperature: float
    humidity: float = Field(ge=0, le=100)
    vibration_rms: float | None = 1.2
    vibration_frequency_hz: float | None = 50.0
    condition: str  # NORMAL, WARNING, HOLD, FREEZE_RISK
    action: str | None = None  # CONTINUE, VERIFY, HOLD_VERIFY
    confidence: float | None = Field(default=None, ge=0, le=100)
    recorded_at: datetime | None = None
    previous_hash: str | None = None
    current_hash: str | None = None
    firmware_version: str | None = None


class SensorReadingOut(BaseModel):
    id: str
    record_number: int
    recorded_at: datetime
    temperature: float
    humidity: float
    vibration_rms: float
    condition: str
    action: str | None
    confidence: float | None
    previous_hash: str | None
    current_hash: str | None
    is_offline_synced: bool

    model_config = ConfigDict(from_attributes=True)


class OfflineSyncRequest(BaseModel):
    device_code: str
    raw_log_payload: str | None = None  # text from /condition.log
    readings: list[SensorReadingCreate] = []


class OfflineSyncResponse(BaseModel):
    success: bool
    synced_count: int
    last_record_number: int
    last_hash: str
    chain_valid: bool
    message: str


class SensorDeviceOut(BaseModel):
    id: str
    device_code: str
    name: str
    equipment_type: str
    location_name: str
    location_id: str
    status: str
    firmware_version: str | None
    last_seen: datetime | None
    battery_level: int
    power_cut_detected: bool
    offline_buffer_count: int
    latest_temperature: float | None
    latest_humidity: float | None
    latest_condition: str | None
    baseline_vibration_rms: float
    current_vibration_rms: float
    vibration_health_score: int
    compressor_drift_alert: bool

    model_config = ConfigDict(from_attributes=True)


class TelemetryPoint(BaseModel):
    timestamp: datetime
    temperature: float
    humidity: float
    vibration_rms: float
    condition: str
    upper_limit: float = 8.0
    lower_limit: float = 2.0


class BatchOut(BaseModel):
    id: str
    batch_code: str
    vaccine_name: str
    vaccine_type: str
    manufacturer: str
    location_name: str
    location_id: str
    current_status: str  # safe, warning, critical, discard
    initial_doses: int
    remaining_doses: int
    expiry_date: datetime
    thermal_stress_score: float
    viability_percent: int
    total_excursions: int
    max_excursion_delta: float
    excursion_duration_hours: float
    last_vvm_stage: int | None
    last_vvm_classification: str | None
    vvm_match_status: str
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class BatchDetailOut(BatchOut):
    last_scan_image: str | None = None
    excursion_history: list[dict] = []
    viability_curve: list[dict] = []


class BatchCreate(BaseModel):
    batch_code: str
    vaccine_name: str
    vaccine_type: str = "Type B (Heat Sensitive)"
    manufacturer: str = "Serum Institute of India"
    location_id: str
    initial_doses: int = 500
    expiry_date: datetime | None = None


class VvmScanOut(BaseModel):
    id: str
    batch_code: str | None = None
    vaccine_name: str | None = None
    location_name: str | None = None
    scanned_at: datetime
    vvm_stage: int
    classification: str
    confidence: float
    delta_e: float
    inner_rgb: str
    outer_rgb: str
    image_reference: str
    verified_against_temp: bool
    discrepancy_note: str | None

    model_config = ConfigDict(from_attributes=True)


class VvmAnalyzeRequest(BaseModel):
    batch_id: str | None = None
    image_base64: str | None = None
    simulate_stage: int | None = None  # For testing


class VvmAnalyzeResponse(BaseModel):
    scan_id: str
    vvm_stage: int
    classification: str
    confidence: float
    delta_e: float
    inner_color_hex: str
    outer_color_hex: str
    usability_verdict: str  # "USABLE", "USE FIRST", "DO NOT USE - DISCARD"
    cross_reference_status: str  # "MATCHED", "OFF_SENSOR_BREACH_ALERT", "SPIKE_LAG_ALERT"
    image_url: str
    timestamp: datetime


class PredictiveMaintenanceOut(BaseModel):
    id: str
    device_id: str
    device_name: str
    location_name: str
    component: str
    anomaly_type: str
    current_value: float
    baseline_value: float
    drift_percent: float
    estimated_ttf_days: float
    recommendation: str
    severity: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AuditRecordOut(BaseModel):
    id: str
    record_number: int
    entity_type: str
    entity_id: str
    timestamp: datetime
    temperature: float
    humidity: float
    condition: str
    previous_hash: str
    current_hash: str
    payload_summary: str
    verified: bool

    model_config = ConfigDict(from_attributes=True)


class ChainVerificationResult(BaseModel):
    is_valid: bool
    total_blocks: int
    genesis_hash: str
    latest_hash: str
    tampered_block_index: int | None = None
    verification_time_ms: float
    status_summary: str


class AlertOut(BaseModel):
    id: str
    source_type: str
    source_id: str
    severity: str
    category: str
    title: str
    message: str
    action_required: str | None
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
    resolution: str
    last_seen: datetime | None
    latest_capture: str | None = None

    model_config = ConfigDict(from_attributes=True)


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
    active_batches: int = 248
    locations_online_percent: float = 94.0
    avg_temperature: float = 2.8
    active_alerts: int = 7
    thermal_stress_percent: float = 12.0
    vvm_scans_today: int = 34
    devices_healthy_percent: float = 91.0
    compliance_score_percent: float = 98.2
    active_locations: int = 6
    active_sensor_devices: int = 8
    registered_cameras: int = 4
    monitored_batches: int = 12
    open_alerts: int = 7
    latest_capture_at: datetime | None = None

