import React, { createContext, useState, useContext, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  company: string;
  industry: 'construction' | 'agriculture';
  country: string;
  role: 'user' | 'admin';
}

interface AuthState {
  user: User | null;
}

interface AuthContextType {
  authState: AuthState;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  setIndustry: (industry: 'construction' | 'agriculture') => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user data
const mockUsers = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@example.com',
    company: 'Qbolt',
    industry: 'construction' as const,
    country: 'US',
    role: 'admin' as const,
  },
  {
    id: '2',
    name: 'Regular User',
    email: 'user@example.com',
    company: 'Test Company',
    industry: 'agriculture' as const,
    country: 'UK',
    role: 'user' as const,
  },
];

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

  useEffect(() => {
    // Check for stored user data
    const storedUser = localStorage.getItem('qivook_user');
    if (storedUser) {
      setAuthState({ user: JSON.parse(storedUser) });
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Mock authentication
      const user = mockUsers.find(u => u.email === email);
      if (user && password === 'password') { // Simple mock password check
        setAuthState({ user });
        localStorage.setItem('qivook_user', JSON.stringify(user));
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setAuthState({ user: null });
    localStorage.removeItem('qivook_user');
  };

  const setIndustry = (industry: 'construction' | 'agriculture') => {
    if (authState.user) {
      const updatedUser = { ...authState.user, industry };
      setAuthState({ user: updatedUser });
      localStorage.setItem('qivook_user', JSON.stringify(updatedUser));
    }
  };

  const value = {
    authState,
    loading,
    login,
    logout,
    isAuthenticated: !!authState.user,
    setIndustry,
    isAdmin: authState.user?.role === 'admin',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};