import React from 'react'

// Leaf decoration component - hand-drawn leaf doodles for autumn feel
interface LeafDecorationProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  color?: 'red' | 'orange' | 'yellow'
}

export function LeafDecoration({ className = '', size = 'md', color = 'orange' }: LeafDecorationProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  }

  const colorClasses = {
    red: 'text-red-600',
    orange: 'text-orange-600',
    yellow: 'text-yellow-600'
  }

  // Hand-drawn style leaf doodle
  return (
    <svg
      className={`leaf-decoration ${sizeClasses[size]} ${colorClasses[color]} ${className}`}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Hand-drawn maple leaf shape */}
      <path
        d="M12 2C10 2 8 3 7 5c-1 2-1 4 0 6 1 2 2 3 3 4 1 1 2 2 2 3v1c0 1 1 2 2 2 1 0 2-1 2-2v-1c0-1 1-2 2-3 1-1 2-2 3-4 1-2 1-4 0-6-1-2-3-3-5-3z"
        stroke="currentColor"
        strokeWidth="2"
        fill="currentColor"
        fillOpacity="0.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Leaf vein */}
      <path
        d="M12 2v8M12 10c2 1 4 2 5 4M12 10c-2 1-4 2-5 4"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        opacity="0.8"
      />
    </svg>
  )
}

