"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Star, MessageSquare, ThumbsUp, ThumbsDown } from "lucide-react"

interface Review {
  id: string
  reviewerName: string
  reviewerImage?: string
  rating: number
  comment: string
  date: string
  helpful: number
  type: "property" | "landlord" | "tenant"
  verified: boolean
}

interface ReviewSystemProps {
  targetId: string
  targetName: string
  targetType: "property" | "landlord" | "tenant"
  reviews: Review[]
  canReview?: boolean
  onSubmitReview?: (rating: number, comment: string) => void
}

const StarRating = ({
  rating,
  size = "sm",
  interactive = false,
  onRatingChange,
}: {
  rating: number
  size?: "sm" | "md" | "lg"
  interactive?: boolean
  onRatingChange?: (rating: number) => void
}) => {
  const [hoverRating, setHoverRating] = useState(0)
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  }

  return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${sizeClasses[size]} ${
            star <= (interactive ? hoverRating || rating : rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
          } ${interactive ? "cursor-pointer hover:scale-110 transition-transform" : ""}`}
          onClick={() => interactive && onRatingChange?.(star)}
          onMouseEnter={() => interactive && setHoverRating(star)}
          onMouseLeave={() => interactive && setHoverRating(0)}
        />
      ))}
    </div>
  )
}

export default function ReviewSystem({
  targetId,
  targetName,
  targetType,
  reviews,
  canReview = false,
  onSubmitReview,
}: ReviewSystemProps) {
  const [showReviewDialog, setShowReviewDialog] = useState(false)
  const [newRating, setNewRating] = useState(0)
  const [newComment, setNewComment] = useState("")

  const averageRating =
    reviews.length > 0 ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0

  const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: reviews.filter((r) => r.rating === rating).length,
    percentage: reviews.length > 0 ? (reviews.filter((r) => r.rating === rating).length / reviews.length) * 100 : 0,
  }))

  const handleSubmitReview = () => {
    if (newRating === 0 || !newComment.trim()) return

    onSubmitReview?.(newRating, newComment)
    setShowReviewDialog(false)
    setNewRating(0)
    setNewComment("")
  }

  return (
    <div className="space-y-6">
      {/* Review Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Star className="w-5 h-5 mr-2" />
              Reviews & Ratings
            </CardTitle>
            {canReview && (
              <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Write Review
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Write a Review</DialogTitle>
                    <DialogDescription>Share your experience with {targetName}</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Rating</Label>
                      <div className="flex items-center space-x-2">
                        <StarRating rating={newRating} size="lg" interactive onRatingChange={setNewRating} />
                        <span className="text-sm text-muted-foreground">
                          {newRating > 0 ? `${newRating} star${newRating !== 1 ? "s" : ""}` : "Select rating"}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Your Review</Label>
                      <Textarea
                        placeholder={`Tell others about your experience with ${targetName}...`}
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="min-h-[100px]"
                      />
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" onClick={() => setShowReviewDialog(false)} className="flex-1">
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSubmitReview}
                        disabled={newRating === 0 || !newComment.trim()}
                        className="flex-1"
                      >
                        Submit Review
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {reviews.length > 0 ? (
            <div className="space-y-4">
              {/* Overall Rating */}
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <div className="text-3xl font-bold">{averageRating.toFixed(1)}</div>
                  <StarRating rating={Math.round(averageRating)} size="md" />
                  <div className="text-sm text-muted-foreground mt-1">
                    {reviews.length} review{reviews.length !== 1 ? "s" : ""}
                  </div>
                </div>
                <div className="flex-1 space-y-2">
                  {ratingDistribution.map(({ rating, count, percentage }) => (
                    <div key={rating} className="flex items-center space-x-2 text-sm">
                      <span className="w-8">{rating}★</span>
                      <div className="flex-1 bg-muted rounded-full h-2">
                        <div
                          className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="w-8 text-muted-foreground">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Star className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No reviews yet</p>
              <p className="text-sm text-muted-foreground">Be the first to leave a review!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Individual Reviews */}
      {reviews.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Reviews ({reviews.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {reviews.map((review, index) => (
                <div key={review.id}>
                  <div className="flex items-start space-x-4">
                    <Avatar>
                      <AvatarImage src={review.reviewerImage || "/placeholder.svg"} />
                      <AvatarFallback>
                        {review.reviewerName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold">{review.reviewerName}</span>
                          {review.verified && (
                            <Badge variant="secondary" className="text-xs">
                              Verified
                            </Badge>
                          )}
                        </div>
                        <span className="text-sm text-muted-foreground">{review.date}</span>
                      </div>
                      <StarRating rating={review.rating} size="sm" />
                      <p className="text-sm leading-relaxed">{review.comment}</p>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <button className="flex items-center space-x-1 hover:text-foreground transition-colors">
                          <ThumbsUp className="w-3 h-3" />
                          <span>Helpful ({review.helpful})</span>
                        </button>
                        <button className="flex items-center space-x-1 hover:text-foreground transition-colors">
                          <ThumbsDown className="w-3 h-3" />
                          <span>Not helpful</span>
                        </button>
                      </div>
                    </div>
                  </div>
                  {index < reviews.length - 1 && <Separator className="mt-6" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
