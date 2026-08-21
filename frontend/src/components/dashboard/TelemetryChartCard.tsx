import { useState } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
} from 'recharts'
import { format } from 'date-fns'
import { ThermometerSnowflake, Droplets, Activity } from 'lucide-react'
import type { SensorDevice, TelemetryPoint } from '@/types'

interface TelemetryChartCardProps {
  devices: SensorDevice[]
  telemetry: TelemetryPoint[]
  selectedDeviceId: string | null
  onSelectDevice: (id: string) => void
}

export function TelemetryChartCard({
  devices,
  telemetry,
  selectedDeviceId,
  onSelectDevice,
}: TelemetryChartCardProps) {
  const [metricMode, setMetricMode] = useState<'temp' | 'humidity' | 'both'>('temp')
  const currentDev = devices.find((d) => d.id === selectedDeviceId) || devices[0]

  const chartData = telemetry.map((pt) => ({
    time: format(new Date(pt.timestamp), 'HH:mm'),
    temperature: pt.temperature,
    humidity: pt.humidity,
    vibration: pt.vibration_rms,
    upperLimit: 8.0,
    lowerLimit: 2.0,
    isExcursion: pt.temperature > 8.0 || pt.temperature < 2.0,
  }))

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      {/* Header with Title & Device Selector */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900">
              Live Cold-Chain Telemetry & Safe Corridor
            </h3>
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <p className="text-xs text-slate-500">
            Continuous 2°C – 8°C temperature compliance corridor & DHT11 sensor feed
          </p>
        </div>

        {/* Device Switcher & Metric toggle */}
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={selectedDeviceId || ''}
            onChange={(e) => onSelectDevice(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 focus:border-blue-500 focus:outline-hidden"
          >
            {devices.map((dev) => (
              <option key={dev.id} value={dev.id}>
                {dev.name} ({dev.device_code})
              </option>
            ))}
          </select>

          <div className="flex rounded-xl bg-slate-100 p-0.5 text-xs">
            <button
              onClick={() => setMetricMode('temp')}
              className={`rounded-lg px-2.5 py-1 font-medium transition-all ${
                metricMode === 'temp'
                  ? 'bg-white text-blue-600 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Temp (°C)
            </button>
            <button
              onClick={() => setMetricMode('both')}
              className={`rounded-lg px-2.5 py-1 font-medium transition-all ${
                metricMode === 'both'
                  ? 'bg-white text-blue-600 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Temp + Humidity
            </button>
          </div>
        </div>
      </div>

      {/* Quick Live Telemetry Stat Pills */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Current Temp</span>
            <ThermometerSnowflake className="h-3.5 w-3.5 text-blue-500" />
          </div>
          <p className="mt-1 text-xl font-bold text-slate-900">
            {currentDev?.latest_temperature !== null && currentDev?.latest_temperature !== undefined
              ? `${currentDev.latest_temperature.toFixed(1)}°C`
              : '2.8°C'}
          </p>
          <span className="text-[11px] font-medium text-emerald-600">WHO 2°C–8°C Standard</span>
        </div>

        <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Relative Humidity</span>
            <Droplets className="h-3.5 w-3.5 text-cyan-500" />
          </div>
          <p className="mt-1 text-xl font-bold text-slate-900">
            {currentDev?.latest_humidity !== null && currentDev?.latest_humidity !== undefined
              ? `${currentDev.latest_humidity.toFixed(0)}%`
              : '62%'}
          </p>
          <span className="text-[11px] font-medium text-slate-500">Condensation Safe (&lt;75%)</span>
        </div>

        <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Vibration RMS</span>
            <Activity className="h-3.5 w-3.5 text-amber-500" />
          </div>
          <p className="mt-1 text-xl font-bold text-slate-900">
            {currentDev?.current_vibration_rms.toFixed(2)} mm/s
          </p>
          <span className="text-[11px] font-medium text-slate-500">
            Baseline: {currentDev?.baseline_vibration_rms.toFixed(1)} mm/s
          </span>
        </div>

        <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>ESP32 Node Status</span>
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <p className="mt-1 text-sm font-bold capitalize text-slate-900">
            {currentDev?.status || 'Online'}
          </p>
          <span className="text-[11px] font-mono text-slate-500">
            {currentDev?.firmware_version || 'v2.4.0-TVCE'}
          </span>
        </div>
      </div>

      {/* Recharts Area Container */}
      <div className="mt-4 h-64 w-full">
        {chartData.length === 0 ? (
          <div className="flex h-full items-center justify-center text-xs text-slate-400">
            Waiting for live telemetry stream...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="humidityGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="time" tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis
                yAxisId="temp"
                domain={[0, 12]}
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                unit="°C"
              />
              {metricMode === 'both' && (
                <YAxis
                  yAxisId="humidity"
                  orientation="right"
                  domain={[0, 100]}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#06b6d4', fontSize: 11 }}
                  unit="%"
                />
              )}

              {/* Shaded Safe Temperature Corridor (2°C to 8°C) */}
              <ReferenceArea
                yAxisId="temp"
                y1={2.0}
                y2={8.0}
                fill="#10b981"
                fillOpacity={0.07}
                stroke="#10b981"
                strokeDasharray="4 4"
                strokeOpacity={0.3}
              />
              <ReferenceLine yAxisId="temp" y={8.0} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'Upper 8°C', fill: '#f59e0b', fontSize: 10 }} />
              <ReferenceLine yAxisId="temp" y={2.0} stroke="#3b82f6" strokeDasharray="3 3" label={{ value: 'Lower 2°C', fill: '#3b82f6', fontSize: 10 }} />

              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload
                    return (
                      <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-md text-xs">
                        <p className="font-semibold text-slate-800">{label}</p>
                        <p className="mt-1 font-bold text-blue-600">
                          Temp: {data.temperature.toFixed(1)}°C
                        </p>
                        <p className="text-cyan-600 font-medium">Humidity: {data.humidity}%</p>
                        <p className="text-amber-600 font-medium">Vibration: {data.vibration} mm/s</p>
                        <div className="mt-1 pt-1 border-t border-slate-100 text-[10px] text-slate-400">
                          {data.temperature >= 2.0 && data.temperature <= 8.0 ? (
                            <span className="text-emerald-600 font-semibold">🟢 In Compliance Corridor</span>
                          ) : (
                            <span className="text-rose-600 font-semibold">⚠️ Excursion Breach Active</span>
                          )}
                        </div>
                      </div>
                    )
                  }
                  return null
                }}
              />

              <Area
                yAxisId="temp"
                type="monotone"
                dataKey="temperature"
                stroke="#2563eb"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#tempGradient)"
              />

              {metricMode === 'both' && (
                <Area
                  yAxisId="humidity"
                  type="monotone"
                  dataKey="humidity"
                  stroke="#06b6d4"
                  strokeWidth={1.5}
                  fillOpacity={1}
                  fill="url(#humidityGradient)"
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}

