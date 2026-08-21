import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import { Battery, Zap, AlertTriangle, ThermometerSnowflake } from 'lucide-react'
import type { LocationItem } from '@/types'

function createCustomIcon(status: string, kind: string) {
  let bgClass = 'bg-emerald-500'
  let pulseColor = 'rgba(16, 185, 129, 0.4)'

  if (status === 'warning') {
    bgClass = 'bg-amber-500'
    pulseColor = 'rgba(245, 158, 11, 0.4)'
  } else if (status === 'critical') {
    bgClass = 'bg-rose-500'
    pulseColor = 'rgba(239, 68, 68, 0.4)'
  }

  const isTransport = kind === 'transport_carrier'

  return L.divIcon({
    className: 'custom-map-pin',
    html: `
      <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 32px; height: 32px;">
        <div style="
          position: absolute;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: ${pulseColor};
          animation: map-pulse 2s infinite ease-in-out;
        "></div>
        <div class="h-6 w-6 rounded-full ${bgClass} border-2 border-white shadow-md flex items-center justify-center text-white text-[10px] font-bold">
          ${isTransport ? '🚚' : '❄️'}
        </div>
      </div>
      <style>
        @keyframes map-pulse {
          0% { transform: scale(0.6); opacity: 0.8; }
          50% { transform: scale(1.3); opacity: 0.2; }
          100% { transform: scale(0.6); opacity: 0.8; }
        }
      </style>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  })
}

function MapRecenter({ center }: { center: [number, number] }) {
  const map = useMap()
  useEffect(() => {
    map.flyTo(center, map.getZoom(), { duration: 1.2 })
  }, [center, map])
  return null
}

interface ColdChainMapProps {
  locations: LocationItem[]
  selectedLocationId?: string | null
  onSelectLocation?: (id: string) => void
}

export function ColdChainMap({ locations, selectedLocationId, onSelectLocation }: ColdChainMapProps) {
  const defaultCenter: [number, number] = [18.2, 78.8] // Central Deccan India (Hyderabad, Nagpur, Pune region)
  const [activeCenter, setActiveCenter] = useState<[number, number]>(defaultCenter)

  const selectedLoc = locations.find((l) => l.id === selectedLocationId)

  useEffect(() => {
    if (selectedLoc && selectedLoc.latitude && selectedLoc.longitude) {
      setActiveCenter([selectedLoc.latitude, selectedLoc.longitude])
    }
  }, [selectedLoc])

  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm">
      <MapContainer
        center={defaultCenter}
        zoom={6}
        scrollWheelZoom={true}
        className="h-full min-h-[380px] w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapRecenter center={activeCenter} />

        {locations.map((loc) => {
          if (!loc.latitude || !loc.longitude) return null
          return (
            <Marker
              key={loc.id}
              position={[loc.latitude, loc.longitude]}
              icon={createCustomIcon(loc.status, loc.kind)}
              eventHandlers={{
                click: () => {
                  if (onSelectLocation) onSelectLocation(loc.id)
                },
              }}
            >
              <Popup>
                <div className="w-64 p-3 text-slate-800">
                  <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2">
                    <div>
                      <h4 className="font-semibold text-slate-900 leading-snug">{loc.name}</h4>
                      <p className="text-xs text-slate-500 font-mono">{loc.code} • {loc.district}</p>
                    </div>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${
                        loc.status === 'safe'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : loc.status === 'warning'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {loc.status}
                    </span>
                  </div>

                  <div className="mt-2.5 space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-slate-500">
                        <Zap className="h-3.5 w-3.5 text-amber-500" />
                        Power Supply
                      </span>
                      <span className="font-medium capitalize text-slate-700">
                        {loc.power_status.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-slate-500">
                        <Battery className="h-3.5 w-3.5 text-blue-500" />
                        Battery Backup
                      </span>
                      <span className="font-medium text-slate-700">
                        {loc.battery_backup_hours}h remaining
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-slate-500">
                        <ThermometerSnowflake className="h-3.5 w-3.5 text-cyan-500" />
                        Active Units
                      </span>
                      <span className="font-medium text-slate-700">
                        {loc.active_devices} IoT nodes • {loc.active_batches} batches
                      </span>
                    </div>
                  </div>

                  {loc.power_status === 'power_cut' && (
                    <div className="mt-2.5 flex items-center gap-1.5 rounded-lg bg-amber-50 p-1.5 text-[11px] text-amber-800 border border-amber-200">
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-600" />
                      <span>Grid outage detected. Backup battery active.</span>
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>

      {/* Floating facility quick-badge overlay */}
      <div className="pointer-events-none absolute bottom-3 left-3 z-[400] flex items-center gap-2 rounded-xl bg-white/90 px-3 py-1.5 text-xs font-medium text-slate-700 shadow-md backdrop-blur border border-slate-200">
        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
        <span>{locations.length} Cold-Chain Nodes Active Across India</span>
      </div>
    </div>
  )
}

