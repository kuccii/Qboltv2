import React from 'react';

interface AdminCardProps {
  children: React.ReactNode;
  className?: string;
}

export const AdminCard: React.FC<AdminCardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-gray-800 border border-gray-700 rounded-lg p-6 ${className}`}>
      {children}
    </div>
  );
};



