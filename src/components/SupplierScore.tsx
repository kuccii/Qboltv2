import React from 'react';
import { useAuth } from '../contexts/AuthContext';

interface SupplierScoreProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
}

const SupplierScore: React.FC<SupplierScoreProps> = ({ score, size = 'md' }) => {
  const { currentUser } = useAuth();
  const industry = currentUser?.industry || 'construction';

  // Determine color based on score and industry
  const getColor = () => {
    if (industry === 'construction') {
      if (score >= 80) return 'text-success-600';
      if (score >= 60) return 'text-warning-500';
      return 'text-error-600';
    } else {
      if (score >= 80) return 'text-secondary-800';
      if (score >= 60) return 'text-warning-500';
      return 'text-error-600';
    }
  };

  // Get corresponding background color
  const getBgColor = () => {
    if (industry === 'construction') {
      if (score >= 80) return 'bg-success-100';
      if (score >= 60) return 'bg-warning-100';
      return 'bg-error-100';
    } else {
      if (score >= 80) return 'bg-secondary-100';
      if (score >= 60) return 'bg-warning-100';
      return 'bg-error-100';
    }
  };

  // Determine size of the score circle
  const sizeClasses = {
    sm: 'w-10 h-10 text-sm',
    md: 'w-16 h-16 text-xl',
    lg: 'w-20 h-20 text-2xl'
  };

  return (
    <div className={`${sizeClasses[size]} rounded-full ${getBgColor()} ${getColor()} flex items-center justify-center font-bold`}>
      {score}
    </div>
  );
};

export default SupplierScore;