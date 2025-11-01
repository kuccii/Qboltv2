import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { authAPI, userManager, AuthUser, AuthError, TokenExpiredError, InvalidTokenError } from '../lib/auth';
import { authConfig, rbacConfig, validateAuthConfig } from '../config/auth';

interface AuthState {
  user: AuthUser | null;
}

interface AuthContextType {
  authState: AuthState;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  setIndustry: (industry: 'construction' | 'agriculture') => void;
  isAdmin: boolean;
  hasPermission: (permission: string) => boolean;
  refreshToken: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        validateAuthConfig();
        const user = userManager.getUser();
        setAuthState({ user });
      } catch (err) {
        console.error('Auth initialization error:', err);
        setError('Failed to initialize authentication');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Auto-refresh token before expiry
  useEffect(() => {
    if (!authState.user) return;

    const interval = setInterval(async () => {
      try {
        await refreshToken();
      } catch (err) {
        console.warn('Token refresh failed:', err);
        // Don't logout immediately, let the user continue until next action
      }
    }, authConfig.refreshThreshold);

    return () => clearInterval(interval);
  }, [authState.user]);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { user, token } = await authAPI.login(email, password);
      userManager.setUser(user, token);
      setAuthState({ user });
    } catch (err) {
      const errorMessage = err instanceof AuthError 
        ? err.message 
        : 'Login failed. Please try again.';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      await authAPI.logout();
      userManager.clearUser();
      setAuthState({ user: null });
    } catch (err) {
      console.error('Logout error:', err);
      // Even if logout fails on server, clear local state
      userManager.clearUser();
      setAuthState({ user: null });
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshToken = useCallback(async () => {
    try {
      const newToken = await authAPI.refreshToken();
      const user = userManager.getUser();
      if (user) {
        userManager.setUser(user, newToken);
      }
    } catch (err) {
      // If refresh fails, logout user
      userManager.clearUser();
      setAuthState({ user: null });
      throw err;
    }
  }, []);

  const setIndustry = useCallback((industry: 'construction' | 'agriculture') => {
    if (authState.user) {
      const updatedUser = { ...authState.user, industry };
      setAuthState({ user: updatedUser });
      // Note: In a real app, this would update the user profile on the server
    }
  }, [authState.user]);

  const hasPermission = useCallback((permission: string) => {
    if (!authState.user) return false;
    return rbacConfig.checkPermission(authState.user.role, permission);
  }, [authState.user]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = {
    authState,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!authState.user,
    setIndustry,
    isAdmin: authState.user?.role === 'admin',
    hasPermission,
    refreshToken,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};