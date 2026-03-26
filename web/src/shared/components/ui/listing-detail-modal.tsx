import type { ReactNode } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  AlertCircle,
  Bath,
  Bus,
  CheckCircle2,
  ChevronDown,
  ExternalLink,
  Home,
  Mail,
  MapPin,
  MessageCircle,
  Navigation,
  Pencil,
  ShoppingCart,
  Tags,
  User,
} from 'lucide-react'

import type { Listing } from '@/features/marketplace/api/api'
import { CreateReview } from '@/features/marketplace/components/CreateReview'
import LocationMapPopup from '@/features/marketplace/components/LocationMapPopup'
import { SellerReviews } from '@/features/marketplace/components/SellerReviews'
import { ShareListingButton } from '@/features/marketplace/components/ShareListingButton'
import { useCart } from '@/shared/contexts/CartContext'
import { useChat } from '@/shared/contexts/ChatContext'
import { useToast } from '@/shared/hooks/use-toast'
import { getDistanceText } from '@/shared/lib/utils/locationUtils'
import { formatListingEnum, getLeasingBadgeLabels, getListingImages, isLeasingListing } from '@/shared/lib/utils/listingMetadata'
import { formatPrice, timeAgo } from '@/shared/lib/utils/utils'
import { Button } from './button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './dropdown-menu'

interface ListingDetailModalProps {
  listing: Listing | null
  isOpen: boolean
  onClose: () => void
  isCurrentUserSeller?: boolean
  onUpdateStatus?: (status: 'ACTIVE' | 'ON_HOLD' | 'SOLD') => Promise<void>
  userLocation?: { lat: number; lng: number } | null
}

function formatDate(value?: string) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function DetailSection({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <section className="space-y-3 border-t border-white/10 pt-4 first:border-t-0 first:pt-0">
      <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">{title}</h3>
      {children}
    </section>
  )
}

function DetailCard({
  label,
  value,
  icon,
}: {
  label: string
  value: ReactNode
  icon?: ReactNode
}) {
  if (value === null || value === undefined || value === '') return null

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
      <div className="mb-1 flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
        {icon}
        <span>{label}</span>
      </div>
      <div className="text-sm font-medium text-foreground">{value}</div>
    </div>
  )
}

function TokenRow({
  items,
  emptyLabel,
}: {
  items?: string[]
  emptyLabel?: string
}) {
  const values = (items ?? []).filter(Boolean)
  if (values.length === 0) {
    return emptyLabel ? <p className="text-sm text-muted-foreground">{emptyLabel}</p> : null
  }

  return (
    <div className="flex flex-wrap gap-2">
      {values.map((item) => (
        <span key={item} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-foreground/90">
          {item}
        </span>
      ))}
    </div>
  )
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
  const navigate = useNavigate()
  const { startChat } = useChat()
  const { addToCart } = useCart()
  const [isUpdating, setIsUpdating] = useState(false)
  const [mapOpen, setMapOpen] = useState(false)
  const [activeImageIndex, setActiveImageIndex] = useState(0)

  useEffect(() => {
    setActiveImageIndex(0)
  }, [listing?.id])

  const images = useMemo(() => (listing ? getListingImages(listing) : []), [listing])

  if (!listing) return null

  const isLeasing = isLeasingListing(listing)
  const distanceText =
    userLocation && listing.latitude != null && listing.longitude != null
      ? getDistanceText(userLocation, { lat: listing.latitude, lng: listing.longitude })
      : null
  const metaRow = [timeAgo(listing.createdAt, ''), distanceText].filter(Boolean).join(' · ')
  const statusLabel = listing.status === 'ACTIVE' ? 'Active' : listing.status === 'ON_HOLD' ? 'On hold' : 'Sold'
  const leasingBadges = getLeasingBadgeLabels(listing)
  const activeImage = images[Math.min(activeImageIndex, Math.max(images.length - 1, 0))]

  const handleSaveItem = () => {
    addToCart(listing)
    toast({
      title: 'Saved item',
      description: `${listing.title} has been added to Saved Items.`,
    })
  }

  const handleContactSeller = () => {
    const emailSubject = encodeURIComponent(
      `${isLeasing ? 'Interest in your lease posting' : 'Interest in your listing'}: ${listing.title}`
    )
    const emailBody = encodeURIComponent(
      `Hi ${listing.sellerName},\n\nI'm interested in your ${isLeasing ? 'lease posting' : 'listing'} "${listing.title}" on Everything UMass.`
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

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="h-[92vh] max-h-[92vh] max-w-[min(1100px,96vw)] gap-0 overflow-hidden border-white/10 bg-[#161616] p-0 text-foreground shadow-2xl">
          <DialogHeader className="border-b border-white/10 bg-white/[0.02] px-6 py-5 text-left">
            <div className="flex items-start justify-between gap-4 pr-10">
              <div className="min-w-0 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-primary/35 bg-primary/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-primary/90">
                    {isLeasing ? 'Leasing' : 'Marketplace'}
                  </span>
                  {leasingBadges.map((badge) => (
                    <span key={badge} className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-foreground/85">
                      {badge}
                    </span>
                  ))}
                  {listing.mustGoBy && new Date(listing.mustGoBy) > new Date() && (
                    <span className="rounded-full border border-destructive/30 bg-destructive/12 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-destructive">
                      Must go by {formatDate(listing.mustGoBy)}
                    </span>
                  )}
                </div>

                <DialogTitle className="text-2xl font-semibold leading-tight text-foreground sm:text-[2rem]">
                  {listing.title}
                </DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground">
                  {isLeasing
                    ? 'Review the housing details, photos, transit, and utilities before you message the poster.'
                    : 'Review the listing details, photos, and seller info before you message or save it.'}
                </DialogDescription>
              </div>

              <ShareListingButton listing={listing} variant="button" className="border-white/12 bg-white/[0.03] hover:bg-white/[0.07]" />
            </div>
          </DialogHeader>

          <div className="grid min-h-0 flex-1 grid-cols-1 overflow-hidden lg:grid-cols-[1.15fr_0.85fr]">
            <div className="min-h-0 overflow-y-auto border-b border-white/10 bg-[#111111] lg:border-b-0 lg:border-r">
              {activeImage ? (
                <div className="space-y-4 p-5">
                  <div className="overflow-hidden rounded-[28px] border border-white/10 bg-black/30">
                    <img src={activeImage} alt={listing.title} className="h-[360px] w-full object-cover sm:h-[460px]" />
                  </div>
                  {images.length > 1 && (
                    <div className="grid grid-cols-4 gap-3 sm:grid-cols-5">
                      {images.map((image, index) => (
                        <button
                          key={`${image}-${index}`}
                          type="button"
                          className={`overflow-hidden rounded-2xl border transition ${index === activeImageIndex ? 'border-primary shadow-[0_0_0_1px_rgba(220,38,38,0.35)]' : 'border-white/10 opacity-80 hover:opacity-100'}`}
                          onClick={() => setActiveImageIndex(index)}
                        >
                          <img src={image} alt={`${listing.title} ${index + 1}`} className="h-20 w-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex h-full min-h-[260px] items-center justify-center p-10 text-muted-foreground">
                  No photos uploaded yet
                </div>
              )}
            </div>

            <div className="min-h-0 overflow-y-auto bg-[#161616]">
              <div className="space-y-5 p-6">
                <section className="grid gap-3 sm:grid-cols-2">
                  <DetailCard
                    label={isLeasing ? 'Monthly rent' : 'Price'}
                    value={formatPrice(listing.price)}
                  />
                  <DetailCard
                    label="Posted"
                    value={metaRow || 'Recently'}
                  />
                  {isLeasing ? (
                    <>
                      <DetailCard label="Property" value={listing.propertyName || 'Not provided'} icon={<Home className="h-3.5 w-3.5" />} />
                      <DetailCard label="Area" value={listing.areaLabel || 'Not provided'} icon={<MapPin className="h-3.5 w-3.5" />} />
                      <DetailCard label="Available from" value={formatDate(listing.availableFrom) || 'Not provided'} />
                      <DetailCard label="Lease end" value={formatDate(listing.leaseEnd) || 'Not provided'} />
                      <DetailCard label="Bedrooms" value={listing.bedrooms ?? 'Not provided'} />
                      <DetailCard label="Bathrooms" value={listing.bathrooms ?? 'Not provided'} icon={<Bath className="h-3.5 w-3.5" />} />
                    </>
                  ) : (
                    <>
                      <DetailCard label="Category" value={listing.category || 'Not provided'} />
                      <DetailCard label="Condition" value={listing.condition || 'Not provided'} />
                    </>
                  )}
                </section>

                <DetailSection title="Description">
                  <p className="text-sm leading-7 text-foreground/85">
                    {listing.description || 'No description provided.'}
                  </p>
                </DetailSection>

                {isLeasing && (
                  <>
                    <DetailSection title="Lease + Space">
                      <section className="grid gap-3 sm:grid-cols-2">
                        <DetailCard label="Arrangement" value={formatListingEnum(listing.leaseArrangement) || 'Not provided'} />
                        <DetailCard label="Space type" value={formatListingEnum(listing.spaceType) || 'Not provided'} />
                        {listing.leaseArrangement === 'LEASE_TRANSFER' && (
                          <DetailCard label="Transfer scope" value={formatListingEnum(listing.transferScope) || 'Not provided'} />
                        )}
                        <DetailCard label="Laundry" value={formatListingEnum(listing.laundryType) || 'Not provided'} icon={<Home className="h-3.5 w-3.5" />} />
                      </section>
                      {listing.cleaningNotes && (
                        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                          <div className="mb-1 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Room condition</div>
                          <p className="text-sm leading-6 text-foreground/85">{listing.cleaningNotes}</p>
                        </div>
                      )}
                    </DetailSection>

                    <DetailSection title="Transit + Utilities">
                      <section className="grid gap-3 sm:grid-cols-2">
                        <DetailCard
                          label="Nearest bus stop"
                          value={listing.nearestBusStopName || 'Not provided'}
                          icon={<Bus className="h-3.5 w-3.5" />}
                        />
                        <DetailCard
                          label="Walk time"
                          value={listing.nearestBusStopWalkMinutes ? `${listing.nearestBusStopWalkMinutes} min` : 'Not provided'}
                        />
                        <DetailCard
                          label="Utilities included"
                          value={(listing.includedUtilities ?? []).length > 0 ? (listing.includedUtilities ?? []).join(', ') : 'Not listed'}
                          icon={<Tags className="h-3.5 w-3.5" />}
                        />
                        <DetailCard
                          label="Estimated utility total"
                          value={listing.estimatedUtilitiesMonthlyTotal ? formatPrice(listing.estimatedUtilitiesMonthlyTotal) : 'Not provided'}
                        />
                      </section>
                      {(listing.busRoutes ?? []).length > 0 && (
                        <div>
                          <div className="mb-2 text-xs font-medium text-muted-foreground">Bus routes</div>
                          <TokenRow items={listing.busRoutes} />
                        </div>
                      )}
                      {(listing.electricityEstimate || listing.gasEstimate || listing.waterEstimate || listing.internetEstimate) && (
                        <div className="grid gap-3 sm:grid-cols-2">
                          <DetailCard label="Electricity" value={listing.electricityEstimate ? formatPrice(listing.electricityEstimate) : 'N/A'} />
                          <DetailCard label="Gas" value={listing.gasEstimate ? formatPrice(listing.gasEstimate) : 'N/A'} />
                          <DetailCard label="Water" value={listing.waterEstimate ? formatPrice(listing.waterEstimate) : 'N/A'} />
                          <DetailCard label="Internet" value={listing.internetEstimate ? formatPrice(listing.internetEstimate) : 'N/A'} />
                        </div>
                      )}
                    </DetailSection>

                    <DetailSection title="Amenities">
                      <TokenRow items={listing.amenities} emptyLabel="No amenities listed yet." />
                    </DetailSection>

                    {(listing.externalLinks ?? []).length > 0 && (
                      <DetailSection title="Official links">
                        <div className="flex flex-wrap gap-2">
                          {(listing.externalLinks ?? []).map((link, index) => (
                            <Button key={`${link.url}-${index}`} variant="outline" size="sm" className="border-white/12 bg-white/[0.03] hover:bg-white/[0.07]" asChild>
                              <a href={link.url} target="_blank" rel="noreferrer">
                                <ExternalLink className="mr-2 h-3.5 w-3.5" />
                                {link.label}
                              </a>
                            </Button>
                          ))}
                        </div>
                      </DetailSection>
                    )}
                  </>
                )}

                {listing.latitude != null && listing.longitude != null && (
                  <DetailSection title="Location">
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        {listing.latitude.toFixed(4)}, {listing.longitude.toFixed(4)}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-white/12 bg-white/[0.03] hover:bg-white/[0.07]"
                        onClick={() => setMapOpen(true)}
                      >
                        <Navigation className="mr-2 h-3.5 w-3.5" />
                        Show on map
                      </Button>
                    </div>
                  </DetailSection>
                )}

                <DetailSection title="Seller">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="flex items-center gap-3">
                      {listing.sellerPictureUrl ? (
                        <img src={listing.sellerPictureUrl} alt={listing.sellerName} className="h-11 w-11 rounded-full object-cover" />
                      ) : (
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/[0.06]">
                          <User className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="font-medium text-foreground">{listing.sellerName || 'Seller'}</div>
                        {listing.sellerEmail && (
                          <div className="truncate text-sm text-muted-foreground">{listing.sellerEmail}</div>
                        )}
                      </div>
                    </div>
                    {listing.sellerId && (
                      <Link
                        to={`/profile/${listing.sellerId}`}
                        className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/15"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <User className="h-3.5 w-3.5" />
                        View seller profile & reviews
                      </Link>
                    )}
                  </div>
                </DetailSection>

                {!isCurrentUserSeller && listing.sellerId && (
                  <DetailSection title="Reviews">
                    <SellerReviews sellerId={listing.sellerId} />
                    <CreateReview sellerId={listing.sellerId} sellerName={listing.sellerName} />
                  </DetailSection>
                )}
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 bg-white/[0.02] px-5 py-4">
            {isCurrentUserSeller ? (
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button className="sm:flex-1" asChild>
                  <Link to={`/edit/${listing.id}`}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit posting
                  </Link>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="border-white/12 bg-white/[0.03] hover:bg-white/[0.07] sm:flex-1" disabled={isUpdating}>
                      {listing.status === 'SOLD' ? (
                        <CheckCircle2 className="mr-2 h-4 w-4 text-destructive" />
                      ) : listing.status === 'ON_HOLD' ? (
                        <AlertCircle className="mr-2 h-4 w-4 text-warning" />
                      ) : (
                        <Tags className="mr-2 h-4 w-4 text-success" />
                      )}
                      {statusLabel}
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {listing.status !== 'ACTIVE' && (
                      <DropdownMenuItem onSelect={() => handleStatusUpdate('ACTIVE')}>
                        <Tags className="mr-2 h-4 w-4 text-success" />
                        Active
                      </DropdownMenuItem>
                    )}
                    {listing.status !== 'ON_HOLD' && (
                      <DropdownMenuItem onSelect={() => handleStatusUpdate('ON_HOLD')}>
                        <AlertCircle className="mr-2 h-4 w-4 text-warning" />
                        On hold
                      </DropdownMenuItem>
                    )}
                    {listing.status !== 'SOLD' && (
                      <DropdownMenuItem onSelect={() => handleStatusUpdate('SOLD')}>
                        <CheckCircle2 className="mr-2 h-4 w-4 text-destructive" />
                        Sold
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="grid gap-2 sm:grid-cols-3">
                <Button
                  className="sm:col-span-1"
                  onClick={async () => {
                    const chat = await startChat(listing.id)
                    if (chat) {
                      navigate('/messages')
                    }
                  }}
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Message seller
                </Button>
                <Button variant="outline" className="border-white/12 bg-white/[0.03] hover:bg-white/[0.07]" onClick={handleSaveItem}>
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Save item
                </Button>
                <Button variant="outline" className="border-white/12 bg-white/[0.03] hover:bg-white/[0.07]" onClick={handleContactSeller}>
                  <Mail className="mr-2 h-4 w-4" />
                  Email seller
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {listing.latitude != null && listing.longitude != null && (
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
