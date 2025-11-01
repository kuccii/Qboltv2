import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface DataCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease' | 'neutral';
    period?: string;
  };
  icon?: React.ReactNode;
  loading?: boolean;
  className?: string;
  onClick?: () => void;
}

export const DataCard: React.FC<DataCardProps> = ({
  title,
  value,
  change,
  icon,
  loading = false,
  className,
  onClick,
}) => {
  const getTrendIcon = () => {
    if (!change) return null;
    
    switch (change.type) {
      case 'increase':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'decrease':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      case 'neutral':
        return <Minus className="h-4 w-4 text-gray-500" />;
      default:
        return null;
    }
  };

  const getTrendColor = () => {
    if (!change) return 'text-gray-500';
    
    switch (change.type) {
      case 'increase':
        return 'text-green-600';
      case 'decrease':
        return 'text-red-600';
      case 'neutral':
        return 'text-gray-600';
      default:
        return 'text-gray-500';
    }
  };

  if (loading) {
    return (
      <div className={cn(
        'bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 p-6 shadow-sm',
        className
      )}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded w-1/2 mb-2"></div>
          <div className="h-8 bg-gray-200 dark:bg-slate-800 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 dark:bg-slate-800 rounded w-1/3"></div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 p-6 shadow-sm transition-all duration-200',
        onClick && 'cursor-pointer hover:shadow-md hover:border-gray-300 dark:hover:border-slate-700',
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-slate-400 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">{value}</p>
          
          {change && (
            <div className="flex items-center mt-2">
              {getTrendIcon()}
              <span className={cn('text-sm font-medium ml-1', getTrendColor())}>
                {change.value > 0 ? '+' : ''}{change.value}%
              </span>
              {change.period && (
                <span className="text-sm text-gray-500 dark:text-slate-400 ml-1">
                  {change.period}
                </span>
              )}
            </div>
          )}
        </div>
        
        {icon && (
          <div className="flex-shrink-0 ml-4">
            <div className="h-12 w-12 bg-gray-50 dark:bg-slate-800 rounded-lg flex items-center justify-center">
              {icon}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
