import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Star, User } from 'lucide-react'
import { getReviewsBySeller, getSellerReviewStats, type Review } from '@/features/marketplace/api/api'
import { formatDate } from '@/shared/lib/utils/utils'

interface SellerReviewsProps {
  sellerId: string
}

export function SellerReviews({ sellerId }: SellerReviewsProps) {
  const [currentPage, setCurrentPage] = useState(0)
  const pageSize = 5

  const { data: reviewsData, isLoading: reviewsLoading } = useQuery({
    queryKey: ['reviews', sellerId, currentPage],
    queryFn: () => getReviewsBySeller(sellerId, currentPage, pageSize),
    enabled: !!sellerId,
  })

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['reviewStats', sellerId],
    queryFn: () => getSellerReviewStats(sellerId),
    enabled: !!sellerId,
  })

  const reviews = reviewsData?.content || []
  const totalPages = reviewsData?.totalPages || 0

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating
            ? 'fill-yellow-400 text-yellow-400'
            : 'fill-gray-200 text-gray-200'
        }`}
      />
    ))
  }

  if (statsLoading || reviewsLoading) {
    return (
      <div className="space-y-4">
        <div className="h-20 bg-muted animate-pulse rounded-lg"></div>
        <div className="h-32 bg-muted animate-pulse rounded-lg"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Review Stats */}
      {stats && stats.totalReviews > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Seller Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Star className="h-6 w-6 fill-yellow-400 text-yellow-400" />
                <span className="text-2xl font-bold">
                  {stats.averageRating.toFixed(1)}
                </span>
              </div>
              <div className="text-sm text-muted-foreground">
                Based on {stats.totalReviews} review{stats.totalReviews !== 1 ? 's' : ''}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      <div className="space-y-3">
        <h3 className="font-semibold text-lg">
          Reviews {stats && stats.totalReviews > 0 && `(${stats.totalReviews})`}
        </h3>
        
        {reviews.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              <User className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No reviews yet. Be the first to review this seller!</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {reviews.map((review: Review) => (
              <Card key={review.id}>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {review.buyerPictureUrl ? (
                          <img
                            src={review.buyerPictureUrl}
                            alt={review.buyerName}
                            className="h-8 w-8 rounded-full"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                            <User className="h-4 w-4" />
                          </div>
                        )}
                        <span className="font-medium">{review.buyerName}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(review.createdAt)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {renderStars(review.rating)}
                    </div>
                    {review.comment && (
                      <p className="text-sm text-muted-foreground mt-2">
                        {review.comment}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(0)}
                  disabled={currentPage === 0}
                >
                  First
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 0}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {currentPage + 1} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage >= totalPages - 1}
                >
                  Next
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(totalPages - 1)}
                  disabled={currentPage >= totalPages - 1}
                >
                  Last
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

