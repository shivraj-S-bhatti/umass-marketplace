import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { getListings, type Listing } from '@/lib/api'
import { Search, DollarSign, Calendar } from 'lucide-react'

// Home Page - displays marketplace listings with search and filter capabilities
// Main landing page where users can browse available items for sale
export default function HomePage() {
  const { data: listingsData, isLoading, error } = useQuery({
    queryKey: ['listings'],
    queryFn: () => getListings(0, 12),
  })

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">UMass Marketplace</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Buy and sell items with fellow students
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
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
        <h1 className="text-4xl font-bold mb-4">UMass Marketplace</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Buy and sell items with fellow students
        </p>
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 max-w-md mx-auto">
          <p className="text-destructive">Failed to load listings. Please try again later.</p>
        </div>
      </div>
    )
  }

  const listings = listingsData?.content || []

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">UMass Marketplace</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Buy and sell items with fellow students
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg">
            <Link to="/sell">Sell an Item</Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link to="/dashboard">My Dashboard</Link>
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="max-w-md mx-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <input
            type="text"
            placeholder="Search items..."
            className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      {/* Listings Grid */}
      <div>
        <h2 className="text-2xl font-semibold mb-6">Recent Listings</h2>
        {listings.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No listings available yet.</p>
            <Button asChild>
              <Link to="/sell">Be the first to sell an item!</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Individual listing card component
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
            {formatDate(listing.createdAt)}
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
      </CardContent>
    </Card>
  )
}
