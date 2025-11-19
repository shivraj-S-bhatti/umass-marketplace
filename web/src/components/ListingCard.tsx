import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StickerBadge } from '@/components/ui/sticker-badge'
import { Calendar, Image as ImageIcon, MapPin, Navigation } from 'lucide-react'
import { useState, useEffect } from 'react'
import * as turf from '@turf/turf'
import LocationMapPopup from '@/components/LocationMapPopup'
import { type Listing } from '@/lib/api'

interface ListingCardProps {
  listing: Listing
  showEditButtons?: boolean // optional: only show Edit/Sold buttons on dashboard
}

export default function ListingCard({ listing, showEditButtons = false }: ListingCardProps) {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)
  const [mapOpen, setMapOpen] = useState(false)

  // ONE-TIME location request for the entire page
  useEffect(() => {
    // Only run once — no dependencies on listing
    if (userLocation) return; // already have it

    const requestLocation = () => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          console.log("Location granted:", loc);
          setUserLocation(loc);
        },
        (err) => {
          console.log("Location denied:", err.message);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    };

    // Ask immediately — since you already allowed it once in console, it will succeed silently
    requestLocation();

    // Also allow fallback on first click if blocked
    const handleFirstClick = () => {
      requestLocation();
      document.removeEventListener("click", handleFirstClick);
    };
    document.addEventListener("click", handleFirstClick);

    return () => document.removeEventListener("click", handleFirstClick);
  }, []); // ← EMPTY array = run once when component mounts

  const distanceText = userLocation && listing.latitude && listing.longitude
    ? (() => {
        const dist = turf.distance(
          [userLocation.lng, userLocation.lat], 
          [listing.longitude, listing.latitude], 
          { units: "kilometers" }
        );
        return dist < 1
          ? `${Math.round(dist * 1000)} m away`
          : `${dist.toFixed(1)} km away`;
      })()
    : null;

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price)

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  return (
    <>
      <Card className="hover:shadow-comic transition-all hover:scale-[1.01] relative overflow-hidden h-full flex flex-col">
        {/* Image */}
        <div
          className="w-full h-32 sm:h-36 md:h-40 overflow-hidden rounded-t-comic cursor-pointer hover:opacity-90 transition-opacity bg-muted flex items-center justify-center flex-shrink-0"
          onClick={() => listing.imageUrl && setIsImageModalOpen(true)}
        >
          {listing.imageUrl ? (
            <img src={listing.imageUrl} alt={listing.title} className="w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center justify-center text-muted-foreground">
              <ImageIcon className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 mb-1 sm:mb-2 opacity-50" />
              <span className="text-xs sm:text-sm font-medium">No Image</span>
            </div>
          )}
        </div>

        <CardHeader className="pb-1.5 sm:pb-2 flex-shrink-0">
          <CardTitle className="text-sm sm:text-base font-bold line-clamp-2 leading-tight">
            {listing.title}
          </CardTitle>
          <CardDescription className="line-clamp-2 mt-0.5 sm:mt-1 text-xs sm:text-sm">
            {listing.description || 'No description provided'}
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-0 flex-1 flex flex-col justify-between">
          <div className="space-y-1.5 sm:space-y-2">
            {/* Price + Distance */}
            <div className="flex items-center justify-between gap-2">
              <StickerBadge variant="price" className="text-xs sm:text-sm md:text-base px-1.5 sm:px-2 py-0.5 sm:py-1">
                {formatPrice(listing.price)}
              </StickerBadge>

              {distanceText && (
                <div className="flex items-center gap-2 text-green-600 font-bold text-sm sm:text-base animate-fade-in">
                  <MapPin className="h-5 w-5" />
                  <span>{distanceText}</span>
                </div>
              )}
            </div>

            {/* Status + Date */}
            <div className="flex items-center justify-between text-xs">
              <StickerBadge variant={listing.status === 'ACTIVE' ? 'status' : 'new'}>
                {listing.status === 'ACTIVE' ? 'ACTIVE' : listing.status === 'ON_HOLD' ? 'ON HOLD' : 'SOLD'}
              </StickerBadge>
              <div className="flex items-center text-muted-foreground">
                <Calendar className="h-3 w-3 mr-1" />
                <span>{formatDate(listing.createdAt)}</span>
              </div>
            </div>

            {/* Category/Condition */}
            <div className="flex flex-wrap gap-1.5 text-xs">
              {listing.category && (
                <span className="px-2 py-0.5 rounded-full bg-secondary border border-foreground font-medium">
                  {listing.category}
                </span>
              )}
              {listing.condition && (
                <span className="px-2 py-0.5 rounded-full bg-muted border border-foreground font-medium">
                  {listing.condition}
                </span>
              )}
            </div>
          </div>

          {/* Action Button */}
          <div className="mt-3">
            {listing.latitude && listing.longitude ? (
              <Button variant="default" className="w-full" onClick={() => setMapOpen(true)}>
                <Navigation className="h-4 w-4 mr-2" />
                Show on Map
              </Button>
            ) : showEditButtons ? (
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1 text-xs">
                  Edit
                </Button>
                <Button size="sm" variant="outline" className="flex-1 text-xs">
                  {listing.status === 'ACTIVE' ? 'Mark Sold' : 'Reactivate'}
                </Button>
              </div>
            ) : (
              <Button variant="outline" className="w-full" disabled>
                Location hidden
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Image Modal (same as before) */}
      {isImageModalOpen && listing.imageUrl && (
        // ... (copy your existing image modal code here – I’ll give it below)
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={() => setIsImageModalOpen(false)}>
          <div className="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center p-4">
            <button type="button" onClick={() => setIsImageModalOpen(false)} className="absolute top-4 right-4 z-10 bg-white hover:bg-gray-100 rounded-full p-2" aria-label="Close image viewer">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            < img src={listing.imageUrl} alt={listing.title} className="max-w-full max-h-full object-contain rounded-lg" onClick={e => e.stopPropagation()} />
            <div className="absolute bottom-4 left-4 right-4 bg-black/60 text-white rounded-lg p-3 backdrop-blur-sm">
              <h3 className="font-semibold text-lg mb-1">{listing.title}</h3>
              <p className="text-sm text-gray-300">{formatPrice(listing.price)} • {listing.category || 'Uncategorized'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Map Popup */}
      {listing.latitude && listing.longitude && (
        <LocationMapPopup
          open={mapOpen}
          onClose={() => setMapOpen(false)}
          lat={listing.latitude}
          lng={listing.longitude}
          title={listing.title}
        />
      )}
    </>
  )
}