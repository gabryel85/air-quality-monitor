/**
 * SensorBadge — domain-specialized Badge.
 *
 * Communicates measurement station status. Icon + label always paired so
 * color-blind / low-contrast users get the same signal.
 */

import { AlertCircle, Wifi, WifiOff } from 'lucide-react';

import { Badge, type BadgeProps } from './Badge';

export type SensorStatus = 'online' | 'degraded' | 'offline';

const META: Record<
  SensorStatus,
  { variant: BadgeProps['variant']; icon: typeof Wifi; label: string }
> = {
  online: { variant: 'success', icon: Wifi, label: 'Online' },
  degraded: { variant: 'warning', icon: AlertCircle, label: 'Degraded' },
  offline: { variant: 'error', icon: WifiOff, label: 'Offline' },
};

export interface SensorBadgeProps {
  readonly status: SensorStatus;
  readonly label?: string;
  readonly className?: string;
}

export function SensorBadge({ status, label, className }: SensorBadgeProps) {
  const meta = META[status];
  const Icon = meta.icon;
  return (
    <Badge variant={meta.variant} className={className} leadingIcon={<Icon />}>
      {label ?? meta.label}
    </Badge>
  );
}
