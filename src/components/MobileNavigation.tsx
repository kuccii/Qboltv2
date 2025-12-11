import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  TrendingUp,
  Map, 
  MapPin,
  Users, 
  Wallet, 
  LogOut, 
  FileText,
  Truck,
  ShieldCheck,
  UserCog,
  BarChart2,
  Package,
  Shield,
  Settings2,
  ChevronDown,
  ChevronRight,
  X,
  Building2,
  User
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import IndustrySwitcher from './IndustrySwitcher';

interface MobileNavigationProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({ isOpen, onClose }) => {
  const { authState, logout } = useAuth();
  const currentUser = authState.user;
  const navigate = useNavigate();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    market: false,
    supply: false,
    risk: false,
    finance: false,
    admin: false
  });

  const handleLogout = () => {
    logout();
    navigate('/');
    onClose();
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const NavItem = ({ to, icon: Icon, label, end, onClick, emoji }: { 
    to: string, 
    icon: React.ElementType, 
    label: string, 
    end?: boolean,
    onClick?: () => void,
    emoji?: string
  }) => (
    <NavLink 
      to={to} 
      end={end}
      className={({ isActive }) => `
        flex items-center gap-3 py-3.5 px-4 rounded-xl text-sm font-bold transition-all transform hover:scale-105
        ${isActive 
          ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg scale-105' 
          : 'text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-primary-50 hover:to-primary-100 dark:hover:bg-primary-900/20'
        }
      `}
      onClick={() => {
        onClose();
        onClick?.();
      }}
    >
      {emoji && <span className="text-xl">{emoji}</span>}
      <Icon size={20} />
      <span>{label}</span>
    </NavLink>
  );

  const SectionDropdown = ({ 
    icon: Icon, 
    label, 
    section, 
    children,
    emoji
  }: { 
    icon: React.ElementType, 
    label: string, 
    section: string,
    children: React.ReactNode,
    emoji?: string
  }) => (
    <div className="space-y-1">
      <button
        onClick={() => toggleSection(section)}
        className="flex items-center justify-between w-full py-3.5 px-4 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-primary-50 hover:to-primary-100 dark:hover:bg-primary-900/20 rounded-xl transition-all transform hover:scale-105"
      >
        <div className="flex items-center gap-3">
          {emoji && <span className="text-xl">{emoji}</span>}
          <Icon size={20} />
          <span>{label}</span>
        </div>
        {expandedSections[section] ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
      </button>
      {expandedSections[section] && (
        <div className="pl-4 space-y-1">
          {children}
        </div>
      )}
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="lg:hidden fixed inset-0 z-50">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Navigation Panel */}
      <div className="fixed inset-y-0 right-0 w-80 bg-white dark:bg-gray-800 shadow-2xl transform transition-transform border-l-2 border-primary-200 dark:border-primary-700">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b-2 border-primary-200 dark:border-primary-700 bg-gradient-to-r from-primary-50 to-purple-50 dark:from-primary-900/20 dark:to-purple-900/20">
            <h2 className="text-xl font-extrabold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
              <span>🎯</span>
              Menu
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* User Info */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                {currentUser?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">
                  {currentUser?.name || 'User'}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {currentUser?.company || 'Company'}
                </p>
              </div>
            </div>
            
            {/* Industry Switcher */}
            <div className="mt-4">
              <IndustrySwitcher />
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            <NavItem to="/app" icon={LayoutDashboard} label="Dashboard" end emoji="📊" />

            {/* Market Intelligence Dropdown - Matching Desktop */}
            <SectionDropdown icon={BarChart2} label="Market" section="market" emoji="📊">
              <NavItem to="/app/prices" icon={TrendingUp} label="Price Tracking" emoji="💰" />
              <NavItem to="/app/countries" icon={MapPin} label="Countries" emoji="🌍" />
              <NavItem to="/app/demand" icon={Map} label="Demand Mapping" emoji="🗺️" />
              <NavItem to="/app/analytics" icon={BarChart2} label="Analytics" emoji="📈" />
            </SectionDropdown>

            {/* Supply Chain Dropdown - Matching Desktop */}
            <SectionDropdown icon={Package} label="Supply" section="supply" emoji="📦">
              <NavItem to="/app/supplier-directory" icon={Users} label="Suppliers" emoji="👥" />
              <NavItem to="/app/agents" icon={UserCog} label="Agents" emoji="🤝" />
              <NavItem to="/app/logistics" icon={Truck} label="Logistics" emoji="🚚" />
            </SectionDropdown>

            {/* Risk - Matching Desktop */}
            <NavItem to="/app/risk" icon={Shield} label="Risk" emoji="🛡️" />

            {/* Financial Services - Matching Desktop */}
            <NavItem to="/app/financing" icon={Wallet} label="Financing" emoji="💳" />

            {/* Documents - Matching Desktop */}
            <NavItem to="/app/documents" icon={FileText} label="Documents" emoji="📄" />

            {/* Profile - Added for Mobile */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
              <NavItem to="/app/profile" icon={User} label="Profile" />
            </div>

            {/* Admin Dropdown - Matching Desktop */}
            {currentUser?.role === 'admin' && (
              <SectionDropdown icon={Settings2} label="Admin" section="admin">
                <NavItem to="/admin" icon={ShieldCheck} label="Admin Panel" />
              </SectionDropdown>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <button 
              onClick={handleLogout}
              className="flex items-center gap-3 w-full py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-colors"
            >
              <LogOut size={20} />
              <span>Log out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileNavigation;
