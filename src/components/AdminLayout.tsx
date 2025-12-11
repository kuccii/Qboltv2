import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  DollarSign,
  Package,
  Users,
  UserCog,
  FileText,
  CreditCard,
  Truck,
  TrendingUp,
  AlertTriangle,
  Upload,
  Download,
  Settings,
  LogOut,
  Menu,
  X,
  Shield,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const AdminLayout: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
    { id: 'prices', label: 'Prices', icon: DollarSign, path: '/admin/prices' },
    { id: 'suppliers', label: 'Suppliers', icon: Package, path: '/admin/suppliers' },
    { id: 'agents', label: 'Agents', icon: Users, path: '/admin/agents' },
    { id: 'users', label: 'Users', icon: UserCog, path: '/admin/users' },
    { id: 'documents', label: 'Documents', icon: FileText, path: '/admin/documents' },
    { id: 'financing', label: 'Financing', icon: CreditCard, path: '/admin/financing' },
    { id: 'logistics', label: 'Logistics', icon: Truck, path: '/admin/logistics' },
    { id: 'demand', label: 'Demand Data', icon: TrendingUp, path: '/admin/demand' },
    { id: 'risk', label: 'Risk Alerts', icon: AlertTriangle, path: '/admin/risk' },
    { id: 'import', label: 'Bulk Import', icon: Upload, path: '/admin/import' },
    { id: 'export', label: 'Bulk Export', icon: Download, path: '/admin/export' },
  ];

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Mobile Header */}
      <div className="lg:hidden bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 text-gray-400 hover:text-white"
          >
            {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-red-500" />
            <span className="text-white font-semibold">Admin Panel</span>
          </div>
        </div>
        <button
          onClick={() => navigate('/app')}
          className="p-2 text-gray-400 hover:text-white"
          title="Back to App"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`
            fixed lg:static inset-y-0 left-0 z-50
            w-64 bg-gray-800 border-r border-gray-700
            transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            transition-transform duration-200 ease-in-out
            flex flex-col
          `}
        >
          {/* Desktop Header */}
          <div className="hidden lg:flex items-center gap-3 px-6 py-4 border-b border-gray-700">
            <div className="p-2 bg-red-600 rounded-lg">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg">Admin Panel</h1>
              <p className="text-gray-400 text-xs">Qivook Management</p>
            </div>
          </div>

          {/* User Info */}
          <div className="px-6 py-4 border-b border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white font-semibold">
                {currentUser?.name?.charAt(0) || 'A'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-sm truncate">
                  {currentUser?.name || 'Admin'}
                </p>
                <p className="text-gray-400 text-xs truncate">
                  {currentUser?.email || 'admin@qivook.com'}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-4 py-4">
            <div className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.id}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-lg
                      transition-colors duration-150
                      ${
                        active
                          ? 'bg-red-600 text-white'
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      }
                    `}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Footer Actions */}
          <div className="px-4 py-4 border-t border-gray-700 space-y-1">
            <Link
              to="/app"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="font-medium">Back to App</span>
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 lg:ml-0 min-h-screen">
          <div className="bg-gray-900 min-h-screen">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;





