import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  TrendingUp, 
  Map, 
  MapPin,
  Users, 
  Wallet, 
  Bell, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Building2,
  AlertTriangle,
  MessageSquare,
  FileText,
  Truck,
  ShieldCheck,
  UserCog,
  BarChart2,
  Package,
  Shield,
  CreditCard,
  Settings2,
  ChevronDown,
  Search,
  Moon,
  Sun,
  User,
  HelpCircle,
  BookOpen
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import SearchModal from './SearchModal';
import NotificationDropdown from './NotificationDropdown';
import UserMenu from './UserMenu';

interface NavigationProps {
  onMobileMenuToggle: () => void;
  mobileMenuOpen: boolean;
}

const Navigation: React.FC<NavigationProps> = ({ onMobileMenuToggle, mobileMenuOpen }) => {
  const { authState, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const currentUser = authState.user;
  const navigate = useNavigate();
  const location = useLocation();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleDropdown = (dropdown: string) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };

  const closeDropdown = () => {
    setActiveDropdown(null);
  };

  const toggleSearchModal = () => {
    setShowSearchModal(!showSearchModal);
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        closeDropdown();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Open search modal with keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !showSearchModal) {
        e.preventDefault();
        setShowSearchModal(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showSearchModal]);

  const NavItem = ({ to, icon: Icon, label, end, onClick, color = 'blue' }: { 
    to: string, 
    icon: React.ElementType, 
    label: string, 
    end?: boolean,
    onClick?: () => void,
    color?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'indigo'
  }) => {
    const colorClasses = {
      blue: {
        active: 'bg-blue-600 text-white',
        inactive: 'bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400'
      },
      green: {
        active: 'bg-green-600 text-white',
        inactive: 'bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600 dark:hover:text-green-400'
      },
      purple: {
        active: 'bg-purple-600 text-white',
        inactive: 'bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-600 dark:hover:text-purple-400'
      },
      orange: {
        active: 'bg-orange-600 text-white',
        inactive: 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 hover:bg-orange-100 dark:hover:bg-orange-900/30'
      },
      red: {
        active: 'bg-red-600 text-white',
        inactive: 'bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400'
      },
      indigo: {
        active: 'bg-indigo-600 text-white',
        inactive: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/30'
      }
    };

    const colors = colorClasses[color];

    return (
      <NavLink 
        to={to} 
        end={end}
        className={({ isActive }) => `
          inline-flex items-center gap-1 sm:gap-1.5 xl:gap-2 py-1.5 sm:py-2 xl:py-2.5 px-2 sm:px-3 xl:px-4 rounded-md text-xs xl:text-sm font-medium transition-all duration-200 shadow-sm whitespace-nowrap
          ${isActive 
            ? `${colors.active} shadow-md` 
            : colors.inactive
          }
        `}
        title={label}
        onClick={() => {
          closeDropdown();
          onClick?.();
        }}
      >
        <Icon size={14} className="w-3.5 h-3.5 sm:w-4 sm:h-4 xl:w-[18px] xl:h-[18px]" />
        <span className="whitespace-nowrap">{label}</span>
      </NavLink>
    );
  };

  const DropdownItem = ({ to, icon: Icon, label, onClick }: { 
    to: string, 
    icon: React.ElementType, 
    label: string,
    onClick?: () => void 
  }) => (
    <NavLink 
      to={to}
      className={({ isActive }) => `
        flex items-center gap-1.5 xl:gap-2 py-2 xl:py-2.5 px-2.5 xl:px-3 rounded-md text-xs xl:text-sm transition-colors
        ${isActive 
          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' 
          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
        }
      `}
      onClick={() => {
        closeDropdown();
        onClick?.();
      }}
    >
      <Icon size={14} className="xl:w-4 xl:h-4" />
      <span className="whitespace-nowrap">{label}</span>
    </NavLink>
  );

  const Dropdown = ({ 
    icon: Icon, 
    label, 
    dropdownKey,
    children 
  }: { 
    icon: React.ElementType, 
    label: string, 
    dropdownKey: string,
    children: React.ReactNode 
  }) => {
    const isActive = location.pathname.startsWith('/app/countries') || 
                     location.pathname.startsWith('/app/demand') || 
                     location.pathname.startsWith('/app/analytics') ||
                     location.pathname.startsWith('/app/supplier-directory') ||
                     location.pathname.startsWith('/app/agents') ||
                     location.pathname.startsWith('/app/logistics') ||
                     (dropdownKey === 'market' && (location.pathname.startsWith('/app/countries') || location.pathname.startsWith('/app/demand') || location.pathname.startsWith('/app/analytics'))) ||
                     (dropdownKey === 'supply' && (location.pathname.startsWith('/app/supplier-directory') || location.pathname.startsWith('/app/agents') || location.pathname.startsWith('/app/logistics'))) ||
                     (dropdownKey === 'admin' && location.pathname.startsWith('/app/admin'));

    return (
      <div className="relative">
        <button 
          onClick={() => toggleDropdown(dropdownKey)}
          className={`
            inline-flex items-center gap-1 sm:gap-1.5 xl:gap-2 py-1.5 sm:py-2 xl:py-2.5 px-2 sm:px-3 xl:px-4 rounded-md text-xs xl:text-sm font-medium transition-all duration-200 whitespace-nowrap
            ${activeDropdown === dropdownKey || isActive
              ? 'bg-blue-600 text-white shadow-sm' 
              : 'bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400'
            }
          `}
          title={label}
        >
          <Icon size={14} className="w-3.5 h-3.5 sm:w-4 sm:h-4 xl:w-[18px] xl:h-[18px]" />
          <span className="whitespace-nowrap">{label}</span>
          <ChevronDown 
            size={12} 
            className={`w-3 h-3 sm:w-3.5 sm:h-3.5 xl:w-4 xl:h-4 transition-transform duration-200 ${
              activeDropdown === dropdownKey ? 'rotate-180' : ''
            }`} 
          />
        </button>
        {activeDropdown === dropdownKey && (
        <div className="absolute left-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg rounded-lg p-1.5 xl:p-2 min-w-[180px] sm:min-w-[200px] xl:min-w-[240px] z-50">
          <div className="flex flex-col space-y-0.5">
              {children}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="h-14 sm:h-16 flex items-center">
          {/* Left: Logo */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <NavLink 
              to="/app" 
              className="flex items-center gap-1.5 sm:gap-2 hover:opacity-80 transition-opacity"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Building2 className="text-white" size={18} />
              </div>
              <span className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                Qivook
              </span>
            </NavLink>
          </div>

          {/* Center: Desktop Navigation */}
          <nav ref={dropdownRef} className="hidden lg:flex items-center gap-1.5 xl:gap-2 flex-1 justify-center mx-4 xl:mx-8">
            <NavItem to="/app" icon={LayoutDashboard} label="Dashboard" end color="blue" />
            
            {/* Market Intelligence Dropdown */}
            <Dropdown icon={BarChart2} label="Market" dropdownKey="market">
              <DropdownItem to="/app/prices" icon={TrendingUp} label="Price Tracking" />
              <DropdownItem to="/app/countries" icon={MapPin} label="Countries" />
              <DropdownItem to="/app/demand" icon={Map} label="Demand Mapping" />
              {/* <DropdownItem to="/app/price-reporting" icon={MessageSquare} label="Price Reporting" /> */}
              <DropdownItem to="/app/analytics" icon={BarChart2} label="Analytics" />
            </Dropdown>

            {/* Supply Chain Dropdown */}
            <Dropdown icon={Package} label="Supply" dropdownKey="supply">
              <DropdownItem to="/app/supplier-directory" icon={Users} label="Suppliers" />
              <DropdownItem to="/app/agents" icon={UserCog} label="Agents" />
              <DropdownItem to="/app/logistics" icon={Truck} label="Logistics" />
            </Dropdown>

            {/* Risk & Compliance */}
            <NavItem to="/app/risk" icon={Shield} label="Risk" color="red" />
            
            {/* Financial Services */}
            <NavItem to="/app/financing" icon={Wallet} label="Financing" color="green" />
            
            {/* Documents */}
            <NavItem to="/app/documents" icon={FileText} label="Documents" color="purple" />

            {/* Admin Dropdown */}
            {currentUser?.role === 'admin' && (
              <Dropdown icon={Settings2} label="Admin" dropdownKey="admin">
                <DropdownItem to="/app/admin" icon={ShieldCheck} label="Admin Dashboard" />
              </Dropdown>
            )}
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 flex-shrink-0 ml-auto">
            {/* Search */}
            <button
              onClick={toggleSearchModal}
              className="p-1.5 sm:p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              title="Search (Press /)"
            >
              <Search size={18} className="sm:w-5 sm:h-5" />
            </button>

            {/* Help */}
            <NavLink
              to="/app/help"
              className={({ isActive }) => `
                hidden md:inline-flex items-center gap-1.5 xl:gap-2 py-1 xl:py-1.5 px-2 xl:px-2.5 rounded-md text-xs font-medium transition-colors
                ${isActive 
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' 
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }
              `}
              title="Help Center"
            >
              <HelpCircle size={13} className="xl:w-[14px] xl:h-[14px]" />
              <span className="hidden xl:inline">Help</span>
            </NavLink>

            {/* Notifications */}
            <div className="relative">
              <button 
                onClick={toggleNotifications}
                className="p-1.5 sm:p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors relative"
                title="Notifications"
              >
                <Bell size={18} className="sm:w-5 sm:h-5" />
                <span className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-red-500 rounded-full"></span>
              </button>
              <NotificationDropdown 
                isOpen={showNotifications}
                onClose={() => setShowNotifications(false)}
              />
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-1.5 sm:p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? <Sun size={18} className="sm:w-5 sm:h-5" /> : <Moon size={18} className="sm:w-5 sm:h-5" />}
            </button>

            {/* Settings */}
            <NavLink
              to="/app/settings"
              className={({ isActive }) => `
                p-1.5 sm:p-2 rounded-md transition-colors
                ${isActive 
                  ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' 
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }
              `}
              title="Settings"
            >
              <Settings size={18} className="sm:w-5 sm:h-5" />
            </NavLink>

            {/* User Menu - Visible on all screen sizes */}
            <div className="flex items-center gap-2 xl:gap-3 pl-1.5 xl:pl-2 border-l border-gray-200 dark:border-gray-700">
              <div className="relative">
                <button 
                  onClick={toggleUserMenu}
                  className="flex items-center gap-1.5 sm:gap-2 xl:gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg p-1 sm:p-1.5 xl:p-2 transition-colors"
                >
                  <div className="w-6 h-6 sm:w-7 sm:h-7 xl:w-8 xl:h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-xs xl:text-sm">
                    {currentUser?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="text-xs xl:text-sm text-left hidden sm:block xl:block">
                    <p className="font-medium text-gray-900 dark:text-white leading-none text-xs xl:text-sm">
                      {currentUser?.name || 'User'}
                    </p>
                    <p className="text-[10px] xl:text-xs text-gray-500 dark:text-gray-400 hidden xl:block">
                      {currentUser?.company || 'Company'}
                    </p>
                  </div>
                  <ChevronDown size={12} className="sm:w-3.5 sm:h-3.5 xl:w-4 xl:h-4 text-gray-500 hidden sm:block" />
                </button>
                <UserMenu 
                  isOpen={showUserMenu}
                  onClose={() => setShowUserMenu(false)}
                />
              </div>
            </div>

            {/* Logout */}
            <button 
              onClick={handleLogout}
              className="hidden xl:flex items-center gap-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 py-2 px-3 rounded-md text-xs xl:text-sm transition-colors"
            >
              <LogOut size={14} className="xl:w-4 xl:h-4" />
              <span>Log out</span>
            </button>

            {/* Mobile menu toggle */}
            <button 
              className="lg:hidden p-1.5 sm:p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              onClick={onMobileMenuToggle}
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X size={20} className="sm:w-[22px] sm:h-[22px]" /> : <Menu size={20} className="sm:w-[22px] sm:h-[22px]" />}
            </button>
          </div>
        </div>
      </div>

      {/* Search Modal */}
      <SearchModal 
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
      />
    </header>
  );
};

export default Navigation;
