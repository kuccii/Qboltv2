import React from 'react';
import { Shield, ShieldCheck, ShieldX, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export type InsuranceStatus = 'active' | 'inactive' | 'expired' | 'pending';
export type InsuranceType = 'general' | 'cargo' | 'liability' | 'credit';

interface InsuranceIndicatorProps {
  status: InsuranceStatus;
  type: InsuranceType;
  coverageAmount?: number;
  currency?: string;
  expiryDate?: Date;
  className?: string;
  showAmount?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const InsuranceIndicator: React.FC<InsuranceIndicatorProps> = ({
  status,
  type,
  coverageAmount,
  currency = 'USD',
  expiryDate,
  className = '',
  showAmount = false,
  size = 'md'
}) => {
  const { currentUser } = useAuth();
  const industry = currentUser?.industry || 'construction';

  const getIcon = () => {
    switch (status) {
      case 'active':
        return <ShieldCheck className="w-4 h-4" />;
      case 'inactive':
        return <ShieldX className="w-4 h-4" />;
      case 'expired':
        return <ShieldX className="w-4 h-4" />;
      case 'pending':
        return <Shield className="w-4 h-4" />;
      default:
        return <Shield className="w-4 h-4" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'active':
        return 'Insured';
      case 'inactive':
        return 'Not Insured';
      case 'expired':
        return 'Expired';
      case 'pending':
        return 'Pending';
      default:
        return 'Unknown';
    }
  };

  const getTypeText = () => {
    switch (type) {
      case 'general':
        return 'General Liability';
      case 'cargo':
        return 'Cargo Insurance';
      case 'liability':
        return 'Professional Liability';
      case 'credit':
        return 'Credit Insurance';
      default:
        return 'Insurance';
    }
  };

  const getColors = () => {
    const baseColors = {
      construction: {
        active: 'bg-blue-100 text-blue-800 border-blue-200',
        inactive: 'bg-gray-100 text-gray-600 border-gray-200',
        expired: 'bg-red-100 text-red-800 border-red-200',
        pending: 'bg-yellow-100 text-yellow-800 border-yellow-200'
      },
      agriculture: {
        active: 'bg-green-100 text-green-800 border-green-200',
        inactive: 'bg-gray-100 text-gray-600 border-gray-200',
        expired: 'bg-red-100 text-red-800 border-red-200',
        pending: 'bg-amber-100 text-amber-800 border-amber-200'
      }
    };

    return baseColors[industry][status];
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-2 py-1 text-xs';
      case 'md':
        return 'px-2.5 py-1.5 text-sm';
      case 'lg':
        return 'px-3 py-2 text-base';
      default:
        return 'px-2.5 py-1.5 text-sm';
    }
  };

  const isExpiringSoon = expiryDate && 
    expiryDate.getTime() - Date.now() < 30 * 24 * 60 * 60 * 1000; // 30 days

  const formatAmount = (amount: number) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M ${currency}`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(1)}K ${currency}`;
    }
    return `${amount.toLocaleString()} ${currency}`;
  };

  return (
    <div className={`inline-flex items-center gap-2 rounded-full border font-medium ${getSizeClasses()} ${getColors()} ${className}`}>
      <div className="flex items-center gap-1">
        {getIcon()}
        {isExpiringSoon && status === 'active' && (
          <AlertTriangle className="w-3 h-3 text-orange-500" />
        )}
      </div>
      <span className="font-semibold">{getStatusText()}</span>
      <span className="text-xs opacity-75">{getTypeText()}</span>
      {showAmount && coverageAmount && (
        <span className="text-xs font-semibold opacity-90">
          • {formatAmount(coverageAmount)}
        </span>
      )}
      {isExpiringSoon && status === 'active' && (
        <span className="text-xs font-semibold text-orange-600">• Expiring Soon</span>
      )}
    </div>
  );
};

export { InsuranceIndicator };
