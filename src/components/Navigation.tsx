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

  const NavItem = ({ to, icon: Icon, label, end, onClick }: { 
    to: string, 
    icon: React.ElementType, 
    label: string, 
    end?: boolean,
    onClick?: () => void 
  }) => (
    <NavLink 
      to={to} 
      end={end}
      className={({ isActive }) => `
        inline-flex items-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all duration-200
        ${isActive 
          ? 'bg-blue-600 text-white shadow-sm' 
          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100'
        }
      `}
      onClick={() => {
        onMobileMenuToggle();
        closeDropdown();
        onClick?.();
      }}
    >
      <Icon size={18} />
      <span>{label}</span>
    </NavLink>
  );

  const DropdownItem = ({ to, icon: Icon, label, onClick }: { 
    to: string, 
    icon: React.ElementType, 
    label: string,
    onClick?: () => void 
  }) => (
    <NavLink 
      to={to}
      className={({ isActive }) => `
        flex items-center gap-2 py-2 px-3 rounded-md text-sm transition-colors
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
      <Icon size={16} />
      <span>{label}</span>
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
  }) => (
    <div className="relative">
      <button 
        onClick={() => toggleDropdown(dropdownKey)}
        className={`
          inline-flex items-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all duration-200
          ${activeDropdown === dropdownKey 
            ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100' 
            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          }
        `}
      >
        <Icon size={18} />
        <span>{label}</span>
        <ChevronDown 
          size={16} 
          className={`text-gray-500 transition-transform duration-200 ${
            activeDropdown === dropdownKey ? 'rotate-180' : ''
          }`} 
        />
      </button>
      {activeDropdown === dropdownKey && (
        <div className="absolute left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg rounded-lg p-2 min-w-[240px] z-50">
          <div className="flex flex-col space-y-1">
            {children}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between">
          {/* Left: Logo */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Building2 className="text-white" size={20} />
              </div>
              <NavLink 
                to="/app" 
                className="text-xl font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                Qivook
              </NavLink>
            </div>
          </div>

          {/* Center: Desktop Navigation */}
          <nav ref={dropdownRef} className="hidden lg:flex items-center gap-1">
            <NavItem to="/app" icon={LayoutDashboard} label="Dashboard" end />
            <NavItem to="/app/demand" icon={Map} label="Demand Mapping" />
            {/* Keep Countries only once via quick switch on the right */}
            <NavItem to="/app/financing" icon={Wallet} label="Financing Hub" />
            <NavItem to="/app/documents" icon={FileText} label="Documents" />
            <NavItem to="/app/analytics" icon={BarChart2} label="Analytics" />
            <NavItem to="/app/risk" icon={Shield} label="Risk" />

            {currentUser?.role === 'admin' && (
              <Dropdown icon={Settings2} label="Admin" dropdownKey="admin">
                <DropdownItem to="/app/admin" icon={ShieldCheck} label="Admin Dashboard" />
              </Dropdown>
            )}
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <button
              onClick={toggleSearchModal}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              title="Search (Press /)"
            >
              <Search size={20} />
            </button>

            {/* Country Quick Switch */}
            <NavLink 
              to="/app/countries" 
              className={({ isActive }) => `
                hidden md:inline-flex items-center gap-2 py-1.5 px-2.5 rounded-md text-xs font-medium transition-colors border
                ${isActive 
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700' 
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-700'}
              `}
              onClick={closeDropdown}
            >
              <MapPin size={14} />
              <span>Countries</span>
            </NavLink>

            {/* Notifications */}
            <div className="relative">
              <button 
                onClick={toggleNotifications}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors relative"
                title="Notifications"
              >
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <NotificationDropdown 
                isOpen={showNotifications}
                onClose={() => setShowNotifications(false)}
              />
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Settings */}
            <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
              <Settings size={20} />
            </button>

            {/* User Menu */}
            <div className="hidden lg:flex items-center gap-3 pl-2 border-l border-gray-200 dark:border-gray-700">
              <div className="relative">
                <button 
                  onClick={toggleUserMenu}
                  className="flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg p-2 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                    {currentUser?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="text-sm text-left">
                    <p className="font-medium text-gray-900 dark:text-white leading-none">
                      {currentUser?.name || 'User'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {currentUser?.company || 'Company'}
                    </p>
                  </div>
                  <ChevronDown size={16} className="text-gray-500" />
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
              className="hidden lg:flex items-center gap-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 py-2 px-3 rounded-md text-sm transition-colors"
            >
              <LogOut size={16} />
              <span>Log out</span>
            </button>

            {/* Mobile menu toggle */}
            <button 
              className="lg:hidden p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              onClick={onMobileMenuToggle}
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
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
