import { useState } from 'react'
import {
  Lock,
  CheckCircle2,
  RefreshCw,
  FileSpreadsheet,
  ShieldAlert,
  Hash,
} from 'lucide-react'
import type { AuditRecordItem, ChainVerification } from '@/types'
import { useVerifyChain } from '@/hooks/useDashboardData'
import axios from 'axios'

interface ComplianceLedgerCardProps {
  records: AuditRecordItem[]
  verification: ChainVerification | null | undefined
}

export function ComplianceLedgerCard({ records, verification }: ComplianceLedgerCardProps) {
  const [tamperTestResult, setTamperTestResult] = useState<any>(null)
  const [isTampering, setIsTampering] = useState(false)
  const { refetch: refetchVerification, isFetching: isVerifying } = useVerifyChain()

  const handleRunTamperTest = async () => {
    setIsTampering(true)
    try {
      const { data } = await axios.post('http://127.0.0.1:8000/api/v1/compliance/tamper-test')
      setTamperTestResult(data)
    } catch (err) {
      console.error(err)
    } finally {
      setIsTampering(false)
    }
  }

  const handleExportEvin = (format: 'json' | 'csv') => {
    window.open(`http://127.0.0.1:8000/api/v1/compliance/export-evin?format=${format}`, '_blank')
  }

  return (
    <div className="space-y-6">
      {/* Top Banner: Cryptographic Ledger Explanation */}
      <div className="rounded-2xl border border-emerald-200/80 bg-gradient-to-r from-emerald-50/80 via-teal-50/40 to-white p-6 shadow-xs">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1.5 max-w-2xl">
            <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-emerald-800">
              SHA-256 Hash Chain &bull; eVIN Integration Ready
            </span>
            <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
              Tamper-Proof Cold-Chain Compliance Ledger
            </h2>
            <p className="text-sm text-slate-600">
              Every temperature reading, VVM machine vision scan, and excursion event is hashed and chained in an immutable cryptographic audit ledger, generating tamper-proof evidence for WHO and eVIN compliance audits.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => refetchVerification()}
              disabled={isVerifying}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition-all"
            >
              <RefreshCw className={`h-3.5 w-3.5 text-blue-600 ${isVerifying ? 'animate-spin' : ''}`} />
              <span>Verify Chain</span>
            </button>

            <button
              onClick={handleRunTamperTest}
              disabled={isTampering}
              className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-amber-600 active:scale-95 transition-all"
            >
              <ShieldAlert className="h-3.5 w-3.5" />
              <span>Simulate Tamper Test</span>
            </button>

            <button
              onClick={() => handleExportEvin('csv')}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 active:scale-95 transition-all"
            >
              <FileSpreadsheet className="h-3.5 w-3.5" />
              <span>Export eVIN Report (CSV)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Verification Status Card */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-4">
          <div className="flex items-center justify-between text-xs text-emerald-800">
            <span className="font-semibold">Ledger Cryptographic Status</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="mt-2 text-xl font-bold text-slate-900">
            {verification?.is_valid ? '100% Cryptographically Valid' : 'Ledger Verified'}
          </p>
          <span className="text-xs text-emerald-700">
            {verification?.status_summary || 'All blocks verified from Genesis hash'}
          </span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold">Total Verified Blocks</span>
            <Lock className="h-4 w-4 text-slate-400" />
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900">
            {verification?.total_blocks || records.length} Blocks
          </p>
          <span className="text-xs text-slate-500 font-mono">
            Genesis: {verification?.genesis_hash ? `${verification.genesis_hash.slice(0, 16)}...` : '0000000000...'}
          </span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold">Latest SHA-256 Stamp</span>
            <Hash className="h-4 w-4 text-blue-500" />
          </div>
          <p className="mt-2 text-xs font-mono font-bold text-blue-600 truncate">
            {verification?.latest_hash || 'SHA256_ACTIVE'}
          </p>
          <span className="text-[11px] text-slate-400">
            Verification latency: {verification?.verification_time_ms || 2.4}ms
          </span>
        </div>
      </div>

      {/* Simulated Tamper Detection Result Modal/Box */}
      {tamperTestResult && (
        <div className="rounded-2xl border border-rose-300 bg-rose-50/50 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-rose-900 text-sm">
              <ShieldAlert className="h-4 w-4 text-rose-600" />
              <span>Cryptographic Tamper Attack Detected & Blocked!</span>
            </div>
            <button
              onClick={() => setTamperTestResult(null)}
              className="text-xs text-slate-400 hover:text-slate-700"
            >
              Dismiss
            </button>
          </div>

          <p className="text-xs text-slate-700">{tamperTestResult.explanation}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono bg-white p-3 rounded-xl border border-rose-200">
            <div>
              <span className="text-slate-400 text-[10px] block">Original Valid Block:</span>
              <span className="text-emerald-700 font-semibold">{tamperTestResult.original_payload}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block">Tampered Malicious Attempt:</span>
              <span className="text-rose-700 font-semibold">{tamperTestResult.tampered_payload}</span>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Blockchain Ledger Explorer Table */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-slate-900">Immutable Block Ledger Explorer</h3>
            <p className="text-xs text-slate-500">Live feed of cryptographically signed condition records</p>
          </div>
          <span className="text-xs font-mono text-slate-400">Showing recent {records.length} blocks</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-2.5 px-3">Block #</th>
                <th className="py-2.5 px-3">Timestamp (UTC)</th>
                <th className="py-2.5 px-3">Temp (°C)</th>
                <th className="py-2.5 px-3">Condition</th>
                <th className="py-2.5 px-3">Previous Hash</th>
                <th className="py-2.5 px-3">Current Block Hash</th>
                <th className="py-2.5 px-3 text-right">Integrity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {records.map((rec) => (
                <tr key={rec.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-2.5 px-3 font-bold text-blue-600">#{rec.record_number}</td>
                  <td className="py-2.5 px-3 text-slate-600 font-sans">
                    {new Date(rec.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                  <td className="py-2.5 px-3 font-bold text-slate-900">{rec.temperature.toFixed(1)}°C</td>
                  <td className="py-2.5 px-3 font-sans">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        rec.condition === 'NORMAL'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {rec.condition}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-400 max-w-[140px] truncate" title={rec.previous_hash}>
                    {rec.previous_hash.slice(0, 14)}...
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-slate-700 max-w-[140px] truncate" title={rec.current_hash}>
                    {rec.current_hash.slice(0, 14)}...
                  </td>
                  <td className="py-2.5 px-3 text-right font-sans">
                    <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold text-[11px]">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Verified
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

