import React from 'react';
import { cn } from '../../lib/utils';

export interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  className,
  maxWidth = 'full',
  padding = 'md',
}) => {
  const getMaxWidthClass = () => {
    switch (maxWidth) {
      case 'sm':
        return 'max-w-2xl';
      case 'md':
        return 'max-w-4xl';
      case 'lg':
        return 'max-w-6xl';
      case 'xl':
        return 'max-w-7xl';
      case '2xl':
        return 'max-w-screen-2xl';
      case 'full':
        return 'max-w-full';
      default:
        return 'max-w-full';
    }
  };

  const getPaddingClass = () => {
    switch (padding) {
      case 'none':
        return '';
      case 'sm':
        return 'px-3 sm:px-4 md:px-6 py-4 sm:py-6';
      case 'lg':
        return 'px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-12';
      default:
        return 'px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8';
    }
  };

  return (
    <div className={cn(
      'mx-auto',
      getMaxWidthClass(),
      getPaddingClass(),
      className
    )}>
      {children}
    </div>
  );
};

