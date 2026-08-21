import { useState } from 'react'
import { Camera, ShieldCheck, Sparkles, CheckCircle2, RefreshCw } from 'lucide-react'
import type { CameraDevice, VaccineBatch, VvmScanItem } from '@/types'
import { useAnalyzeVvm } from '@/hooks/useDashboardData'

interface VvmMachineVisionLabProps {
  cameras: CameraDevice[]
  batches: VaccineBatch[]
  recentScans?: VvmScanItem[]
}

export function VvmMachineVisionLab({ cameras, batches, recentScans = [] }: VvmMachineVisionLabProps) {
  const [selectedBatchId, setSelectedBatchId] = useState<string>(batches[0]?.id || '')
  const selectedStageSim = 1
  const [latestAnalysis, setLatestAnalysis] = useState<{
    stage: number
    classification: string
    confidence: number
    delta_e: number
    inner_color: string
    outer_color: string
    verdict: string
    cross_reference: string
    image_url: string
  } | null>(null)

  const analyzeMutation = useAnalyzeVvm()

  const handleRunAnalysis = (stageToSim: number) => {
    analyzeMutation.mutate(
      {
        batch_id: selectedBatchId || undefined,
        simulate_stage: stageToSim,
      },
      {
        onSuccess: (data) => {
          setLatestAnalysis({
            stage: data.vvm_stage,
            classification: data.classification,
            confidence: data.confidence,
            delta_e: data.delta_e,
            inner_color: data.inner_color_hex,
            outer_color: data.outer_color_hex,
            verdict: data.usability_verdict,
            cross_reference: data.cross_reference_status,
            image_url: data.image_url,
          })
        },
      }
    )
  }

  const selectedBatch = batches.find((b) => b.id === selectedBatchId)

  return (
    <div className="space-y-6">
      {/* Top Banner: WHO VVM Standard Explanation */}
      <div className="rounded-2xl border border-blue-200/80 bg-gradient-to-r from-blue-50 via-indigo-50/50 to-white p-6 shadow-xs">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1.5 max-w-2xl">
            <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-blue-800">
              WHO PQS Quality Standard &bull; Computer Vision
            </span>
            <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
              Automated Vaccine Vial Monitor (VVM) Machine Vision Lab
            </h2>
            <p className="text-sm text-slate-600">
              Digitizing physical thermo-chemical VVM indicators on vial labels using camera capture & colorimetric pattern classification, providing ground-truth verification against sensor logs.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleRunAnalysis(1)}
              disabled={analyzeMutation.isPending}
              className="rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 active:scale-95 transition-all"
            >
              Test Stage 1 (Fresh)
            </button>
            <button
              onClick={() => handleRunAnalysis(2)}
              disabled={analyzeMutation.isPending}
              className="rounded-xl bg-amber-500 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-amber-600 active:scale-95 transition-all"
            >
              Test Stage 2 (Use First)
            </button>
            <button
              onClick={() => handleRunAnalysis(3)}
              disabled={analyzeMutation.isPending}
              className="rounded-xl bg-rose-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-rose-700 active:scale-95 transition-all"
            >
              Test Stage 3 (Discard)
            </button>
          </div>
        </div>
      </div>

      {/* 4-Stage Reference Gallery */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            stage: 1,
            title: 'Stage 1: Fresh / Normal',
            verdict: 'USABLE',
            desc: 'Inner square is lighter than outer circle. No significant cumulative heat exposure.',
            innerColor: '#FFFFFF',
            outerColor: '#475569',
            badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          },
          {
            stage: 2,
            title: 'Stage 2: Early Heat Exposure',
            verdict: 'USE FIRST',
            desc: 'Inner square still lighter than circle, but darkened slightly. Prioritize in FEFO queue.',
            innerColor: '#CBD5E1',
            outerColor: '#475569',
            badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
          },
          {
            stage: 3,
            title: 'Stage 3: Endpoint Reached',
            verdict: 'DO NOT USE',
            desc: 'Inner square matches the color of outer circle. Vaccine viability exhausted.',
            innerColor: '#475569',
            outerColor: '#475569',
            badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
          },
          {
            stage: 4,
            title: 'Stage 4: Beyond Discard',
            verdict: 'DISCARD IMMEDIATELY',
            desc: 'Inner square is darker than outer circle. Severe cumulative heat damage.',
            innerColor: '#1E293B',
            outerColor: '#475569',
            badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
          },
        ].map((item) => (
          <div
            key={item.stage}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">{item.title}</span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold border ${item.badgeClass}`}>
                  {item.verdict}
                </span>
              </div>

              {/* Graphic VVM representation */}
              <div className="my-4 flex items-center justify-center">
                <div
                  className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-slate-800 shadow-inner transition-transform hover:scale-105"
                  style={{ backgroundColor: item.outerColor }}
                >
                  <div
                    className="h-9 w-9 rounded-sm border border-slate-900/60 shadow-xs"
                    style={{ backgroundColor: item.innerColor }}
                  />
                </div>
              </div>

              <p className="text-xs text-slate-500">{item.desc}</p>
            </div>

            <button
              onClick={() => handleRunAnalysis(item.stage)}
              className="mt-3 w-full rounded-xl border border-slate-200 bg-slate-50 py-1.5 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-all"
            >
              Analyze Sample
            </button>
          </div>
        ))}
      </div>

      {/* Live AI Analyzer and Ground-Truth Matrix */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left: Interactive Capture & Target Selection */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900">ESP32-CAM Ingestion & Batch Linking</h3>
              <p className="text-xs text-slate-500">
                Trigger image fetch from remote camera node or select target vaccine lot
              </p>
            </div>
            <Camera className="h-5 w-5 text-blue-600" />
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="font-semibold text-slate-700">Target Vaccine Batch</label>
              <select
                value={selectedBatchId}
                onChange={(e) => setSelectedBatchId(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 focus:border-blue-500 focus:outline-hidden"
              >
                {batches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.vaccine_name} ({b.batch_code}) — Stress: {b.thermal_stress_score}% | Viab: {b.viability_percent}%
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {cameras.map((cam) => (
                <div
                  key={cam.id}
                  className="rounded-xl border border-slate-200/90 bg-slate-50/70 p-3 space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{cam.camera_code}</span>
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  </div>
                  <p className="text-[11px] text-slate-500 truncate">{cam.device_name}</p>
                  <p className="text-[10px] font-mono text-slate-400">{cam.ip_address}/capture</p>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <button
                onClick={() => handleRunAnalysis(selectedStageSim)}
                disabled={analyzeMutation.isPending}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-xs font-bold text-white shadow-sm hover:bg-blue-700 active:scale-98 transition-all"
              >
                {analyzeMutation.isPending ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Processing Computer Vision Model...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Run Machine Vision VVM Classification</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right: AI Result & Ground Truth Cross-Referencing */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900">Computer Vision Analysis Result</h3>
                <p className="text-xs text-slate-500">Colorimetric Delta-E measurement & cross-validation</p>
              </div>
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
            </div>

            {latestAnalysis ? (
              <div className="mt-4 space-y-4">
                {/* Result Card Top */}
                <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4 border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-slate-800"
                      style={{ backgroundColor: latestAnalysis.outer_color }}
                    >
                      <div
                        className="h-6 w-6 rounded-xs border border-slate-900/50"
                        style={{ backgroundColor: latestAnalysis.inner_color }}
                      />
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">
                        {latestAnalysis.classification}
                      </h4>
                      <p className="text-xs text-slate-500">
                        Confidence: {(latestAnalysis.confidence * 100).toFixed(0)}% &bull; &Delta;E: {latestAnalysis.delta_e}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      latestAnalysis.stage <= 2
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {latestAnalysis.verdict}
                  </span>
                </div>

                {/* Ground-Truth Cross Referencing Matrix (As described in Goal) */}
                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-2 text-xs">
                  <div className="flex items-center justify-between font-bold text-slate-800">
                    <span>Ground-Truth Cross-Check Matrix</span>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        latestAnalysis.cross_reference === 'MATCHED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      <CheckCircle2 className="h-3 w-3" />
                      {latestAnalysis.cross_reference}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-slate-600">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Sensor Thermal Stress:</span>
                      <span className="font-semibold text-slate-800">
                        {selectedBatch?.thermal_stress_score || 18}% (Score)
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">VVM Visual State:</span>
                      <span className="font-semibold text-slate-800">
                        Stage {latestAnalysis.stage} ({latestAnalysis.verdict})
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-600 pt-1 border-t border-slate-200">
                    {latestAnalysis.cross_reference === 'MATCHED'
                      ? '✅ Full concordance between IoT sensor thermal exposure curve and physical WHO VVM indicator.'
                      : '⚠️ Discrepancy logged: Visual indicator and temperature logs differ. Initiating automated quality quarantine alert.'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="my-8 flex flex-col items-center justify-center text-center text-xs text-slate-400 space-y-2">
                <Camera className="h-8 w-8 text-slate-300 animate-bounce" />
                <p>Select a test stage or trigger an ESP32-CAM frame to view live machine vision colorimetry.</p>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Historical VVM Scans Table */}
      {recentScans.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900">Recent Machine Vision VVM Inspection Log</h3>
              <p className="text-xs text-slate-500">Automated optical readings captured from field ESP32-CAM nodes</p>
            </div>
            <span className="text-xs font-mono text-slate-400">{recentScans.length} Scans Logged</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 bg-slate-50 text-[11px] font-bold uppercase text-slate-500">
                <tr>
                  <th className="py-2 px-3">Timestamp</th>
                  <th className="py-2 px-3">Batch Code</th>
                  <th className="py-2 px-3">WHO Stage</th>
                  <th className="py-2 px-3">Classification</th>
                  <th className="py-2 px-3">Confidence</th>
                  <th className="py-2 px-3">&Delta;E</th>
                  <th className="py-2 px-3">Ground-Truth Check</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {recentScans.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="py-2 px-3 text-slate-600 font-sans">
                      {new Date(s.scanned_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-2 px-3 font-bold text-blue-600">{s.batch_code || 'LOT-SYS'}</td>
                    <td className="py-2 px-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold font-sans ${
                        s.vvm_stage <= 2 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                      }`}>
                        Stage {s.vvm_stage}
                      </span>
                    </td>
                    <td className="py-2 px-3 font-sans text-slate-800">{s.classification}</td>
                    <td className="py-2 px-3 text-slate-600">{(s.confidence * 100).toFixed(0)}%</td>
                    <td className="py-2 px-3 text-slate-600">{s.delta_e.toFixed(1)}</td>
                    <td className="py-2 px-3 font-sans">
                      <span className={`inline-flex items-center gap-1 font-semibold text-[11px] ${
                        s.verified_against_temp ? 'text-emerald-600' : 'text-amber-600'
                      }`}>
                        <CheckCircle2 className="h-3 w-3" />
                        {s.verified_against_temp ? 'Verified' : 'Discrepancy'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

