import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/shared/components/ui/button'
import { Mail, User, ArrowLeft, Store } from 'lucide-react'
import { apiClient, getListing, getListingsBySeller, type Listing } from '@/features/marketplace/api/api'
import { formatPrice, timeAgo } from '@/shared/lib/utils/utils'
import { useUser } from '@/shared/contexts/UserContext'
import { useLoginModal } from '@/shared/contexts/LoginModalContext'
import { useCart } from '@/shared/contexts/CartContext'
import { useToast } from '@/shared/hooks/use-toast'
import { ListingCard } from '@/shared/components/ListingCard'
import { ListingDetailModal } from '@/shared/components/ui/listing-detail-modal'
import { useState } from 'react'

export default function PublicListingPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useUser()
  const { openLoginModal } = useLoginModal()
  const { addToCart } = useCart()
  const { toast } = useToast()
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null)

  const { data: listing, isLoading, error } = useQuery({
    queryKey: ['listing', id],
    queryFn: () => getListing(id!),
    enabled: !!id,
  })

  const { data: sellerListingsData } = useQuery({
    queryKey: ['sellerListings', listing?.sellerId],
    queryFn: () => getListingsBySeller(listing!.sellerId, 0, 6),
    enabled: !!listing?.sellerId,
  })

  const moreFromSeller = (sellerListingsData?.content || []).filter((l: Listing) => l.id !== listing?.id).slice(0, 6)

  if (!id) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-sm text-muted-foreground">Invalid listing ID</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="h-64 bg-muted animate-pulse rounded-lg" />
      </div>
    )
  }

  if (error || !listing) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-sm text-muted-foreground">Listing not found.</p>
        <Button variant="link" className="mt-2" onClick={() => navigate('/marketplace')}>
          Browse marketplace
        </Button>
      </div>
    )
  }

  const sellerName = listing.sellerName || 'Seller'

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
      {!user && (
        <div className="bg-muted/80 border-b border-border px-4 py-2.5 text-center text-sm text-muted-foreground">
          Viewing {listing.title}.{' '}
          <button type="button" className="font-medium text-primary hover:underline" onClick={openLoginModal}>
            Log in with UMass email
          </button>
          {' '}to message or save.
        </div>
      )}

      <div className="container mx-auto px-4 py-4 space-y-6">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-2">
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          Back
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {listing.imageUrl && (
            <div className="aspect-[4/3] rounded-lg overflow-hidden bg-muted">
              <img src={listing.imageUrl} alt={listing.title} className="w-full h-full object-cover" />
            </div>
          )}
          <div className="space-y-3">
            <h1 className="text-xl font-semibold text-foreground">{listing.title}</h1>
            <p className="text-lg font-semibold text-foreground">{formatPrice(listing.price)}</p>
            <p className="text-xs text-muted-foreground">Posted {timeAgo(listing.createdAt, '')}</p>
            <div>
              <h4 className="text-sm font-semibold mb-1">Description</h4>
              <p className="text-sm text-muted-foreground">{listing.description || 'No description provided'}</p>
            </div>
            {(listing.category || listing.condition) && (
              <p className="text-xs text-muted-foreground">
                {[listing.category, listing.condition].filter(Boolean).join(' · ')}
              </p>
            )}
            <div className="border-t border-border pt-3">
              <h4 className="text-sm font-semibold mb-1">Seller</h4>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {listing.sellerPictureUrl ? (
                  <img src={listing.sellerPictureUrl} alt={sellerName} className="h-8 w-8 rounded-full" />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                    <User className="h-4 w-4" />
                  </div>
                )}
                <span>{listing.sellerName}</span>
                {listing.sellerEmail && (
                  <span className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {listing.sellerEmail}
                  </span>
                )}
              </div>
              {user ? (
                <Link to={`/profile/${listing.sellerId}`} className="inline-flex items-center gap-1.5 mt-2 text-sm font-medium text-primary hover:underline">
                  <User className="h-3.5 w-3.5" />
                  View Seller Profile and Reviews
                </Link>
              ) : (
                <p className="text-xs text-muted-foreground mt-1">Log in to view seller profile or contact.</p>
              )}
            </div>
          </div>
        </div>

        {moreFromSeller.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-base font-semibold">More from this seller</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {moreFromSeller.map((l: Listing) => (
                <ListingCard
                  key={l.id}
                  listing={l}
                  compact
                  onViewListing={(item) => setSelectedListing(item as Listing)}
                  onAddToShoppingList={user ? (item) => { addToCart(item as Listing); toast({ title: 'Added to shopping list', description: `${item.title} has been added.` }) } : undefined}
                />
              ))}
            </div>
            <Button variant="outline" asChild>
              <Link to={`/u/${listing.sellerId}`}>
                <Store className="h-4 w-4 mr-2" />
                View all listings by {sellerName}
              </Link>
            </Button>
          </div>
        )}
      </div>

      <ListingDetailModal
        listing={selectedListing}
        isOpen={selectedListing !== null}
        onClose={() => setSelectedListing(null)}
        isCurrentUserSeller={user?.id === listing.sellerId}
        onUpdateStatus={
          user?.id === listing.sellerId && selectedListing?.sellerId === listing.sellerId
            ? async (newStatus) => {
                if (!selectedListing) return
                await apiClient.updateListing(selectedListing.id, { ...selectedListing, status: newStatus })
                setSelectedListing(null)
              }
            : undefined
        }
      />
    </div>
  )
}
