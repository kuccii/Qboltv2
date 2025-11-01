import React, { useState } from 'react';
import { X, Plus, Trash2, Eye, EyeOff } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface ComparisonItem {
  id: string;
  name: string;
  type: 'supplier' | 'price' | 'material';
  data: any;
  image?: string;
}

export interface ComparisonTrayProps {
  items: ComparisonItem[];
  onRemove: (id: string) => void;
  onClear: () => void;
  onCompare: () => void;
  maxItems?: number;
  className?: string;
}

export const ComparisonTray: React.FC<ComparisonTrayProps> = ({
  items,
  onRemove,
  onClear,
  onCompare,
  maxItems = 3,
  className,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (items.length === 0) {
    return null;
  }

  return (
    <div className={cn(
      'fixed bottom-4 right-4 z-40 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 transition-all duration-300',
      isExpanded ? 'w-80' : 'w-16',
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {items.length} item{items.length !== 1 ? 's' : ''} selected
          </span>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {isExpanded ? (
              <EyeOff size={16} className="text-gray-600 dark:text-gray-400" />
            ) : (
              <Eye size={16} className="text-gray-600 dark:text-gray-400" />
            )}
          </button>
          <button
            onClick={onClear}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <Trash2 size={16} className="text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>

      {/* Items */}
      {isExpanded && (
        <div className="p-3 space-y-2 max-h-64 overflow-y-auto">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center space-x-3 p-2 rounded-md bg-gray-50 dark:bg-gray-800"
            >
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                  <span className="text-xs font-medium text-primary-600 dark:text-primary-400">
                    {item.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {item.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                  {item.type}
                </p>
              </div>
              <button
                onClick={() => onRemove(item.id)}
                className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <X size={14} className="text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      {isExpanded && (
        <div className="p-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex space-x-2">
            <button
              onClick={onCompare}
              disabled={items.length < 2}
              className={cn(
                'flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors',
                items.length >= 2
                  ? 'bg-primary-600 text-white hover:bg-primary-700'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              )}
            >
              Compare ({items.length})
            </button>
            {items.length < maxItems && (
              <button className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                <Plus size={16} />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
