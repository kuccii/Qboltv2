import React from 'react';
import { Star, ThumbsUp, Edit2, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Review {
  id: string;
  rating: number;
  review_text?: string;
  quality_rating?: number;
  delivery_rating?: number;
  reliability_rating?: number;
  verified_purchase?: boolean;
  helpful_count?: number;
  created_at: string;
  user_profiles?: {
    name?: string;
    avatar_url?: string;
  };
}

interface SupplierReviewCardProps {
  review: Review;
  onEdit?: (review: Review) => void;
  onDelete?: (reviewId: string) => void;
  onHelpful?: (reviewId: string) => void;
}

export const SupplierReviewCard: React.FC<SupplierReviewCardProps> = ({
  review,
  onEdit,
  onDelete,
  onHelpful
}) => {
  const { currentUser } = useAuth();
  const isOwnReview = currentUser?.id === review.user_id;

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
            {review.user_profiles?.name?.charAt(0) || 'U'}
          </div>
          <div>
            <div className="font-medium text-gray-900">
              {review.user_profiles?.name || 'Anonymous'}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <Star
                    key={rating}
                    className={`h-4 w-4 ${
                      rating <= review.rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-500">
                {new Date(review.created_at).toLocaleDateString()}
              </span>
              {review.verified_purchase && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                  Verified Purchase
                </span>
              )}
            </div>
          </div>
        </div>

        {isOwnReview && (onEdit || onDelete) && (
          <div className="flex items-center gap-2">
            {onEdit && (
              <button
                onClick={() => onEdit(review)}
                className="p-1.5 hover:bg-gray-100 rounded-lg"
                title="Edit review"
              >
                <Edit2 className="h-4 w-4 text-gray-600" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(review.id)}
                className="p-1.5 hover:bg-gray-100 rounded-lg"
                title="Delete review"
              >
                <Trash2 className="h-4 w-4 text-red-600" />
              </button>
            )}
          </div>
        )}
      </div>

      {review.review_text && (
        <p className="text-gray-700 mb-3">{review.review_text}</p>
      )}

      {(review.quality_rating || review.delivery_rating || review.reliability_rating) && (
        <div className="grid grid-cols-3 gap-4 mb-3 pt-3 border-t border-gray-100">
          {review.quality_rating && (
            <div>
              <div className="text-xs text-gray-600 mb-1">Quality</div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <Star
                    key={rating}
                    className={`h-3 w-3 ${
                      rating <= review.quality_rating!
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
          {review.delivery_rating && (
            <div>
              <div className="text-xs text-gray-600 mb-1">Delivery</div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <Star
                    key={rating}
                    className={`h-3 w-3 ${
                      rating <= review.delivery_rating!
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
          {review.reliability_rating && (
            <div>
              <div className="text-xs text-gray-600 mb-1">Reliability</div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <Star
                    key={rating}
                    className={`h-3 w-3 ${
                      rating <= review.reliability_rating!
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {onHelpful && (
        <button
          onClick={() => onHelpful(review.id)}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary-600"
        >
          <ThumbsUp className="h-4 w-4" />
          <span>Helpful ({review.helpful_count || 0})</span>
        </button>
      )}
    </div>
  );
};







