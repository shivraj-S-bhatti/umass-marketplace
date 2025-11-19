import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { apiClient } from '@/lib/api'
import { LayoutDashboard, Plus, DollarSign, Calendar, Eye } from 'lucide-react'
import ListingCard from '@/components/ListingCard'

// Dashboard Page - displays user's listings and marketplace statistics
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
          <p className="text-muted-foreground">Manage your marketplace listings</p>
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
        <p className="text-base text-muted-foreground">Manage your marketplace listings 🍂</p>
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
            <DollarSign className="h-5 w-5 text-primary" />
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
                <ListingCard key={listing.id} listing={listing} />
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