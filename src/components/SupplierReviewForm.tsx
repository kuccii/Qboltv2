import React, { useState } from 'react';
import { Star, X } from 'lucide-react';

interface SupplierReviewFormProps {
  review?: any;
  onSubmit: (data: {
    rating: number;
    review_text?: string;
    quality_rating?: number;
    delivery_rating?: number;
    reliability_rating?: number;
    verified_purchase?: boolean;
  }) => void;
  onCancel: () => void;
}

export const SupplierReviewForm: React.FC<SupplierReviewFormProps> = ({
  review,
  onSubmit,
  onCancel
}) => {
  const [rating, setRating] = useState(review?.rating || 0);
  const [qualityRating, setQualityRating] = useState(review?.quality_rating || 0);
  const [deliveryRating, setDeliveryRating] = useState(review?.delivery_rating || 0);
  const [reliabilityRating, setReliabilityRating] = useState(review?.reliability_rating || 0);
  const [reviewText, setReviewText] = useState(review?.review_text || '');
  const [verifiedPurchase, setVerifiedPurchase] = useState(review?.verified_purchase || false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      alert('Please select a rating');
      return;
    }
    onSubmit({
      rating,
      review_text: reviewText || undefined,
      quality_rating: qualityRating || undefined,
      delivery_rating: deliveryRating || undefined,
      reliability_rating: reliabilityRating || undefined,
      verified_purchase: verifiedPurchase
    });
  };

  const StarRating = ({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="focus:outline-none"
          >
            <Star
              className={`h-6 w-6 ${
                star <= value
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300 hover:text-yellow-300'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {review ? 'Edit Review' : 'Write a Review'}
        </h3>
        <button
          onClick={onCancel}
          className="p-1 hover:bg-gray-100 rounded-lg"
        >
          <X className="h-5 w-5 text-gray-600" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <StarRating
          value={rating}
          onChange={setRating}
          label="Overall Rating *"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StarRating
            value={qualityRating}
            onChange={setQualityRating}
            label="Quality"
          />
          <StarRating
            value={deliveryRating}
            onChange={setDeliveryRating}
            label="Delivery"
          />
          <StarRating
            value={reliabilityRating}
            onChange={setReliabilityRating}
            label="Reliability"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Review (Optional)
          </label>
          <textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            placeholder="Share your experience with this supplier..."
          />
        </div>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={verifiedPurchase}
            onChange={(e) => setVerifiedPurchase(e.target.checked)}
            className="rounded border-gray-300"
          />
          <span className="text-sm text-gray-700">I made a purchase from this supplier</span>
        </label>

        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            {review ? 'Update Review' : 'Submit Review'}
          </button>
        </div>
      </form>
    </div>
  );
};




