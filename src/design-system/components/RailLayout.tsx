import React from 'react';
import { cn } from '../../lib/utils';

export interface RailLayoutProps {
  left?: React.ReactNode;
  right?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  leftWidth?: number; // px
  rightWidth?: number; // px
  gap?: number; // px
}

// Three-column layout with optional left/right rails to preserve margins
export const RailLayout: React.FC<RailLayoutProps> = ({
  left,
  right,
  children,
  className,
  leftWidth = 280,
  rightWidth = 320,
  gap = 24,
}) => {
  return (
    <div className={cn('w-full', className)}>
      {/* Outer flex keeps main container centered at the app's standard width.
          Rails live outside the main container so they occupy the side margins. */}
      <div className="w-full flex justify-center">
        {/* Optional left rail (hidden on smaller screens) */}
        {left ? (
          <div
            className={cn('hidden xl:block')}
            style={{ width: leftWidth, marginRight: gap }}
          >
            <div className="sticky top-4 space-y-4">
              {left}
            </div>
          </div>
        ) : null}

        {/* Main content at the same width as other pages */}
        <div className="max-w-7xl w-full">
          {children}
        </div>

        {/* Right rail occupies the right margin (hidden on smaller screens) */}
        {right ? (
          <div
            className={cn('hidden lg:block')}
            style={{ width: rightWidth, marginLeft: gap }}
          >
            <div className="sticky top-4 space-y-4">
              {right}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default RailLayout;


