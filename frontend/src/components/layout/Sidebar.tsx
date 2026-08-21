import {
  LayoutDashboard,
  Boxes,
  MapPin,
  Bell,
  ShieldCheck,
  Camera,
  Activity,
  Cpu,
  CheckCircle2,
} from 'lucide-react'

export type NavTab =
  | 'dashboard'
  | 'batches'
  | 'locations'
  | 'vvm_vision'
  | 'predictive'
  | 'compliance'
  | 'alerts'
  | 'iot_gateway'

interface SidebarProps {
  activeTab: NavTab
  onTabChange: (tab: NavTab) => void
  alertsCount: number
}

export function Sidebar({ activeTab, onTabChange, alertsCount }: SidebarProps) {
  const navItems = [
    {
      id: 'dashboard' as NavTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'batches' as NavTab,
      label: 'Batches',
      icon: Boxes,
    },
    {
      id: 'locations' as NavTab,
      label: 'Locations',
      icon: MapPin,
    },
    {
      id: 'vvm_vision' as NavTab,
      label: 'VVM Vision AI',
      icon: Camera,
      tag: 'WHO',
    },
    {
      id: 'predictive' as NavTab,
      label: 'Predictive Maint.',
      icon: Activity,
    },
    {
      id: 'compliance' as NavTab,
      label: 'Compliance (eVIN)',
      icon: ShieldCheck,
    },
    {
      id: 'alerts' as NavTab,
      label: 'Alerts',
      icon: Bell,
      badge: alertsCount > 0 ? alertsCount : undefined,
    },
    {
      id: 'iot_gateway' as NavTab,
      label: 'IoT & ESP32 Node',
      icon: Cpu,
    },
  ]

  return (
    <aside className="flex w-64 shrink-0 flex-col justify-between border-r border-slate-200 bg-white p-4">
      {/* Navigation List */}
      <div className="space-y-1.5">
        <div className="px-3 pb-2 pt-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Cold-Chain Operations
        </div>

        {navItems.map(({ id, label, icon: Icon, badge, tag }) => {
          const isActive = activeTab === id
          return (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className={`group flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`h-4 w-4 shrink-0 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'
                  }`}
                />
                <span className="truncate">{label}</span>
              </div>

              <div className="flex items-center gap-1.5">
                {tag && (
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      isActive
                        ? 'bg-blue-500 text-white'
                        : 'bg-blue-50 text-blue-600 border border-blue-100'
                    }`}
                  >
                    {tag}
                  </span>
                )}
                {badge !== undefined && (
                  <span
                    className={`flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-xs font-bold ${
                      isActive
                        ? 'bg-white text-blue-600'
                        : 'bg-rose-100 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {badge}
                  </span>
                )}
              </div>
            </button>
          )
        })}
      </div>

      {/* Bottom System Status Box (Exact style from screenshot) */}
      <div className="mt-6 rounded-2xl border border-slate-200/90 bg-slate-50/80 p-3.5 text-xs text-slate-600">
        <div className="flex items-center justify-between text-slate-500">
          <span className="font-semibold text-slate-700">System Status</span>
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
        </div>
        <div className="mt-2 flex items-center gap-2 text-slate-800 font-medium">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>All services operational</span>
        </div>
        <div className="mt-1 text-[11px] text-slate-400 font-mono">
          eVIN v3.8 API &bull; SHA-256 Ledger OK
        </div>
      </div>
    </aside>
  )
}

