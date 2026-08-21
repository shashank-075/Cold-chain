import { Search, Bell, ThermometerSnowflake, User, Play } from 'lucide-react'

interface HeaderProps {
  searchQuery: string
  onSearchChange: (q: string) => void
  activeAlertsCount: number
  onSimulateTick: () => void
  isSimulating: boolean
}

export function Header({
  searchQuery,
  onSearchChange,
  activeAlertsCount,
  onSimulateTick,
  isSimulating,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8 shadow-xs">
      {/* Left Branding */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100 shadow-xs">
          <ThermometerSnowflake className="h-5 w-5" />
        </div>
        <div className="leading-tight">
          <div className="flex items-center gap-2">
            <span className="text-base font-bold tracking-tight text-slate-900">Cold Chain</span>
          </div>
          <span className="text-xs font-medium text-slate-500">Vaccine Monitor</span>
        </div>
      </div>

      {/* Center Search Input */}
      <div className="mx-4 flex max-w-md flex-1 items-center">
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search batches, locations, devices..."
            className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-100 transition-all"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Real-time Hardware Tick Simulator Button */}
        <button
          onClick={onSimulateTick}
          disabled={isSimulating}
          title="Simulate incoming ESP32 reading packet"
          className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 hover:border-slate-300 active:scale-95 transition-all"
        >
          <Play className={`h-3 w-3 text-blue-600 ${isSimulating ? 'animate-spin' : ''}`} />
          <span>{isSimulating ? 'Ingesting...' : 'ESP32 Ingest'}</span>
        </button>

        {/* Live Monitoring Badge */}
        <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50/80 px-3 py-1 text-xs font-medium text-emerald-800">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
          </span>
          <span className="hidden sm:inline">Live monitoring</span>
        </div>

        {/* Notification Bell */}
        <div className="relative">
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
          >
            <Bell className="h-4 w-4" />
            {activeAlertsCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-xs">
                {activeAlertsCount > 9 ? '9+' : activeAlertsCount}
              </span>
            )}
          </button>
        </div>

        {/* Profile Avatar */}
        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-100 text-slate-700 font-semibold text-xs shadow-xs">
          <User className="h-4 w-4 text-slate-600" />
        </div>
      </div>
    </header>
  )
}

