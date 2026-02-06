import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Button } from '@/shared/components/ui/button'
import { Navigation } from 'lucide-react'

// Fix Leaflet default icon issue with Vite
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

interface LocationMapSelectorProps {
  onLocationSelect: (lat: number, lng: number) => void
  initialLat?: number | null
  initialLng?: number | null
  height?: string
}

// Component to handle map clicks
function MapClickHandler({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      try {
        const { lat, lng } = e.latlng
        if (typeof lat === 'number' && typeof lng === 'number' && !isNaN(lat) && !isNaN(lng)) {
          onLocationSelect(lat, lng)
        }
      } catch (error) {
        console.error("Error handling map click", error);
      }
    },
  })
  
  return null
}

export default function LocationMapSelector({ 
  onLocationSelect, 
  initialLat, 
  initialLng,
  height = '400px'
}: LocationMapSelectorProps) {
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(() => {
    if (initialLat != null && initialLng != null && 
        typeof initialLat === 'number' && typeof initialLng === 'number' &&
        !isNaN(initialLat) && !isNaN(initialLng)) {
      return { lat: initialLat, lng: initialLng }
    }
    return null
  })
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [isLoadingLocation, setIsLoadingLocation] = useState(false)

  // Default to UMass Amherst if no initial location
  const defaultCenter: [number, number] = [42.3868, -72.5301] // UMass Amherst coordinates
  const center: [number, number] = selectedLocation 
    ? [selectedLocation.lat, selectedLocation.lng]
    : userLocation
    ? [userLocation.lat, userLocation.lng]
    : defaultCenter

  // Ensure center is always valid numbers
  const validCenter: [number, number] = [
    typeof center[0] === 'number' && !isNaN(center[0]) && isFinite(center[0]) ? center[0] : defaultCenter[0],
    typeof center[1] === 'number' && !isNaN(center[1]) && isFinite(center[1]) ? center[1] : defaultCenter[1]
  ]

  const handleMapClick = (lat: number, lng: number) => {
    const location = { lat, lng }
    setSelectedLocation(location)
    onLocationSelect(lat, lng)
  }

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      return
    }
    setIsLoadingLocation(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }
        setUserLocation(location)
        setSelectedLocation(location)
        onLocationSelect(location.lat, location.lng)
        setIsLoadingLocation(false)
      },
      (error) => {
        console.error('Error getting location:', error)
        setIsLoadingLocation(false)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  useEffect(() => {
    if (initialLat != null && initialLng != null && 
        typeof initialLat === 'number' && typeof initialLng === 'number' &&
        !isNaN(initialLat) && !isNaN(initialLng)) {
      setSelectedLocation({ lat: initialLat, lng: initialLng })
    } else if (initialLat == null && initialLng == null) {
      // Clear selection if both are null
      setSelectedLocation(null)
    }
  }, [initialLat, initialLng])

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Click on the map to select a location, or use your current location
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={getCurrentLocation}
          disabled={isLoadingLocation}
          className="flex items-center gap-2"
        >
          <Navigation className="h-4 w-4" />
          {isLoadingLocation ? 'Getting location...' : 'Use My Location'}
        </Button>
      </div>
      <div className="border border-border rounded-lg overflow-hidden" style={{ height }}>
        {validCenter[0] != null && validCenter[1] != null && 
         typeof validCenter[0] === 'number' && typeof validCenter[1] === 'number' &&
         !isNaN(validCenter[0]) && !isNaN(validCenter[1]) ? (
          <MapContainer
            key={`map-${validCenter[0]}-${validCenter[1]}-${selectedLocation ? 'selected' : 'default'}`}
            center={validCenter}
            zoom={selectedLocation || userLocation ? 15 : 13}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={true}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
            />
            <MapClickHandler onLocationSelect={handleMapClick} />
            {/* Always show a marker - either selected location or center point */}
            {selectedLocation ? (
              <Marker position={[selectedLocation.lat, selectedLocation.lng]}>
                <Popup>
                  Selected Location
                  <br />
                  {selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}
                </Popup>
              </Marker>
            ) : (
              <Marker position={validCenter}>
                <Popup>
                  Click to select location
                  <br />
                  {validCenter[0].toFixed(4)}, {validCenter[1].toFixed(4)}
                </Popup>
              </Marker>
            )}
          </MapContainer>
        ) : (
          <div className="flex items-center justify-center h-full bg-muted">
            <p className="text-sm text-muted-foreground">Loading map...</p>
          </div>
        )}
      </div>
      {selectedLocation && (
        <p className="text-xs text-muted-foreground text-center">
          Location: {selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}
        </p>
      )}
    </div>
  )
}
