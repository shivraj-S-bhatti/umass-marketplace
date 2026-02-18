// Type definitions - consolidated from api.ts for backward compatibility
// All types are now defined in @/features/marketplace/api/api.ts as the single source of truth
// This file re-exports them for convenience and backward compatibility

export type {
  Chat,
  Message,
  User,
  Listing,
  CreateListingRequest,
  ListingsResponse,
  ListingStats,
  Review,
  CreateReviewRequest,
  ReviewsResponse,
  SellerReviewStats,
} from '@/features/marketplace/api/api'

/** Alias for Listing used by ListingCard and other shared components */
export type { Listing as ListingCardData } from '@/features/marketplace/api/api'