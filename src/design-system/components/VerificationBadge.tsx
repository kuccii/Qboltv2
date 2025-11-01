import React from 'react';
import { CheckCircle, Clock, XCircle, Shield, FileText, Star } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export type VerificationStatus = 'verified' | 'pending' | 'rejected' | 'expired';
export type VerificationType = 'insurance' | 'documents' | 'reputation' | 'transaction';

interface VerificationBadgeProps {
  status: VerificationStatus;
  type: VerificationType;
  expiryDate?: Date;
  className?: string;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const VerificationBadge: React.FC<VerificationBadgeProps> = ({
  status,
  type,
  expiryDate,
  className = '',
  showIcon = true,
  size = 'md'
}) => {
  const { currentUser } = useAuth();
  const industry = currentUser?.industry || 'construction';

  const getIcon = () => {
    switch (type) {
      case 'insurance':
        return <Shield className="w-3 h-3" />;
      case 'documents':
        return <FileText className="w-3 h-3" />;
      case 'reputation':
        return <Star className="w-3 h-3" />;
      case 'transaction':
        return <CheckCircle className="w-3 h-3" />;
      default:
        return <CheckCircle className="w-3 h-3" />;
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="w-3 h-3" />;
      case 'pending':
        return <Clock className="w-3 h-3" />;
      case 'rejected':
      case 'expired':
        return <XCircle className="w-3 h-3" />;
      default:
        return null;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'verified':
        return 'Verified';
      case 'pending':
        return 'Pending';
      case 'rejected':
        return 'Rejected';
      case 'expired':
        return 'Expired';
      default:
        return 'Unknown';
    }
  };

  const getTypeText = () => {
    switch (type) {
      case 'insurance':
        return 'Insured';
      case 'documents':
        return 'Documents';
      case 'reputation':
        return 'Reputation';
      case 'transaction':
        return 'Transactions';
      default:
        return 'Verification';
    }
  };

  const getColors = () => {
    const baseColors = {
      construction: {
        verified: 'bg-green-100 text-green-800 border-green-200',
        pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        rejected: 'bg-red-100 text-red-800 border-red-200',
        expired: 'bg-gray-100 text-gray-800 border-gray-200'
      },
      agriculture: {
        verified: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        pending: 'bg-amber-100 text-amber-800 border-amber-200',
        rejected: 'bg-red-100 text-red-800 border-red-200',
        expired: 'bg-gray-100 text-gray-800 border-gray-200'
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

  return (
    <div className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${getSizeClasses()} ${getColors()} ${className}`}>
      {showIcon && (
        <div className="flex items-center gap-1">
          {getStatusIcon()}
          {type === 'insurance' && getIcon()}
        </div>
      )}
      <span className="font-semibold">{getStatusText()}</span>
      <span className="text-xs opacity-75">{getTypeText()}</span>
      {isExpiringSoon && status === 'verified' && (
        <span className="text-xs font-semibold text-orange-600">• Expiring Soon</span>
      )}
    </div>
  );
};

export { VerificationBadge };
