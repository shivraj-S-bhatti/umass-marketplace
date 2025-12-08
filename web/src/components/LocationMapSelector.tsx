import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Button } from '@/components/ui/button'
import { MapPin, Navigation } from 'lucide-react'

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
      const { lat, lng } = e.latlng
      onLocationSelect(lat, lng)
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
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(
    initialLat && initialLng ? { lat: initialLat, lng: initialLng } : null
  )
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [isLoadingLocation, setIsLoadingLocation] = useState(false)

  // Default to UMass Amherst if no initial location
  const defaultCenter: [number, number] = [42.3868, -72.5301] // UMass Amherst coordinates
  const center: [number, number] = selectedLocation 
    ? [selectedLocation.lat, selectedLocation.lng]
    : userLocation
    ? [userLocation.lat, userLocation.lng]
    : defaultCenter

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
    if (initialLat && initialLng) {
      setSelectedLocation({ lat: initialLat, lng: initialLng })
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
      <div className="border-2 border-foreground rounded-comic overflow-hidden" style={{ height }}>
        <MapContainer
          center={center}
          zoom={selectedLocation || userLocation ? 15 : 13}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
          />
          <MapClickHandler onLocationSelect={handleMapClick} />
          {selectedLocation && (
            <Marker position={[selectedLocation.lat, selectedLocation.lng]}>
              <L.Popup>
                Selected Location
                <br />
                {selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}
              </L.Popup>
            </Marker>
          )}
        </MapContainer>
      </div>
      {selectedLocation && (
        <p className="text-xs text-muted-foreground text-center">
          Location: {selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}
        </p>
      )}
    </div>
  )
}
