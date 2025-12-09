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

  // Just return children with mobile styles - header and navigation are handled by Layout
  return (
    <div className="mobile-optimized">
      {children}

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

