import { useState, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card'
import { StickerBadge } from '@/shared/components/ui/sticker-badge'
import { Button } from '@/shared/components/ui/button'
import { Link } from 'react-router-dom'
import { apiClient, type Listing } from '@/features/marketplace/api/api'
import { Search, Calendar, XCircle, MapPin, Eye } from 'lucide-react'
import { type SearchFilters as SearchFiltersType } from '@/features/marketplace/components/SearchFilters'
import TwoTierNavbar from '@/shared/components/TwoTierNavbar'
import { useSearchParams } from 'react-router-dom'
import { useListingsView } from '@/shared/contexts/ListingsViewContext'
import { ListingDetailModal } from '@/shared/components/ui/listing-detail-modal'
import { useUser } from '@/shared/contexts/UserContext'
import { formatPrice, formatDate } from '@/shared/lib/utils/utils'
import { getDistanceText, requestLocationOnInteraction, type Location } from '@/shared/lib/utils/locationUtils'

// Home Page - displays listings with search and filter capabilities
// Main landing page where users can browse available items for sale
export default function HomePage() {
  const [searchParams] = useSearchParams()
  const { view: listingsView } = useListingsView()
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
                         searchFilters.condition.length > 0 || searchFilters.minPrice ||
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
            <div className={listingsView === 'compact'
              ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2'
              : 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
            }>
              {listings.map((listing) => (
                <HomeListingCard key={listing.id} listing={listing} compact={listingsView === 'compact'} />
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
function HomeListingCard({ listing, compact = false }: { listing: Listing; compact?: boolean }) {
  const queryClient = useQueryClient()
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const { user } = useUser()

  // Get the current user's ID from context
  const currentUserId = user?.id

  // Get user location for distance calculation
  useEffect(() => {
    if (userLocation) return

    const cleanup = requestLocationOnInteraction((location: Location) => {
      setUserLocation(location)
    })

    return cleanup
  }, [userLocation])

  // Calculate distance
  const distanceText = userLocation && listing.latitude != null && listing.longitude != null
    ? getDistanceText(
        userLocation,
        { lat: listing.latitude, lng: listing.longitude }
      )
    : null

  const handleUpdateStatus = async (newStatus: 'ACTIVE' | 'ON_HOLD' | 'SOLD') => {
    try {
      await apiClient.updateListing(listing.id, {
        ...listing,
        status: newStatus,
      })
      // Refetch the listings by invalidating the query cache
      queryClient.invalidateQueries({ queryKey: ['listings'] })
    } catch (error) {
      console.error('Failed to update listing status:', error)
      throw error
    }
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
        className={`transition-colors hover:border-primary/50 relative overflow-hidden h-full flex flex-col cursor-pointer ${compact ? 'text-sm' : ''}`}
        onClick={() => setIsDetailModalOpen(true)}
      >
        {/* Image Section */}
        <div
          className={`w-full overflow-hidden rounded-t-lg cursor-pointer hover:opacity-90 transition-opacity bg-secondary/50 flex items-center justify-center flex-shrink-0 relative ${compact ? 'h-28' : 'h-40'}`}
          onClick={(e) => {
            e.stopPropagation()
            if (listing.imageUrl) setIsImageModalOpen(true)
          }}
        >
          {listing.imageUrl ? (
            <img src={listing.imageUrl} alt={listing.title} className="w-full h-full object-cover" />
          ) : (
            <Eye className={compact ? 'h-8 w-8' : 'h-12 w-12'} />
          )}
          {listing.mustGoBy && new Date(listing.mustGoBy) > new Date() && (
            <div className="absolute top-1 left-1 z-10">
              <StickerBadge variant="new" className={compact ? 'text-[10px] px-1.5 py-0' : ''}>MUST GO</StickerBadge>
            </div>
          )}
        </div>

        <CardHeader className={`flex-shrink-0 ${compact ? 'p-2 pb-1' : 'pb-2'}`}>
          <div className="flex justify-between items-start gap-1">
            <CardTitle className={`line-clamp-2 flex-1 ${compact ? 'text-xs font-semibold' : 'text-base font-bold'}`}>{listing.title}</CardTitle>
            <StickerBadge variant="status" statusType={listing.status} className={`shrink-0 ${compact ? 'text-[10px] px-1.5 py-0' : 'text-xs px-2 py-1'}`}>
              {listing.status === 'ACTIVE' ? 'ACTIVE' : listing.status === 'ON_HOLD' ? 'ON HOLD' : 'SOLD'}
            </StickerBadge>
          </div>
          {!compact && (
            <CardDescription className="line-clamp-2 mt-1 text-sm">
              {listing.description || 'No description provided'}
            </CardDescription>
          )}
        </CardHeader>

        <CardContent className={`pt-0 flex-1 flex flex-col justify-between ${compact ? 'p-2 pt-0' : ''}`}>
          <div className={compact ? 'space-y-1' : 'space-y-2'}>
            <div className="flex items-center justify-center">
              <StickerBadge variant="price" className={compact ? 'text-sm px-2 py-0.5' : 'text-lg px-3 py-1'}>
                {formatPrice(listing.price)}
              </StickerBadge>
            </div>
            {distanceText && (
              <div className="flex items-center justify-center gap-1 text-primary font-medium text-xs">
                <MapPin className={compact ? 'h-3 w-3' : 'h-4 w-4'} />
                <span>{distanceText}</span>
              </div>
            )}
            <div className={`flex items-center justify-center text-muted-foreground ${compact ? 'text-[10px]' : 'text-xs'}`}>
              <Calendar className={compact ? 'h-2.5 w-2.5' : 'h-3 w-3'} />
              <span className="ml-0.5">{formatDate(listing.createdAt, false)}</span>
            </div>
            {!compact && (
              <div className="flex flex-wrap gap-1.5 justify-center text-xs">
                {listing.category && (
                  <span className="px-2 py-0.5 rounded-md bg-secondary border border-border font-medium text-foreground">
                    {listing.category}
                  </span>
                )}
                {listing.condition && (
                  <span className="px-2 py-0.5 rounded-md bg-muted border border-border font-medium text-foreground">
                    {listing.condition}
                  </span>
                )}
              </div>
            )}
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
        className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm"
        onClick={() => setIsImageModalOpen(false)}
      >
        <div className="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center p-4">
          <button
            onClick={() => setIsImageModalOpen(false)}
            className="absolute top-4 right-4 z-10 bg-card border border-border hover:bg-secondary rounded-lg p-2 transition-colors text-foreground"
            aria-label="Close image"
          >
            <XCircle className="h-6 w-6" />
          </button>
          <img
            src={listing.imageUrl}
            alt={listing.title}
            className="max-w-full max-h-full object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
          <div className="absolute bottom-4 left-4 right-4 bg-card/90 border border-border text-foreground rounded-lg p-3 backdrop-blur-sm">
            <h3 className="font-semibold text-lg mb-1">{listing.title}</h3>
            <p className="text-sm text-muted-foreground">
              {formatPrice(listing.price)} • {listing.category || 'Uncategorized'}
            </p>
          </div>
        </div>
      </div>
    )}
  </>
  )
}
