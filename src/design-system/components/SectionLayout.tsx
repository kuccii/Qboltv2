import React from 'react';
import { cn } from '../../lib/utils';

export interface SectionLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
  spacing?: 'none' | 'sm' | 'md' | 'lg';
  background?: 'white' | 'gray' | 'transparent';
}

export const SectionLayout: React.FC<SectionLayoutProps> = ({
  children,
  title,
  subtitle,
  actions,
  className,
  spacing = 'md',
  background = 'white',
}) => {
  const getSpacingClass = () => {
    switch (spacing) {
      case 'none':
        return '';
      case 'sm':
        return 'p-4';
      case 'lg':
        return 'p-8';
      default:
        return 'p-6';
    }
  };

  const getBackgroundClass = () => {
    switch (background) {
      case 'gray':
        return 'bg-gray-50 dark:bg-slate-800/50';
      case 'transparent':
        return 'bg-transparent';
      default:
        return 'bg-white dark:bg-slate-900';
    }
  };

  return (
    <section className={cn(
      'rounded-lg border border-gray-200 dark:border-slate-800',
      getBackgroundClass(),
      getSpacingClass(),
      className
    )}>
      {(title || subtitle || actions) && (
        <div className="mb-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {title && (
                <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="mt-1 text-sm text-gray-600 dark:text-slate-400">
                  {subtitle}
                </p>
              )}
            </div>
            {actions && (
              <div className="ml-4 flex-shrink-0">
                {actions}
              </div>
            )}
          </div>
        </div>
      )}
      
      <div className="space-y-4">
        {children}
      </div>
    </section>
  );
};
