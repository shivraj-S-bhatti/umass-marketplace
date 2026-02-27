import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { StickerBadge } from '@/shared/components/ui/sticker-badge'
import { Eye, MapPin, Heart } from 'lucide-react'
import { formatPrice, timeAgo } from '@/shared/lib/utils/utils'
import { getDistanceText, requestLocationOnInteraction, type Location } from '@/shared/lib/utils/locationUtils'
import type { ListingCardData } from '@/shared/types'
import { useCart } from '@/shared/contexts/CartContext'

export interface ListingCardProps {
  /** Listing data (marketplace or leasing – same shape) */
  listing: ListingCardData
  /** Compact layout for dense grids */
  compact?: boolean
  /** Called when user clicks "View listing" or the card – open detail modal/page */
  onViewListing: (listing: ListingCardData) => void
  /** Optional: show heart button to add to shopping list and call this when clicked */
  onAddToShoppingList?: (listing: ListingCardData) => void
  /** Optional: user location for distance (if not provided, card may request it) */
  userLocation?: { lat: number; lng: number } | null
}

/**
 * Shared listing card used across the app (marketplace browse, leasing, etc.).
 * Layout: title at top; bottom-aligned price | posted X ago | distance; category pills; CTA.
 */
export function ListingCard({
  listing,
  compact = false,
  onViewListing,
  onAddToShoppingList,
  userLocation: userLocationProp,
}: ListingCardProps) {
  const { items, removeFromCart } = useCart()
  const isInCart = items.some(i => i.id === listing.id)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(userLocationProp ?? null)

  useEffect(() => {
    if (userLocationProp !== undefined) {
      setUserLocation(userLocationProp)
      return
    }
    const cleanup = requestLocationOnInteraction((loc: Location) => setUserLocation(loc))
    return cleanup
  }, [userLocationProp])

  const distanceText =
    userLocation && listing.latitude != null && listing.longitude != null
      ? getDistanceText(userLocation, { lat: listing.latitude, lng: listing.longitude })
      : null

  const hasValidImage =
    listing.imageUrl &&
    typeof listing.imageUrl === 'string' &&
    listing.imageUrl.trim() !== '' &&
    listing.imageUrl.trim() !== 'null'

  const postedAgo = timeAgo(listing.createdAt, '')

  return (
    <Card
      className={`h-full flex flex-col overflow-hidden transition-colors hover:border-primary/50 ${compact ? 'text-sm' : ''}`}
    >
      {/* Image */}
      <div
        className={`w-full flex-shrink-0 overflow-hidden rounded-t-lg bg-secondary/50 flex items-center justify-center relative cursor-pointer hover:opacity-90 transition-opacity ${compact ? 'h-28' : 'h-40'}`}
        onClick={() => onViewListing(listing)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onViewListing(listing)}
        aria-label={`View ${listing.title}`}
      >
        {hasValidImage ? (
          <img
            src={listing.imageUrl!}
            alt={listing.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <Eye className={compact ? 'h-8 w-8 text-muted-foreground' : 'h-12 w-12 text-muted-foreground'} />
        )}
        {listing.mustGoBy && new Date(listing.mustGoBy) > new Date() && (
          <div className="absolute top-1.5 left-1.5 z-10">
            <StickerBadge variant="new" className={compact ? 'text-[10px] px-1.5 py-0' : 'text-xs'}>
              MUST GO
            </StickerBadge>
          </div>
        )}
      </div>

      <CardHeader className={`flex-shrink-0 ${compact ? 'p-2 pb-0' : 'pb-1.5'}`}>
        <CardTitle
          className={`line-clamp-2 font-semibold text-foreground ${compact ? 'text-xs' : 'text-base'}`}
        >
          {listing.title}
        </CardTitle>
        {listing.status !== 'ACTIVE' && (
          <div className="mt-1">
            <StickerBadge
              variant="status"
              statusType={listing.status}
              className={compact ? 'text-[10px] px-1.5 py-0' : 'text-xs'}
            >
              {listing.status === 'ON_HOLD' ? 'ON HOLD' : 'SOLD'}
            </StickerBadge>
          </div>
        )}
      </CardHeader>

      <CardContent className={`pt-0 flex-1 flex flex-col min-h-0 ${compact ? 'p-2 pt-0' : 'pb-4'}`}>
        {/* Spacer pushes meta + pills + CTA to bottom */}
        <div className="flex-1 min-h-[0.5rem]" />

        {/* Bottom-aligned row: price (15% larger) | posted X ago | distance (same size) */}
        <div
          className={`flex flex-wrap items-center gap-x-3 gap-y-0.5 text-muted-foreground ${compact ? 'text-[10px]' : 'text-xs'}`}
        >
          <span className="font-semibold text-foreground text-[1.15em] leading-none">{formatPrice(listing.price)}</span>
          <span className="text-muted-foreground">{postedAgo ? `Posted ${postedAgo}` : ''}</span>
          {distanceText && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3 flex-shrink-0" />
              {distanceText}
            </span>
          )}
        </div>

        {/* Category / condition pills – same size as body text, minimal styling */}
        {(listing.category || listing.condition) && (
          <div className={`flex flex-wrap gap-x-2 gap-y-0.5 mt-1.5 ${compact ? 'text-[10px]' : 'text-xs'}`}>
            {listing.category && (
              <span className="text-muted-foreground">{listing.category}</span>
            )}
            {listing.condition && (
              <span className="text-muted-foreground">{listing.category && listing.condition ? ' · ' : ''}{listing.condition}</span>
            )}
          </div>
        )}

        {/* CTA: View + heart (add to shopping list) */}
        <div className="mt-3 flex gap-2">
          <Button
            variant="default"
            size={compact ? 'sm' : 'default'}
            className="flex-1"
            onClick={() => onViewListing(listing)}
          >
            View
          </Button>
          {onAddToShoppingList !== undefined && (
            <Button
              variant="outline"
              size={compact ? 'sm' : 'default'}
              className={`shrink-0 ${isInCart ? 'text-primary border-primary' : ''}`}
              onClick={(e) => {
                e.stopPropagation()
                if (isInCart) removeFromCart(listing.id)
                else onAddToShoppingList(listing)
              }}
              aria-label={isInCart ? 'Remove from shopping list' : 'Add to shopping list'}
            >
              <Heart className={`h-4 w-4 ${isInCart ? 'fill-current' : ''}`} />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
