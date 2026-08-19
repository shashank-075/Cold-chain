import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import type {
  AlertItem,
  CameraDevice,
  DashboardSummary,
  SensorDevice,
  VaccineBatch,
} from '@/types'

const API_BASE = 'http://127.0.0.1:8000/api/v1'

export const useDashboardSummary = () => {
  return useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: async () => {
      const { data } = await axios.get<DashboardSummary>(`${API_BASE}/dashboard/summary`)
      return data
    },
    refetchInterval: 20_000,
  })
}

export const useBatches = () => {
  return useQuery({
    queryKey: ['batches'],
    queryFn: async () => {
      const { data } = await axios.get<VaccineBatch[]>(`${API_BASE}/batches`)
      return data
    },
    refetchInterval: 20_000,
  })
}

export const useDevices = () => {
  return useQuery({
    queryKey: ['devices'],
    queryFn: async () => {
      const { data } = await axios.get<SensorDevice[]>(`${API_BASE}/devices`)
      return data
    },
    refetchInterval: 15_000,
  })
}

export const useAlerts = () => {
  return useQuery({
    queryKey: ['alerts'],
    queryFn: async () => {
      const { data } = await axios.get<AlertItem[]>(`${API_BASE}/alerts`)
      return data
    },
    refetchInterval: 10_000,
  })
}

export const useCameras = () => {
  return useQuery({
    queryKey: ['cameras'],
    queryFn: async () => {
      const { data } = await axios.get<CameraDevice[]>(`${API_BASE}/cameras`)
      return data
    },
    refetchInterval: 20_000,
  })
}
