import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useIndustry } from '../contexts/IndustryContext';
import { AlertTriangle, Shield } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
  requiredPermission?: string;
  fallbackPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  adminOnly = false, 
  requiredPermission,
  fallbackPath = '/app'
}) => {
  const { isAuthenticated, loading, isAdmin, hasPermission, error, authState } = useAuth();
  const { isIndustrySelected } = useIndustry();
  const location = useLocation();

  // Debug logging
  useEffect(() => {
    console.log('ProtectedRoute check:', {
      isAuthenticated,
      loading,
      hasUser: !!authState.user,
      userId: authState.user?.id,
      isIndustrySelected,
      error,
      path: location.pathname
    });
  }, [isAuthenticated, loading, authState.user, isIndustrySelected, error, location.pathname]);

  if (loading) {
    console.log('ProtectedRoute: Still loading...');
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-800 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    console.log('ProtectedRoute: Auth error detected:', error);
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertTriangle className="h-12 w-12 text-error-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Check authentication - redirect to login if not authenticated
  if (!isAuthenticated) {
    console.log('ProtectedRoute: Not authenticated, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check admin access FIRST (before industry check)
  // Admin routes should bypass industry selection requirement
  if (adminOnly) {
    console.log('ProtectedRoute: Admin route check:', { isAdmin, userRole: authState.user?.role });
    if (!isAdmin) {
      console.log('ProtectedRoute: Admin access denied');
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
          <div className="text-center max-w-md mx-auto p-6">
            <Shield className="h-12 w-12 text-warning-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Access Denied</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              You don't have permission to access this page. Admin privileges required.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
              Current role: {authState.user?.role || 'none'}
            </p>
            <Navigate to={fallbackPath} replace />
          </div>
        </div>
      );
    }
    // Admin is authenticated and has admin role - allow access (bypass industry check)
    console.log('ProtectedRoute: Admin access granted');
    return <>{children}</>;
  }

  // Allow access to /select-industry if authenticated (even if industry not selected)
  if (location.pathname === '/select-industry') {
    console.log('ProtectedRoute: Allowing access to industry selection');
    return <>{children}</>;
  }

  // Check if user has selected an industry (only for /app routes, not admin routes)
  if (!isIndustrySelected && location.pathname.startsWith('/app')) {
    console.log('ProtectedRoute: No industry selected, redirecting to industry selection');
    return <Navigate to="/select-industry" replace />;
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <Shield className="h-12 w-12 text-warning-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Insufficient Permissions</h2>
          <p className="text-gray-600 mb-4">
            You don't have the required permission: {requiredPermission}
          </p>
          <Navigate to={fallbackPath} replace />
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
