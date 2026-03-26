import { useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Search, SlidersHorizontal, LayoutGrid, LayoutList, Home, ArrowRightLeft } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader } from '@/shared/components/ui/card'
import { Input } from '@/shared/components/ui/input'
import { apiClient, type Listing } from '@/features/marketplace/api/api'
import { useListingsView } from '@/shared/contexts/ListingsViewContext'
import { ListingCard } from '@/shared/components/ListingCard'
import { ListingDetailModal } from '@/shared/components/ui/listing-detail-modal'
import { useUser } from '@/shared/contexts/UserContext'
import { useCart } from '@/shared/contexts/CartContext'
import { useToast } from '@/shared/hooks/use-toast'

const LEASE_ARRANGEMENTS = [
  { value: '', label: 'Any arrangement' },
  { value: 'SUBLET', label: 'Sublet' },
  { value: 'LEASE_TRANSFER', label: 'Lease transfer' },
]

const SPACE_TYPES = [
  { value: '', label: 'Any space type' },
  { value: 'ENTIRE_UNIT', label: 'Entire unit' },
  { value: 'PRIVATE_ROOM', label: 'Private room' },
  { value: 'SHARED_ROOM', label: 'Shared room' },
  { value: 'CONVERTED_LIVING_ROOM', label: 'Converted living room' },
]

type LeasingFilters = {
  query: string
  minPrice?: number
  maxPrice?: number
  leaseArrangement: string
  spaceType: string
}

const DEFAULT_FILTERS: LeasingFilters = {
  query: '',
  minPrice: undefined,
  maxPrice: undefined,
  leaseArrangement: '',
  spaceType: '',
}

export default function LeasingHomePage() {
  const queryClient = useQueryClient()
  const { view, setView } = useListingsView()
  const { user } = useUser()
  const { addToCart } = useCart()
  const { toast } = useToast()
  const [draftFilters, setDraftFilters] = useState<LeasingFilters>(DEFAULT_FILTERS)
  const [activeFilters, setActiveFilters] = useState<LeasingFilters>(DEFAULT_FILTERS)
  const [currentPage, setCurrentPage] = useState(0)
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null)
  const pageSize = 12

  const { data: listingsData, isLoading, error } = useQuery({
    queryKey: ['leasing-listings', activeFilters, currentPage],
    queryFn: () => apiClient.getListings({
      page: currentPage,
      size: pageSize,
      kind: 'LEASING',
      q: activeFilters.query || undefined,
      minPrice: activeFilters.minPrice,
      maxPrice: activeFilters.maxPrice,
      leaseArrangement: activeFilters.leaseArrangement || undefined,
      spaceType: activeFilters.spaceType || undefined,
    }),
  })

  const listings = listingsData?.content ?? []
  const hasActiveFilters = Boolean(
    activeFilters.query ||
    activeFilters.minPrice != null ||
    activeFilters.maxPrice != null ||
    activeFilters.leaseArrangement ||
    activeFilters.spaceType
  )

  const resultsCopy = useMemo(() => {
    if (!listingsData) return null
    return `${listingsData.totalElements} lease post${listingsData.totalElements === 1 ? '' : 's'}`
  }, [listingsData])

  const applyFilters = () => {
    setActiveFilters(draftFilters)
    setCurrentPage(0)
  }

  const clearFilters = () => {
    setDraftFilters(DEFAULT_FILTERS)
    setActiveFilters(DEFAULT_FILTERS)
    setCurrentPage(0)
  }

  if (isLoading) {
    return (
      <div className="flex-1 overflow-y-auto">
        <div className="w-full max-w-[1440px] mx-auto px-4 py-5 space-y-6">
          <div className="space-y-2">
            <div className="h-4 w-28 rounded bg-muted animate-pulse" />
            <div className="h-9 w-80 rounded bg-muted animate-pulse" />
            <div className="h-4 w-[32rem] rounded bg-muted animate-pulse" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-36 bg-muted rounded-lg" />
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                  <div className="h-10 bg-muted rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return (
      <div className="w-full max-w-[1440px] mx-auto px-4 py-8">
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 max-w-xl space-y-2">
          <p className="text-destructive font-medium">Failed to load lease posts.</p>
          <p className="text-sm text-muted-foreground break-words">{message}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
      <section className="border-b border-border bg-card">
        <div className="w-full max-w-[1440px] mx-auto px-4 py-6 space-y-6">
          <div className="max-w-4xl space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-3 py-1 text-xs font-medium text-muted-foreground">
              <Home className="h-3.5 w-3.5" />
              Leasing
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
                Sublets and transfers without the off-campus lag.
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground max-w-3xl">
                Browse room-level and unit-level lease posts with transit, utilities, amenities, gallery photos, and direct messaging built in.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,2fr)_repeat(4,minmax(0,1fr))] gap-3">
            <div className="relative xl:col-span-2">
              <Input
                placeholder="Search by property, area, room type, or title"
                value={draftFilters.query}
                onChange={(e) => setDraftFilters((prev) => ({ ...prev, query: e.target.value }))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') applyFilters()
                }}
                className="pr-11 h-11"
              />
              <Button
                size="icon"
                className="absolute right-1 top-1/2 h-9 w-9 -translate-y-1/2"
                onClick={applyFilters}
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
            <Input
              type="number"
              min="0"
              placeholder="Min rent"
              value={draftFilters.minPrice ?? ''}
              onChange={(e) => setDraftFilters((prev) => ({ ...prev, minPrice: e.target.value ? Number(e.target.value) : undefined }))}
              className="h-11"
            />
            <Input
              type="number"
              min="0"
              placeholder="Max rent"
              value={draftFilters.maxPrice ?? ''}
              onChange={(e) => setDraftFilters((prev) => ({ ...prev, maxPrice: e.target.value ? Number(e.target.value) : undefined }))}
              className="h-11"
            />
            <select
              value={draftFilters.leaseArrangement}
              onChange={(e) => setDraftFilters((prev) => ({ ...prev, leaseArrangement: e.target.value }))}
              className="h-11 rounded-lg border border-border bg-background px-3 text-sm"
            >
              {LEASE_ARRANGEMENTS.map((option) => (
                <option key={option.value || 'all'} value={option.value}>{option.label}</option>
              ))}
            </select>
            <select
              value={draftFilters.spaceType}
              onChange={(e) => setDraftFilters((prev) => ({ ...prev, spaceType: e.target.value }))}
              className="h-11 rounded-lg border border-border bg-background px-3 text-sm"
            >
              {SPACE_TYPES.map((option) => (
                <option key={option.value || 'all'} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <SlidersHorizontal className="h-4 w-4" />
              <span>Filter by rent, arrangement, and space type.</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {hasActiveFilters && (
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Clear filters
                </Button>
              )}
              <div className="flex border border-border rounded-lg overflow-hidden" role="group" aria-label="Listings view">
                <button
                  type="button"
                  onClick={() => setView('compact')}
                  className={`p-2 transition-colors ${view === 'compact' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'}`}
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setView('sparse')}
                  className={`p-2 border-l border-border transition-colors ${view === 'sparse' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'}`}
                >
                  <LayoutList className="h-4 w-4" />
                </button>
              </div>
              <Button asChild size="sm">
                <Link to="/leasings/sell">Post a lease</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full max-w-[1440px] mx-auto px-4 py-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-foreground">{resultsCopy}</p>
            <p className="text-xs text-muted-foreground">
              Room-level posts include the housing details students usually have to DM for.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <ArrowRightLeft className="h-4 w-4" />
            Message and share work the same way as marketplace listings.
          </div>
        </div>

        {listings.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-16 text-center space-y-4">
              <Home className="h-12 w-12 text-muted-foreground mx-auto" />
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">
                  {hasActiveFilters ? 'No lease posts match those filters' : 'No lease posts yet'}
                </h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  {hasActiveFilters
                    ? 'Try loosening the rent or room filters, or search by community name instead.'
                    : 'Be the first to post a sublet or transfer with room photos, utilities, and transit details.'}
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {hasActiveFilters && (
                  <Button variant="outline" onClick={clearFilters}>Show all posts</Button>
                )}
                <Button asChild>
                  <Link to="/leasings/sell">Post a lease</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className={view === 'compact'
              ? 'grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-3'
              : 'grid grid-cols-[repeat(auto-fill,minmax(270px,1fr))] gap-4'
            }>
              {listings.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  compact={view === 'compact'}
                  onViewListing={(item) => setSelectedListing(item as Listing)}
                  onAddToShoppingList={user ? (item) => {
                    addToCart(item as Listing)
                    toast({
                      title: 'Added to Saved Items',
                      description: `${item.title} has been added.`,
                    })
                  } : undefined}
                />
              ))}
            </div>

            {listingsData && listingsData.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-2">
                <Button variant="outline" onClick={() => setCurrentPage(0)} disabled={currentPage === 0}>
                  First
                </Button>
                <Button variant="outline" onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 0}>
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground px-2">
                  Page {currentPage + 1} of {listingsData.totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === listingsData.totalPages - 1}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}

        <ListingDetailModal
          listing={selectedListing}
          isOpen={selectedListing !== null}
          onClose={() => setSelectedListing(null)}
          isCurrentUserSeller={user?.id === selectedListing?.sellerId}
          onUpdateStatus={
            user?.id === selectedListing?.sellerId && selectedListing
              ? async (newStatus) => {
                  await apiClient.updateListing(selectedListing.id, { ...selectedListing, status: newStatus })
                  queryClient.invalidateQueries({ queryKey: ['leasing-listings'] })
                  queryClient.invalidateQueries({ queryKey: ['listings'] })
                  setSelectedListing(null)
                }
              : undefined
          }
        />
      </section>
    </div>
  )
}
