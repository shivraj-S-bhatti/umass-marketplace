import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a price as USD currency
 * @param price - Price as number or string (will be parsed if string)
 * @returns Formatted price string (e.g., "$1,299.99")
 */
export function formatPrice(price: number | string): string {
  const numPrice = typeof price === 'string' ? parseFloat(price.replace(/[^0-9.-]/g, '')) : price
  if (isNaN(numPrice)) {
    return '$0.00'
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(numPrice)
}

/**
 * Format a date string
 * @param dateString - ISO date string
 * @param includeYear - Whether to include year in the format (default: true)
 * @returns Formatted date string (e.g., "Jan 15, 2024" or "Jan 15")
 */
export function formatDate(dateString: string, includeYear: boolean = true): string {
  const options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
  }
  if (includeYear) {
    options.year = 'numeric'
  }
  return new Date(dateString).toLocaleDateString('en-US', options)
}

/**
 * Relative time string (e.g. "Posted 2d ago")
 * @param dateString - ISO date string
 * @param prefix - Optional prefix, e.g. "Posted "
 * @returns e.g. "Posted 2d ago", "Posted 1h ago", "Posted just now"
 */
export function timeAgo(dateString: string, prefix: string = 'Posted '): string {
  const date = new Date(dateString)
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  if (seconds < 60) return `${prefix}just now`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${prefix}${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${prefix}${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${prefix}${days}d ago`
  const months = Math.floor(days / 30)
  if (months < 12) return `${prefix}${months}mo ago`
  const years = Math.floor(months / 12)
  return `${prefix}${years}y ago`
}

/**
 * Slugify a name for use in share URLs (e.g. "Amanda Smith" -> "amanda-smith").
 * Lowercase, replace spaces with -, strip non-alphanumeric/hyphen.
 * @param name - Display name
 * @param fallback - Used when name is empty (default "listings")
 */
export function slugifyName(name: string | null | undefined, fallback: string = 'listings'): string {
  if (!name || typeof name !== 'string') return fallback
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
  return slug || fallback
}
