import { ChevronRight, Info } from 'lucide-react'
import type { VaccineBatch } from '@/types'

interface ThermalStressListProps {
  batches: VaccineBatch[]
  onSelectBatch?: (batch: VaccineBatch) => void
}

export function ThermalStressList({ batches, onSelectBatch }: ThermalStressListProps) {
  const atRiskCount = batches.filter((b) => b.current_status === 'critical' || b.thermal_stress_score > 60).length

  return (
    <div className="flex h-full flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      {/* Header matching the screenshot */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
        <div>
          <h3 className="text-lg font-bold tracking-tight text-slate-900">
            Thermal Stress Monitoring
          </h3>
          <p className="text-xs text-slate-500">
            Kinetic Arrhenius viability degradation modeling per vaccine lot
          </p>
        </div>

        <span className="inline-flex items-center rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 border border-rose-200">
          {atRiskCount} at risk
        </span>
      </div>

      {/* Batches list */}
      <div className="mt-4 flex-1 space-y-4 overflow-y-auto pr-1 max-h-[460px]">
        {batches.map((batch) => {
          const isCritical = batch.current_status === 'critical' || batch.thermal_stress_score >= 60
          const isWarning = batch.current_status === 'warning' || (batch.thermal_stress_score >= 30 && !isCritical)

          return (
            <div
              key={batch.id}
              onClick={() => onSelectBatch && onSelectBatch(batch)}
              className="group cursor-pointer rounded-xl border border-slate-100 p-3 hover:border-slate-300 hover:bg-slate-50/70 transition-all"
            >
              {/* Row Top: Name, Status Badge, Percentage & Excursions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {batch.vaccine_name}
                  </span>

                  {isCritical ? (
                    <span className="inline-flex items-center rounded-full bg-rose-500 px-2 py-0.5 text-[11px] font-bold text-white shadow-2xs">
                      Critical
                    </span>
                  ) : isWarning ? (
                    <span className="inline-flex items-center rounded-full bg-amber-500 px-2 py-0.5 text-[11px] font-bold text-white shadow-2xs">
                      Warning
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-emerald-500 px-2 py-0.5 text-[11px] font-bold text-white shadow-2xs">
                      Safe
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs font-semibold">
                  {batch.total_excursions > 0 && (
                    <span className="text-rose-600 font-medium">
                      {batch.total_excursions} {batch.total_excursions === 1 ? 'excursion' : 'excursions'}
                    </span>
                  )}
                  <span className="text-slate-900 font-bold">{batch.thermal_stress_score.toFixed(0)}%</span>
                </div>
              </div>

              {/* Progress Bar (Dual-tone or Segmented style matching photo) */}
              <div className="mt-2.5 relative h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                {/* Visual dual bar representation */}
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    isCritical
                      ? 'bg-gradient-to-r from-blue-600 via-amber-500 to-rose-600'
                      : isWarning
                      ? 'bg-gradient-to-r from-blue-600 to-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.max(6, batch.thermal_stress_score)}%` }}
                />
              </div>

              {/* Excursion subtext and Viability */}
              <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                <span>
                  {batch.max_excursion_delta > 0
                    ? `Max excursion: ${batch.max_excursion_delta}°C above • Viability: ${batch.viability_percent}%`
                    : `Normal storage • Viability: ${batch.viability_percent}%`}
                </span>
                <span className="font-mono text-slate-400 text-[11px]">
                  {batch.excursion_duration_hours}h
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Card footer tip */}
      <div className="mt-4 flex items-center justify-between rounded-xl bg-blue-50/70 p-2.5 text-xs text-blue-900 border border-blue-100">
        <div className="flex items-center gap-1.5">
          <Info className="h-4 w-4 shrink-0 text-blue-600" />
          <span>Click any vaccine batch to inspect kinetic decay curves & VVM photos</span>
        </div>
        <ChevronRight className="h-4 w-4 text-blue-400" />
      </div>
    </div>
  )
}

