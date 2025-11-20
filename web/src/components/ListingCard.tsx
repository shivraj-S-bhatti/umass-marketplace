import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Calendar, DollarSign } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { apiClient, type Listing } from '@/lib/api'

export function ListingCard({ listing }: { listing: Listing }) {
  const navigate = useNavigate()
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800'
      case 'ON_HOLD':
        return 'bg-yellow-100 text-yellow-800'
      case 'SOLD':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

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
      year: 'numeric',
    })
  }

  const handleEdit = () => {
    navigate(`/edit/${listing.id}`)
  }

  const handleStatusUpdate = async (newStatus: string) => {
    try {
      const actionMap = {
        'ACTIVE': 'Reactivating',
        'ON_HOLD': 'Putting on hold',
        'SOLD': 'Marking as sold'
      }

      toast({
        title: `${actionMap[newStatus as keyof typeof actionMap]} listing...`,
        description: 'Please wait while we update the listing status.',
      })
      
      await apiClient.updateListing(listing.id, {
        ...listing,
        status: newStatus as 'ACTIVE' | 'ON_HOLD' | 'SOLD'
      })

      await queryClient.invalidateQueries({ queryKey: ['listings'] })
      await queryClient.invalidateQueries({ queryKey: ['listings-stats'] })
      
      toast({
        title: 'Success!',
        description: `Listing has been ${newStatus === 'ACTIVE' ? 'reactivated' : newStatus === 'ON_HOLD' ? 'put on hold' : 'marked as sold'}.`,
        variant: 'default',
      })
    } catch (error) {
      console.error('Failed to update listing status:', error)
      toast({
        title: 'Error',
        description: 'Failed to update listing status. Please try again.',
        variant: 'destructive',
      })
    }
  }

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow">
        {listing.imageUrl && (
          <div 
            className="w-full h-48 overflow-hidden rounded-t-lg cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => setIsImageModalOpen(true)}
          >
            <img
              src={listing.imageUrl}
              alt={listing.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg line-clamp-2">{listing.title}</CardTitle>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(listing.status)}`}>
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
              Listed {formatDate(listing.createdAt)}
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
          <div className="mt-4 space-y-2">
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="flex-1" onClick={handleEdit}>
                Edit
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {listing.status === 'ACTIVE' && (
                <>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => handleStatusUpdate('ON_HOLD')}
                  >
                    Put On Hold
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => handleStatusUpdate('SOLD')}
                  >
                    Mark Sold
                  </Button>
                </>
              )}
              {listing.status !== 'ACTIVE' && (
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => handleStatusUpdate('ACTIVE')}
                >
                  Reactivate
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Image Modal */}
      {isImageModalOpen && listing.imageUrl && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setIsImageModalOpen(false)}
        >
          <div className="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center p-4">
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

            <img
              src={listing.imageUrl}
              alt={listing.title}
              className="max-w-full max-h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />

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