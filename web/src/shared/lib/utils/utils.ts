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
