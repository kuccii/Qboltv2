import React from 'react';
import { cn } from '../../lib/utils';

export interface ChipProps {
  label: string;
  value: string;
  selected?: boolean;
  onToggle?: (value: string) => void;
  onRemove?: (value: string) => void;
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  removable?: boolean;
  className?: string;
}

export const Chip: React.FC<ChipProps> = ({
  label,
  value,
  selected = false,
  onToggle,
  onRemove,
  variant = 'default',
  size = 'md',
  removable = false,
  className,
}) => {
  const baseClasses = 'inline-flex items-center font-medium rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantClasses = {
    default: selected
      ? 'bg-gray-100 text-gray-800 border-gray-300 focus:ring-gray-500'
      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 focus:ring-gray-500',
    primary: selected
      ? 'bg-primary-100 text-primary-800 border-primary-300 focus:ring-primary-500'
      : 'bg-white text-primary-700 border-primary-300 hover:bg-primary-50 focus:ring-primary-500',
    secondary: selected
      ? 'bg-secondary-100 text-secondary-800 border-secondary-300 focus:ring-secondary-500'
      : 'bg-white text-secondary-700 border-secondary-300 hover:bg-secondary-50 focus:ring-secondary-500',
    success: selected
      ? 'bg-green-100 text-green-800 border-green-300 focus:ring-green-500'
      : 'bg-white text-green-700 border-green-300 hover:bg-green-50 focus:ring-green-500',
    warning: selected
      ? 'bg-yellow-100 text-yellow-800 border-yellow-300 focus:ring-yellow-500'
      : 'bg-white text-yellow-700 border-yellow-300 hover:bg-yellow-50 focus:ring-yellow-500',
    error: selected
      ? 'bg-red-100 text-red-800 border-red-300 focus:ring-red-500'
      : 'bg-white text-red-700 border-red-300 hover:bg-red-50 focus:ring-red-500',
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  const handleClick = () => {
    if (onToggle) {
      onToggle(value);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRemove) {
      onRemove(value);
    }
  };

  return (
    <span
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        'border',
        className
      )}
      onClick={handleClick}
      role={onToggle ? 'button' : undefined}
      tabIndex={onToggle ? 0 : undefined}
    >
      {label}
      {removable && onRemove && (
        <button
          onClick={handleRemove}
          className="ml-1 -mr-1 p-0.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          aria-label={`Remove ${label}`}
        >
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      )}
    </span>
  );
};

export interface ChipGroupProps {
  chips: Array<{
    label: string;
    value: string;
    selected?: boolean;
    variant?: ChipProps['variant'];
  }>;
  onToggle?: (value: string) => void;
  onRemove?: (value: string) => void;
  variant?: ChipProps['variant'];
  size?: ChipProps['size'];
  className?: string;
}

export const ChipGroup: React.FC<ChipGroupProps> = ({
  chips,
  onToggle,
  onRemove,
  variant = 'default',
  size = 'md',
  className,
}) => {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {chips.map((chip) => (
        <Chip
          key={chip.value}
          label={chip.label}
          value={chip.value}
          selected={chip.selected}
          onToggle={onToggle}
          onRemove={onRemove}
          variant={chip.variant || variant}
          size={size}
          removable={!!onRemove}
        />
      ))}
    </div>
  );
};
