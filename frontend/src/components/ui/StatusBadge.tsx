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

export function StatusBadge({ status, pulse, className, size, ...props }: StatusBadgeProps) {
  const { label, className: statusClassName } = statusMap[status] || statusMap.offline

  return (
    <Badge
      size={size}
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
