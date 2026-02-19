import React, { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Link, useNavigate } from 'react-router-dom'
import { apiClient, type Listing } from '@/features/marketplace/api/api'
import { useToast } from '@/shared/hooks/use-toast'
import { useUser } from '@/shared/contexts/UserContext'
import { LayoutDashboard, Calendar, Share2 } from 'lucide-react'
import { formatPrice, formatDate } from '@/shared/lib/utils/utils'
import { ShareMyListingsModal } from '@/features/marketplace/components/ShareMyListingsModal'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'

// Dashboard Page - displays user's listings and statistics
// Shows seller's own listings with management options and overview stats
export default function DashboardPage() {
  const [currentPage, setCurrentPage] = useState(0)
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const pageSize = 12
  const { user, isSuperuser } = useUser()

  const { data: listingsData, isLoading, error } = useQuery({
    queryKey: ['my-listings', isSuperuser ? 'all' : user?.id, currentPage],
    queryFn: () =>
      isSuperuser
        ? apiClient.getListings({ page: currentPage, size: pageSize })
        : apiClient.getListingsBySeller(user!.id, currentPage, pageSize),
    enabled: !!user?.id,
  })

  // Superusers see global stats; regular users see their own
  const { data: stats } = useQuery({
    queryKey: ['my-listings-stats', isSuperuser ? 'global' : user?.id],
    queryFn: () =>
      isSuperuser
        ? apiClient.getListingStats()
        : apiClient.getListingStatsBySeller(user!.id),
    enabled: !!user?.id,
  })

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-4 max-w-4xl space-y-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage your listings.</p>
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
      <div className="container mx-auto px-4 py-4 max-w-4xl">
        <div className="mb-4">
          <h1 className="text-3xl font-bold tracking-tight">My Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage your marketplace listings.</p>
        </div>
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 max-w-md">
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
    <div className="container mx-auto px-4 py-4 max-w-4xl space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{isSuperuser ? 'Admin Dashboard' : 'My Dashboard'}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{isSuperuser ? 'All listings across the platform.' : 'Manage your listings.'}</p>
        </div>
        {user && (
          <Button onClick={() => setShareModalOpen(true)} size="sm" className="shrink-0">
            <Share2 className="h-4 w-4 mr-2" />
            Share my listings
          </Button>
        )}
      </div>

      {user && (
        <ShareMyListingsModal
          open={shareModalOpen}
          onOpenChange={setShareModalOpen}
          user={{ id: user.id, name: user.name }}
          listingCount={listingsData?.totalElements ?? 0}
          firstListingImageUrl={listings?.[0]?.imageUrl}
        />
      )}

      {/* Stats: single card, multiple rows */}
      <Card>
        <CardContent className="py-3 px-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <div className="flex items-start justify-between gap-2 border-b border-border sm:border-b-0 sm:border-r border-r-border last:border-r-0 pb-3 sm:pb-0 sm:pr-4 last:pr-0">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Listings</p>
                <p className="text-xs text-muted-foreground">Currently for sale</p>
              </div>
              <span className="text-2xl font-bold text-foreground tabular-nums">{activeListingsCount}</span>
            </div>
            <div className="flex items-start justify-between gap-2 border-b border-border sm:border-b-0 sm:border-r border-r-border last:border-r-0 pb-3 sm:pb-0 sm:pr-4 last:pr-0">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Sold Items</p>
                <p className="text-xs text-muted-foreground">Successfully sold</p>
              </div>
              <span className="text-2xl font-bold text-foreground tabular-nums">{soldListingsCount}</span>
            </div>
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-medium text-muted-foreground">On Hold</p>
                <p className="text-xs text-muted-foreground">Temporarily unavailable</p>
              </div>
              <span className="text-2xl font-bold text-foreground tabular-nums">{onHoldListingsCount}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* My Listings */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-2xl font-bold">{isSuperuser ? 'All Listings' : 'My Listings'}</h2>
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

type ListingStatus = 'ACTIVE' | 'ON_HOLD' | 'SOLD'

function statusLabel(s: ListingStatus) {
  return s === 'ACTIVE' ? 'Active' : s === 'ON_HOLD' ? 'On Hold' : 'Sold'
}

function statusDotClass(s: ListingStatus) {
  return s === 'ACTIVE' ? 'bg-success' : s === 'ON_HOLD' ? 'bg-warning' : 'bg-danger'
}

// Individual listing card component for dashboard
function DashboardListingCard({ listing }: { listing: Listing }) {
  const navigate = useNavigate()
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)
  const [soldConfirmOpen, setSoldConfirmOpen] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const handleEdit = () => {
    navigate(`/edit/${listing.id}`)
  }

  const confirmDelete = async () => {
    setDeleteConfirmOpen(false)
    try {
      await apiClient.deleteListing(listing.id)
      await queryClient.invalidateQueries({ queryKey: ['my-listings'] })
      await queryClient.invalidateQueries({ queryKey: ['my-listings-stats'] })
      toast({ title: 'Success', description: 'Listing deleted.' })
    } catch (error) {
      console.error('Failed to delete listing:', error)
      toast({ title: 'Error', description: 'Failed to delete listing. Please try again.', variant: 'destructive' })
    }
  }

  const updateStatus = async (newStatus: ListingStatus) => {
    try {
      await apiClient.updateListing(listing.id, { ...listing, status: newStatus })
      await queryClient.invalidateQueries({ queryKey: ['my-listings'] })
      await queryClient.invalidateQueries({ queryKey: ['my-listings-stats'] })
      toast({ title: 'Success', description: `Listing status updated to ${statusLabel(newStatus)}.` })
    } catch (error) {
      console.error('Failed to update listing status:', error)
      toast({ title: 'Error', description: 'Failed to update listing status. Please try again.', variant: 'destructive' })
    }
  }

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as ListingStatus
    if (value === 'SOLD') {
      setSoldConfirmOpen(true)
      return
    }
    updateStatus(value)
  }

  const confirmMarkSold = () => {
    setSoldConfirmOpen(false)
    updateStatus('SOLD')
  }

  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isImageModalOpen) setIsImageModalOpen(false)
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isImageModalOpen])

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow">
        {listing.imageUrl && (
          <div
            className="w-full h-36 overflow-hidden rounded-t-lg cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => listing.imageUrl && setIsImageModalOpen(true)}
          >
            <img src={listing.imageUrl} alt={listing.title} className="w-full h-full object-cover" />
          </div>
        )}
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start gap-2">
            <CardTitle className="text-sm font-semibold line-clamp-1">{listing.title}</CardTitle>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className={`h-2 w-2 rounded-full ${statusDotClass(listing.status)}`} aria-hidden />
              <select
                value={listing.status}
                onChange={handleStatusChange}
                className="h-8 min-w-0 rounded-md border border-input bg-background px-2 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="ACTIVE">Active</option>
                <option value="ON_HOLD">On Hold</option>
                <option value="SOLD">Sold</option>
              </select>
            </div>
          </div>
          <CardDescription className="line-clamp-1 text-xs">
            {listing.description || 'No description provided'}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0 pb-3">
          <div className="space-y-1">
            <div className="flex items-center text-base font-bold text-foreground">
              {formatPrice(listing.price)}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <Calendar className="h-4 w-4 mr-1" />
              Listed {formatDate(listing.createdAt)}
            </div>
            {listing.category && (
              <div className="text-xs">
                <span className="font-medium">Category:</span> {listing.category}
              </div>
            )}
            {listing.condition && (
              <div className="text-xs">
                <span className="font-medium">Condition:</span> {listing.condition}
              </div>
            )}
          </div>
          <div className="mt-3 flex gap-2">
            <Button size="sm" variant="outline" className="flex-1" onClick={handleEdit}>
              Edit
            </Button>
            <Button size="sm" variant="destructive" className="flex-1" onClick={() => setDeleteConfirmOpen(true)}>
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete listing?</DialogTitle>
            <DialogDescription>
              This will permanently delete &quot;{listing.title}&quot;. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={soldConfirmOpen} onOpenChange={setSoldConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark as sold?</DialogTitle>
            <DialogDescription>
              This will mark &quot;{listing.title}&quot; as sold. You can change the status later from this card.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSoldConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmMarkSold}>
              Mark sold
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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

