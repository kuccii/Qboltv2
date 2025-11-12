/**
 * Bottom Tab Navigation
 * Horizontal navigation bar for mobile view
 * Based on the main web app navigation structure
 */

import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  TrendingUp,
  Users,
  Shield,
  Menu
} from 'lucide-react';

interface BottomTabNavigationProps {
  onMoreClick?: () => void;
}

const BottomTabNavigation: React.FC<BottomTabNavigationProps> = ({ onMoreClick }) => {
  const location = useLocation();

  // Main navigation items from web app navigation structure:
  // Dashboard, Prices (from Market dropdown), Suppliers (from Supply dropdown), Risk, and More
  const tabs = [
    {
      to: '/app',
      icon: LayoutDashboard,
      label: 'Dashboard',
      exact: true,
      color: 'blue',
    },
    {
      to: '/app/countries/rw/pricing',
      icon: TrendingUp,
      label: 'Prices',
      exact: false,
      color: 'blue',
    },
    {
      to: '/app/countries/rw/contacts',
      icon: Users,
      label: 'Suppliers',
      exact: false,
      color: 'blue',
    },
    {
      to: '/app/risk',
      icon: Shield,
      label: 'Risk',
      exact: false,
      color: 'red',
    },
    {
      to: '#',
      icon: Menu,
      label: 'More',
      exact: false,
      color: 'gray',
      isButton: true,
    },
  ];

  const isActive = (to: string, exact: boolean) => {
    if (exact) {
      return location.pathname === to;
    }
    // Handle pricing route
    if (to === '/app/countries/rw/pricing') {
      return location.pathname.includes('/pricing') || location.pathname === '/app/prices';
    }
    // Handle contacts/suppliers route
    if (to === '/app/countries/rw/contacts') {
      return location.pathname.includes('/contacts') || 
             location.pathname.includes('/supplier-directory') ||
             location.pathname.includes('/suppliers');
    }
    return location.pathname.startsWith(to);
  };

  const getActiveColors = (color: string, isActive: boolean) => {
    if (!isActive) {
      return {
        bg: '',
        text: 'text-gray-600 dark:text-gray-400',
        icon: 'text-gray-600 dark:text-gray-400',
      };
    }

    const colorMap: Record<string, { bg: string; text: string; icon: string }> = {
      blue: {
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        text: 'text-blue-600 dark:text-blue-400',
        icon: 'text-blue-600 dark:text-blue-400',
      },
      red: {
        bg: 'bg-red-50 dark:bg-red-900/20',
        text: 'text-red-600 dark:text-red-400',
        icon: 'text-red-600 dark:text-red-400',
      },
      green: {
        bg: 'bg-green-50 dark:bg-green-900/20',
        text: 'text-green-600 dark:text-green-400',
        icon: 'text-green-600 dark:text-green-400',
      },
      purple: {
        bg: 'bg-purple-50 dark:bg-purple-900/20',
        text: 'text-purple-600 dark:text-purple-400',
        icon: 'text-purple-600 dark:text-purple-400',
      },
      gray: {
        bg: 'bg-gray-100 dark:bg-gray-700',
        text: 'text-gray-700 dark:text-gray-300',
        icon: 'text-gray-700 dark:text-gray-300',
      },
    };

    return colorMap[color] || colorMap.blue;
  };

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-50 safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = !tab.isButton && isActive(tab.to, tab.exact);
          const colors = getActiveColors(tab.color, active);
          
          // Handle "More" button separately
          if (tab.isButton && onMoreClick) {
            return (
              <button
                key={tab.label}
                onClick={onMoreClick}
                className="flex flex-col items-center justify-center flex-1 h-full transition-all duration-200 hover:opacity-80"
              >
                <div className={`
                  flex flex-col items-center justify-center w-full h-full rounded-lg transition-all duration-200 px-2 py-1.5
                  ${colors.bg}
                `}>
                  <Icon 
                    size={20} 
                    className={`
                      mb-1 transition-colors
                      ${colors.icon}
                    `}
                    strokeWidth={2}
                  />
                  <span className={`
                    text-xs font-medium transition-colors leading-tight
                    ${colors.text}
                  `}>
                    {tab.label}
                  </span>
                </div>
              </button>
            );
          }
          
          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.exact}
              className={({ isActive: navIsActive }) => {
                const isTabActive = navIsActive || active;
                return `
                  flex flex-col items-center justify-center flex-1 h-full transition-all duration-200
                  ${isTabActive ? '' : 'hover:opacity-80'}
                `;
              }}
            >
              {({ isActive: navIsActive }) => {
                const isTabActive = navIsActive || active;
                const activeColors = getActiveColors(tab.color, isTabActive);
                return (
                  <div className={`
                    flex flex-col items-center justify-center w-full h-full rounded-lg transition-all duration-200 px-2 py-1.5
                    ${activeColors.bg}
                  `}>
                    <Icon 
                      size={20} 
                      className={`
                        mb-1 transition-colors
                        ${activeColors.icon}
                      `}
                      strokeWidth={isTabActive ? 2.5 : 2}
                    />
                    <span className={`
                      text-xs font-medium transition-colors leading-tight
                      ${activeColors.text}
                    `}>
                      {tab.label}
                    </span>
                  </div>
                );
              }}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomTabNavigation;

