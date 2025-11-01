import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  breadcrumbs,
  actions,
  className,
}) => {
  return (
    <div className={cn('border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-6 sm:px-6', className)}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          {/* Breadcrumbs */}
          {breadcrumbs && breadcrumbs.length > 0 && (
            <nav className="flex mb-4" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-2">
                <li>
                  <div className="flex items-center">
                    <Home className="h-4 w-4 text-gray-400 dark:text-slate-400" />
                  </div>
                </li>
                {breadcrumbs.map((item, index) => (
                  <li key={index}>
                    <div className="flex items-center">
                      <ChevronRight className="h-4 w-4 text-gray-400 dark:text-slate-500 mx-2" />
                      {item.href ? (
                        <a
                          href={item.href}
                          className="text-sm font-medium text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 transition-colors"
                        >
                          {item.label}
                        </a>
                      ) : (
                        <span className="text-sm font-medium text-gray-500 dark:text-slate-400">
                          {item.label}
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </nav>
          )}

          {/* Title and Subtitle */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100 sm:text-3xl">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-1 text-sm text-gray-500 dark:text-slate-400 sm:text-base">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        {actions && (
          <div className="mt-4 sm:mt-0 sm:ml-4">
            <div className="flex flex-col sm:flex-row gap-2">
              {actions}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
