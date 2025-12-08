import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Mail, User } from 'lucide-react'
import { SellerReviews } from '@/components/SellerReviews'
import { CreateReview } from '@/components/CreateReview'
import { getSellerReviewStats, getUser, type SellerReviewStats } from '@/lib/api'
import { useState, useEffect } from 'react'

export default function SellerProfilePage() {
  const { sellerId } = useParams<{ sellerId: string }>()
  const navigate = useNavigate()
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  // Get current user ID
  useEffect(() => {
    const userId = localStorage.getItem('userId')
    setCurrentUserId(userId)
  }, [])

  // Get seller info
  const { data: sellerInfo, isLoading: sellerInfoLoading } = useQuery({
    queryKey: ['user', sellerId],
    queryFn: () => getUser(sellerId!),
    enabled: !!sellerId,
  })

  // Get seller review stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['reviewStats', sellerId],
    queryFn: () => getSellerReviewStats(sellerId!),
    enabled: !!sellerId,
  })

  const isCurrentUser = currentUserId === sellerId

  if (!sellerId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-muted-foreground">Invalid seller ID</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Button
        variant="ghost"
        onClick={() => navigate(-1)}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      {/* Seller Info Card */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-4">
            {sellerInfoLoading ? (
              <div className="h-16 w-16 rounded-full bg-muted animate-pulse"></div>
            ) : sellerInfo?.pictureUrl ? (
              <img
                src={sellerInfo.pictureUrl}
                alt={sellerInfo.name || 'Seller'}
                className="h-16 w-16 rounded-full"
              />
            ) : (
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                <User className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
            <div>
              <CardTitle className="text-2xl">
                {sellerInfoLoading ? (
                  <div className="h-6 w-48 bg-muted animate-pulse rounded"></div>
                ) : (
                  sellerInfo?.name || 'Seller Profile'
                )}
              </CardTitle>
              {sellerInfo?.email && (
                <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  {sellerInfo.email}
                </p>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {statsLoading ? (
            <div className="h-20 bg-muted animate-pulse rounded"></div>
          ) : stats && stats.totalReviews > 0 ? (
            <div className="flex items-center gap-4">
              <div className="text-3xl font-bold">
                {stats.averageRating.toFixed(1)} ⭐
              </div>
              <div className="text-sm text-muted-foreground">
                Based on {stats.totalReviews} review{stats.totalReviews !== 1 ? 's' : ''}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No reviews yet
            </p>
          )}
        </CardContent>
      </Card>

      {/* Reviews Section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Reviews</h2>
        <SellerReviews sellerId={sellerId} />
        
        {/* Show create review form only if not the current user's own profile */}
        {!isCurrentUser && (
          <CreateReview 
            sellerId={sellerId} 
            sellerName={sellerInfo?.name}
          />
        )}
        
        {/* Show message if viewing own profile */}
        {isCurrentUser && (
          <Card>
            <CardContent className="py-6 text-center text-muted-foreground">
              <p>This is your profile. Other buyers can see your reviews here.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

