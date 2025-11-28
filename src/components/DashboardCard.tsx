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
    <div className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border-2 border-gray-200 dark:border-gray-600 p-5 sm:p-6 hover:shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 transform hover:-translate-y-2 hover:scale-[1.02] overflow-hidden group ${
      industry === 'construction' ? 'border-l-4 border-l-primary-600' : 'border-l-4 border-l-secondary-600'
    } ${fullWidth ? 'col-span-full' : ''} ${className}`}>
      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 to-purple-50/0 group-hover:from-blue-50/50 group-hover:to-purple-50/30 dark:group-hover:from-blue-950/20 dark:group-hover:to-purple-950/10 transition-all duration-300 pointer-events-none rounded-2xl"></div>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2.5 tracking-tight">
            {icon && (
              <span className={`${industry === 'construction' ? 'text-primary-600 dark:text-primary-400' : 'text-secondary-600 dark:text-secondary-400'}`}>
                {icon}
              </span>
            )}
            <span>{title}</span>
          </h2>
        </div>
        <div className="text-gray-900 dark:text-white">{children}</div>
      </div>
    </div>
  );
};

export default DashboardCard;