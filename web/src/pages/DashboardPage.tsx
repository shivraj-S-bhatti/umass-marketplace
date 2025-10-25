import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { apiClient, type Listing } from '@/lib/api'
import { LayoutDashboard, Plus, DollarSign, Calendar, Eye } from 'lucide-react'
import { useState } from 'react'

// Dashboard Page - displays user's listings and marketplace statistics
// Shows seller's own listings with management options and overview stats
export default function DashboardPage() {
  const [currentPage, setCurrentPage] = useState(0)
  const pageSize = 12

  const { data: listingsData, isLoading, error } = useQuery({
    queryKey: ['listings', currentPage],
    queryFn: () => apiClient.getListings({ page: currentPage, size: pageSize }),
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
  const activeListings = listings.filter(l => l.status === 'ACTIVE')
  const soldListings = listings.filter(l => l.status === 'SOLD')
  const onHoldListings = listings.filter(l => l.status === 'ON_HOLD')

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">My Dashboard</h1>
        <p className="text-muted-foreground">Manage your marketplace listings</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeListings.length}</div>
            <p className="text-xs text-muted-foreground">
              Currently for sale
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sold Items</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{soldListings.length}</div>
            <p className="text-xs text-muted-foreground">
              Successfully sold
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On Hold</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{onHoldListings.length}</div>
            <p className="text-xs text-muted-foreground">
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
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">My Listings</h2>
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

// Individual listing card component for dashboard
function ListingCard({ listing }: { listing: Listing }) {
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
      year: 'numeric',
    })
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
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
        <div className="mt-4 flex gap-2">
          <Button size="sm" variant="outline" className="flex-1">
            Edit
          </Button>
          <Button size="sm" variant="outline" className="flex-1">
            {listing.status === 'ACTIVE' ? 'Mark Sold' : 'Reactivate'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
