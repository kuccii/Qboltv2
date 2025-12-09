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
  Wallet,
  Menu
} from 'lucide-react';

interface BottomTabNavigationProps {
  onMoreClick?: () => void;
}

const BottomTabNavigation: React.FC<BottomTabNavigationProps> = ({ onMoreClick }) => {
  const location = useLocation();

  // Main navigation items from web app navigation structure:
  // Dashboard, Prices (from Market dropdown), Suppliers (from Supply dropdown), Risk, Financing, and More
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
      to: '/app/financing',
      icon: Wallet,
      label: 'Finance',
      exact: false,
      color: 'green',
      emoji: '💳',
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
    // Handle financing route
    if (to === '/app/financing') {
      return location.pathname.startsWith('/app/financing');
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
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 safe-area-bottom">
      {/* Flutter-style backdrop with blur */}
      <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-t border-gray-200/50 dark:border-gray-700/50" />
      
      {/* Rounded top border for Flutter-style look */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
      
      {/* Navigation content */}
      <div className="relative flex items-center justify-around h-20 px-2 py-2">
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
                className="relative flex flex-col items-center justify-center flex-1 h-full transition-all duration-300 ease-out"
              >
                <div className={`
                  relative flex flex-col items-center justify-center w-full max-w-[70px] h-full rounded-2xl transition-all duration-300 ease-out px-2 py-2
                  ${active 
                    ? 'bg-gradient-to-b from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30 scale-105' 
                    : 'hover:bg-gray-100/50 dark:hover:bg-gray-800/50'
                  }
                `}>
                  {/* Active indicator dot */}
                  {active && (
                    <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                  )}
                  
                  {tab.emoji && (
                    <span className={`text-xl mb-0.5 transition-transform duration-300 ${active ? 'scale-110' : ''}`}>
                      {tab.emoji}
                    </span>
                  )}
                  <Icon 
                    size={22} 
                    className={`
                      mb-1 transition-all duration-300
                      ${active 
                        ? 'text-white scale-110' 
                        : 'text-gray-500 dark:text-gray-400'
                      }
                    `}
                    strokeWidth={active ? 2.5 : 2}
                  />
                  <span className={`
                    text-[10px] font-semibold transition-all duration-300 leading-tight
                    ${active 
                      ? 'text-white' 
                      : 'text-gray-600 dark:text-gray-400'
                    }
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
                  relative flex flex-col items-center justify-center flex-1 h-full transition-all duration-300 ease-out
                  ${isTabActive ? 'scale-105' : ''}
                `;
              }}
            >
              {({ isActive: navIsActive }) => {
                const isTabActive = navIsActive || active;
                const activeColors = getActiveColors(tab.color, isTabActive);
                const gradientClass = isTabActive 
                  ? tab.color === 'red' 
                    ? 'bg-gradient-to-b from-red-500 to-red-600 shadow-lg shadow-red-500/30'
                    : tab.color === 'green'
                      ? 'bg-gradient-to-b from-green-500 to-green-600 shadow-lg shadow-green-500/30'
                      : 'bg-gradient-to-b from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30'
                  : 'hover:bg-gray-100/50 dark:hover:bg-gray-800/50';
                
                return (
                  <div className={`
                    relative flex flex-col items-center justify-center w-full max-w-[70px] h-full rounded-2xl transition-all duration-300 ease-out px-2 py-2
                    ${gradientClass}
                  `}>
                    {/* Active indicator dot */}
                    {isTabActive && (
                      <div className={`absolute -top-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 rounded-full animate-pulse ${
                        tab.color === 'red' ? 'bg-red-500' : tab.color === 'green' ? 'bg-green-500' : 'bg-blue-500'
                      }`} />
                    )}
                    
                    {tab.emoji && (
                      <span className={`text-xl mb-0.5 transition-transform duration-300 ${isTabActive ? 'scale-110' : ''}`}>
                        {tab.emoji}
                      </span>
                    )}
                    <Icon 
                      size={22} 
                      className={`
                        mb-1 transition-all duration-300
                        ${isTabActive 
                          ? 'text-white scale-110' 
                          : 'text-gray-500 dark:text-gray-400'
                        }
                      `}
                      strokeWidth={isTabActive ? 2.5 : 2}
                    />
                    <span className={`
                      text-[10px] font-semibold transition-all duration-300 leading-tight
                      ${isTabActive 
                        ? 'text-white' 
                        : 'text-gray-600 dark:text-gray-400'
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

