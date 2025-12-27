import React from 'react';
import { Star } from 'lucide-react';

interface ReviewStats {
  total: number;
  average: number;
  distribution: Array<{ rating: number; count: number }>;
}

interface SupplierReviewStatsProps {
  stats: ReviewStats;
}

export const SupplierReviewStats: React.FC<SupplierReviewStatsProps> = ({ stats }) => {
  const maxCount = Math.max(...stats.distribution.map(d => d.count), 1);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Review Statistics</h3>
      
      <div className="flex items-center gap-4 mb-6">
        <div className="text-center">
          <div className="text-4xl font-bold text-gray-900">{stats.average.toFixed(1)}</div>
          <div className="flex items-center gap-1 mt-1">
            {[1, 2, 3, 4, 5].map((rating) => (
              <Star
                key={rating}
                className={`h-5 w-5 ${
                  rating <= Math.round(stats.average)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <div className="text-sm text-gray-600 mt-1">{stats.total} reviews</div>
        </div>
      </div>

      <div className="space-y-2">
        {stats.distribution.reverse().map(({ rating, count }) => (
          <div key={rating} className="flex items-center gap-3">
            <div className="flex items-center gap-1 w-20">
              <span className="text-sm font-medium text-gray-700">{rating}</span>
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            </div>
            <div className="flex-1">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-yellow-400 h-2 rounded-full"
                  style={{ width: `${(count / maxCount) * 100}%` }}
                />
              </div>
            </div>
            <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
};












