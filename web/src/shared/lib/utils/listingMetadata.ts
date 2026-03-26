import type { Listing } from '@/features/marketplace/api/api'

const TITLE_CASE: Record<string, string> = {
  MARKETPLACE: 'Marketplace',
  LEASING: 'Leasing',
  SUBLET: 'Sublet',
  LEASE_TRANSFER: 'Lease transfer',
  ENTIRE_UNIT: 'Entire unit',
  ROOMS_ONLY: 'Rooms only',
  PRIVATE_ROOM: 'Private room',
  SHARED_ROOM: 'Shared room',
  CONVERTED_LIVING_ROOM: 'Converted living room',
  IN_UNIT: 'In-unit laundry',
  ON_SITE: 'On-site laundry',
  ON_FLOOR: 'Laundry on floor',
  NONE: 'No laundry',
}

export function formatListingEnum(value?: string | null) {
  if (!value) return null
  return TITLE_CASE[value] ?? value.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase())
}

export function getListingImages(listing: Listing) {
  const gallery = (listing.imageUrls ?? []).filter(Boolean)
  if (gallery.length > 0) return gallery
  return listing.imageUrl ? [listing.imageUrl] : []
}

export function isLeasingListing(listing?: Listing | null) {
  return listing?.kind === 'LEASING'
}

export function getLeasingBadgeLabels(listing: Listing) {
  return [listing.leaseArrangement, listing.transferScope, listing.spaceType]
    .map(formatListingEnum)
    .filter((value): value is string => Boolean(value))
}
