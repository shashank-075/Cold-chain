import { Activity, Zap, Battery, Wrench, CheckCircle2 } from 'lucide-react'
import type { PredictiveMaintenanceItem, SensorDevice } from '@/types'

interface PredictiveMaintenanceCardProps {
  devices: SensorDevice[]
  events: PredictiveMaintenanceItem[]
}

export function PredictiveMaintenanceCard({ devices, events }: PredictiveMaintenanceCardProps) {
  const avgHealth = Math.round(
    devices.reduce((acc, d) => acc + d.vibration_health_score, 0) / (devices.length || 1)
  )

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border border-amber-200/80 bg-gradient-to-r from-amber-50/70 via-orange-50/40 to-white p-6 shadow-xs">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1.5 max-w-2xl">
            <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-amber-800">
              Vibration Signature FFT &bull; Early Failure Prediction
            </span>
            <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
              Predictive Compressor & Refrigeration Health
            </h2>
            <p className="text-sm text-slate-600">
              Continuously analyzing micro-vibration signatures and harmonic frequencies from refrigeration compressors, catching mechanical drift and seal degradation 4–6 days before thermal excursion occurs.
            </p>
          </div>

          <div className="flex items-center gap-4 rounded-2xl bg-white p-4 border border-amber-200/60 shadow-xs">
            <div>
              <p className="text-xs text-slate-400 font-medium">Fleet Health Index</p>
              <p className="text-2xl font-black text-slate-900">{avgHealth}%</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
              <Activity className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Fleet Vibration & Anomaly Status Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {devices.map((dev) => {
          const isDrifting = dev.compressor_drift_alert || dev.current_vibration_rms > 2.5
          return (
            <div
              key={dev.id}
              className={`rounded-2xl border p-4 shadow-xs transition-all ${
                isDrifting
                  ? 'border-amber-300 bg-amber-50/20 shadow-amber-500/5'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{dev.name}</h4>
                  <p className="text-xs text-slate-500 font-mono">{dev.device_code} &bull; {dev.location_name}</p>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    isDrifting
                      ? 'bg-amber-100 text-amber-800 border border-amber-200'
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  }`}
                >
                  {isDrifting ? 'Drift Alert' : 'Healthy'}
                </span>
              </div>

              {/* Vibration Meter */}
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Vibration Velocity (RMS)</span>
                  <span className="font-bold text-slate-900">{dev.current_vibration_rms.toFixed(2)} mm/s</span>
                </div>
                <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      dev.current_vibration_rms > 3.0
                        ? 'bg-rose-500'
                        : dev.current_vibration_rms > 2.0
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, (dev.current_vibration_rms / 5.0) * 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>Baseline: {dev.baseline_vibration_rms.toFixed(1)} mm/s</span>
                  <span>ISO 10816 Limit: 4.5 mm/s</span>
                </div>
              </div>

              {/* Power & Battery Telemetry */}
              <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1.5 text-slate-600">
                  <Zap className={`h-3.5 w-3.5 ${dev.power_cut_detected ? 'text-amber-500' : 'text-emerald-500'}`} />
                  <span>{dev.power_cut_detected ? 'Grid Outage' : 'Grid Active'}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-600">
                  <Battery className="h-3.5 w-3.5 text-blue-500" />
                  <span>Battery: {dev.battery_level}%</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Predictive Anomaly & Preventive Work Orders */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-slate-900">Active Preventive Maintenance Advisories</h3>
            <p className="text-xs text-slate-500">Auto-generated engineering alerts based on mechanical vibration drift models</p>
          </div>
          <Wrench className="h-5 w-5 text-slate-400" />
        </div>

        {events.length === 0 ? (
          <div className="flex items-center gap-2 py-4 text-xs text-slate-500">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <span>All monitored refrigeration compressors operating within ISO vibration envelopes.</span>
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((ev) => (
              <div
                key={ev.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-amber-200 bg-amber-50/40 p-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{ev.device_name}</span>
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-200">
                      {ev.component}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-amber-900">{ev.anomaly_type}</p>
                  <p className="text-xs text-slate-600 max-w-2xl">{ev.recommendation}</p>
                </div>

                <div className="text-right sm:shrink-0">
                  <p className="text-xs font-bold text-rose-700">Estimated TTF</p>
                  <p className="text-lg font-black text-slate-900">{ev.estimated_ttf_days} Days</p>
                  <span className="text-[10px] text-slate-500">Prior to cooling failure</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

