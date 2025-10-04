import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// Utility functions for UMass Marketplace frontend
// Provides class name merging and other common utilities
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
