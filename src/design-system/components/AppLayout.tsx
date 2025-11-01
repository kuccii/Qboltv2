import React from 'react';
import { cn } from '../../lib/utils';

export interface AppLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  className,
}) => {
  return (
    <div className={cn('min-h-screen bg-gray-50 dark:bg-slate-900', className)}>
      {children}
    </div>
  );
};
