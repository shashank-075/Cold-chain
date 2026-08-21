#!/bin/bash

# setup-dashboard.sh - Complete Vaccine Cold-Chain Dashboard Setup
# Run this inside your frontend folder

echo "🚀 Setting up Vaccine Cold-Chain Dashboard..."

# Create folder structure
mkdir -p src/lib src/types src/hooks src/components/ui src/components/layout src/components/dashboard src/pages

# ============================================
# ROOT CONFIG FILES
# ============================================

# package.json
cat > package.json << 'EOF'
{
  "name": "vaccine-coldchain-dashboard",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "preview": "vite preview"
  },
  "dependencies": {
    "@hookform/resolvers": "^3.3.2",
    "@radix-ui/react-accordion": "^1.1.2",
    "@radix-ui/react-alert-dialog": "^1.0.5",
    "@radix-ui/react-checkbox": "^1.0.4",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "@radix-ui/react-label": "^2.0.2",
    "@radix-ui/react-popover": "^1.0.7",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-separator": "^1.0.3",
    "@radix-ui/react-slider": "^1.1.2",
    "@radix-ui/react-slot": "^1.0.2",
    "@radix-ui/react-switch": "^1.0.3",
    "@radix-ui/react-tabs": "^1.0.4",
    "@radix-ui/react-toast": "^1.1.5",
    "@radix-ui/react-tooltip": "^1.0.7",
    "@tanstack/react-query": "^5.8.4",
    "@tanstack/react-query-devtools": "^5.8.4",
    "axios": "^1.6.2",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "date-fns": "^2.30.0",
    "leaflet": "^1.9.4",
    "lucide-react": "^0.294.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-hook-form": "^7.47.0",
    "react-leaflet": "^4.2.1",
    "react-router-dom": "^6.20.0",
    "recharts": "^2.8.0",
    "tailwind-merge": "^2.0.0",
    "tailwindcss-animate": "^1.0.7",
    "zod": "^3.22.4"
  },
  "devDependencies": {
    "@types/node": "^20.9.0",
    "@types/react": "^18.2.37",
    "@types/react-dom": "^18.2.15",
    "@typescript-eslint/eslint-plugin": "^6.10.0",
    "@typescript-eslint/parser": "^6.10.0",
    "@vitejs/plugin-react": "^4.1.1",
    "autoprefixer": "^10.4.16",
    "eslint": "^8.53.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.4",
    "postcss": "^8.4.31",
    "tailwindcss": "^3.3.5",
    "typescript": "^5.2.2",
    "vite": "^5.0.0"
  }
}
EOF

# vite.config.ts
cat > vite.config.ts << 'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/ws': {
        target: 'ws://localhost:8000',
        ws: true,
      },
    },
  },
})
EOF

# tailwind.config.js
cat > tailwind.config.js << 'EOF'
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        status: {
          safe: "#22c55e",
          warning: "#eab308",
          critical: "#ef4444",
          offline: "#6b7280",
          maintenance: "#f59e0b",
        }
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
        "pulse-ring": {
          "0%": { transform: "scale(0.95)", opacity: 0.7 },
          "50%": { transform: "scale(1.05)", opacity: 0.3 },
          "100%": { transform: "scale(0.95)", opacity: 0.7 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-ring": "pulse-ring 2s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
EOF

# postcss.config.js
cat > postcss.config.js << 'EOF'
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOF

# tsconfig.json
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
EOF

# tsconfig.node.json
cat > tsconfig.node.json << 'EOF'
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
EOF

# .eslintrc.cjs
cat > .eslintrc.cjs << 'EOF'
module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
  },
}
EOF

# index.html
cat > index.html << 'EOF'
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vaccine Cold-Chain Dashboard</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
EOF

# ============================================
# SRC FILES
# ============================================

# src/main.tsx
cat > src/main.tsx << 'EOF'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
EOF

# src/App.tsx
cat > src/App.tsx << 'EOF'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Toaster } from '@/components/ui/toaster'
import { Dashboard } from '@/pages/Dashboard'
import { BatchDetail } from '@/pages/BatchDetail'
import { LocationDetail } from '@/pages/LocationDetail'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30,
      refetchOnWindowFocus: true,
      retry: 3,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="flex h-screen overflow-hidden bg-background">
          <Sidebar />
          <div className="flex flex-1 flex-col overflow-hidden">
            <Header />
            <main className="flex-1 overflow-y-auto">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/batch/:id" element={<BatchDetail />} />
                <Route path="/location/:id" element={<LocationDetail />} />
              </Routes>
            </main>
          </div>
        </div>
        <Toaster />
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

export default App
EOF

# src/index.css
cat > src/index.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 221.2 83.2% 53.3%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 217.2 91.2% 59.8%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 224.3 76.3% 48%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
    font-feature-settings: "rlig" 1, "calt" 1;
  }
}

::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: hsl(var(--muted));
  border-radius: 10px;
}
::-webkit-scrollbar-thumb {
  background: hsl(var(--primary));
  border-radius: 10px;
}
::-webkit-scrollbar-thumb:hover {
  background: hsl(var(--primary) / 0.8);
}
.status-pulse {
  animation: pulse-ring 2s ease-in-out infinite;
}
EOF

# src/vite-env.d.ts
cat > src/vite-env.d.ts << 'EOF'
/// <reference types="vite/client" />
EOF

# src/lib/utils.ts
cat > src/lib/utils.ts << 'EOF'
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

export const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    safe: 'bg-status-safe',
    warning: 'bg-status-warning',
    critical: 'bg-status-critical',
    offline: 'bg-status-offline',
    maintenance: 'bg-status-maintenance',
    online: 'bg-status-safe',
    'under-stress': 'bg-status-warning',
    'spoilage-risk': 'bg-status-critical',
  }
  return colors[status.toLowerCase()] || 'bg-gray-400'
}

export const getStatusBadgeVariant = (status: string) => {
  const variants: Record<string, string> = {
    safe: 'default',
    warning: 'warning',
    critical: 'destructive',
    offline: 'secondary',
    maintenance: 'warning',
    online: 'default',
    'under-stress': 'warning',
    'spoilage-risk': 'destructive',
  }
  return variants[status.toLowerCase()] || 'secondary'
}
EOF

# src/types/index.ts
cat > src/types/index.ts << 'EOF'
export interface KPI {
  id: string
  label: string
  value: number | string
  status: 'safe' | 'warning' | 'critical' | 'offline' | 'maintenance'
  icon: string
  trend?: number
}

export interface Location {
  id: string
  name: string
  type: 'phc' | 'refrigerator' | 'carrier'
  lat: number
  lng: number
  status: 'online' | 'offline' | 'warning' | 'critical'
  temperature?: number
  batchCount?: number
}

export interface VaccineBatch {
  id: string
  vaccineType: string
  location: string
  locationId: string
  status: 'safe' | 'warning' | 'critical' | 'spoilage-risk'
  thermalStressScore: number
  exposureDuration: number
  maxExcursionSeverity: number
  excursionCount: number
  viability: number
  lastVVMScan?: VVMScan
}

export interface VVMScan {
  id: string
  batchId: string
  imageUrl: string
  stage: 1 | 2 | 3 | 4
  classification: string
  confidence: number
  timestamp: string
  sensorAgreement: boolean
}

export interface TemperatureReading {
  timestamp: string
  temperature: number
  isExcursion: boolean
  severity?: number
}

export interface Device {
  id: string
  name: string
  type: 'refrigerator' | 'carrier' | 'phc'
  location: string
  status: 'online' | 'offline' | 'warning' | 'critical'
  currentTemperature: number
  minTemp: number
  maxTemp: number
  healthScore: number
  vibrationTrend: number[]
  anomalyScore: number
  failureRisk: 'low' | 'medium' | 'high'
  estimatedTimeToFailure?: string
  recommendedAction?: string
  lastSync: string
  battery: number
  backupTime: string
  powerCutDetected: boolean
  bufferedReadings?: number
}

export interface Alert {
  id: string
  priority: 'critical' | 'high' | 'medium' | 'low'
  type: string
  source: string
  description: string
  timestamp: string
  acknowledged: boolean
  actionRequired: string
}

export interface ComplianceData {
  totalReadings: number
  excursionEvents: number
  vvmScans: number
  maintenanceEvents: number
  userActions: number
  hashChainVerified: boolean
  lastIntegrityCheck: string
  auditReportGenerated: string
}
EOF

# src/hooks/useWebSocket.ts
cat > src/hooks/useWebSocket.ts << 'EOF'
import { useEffect, useRef, useState } from 'react'

interface WebSocketMessage {
  type: string
  payload: any
}

export function useWebSocket(url: string) {
  const [isConnected, setIsConnected] = useState(false)
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null)
  const wsRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    const ws = new WebSocket(url)
    wsRef.current = ws

    ws.onopen = () => {
      setIsConnected(true)
      console.log('WebSocket connected')
    }

    ws.onclose = () => {
      setIsConnected(false)
      console.log('WebSocket disconnected')
    }

    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        setLastMessage(data)
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error)
      }
    }

    return () => {
      ws.close()
    }
  }, [url])

  const sendMessage = (message: WebSocketMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message))
    }
  }

  return { isConnected, lastMessage, sendMessage }
}
EOF

# src/hooks/useDashboardData.ts
cat > src/hooks/useDashboardData.ts << 'EOF'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { KPI, Location, VaccineBatch, Device, Alert, ComplianceData } from '@/types'

const API_BASE = '/api'

export const useKPIs = () => {
  return useQuery({
    queryKey: ['kpis'],
    queryFn: async () => {
      const { data } = await axios.get<KPI[]>(`${API_BASE}/kpis`)
      return data
    },
    refetchInterval: 30000,
  })
}

export const useLocations = () => {
  return useQuery({
    queryKey: ['locations'],
    queryFn: async () => {
      const { data } = await axios.get<Location[]>(`${API_BASE}/locations`)
      return data
    },
    refetchInterval: 60000,
  })
}

export const useBatches = () => {
  return useQuery({
    queryKey: ['batches'],
    queryFn: async () => {
      const { data } = await axios.get<VaccineBatch[]>(`${API_BASE}/batches`)
      return data
    },
    refetchInterval: 30000,
  })
}

export const useDevices = () => {
  return useQuery({
    queryKey: ['devices'],
    queryFn: async () => {
      const { data } = await axios.get<Device[]>(`${API_BASE}/devices`)
      return data
    },
    refetchInterval: 15000,
  })
}

export const useAlerts = () => {
  return useQuery({
    queryKey: ['alerts'],
    queryFn: async () => {
      const { data } = await axios.get<Alert[]>(`${API_BASE}/alerts`)
      return data
    },
    refetchInterval: 10000,
  })
}

export const useCompliance = () => {
  return useQuery({
    queryKey: ['compliance'],
    queryFn: async () => {
      const { data } = await axios.get<ComplianceData>(`${API_BASE}/compliance`)
      return data
    },
    refetchInterval: 60000,
  })
}

export const useDeviceTemperature = (deviceId: string, duration: string = '24h') => {
  return useQuery({
    queryKey: ['temperature', deviceId, duration],
    queryFn: async () => {
      const { data } = await axios.get(`${API_BASE}/devices/${deviceId}/temperature`, {
        params: { duration },
      })
      return data
    },
    enabled: !!deviceId,
    refetchInterval: 10000,
  })
}
EOF

# src/components/ui/StatusBadge.tsx
cat > src/components/ui/StatusBadge.tsx << 'EOF'
import { cn } from '@/lib/utils'
import { Badge, BadgeProps } from './badge'

interface StatusBadgeProps extends BadgeProps {
  status: 'safe' | 'warning' | 'critical' | 'offline' | 'maintenance' | 'online'
  pulse?: boolean
}

const statusMap = {
  safe: { label: 'Safe', className: 'bg-green-500 hover:bg-green-600' },
  online: { label: 'Online', className: 'bg-green-500 hover:bg-green-600' },
  warning: { label: 'Warning', className: 'bg-yellow-500 hover:bg-yellow-600' },
  maintenance: { label: 'Maintenance', className: 'bg-yellow-500 hover:bg-yellow-600' },
  critical: { label: 'Critical', className: 'bg-red-500 hover:bg-red-600' },
  offline: { label: 'Offline', className: 'bg-gray-400 hover:bg-gray-500' },
}

export function StatusBadge({ status, pulse, className, ...props }: StatusBadgeProps) {
  const { label, className: statusClassName } = statusMap[status] || statusMap.offline
  
  return (
    <Badge
      className={cn(
        statusClassName,
        pulse && 'animate-pulse-ring',
        className
      )}
      {...props}
    >
      <span className="flex items-center gap-1.5">
        <span className={cn(
          'inline-block h-2 w-2 rounded-full',
          status === 'safe' || status === 'online' ? 'bg-white' : 
          status === 'warning' || status === 'maintenance' ? 'bg-white' :
          status === 'critical' ? 'bg-white' : 'bg-white/60'
        )} />
        {label}
      </span>
    </Badge>
  )
}
EOF

# src/components/dashboard/KPICard.tsx
cat > src/components/dashboard/KPICard.tsx << 'EOF'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { KPI } from '@/types'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'
import * as Icons from 'lucide-react'

interface KPICardProps {
  kpi: KPI
}

export function KPICard({ kpi }: KPICardProps) {
  const IconComponent = Icons[kpi.icon as keyof typeof Icons] as LucideIcon
  
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {kpi.label}
        </CardTitle>
        {IconComponent && (
          <IconComponent className="h-4 w-4 text-muted-foreground" />
        )}
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold">{kpi.value}</div>
          <StatusBadge status={kpi.status} />
        </div>
        {kpi.trend !== undefined && (
          <div className="mt-2 flex items-center gap-1 text-xs">
            {kpi.trend > 0 ? (
              <TrendingUp className="h-3 w-3 text-green-500" />
            ) : kpi.trend < 0 ? (
              <TrendingDown className="h-3 w-3 text-red-500" />
            ) : null}
            <span className={cn(
              kpi.trend > 0 ? 'text-green-500' : 
              kpi.trend < 0 ? 'text-red-500' : 
              'text-muted-foreground'
            )}>
              {kpi.trend > 0 ? '+' : ''}{kpi.trend}%
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
EOF

# src/components/dashboard/ExecutiveOverview.tsx
cat > src/components/dashboard/ExecutiveOverview.tsx << 'EOF'
import { useKPIs } from '@/hooks/useDashboardData'
import { KPICard } from './KPICard'
import { Skeleton } from '@/components/ui/skeleton'

export function ExecutiveOverview() {
  const { data: kpis, isLoading, error } = useKPIs()

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-600">
        Failed to load KPIs: {error.message}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
      {kpis?.map((kpi) => (
        <KPICard key={kpi.id} kpi={kpi} />
      ))}
    </div>
  )
}
EOF

# src/components/dashboard/ColdChainMap.tsx
cat > src/components/dashboard/ColdChainMap.tsx << 'EOF'
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import { useLocations } from '@/hooks/useDashboardData'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import 'leaflet/dist/leaflet.css'
import { useNavigate } from 'react-router-dom'

const markerColors = {
  online: '#22c55e',
  warning: '#eab308',
  critical: '#ef4444',
  offline: '#6b7280',
}

export function ColdChainMap() {
  const { data: locations, isLoading, error } = useLocations()
  const navigate = useNavigate()

  if (isLoading) {
    return <Skeleton className="h-[400px] w-full rounded-lg" />
  }

  if (error) {
    return (
      <div className="flex h-[400px] items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-600">
        Failed to load map data
      </div>
    )
  }

  const center = locations?.length 
    ? [locations.reduce((sum, l) => sum + l.lat, 0) / locations.length,
       locations.reduce((sum, l) => sum + l.lng, 0) / locations.length]
    : [20.5937, 78.9629]

  return (
    <div className="rounded-lg border shadow-sm h-[400px] overflow-hidden">
      <MapContainer
        center={center as [number, number]}
        zoom={6}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {locations?.map((location) => (
          <CircleMarker
            key={location.id}
            center={[location.lat, location.lng]}
            radius={12}
            fillColor={markerColors[location.status]}
            color="#fff"
            weight={2}
            opacity={1}
            fillOpacity={0.8}
            eventHandlers={{
              click: () => {
                navigate(`/location/${location.id}`)
              },
            }}
          >
            <Popup>
              <div className="min-w-[200px] p-1">
                <h3 className="font-semibold text-sm">{location.name}</h3>
                <p className="text-xs text-muted-foreground capitalize">{location.type}</p>
                <div className="mt-2 flex items-center gap-2">
                  <StatusBadge status={location.status} size="sm" />
                  {location.temperature !== undefined && (
                    <span className="text-sm font-medium">
                      {location.temperature}°C
                    </span>
                  )}
                </div>
                {location.batchCount !== undefined && (
                  <p className="text-xs mt-1">Batches: {location.batchCount}</p>
                )}
                <Button
                  size="sm"
                  className="mt-2 w-full"
                  onClick={() => navigate(`/location/${location.id}`)}
                >
                  View Details
                </Button>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  )
}
EOF

# src/components/dashboard/ThermalStressMonitor.tsx
cat > src/components/dashboard/ThermalStressMonitor.tsx << 'EOF'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useBatches } from '@/hooks/useDashboardData'
import { Skeleton } from '@/components/ui/skeleton'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { cn } from '@/lib/utils'

export function ThermalStressMonitor() {
  const { data: batches, isLoading, error } = useBatches()

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Thermal Stress Monitoring</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    )
  }

  if (error || !batches) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-red-600">
          Failed to load thermal stress data
        </CardContent>
      </Card>
    )
  }

  const stressColor = (score: number) => {
    if (score < 30) return 'bg-green-500'
    if (score < 60) return 'bg-yellow-500'
    if (score < 80) return 'bg-orange-500'
    return 'bg-red-500'
  }

  const getStatus = (score: number) => {
    if (score < 30) return 'safe'
    if (score < 60) return 'warning'
    if (score < 80) return 'critical'
    return 'critical'
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Thermal Stress Monitoring</span>
          <span className="text-sm font-normal text-muted-foreground">
            {batches.filter(b => b.status === 'critical' || b.status === 'spoilage-risk').length} at risk
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 max-h-[320px] overflow-y-auto pr-2">
        {batches.slice(0, 6).map((batch) => (
          <div key={batch.id} className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="font-medium truncate max-w-[120px]">
                  {batch.vaccineType}
                </span>
                <StatusBadge status={getStatus(batch.thermalStressScore)} size="sm" />
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs">
                  {batch.thermalStressScore}%
                </span>
                {batch.excursionCount > 0 && (
                  <span className="text-xs text-red-500">
                    {batch.excursionCount} excursions
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Progress
                value={batch.thermalStressScore}
                className={cn('h-2 flex-1', stressColor(batch.thermalStressScore))}
              />
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {batch.exposureDuration}h
              </span>
            </div>
            {batch.maxExcursionSeverity > 0 && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <span>Max excursion: {batch.maxExcursionSeverity}°C above</span>
                <span className="text-red-500">•</span>
                <span>Viability: {batch.viability}%</span>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
EOF

# src/components/dashboard/TemperatureChart.tsx
cat > src/components/dashboard/TemperatureChart.tsx << 'EOF'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
  Legend,
} from 'recharts'
import { useDeviceTemperature } from '@/hooks/useDashboardData'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { format } from 'date-fns'

interface TemperatureChartProps {
  deviceId: string
  deviceName: string
  minTemp: number
  maxTemp: number
}

export function TemperatureChart({ deviceId, deviceName, minTemp, maxTemp }: TemperatureChartProps) {
  const [duration, setDuration] = useState<'1h' | '6h' | '24h' | '7d'>('24h')
  const { data, isLoading, error } = useDeviceTemperature(deviceId, duration)

  const durationMap = {
    '1h': 'Last Hour',
    '6h': 'Last 6 Hours',
    '24h': 'Last 24 Hours',
    '7d': 'Last 7 Days',
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Temperature Monitoring</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    )
  }

  if (error || !data) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-red-600">
          Failed to load temperature data
        </CardContent>
      </Card>
    )
  }

  const formatXAxis = (timestamp: string) => {
    const date = new Date(timestamp)
    if (duration === '1h') return format(date, 'HH:mm')
    if (duration === '6h') return format(date, 'HH:mm')
    if (duration === '24h') return format(date, 'HH:mm')
    return format(date, 'MM/dd')
  }

  const customTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border bg-background p-3 shadow-lg">
          <p className="text-sm text-muted-foreground">
            {format(new Date(label), 'MMM dd, HH:mm:ss')}
          </p>
          <p className="text-lg font-bold">
            {payload[0].value}°C
          </p>
          {payload[0].payload.isExcursion && (
            <p className="text-sm text-red-500 font-medium">
              ⚠️ Excursion ({payload[0].payload.severity}°C above)
            </p>
          )}
        </div>
      )
    }
    return null
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{deviceName}</CardTitle>
          <p className="text-sm text-muted-foreground">Real-time temperature monitoring</p>
        </div>
        <div className="flex gap-1">
          {(['1h', '6h', '24h', '7d'] as const).map((d) => (
            <Button
              key={d}
              variant={duration === d ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDuration(d)}
              className="text-xs"
            >
              {durationMap[d]}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="timestamp"
                tickFormatter={formatXAxis}
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}°C`}
                domain={[minTemp - 5, maxTemp + 5]}
              />
              <Tooltip content={customTooltip} />
              <Legend />
              <ReferenceArea
                y1={minTemp}
                y2={maxTemp}
                fill="#22c55e"
                fillOpacity={0.1}
                label={{
                  value: 'Safe Range',
                  position: 'insideBottomRight',
                  fill: '#22c55e',
                  fontSize: 11,
                }}
              />
              <Line
                type="monotone"
                dataKey="temperature"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
                name="Temperature"
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-muted-foreground">Current: </span>
              <span className="font-bold">{data[data.length - 1]?.temperature}°C</span>
            </div>
            <div>
              <span className="text-muted-foreground">Range: </span>
              <span className="font-bold">{minTemp}°C – {maxTemp}°C</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
            <span className="text-muted-foreground">Live</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
EOF

# src/components/dashboard/VVMVerification.tsx
cat > src/components/dashboard/VVMVerification.tsx << 'EOF'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { VVMScan } from '@/types'
import { Camera, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react'

const mockVVMScans: VVMScan[] = [
  {
    id: '1',
    batchId: 'BATCH-2024-001',
    imageUrl: 'https://via.placeholder.com/200x200/0077B6/FFFFFF?text=VVM+Scan',
    stage: 2,
    classification: 'Stage 2 - Partially Used',
    confidence: 94,
    timestamp: new Date().toISOString(),
    sensorAgreement: true,
  },
  {
    id: '2',
    batchId: 'BATCH-2024-002',
    imageUrl: 'https://via.placeholder.com/200x200/EF4444/FFFFFF?text=VVM+Scan',
    stage: 3,
    classification: 'Stage 3 - Heat Exposed',
    confidence: 87,
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    sensorAgreement: false,
  },
]

const stageColors = {
  1: 'bg-green-500',
  2: 'bg-yellow-500',
  3: 'bg-orange-500',
  4: 'bg-red-500',
}

const stageLabels = {
  1: 'Stage 1 - Fresh',
  2: 'Stage 2 - Partially Used',
  3: 'Stage 3 - Heat Exposed',
  4: 'Stage 4 - Expired',
}

export function VVMVerification() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>VVM Computer-Vision Verification</CardTitle>
        <Button variant="outline" size="sm">
          <Camera className="mr-2 h-4 w-4" />
          New Scan
        </Button>
      </CardHeader>
      <CardContent className="space-y-4 max-h-[320px] overflow-y-auto pr-2">
        {mockVVMScans.map((scan) => (
          <div
            key={scan.id}
            className="rounded-lg border p-4 space-y-3 hover:shadow-sm transition-shadow"
          >
            <div className="flex items-start gap-4">
              <img
                src={scan.imageUrl}
                alt="VVM Scan"
                className="h-16 w-16 rounded-lg object-cover border"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-sm truncate">{scan.batchId}</p>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={scan.sensorAgreement ? 'default' : 'destructive'}
                      className="text-xs"
                    >
                      {scan.sensorAgreement ? (
                        <CheckCircle className="mr-1 h-3 w-3" />
                      ) : (
                        <AlertTriangle className="mr-1 h-3 w-3" />
                      )}
                      {scan.sensorAgreement ? 'Agrees' : 'Discrepancy'}
                    </Badge>
                    <Badge className={stageColors[scan.stage]}>
                      Stage {scan.stage}
                    </Badge>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {stageLabels[scan.stage]}
                </p>
                <div className="mt-1 flex items-center gap-3">
                  <div className="flex-1">
                    <Progress value={scan.confidence} className="h-1.5" />
                  </div>
                  <span className="text-xs font-medium">{scan.confidence}%</span>
                </div>
                <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{new Date(scan.timestamp).toLocaleString()}</span>
                  <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                    <RefreshCw className="mr-1 h-3 w-3" />
                    Rescan
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
EOF

# src/components/dashboard/PredictiveMaintenance.tsx
cat > src/components/dashboard/PredictiveMaintenance.tsx << 'EOF'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useDevices } from '@/hooks/useDashboardData'
import { Skeleton } from '@/components/ui/skeleton'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { AlertCircle, Wrench, Clock, CheckCircle } from 'lucide-react'

const riskColors = {
  low: 'bg-green-500',
  medium: 'bg-yellow-500',
  high: 'bg-red-500',
}

const riskLabels = {
  low: 'Low Risk',
  medium: 'Medium Risk',
  high: 'High Risk',
}

export function PredictiveMaintenance() {
  const { data: devices, isLoading, error } = useDevices()

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Predictive Maintenance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </CardContent>
      </Card>
    )
  }

  if (error || !devices) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-red-600">
          Failed to load device data
        </CardContent>
      </Card>
    )
  }

  const maintenanceDevices = devices
    .filter(d => d.healthScore < 70 || d.failureRisk === 'high' || d.failureRisk === 'medium')
    .sort((a, b) => a.healthScore - b.healthScore)

  if (maintenanceDevices.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Predictive Maintenance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8 text-center text-muted-foreground">
            <div>
              <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-2" />
              <p>All devices are healthy</p>
              <p className="text-sm">No maintenance predicted</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Predictive Maintenance</span>
          <Badge variant="destructive" className="animate-pulse">
            {maintenanceDevices.length} require attention
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 max-h-[320px] overflow-y-auto pr-2">
        {maintenanceDevices.slice(0, 5).map((device) => (
          <div
            key={device.id}
            className="rounded-lg border p-3 hover:shadow-sm transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm truncate">{device.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {device.type}
                  </Badge>
                </div>
                <div className="mt-1 flex items-center gap-3 text-xs">
                  <span className="text-muted-foreground">
                    Health: {device.healthScore}%
                  </span>
                  <span className="text-muted-foreground">
                    Anomaly: {device.anomalyScore}
                  </span>
                  <Badge className={riskColors[device.failureRisk]}>
                    {riskLabels[device.failureRisk]}
                  </Badge>
                </div>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{device.recommendedAction || 'Inspect device'}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="mt-2 flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">
                  ETA: {device.estimatedTimeToFailure || 'Unknown'}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Wrench className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {device.recommendedAction || 'Routine check'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
EOF

# src/components/dashboard/ConnectivityPanel.tsx
cat > src/components/dashboard/ConnectivityPanel.tsx << 'EOF'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useDevices } from '@/hooks/useDashboardData'
import { Skeleton } from '@/components/ui/skeleton'
import { Wifi, WifiOff, Battery, Zap, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

export function ConnectivityPanel() {
  const { data: devices, isLoading, error } = useDevices()

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Connectivity & Power</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    )
  }

  if (error || !devices) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-red-600">
          Failed to load connectivity data
        </CardContent>
      </Card>
    )
  }

  const offlineDevices = devices.filter(d => d.status === 'offline')

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Connectivity & Power</span>
          {offlineDevices.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {offlineDevices.length} offline
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 max-h-[320px] overflow-y-auto pr-2">
        {devices.slice(0, 6).map((device) => (
          <div
            key={device.id}
            className={cn(
              'flex items-center justify-between rounded-lg border p-3 transition-colors',
              device.status === 'offline' && 'bg-muted/50'
            )}
          >
            <div className="flex items-center gap-3 min-w-0">
              {device.status === 'online' ? (
                <Wifi className="h-4 w-4 text-green-500 flex-shrink-0" />
              ) : (
                <WifiOff className="h-4 w-4 text-gray-400 flex-shrink-0" />
              )}
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{device.name}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>Sync: {new Date(device.lastSync).toLocaleTimeString()}</span>
                  {device.bufferedReadings && (
                    <span>• {device.bufferedReadings} buffered</span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              {device.powerCutDetected && (
                <Zap className="h-4 w-4 text-yellow-500" />
              )}
              <div className="flex items-center gap-2">
                <Battery className={cn(
                  'h-4 w-4',
                  device.battery < 20 ? 'text-red-500' :
                  device.battery < 50 ? 'text-yellow-500' :
                  'text-green-500'
                )} />
                <span className="text-sm font-medium">{device.battery}%</span>
              </div>
              {device.status === 'offline' && device.backupTime && (
                <Badge variant="outline" className="text-xs">
                  <Clock className="mr-1 h-3 w-3" />
                  {device.backupTime}
                </Badge>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
EOF

# src/components/dashboard/AlertsCentre.tsx
cat > src/components/dashboard/AlertsCentre.tsx << 'EOF'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAlerts } from '@/hooks/useDashboardData'
import { Skeleton } from '@/components/ui/skeleton'
import { Bell, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

const priorityColors = {
  critical: 'border-red-500 bg-red-50 dark:bg-red-950/20',
  high: 'border-orange-500 bg-orange-50 dark:bg-orange-950/20',
  medium: 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20',
  low: 'border-blue-500 bg-blue-50 dark:bg-blue-950/20',
}

const priorityBadges = {
  critical: { label: 'Critical', className: 'bg-red-500' },
  high: { label: 'High', className: 'bg-orange-500' },
  medium: { label: 'Medium', className: 'bg-yellow-500' },
  low: { label: 'Low', className: 'bg-blue-500' },
}

export function AlertsCentre() {
  const { data: alerts, isLoading, error } = useAlerts()

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Alerts & Action Centre</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </CardContent>
      </Card>
    )
  }

  if (error || !alerts) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-red-600">
          Failed to load alerts
        </CardContent>
      </Card>
    )
  }

  const unacknowledged = alerts.filter(a => !a.acknowledged)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Alerts & Action Centre
        </CardTitle>
        {unacknowledged.length > 0 && (
          <Badge variant="destructive" className="animate-pulse">
            {unacknowledged.length} new
          </Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-2 max-h-[320px] overflow-y-auto pr-2">
        {alerts.slice(0, 6).map((alert) => (
          <div
            key={alert.id}
            className={cn(
              'rounded-lg border-l-4 p-3 transition-all hover:shadow-sm',
              priorityColors[alert.priority],
              alert.acknowledged && 'opacity-60'
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Badge className={cn('text-xs', priorityBadges[alert.priority].className)}>
                    {priorityBadges[alert.priority].label}
                  </Badge>
                  <span className="text-xs font-medium text-muted-foreground">
                    {alert.source}
                  </span>
                </div>
                <p className="text-sm mt-0.5">{alert.description}</p>
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                  <span>{new Date(alert.timestamp).toLocaleString()}</span>
                  <span>•</span>
                  <span className="font-medium">Action: {alert.actionRequired}</span>
                </div>
              </div>
              {!alert.acknowledged && (
                <Button size="sm" variant="outline" className="flex-shrink-0">
                  <CheckCircle className="mr-1 h-3 w-3" />
                  Acknowledge
                </Button>
              )}
            </div>
          </div>
        ))}
        {alerts.length === 0 && (
          <div className="flex items-center justify-center p-8 text-center text-muted-foreground">
            <div>
              <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-2" />
              <p>All clear</p>
              <p className="text-sm">No alerts at this time</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
EOF

# src/components/dashboard/ComplianceAudit.tsx
cat > src/components/dashboard/ComplianceAudit.tsx << 'EOF'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useCompliance } from '@/hooks/useDashboardData'
import { Skeleton } from '@/components/ui/skeleton'
import { Shield, FileText, CheckCircle, AlertCircle, Clock, Database } from 'lucide-react'

export function ComplianceAudit() {
  const { data: compliance, isLoading, error } = useCompliance()

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Compliance & Audit Trail</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (error || !compliance) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-red-600">
          Failed to load compliance data
        </CardContent>
      </Card>
    )
  }

  const stats = [
    { label: 'Readings', value: compliance.totalReadings, icon: Database },
    { label: 'Excursions', value: compliance.excursionEvents, icon: AlertCircle },
    { label: 'VVM Scans', value: compliance.vvmScans, icon: FileText },
    { label: 'Maintenance', value: compliance.maintenanceEvents, icon: Clock },
  ]

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Compliance & Audit Trail</CardTitle>
        <div className="flex items-center gap-2">
          <Badge
            variant={compliance.hashChainVerified ? 'default' : 'destructive'}
            className="flex items-center gap-1"
          >
            {compliance.hashChainVerified ? (
              <CheckCircle className="h-3 w-3" />
            ) : (
              <AlertCircle className="h-3 w-3" />
            )}
            {compliance.hashChainVerified ? 'Verified' : 'Unverified'}
          </Badge>
          <Button size="sm">
            <FileText className="mr-2 h-4 w-4" />
            Generate Report
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-lg border p-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <stat.icon className="h-4 w-4" />
                {stat.label}
              </div>
              <p className="text-xl font-bold">{stat.value.toLocaleString()}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between text-sm border-t pt-3">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Shield className="h-4 w-4" />
            <span>Last verification: {new Date(compliance.lastIntegrityCheck).toLocaleString()}</span>
          </div>
          {compliance.auditReportGenerated && (
            <Badge variant="outline" className="text-xs">
              Report generated: {new Date(compliance.auditReportGenerated).toLocaleDateString()}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
EOF

# src/pages/Dashboard.tsx
cat > src/pages/Dashboard.tsx << 'EOF'
import { ExecutiveOverview } from '@/components/dashboard/ExecutiveOverview'
import { ColdChainMap } from '@/components/dashboard/ColdChainMap'
import { ThermalStressMonitor } from '@/components/dashboard/ThermalStressMonitor'
import { TemperatureChart } from '@/components/dashboard/TemperatureChart'
import { VVMVerification } from '@/components/dashboard/VVMVerification'
import { PredictiveMaintenance } from '@/components/dashboard/PredictiveMaintenance'
import { ConnectivityPanel } from '@/components/dashboard/ConnectivityPanel'
import { AlertsCentre } from '@/components/dashboard/AlertsCentre'
import { ComplianceAudit } from '@/components/dashboard/ComplianceAudit'
import { useDevices } from '@/hooks/useDashboardData'

export function Dashboard() {
  const { data: devices } = useDevices()
  const defaultDevice = devices?.[0]

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Vaccine Cold-Chain Management
          </h1>
          <p className="text-muted-foreground">
            Monitor → Predict → Verify → Act → Prove Compliance
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="inline-block h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          Live
        </div>
      </div>

      <ExecutiveOverview />
      <div className="grid gap-6 md:grid-cols-2">
        <ColdChainMap />
        <ThermalStressMonitor />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {defaultDevice && (
          <TemperatureChart
            deviceId={defaultDevice.id}
            deviceName={defaultDevice.name}
            minTemp={defaultDevice.minTemp}
            maxTemp={defaultDevice.maxTemp}
          />
        )}
        <VVMVerification />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <PredictiveMaintenance />
        <ConnectivityPanel />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <AlertsCentre />
        <ComplianceAudit />
      </div>
    </div>
  )
}
EOF

# src/pages/BatchDetail.tsx
cat > src/pages/BatchDetail.tsx << 'EOF'
import { useParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Progress } from '@/components/ui/progress'
import { AlertTriangle, Clock, FileText } from 'lucide-react'

export function BatchDetail() {
  const { id } = useParams()

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Batch Details</h1>
          <p className="text-muted-foreground">ID: {id}</p>
        </div>
        <Button>
          <FileText className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Vaccine Type</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-bold">COVID-19 Vax (Pfizer)</p>
            <p className="text-sm text-muted-foreground">Batch: BATCH-2024-001</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Location</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-bold">PHC Central</p>
            <p className="text-sm text-muted-foreground">Refrigerator A2</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Viability Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <StatusBadge status="warning" />
              <span className="text-sm text-muted-foreground">85% viable</span>
            </div>
            <Progress value={85} className="mt-2 h-2" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Thermal Stress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Stress Score</span>
              <span className="font-bold">45/100</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Exposure Duration</span>
              <span className="font-bold">6.5 hours</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Max Excursion Severity</span>
              <span className="font-bold text-red-500">+3.2°C</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Excursions</span>
              <span className="font-bold">2 events</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>VVM Scan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-4">
              <img
                src="https://via.placeholder.com/150x150/0077B6/FFFFFF?text=VVM"
                alt="VVM Scan"
                className="rounded-lg border"
              />
              <div className="space-y-2">
                <Badge className="bg-yellow-500">Stage 2 - Partially Used</Badge>
                <p className="text-sm">
                  <span className="text-muted-foreground">Confidence:</span> 94%
                </p>
                <p className="text-sm">
                  <span className="text-muted-foreground">Sensor Agreement:</span>{' '}
                  <Badge variant="default">✓ Agrees</Badge>
                </p>
                <p className="text-sm text-muted-foreground">
                  Last scan: 2 hours ago
                </p>
                <Button size="sm" variant="outline">
                  <Clock className="mr-2 h-3 w-3" />
                  Request Rescan
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recommended Action</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-3 rounded-lg border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20 p-4">
            <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Monitor closely</p>
              <p className="text-sm text-muted-foreground">
                Batch has experienced 2 temperature excursions. Recommend VVM rescan in 6 hours.
                If stress score exceeds 60, consider moving to backup storage.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
EOF

# src/pages/LocationDetail.tsx
cat > src/pages/LocationDetail.tsx << 'EOF'
import { useParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/ui/StatusBadge'

export function LocationDetail() {
  const { id } = useParams()

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Location Details</h1>
        <p className="text-muted-foreground">ID: {id}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>PHC Central</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <StatusBadge status="online" />
              <span className="text-sm text-muted-foreground">Last seen: 2 min ago</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Active Batches</p>
                <p className="text-xl font-bold">12</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Temperature</p>
                <p className="text-xl font-bold text-green-500">2.4°C</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Devices</p>
                <p className="text-xl font-bold">4</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge>Operational</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Connected Devices</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {['Refrigerator A1', 'Refrigerator A2', 'Transport Van 3', 'IoT Gateway'].map((device) => (
              <div key={device} className="flex items-center justify-between border-b pb-2 last:border-0">
                <span className="text-sm">{device}</span>
                <StatusBadge status="online" size="sm" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
EOF

echo ""
echo "✅ All files created successfully!"
echo ""
echo "📦 Now run these commands:"
echo ""
echo "   npm install"
echo "   npx shadcn-ui@latest init"
echo "   npx shadcn-ui@latest add badge button card progress skeleton input tooltip toast"
echo "   npm run dev"
echo ""
echo "🚀 Dashboard will be available at http://localhost:3000"