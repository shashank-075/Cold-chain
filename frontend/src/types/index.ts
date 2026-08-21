export interface DashboardSummary {
  active_batches: number
  locations_online_percent: number
  avg_temperature: number
  active_alerts: number
  thermal_stress_percent: number
  vvm_scans_today: number
  devices_healthy_percent: number
  compliance_score_percent: number
  active_locations: number
  active_sensor_devices: number
  registered_cameras: number
  monitored_batches: number
  open_alerts: number
  latest_capture_at: string | null
}

export interface LocationItem {
  id: string
  name: string
  code: string
  kind: string
  state_province: string
  district: string
  latitude: number | null
  longitude: number | null
  power_status: string
  battery_backup_hours: number
  status: string
  active_devices: number
  active_batches: number
}

export interface SensorDevice {
  id: string
  device_code: string
  name: string
  equipment_type: string
  location_name: string
  location_id: string
  status: string
  firmware_version: string | null
  last_seen: string | null
  battery_level: number
  power_cut_detected: boolean
  offline_buffer_count: number
  latest_temperature: number | null
  latest_humidity: number | null
  latest_condition: string | null
  baseline_vibration_rms: number
  current_vibration_rms: number
  vibration_health_score: number
  compressor_drift_alert: boolean
}

export interface TelemetryPoint {
  timestamp: string
  temperature: number
  humidity: number
  vibration_rms: number
  condition: string
  upper_limit: number
  lower_limit: number
}

export interface VaccineBatch {
  id: string
  batch_code: string
  vaccine_name: string
  vaccine_type: string
  manufacturer: string
  location_name: string
  location_id: string
  current_status: 'safe' | 'warning' | 'critical' | 'discard'
  initial_doses: number
  remaining_doses: number
  expiry_date: string
  thermal_stress_score: number
  viability_percent: number
  total_excursions: number
  max_excursion_delta: number
  excursion_duration_hours: number
  last_vvm_stage: number | null
  last_vvm_classification: string | null
  vvm_match_status: string
  updated_at: string
}

export interface BatchDetail extends VaccineBatch {
  last_scan_image: string | null
  excursion_history: Array<{ timestamp: string; delta_c: number; severity: string }>
  viability_curve: Array<{ day: string; viability: number; stress: number }>
}

export interface VvmScanItem {
  id: string
  batch_code: string | null
  vaccine_name: string | null
  location_name: string | null
  scanned_at: string
  vvm_stage: number
  classification: string
  confidence: number
  delta_e: number
  inner_rgb: string
  outer_rgb: string
  image_reference: string
  verified_against_temp: boolean
  discrepancy_note: string | null
}

export interface VvmAnalyzeResult {
  scan_id: string
  vvm_stage: number
  classification: string
  confidence: number
  delta_e: number
  inner_color_hex: string
  outer_color_hex: string
  usability_verdict: string
  cross_reference_status: string
  image_url: string
  timestamp: string
}

export interface PredictiveMaintenanceItem {
  id: string
  device_id: string
  device_name: string
  location_name: string
  component: string
  anomaly_type: string
  current_value: number
  baseline_value: number
  drift_percent: number
  estimated_ttf_days: number
  recommendation: string
  severity: string
  created_at: string
}

export interface AuditRecordItem {
  id: string
  record_number: number
  entity_type: string
  entity_id: string
  timestamp: string
  temperature: number
  humidity: number
  condition: string
  previous_hash: string
  current_hash: string
  payload_summary: string
  verified: boolean
}

export interface ChainVerification {
  is_valid: boolean
  total_blocks: number
  genesis_hash: string
  latest_hash: string
  tampered_block_index: number | null
  verification_time_ms: number
  status_summary: string
}

export interface AlertItem {
  id: string
  source_type: string
  source_id: string
  severity: 'safe' | 'warning' | 'critical'
  category: string
  title: string
  message: string
  action_required: string | null
  acknowledged: boolean
  created_at: string
}

export interface CameraDevice {
  id: string
  camera_code: string
  device_name: string
  location_name: string
  ip_address: string
  status: string
  resolution: string
  last_seen: string | null
  latest_capture: string | null
}

