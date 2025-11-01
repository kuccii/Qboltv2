import React from 'react';
import { X, Filter, ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

export interface FilterGroup {
  id: string;
  label: string;
  type: 'checkbox' | 'radio' | 'range' | 'select';
  options: FilterOption[];
  value?: string | string[];
  onChange: (value: string | string[]) => void;
}

export interface FilterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterGroup[];
  onClearAll: () => void;
  className?: string;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  isOpen,
  onClose,
  filters,
  onClearAll,
  className,
}) => {
  const renderFilterGroup = (group: FilterGroup) => {
    switch (group.type) {
      case 'checkbox':
        return (
          <div key={group.id} className="space-y-2">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {group.label}
            </h3>
            <div className="space-y-2">
              {group.options.map((option) => {
                const isSelected = Array.isArray(group.value) 
                  ? group.value.includes(option.value)
                  : false;
                
                return (
                  <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        const currentValues = Array.isArray(group.value) ? group.value : [];
                        const newValues = e.target.checked
                          ? [...currentValues, option.value]
                          : currentValues.filter(v => v !== option.value);
                        group.onChange(newValues);
                      }}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {option.label}
                    </span>
                    {option.count !== undefined && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        ({option.count})
                      </span>
                    )}
                  </label>
                );
              })}
            </div>
          </div>
        );

      case 'radio':
        return (
          <div key={group.id} className="space-y-2">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {group.label}
            </h3>
            <div className="space-y-2">
              {group.options.map((option) => (
                <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name={group.id}
                    value={option.value}
                    checked={group.value === option.value}
                    onChange={(e) => group.onChange(e.target.value)}
                    className="text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {option.label}
                  </span>
                  {option.count !== undefined && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      ({option.count})
                    </span>
                  )}
                </label>
              ))}
            </div>
          </div>
        );

      case 'select':
        return (
          <div key={group.id} className="space-y-2">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {group.label}
            </h3>
            <select
              value={Array.isArray(group.value) ? group.value[0] || '' : group.value || ''}
              onChange={(e) => group.onChange(e.target.value)}
              className="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">All {group.label}</option>
              {group.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label} {option.count !== undefined ? `(${option.count})` : ''}
                </option>
              ))}
            </select>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={cn(
      'fixed inset-y-0 left-0 z-50 w-80 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out',
      isOpen ? 'translate-x-0' : '-translate-x-full',
      className
    )}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <Filter size={20} className="text-gray-600 dark:text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Filters
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X size={20} className="text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Filters */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {filters.map(renderFilterGroup)}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClearAll}
            className="w-full px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      </div>
    </div>
  );
};