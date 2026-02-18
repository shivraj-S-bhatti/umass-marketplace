import { useState, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Link } from 'react-router-dom'
import { apiClient, type Listing } from '@/features/marketplace/api/api'
import { Search } from 'lucide-react'
import { type SearchFilters as SearchFiltersType } from '@/features/marketplace/components/SearchFilters'
import TwoTierNavbar from '@/shared/components/TwoTierNavbar'
import { useSearchParams } from 'react-router-dom'
import { useListingsView } from '@/shared/contexts/ListingsViewContext'
import { ListingDetailModal } from '@/shared/components/ui/listing-detail-modal'
import { ListingCard } from '@/shared/components/ListingCard'
import { useUser } from '@/shared/contexts/UserContext'
import { useCart } from '@/shared/contexts/CartContext'
import { useToast } from '@/shared/hooks/use-toast'

// Home Page - displays listings with search and filter capabilities
// Main landing page where users can browse available items for sale
export default function HomePage() {
  const [searchParams] = useSearchParams()
  const { view: listingsView } = useListingsView()
  const queryClient = useQueryClient()
  const { user } = useUser()
  const { addToCart } = useCart()
  const { toast } = useToast()
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null)
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
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  compact={listingsView === 'compact'}
                  onViewListing={(item) => setSelectedListing(item as Listing)}
                  onAddToShoppingList={user ? (item) => { addToCart(item as Listing); toast({ title: 'Added to Saved Items', description: `${item.title} has been added.` }) } : undefined}
                />
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

          <ListingDetailModal
            listing={selectedListing}
            isOpen={selectedListing !== null}
            onClose={() => setSelectedListing(null)}
            isCurrentUserSeller={user?.id === selectedListing?.sellerId}
            onUpdateStatus={
              user?.id === selectedListing?.sellerId && selectedListing
                ? async (newStatus) => {
                    if (!selectedListing) return
                    await apiClient.updateListing(selectedListing.id, { ...selectedListing, status: newStatus })
                    queryClient.invalidateQueries({ queryKey: ['listings'] })
                    setSelectedListing(null)
                  }
                : undefined
            }
          />
          </div>
        </div>
    </div>
  )
}

