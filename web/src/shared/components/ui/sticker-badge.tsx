import React from 'react'
import { cn } from '@/shared/lib/utils/utils'

// Status colors: Active = green, On Hold = orange, Sold = red
const statusStyles: Record<string, string> = {
  ACTIVE: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-500/40',
  ON_HOLD: 'bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/40',
  SOLD: 'bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/40',
}

interface StickerBadgeProps {
  children: React.ReactNode
  className?: string
  variant?: 'price' | 'status' | 'new'
  /** When variant is "status", use this for green/orange/red styling */
  statusType?: 'ACTIVE' | 'ON_HOLD' | 'SOLD'
}

export function StickerBadge({ children, className = '', variant = 'price', statusType }: StickerBadgeProps) {
  const variantStyles: Record<string, string> = {
    price: 'bg-primary/20 text-primary border-border',
    status: statusType ? statusStyles[statusType] ?? 'bg-secondary text-secondary-foreground border-border' : 'bg-secondary text-secondary-foreground border-border',
    new: 'bg-primary text-primary-foreground border-border',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border',
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  )
}

