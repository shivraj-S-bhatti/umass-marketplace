import { Dialog, DialogContent, DialogHeader, DialogTitle } from './dialog'
import { Button } from './button'
import { MapPin, Mail, MessageCircle, Tags, CheckCircle2, AlertCircle, User, Navigation, ShoppingCart, ChevronDown, Pencil } from 'lucide-react'
import { formatPrice, timeAgo } from '@/shared/lib/utils/utils'
import { getDistanceText } from '@/shared/lib/utils/locationUtils'
import type { Listing } from '@/features/marketplace/api/api'
import { useState } from 'react'
import { useToast } from '@/shared/hooks/use-toast'
import { useChat } from '@/shared/contexts/ChatContext'
import { useCart } from '@/shared/contexts/CartContext'
import { useNavigate, Link } from 'react-router-dom'
import { SellerReviews } from '@/features/marketplace/components/SellerReviews'
import { CreateReview } from '@/features/marketplace/components/CreateReview'
import LocationMapPopup from '@/features/marketplace/components/LocationMapPopup'
import { ShareListingButton } from '@/features/marketplace/components/ShareListingButton'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/shared/components/ui/dropdown-menu'

interface ListingDetailModalProps {
  listing: Listing | null
  isOpen: boolean
  onClose: () => void
  isCurrentUserSeller?: boolean
  onUpdateStatus?: (status: 'ACTIVE' | 'ON_HOLD' | 'SOLD') => Promise<void>
  /** Optional user location for distance in meta row */
  userLocation?: { lat: number; lng: number } | null
}

export function ListingDetailModal({ 
  listing, 
  isOpen, 
  onClose,
  isCurrentUserSeller = false,
  onUpdateStatus,
  userLocation = null,
}: ListingDetailModalProps) {
  const { toast } = useToast()
  const [isUpdating, setIsUpdating] = useState(false)
  const [mapOpen, setMapOpen] = useState(false)
  const navigate = useNavigate()
  const { startChat } = useChat()
  const { addToCart } = useCart()

  const handleAddToCart = () => {
    if (!listing) return
    addToCart(listing)
    toast({
      title: 'Added to cart!',
      description: `${listing.title} has been added to your cart.`,
    })
  }

  if (!listing) return null

  const handleContactSeller = () => {
    const emailSubject = encodeURIComponent(`Interest in your listing: ${listing.title}`)
    const emailBody = encodeURIComponent(
      `Hi ${listing.sellerName},\n\nI'm interested in your listing "${listing.title}" on Everything UMass.`
    )
    window.location.href = `mailto:${listing.sellerEmail}?subject=${emailSubject}&body=${emailBody}`
  }

  const handleStatusUpdate = async (newStatus: 'ACTIVE' | 'ON_HOLD' | 'SOLD') => {
    if (!onUpdateStatus) return
    if (newStatus === 'SOLD' && !window.confirm('Mark as sold? This will remove the listing from search.')) return

    try {
      setIsUpdating(true)
      await onUpdateStatus(newStatus)
      toast({
        title: 'Status updated',
        description: `Listing has been marked as ${newStatus.toLowerCase()}.`,
      })
    } catch (error) {
      console.error('Failed to update status:', error)
      toast({
        title: 'Error',
        description: 'Failed to update the listing status. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const statusLabel = listing.status === 'ACTIVE' ? 'Active' : listing.status === 'ON_HOLD' ? 'On hold' : 'Sold'

  const distanceText = userLocation && listing.latitude != null && listing.longitude != null
    ? getDistanceText(userLocation, { lat: listing.latitude, lng: listing.longitude })
    : null
  const metaRow = [timeAgo(listing.createdAt, ''), distanceText].filter(Boolean).join(' · ')

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className={`max-w-lg h-[90vh] max-h-[90vh] flex flex-col p-4 gap-0 ${listing.imageUrl ? 'min-[900px]:max-w-4xl' : ''}`}>
          <DialogHeader className="flex-shrink-0 flex flex-row items-center justify-between gap-2 pb-2 pr-10">
            <DialogTitle className="flex-1 min-w-0 text-base truncate">{listing.title}</DialogTitle>
            <ShareListingButton listing={listing} variant="button" className="border-border bg-card hover:bg-secondary" />
          </DialogHeader>
          <div className={`flex flex-col flex-1 min-h-0 overflow-hidden gap-0 ${listing.imageUrl ? 'min-[900px]:flex-row' : ''}`}>
            {/* Left (60% on desktop only when image exists): image only */}
            {listing.imageUrl && (
              <div className="w-full min-[900px]:w-[60%] min-[900px]:flex-shrink-0 aspect-[4/3] min-[900px]:aspect-auto min-[900px]:min-h-0 overflow-hidden rounded-t-lg min-[900px]:rounded-lg bg-muted relative flex-shrink-0">
                <img
                  src={listing.imageUrl}
                  alt={listing.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            {/* Right (40% on desktop with image, full width otherwise): scrollable info */}
            <div className="flex flex-col flex-1 min-h-0 overflow-y-auto overscroll-contain py-2 pr-1 min-[900px]:pl-4">
              <div className="space-y-2">
            <div>
              <div className="flex items-center text-xl font-bold text-foreground">
                {formatPrice(listing.price)}
              </div>
              <div className="flex items-center text-xs text-muted-foreground mt-0.5">
                {metaRow}
              </div>
            </div>

            <div className="space-y-1">
              <h4 className="text-sm font-semibold">Description</h4>
              <p className="text-sm text-muted-foreground">
                {listing.description || 'No description provided'}
              </p>
            </div>

            {(listing.category || listing.condition || (listing.latitude && listing.longitude)) && (
              <div className="grid grid-cols-2 gap-2">
                {listing.category && (
                  <div>
                    <h4 className="text-sm font-semibold">Category</h4>
                    <p className="text-xs text-muted-foreground">{listing.category}</p>
                  </div>
                )}
                {listing.condition && (
                  <div>
                    <h4 className="text-sm font-semibold">Condition</h4>
                    <p className="text-xs text-muted-foreground">{listing.condition}</p>
                  </div>
                )}
                {listing.latitude && listing.longitude && (
                  <div>
                    <h4 className="text-sm font-semibold flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" />
                      Location
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {listing.latitude.toFixed(4)}, {listing.longitude.toFixed(4)}
                    </p>
                  </div>
                )}
              </div>
            )}

            {listing.mustGoBy && new Date(listing.mustGoBy) > new Date() && (
              <div className="bg-destructive/10 border border-destructive/30 rounded-md px-2 py-1.5">
                <div className="flex items-center gap-1.5 text-destructive text-sm font-semibold">
                  <AlertCircle className="h-3.5 w-3.5" />
                  <span>Must go by: {new Date(listing.mustGoBy).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
              </div>
            )}

            {listing.latitude && listing.longitude && (
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => setMapOpen(true)}
              >
                <Navigation className="h-3.5 w-3.5 mr-1.5" />
                Show on Map
              </Button>
            )}

            <div className="border-t border-border pt-2">
              <h4 className="text-sm font-semibold mb-1">Seller</h4>
              <div className="space-y-1.5">
                <div className="flex items-center text-xs text-muted-foreground">
                  <Mail className="h-3.5 w-3.5 mr-1.5" />
                  {listing.sellerPictureUrl && (
                    <img src={listing.sellerPictureUrl} alt={listing.sellerName} className="h-5 w-5 rounded-full mr-1.5" />
                  )}
                  {listing.sellerName} ({listing.sellerEmail})
                </div>
                {listing.sellerId && (
                  <Link
                    to={`/profile/${listing.sellerId}`}
                    className="inline-flex items-center gap-1.5 px-2 py-1.5 text-xs font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-md transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <User className="h-3.5 w-3.5" />
                    View Seller Profile & Reviews
                  </Link>
                )}
              </div>
            </div>

            {!isCurrentUserSeller && listing.sellerId && (
              <div className="border-t border-border pt-2 space-y-2">
                <h4 className="text-sm font-semibold">Seller Reviews</h4>
                <SellerReviews sellerId={listing.sellerId} />
                <CreateReview
                  sellerId={listing.sellerId}
                  sellerName={listing.sellerName}
                />
              </div>
            )}
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-1 pt-2 border-t border-border flex-shrink-0 bg-card">
              {isCurrentUserSeller ? (
                <div className="flex flex-col sm:flex-row gap-1 w-full items-stretch">
                  <Button size="sm" className="h-8 text-xs w-full sm:flex-1" asChild>
                    <Link to={`/edit/${listing.id}`}>
                      <Pencil className="h-3 w-3 mr-1" />
                      Edit
                    </Link>
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" variant="outline" className="h-8 text-xs w-full sm:flex-1 border-border" disabled={isUpdating}>
                        {listing.status === 'SOLD' ? (
                          <CheckCircle2 className="h-3 w-3 mr-1 text-destructive" />
                        ) : listing.status === 'ON_HOLD' ? (
                          <AlertCircle className="h-3 w-3 mr-1 text-warning" />
                        ) : (
                          <Tags className="h-3 w-3 mr-1 text-success" />
                        )}
                        {statusLabel}
                        <ChevronDown className="h-3 w-3 ml-1" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {listing.status !== 'ACTIVE' && (
                        <DropdownMenuItem onSelect={() => handleStatusUpdate('ACTIVE')}>
                          <Tags className="h-3 w-3 mr-2 text-success" />
                          Active
                        </DropdownMenuItem>
                      )}
                      {listing.status !== 'ON_HOLD' && (
                        <DropdownMenuItem onSelect={() => handleStatusUpdate('ON_HOLD')}>
                          <AlertCircle className="h-3 w-3 mr-2 text-warning" />
                          On hold
                        </DropdownMenuItem>
                      )}
                      {listing.status !== 'SOLD' && (
                        <DropdownMenuItem onSelect={() => handleStatusUpdate('SOLD')}>
                          <CheckCircle2 className="h-3 w-3 mr-2 text-destructive" />
                          Sold
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs w-full sm:flex-1 border-border bg-card hover:bg-secondary"
                    onClick={async () => {
                      try {
                        await startChat(listing.id)
                        navigate('/messages')
                      } catch (error) {
                        console.error('Failed to start chat:', error)
                        toast({
                          title: 'Error',
                          description: 'Failed to start chat. Please try again.',
                          variant: 'destructive',
                        })
                      }
                    }}
                  >
                    <MessageCircle className="h-3 w-3 mr-1 text-primary" />
                    Message seller
                  </Button>
                  <Button size="sm" variant="secondary" className="h-8 text-xs w-full sm:flex-1" onClick={handleAddToCart}>
                    <ShoppingCart className="h-3 w-3 mr-1" />
                    Add to Cart
                  </Button>
                  <Button size="sm" variant="secondary" className="h-8 text-xs w-full sm:flex-1" onClick={handleContactSeller}>
                    <Mail className="h-3 w-3 mr-1" />
                    Contact Seller
                  </Button>
                </>
              )}
          </div>
        </DialogContent>
    </Dialog>

    {/* Map Popup */}
    {listing.latitude && listing.longitude && (
      <LocationMapPopup
        open={mapOpen}
        onClose={() => setMapOpen(false)}
        lat={listing.latitude}
        lng={listing.longitude}
        title={listing.title}
      />
    )}
  </>
  )
}