// Location and distance calculation utilities
// Shared utilities for geolocation, distance calculations, and location formatting
import * as turf from '@turf/turf'

export interface Location {
  lat: number
  lng: number
}

/**
 * Calculate distance between two coordinates
 * @param location1 - First location (lat, lng)
 * @param location2 - Second location (lat, lng)
 * @param units - Distance units ('kilometers' | 'miles' | 'meters')
 * @returns Distance in specified units, or null if calculation fails
 */
export function calculateDistance(
  location1: Location,
  location2: Location,
  units: 'kilometers' | 'miles' | 'meters' = 'kilometers'
): number | null {
  try {
    return turf.distance(
      [location1.lng, location1.lat],
      [location2.lng, location2.lat],
      { units }
    )
  } catch (error) {
    console.error('Error calculating distance:', error)
    return null
  }
}

/**
 * Format distance as human-readable string
 * @param distanceKm - Distance in kilometers
 * @returns Formatted distance string (e.g., "500 m away" or "1.2 km away")
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m away`
  }
  return `${distanceKm.toFixed(1)} km away`
}

/**
 * Calculate and format distance between two locations
 * @param location1 - First location
 * @param location2 - Second location
 * @returns Formatted distance string or null if calculation fails
 */
export function getDistanceText(
  location1: Location | null,
  location2: Location | null
): string | null {
  if (!location1 || !location2) {
    return null
  }

  const distance = calculateDistance(location1, location2)
  if (distance === null) {
    return null
  }

  return formatDistance(distance)
}

/**
 * Request user's current location
 * @param options - Geolocation options
 * @returns Promise with user location or null if denied/error
 */
export function getUserLocation(
  options: PositionOptions = { enableHighAccuracy: true, timeout: 10000 }
): Promise<Location | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        })
      },
      () => {
        // Silently handle location denial
        resolve(null)
      },
      options
    )
  })
}

/**
 * Setup location request on first user interaction
 * Useful for requesting location permission after user clicks
 * @param callback - Callback to execute when location is obtained
 * @returns Cleanup function to remove event listener
 */
export function requestLocationOnInteraction(
  callback: (location: Location) => void
): () => void {
  const handleFirstClick = () => {
    getUserLocation().then((location) => {
      if (location) {
        callback(location)
      }
    })
    document.removeEventListener('click', handleFirstClick)
  }

  document.addEventListener('click', handleFirstClick)

  return () => document.removeEventListener('click', handleFirstClick)
}
