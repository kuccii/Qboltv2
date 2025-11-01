import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Settings, 
  LogOut, 
  HelpCircle, 
  BookOpen, 
  Shield, 
  ChevronDown,
  Bell,
  CreditCard,
  FileText
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import IndustrySwitcher from './IndustrySwitcher';

interface UserMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const UserMenu: React.FC<UserMenuProps> = ({ isOpen, onClose }) => {
  const { authState, logout } = useAuth();
  const currentUser = authState.user;
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleLogout = () => {
    logout();
    navigate('/');
    onClose();
  };

  const menuItems = [
    {
      icon: User,
      label: 'Profile',
      description: 'Manage your account settings',
      onClick: () => {
        navigate('/app/profile');
        onClose();
      }
    },
    {
      icon: Settings,
      label: 'Settings',
      description: 'App preferences and configuration',
      onClick: () => {
        navigate('/app/settings');
        onClose();
      }
    },
    {
      icon: Bell,
      label: 'Notifications',
      description: 'Manage notification preferences',
      onClick: () => {
        navigate('/app/notifications');
        onClose();
      }
    },
    {
      icon: CreditCard,
      label: 'Billing',
      description: 'Manage subscription and payments',
      onClick: () => {
        navigate('/app/billing');
        onClose();
      }
    },
    {
      icon: FileText,
      label: 'Documents',
      description: 'Your uploaded documents',
      onClick: () => {
        navigate('/app/documents');
        onClose();
      }
    },
    {
      icon: HelpCircle,
      label: 'Help Center',
      description: 'Get support and documentation',
      onClick: () => {
        navigate('/app/help');
        onClose();
      }
    }
  ];

  if (!isOpen) return null;

  return (
    <div 
      ref={menuRef}
      className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50"
    >
      {/* User Info Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg">
            {currentUser?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
              {currentUser?.name || 'User'}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
              {currentUser?.email || 'user@example.com'}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
              {currentUser?.company || 'Company Name'}
            </p>
          </div>
        </div>
      </div>

      {/* Industry Switcher */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <IndustrySwitcher />
      </div>

      {/* Menu Items */}
      <div className="py-2">
        {menuItems.map((item, index) => (
          <button
            key={index}
            onClick={item.onClick}
            className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="flex-shrink-0">
              <item.icon size={20} className="text-gray-500 dark:text-gray-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {item.label}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {item.description}
              </p>
            </div>
            <ChevronDown size={16} className="text-gray-400 rotate-[-90deg]" />
          </button>
        ))}
      </div>

      {/* Admin Section */}
      {currentUser?.role === 'admin' && (
        <div className="border-t border-gray-200 dark:border-gray-700 py-2">
          <button
            onClick={() => {
              navigate('/app/admin');
              onClose();
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="flex-shrink-0">
              <Shield size={20} className="text-red-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Admin Dashboard
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                System administration and controls
              </p>
            </div>
            <ChevronDown size={16} className="text-gray-400 rotate-[-90deg]" />
          </button>
        </div>
      )}

      {/* Footer */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-3">
          <span>Account Type: {currentUser?.role || 'User'}</span>
          <span>Plan: Professional</span>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
        >
          <LogOut size={16} />
          <span>Sign out</span>
        </button>
      </div>
    </div>
  );
};

export default UserMenu;
