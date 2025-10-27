import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { apiClient, type Listing } from '@/lib/api'
import { Search, DollarSign, Calendar } from 'lucide-react'
import SearchFilters, { type SearchFilters as SearchFiltersType } from '@/components/SearchFilters'

// Home Page - displays marketplace listings with search and filter capabilities
// Main landing page where users can browse available items for sale
export default function HomePage() {
  const [searchFilters, setSearchFilters] = useState<SearchFiltersType>({
    query: '',
    category: '',
    condition: [],
    minPrice: undefined,
    maxPrice: undefined,
    status: '',
  })
  const [currentPage, setCurrentPage] = useState(0)
  const pageSize = 12

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
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">UMass Marketplace</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Buy and sell items with fellow students
          </p>
        </div>
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
        <h1 className="text-4xl font-bold mb-4">UMass Marketplace</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Buy and sell items with fellow students
        </p>
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
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">UMass Marketplace</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Buy and sell items with fellow students
        </p>
      </div>

      {/* Search Filters */}
      <SearchFilters onSearch={handleSearch} isLoading={isLoading} initialFilters={searchFilters} />

      {/* Results Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">
            {hasActiveSearch ? 'Search Results' : 'Recent Listings'}
          </h2>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
            
            {/* Pagination Controls */}
            {listingsData && listingsData.totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2 mt-8">
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
  )
}

// Individual listing card component
function ListingCard({ listing }: { listing: Listing }) {
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)

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
  React.useEffect(() => {
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
      <Card className="hover:shadow-lg transition-shadow">
        {listing.imageUrl && (
          <div 
            className="w-full h-48 overflow-hidden rounded-t-lg cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => listing.imageUrl && setIsImageModalOpen(true)}
          >
            <img
              src={listing.imageUrl}
              alt={listing.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg line-clamp-2">{listing.title}</CardTitle>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            listing.status === 'ACTIVE' 
              ? 'bg-green-100 text-green-800' 
              : listing.status === 'ON_HOLD'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-gray-100 text-gray-800'
          }`}>
            {listing.status}
          </span>
        </div>
        <CardDescription className="line-clamp-2">
          {listing.description || 'No description provided'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center text-2xl font-bold text-primary">
            <DollarSign className="h-5 w-5 mr-1" />
            {formatPrice(listing.price)}
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 mr-1" />
            {formatDate(listing.createdAt)}
          </div>
          {listing.category && (
            <div className="text-sm">
              <span className="font-medium">Category:</span> {listing.category}
            </div>
          )}
          {listing.condition && (
            <div className="text-sm">
              <span className="font-medium">Condition:</span> {listing.condition}
            </div>
          )}
        </div>
      </CardContent>
    </Card>

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
