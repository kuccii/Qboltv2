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
  ChevronRight,
  HelpCircle,
  BookOpen,
  Search
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

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
        flex items-center gap-3 py-3 px-4 rounded-lg text-sm font-medium transition-colors
        ${isActive 
          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' 
          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
        }
      `}
      onClick={() => {
        onClose();
        onClick?.();
      }}
    >
      <Icon size={20} />
      <span>{label}</span>
    </NavLink>
  );

  const SectionDropdown = ({ 
    icon: Icon, 
    label, 
    section, 
    children 
  }: { 
    icon: React.ElementType, 
    label: string, 
    section: string,
    children: React.ReactNode 
  }) => (
    <div className="space-y-1">
      <button
        onClick={() => toggleSection(section)}
        className="flex items-center justify-between w-full py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
      >
        <div className="flex items-center gap-3">
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
      <div className="fixed inset-y-0 right-0 w-80 bg-white dark:bg-gray-800 shadow-xl transform transition-transform">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Building2 className="text-white" size={20} />
              </div>
              <span className="text-lg font-bold text-gray-900 dark:text-white">Qivook</span>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <LogOut size={20} />
            </button>
          </div>

          {/* User Info */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                {currentUser?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {currentUser?.name || 'User'}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {currentUser?.company || 'Company'}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            <NavItem to="/app" icon={LayoutDashboard} label="Dashboard" end />

            <SectionDropdown icon={BarChart2} label="Market Intelligence" section="market">
              <NavItem to="/app/prices" icon={TrendingUp} label="Price Tracking" />
              <NavItem to="/app/price-reporting" icon={MessageSquare} label="Price Reporting" />
              <NavItem to="/app/demand" icon={Map} label="Demand Mapping" />
            </SectionDropdown>

            <SectionDropdown icon={Package} label="Supply Chain" section="supply">
              <NavItem to="/app/suppliers" icon={Users} label="Supplier Scores" />
              <NavItem to="/app/supplier-directory" icon={Building2} label="Supplier Directory" />
              <NavItem to="/app/agents" icon={UserCog} label="Agents Directory" />
              <NavItem to="/app/logistics" icon={Truck} label="Logistics" />
              <NavItem to="/app/rwanda" icon={MapPin} label="Rwanda Logistics" />
            </SectionDropdown>

            <SectionDropdown icon={Shield} label="Risk & Compliance" section="risk">
              <NavItem to="/app/risk" icon={AlertTriangle} label="Risk Mitigation" />
              <NavItem to="/app/documents" icon={FileText} label="Document Vault" />
            </SectionDropdown>

            <SectionDropdown icon={CreditCard} label="Financial Services" section="finance">
              <NavItem to="/app/financing" icon={Wallet} label="Financing" />
            </SectionDropdown>

            {currentUser?.role === 'admin' && (
              <SectionDropdown icon={Settings2} label="Administration" section="admin">
                <NavItem to="/app/admin" icon={ShieldCheck} label="Admin Dashboard" />
              </SectionDropdown>
            )}

            {/* Help & Support */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
              <NavItem to="/help" icon={HelpCircle} label="Help Center" />
              <NavItem to="/docs" icon={BookOpen} label="Documentation" />
            </div>
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
