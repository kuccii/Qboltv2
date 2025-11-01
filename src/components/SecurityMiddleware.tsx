// Security middleware component for additional protection
import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { tokenManager } from '../lib/auth';

interface SecurityMiddlewareProps {
  children: React.ReactNode;
}

const SecurityMiddleware: React.FC<SecurityMiddlewareProps> = ({ children }) => {
  const { isAuthenticated, refreshToken, logout } = useAuth();
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;

    const checkTokenValidity = async () => {
      const token = tokenManager.getToken();
      if (!token) {
        await logout();
        return;
      }

      if (tokenManager.isTokenExpired(token)) {
        try {
          await refreshToken();
        } catch (error) {
          console.warn('Token refresh failed, logging out:', error);
          await logout();
        }
      }
    };

    // Check token validity on mount
    checkTokenValidity();

    // Set up periodic token checks
    const interval = setInterval(checkTokenValidity, 5 * 60 * 1000); // Every 5 minutes

    return () => clearInterval(interval);
  }, [isAuthenticated, refreshToken, logout]);

  // Detect suspicious activity
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // User switched tabs or minimized window
        // In a real app, you might want to implement additional security measures
        console.log('User switched away from application');
      } else {
        // User returned to the application
        // Check if token is still valid
        if (isAuthenticated) {
          const token = tokenManager.getToken();
          if (token && tokenManager.isTokenExpired(token)) {
            refreshToken().catch(() => logout());
          }
        }
      }
    };

    const handleBeforeUnload = () => {
      // Clear sensitive data when user is leaving
      // In a real app, you might want to clear certain cached data
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isAuthenticated, refreshToken, logout]);

  // Prevent right-click context menu in production
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      if (import.meta.env.PROD) {
        e.preventDefault();
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    return () => document.removeEventListener('contextmenu', handleContextMenu);
  }, []);

  // Prevent F12 and other dev tools shortcuts in production
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (import.meta.env.PROD) {
        // Disable F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
        if (
          e.key === 'F12' ||
          (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J')) ||
          (e.ctrlKey && e.key === 'u')
        ) {
          e.preventDefault();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Detect and prevent XSS attempts
  useEffect(() => {
    const detectXSS = () => {
      // Check for common XSS patterns in URL
      const url = window.location.href;
      const xssPatterns = [
        /<script/i,
        /javascript:/i,
        /on\w+\s*=/i,
        /<iframe/i,
        /<object/i,
        /<embed/i
      ];

      const hasXSS = xssPatterns.some(pattern => pattern.test(url));
      if (hasXSS) {
        console.warn('Potential XSS attempt detected in URL');
        // In a real app, you might want to log this to a security service
        window.location.href = '/login';
      }
    };

    detectXSS();
  }, []);

  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-800 mx-auto"></div>
          <p className="mt-4 text-gray-600">Security check in progress...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default SecurityMiddleware;

