// Image handling utilities
// Centralized functions for image validation, compression, and conversion
import { compressImage } from './imageCompression'

export interface ImageValidationResult {
  valid: boolean
  error?: string
}

/**
 * Validate image file type
 * @param file - File to validate
 * @returns Validation result with error message if invalid
 */
export function validateImageType(file: File): ImageValidationResult {
  if (!file.type.startsWith('image/')) {
    return {
      valid: false,
      error: 'Please select an image file.',
    }
  }
  return { valid: true }
}

/**
 * Validate image file size
 * @param file - File to validate
 * @param maxSizeMB - Maximum size in MB (default: 5MB)
 * @returns Validation result with error message if invalid
 */
export function validateImageSize(
  file: File,
  maxSizeMB: number = 5
): ImageValidationResult {
  const maxSizeBytes = maxSizeMB * 1024 * 1024
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `Image must be less than ${maxSizeMB}MB.`,
    }
  }
  return { valid: true }
}

/**
 * Validate image file (type and size)
 * @param file - File to validate
 * @param maxSizeMB - Maximum size in MB (default: 5MB)
 * @returns Validation result with error message if invalid
 */
export function validateImage(
  file: File,
  maxSizeMB: number = 5
): ImageValidationResult {
  const typeValidation = validateImageType(file)
  if (!typeValidation.valid) {
    return typeValidation
  }

  const sizeValidation = validateImageSize(file, maxSizeMB)
  if (!sizeValidation.valid) {
    return sizeValidation
  }

  return { valid: true }
}

/**
 * Convert file to base64 data URL
 * @param file - File to convert
 * @returns Promise that resolves to base64 data URL string
 */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result)
      } else {
        reject(new Error('Failed to read file as data URL'))
      }
    }
    reader.onerror = () => {
      reject(new Error('Error reading file'))
    }
    reader.readAsDataURL(file)
  })
}

/**
 * Process image: validate, convert to base64, and compress
 * @param file - Image file to process
 * @param maxSizeMB - Maximum file size in MB (default: 5MB)
 * @param compressionTargetKB - Target compressed size in KB (default: 400KB)
 * @returns Promise that resolves to compressed base64 string
 * @throws Error if validation fails
 */
export async function processImage(
  file: File,
  maxSizeMB: number = 5,
  compressionTargetKB: number = 400
): Promise<string> {
  // Validate image
  const validation = validateImage(file, maxSizeMB)
  if (!validation.valid) {
    throw new Error(validation.error || 'Image validation failed')
  }

  // Convert to base64
  const base64String = await fileToDataUrl(file)

  // Compress image
  const compressedBase64 = await compressImage(base64String, compressionTargetKB)

  return compressedBase64
}

/**
 * Calculate approximate size of base64 string in KB
 * @param base64String - Base64 encoded string
 * @returns Size in KB
 */
export function getBase64SizeKB(base64String: string): number {
  // Base64 is approximately 33% larger than binary
  return (base64String.length * 0.75) / 1024
}
