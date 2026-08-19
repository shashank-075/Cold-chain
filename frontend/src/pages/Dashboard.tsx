import { formatDistanceToNow } from 'date-fns'
import { AlertTriangle, Camera, Database, ShieldCheck, ThermometerSnowflake } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  useAlerts,
  useBatches,
  useCameras,
  useDashboardSummary,
  useDevices,
} from '@/hooks/useDashboardData'

function statusTone(status: string) {
  const normalized = status.toLowerCase()
  if (['critical', 'freeze_risk', 'hold'].includes(normalized)) {
    return 'destructive' as const
  }
  if (['warning', 'registered', 'monitor'].includes(normalized)) {
    return 'secondary' as const
  }
  return 'default' as const
}

function prettyDate(value: string | null) {
  if (!value) return 'No activity yet'
  return formatDistanceToNow(new Date(value), { addSuffix: true })
}

export function Dashboard() {
  const { data: summary } = useDashboardSummary()
  const { data: devices = [] } = useDevices()
  const { data: batches = [] } = useBatches()
  const { data: alerts = [] } = useAlerts()
  const { data: cameras = [] } = useCameras()

  const metrics = [
    {
      label: 'Sensor devices',
      value: summary?.active_sensor_devices ?? 0,
      icon: ThermometerSnowflake,
      note: 'Raw temperature and humidity ingestion',
    },
    {
      label: 'Registered cameras',
      value: summary?.registered_cameras ?? 0,
      icon: Camera,
      note: 'Independent VVM capture pipeline',
    },
    {
      label: 'Tracked batches',
      value: summary?.monitored_batches ?? 0,
      icon: Database,
      note: 'Thermal stress linked to batch records',
    },
    {
      label: 'Open alerts',
      value: summary?.open_alerts ?? 0,
      icon: AlertTriangle,
      note: 'Latest issues needing action',
    },
  ]

  return (
    <div className="min-h-screen bg-stone-950 text-stone-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-[2rem] border border-amber-300/20 bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.3),_transparent_35%),linear-gradient(135deg,_rgba(28,25,23,1),_rgba(12,10,9,1))] p-8 shadow-2xl shadow-amber-500/10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl space-y-4">
              <Badge className="bg-amber-300 text-stone-950 hover:bg-amber-300">
                Cold-chain backend aligned to the new ESP32 + ESP32-CAM plan
              </Badge>
              <div>
                <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                  Sensor ingestion and camera capture now live as separate backend flows.
                </h1>
                <p className="mt-3 max-w-2xl text-base text-stone-300 sm:text-lg">
                  The dashboard is intentionally lean now: it focuses on real device data,
                  batch risk, camera status, and alerts instead of placeholder modules.
                </p>
              </div>
            </div>

            <Card className="w-full max-w-sm border-amber-300/20 bg-stone-900/70 backdrop-blur">
              <CardHeader>
                <CardDescription className="text-stone-400">Latest capture sync</CardDescription>
                <CardTitle className="text-3xl text-stone-50">
                  {prettyDate(summary?.latest_capture_at ?? null)}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-stone-300">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  Batch risk and VVM results remain linked, but the camera device stays independent.
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {metrics.map(({ label, value, icon: Icon, note }) => (
            <Card key={label} className="border-stone-800 bg-stone-900">
              <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div>
                  <CardDescription className="text-stone-400">{label}</CardDescription>
                  <CardTitle className="mt-2 text-3xl text-stone-50">{value}</CardTitle>
                </div>
                <div className="rounded-full bg-amber-300/10 p-3 text-amber-300">
                  <Icon className="h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent className="text-sm text-stone-400">{note}</CardContent>
            </Card>
          ))}
        </section>

        <section className="mt-8 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
          <Card className="border-stone-800 bg-stone-900">
            <CardHeader>
              <CardTitle className="text-stone-50">Sensor devices</CardTitle>
              <CardDescription className="text-stone-400">
                These are the devices hitting `POST /api/v1/sensor/readings`.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {devices.map((device) => (
                <div
                  key={device.id}
                  className="grid gap-3 rounded-2xl border border-stone-800 bg-stone-950/70 p-4 md:grid-cols-[1.5fr_repeat(4,minmax(0,1fr))]"
                >
                  <div>
                    <p className="text-sm text-stone-400">{device.device_code}</p>
                    <p className="text-lg font-medium text-stone-50">{device.name}</p>
                    <p className="text-sm text-stone-500">{device.location_name}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Status</p>
                    <Badge variant={statusTone(device.status)}>{device.status}</Badge>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Temperature</p>
                    <p className="text-lg text-stone-50">
                      {device.latest_temperature !== null ? `${device.latest_temperature.toFixed(1)}C` : '--'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Humidity</p>
                    <p className="text-lg text-stone-50">
                      {device.latest_humidity !== null ? `${device.latest_humidity.toFixed(0)}%` : '--'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Condition</p>
                    <p className="text-lg text-stone-50">{device.latest_condition ?? '--'}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-stone-800 bg-stone-900">
            <CardHeader>
              <CardTitle className="text-stone-50">Camera devices</CardTitle>
              <CardDescription className="text-stone-400">
                Independent registration and capture status for ESP32-CAM units.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {cameras.map((camera) => (
                <div key={camera.id} className="rounded-2xl border border-stone-800 bg-stone-950/70 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm text-stone-400">{camera.camera_code}</p>
                      <p className="text-lg font-medium text-stone-50">{camera.device_name}</p>
                    </div>
                    <Badge variant={statusTone(camera.status)}>{camera.status}</Badge>
                  </div>
                  <p className="mt-3 text-sm text-stone-400">{camera.location_name}</p>
                  <p className="text-sm text-stone-500">Capture source: {camera.ip_address}/capture</p>
                  <p className="mt-3 text-sm text-stone-300">
                    Last seen {prettyDate(camera.last_seen)}
                  </p>
                  <p className="text-sm text-stone-300">
                    Latest file: {camera.latest_capture ?? 'No captures stored yet'}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <Card className="border-stone-800 bg-stone-900">
            <CardHeader>
              <CardTitle className="text-stone-50">Vaccine batches</CardTitle>
              <CardDescription className="text-stone-400">
                Thermal stress is tracked per batch and ready to be cross-checked against VVM scans.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {batches.map((batch) => (
                <div key={batch.id} className="rounded-2xl border border-stone-800 bg-stone-950/70 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-sm text-stone-400">{batch.batch_code}</p>
                      <p className="text-lg font-medium text-stone-50">{batch.vaccine_name}</p>
                      <p className="text-sm text-stone-500">{batch.location_name}</p>
                    </div>
                    <Badge variant={statusTone(batch.current_status)}>{batch.current_status}</Badge>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Thermal stress</p>
                      <p className="text-2xl text-stone-50">{batch.thermal_stress_score.toFixed(0)}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Viability</p>
                      <p className="text-2xl text-stone-50">{batch.viability_percent}%</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Last VVM</p>
                      <p className="text-lg text-stone-50">
                        {batch.last_vvm_stage ? `Stage ${batch.last_vvm_stage}` : 'Pending'}
                      </p>
                      <p className="text-sm text-stone-400">{batch.last_vvm_classification ?? 'No scan yet'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-stone-800 bg-stone-900">
            <CardHeader>
              <CardTitle className="text-stone-50">Recent alerts</CardTitle>
              <CardDescription className="text-stone-400">
                Only the signals that the current backend actually generates are shown here.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {alerts.map((alert) => (
                <div key={alert.id} className="rounded-2xl border border-stone-800 bg-stone-950/70 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-lg font-medium text-stone-50">{alert.title}</p>
                      <p className="text-sm text-stone-500">{alert.category}</p>
                    </div>
                    <Badge variant={statusTone(alert.severity)}>{alert.severity}</Badge>
                  </div>
                  <p className="mt-3 text-sm text-stone-300">{alert.message}</p>
                  <p className="mt-3 text-xs uppercase tracking-[0.2em] text-stone-500">
                    {prettyDate(alert.created_at)}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}
