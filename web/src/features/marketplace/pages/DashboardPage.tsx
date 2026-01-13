import React, { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Link, useNavigate } from 'react-router-dom'
import { apiClient, type Listing } from '@/features/marketplace/api/api'
import { useToast } from '@/shared/hooks/use-toast'
import { LayoutDashboard, Plus, Calendar, Eye } from 'lucide-react'
import { formatPrice, formatDate } from '@/shared/lib/utils/utils'

// Dashboard Page - displays user's listings and statistics
// Shows seller's own listings with management options and overview stats
export default function DashboardPage() {
  const [currentPage, setCurrentPage] = useState(0)
  const pageSize = 12

  const { data: listingsData, isLoading, error } = useQuery({
    queryKey: ['listings', currentPage],
    queryFn: () => apiClient.getListings({ page: currentPage, size: pageSize }),
  })

  // Fetch stats for total counts across all listings
  const { data: stats } = useQuery({
    queryKey: ['listings-stats'],
    queryFn: () => apiClient.getListingStats(),
  })

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">My Dashboard</h1>
          <p className="text-muted-foreground">Manage your listings</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
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
        <h1 className="text-3xl font-bold mb-2">My Dashboard</h1>
        <p className="text-muted-foreground mb-8">Manage your marketplace listings</p>
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 max-w-md mx-auto">
          <p className="text-destructive">Failed to load your listings. Please try again later.</p>
        </div>
      </div>
    )
  }

  const listings = listingsData?.content || []
  // Use stats from the dedicated stats endpoint
  const activeListingsCount = stats?.activeListings || 0
  const soldListingsCount = stats?.soldListings || 0
  const onHoldListingsCount = stats?.onHoldListings || 0

  return (
    <div className="container mx-auto px-4 py-4 space-y-4">
      {/* Header */}
      <div className="text-center py-3">
        <h1 className="text-4xl md:text-5xl font-bold mb-2 tracking-tight">My Dashboard</h1>
        <p className="text-base text-muted-foreground">Manage your listings 🍂</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-bold">Active Listings</CardTitle>
            <Eye className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary mb-1">{activeListingsCount}</div>
            <p className="text-xs text-muted-foreground font-medium">
              Currently for sale
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-bold">Sold Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary mb-1">{soldListingsCount}</div>
            <p className="text-xs text-muted-foreground font-medium">
              Successfully sold
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-bold">On Hold</CardTitle>
            <Calendar className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary mb-1">{onHoldListingsCount}</div>
            <p className="text-xs text-muted-foreground font-medium">
              Temporarily unavailable
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button asChild>
          <Link to="/sell">
            <Plus className="h-4 w-4 mr-2" />
            Create New Listing
          </Link>
        </Button>
      </div>

      {/* My Listings */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-2xl font-bold">My Listings</h2>
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
          <Card>
            <CardContent className="text-center py-12">
              <LayoutDashboard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No listings yet</h3>
              <p className="text-muted-foreground mb-4">
                Start selling by creating your first listing
              </p>
              <Button asChild>
                <Link to="/sell">Create Your First Listing</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {listings.map((listing) => (
                <DashboardListingCard key={listing.id} listing={listing} />
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
  )
}

// Individual listing card component for dashboard
function DashboardListingCard({ listing }: { listing: Listing }) {
  const navigate = useNavigate()
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const handleEdit = () => {
    navigate(`/edit/${listing.id}`)
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
            {formatPrice(listing.price)}
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 mr-1" />
            Listed {formatDate(listing.createdAt)}
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
        <div className="mt-4 space-y-2">
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="flex-1" onClick={handleEdit}>
              Edit
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {listing.status === 'ACTIVE' && (
              <>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex-1"
                  onClick={async () => {
                    try {
                      toast({
                        title: "Putting listing on hold...",
                        description: "Please wait while we update the listing status.",
                      });
                      
                      await apiClient.updateListing(listing.id, {
                        ...listing,
                        status: 'ON_HOLD'
                      });

                      await queryClient.invalidateQueries({ queryKey: ['listings'] });
                      await queryClient.invalidateQueries({ queryKey: ['listings-stats'] });
                      
                      toast({
                        title: "Success!",
                        description: "Listing has been put on hold.",
                        variant: "default",
                      });
                    } catch (error) {
                      console.error('Failed to update listing status:', error);
                      toast({
                        title: "Error",
                        description: "Failed to update listing status. Please try again.",
                        variant: "destructive",
                      });
                    }
                  }}
                >
                  Put On Hold
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex-1"
                  onClick={async () => {
                    try {
                      toast({
                        title: "Marking listing as sold...",
                        description: "Please wait while we update the listing status.",
                      });
                      
                      await apiClient.updateListing(listing.id, {
                        ...listing,
                        status: 'SOLD'
                      });

                      await queryClient.invalidateQueries({ queryKey: ['listings'] });
                      await queryClient.invalidateQueries({ queryKey: ['listings-stats'] });
                      
                      toast({
                        title: "Success!",
                        description: "Listing has been marked as sold.",
                        variant: "default",
                      });
                    } catch (error) {
                      console.error('Failed to update listing status:', error);
                      toast({
                        title: "Error",
                        description: "Failed to update listing status. Please try again.",
                        variant: "destructive",
                      });
                    }
                  }}
                >
                  Mark Sold
                </Button>
              </>
            )}
            {listing.status !== 'ACTIVE' && (
              <Button 
                size="sm" 
                variant="outline" 
                className="flex-1"
                onClick={async () => {
                  try {
                    toast({
                      title: "Reactivating listing...",
                      description: "Please wait while we update the listing status.",
                    });
                    
                    await apiClient.updateListing(listing.id, {
                      ...listing,
                      status: 'ACTIVE'
                    });

                    await queryClient.invalidateQueries({ queryKey: ['listings'] });
                    await queryClient.invalidateQueries({ queryKey: ['listings-stats'] });
                    
                    toast({
                      title: "Success!",
                      description: "Listing has been reactivated.",
                      variant: "default",
                    });
                  } catch (error) {
                    console.error('Failed to update listing status:', error);
                    toast({
                      title: "Error",
                      description: "Failed to update listing status. Please try again.",
                      variant: "destructive",
                    });
                  }
                }}
              >
                Reactivate
              </Button>
            )}
          </div>
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

