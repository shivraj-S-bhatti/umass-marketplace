import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getListingsBySeller, getUser, type Listing } from '@/features/marketplace/api/api'
import { useUser } from '@/shared/contexts/UserContext'
import { useLoginModal } from '@/shared/contexts/LoginModalContext'
import { useCart } from '@/shared/contexts/CartContext'
import { useToast } from '@/shared/hooks/use-toast'
import { ListingCard } from '@/shared/components/ListingCard'
import { ListingDetailModal } from '@/shared/components/ui/listing-detail-modal'
import { useState } from 'react'

export default function SellerShopPage() {
  const { sellerId } = useParams<{ sellerId: string }>()
  const { user } = useUser()
  const { openLoginModal } = useLoginModal()
  const { addToCart } = useCart()
  const { toast } = useToast()
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null)

  const { data: sellerListingsData, isLoading, error } = useQuery({
    queryKey: ['sellerListings', sellerId],
    queryFn: () => getListingsBySeller(sellerId!, 0, 24),
    enabled: !!sellerId,
  })

  const { data: sellerUser } = useQuery({
    queryKey: ['user', sellerId],
    queryFn: () => getUser(sellerId!),
    enabled: !!sellerId,
  })

  const sellerName = sellerUser?.name ?? (sellerListingsData?.content?.[0]?.sellerName) ?? 'Seller'

  if (!sellerId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-sm text-muted-foreground">Invalid seller</p>
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

  if (error || !sellerListingsData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-sm text-muted-foreground">Could not load seller listings.</p>
      </div>
    )
  }

  const listings = sellerListingsData.content || []

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
      {!user && (
        <div className="bg-muted/80 border-b border-border px-4 py-2.5 text-center text-sm text-muted-foreground">
          Viewing {sellerName}&apos;s listings.{' '}
          <button type="button" className="font-medium text-primary hover:underline" onClick={openLoginModal}>
            Log in with UMass email
          </button>
          {' '}to message or save.
        </div>
      )}

      <div className="container mx-auto px-4 py-4 space-y-4">
        <h1 className="text-lg font-semibold">{sellerName}&apos;s listings</h1>

        {listings.length === 0 ? (
          <p className="text-sm text-muted-foreground">No listings from this seller.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {listings.map((listing: Listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                compact
                onViewListing={(item) => setSelectedListing(item as Listing)}
                onAddToShoppingList={user ? (item) => { addToCart(item as Listing); toast({ title: 'Added to shopping list', description: `${item.title} has been added.` }) } : undefined}
              />
            ))}
          </div>
        )}
      </div>

      <ListingDetailModal
        listing={selectedListing}
        isOpen={selectedListing !== null}
        onClose={() => setSelectedListing(null)}
        isCurrentUserSeller={user?.id === selectedListing?.sellerId}
      />
    </div>
  )
}
