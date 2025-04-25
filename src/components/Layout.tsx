import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  TrendingUp, 
  Map, 
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
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Layout: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    market: true,
    supply: true,
    risk: true,
    finance: true,
    admin: true
  });

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const NavItem = ({ to, icon: Icon, label, end }: { to: string, icon: React.ElementType, label: string, end?: boolean }) => (
    <NavLink 
      to={to} 
      end={end}
      className={({ isActive }) => `
        flex items-center gap-3 py-2 px-4 rounded-lg transition-colors 
        ${isActive 
          ? 'bg-primary-800 text-white' 
          : 'text-gray-600 hover:bg-gray-100'
        }
      `}
      onClick={() => setSidebarOpen(false)}
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
        className="flex items-center justify-between w-full px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
      >
        <div className="flex items-center gap-2">
          <Icon size={16} />
          <span>{label}</span>
        </div>
        {expandedSections[section] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
      </button>
      {expandedSections[section] && (
        <div className="pl-4 space-y-1">
          {children}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-md bg-white shadow-md text-gray-700"
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside 
        className={`
          fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-md transition-transform transform lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:static lg:w-64 lg:min-h-screen flex flex-col
        `}
      >
        <div className="p-4 border-b">
          <div className="flex items-center gap-2">
            <Building2 className="text-primary-800" size={32} />
            <h1 className="text-2xl font-bold text-primary-800">Qivook</h1>
          </div>
          <p className="text-xs text-gray-500 mt-1">Trade Intelligence Platform</p>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
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
        </nav>

        <div className="p-4 border-t">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-800 font-semibold">
              {currentUser?.name.substring(0, 1).toUpperCase()}
            </div>
            <div>
              <p className="font-medium text-gray-800">{currentUser?.name}</p>
              <p className="text-xs text-gray-500">{currentUser?.company}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-gray-600 hover:text-error-600 w-full py-2"
          >
            <LogOut size={18} />
            <span>Log out</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-h-screen">
        <header className="bg-white shadow-sm border-b p-4">
          <div className="container mx-auto flex justify-end items-center">
            <div className="flex items-center gap-4">
              <button className="p-2 rounded-full hover:bg-gray-100 relative">
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-accent-600 rounded-full"></span>
              </button>
              <button className="p-2 rounded-full hover:bg-gray-100">
                <Settings size={20} />
              </button>
            </div>
          </div>
        </header>
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;