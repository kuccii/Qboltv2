// Comprehensive accessibility wrapper for the entire application
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

interface AccessibilityWrapperProps {
  children: React.ReactNode;
}

const AccessibilityWrapper: React.FC<AccessibilityWrapperProps> = ({ children }) => {
  const location = useLocation();
  const [announcements, setAnnouncements] = useState<string[]>([]);
  const [skipLinks, setSkipLinks] = useState<boolean>(false);

  // Announce route changes to screen readers
  useEffect(() => {
    const routeName = getRouteName(location.pathname);
    announceToScreenReader(`Navigated to ${routeName}`);
  }, [location.pathname]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Skip links activation (Alt + S)
      if (event.altKey && event.key === 's') {
        event.preventDefault();
        setSkipLinks(true);
        setTimeout(() => setSkipLinks(false), 1000);
      }

      // Focus management
      if (event.key === 'Tab') {
        // Ensure focus is visible
        document.body.classList.add('keyboard-navigation');
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        // Remove focus styles when not using keyboard
        document.body.classList.remove('keyboard-navigation');
      }
    };

    const handleMouseDown = () => {
      document.body.classList.remove('keyboard-navigation');
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  const getRouteName = (pathname: string): string => {
    const routeMap: { [key: string]: string } = {
      '/app': 'Dashboard',
      '/app/prices': 'Price Tracking',
      '/app/price-reporting': 'Price Reporting',
      '/app/demand': 'Demand Mapping',
      '/app/suppliers': 'Supplier Scores',
      '/app/supplier-directory': 'Supplier Directory',
      '/app/agents': 'Agents Directory',
      '/app/logistics': 'Logistics',
      '/app/financing': 'Financing',
      '/app/risk': 'Risk Mitigation',
      '/app/documents': 'Document Vault',
      '/app/analytics': 'Analytics Dashboard',
      '/app/rwanda': 'Rwanda Logistics',
      '/app/rwanda/profile': 'Rwanda Profile',
      '/app/rwanda/infrastructure': 'Rwanda Infrastructure',
      '/app/rwanda/services': 'Rwanda Services',
      '/app/rwanda/contacts': 'Rwanda Contacts',
      '/app/admin': 'Admin Dashboard',
      '/login': 'Login',
      '/register': 'Register'
    };

    return routeMap[pathname] || 'Page';
  };

  const announceToScreenReader = (message: string) => {
    setAnnouncements(prev => [...prev, message]);
    
    // Remove announcement after 5 seconds
    setTimeout(() => {
      setAnnouncements(prev => prev.slice(1));
    }, 5000);
  };

  const handleSkipToMain = () => {
    const mainContent = document.querySelector('main') || document.querySelector('[role="main"]');
    if (mainContent) {
      (mainContent as HTMLElement).focus();
      announceToScreenReader('Skipped to main content');
    }
  };

  const handleSkipToNavigation = () => {
    const navigation = document.querySelector('nav') || document.querySelector('[role="navigation"]');
    if (navigation) {
      (navigation as HTMLElement).focus();
      announceToScreenReader('Skipped to navigation');
    }
  };

  const handleSkipToSearch = () => {
    const searchInput = document.querySelector('input[type="search"], input[placeholder*="search" i]');
    if (searchInput) {
      (searchInput as HTMLElement).focus();
      announceToScreenReader('Skipped to search');
    }
  };

  return (
    <>
      {/* Skip Links */}
      {skipLinks && (
        <div className="fixed top-0 left-0 z-50 w-full bg-primary-600 text-white p-2">
          <div className="container mx-auto flex flex-wrap gap-4">
            <button
              onClick={handleSkipToMain}
              className="px-4 py-2 bg-white text-primary-600 rounded hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-white"
            >
              Skip to main content
            </button>
            <button
              onClick={handleSkipToNavigation}
              className="px-4 py-2 bg-white text-primary-600 rounded hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-white"
            >
              Skip to navigation
            </button>
            <button
              onClick={handleSkipToSearch}
              className="px-4 py-2 bg-white text-primary-600 rounded hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-white"
            >
              Skip to search
            </button>
          </div>
        </div>
      )}

      {/* Screen Reader Announcements */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        role="status"
      >
        {announcements.map((announcement, index) => (
          <div key={index}>{announcement}</div>
        ))}
      </div>

      {/* Main Content */}
      <div className="min-h-screen">
        {children}
      </div>

      {/* Accessibility Styles */}
      <style jsx global>{`
        /* Focus management */
        .keyboard-navigation *:focus {
          outline: 2px solid #3B82F6 !important;
          outline-offset: 2px !important;
        }

        /* High contrast mode support */
        @media (prefers-contrast: high) {
          .bg-gray-100 {
            background-color: #000000 !important;
            color: #ffffff !important;
          }
          .bg-white {
            background-color: #ffffff !important;
            color: #000000 !important;
          }
          .border-gray-200 {
            border-color: #000000 !important;
          }
        }

        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
            scroll-behavior: auto !important;
          }
        }

        /* Screen reader only content */
        .sr-only {
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

        /* Focus visible for better keyboard navigation */
        .focus-visible:focus {
          outline: 2px solid #3B82F6;
          outline-offset: 2px;
        }

        /* Ensure interactive elements are accessible */
        button:disabled,
        input:disabled,
        select:disabled,
        textarea:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* Ensure sufficient color contrast */
        .text-gray-600 {
          color: #4B5563;
        }

        .text-gray-500 {
          color: #6B7280;
        }

        /* Ensure form labels are properly associated */
        label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: #374151;
        }

        /* Ensure tables are accessible */
        table {
          border-collapse: collapse;
          width: 100%;
        }

        th {
          text-align: left;
          font-weight: 600;
          background-color: #F9FAFB;
        }

        td, th {
          padding: 0.75rem;
          border-bottom: 1px solid #E5E7EB;
        }

        /* Ensure images have alt text */
        img {
          max-width: 100%;
          height: auto;
        }

        /* Ensure links are accessible */
        a {
          color: #3B82F6;
          text-decoration: underline;
        }

        a:hover {
          color: #1D4ED8;
        }

        a:focus {
          outline: 2px solid #3B82F6;
          outline-offset: 2px;
        }

        /* Ensure buttons are accessible */
        button {
          cursor: pointer;
          border: none;
          background: none;
        }

        button:focus {
          outline: 2px solid #3B82F6;
          outline-offset: 2px;
        }

        /* Ensure form inputs are accessible */
        input, select, textarea {
          border: 1px solid #D1D5DB;
          border-radius: 0.375rem;
          padding: 0.5rem;
        }

        input:focus, select:focus, textarea:focus {
          outline: 2px solid #3B82F6;
          outline-offset: 2px;
          border-color: #3B82F6;
        }

        /* Ensure error states are accessible */
        .error {
          color: #DC2626;
          font-weight: 500;
        }

        .error input, .error select, .error textarea {
          border-color: #DC2626;
        }

        /* Ensure success states are accessible */
        .success {
          color: #059669;
          font-weight: 500;
        }

        /* Ensure loading states are accessible */
        .loading {
          position: relative;
        }

        .loading::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 20px;
          height: 20px;
          margin: -10px 0 0 -10px;
          border: 2px solid #3B82F6;
          border-radius: 50%;
          border-top-color: transparent;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        /* Ensure modals are accessible */
        .modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 50;
        }

        .modal-content {
          background: white;
          border-radius: 0.5rem;
          padding: 1.5rem;
          max-width: 90vw;
          max-height: 90vh;
          overflow-y: auto;
        }

        /* Ensure tooltips are accessible */
        .tooltip {
          position: relative;
        }

        .tooltip:hover::after {
          content: attr(data-tooltip);
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          background: #1F2937;
          color: white;
          padding: 0.5rem;
          border-radius: 0.25rem;
          font-size: 0.875rem;
          white-space: nowrap;
          z-index: 10;
        }

        /* Dark mode accessibility */
        @media (prefers-color-scheme: dark) {
          .dark-mode {
            background-color: #111827;
            color: #F9FAFB;
          }
        }

        /* Print styles for accessibility */
        @media print {
          .no-print {
            display: none !important;
          }
          
          a[href]:after {
            content: " (" attr(href) ")";
          }
          
          .sr-only {
            position: static;
            width: auto;
            height: auto;
            padding: 0;
            margin: 0;
            overflow: visible;
            clip: auto;
            white-space: normal;
          }
        }
      `}</style>
    </>
  );
};

export default AccessibilityWrapper;

