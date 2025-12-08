import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { StickerBadge } from '@/components/ui/sticker-badge'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { apiClient, type Listing } from '@/lib/api'
import { Search, Calendar, XCircle, MapPin, Eye } from 'lucide-react'
import { type SearchFilters as SearchFiltersType } from '@/components/SearchFilters'
import TwoTierNavbar from '@/components/TwoTierNavbar'
import { useSearchParams } from 'react-router-dom'
import { ListingDetailModal } from '@/components/ui/listing-detail-modal'
import * as turf from '@turf/turf'
import { useUser } from '@/contexts/UserContext'

// Home Page - displays listings with search and filter capabilities
// Main landing page where users can browse available items for sale
export default function HomePage() {
  const [searchParams] = useSearchParams()
  const [searchFilters, setSearchFilters] = useState<SearchFiltersType>({
    query: '',
    category: searchParams.get('category') || '',
    condition: [],
    minPrice: undefined,
    maxPrice: undefined,
    status: '',
  })
  const [currentPage, setCurrentPage] = useState(0)
  const pageSize = 12

  // Sync category from URL params
  useEffect(() => {
    const category = searchParams.get('category') || ''
    if (category !== searchFilters.category) {
      const newFilters = { ...searchFilters, category }
      setSearchFilters(newFilters)
      handleSearch(newFilters)
    }
  }, [searchParams.get('category')])

  const { data: listingsData, isLoading, error } = useQuery({
    queryKey: ['listings', searchFilters, currentPage],
    queryFn: () => apiClient.getListings({
      page: currentPage,
      size: pageSize,
      q: searchFilters.query || undefined,
      category: searchFilters.category || undefined,
      condition: searchFilters.condition.length > 0 ? searchFilters.condition.join(',') : undefined,
      minPrice: searchFilters.minPrice,
      maxPrice: searchFilters.maxPrice,
      status: searchFilters.status || undefined,
    }),
  })

  const handleSearch = (filters: SearchFiltersType) => {
    setSearchFilters(filters)
    setCurrentPage(0) // Reset to first page when filters change
  }

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-3 bg-muted rounded w-full mb-2"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 max-w-md mx-auto">
          <p className="text-destructive">Failed to load listings. Please try again later.</p>
        </div>
      </div>
    )
  }

  const listings = listingsData?.content || []
  const hasActiveSearch = searchFilters.query || searchFilters.category || 
                         searchFilters.condition || searchFilters.minPrice || 
                         searchFilters.maxPrice || searchFilters.status

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
        {/* 2-Tier Navbar */}
        <TwoTierNavbar 
          onSearch={handleSearch} 
          initialFilters={searchFilters}
          isLoading={isLoading}
        />

        {/* Content */}
        <div className="flex-1 container mx-auto px-4 py-4 min-h-0">
          <div className="space-y-4 pb-4">
            {/* Results Section */}
            <div>
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                {searchFilters.category && (
                  <span className="text-sm font-bold text-primary">
                    {searchFilters.category}
                  </span>
                )}
                {listingsData && (
                  <div className="text-sm text-muted-foreground">
                    <p>
                      {listingsData.totalElements} item{listingsData.totalElements !== 1 ? 's' : ''} found
                      {listingsData.totalPages > 1 && (
                        <span className="ml-2">
                          (Page {currentPage + 1} of {listingsData.totalPages})
                        </span>
                      )}
                    </p>
                  </div>
                )}
              </div>
            </div>
        
        {listings.length === 0 ? (
          <div className="text-center py-12">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {hasActiveSearch ? 'No items found' : 'No listings available yet'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {hasActiveSearch 
                ? 'Try adjusting your search criteria or browse all listings'
                : 'Be the first to list an item for sale'
              }
            </p>
            {hasActiveSearch ? (
              <Button variant="outline" onClick={() => {
                handleSearch({
                  query: '',
                  category: '',
                  condition: [],
                  minPrice: undefined,
                  maxPrice: undefined,
                  status: '',
                })
                setCurrentPage(0)
              }}>
                View All Listings
              </Button>
            ) : (
              <Button asChild>
                <Link to="/sell">List Your First Item</Link>
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {listings.map((listing) => (
                <HomeListingCard key={listing.id} listing={listing} />
              ))}
            </div>
            
            {/* Pagination Controls */}
            {listingsData && listingsData.totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2 mt-4">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(0)}
                  disabled={currentPage === 0}
                >
                  First
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 0}
                >
                  Previous
                </Button>
                
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, listingsData.totalPages) }, (_, i) => {
                    let pageNum;
                    if (listingsData.totalPages <= 5) {
                      pageNum = i;
                    } else if (currentPage < 3) {
                      pageNum = i;
                    } else if (currentPage >= listingsData.totalPages - 3) {
                      pageNum = listingsData.totalPages - 5 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        onClick={() => setCurrentPage(pageNum)}
                        className="w-10 h-10"
                      >
                        {pageNum + 1}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === listingsData.totalPages - 1}
                >
                  Next
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(listingsData.totalPages - 1)}
                  disabled={currentPage === listingsData.totalPages - 1}
                >
                  Last
                </Button>
              </div>
            )}
          </>
        )}
          </div>
        </div>
    </div>
  )
}

// Individual listing card component
function HomeListingCard({ listing }: { listing: Listing }) {
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const { user } = useUser()

  // Get the current user's ID from context
  const currentUserId = user?.id

  // Get user location for distance calculation
  useEffect(() => {
    if (userLocation) return;

    const requestLocation = () => {
      if (!navigator.geolocation) return;
      
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserLocation(loc);
        },
        () => {
          // Silently handle location denial
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

  // Calculate distance
  const distanceText = userLocation && listing.latitude != null && listing.longitude != null
    ? (() => {
        try {
          const dist = turf.distance(
            [userLocation.lng, userLocation.lat], 
            [listing.longitude!, listing.latitude!], 
            { units: "kilometers" }
          );
          return dist < 1
            ? `${Math.round(dist * 1000)} m away`
            : `${dist.toFixed(1)} km away`;
        } catch (error) {
          console.error("Error calculating distance", error);
          return null;
        }
      })()
    : null;

  const handleUpdateStatus = async (newStatus: 'ACTIVE' | 'ON_HOLD' | 'SOLD') => {
    try {
      setIsUpdating(true)
      await apiClient.updateListing(listing.id, {
        ...listing,
        status: newStatus,
      })
      // Refetch the listings by invalidating the query cache
      window.location.reload() // This is a temporary solution - ideally we'd use React Query's invalidation
    } catch (error) {
      console.error('Failed to update listing status:', error)
      throw error
    } finally {
      setIsUpdating(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
  }

  // Handle Escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isImageModalOpen) {
        setIsImageModalOpen(false)
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isImageModalOpen])

  return (
    <>
      <Card 
        className="hover:shadow-comic transition-all hover:scale-[1.01] relative overflow-hidden h-full flex flex-col"
        onClick={() => setIsDetailModalOpen(true)}
      >
        {/* Image Section - Always show, with default Eye icon if no image */}
        <div 
          className="w-full h-40 overflow-hidden rounded-t-comic cursor-pointer hover:opacity-90 transition-opacity bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center flex-shrink-0 relative"
          onClick={(e) => {
            e.stopPropagation();
            if (listing.imageUrl) {
              setIsImageModalOpen(true);
            }
          }}
        >
          {listing.imageUrl ? (
            <img
              src={listing.imageUrl}
              alt={listing.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <Eye className="h-12 w-12 text-primary/40" />
          )}
          {/* Must Go By Badge on Image */}
          {listing.mustGoBy && new Date(listing.mustGoBy) > new Date() && (
            <div className="absolute top-2 left-2 z-10">
              <StickerBadge variant="new" className="bg-red-500 text-white text-xs px-2 py-1 border-2 border-white shadow-lg">
                MUST GO
              </StickerBadge>
            </div>
          )}
        </div>

        <CardHeader className="pb-2 flex-shrink-0">
          <div className="flex justify-between items-start gap-2">
            <CardTitle className="text-base font-bold line-clamp-2 flex-1">{listing.title}</CardTitle>
            <StickerBadge variant={listing.status === 'ACTIVE' ? 'status' : 'new'} className="shrink-0 text-xs px-2 py-1">
              {listing.status === 'ACTIVE' ? 'ACTIVE' : listing.status === 'ON_HOLD' ? 'ON HOLD' : 'SOLD'}
            </StickerBadge>
          </div>
          <CardDescription className="line-clamp-2 mt-1 text-sm">
            {listing.description || 'No description provided'}
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-0 flex-1 flex flex-col justify-between">
          <div className="space-y-2">
            {/* Price - Centered */}
            <div className="flex items-center justify-center">
              <StickerBadge variant="price" className="text-lg px-3 py-1">
                {formatPrice(listing.price)}
              </StickerBadge>
            </div>

            {/* Distance - Centered below price */}
            {distanceText && (
              <div className="flex items-center justify-center gap-1 text-green-600 font-semibold text-xs">
                <MapPin className="h-4 w-4" />
                <span>{distanceText}</span>
              </div>
            )}

            {/* Date - Centered */}
            <div className="flex items-center justify-center text-xs text-muted-foreground">
              <Calendar className="h-3 w-3 mr-1" />
              <span>{formatDate(listing.createdAt)}</span>
            </div>

            {/* Category and Condition as Bubbles - Centered */}
            <div className="flex flex-wrap gap-1.5 justify-center text-xs">
              {listing.category && (
                <span className="px-2 py-0.5 rounded-comic bg-secondary border border-foreground font-medium">
                  {listing.category}
                </span>
              )}
              {listing.condition && (
                <span className="px-2 py-0.5 rounded-comic bg-muted border border-foreground font-medium">
                  {listing.condition}
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

    {/* Details Modal */}
    <ListingDetailModal
      listing={listing}
      isOpen={isDetailModalOpen}
      onClose={() => setIsDetailModalOpen(false)}
      isCurrentUserSeller={currentUserId === listing.sellerId}
      onUpdateStatus={handleUpdateStatus}
    />

    {/* Image Modal */}
    {isImageModalOpen && listing.imageUrl && (
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
        onClick={() => setIsImageModalOpen(false)}
      >
        <div className="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center p-4">
          {/* Close button */}
          <button
            onClick={() => setIsImageModalOpen(false)}
            className="absolute top-4 right-4 z-10 bg-white hover:bg-gray-100 rounded-full p-2 transition-colors"
            aria-label="Close image"
          >
            <XCircle className="h-6 w-6" />
          </button>

          {/* Image */}
          <img
            src={listing.imageUrl}
            alt={listing.title}
            className="max-w-full max-h-full object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Image info */}
          <div className="absolute bottom-4 left-4 right-4 bg-black/60 text-white rounded-lg p-3 backdrop-blur-sm">
            <h3 className="font-semibold text-lg mb-1">{listing.title}</h3>
            <p className="text-sm text-gray-300">
              {formatPrice(listing.price)} • {listing.category || 'Uncategorized'}
            </p>
          </div>
        </div>
      </div>
    )}
  </>
  )
}
