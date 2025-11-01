// Mobile optimization wrapper for responsive design
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Menu, 
  X, 
  Home, 
  BarChart2, 
  Package, 
  Shield, 
  CreditCard, 
  Settings2,
  MapPin,
  Phone,
  Mail,
  Globe,
  Search,
  Filter,
  Download
} from 'lucide-react';

interface MobileOptimizationProps {
  children: React.ReactNode;
}

const MobileOptimization: React.FC<MobileOptimizationProps> = ({ children }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isBottomNavOpen, setIsBottomNavOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const navigationItems = [
    { path: '/app', icon: Home, label: 'Dashboard' },
    { path: '/app/prices', icon: BarChart2, label: 'Prices' },
    { path: '/app/supplier-directory', icon: Package, label: 'Suppliers' },
    { path: '/app/logistics', icon: Package, label: 'Logistics' },
    { path: '/app/rwanda', icon: MapPin, label: 'Rwanda' },
    { path: '/app/risk', icon: Shield, label: 'Risk' },
    { path: '/app/financing', icon: CreditCard, label: 'Finance' },
    { path: '/app/admin', icon: Settings2, label: 'Admin' }
  ];

  const getCurrentSection = () => {
    const path = location.pathname;
    if (path.includes('/rwanda')) return 'Rwanda';
    if (path.includes('/prices')) return 'Prices';
    if (path.includes('/suppliers')) return 'Suppliers';
    if (path.includes('/logistics')) return 'Logistics';
    if (path.includes('/risk')) return 'Risk';
    if (path.includes('/financing')) return 'Finance';
    if (path.includes('/admin')) return 'Admin';
    return 'Dashboard';
  };

  if (!isMobile) {
    return <>{children}</>;
  }

  return (
    <div className="mobile-optimized">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">Q</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Qivook</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">{getCurrentSection()}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
              <Search className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content with Mobile Padding */}
      <div className="pt-16 pb-20">
        {children}
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-around py-2">
          {navigationItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || 
                           (item.path !== '/app' && location.pathname.startsWith(item.path));
            
            return (
              <button
                key={item.path}
                className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                  isActive
                    ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
                onClick={() => {
                  window.location.href = item.path;
                }}
                aria-label={item.label}
              >
                <Icon className="w-5 h-5 mb-1" />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile Floating Action Button for Rwanda */}
      {location.pathname.includes('/rwanda') && (
        <div className="lg:hidden fixed bottom-20 right-4 z-50">
          <div className="flex flex-col space-y-2">
            <button className="w-12 h-12 bg-primary-600 text-white rounded-full shadow-lg hover:bg-primary-700 transition-colors flex items-center justify-center">
              <Download className="w-5 h-5" />
            </button>
            <button className="w-12 h-12 bg-green-600 text-white rounded-full shadow-lg hover:bg-green-700 transition-colors flex items-center justify-center">
              <Phone className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Mobile Styles */}
      <style jsx global>{`
        .mobile-optimized {
          /* Ensure proper touch targets */
          button, a, input, select, textarea {
            min-height: 44px;
            min-width: 44px;
          }

          /* Improve touch scrolling */
          .overflow-y-auto {
            -webkit-overflow-scrolling: touch;
          }

          /* Optimize for mobile viewport */
          .mobile-optimized {
            min-height: 100vh;
            min-height: -webkit-fill-available;
          }

          /* Ensure proper spacing for mobile */
          .mobile-optimized .container {
            padding-left: 1rem;
            padding-right: 1rem;
          }

          /* Mobile-specific card styles */
          .mobile-optimized .card {
            margin-bottom: 1rem;
            border-radius: 0.75rem;
            box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
          }

          /* Mobile table styles */
          .mobile-optimized table {
            font-size: 0.875rem;
          }

          .mobile-optimized th,
          .mobile-optimized td {
            padding: 0.5rem;
          }

          /* Mobile form styles */
          .mobile-optimized input,
          .mobile-optimized select,
          .mobile-optimized textarea {
            font-size: 16px; /* Prevents zoom on iOS */
            border-radius: 0.5rem;
          }

          /* Mobile button styles */
          .mobile-optimized button {
            border-radius: 0.5rem;
            font-weight: 500;
          }

          /* Mobile navigation styles */
          .mobile-optimized nav {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            z-index: 40;
          }

          /* Mobile modal styles */
          .mobile-optimized .modal {
            padding: 1rem;
          }

          .mobile-optimized .modal-content {
            max-height: 90vh;
            overflow-y: auto;
          }

          /* Mobile accessibility improvements */
          .mobile-optimized .sr-only {
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
            clip: rect(0, 0, 0, 0);
            white-space: nowrap;
            border: 0;
          }

          /* Mobile focus styles */
          .mobile-optimized *:focus {
            outline: 2px solid #3B82F6;
            outline-offset: 2px;
          }

          /* Mobile loading states */
          .mobile-optimized .loading {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 200px;
          }

          /* Mobile error states */
          .mobile-optimized .error {
            text-align: center;
            padding: 2rem 1rem;
          }

          /* Mobile success states */
          .mobile-optimized .success {
            text-align: center;
            padding: 2rem 1rem;
          }

          /* Mobile grid adjustments */
          .mobile-optimized .grid {
            gap: 1rem;
          }

          .mobile-optimized .grid-cols-1 {
            grid-template-columns: repeat(1, minmax(0, 1fr));
          }

          .mobile-optimized .grid-cols-2 {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .mobile-optimized .grid-cols-3 {
            grid-template-columns: repeat(1, minmax(0, 1fr));
          }

          @media (min-width: 640px) {
            .mobile-optimized .grid-cols-3 {
              grid-template-columns: repeat(2, minmax(0, 1fr));
            }
          }

          @media (min-width: 768px) {
            .mobile-optimized .grid-cols-3 {
              grid-template-columns: repeat(3, minmax(0, 1fr));
            }
          }

          /* Mobile text sizing */
          .mobile-optimized h1 {
            font-size: 1.5rem;
            line-height: 2rem;
          }

          .mobile-optimized h2 {
            font-size: 1.25rem;
            line-height: 1.75rem;
          }

          .mobile-optimized h3 {
            font-size: 1.125rem;
            line-height: 1.75rem;
          }

          .mobile-optimized p {
            font-size: 0.875rem;
            line-height: 1.25rem;
          }

          /* Mobile spacing */
          .mobile-optimized .space-y-4 > * + * {
            margin-top: 1rem;
          }

          .mobile-optimized .space-y-6 > * + * {
            margin-top: 1.5rem;
          }

          .mobile-optimized .space-y-8 > * + * {
            margin-top: 2rem;
          }

          /* Mobile padding */
          .mobile-optimized .p-4 {
            padding: 1rem;
          }

          .mobile-optimized .p-6 {
            padding: 1.5rem;
          }

          .mobile-optimized .px-4 {
            padding-left: 1rem;
            padding-right: 1rem;
          }

          .mobile-optimized .py-4 {
            padding-top: 1rem;
            padding-bottom: 1rem;
          }

          /* Mobile margins */
          .mobile-optimized .mb-4 {
            margin-bottom: 1rem;
          }

          .mobile-optimized .mb-6 {
            margin-bottom: 1.5rem;
          }

          .mobile-optimized .mt-4 {
            margin-top: 1rem;
          }

          .mobile-optimized .mt-6 {
            margin-top: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default MobileOptimization;

