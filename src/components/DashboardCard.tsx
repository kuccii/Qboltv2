import React from 'react';
import { useAuth } from '../contexts/AuthContext';

interface DashboardCardProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  icon,
  children,
  className = '',
  fullWidth = false
}) => {
  const { currentUser } = useAuth();
  const industry = currentUser?.industry || 'construction';

  return (
    <div className={`bg-white rounded-lg shadow-card hover:shadow-card-hover transition-shadow p-5 ${
      industry === 'construction' ? 'border-l-4 border-primary-800' : 'border-l-4 border-secondary-800'
    } ${fullWidth ? 'col-span-full' : ''} ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          {icon && (
            <span className={industry === 'construction' ? 'text-primary-800' : 'text-secondary-800'}>
              {icon}
            </span>
          )}
          {title}
        </h2>
      </div>
      <div>{children}</div>
    </div>
  );
};

export default DashboardCard;