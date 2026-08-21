import {
  Boxes,
  MapPin,
  ThermometerSnowflake,
  Bell,
  Flame,
  Camera,
  Cpu,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
} from 'lucide-react'
import type { DashboardSummary } from '@/types'

interface TopMetricsRowProps {
  summary: DashboardSummary | null | undefined
}

export function TopMetricsRow({ summary }: TopMetricsRowProps) {
  const metrics = [
    {
      id: 'batches',
      label: 'Active Batches',
      value: summary?.active_batches ?? 248,
      status: 'safe' as const,
      trend: '+3.2%',
      trendUp: true,
      icon: Boxes,
    },
    {
      id: 'locations',
      label: 'Locations Online',
      value: `${summary?.locations_online_percent ?? 94}%`,
      status: 'safe' as const,
      trend: '+1.1%',
      trendUp: true,
      icon: MapPin,
    },
    {
      id: 'temperature',
      label: 'Avg Temperature',
      value: `${summary?.avg_temperature ?? 2.8}°C`,
      status: 'safe' as const,
      trend: null,
      trendUp: true,
      icon: ThermometerSnowflake,
    },
    {
      id: 'alerts',
      label: 'Active Alerts',
      value: summary?.active_alerts ?? 7,
      status: 'warning' as const,
      trend: '-12%',
      trendUp: false,
      icon: Bell,
    },
    {
      id: 'thermal_stress',
      label: 'Thermal Stress',
      value: `${summary?.thermal_stress_percent ?? 12}%`,
      status: (summary?.thermal_stress_percent ?? 12) > 30 ? ('warning' as const) : ('safe' as const),
      trend: null,
      trendUp: false,
      icon: Flame,
    },
    {
      id: 'vvm_scans',
      label: 'VVM Scans Today',
      value: summary?.vvm_scans_today ?? 34,
      status: 'safe' as const,
      trend: '+8%',
      trendUp: true,
      icon: Camera,
    },
    {
      id: 'devices',
      label: 'Devices Healthy',
      value: `${summary?.devices_healthy_percent ?? 91}%`,
      status: 'warning' as const,
      trend: '-2.4%',
      trendUp: false,
      icon: Cpu,
    },
    {
      id: 'compliance',
      label: 'Compliance Score',
      value: `${summary?.compliance_score_percent ?? 98.2}%`,
      status: 'safe' as const,
      trend: null,
      trendUp: true,
      icon: ShieldCheck,
    },
  ]

  return (
    <section className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
      {metrics.map(({ id, label, value, status, trend, trendUp, icon: Icon }) => (
        <div
          key={id}
          className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-xs hover:border-slate-300 hover:shadow-sm transition-all"
        >
          {/* Header with Title and Icon */}
          <div className="flex items-start justify-between gap-1 text-slate-500">
            <span className="text-[12px] font-semibold leading-tight text-slate-600 line-clamp-2">
              {label}
            </span>
            <Icon className="h-3.5 w-3.5 shrink-0 text-slate-400" />
          </div>

          {/* Value and Status Pill */}
          <div className="mt-3 flex items-baseline gap-1.5 flex-wrap">
            <span className="text-xl font-bold tracking-tight text-slate-900">
              {value}
            </span>

            {status === 'safe' ? (
              <span className="inline-flex items-center rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-1 inline-block" />
                Safe
              </span>
            ) : status === 'warning' ? (
              <span className="inline-flex items-center rounded-full bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 border border-amber-200">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500 mr-1 inline-block" />
                Warning
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full bg-rose-50 px-1.5 py-0.5 text-[10px] font-semibold text-rose-700 border border-rose-200">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500 mr-1 inline-block" />
                Critical
              </span>
            )}
          </div>

          {/* Trend line */}
          <div className="mt-1.5 flex items-center gap-1 text-[11px] text-slate-400">
            {trend ? (
              <div
                className={`flex items-center gap-0.5 font-medium ${
                  trendUp ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {trendUp ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                <span>{trend}</span>
              </div>
            ) : (
              <span className="text-slate-400 text-[10px]">Optimal target</span>
            )}
          </div>
        </div>
      ))}
    </section>
  )
}

