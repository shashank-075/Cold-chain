export interface DashboardSummary {
  active_locations: number
  active_sensor_devices: number
  registered_cameras: number
  monitored_batches: number
  open_alerts: number
  latest_capture_at: string | null
}

export interface SensorDevice {
  id: string
  device_code: string
  name: string
  location_name: string
  status: string
  firmware_version: string | null
  last_seen: string | null
  latest_temperature: number | null
  latest_humidity: number | null
  latest_condition: string | null
}

export interface VaccineBatch {
  id: string
  batch_code: string
  vaccine_name: string
  location_name: string
  current_status: string
  thermal_stress_score: number
  viability_percent: number
  last_vvm_stage: number | null
  last_vvm_classification: string | null
  updated_at: string
}

export interface AlertItem {
  id: string
  severity: string
  category: string
  title: string
  message: string
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
  last_seen: string | null
  latest_capture: string | null
}
