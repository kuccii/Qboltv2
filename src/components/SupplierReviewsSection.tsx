import React, { useState, useEffect } from 'react';
import { Plus, Star } from 'lucide-react';
import { unifiedApi } from '../services/unifiedApi';
import { SupplierReviewStats } from './SupplierReviewStats';
import { SupplierReviewCard } from './SupplierReviewCard';
import { SupplierReviewForm } from './SupplierReviewForm';
import { useAuth } from '../contexts/AuthContext';

interface SupplierReviewsSectionProps {
  supplierId: string;
}

export const SupplierReviewsSection: React.FC<SupplierReviewsSectionProps> = ({ supplierId }) => {
  const { currentUser } = useAuth();
  const [reviews, setReviews] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingReview, setEditingReview] = useState<any>(null);

  useEffect(() => {
    loadReviews();
    loadStats();
  }, [supplierId]);

  const loadReviews = async () => {
    try {
      const data = await unifiedApi.suppliers.getReviews(supplierId);
      setReviews(data);
    } catch (err) {
      console.error('Failed to load reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await unifiedApi.suppliers.getReviewStats(supplierId);
      setStats(data);
    } catch (err) {
      console.error('Failed to load review stats:', err);
    }
  };

  const handleSubmit = async (reviewData: any) => {
    try {
      if (editingReview) {
        await unifiedApi.suppliers.updateReview(editingReview.id, reviewData);
      } else {
        await unifiedApi.suppliers.createReview(supplierId, reviewData);
      }
      setShowForm(false);
      setEditingReview(null);
      loadReviews();
      loadStats();
    } catch (err: any) {
      alert(err.message || 'Failed to submit review');
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    try {
      await unifiedApi.suppliers.deleteReview(reviewId);
      loadReviews();
      loadStats();
    } catch (err: any) {
      alert(err.message || 'Failed to delete review');
    }
  };

  const handleHelpful = async (reviewId: string) => {
    try {
      await unifiedApi.suppliers.markReviewHelpful(reviewId);
      loadReviews();
    } catch (err) {
      console.error('Failed to mark helpful:', err);
    }
  };

  const existingReview = reviews.find(r => r.user_id === currentUser?.id);

  return (
    <div className="space-y-6">
      {/* Review Stats */}
      {stats && <SupplierReviewStats stats={stats} />}

      {/* Review Form */}
      {currentUser && !existingReview && !showForm && !editingReview && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <button
            onClick={() => setShowForm(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
          >
            <Plus className="h-5 w-5 text-gray-600" />
            <span className="font-medium text-gray-700">Write a Review</span>
          </button>
        </div>
      )}

      {(showForm || editingReview) && (
        <SupplierReviewForm
          review={editingReview}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingReview(null);
          }}
        />
      )}

      {/* Reviews List */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Customer Reviews ({reviews.length})
        </h2>

        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No reviews yet. Be the first to review this supplier!
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <SupplierReviewCard
                key={review.id}
                review={review}
                onEdit={existingReview?.id === review.id ? setEditingReview : undefined}
                onDelete={existingReview?.id === review.id ? handleDelete : undefined}
                onHelpful={handleHelpful}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};




