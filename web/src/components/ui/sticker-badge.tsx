import React from 'react'

// Badge component - normal rounded bubbles
interface StickerBadgeProps {
  children: React.ReactNode
  className?: string
  variant?: 'price' | 'status' | 'new'
}

export function StickerBadge({ children, className = '', variant = 'price' }: StickerBadgeProps) {
  const variantStyles = {
    price: 'bg-accent text-accent-foreground',
    status: 'bg-secondary text-secondary-foreground',
    new: 'bg-primary text-primary-foreground'
  }

  return (
    <span
      className={`inline-block px-3 py-1 rounded-full border-2 border-foreground font-bold ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  )
}

