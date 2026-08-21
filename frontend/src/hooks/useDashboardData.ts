import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import type {
  AlertItem,
  AuditRecordItem,
  BatchDetail,
  CameraDevice,
  ChainVerification,
  DashboardSummary,
  LocationItem,
  PredictiveMaintenanceItem,
  SensorDevice,
  TelemetryPoint,
  VaccineBatch,
  VvmAnalyzeResult,
  VvmScanItem,
} from '@/types'

const API_BASE = 'http://127.0.0.1:8000/api/v1'

export const useDashboardSummary = () => {
  return useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: async () => {
      const { data } = await axios.get<DashboardSummary>(`${API_BASE}/dashboard/summary`)
      return data
    },
    refetchInterval: 8_000,
  })
}

export const useLocations = () => {
  return useQuery({
    queryKey: ['locations'],
    queryFn: async () => {
      const { data } = await axios.get<LocationItem[]>(`${API_BASE}/locations`)
      return data
    },
    refetchInterval: 12_000,
  })
}

export const useBatches = () => {
  return useQuery({
    queryKey: ['batches'],
    queryFn: async () => {
      const { data } = await axios.get<VaccineBatch[]>(`${API_BASE}/batches`)
      return data
    },
    refetchInterval: 10_000,
  })
}

export const useBatchDetail = (batchId: string | null) => {
  return useQuery({
    queryKey: ['batch', batchId],
    queryFn: async () => {
      if (!batchId) return null
      const { data } = await axios.get<BatchDetail>(`${API_BASE}/batches/${batchId}`)
      return data
    },
    enabled: !!batchId,
  })
}

export const useDevices = () => {
  return useQuery({
    queryKey: ['devices'],
    queryFn: async () => {
      const { data } = await axios.get<SensorDevice[]>(`${API_BASE}/devices`)
      return data
    },
    refetchInterval: 8_000,
  })
}

export const useDeviceTelemetry = (deviceId: string | null) => {
  return useQuery({
    queryKey: ['device-telemetry', deviceId],
    queryFn: async () => {
      if (!deviceId) return []
      const { data } = await axios.get<TelemetryPoint[]>(`${API_BASE}/devices/${deviceId}/telemetry`)
      return data
    },
    enabled: !!deviceId,
    refetchInterval: 6_000,
  })
}

export const useAlerts = () => {
  return useQuery({
    queryKey: ['alerts'],
    queryFn: async () => {
      const { data } = await axios.get<AlertItem[]>(`${API_BASE}/alerts`)
      return data
    },
    refetchInterval: 6_000,
  })
}

export const useAcknowledgeAlert = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (alertId: string) => {
      const { data } = await axios.post(`${API_BASE}/alerts/${alertId}/acknowledge`)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] })
    },
  })
}

export const useCameras = () => {
  return useQuery({
    queryKey: ['cameras'],
    queryFn: async () => {
      const { data } = await axios.get<CameraDevice[]>(`${API_BASE}/cameras`)
      return data
    },
    refetchInterval: 12_000,
  })
}

export const useVvmScans = () => {
  return useQuery({
    queryKey: ['vvm-scans'],
    queryFn: async () => {
      const { data } = await axios.get<VvmScanItem[]>(`${API_BASE}/vvm/scans`)
      return data
    },
    refetchInterval: 10_000,
  })
}

export const useAnalyzeVvm = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { batch_id?: string; image_base64?: string; simulate_stage?: number }) => {
      const { data } = await axios.post<VvmAnalyzeResult>(`${API_BASE}/vvm/analyze`, payload)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vvm-scans'] })
      queryClient.invalidateQueries({ queryKey: ['batches'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] })
    },
  })
}

export const usePredictiveMaintenance = () => {
  return useQuery({
    queryKey: ['predictive-maintenance'],
    queryFn: async () => {
      const { data } = await axios.get<PredictiveMaintenanceItem[]>(`${API_BASE}/predictive-maintenance`)
      return data
    },
    refetchInterval: 12_000,
  })
}

export const useComplianceLedger = () => {
  return useQuery({
    queryKey: ['compliance-ledger'],
    queryFn: async () => {
      const { data } = await axios.get<AuditRecordItem[]>(`${API_BASE}/compliance/ledger?limit=60`)
      return data
    },
    refetchInterval: 8_000,
  })
}

export const useVerifyChain = () => {
  return useQuery({
    queryKey: ['verify-chain'],
    queryFn: async () => {
      const { data } = await axios.get<ChainVerification>(`${API_BASE}/compliance/verify-chain`)
      return data
    },
    refetchInterval: 15_000,
  })
}

export const useSimulateTick = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const { data } = await axios.post(`${API_BASE}/simulation/tick`)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] })
      queryClient.invalidateQueries({ queryKey: ['devices'] })
      queryClient.invalidateQueries({ queryKey: ['batches'] })
      queryClient.invalidateQueries({ queryKey: ['device-telemetry'] })
      queryClient.invalidateQueries({ queryKey: ['compliance-ledger'] })
    },
  })
}

