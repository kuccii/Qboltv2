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
      emoji: '📊',
    },
    {
      to: '/app/countries/rw/pricing',
      icon: TrendingUp,
      label: 'Prices',
      exact: false,
      color: 'blue',
      emoji: '💰',
    },
    {
      to: '/app/countries/rw/contacts',
      icon: Users,
      label: 'Suppliers',
      exact: false,
      color: 'blue',
      emoji: '👥',
    },
    {
      to: '/app/risk',
      icon: Shield,
      label: 'Risk',
      exact: false,
      color: 'red',
      emoji: '🛡️',
    },
    {
      to: '#',
      icon: Menu,
      label: 'More',
      exact: false,
      color: 'gray',
      isButton: true,
      emoji: '⚙️',
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
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-gradient-to-r from-white via-blue-50/30 to-purple-50/30 dark:from-gray-800 dark:via-blue-900/20 dark:to-purple-900/20 border-t-2 border-blue-200 dark:border-blue-700 z-50 safe-area-bottom shadow-2xl">
      <div className="flex items-center justify-around h-18 px-1 py-1">
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
                className="flex flex-col items-center justify-center flex-1 h-full transition-all duration-200 transform hover:scale-110"
              >
                <div className={`
                  flex flex-col items-center justify-center w-full h-full rounded-xl transition-all duration-200 px-2 py-2
                  ${active ? 'bg-gradient-to-b from-blue-500 to-blue-600 shadow-lg' : colors.bg}
                `}>
                  {tab.emoji && <span className="text-lg mb-0.5">{tab.emoji}</span>}
                  <Icon 
                    size={18} 
                    className={`
                      mb-1 transition-colors
                      ${active ? 'text-white' : colors.icon}
                    `}
                    strokeWidth={2.5}
                  />
                  <span className={`
                    text-xs font-bold transition-colors leading-tight
                    ${active ? 'text-white' : colors.text}
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
                  flex flex-col items-center justify-center flex-1 h-full transition-all duration-200 transform
                  ${isTabActive ? 'scale-110' : 'hover:scale-105'}
                `;
              }}
            >
              {({ isActive: navIsActive }) => {
                const isTabActive = navIsActive || active;
                const activeColors = getActiveColors(tab.color, isTabActive);
                const gradientClass = isTabActive 
                  ? tab.color === 'red' 
                    ? 'bg-gradient-to-b from-red-500 to-red-600 shadow-lg'
                    : tab.color === 'green'
                      ? 'bg-gradient-to-b from-green-500 to-green-600 shadow-lg'
                      : 'bg-gradient-to-b from-blue-500 to-blue-600 shadow-lg'
                  : activeColors.bg;
                
                return (
                  <div className={`
                    flex flex-col items-center justify-center w-full h-full rounded-xl transition-all duration-200 px-2 py-2
                    ${gradientClass}
                  `}>
                    {tab.emoji && <span className={`text-lg mb-0.5 ${isTabActive ? '' : ''}`}>{tab.emoji}</span>}
                    <Icon 
                      size={18} 
                      className={`
                        mb-1 transition-colors
                        ${isTabActive 
                          ? 'text-white' 
                          : activeColors.icon
                        }
                      `}
                      strokeWidth={isTabActive ? 2.5 : 2}
                    />
                    <span className={`
                      text-xs font-bold transition-colors leading-tight
                      ${isTabActive 
                        ? 'text-white' 
                        : activeColors.text
                      }
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

