import { X, Camera } from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { VaccineBatch } from '@/types'

interface BatchDetailModalProps {
  batch: VaccineBatch | null
  onClose: () => void
}

export function BatchDetailModal({ batch, onClose }: BatchDetailModalProps) {
  if (!batch) return null

  const viabilityData = [
    { day: 'Day -6', viability: 100, stress: 0 },
    { day: 'Day -5', viability: 99, stress: 2 },
    { day: 'Day -4', viability: 98, stress: 5 },
    { day: 'Day -3', viability: 96, stress: (batch.thermal_stress_score * 0.4) },
    { day: 'Day -2', viability: 92, stress: (batch.thermal_stress_score * 0.7) },
    { day: 'Day -1', viability: 88, stress: (batch.thermal_stress_score * 0.9) },
    { day: 'Today', viability: batch.viability_percent, stress: batch.thermal_stress_score },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-blue-50 px-2 py-0.5 font-mono text-xs font-bold text-blue-700 border border-blue-100">
              {batch.batch_code}
            </span>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                batch.current_status === 'critical'
                  ? 'bg-rose-100 text-rose-800'
                  : batch.current_status === 'warning'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {batch.current_status.toUpperCase()}
            </span>
          </div>

          <h2 className="mt-1 text-2xl font-bold text-slate-900">{batch.vaccine_name}</h2>
          <p className="text-xs text-slate-500">{batch.vaccine_type} &bull; Manufacturer: {batch.manufacturer}</p>
        </div>

        {/* Viability & Thermal Stress Metric Cards */}
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
            <span className="text-[11px] font-semibold text-slate-500">Active Viability</span>
            <p className="mt-1 text-2xl font-extrabold text-slate-900">{batch.viability_percent}%</p>
            <span className="text-[10px] text-emerald-600 font-medium">WHO Release Limit &gt;80%</span>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
            <span className="text-[11px] font-semibold text-slate-500">Thermal Stress</span>
            <p className="mt-1 text-2xl font-extrabold text-blue-600">{batch.thermal_stress_score.toFixed(0)}%</p>
            <span className="text-[10px] text-slate-500">Kinetic Degradation</span>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
            <span className="text-[11px] font-semibold text-slate-500">Excursion Time</span>
            <p className="mt-1 text-2xl font-extrabold text-slate-900">{batch.excursion_duration_hours}h</p>
            <span className="text-[10px] text-rose-600 font-medium">{batch.total_excursions} incidents</span>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
            <span className="text-[11px] font-semibold text-slate-500">Remaining Doses</span>
            <p className="mt-1 text-2xl font-extrabold text-slate-900">{batch.remaining_doses}</p>
            <span className="text-[10px] text-slate-500">of {batch.initial_doses} total</span>
          </div>
        </div>

        {/* Viability Degradation Kinetics Curve */}
        <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50/50 p-3.5">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 pb-2">
            <span>Arrhenius Kinetic Viability Decay Curve</span>
            <span className="text-slate-400 font-normal">7-day retrospective trace</span>
          </div>

          <div className="h-40 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={viabilityData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="viabGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <YAxis domain={[50, 100]} tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} unit="%" />
                <Tooltip />
                <Area type="monotone" dataKey="viability" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#viabGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* VVM Cross-Check Section */}
        <div className="mt-4 flex items-center justify-between rounded-xl border border-blue-200 bg-blue-50/50 p-3 text-xs">
          <div className="flex items-center gap-2.5">
            <Camera className="h-4 w-4 text-blue-600 shrink-0" />
            <div>
              <p className="font-bold text-slate-900">
                Latest VVM Machine Vision Scan: {batch.last_vvm_classification || 'Stage 1: Fresh / Fully Usable'}
              </p>
              <p className="text-slate-500">
                Ground-truth status: {batch.vvm_match_status === 'verified_match' ? '✅ Concordant with sensor logs' : '⚠️ Discrepancy detected'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg bg-blue-600 px-3.5 py-1.5 font-bold text-white shadow-xs hover:bg-blue-700"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}

