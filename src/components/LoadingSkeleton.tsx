// Loading skeleton components for better UX
import React from 'react';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: boolean;
  animate?: boolean;
}

const Skeleton: React.FC<SkeletonProps> = ({ 
  className = '', 
  width = '100%', 
  height = '1rem',
  rounded = false,
  animate = true 
}) => {
  return (
    <div
      className={`
        bg-gray-200 dark:bg-gray-700
        ${rounded ? 'rounded-full' : 'rounded'}
        ${animate ? 'animate-pulse' : ''}
        ${className}
      `}
      style={{ width, height }}
    />
  );
};

// Card skeleton
export const CardSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 ${className}`}>
    <div className="flex items-center justify-between mb-4">
      <Skeleton width="60%" height="1.5rem" />
      <Skeleton width="2rem" height="2rem" rounded />
    </div>
    <div className="space-y-3">
      <Skeleton width="100%" height="1rem" />
      <Skeleton width="80%" height="1rem" />
      <Skeleton width="90%" height="1rem" />
    </div>
    <div className="mt-4 flex justify-between items-center">
      <Skeleton width="40%" height="1rem" />
      <Skeleton width="20%" height="1rem" />
    </div>
  </div>
);

// Table skeleton
export const TableSkeleton: React.FC<{ 
  rows?: number; 
  columns?: number; 
  className?: string 
}> = ({ rows = 5, columns = 4, className = '' }) => (
  <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden ${className}`}>
    {/* Header */}
    <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
      <div className="flex space-x-4">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} width="20%" height="1rem" />
        ))}
      </div>
    </div>
    
    {/* Rows */}
    <div className="divide-y divide-gray-200 dark:divide-gray-600">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="px-6 py-4">
          <div className="flex space-x-4">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton key={colIndex} width="20%" height="1rem" />
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Chart skeleton
export const ChartSkeleton: React.FC<{ 
  height?: string | number; 
  className?: string 
}> = ({ height = '300px', className = '' }) => (
  <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 ${className}`}>
    <div className="flex items-center justify-between mb-4">
      <Skeleton width="40%" height="1.5rem" />
      <div className="flex space-x-2">
        <Skeleton width="4rem" height="1.5rem" rounded />
        <Skeleton width="4rem" height="1.5rem" rounded />
      </div>
    </div>
    <div 
      className="relative bg-gray-50 dark:bg-gray-700 rounded"
      style={{ height }}
    >
      {/* Chart bars simulation */}
      <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between px-4 pb-4 space-x-1">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton 
            key={i} 
            width="12%" 
            height={`${Math.random() * 60 + 20}%`} 
            rounded
          />
        ))}
      </div>
    </div>
  </div>
);

// List skeleton
export const ListSkeleton: React.FC<{ 
  items?: number; 
  className?: string 
}> = ({ items = 5, className = '' }) => (
  <div className={`space-y-3 ${className}`}>
    {Array.from({ length: items }).map((_, i) => (
      <div key={i} className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-800 rounded-lg">
        <Skeleton width="2.5rem" height="2.5rem" rounded />
        <div className="flex-1 space-y-2">
          <Skeleton width="60%" height="1rem" />
          <Skeleton width="40%" height="0.75rem" />
        </div>
        <Skeleton width="4rem" height="1.5rem" rounded />
      </div>
    ))}
  </div>
);

// Dashboard stats skeleton
export const StatsSkeleton: React.FC<{ 
  count?: number; 
  className?: string 
}> = ({ count = 4, className = '' }) => (
  <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
    {Array.from({ length: count }).map((_, i) => (
      <CardSkeleton key={i} />
    ))}
  </div>
);

// Form skeleton
export const FormSkeleton: React.FC<{ 
  fields?: number; 
  className?: string 
}> = ({ fields = 4, className = '' }) => (
  <div className={`space-y-6 ${className}`}>
    {Array.from({ length: fields }).map((_, i) => (
      <div key={i} className="space-y-2">
        <Skeleton width="30%" height="1rem" />
        <Skeleton width="100%" height="2.5rem" rounded />
      </div>
    ))}
    <div className="flex justify-end space-x-3">
      <Skeleton width="6rem" height="2.5rem" rounded />
      <Skeleton width="6rem" height="2.5rem" rounded />
    </div>
  </div>
);

export default Skeleton;

