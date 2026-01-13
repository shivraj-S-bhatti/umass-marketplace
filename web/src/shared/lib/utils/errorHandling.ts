// Error handling utilities
// Centralized error handling patterns and utilities

export interface ApiError {
  message: string
  status?: number
  statusText?: string
  details?: unknown
}

/**
 * Extract error message from various error types
 * Handles Error objects, API errors, and string errors
 * @param error - Error of unknown type
 * @returns Human-readable error message
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }

  if (typeof error === 'string') {
    return error
  }

  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error
  ) {
    return String((error as { message: unknown }).message)
  }

  return 'An unexpected error occurred'
}

/**
 * Extract API error details from fetch response
 * @param response - Fetch Response object
 * @returns Promise that resolves to error message
 */
export async function extractApiError(response: Response): Promise<string> {
  let errorMessage = `API Error: ${response.status} ${response.statusText}`

  try {
    const errorData = await response.json()
    if (errorData.message) {
      errorMessage = errorData.message
    } else if (errorData.error) {
      errorMessage = errorData.error
    } else if (typeof errorData === 'string') {
      errorMessage = errorData
    }
  } catch {
    // If response is not JSON, use default error message
  }

  return errorMessage
}

/**
 * Create a standardized error object from various error sources
 * @param error - Error of unknown type
 * @param response - Optional fetch Response object
 * @returns Standardized error object
 */
export async function createApiError(
  error: unknown,
  response?: Response
): Promise<ApiError> {
  if (response) {
    const message = await extractApiError(response)
    return {
      message,
      status: response.status,
      statusText: response.statusText,
    }
  }

  return {
    message: getErrorMessage(error),
    details: error,
  }
}

/**
 * Check if error is a network error
 * @param error - Error to check
 * @returns True if error appears to be a network error
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.message.includes('fetch') ||
      error.message.includes('network') ||
      error.message.includes('Failed to fetch')
    )
  }
  return false
}

/**
 * Check if error is an authentication error
 * @param error - Error to check
 * @returns True if error appears to be an authentication error
 */
export function isAuthError(error: unknown): boolean {
  if (
    typeof error === 'object' &&
    error !== null &&
    'status' in error
  ) {
    const status = (error as { status: unknown }).status
    return status === 401 || status === 403
  }

  if (error instanceof Error) {
    return (
      error.message.includes('401') ||
      error.message.includes('403') ||
      error.message.includes('Unauthorized') ||
      error.message.includes('Forbidden')
    )
  }

  return false
}
