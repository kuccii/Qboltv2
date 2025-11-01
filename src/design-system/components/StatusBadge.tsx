import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

type StatusType = 'success' | 'warning' | 'error' | 'info';

interface StatusBadgeProps {
  type: StatusType;
  text: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ type, text }) => {
  const { currentUser } = useAuth();
  const industry = currentUser?.industry || 'construction';

  const colors = {
    construction: {
      success: 'bg-success-100 text-success-800',
      warning: 'bg-warning-100 text-warning-800',
      error: 'bg-error-100 text-error-800',
      info: 'bg-primary-100 text-primary-800'
    },
    agriculture: {
      success: 'bg-secondary-100 text-secondary-800',
      warning: 'bg-warning-100 text-warning-800',
      error: 'bg-error-100 text-error-800',
      info: 'bg-secondary-100 text-secondary-800'
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[industry][type]}`}>
      {text}
    </span>
  );
};

export { StatusBadge };
