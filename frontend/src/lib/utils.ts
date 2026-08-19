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
