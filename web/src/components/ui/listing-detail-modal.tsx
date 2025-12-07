import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './dialog'
import { Button } from './button'
import { DollarSign, Calendar, MapPin, Mail, MessageCircle, Tags, CheckCircle2, AlertCircle } from 'lucide-react'
import { formatPrice, formatDate } from '@/lib/utils'
import type { Listing } from '@/lib/api'
import { apiClient } from '@/lib/api'
import { useState } from 'react'
import { useToast } from '@/hooks/use-toast'
import { useChat } from '@/contexts/ChatContext'
import { useNavigate } from 'react-router-dom'
import { SellerReviews } from '@/components/SellerReviews'
import { CreateReview } from '@/components/CreateReview'

interface ListingDetailModalProps {
  listing: Listing | null
  isOpen: boolean
  onClose: () => void
  isCurrentUserSeller?: boolean
  onUpdateStatus?: (status: 'ACTIVE' | 'ON_HOLD' | 'SOLD') => Promise<void>
}

export function ListingDetailModal({ 
  listing, 
  isOpen, 
  onClose,
  isCurrentUserSeller = false,
  onUpdateStatus 
}: ListingDetailModalProps) {
  const { toast } = useToast()
  const [isUpdating, setIsUpdating] = useState(false)
  const navigate = useNavigate()
  const { startChat } = useChat()

  if (!listing) return null

  const handleContactSeller = () => {
    const emailSubject = encodeURIComponent(`Interest in your listing: ${listing.title}`)
    const emailBody = encodeURIComponent(
      `Hi ${listing.sellerName},\n\nI'm interested in your listing "${listing.title}" on UMass Marketplace.`
    )
    window.location.href = `mailto:${listing.sellerEmail}?subject=${emailSubject}&body=${emailBody}`
  }

  const handleStatusUpdate = async (newStatus: 'ACTIVE' | 'ON_HOLD' | 'SOLD') => {
    if (!onUpdateStatus) return

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
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>{listing.title}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
            <div className="flex flex-col gap-4 py-4 overflow-y-auto flex-1 min-h-0 pr-2">
              {listing.imageUrl && (
                <div className="w-full aspect-video overflow-hidden rounded-lg flex-shrink-0 relative z-0 mb-4">
                  <img
                    src={listing.imageUrl}
                    alt={listing.title}
                    className="w-full h-full object-cover relative z-0"
                  />
                </div>
              )}
              <div className="space-y-4 flex-shrink-0 relative z-10">
            <div>
              <div className="flex items-center text-3xl font-bold text-primary mb-2">
                <DollarSign className="h-6 w-6 mr-1" />
                {formatPrice(listing.price)}
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 mr-1" />
                Listed {formatDate(listing.createdAt)}
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold">Description</h4>
              <p className="text-muted-foreground">
                {listing.description || 'No description provided'}
              </p>
            </div>

            {(listing.category || listing.condition) && (
              <div className="grid grid-cols-2 gap-4">
                {listing.category && (
                  <div>
                    <h4 className="font-semibold">Category</h4>
                    <p className="text-muted-foreground">{listing.category}</p>
                  </div>
                )}
                {listing.condition && (
                  <div>
                    <h4 className="font-semibold">Condition</h4>
                    <p className="text-muted-foreground">{listing.condition}</p>
                  </div>
                )}
              </div>
            )}

            <div className="border-t pt-4">
              <h4 className="font-semibold mb-2">Seller Information</h4>
              <div className="space-y-2">
                <div className="flex items-center text-muted-foreground">
                  <Mail className="h-4 w-4 mr-2" />
                  {listing.sellerPictureUrl && (
                    <img src={listing.sellerPictureUrl} alt={listing.sellerName} className="h-6 w-6 rounded-full mr-2" />
                  )}
                  {listing.sellerName} ({listing.sellerEmail})
                </div>
              </div>
            </div>

            {/* Seller Reviews Section */}
            {!isCurrentUserSeller && listing.sellerId && (
              <div className="border-t pt-4 space-y-4">
                <h4 className="font-semibold mb-2">Seller Reviews</h4>
                <SellerReviews sellerId={listing.sellerId} />
                <CreateReview 
                  sellerId={listing.sellerId} 
                  sellerName={listing.sellerName}
                />
              </div>
            )}
              </div>
            </div>
            <div className="flex gap-2 pt-4 border-t flex-shrink-0 bg-background">
              {isCurrentUserSeller ? (
                <div className="flex gap-2 w-full">
                  {listing.status !== 'SOLD' && (
                    <Button
                      onClick={() => handleStatusUpdate('SOLD')}
                      disabled={isUpdating}
                      className="flex-1"
                      variant="default"
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Mark as Sold
                    </Button>
                  )}
                  {listing.status === 'ACTIVE' ? (
                    <Button
                      onClick={() => handleStatusUpdate('ON_HOLD')}
                      disabled={isUpdating}
                      className="flex-1"
                      variant="secondary"
                    >
                      <AlertCircle className="h-4 w-4 mr-2" />
                      Put on Hold
                    </Button>
                  ) : listing.status === 'ON_HOLD' && (
                    <Button
                      onClick={() => handleStatusUpdate('ACTIVE')}
                      disabled={isUpdating}
                      className="flex-1"
                      variant="secondary"
                    >
                      <Tags className="h-4 w-4 mr-2" />
                      Make Active
                    </Button>
                  )}
                </div>
              ) : (
                <>
                  <Button onClick={handleContactSeller} className="flex-1">
                    <Mail className="h-4 w-4 mr-2" />
                    Contact Seller
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1"
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
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Start Chat
                  </Button>
                </>
              )}
            </div>
          </div>
        </DialogContent>
    </Dialog>
  </>
  )
}