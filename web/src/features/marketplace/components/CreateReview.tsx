import { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Star } from 'lucide-react'
import { cn } from '@/shared/lib/utils/utils'
import { createReview, hasUserReviewedSeller, type CreateReviewRequest } from '@/features/marketplace/api/api'
import { useToast } from '@/shared/hooks/use-toast'

interface CreateReviewProps {
  sellerId: string
  sellerName?: string
  onReviewSubmitted?: () => void
}

export function CreateReview({ sellerId, sellerName, onReviewSubmitted }: CreateReviewProps) {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState('')
  const [hasReviewed, setHasReviewed] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  const { toast } = useToast()
  const queryClient = useQueryClient()

  // Check if user has already reviewed
  useEffect(() => {
    const checkReviewStatus = async () => {
      try {
        const reviewed = await hasUserReviewedSeller(sellerId)
        setHasReviewed(reviewed)
      } catch (error) {
        // If user is not logged in or there's an error, allow them to try
        // The backend will handle authentication when submitting
        console.error('Failed to check review status:', error)
        setHasReviewed(false)
      } finally {
        setIsChecking(false)
      }
    }
    checkReviewStatus()
  }, [sellerId])

  const createReviewMutation = useMutation({
    mutationFn: (data: CreateReviewRequest) => createReview(data),
    onSuccess: () => {
      toast({
        title: 'Review submitted',
        description: 'Thank you for your review!',
      })
      setRating(0)
      setComment('')
      setHasReviewed(true)
      // Invalidate queries to refresh reviews
      queryClient.invalidateQueries({ queryKey: ['reviews', sellerId] })
      queryClient.invalidateQueries({ queryKey: ['reviewStats', sellerId] })
      if (onReviewSubmitted) {
        onReviewSubmitted()
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit review. Please try again.',
        variant: 'destructive',
      })
    },
  })

  const handleSubmit = () => {
    if (rating === 0) {
      toast({
        title: 'Rating required',
        description: 'Please select a rating before submitting.',
        variant: 'destructive',
      })
      return
    }

    createReviewMutation.mutate({
      sellerId,
      rating,
      comment: comment.trim() || undefined,
    })
  }

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, i) => {
      const starValue = i + 1
      const isFilled = starValue <= (hoveredRating || rating)
      
      return (
        <button
          key={i}
          type="button"
          onClick={() => setRating(starValue)}
          onMouseEnter={() => setHoveredRating(starValue)}
          onMouseLeave={() => setHoveredRating(0)}
          className="focus:outline-none"
          disabled={createReviewMutation.isPending}
        >
          <Star
            className={`h-8 w-8 transition-colors ${
              isFilled
                ? 'fill-yellow-400 text-yellow-400'
                : 'fill-gray-200 text-gray-200'
            } ${
              createReviewMutation.isPending
                ? 'opacity-50 cursor-not-allowed'
                : 'cursor-pointer hover:fill-yellow-300 hover:text-yellow-300'
            }`}
          />
        </button>
      )
    })
  }

  if (isChecking) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="h-4 bg-muted animate-pulse rounded w-1/2"></div>
        </CardContent>
      </Card>
    )
  }

  if (hasReviewed) {
    return (
      <p className="text-xs text-muted-foreground text-center italic">
        You have already reviewed this seller.
      </p>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          Leave a Review{sellerName && ` for ${sellerName}`}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Rating</label>
          <div className="flex items-center gap-2">
            {renderStars()}
            {rating > 0 && (
              <span className="text-sm text-muted-foreground ml-2">
                {rating} star{rating !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="comment" className="text-sm font-medium mb-2 block">
            Comment (optional)
          </label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience with this seller..."
            rows={4}
            disabled={createReviewMutation.isPending}
            className={cn(
              "flex w-full rounded-comic border-2 border-foreground bg-card px-3 py-2 text-sm font-medium ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
            )}
          />
        </div>

        <Button
          onClick={handleSubmit}
          disabled={rating === 0 || createReviewMutation.isPending}
          className="w-full"
        >
          {createReviewMutation.isPending ? 'Submitting...' : 'Submit Review'}
        </Button>
      </CardContent>
    </Card>
  )
}

