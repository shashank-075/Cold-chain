import { useState, useMemo } from 'react'
import {
  CheckCircle2,
  Radio,
} from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Sidebar, type NavTab } from '@/components/layout/Sidebar'
import { TopMetricsRow } from '@/components/dashboard/TopMetricsRow'
import { ColdChainMap } from '@/components/dashboard/ColdChainMap'
import { ThermalStressList } from '@/components/dashboard/ThermalStressList'
import { TelemetryChartCard } from '@/components/dashboard/TelemetryChartCard'
import { VvmMachineVisionLab } from '@/components/dashboard/VvmMachineVisionLab'
import { PredictiveMaintenanceCard } from '@/components/dashboard/PredictiveMaintenanceCard'
import { ComplianceLedgerCard } from '@/components/dashboard/ComplianceLedgerCard'
import { BatchDetailModal } from '@/components/dashboard/BatchDetailModal'
import {
  useAlerts,
  useBatches,
  useCameras,
  useComplianceLedger,
  useDashboardSummary,
  useDevices,
  useDeviceTelemetry,
  useLocations,
  usePredictiveMaintenance,
  useSimulateTick,
  useVerifyChain,
  useVvmScans,
  useAcknowledgeAlert,
} from '@/hooks/useDashboardData'
import type { VaccineBatch } from '@/types'

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null)
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null)
  const [activeBatchModal, setActiveBatchModal] = useState<VaccineBatch | null>(null)
  const [batchStatusFilter, setBatchStatusFilter] = useState<'all' | 'safe' | 'warning' | 'critical'>('all')

  // API Queries
  const { data: summary } = useDashboardSummary()
  const { data: locations = [] } = useLocations()
  const { data: devices = [] } = useDevices()
  const { data: batches = [] } = useBatches()
  const { data: alerts = [] } = useAlerts()
  const { data: cameras = [] } = useCameras()
  const { data: vvmScans = [] } = useVvmScans()
  const { data: pmEvents = [] } = usePredictiveMaintenance()
  const { data: ledgerRecords = [] } = useComplianceLedger()
  const { data: verification } = useVerifyChain()

  const activeDevice = selectedDeviceId ? devices.find((d) => d.id === selectedDeviceId) : devices[0]
  const { data: telemetry = [] } = useDeviceTelemetry(activeDevice?.id || null)

  const simulateTickMutation = useSimulateTick()
  const acknowledgeMutation = useAcknowledgeAlert()

  // Filtered batches for search and status
  const filteredBatches = useMemo(() => {
    return batches.filter((b) => {
      const matchesSearch =
        searchQuery === '' ||
        b.vaccine_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.batch_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.location_name.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesStatus =
        batchStatusFilter === 'all' || b.current_status === batchStatusFilter

      return matchesSearch && matchesStatus
    })
  }, [batches, searchQuery, batchStatusFilter])

  const openAlerts = alerts.filter((a) => !a.acknowledged)

  return (
    <div className="flex min-h-screen flex-col bg-[#f8fafc] text-slate-900">
      {/* Top Application Header */}
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeAlertsCount={openAlerts.length}
        onSimulateTick={() => simulateTickMutation.mutate()}
        isSimulating={simulateTickMutation.isPending}
      />

      {/* Main Container: Sidebar + Active Content View */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          alertsCount={openAlerts.length}
        />

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* ========================================================================= */}
          {/* TAB 1: DASHBOARD OVERVIEW (Exact layout from the reference image) */}
          {/* ========================================================================= */}
          {activeTab === 'dashboard' && (
            <>
              {/* Main Title Section (Exact match with reference photo) */}
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                    Vaccine Cold-Chain Management
                  </h1>
                  <p className="text-sm font-medium text-slate-500">
                    Monitor &rarr; Predict &rarr; Verify &rarr; Act &rarr; Prove Compliance
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200 shadow-2xs">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    Live
                  </span>
                </div>
              </div>

              {/* 8 Top Metrics Cards */}
              <TopMetricsRow summary={summary} />

              {/* Mid Section Grid: Left = Map, Right = Thermal Stress List (Matching Photo) */}
              <section className="grid grid-cols-1 gap-6 lg:grid-cols-[1.25fr_1fr]">
                {/* Left: Interactive India Cold-Chain Map */}
                <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm min-h-[420px]">
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">National PHC & Cold-Chain Grid</h3>
                      <p className="text-xs text-slate-500">Real-time facility status & carrier transit corridors</p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-mono font-medium text-slate-600">
                      {locations.length} Locations
                    </span>
                  </div>

                  <div className="h-[380px] w-full">
                    <ColdChainMap
                      locations={locations}
                      selectedLocationId={selectedLocationId}
                      onSelectLocation={setSelectedLocationId}
                    />
                  </div>
                </div>

                {/* Right: Thermal Stress Monitoring List */}
                <div className="min-h-[420px]">
                  <ThermalStressList
                    batches={filteredBatches}
                    onSelectBatch={setActiveBatchModal}
                  />
                </div>
              </section>

              {/* Lower Section: Real-time Telemetry Safe Corridor Chart */}
              <section className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
                <TelemetryChartCard
                  devices={devices}
                  telemetry={telemetry}
                  selectedDeviceId={activeDevice?.id || null}
                  onSelectDevice={setSelectedDeviceId}
                />

                {/* Live System Alerts Feed Card */}
                <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">Active Cold-Chain Alerts</h3>
                      <p className="text-xs text-slate-500">Prioritized mitigation & corrective actions</p>
                    </div>
                    <span className="rounded-full bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700 border border-rose-200">
                      {openAlerts.length} Open
                    </span>
                  </div>

                  <div className="mt-3 flex-1 space-y-3 overflow-y-auto max-h-[320px] pr-1">
                    {openAlerts.length === 0 ? (
                      <div className="flex h-32 flex-col items-center justify-center text-xs text-slate-400">
                        <CheckCircle2 className="h-6 w-6 text-emerald-500 mb-1" />
                        <span>All cold-chain nodes and lots operating safely.</span>
                      </div>
                    ) : (
                      openAlerts.slice(0, 5).map((alert) => (
                        <div
                          key={alert.id}
                          className={`rounded-xl border p-3 text-xs transition-all ${
                            alert.severity === 'critical'
                              ? 'border-rose-200 bg-rose-50/40'
                              : 'border-amber-200 bg-amber-50/40'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-bold text-slate-900">{alert.title}</span>
                            <button
                              onClick={() => acknowledgeMutation.mutate(alert.id)}
                              className="shrink-0 rounded-lg bg-white px-2 py-0.5 font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 text-[11px]"
                            >
                              Acknowledge
                            </button>
                          </div>
                          <p className="mt-1 text-slate-600">{alert.message}</p>
                          {alert.action_required && (
                            <p className="mt-1 font-semibold text-rose-800">
                              Action: {alert.action_required}
                            </p>
                          )}
                        </div>
                      ))
                    )}
                  </div>

                  <button
                    onClick={() => setActiveTab('alerts')}
                    className="mt-3 w-full rounded-xl border border-slate-200 bg-slate-50 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-all"
                  >
                    View All Incident Logs &rarr;
                  </button>
                </div>
              </section>
            </>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: BATCHES & CUMULATIVE THERMAL STRESS */}
          {/* ========================================================================= */}
          {activeTab === 'batches' && (
            <div className="space-y-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Vaccine Batch Portfolio</h2>
                  <p className="text-sm text-slate-500">
                    Arrhenius kinetic degradation modeling, shelf viability, and VVM concordance
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {(['all', 'safe', 'warning', 'critical'] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => setBatchStatusFilter(st)}
                      className={`rounded-xl px-3 py-1.5 text-xs font-bold capitalize transition-all ${
                        batchStatusFilter === st
                          ? 'bg-blue-600 text-white shadow-2xs'
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredBatches.map((batch) => (
                  <div
                    key={batch.id}
                    onClick={() => setActiveBatchModal(batch)}
                    className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-blue-400 hover:shadow-md transition-all space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-mono text-[11px] font-bold text-blue-600">
                          {batch.batch_code}
                        </span>
                        <h4 className="font-bold text-slate-900 text-base group-hover:text-blue-600 transition-colors">
                          {batch.vaccine_name}
                        </h4>
                        <p className="text-xs text-slate-500">{batch.location_name}</p>
                      </div>

                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase ${
                          batch.current_status === 'critical'
                            ? 'bg-rose-100 text-rose-800'
                            : batch.current_status === 'warning'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {batch.current_status}
                      </span>
                    </div>

                    {/* Stress Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-500">Thermal Stress</span>
                        <span className="text-slate-900">{batch.thermal_stress_score.toFixed(0)}%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            batch.current_status === 'critical'
                              ? 'bg-rose-500'
                              : batch.current_status === 'warning'
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.max(8, batch.thermal_stress_score)}%` }}
                        />
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Viability</span>
                        <span className="font-bold text-slate-900">{batch.viability_percent}%</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Excursion Duration</span>
                        <span className="font-bold text-slate-900">{batch.excursion_duration_hours}h</span>
                      </div>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-2 text-[11px] text-slate-600 flex items-center justify-between">
                      <span>VVM: {batch.last_vvm_classification || 'Stage 1: Fresh'}</span>
                      <span className="font-bold text-blue-600">&rarr;</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: LOCATIONS & COLD CHAIN NETWORK */}
          {/* ========================================================================= */}
          {activeTab === 'locations' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">National Cold-Chain Infrastructure</h2>
                  <p className="text-sm text-slate-500">Primary Health Centres, Regional Stores, and Transport Carriers</p>
                </div>
              </div>

              <div className="h-[460px] w-full rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <ColdChainMap
                  locations={locations}
                  selectedLocationId={selectedLocationId}
                  onSelectLocation={setSelectedLocationId}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {locations.map((loc) => (
                  <div key={loc.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-mono text-xs text-slate-400">{loc.code}</span>
                        <h4 className="font-bold text-slate-900 text-base">{loc.name}</h4>
                        <p className="text-xs text-slate-500">{loc.district}, {loc.state_province}</p>
                      </div>
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold capitalize text-slate-700">
                        {loc.kind.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Power Grid Status</span>
                        <span className="font-semibold text-slate-800 capitalize">
                          {loc.power_status.replace('_', ' ')}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Battery Backup</span>
                        <span className="font-semibold text-slate-800">{loc.battery_backup_hours} Hours</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: VVM MACHINE VISION LAB */}
          {/* ========================================================================= */}
          {activeTab === 'vvm_vision' && (
            <VvmMachineVisionLab
              cameras={cameras}
              batches={batches}
              recentScans={vvmScans}
            />
          )}

          {/* ========================================================================= */}
          {/* TAB 5: PREDICTIVE MAINTENANCE */}
          {/* ========================================================================= */}
          {activeTab === 'predictive' && (
            <PredictiveMaintenanceCard
              devices={devices}
              events={pmEvents}
            />
          )}

          {/* ========================================================================= */}
          {/* TAB 6: COMPLIANCE & EVIN LEDGER */}
          {/* ========================================================================= */}
          {activeTab === 'compliance' && (
            <ComplianceLedgerCard
              records={ledgerRecords}
              verification={verification}
            />
          )}

          {/* ========================================================================= */}
          {/* TAB 7: ALERTS */}
          {/* ========================================================================= */}
          {activeTab === 'alerts' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Cold-Chain Incident Response</h2>
                  <p className="text-sm text-slate-500">Real-time alerts generated across sensors, VVM vision, and vibration models</p>
                </div>
                <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-bold text-rose-800">
                  {openAlerts.length} Open Alerts
                </span>
              </div>

              <div className="space-y-3">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`rounded-2xl border p-4 shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      alert.acknowledged
                        ? 'border-slate-200 bg-slate-50/50 opacity-70'
                        : alert.severity === 'critical'
                        ? 'border-rose-300 bg-rose-50/40'
                        : 'border-amber-300 bg-amber-50/40'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-base">{alert.title}</span>
                        <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600 border border-slate-200">
                          {alert.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 max-w-2xl">{alert.message}</p>
                      {alert.action_required && (
                        <p className="text-xs font-bold text-rose-700">
                          Recommended Action: {alert.action_required}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      {!alert.acknowledged && (
                        <button
                          onClick={() => acknowledgeMutation.mutate(alert.id)}
                          className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition-all"
                        >
                          Acknowledge & Record
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 8: IOT HARDWARE GATEWAY & ESP32 TEST BENCH */}
          {/* ========================================================================= */}
          {activeTab === 'iot_gateway' && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50/40 p-6 shadow-xs">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="space-y-1.5 max-w-2xl">
                    <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-blue-800">
                      ESP32 Node & ESP32-CAM Gateway &bull; Offline-First
                    </span>
                    <h2 className="text-2xl font-bold text-slate-900">
                      IoT Hardware Integration & Offline Buffer Sync
                    </h2>
                    <p className="text-sm text-slate-600">
                      Built for rural Primary Health Centres with intermittent power and connectivity. Nodes buffer condition records in LittleFS and cryptographically chain every reading using hardware mbedtls SHA-256.
                    </p>
                  </div>

                  <button
                    onClick={() => simulateTickMutation.mutate()}
                    disabled={simulateTickMutation.isPending}
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700 active:scale-95 transition-all"
                  >
                    <Radio className={`h-4 w-4 ${simulateTickMutation.isPending ? 'animate-spin' : ''}`} />
                    <span>Send ESP32 Live Packet</span>
                  </button>
                </div>
              </div>

              {/* Hardware Nodes Fleet */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {devices.map((dev) => (
                  <div key={dev.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-mono text-xs font-bold text-blue-600">{dev.device_code}</span>
                        <h4 className="font-bold text-slate-900 text-base">{dev.name}</h4>
                        <p className="text-xs text-slate-500">{dev.equipment_type} &bull; {dev.location_name}</p>
                      </div>
                      <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
                        {dev.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Firmware</span>
                        <span className="font-mono font-semibold text-slate-800">{dev.firmware_version}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Battery Backup</span>
                        <span className="font-semibold text-slate-800">{dev.battery_level}%</span>
                      </div>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-2 text-[11px] text-slate-600 font-mono flex items-center justify-between">
                      <span>Temp: {dev.latest_temperature ? `${dev.latest_temperature.toFixed(1)}°C` : '2.8°C'}</span>
                      <span>Vib: {dev.current_vibration_rms.toFixed(2)} mm/s</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Batch Detail Inspector Modal */}
      {activeBatchModal && (
        <BatchDetailModal
          batch={activeBatchModal}
          onClose={() => setActiveBatchModal(null)}
        />
      )}
    </div>
  )
}

