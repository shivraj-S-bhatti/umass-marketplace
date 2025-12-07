import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StickerBadge } from '@/components/ui/sticker-badge'
import { Calendar, Image as ImageIcon, MapPin, Navigation } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { apiClient, type Listing } from '@/lib/api'
import * as turf from '@turf/turf'
import LocationMapPopup from '@/components/LocationMapPopup'

interface ListingCardProps {
  listing: Listing
  showEditButtons?: boolean
}

export default function ListingCard({ listing, showEditButtons = false }: ListingCardProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { toast } = useToast()
  
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)
  const [mapOpen, setMapOpen] = useState(false)

  useEffect(() => {
    if (userLocation) return;

    const requestLocation = () => {
      if (!navigator.geolocation) return;
      
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserLocation(loc);
        },
        (err) => {
          console.log("Location denied:", err.message);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    };

    requestLocation();

    const handleFirstClick = () => {
      requestLocation();
      document.removeEventListener("click", handleFirstClick);
    };
    document.addEventListener("click", handleFirstClick);

    return () => document.removeEventListener("click", handleFirstClick);
  }, []);

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

  const handleEdit = () => {
    navigate(`/edit/${listing.id}`)
  }

  const handleStatusUpdate = async (newStatus: string) => {
    try {
      const actionMap: Record<string, string> = {
        'ACTIVE': 'Reactivating',
        'ON_HOLD': 'Putting on hold',
        'SOLD': 'Marking as sold'
      }

      toast({
        title: `${actionMap[newStatus]} listing...`,
        description: 'Please wait while we update the listing status.',
      })
      
      await apiClient.updateListing(listing.id, {
        ...listing,
        status: newStatus as 'ACTIVE' | 'ON_HOLD' | 'SOLD'
      })

      await queryClient.invalidateQueries({ queryKey: ['listings'] })
      await queryClient.invalidateQueries({ queryKey: ['listings-stats'] })
      
      toast({
        title: 'Success!',
        description: `Listing has been ${newStatus === 'ACTIVE' ? 'reactivated' : newStatus === 'ON_HOLD' ? 'put on hold' : 'marked as sold'}.`,
        variant: 'default',
      })
    } catch (error) {
      console.error('Failed to update listing status:', error)
      toast({
        title: 'Error',
        description: 'Failed to update listing status. Please try again.',
        variant: 'destructive',
      })
    }
  }

  return (
    <>
      <Card className="hover:shadow-lg transition-all hover:scale-[1.01] relative overflow-hidden h-full flex flex-col">
        <div
          className="w-full h-32 sm:h-36 md:h-40 overflow-hidden rounded-t-lg cursor-pointer hover:opacity-90 transition-opacity bg-muted flex items-center justify-center flex-shrink-0"
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

            <div className="flex items-center justify-between text-xs">
              <StickerBadge variant={listing.status === 'ACTIVE' ? 'status' : 'new'}>
                {listing.status === 'ACTIVE' ? 'ACTIVE' : listing.status === 'ON_HOLD' ? 'ON HOLD' : 'SOLD'}
              </StickerBadge>
              <div className="flex items-center text-muted-foreground">
                <Calendar className="h-3 w-3 mr-1" />
                <span>{formatDate(listing.createdAt)}</span>
              </div>
            </div>

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

          <div className="mt-3">
            {listing.latitude && listing.longitude ? (
              <Button variant="default" className="w-full" onClick={() => setMapOpen(true)}>
                <Navigation className="h-4 w-4 mr-2" />
                Show on Map
              </Button>
            ) : showEditButtons ? (
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={handleEdit}>
                  Edit
                </Button>
                {listing.status === 'ACTIVE' ? (
                   <>
                    <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => handleStatusUpdate('ON_HOLD')}>
                      Hold
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => handleStatusUpdate('SOLD')}>
                      Sold
                    </Button>
                   </>
                ) : (
                  <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => handleStatusUpdate('ACTIVE')}>
                    Reactivate
                  </Button>
                )}
              </div>
            ) : (
              <Button variant="outline" className="w-full" disabled>
                Location hidden
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {isImageModalOpen && listing.imageUrl && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setIsImageModalOpen(false)}
        >
          <div className="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center p-4">
            <button
              onClick={() => setIsImageModalOpen(false)}
              className="absolute top-4 right-4 z-10 bg-white hover:bg-gray-100 rounded-full p-2 transition-colors"
              aria-label="Close image"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <img
              src={listing.imageUrl}
              alt={listing.title}
              className="max-w-full max-h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />

            <div className="absolute bottom-4 left-4 right-4 bg-black/60 text-white rounded-lg p-3 backdrop-blur-sm">
              <h3 className="font-semibold text-lg mb-1">{listing.title}</h3>
              <p className="text-sm text-gray-300">
                {formatPrice(listing.price)} • {listing.category || 'Uncategorized'}
              </p>
            </div>
          </div>
        </div>
      )}

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
