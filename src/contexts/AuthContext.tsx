import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';
import { authAPI, userManager, AuthUser, AuthError, TokenExpiredError, InvalidTokenError } from '../lib/auth';
import { authConfig, rbacConfig, validateAuthConfig } from '../config/auth';
import { unifiedApi } from '../services/unifiedApi';

interface AuthState {
  user: AuthUser | null;
}

interface AuthContextType {
  authState: AuthState;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    userData: {
      name: string;
      company: string;
      industry: 'construction' | 'agriculture';
      country: string;
      phone?: string;
      role?: string;
      companySize?: string;
      interests?: string[];
    }
  ) => Promise<void>;
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
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;

    const initializeAuth = async () => {
      try {
        validateAuthConfig();
        
        console.log('AuthContext: Initializing auth...');
        
        // Add timeout to prevent hanging
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise<never>((_, reject) => {
          timeoutId = setTimeout(() => reject(new Error('Session check timeout')), 10000);
        });
        
        // Check Supabase session first with timeout
        let sessionResult: { data: { session: any }, error: any };
        try {
          sessionResult = await Promise.race([
            sessionPromise,
            timeoutPromise,
          ]) as { data: { session: any }, error: any };
          clearTimeout(timeoutId);
        } catch (timeoutError: any) {
          clearTimeout(timeoutId);
          if (!isMounted) return;
          // Timeout occurred, use fallback
          if (timeoutError?.message === 'Session check timeout') {
            console.warn('AuthContext: Session check timed out, using fallback');
            const user = userManager.getUser();
            if (user) {
              setAuthState({ user });
            }
          }
          setLoading(false);
          return;
        }
        
        if (!isMounted) return;
        
        const { data: { session }, error: sessionError } = sessionResult;
        
        console.log('AuthContext: Session check:', { 
          hasSession: !!session, 
          userId: session?.user?.id,
          expiresAt: session?.expires_at,
          error: sessionError?.message
        });
        
        if (session?.user) {
          // Check if session is expired
          if (session.expires_at && session.expires_at * 1000 < Date.now()) {
            console.log('AuthContext: Session expired, refreshing...');
            const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
            if (refreshError || !refreshData.session) {
              console.error('AuthContext: Session refresh failed:', refreshError);
              setAuthState({ user: null });
              setLoading(false);
              return;
            }
            // Use refreshed session
            const refreshedSession = refreshData.session;
            const profile = await unifiedApi.user.getProfile(refreshedSession.user.id);
            
            if (profile) {
              const user: AuthUser = {
                id: profile.id,
                name: profile.name,
                email: profile.email,
                company: profile.company || '',
                industry: profile.industry as 'construction' | 'agriculture',
                country: profile.country,
                role: profile.role as 'user' | 'admin',
              };
              console.log('AuthContext: Setting user from refreshed session:', user.id);
              setAuthState({ user });
            }
          } else {
            // Session is valid
            const profile = await unifiedApi.user.getProfile(session.user.id);
            console.log('AuthContext: Profile check:', { hasProfile: !!profile });
            
            if (profile) {
              const user: AuthUser = {
                id: profile.id,
                name: profile.name,
                email: profile.email,
                company: profile.company || '',
                industry: profile.industry as 'construction' | 'agriculture',
                country: profile.country,
                role: profile.role as 'user' | 'admin',
              };
              console.log('AuthContext: Setting user from profile:', user.id);
              setAuthState({ user });
            } else {
              // Profile doesn't exist - create it from session metadata
              const userRole = session.user.user_metadata?.role;
              const validRole = ['user', 'admin', 'supplier', 'agent'].includes(userRole) ? userRole : 'user';
              
              console.log('AuthContext: Creating profile for user:', session.user.id);
              
              const { data: newProfile, error: profileError } = await supabase
                .from('user_profiles')
                .insert({
                  id: session.user.id,
                  email: session.user.email || '',
                  name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
                  company: session.user.user_metadata?.company || '',
                  industry: (session.user.user_metadata?.industry || 'construction') as 'construction' | 'agriculture',
                  country: session.user.user_metadata?.country || 'Kenya',
                  role: validRole,
                })
                .select()
                .single();

              if (!profileError && newProfile) {
                const user: AuthUser = {
                  id: newProfile.id,
                  name: newProfile.name,
                  email: newProfile.email,
                  company: newProfile.company || '',
                  industry: newProfile.industry as 'construction' | 'agriculture',
                  country: newProfile.country,
                  role: newProfile.role as 'user' | 'admin',
                };
                console.log('AuthContext: Setting user from new profile:', user.id);
                setAuthState({ user });
              } else {
                console.error('AuthContext: Profile creation error:', profileError);
              }
            }
          }
        } else {
          // Fallback to local auth
        const user = userManager.getUser();
          if (user) {
            console.log('AuthContext: Using local auth user:', user.id);
            setAuthState({ user });
          } else {
            console.log('AuthContext: No user found');
          }
        }

        // Set up auth state change listener for session persistence
        const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
          console.log('AuthContext: onAuthStateChange event:', event, { 
            hasSession: !!session, 
            userId: session?.user?.id 
          });
          
          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            if (session?.user) {
              const profile = await unifiedApi.user.getProfile(session.user.id);
              if (profile) {
                const user: AuthUser = {
                  id: profile.id,
                  name: profile.name,
                  email: profile.email,
                  company: profile.company || '',
                  industry: profile.industry as 'construction' | 'agriculture',
                  country: profile.country,
                  role: profile.role as 'user' | 'admin',
                };
                console.log('AuthContext: Setting user from auth state change:', user.id);
        setAuthState({ user });
              }
            }
          } else if (event === 'SIGNED_OUT') {
            console.log('AuthContext: User signed out, clearing auth state');
            setAuthState({ user: null });
            userManager.clearUser();
          }
        });

        return () => {
          authListener?.subscription.unsubscribe();
        };
      } catch (err: any) {
        console.error('Auth initialization error:', err);
        if (isMounted) {
          if (err?.message === 'Session check timeout') {
            console.warn('AuthContext: Session check timed out, using fallback');
            // Try fallback to local auth
            const user = userManager.getUser();
            if (user) {
              setAuthState({ user });
            }
          } else {
            setError('Failed to initialize authentication');
          }
          setLoading(false);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
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
  }, [authState.user, refreshToken]);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    console.log('AuthContext: Login attempt for:', email);
    
    try {
      // Try Supabase Auth first
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password,
      });

      console.log('AuthContext: Supabase login response:', { 
        hasUser: !!authData?.user, 
        hasSession: !!authData?.session,
        error: authError?.message 
      });

      if (authError) {
        // Handle specific Supabase errors
        let errorMessage = authError.message;
        
        // Check for common Supabase errors
        if (authError.message.includes('Invalid login credentials') || 
            authError.message.includes('invalid_credentials')) {
          errorMessage = 'Invalid email or password. Please check your credentials and try again.';
        } else if (authError.message.includes('Email not confirmed') || 
                   authError.message.includes('email_not_confirmed')) {
          errorMessage = 'Please check your email and confirm your account before signing in.';
        } else if (authError.message.includes('Too many requests')) {
          errorMessage = 'Too many login attempts. Please try again later.';
        } else if (authError.message.includes('User not found')) {
          errorMessage = 'No account found with this email. Please sign up first.';
        }

        // Try fallback to local auth for demo users only if Supabase error is invalid credentials
        if (authError.message.includes('Invalid login credentials') || 
            authError.message.includes('invalid_credentials')) {
    try {
      const { user, token } = await authAPI.login(email, password);
      userManager.setUser(user, token);
      setAuthState({ user });
            return; // Success with local auth
          } catch (localAuthError) {
            // Both Supabase and local auth failed
            throw new Error(errorMessage);
          }
        } else {
          // Other Supabase errors (not credentials) - don't fallback
          throw new Error(errorMessage);
        }
      }

      // Supabase auth successful
      if (authData.user && authData.session) {
        // Get user profile from Supabase
        let profile = await unifiedApi.user.getProfile(authData.user.id);
        
        if (!profile) {
          // Profile doesn't exist - create it from user metadata
          const userRole = authData.user.user_metadata?.role;
          const validRole = ['user', 'admin', 'supplier', 'agent'].includes(userRole) ? userRole : 'user';
          
          const { data: newProfile, error: profileError } = await supabase
            .from('user_profiles')
            .insert({
              id: authData.user.id,
              email: authData.user.email || email,
              name: authData.user.user_metadata?.name || email.split('@')[0],
              company: authData.user.user_metadata?.company || '',
              industry: (authData.user.user_metadata?.industry || 'construction') as 'construction' | 'agriculture',
              country: authData.user.user_metadata?.country || 'Kenya',
              role: validRole,
            })
            .select()
            .single();

          if (profileError) {
            // Profile might already exist (race condition) - try to get it
            if (profileError.message.includes('duplicate') || profileError.code === '23505') {
              profile = await unifiedApi.user.getProfile(authData.user.id);
              if (!profile) {
                throw new Error('Failed to create user profile. Please try again.');
              }
            } else {
              throw profileError;
            }
          } else {
            profile = newProfile;
          }
        }

        // Convert to AuthUser format for compatibility
        const user: AuthUser = {
          id: profile.id,
          name: profile.name,
          email: profile.email,
          company: profile.company || '',
          industry: profile.industry as 'construction' | 'agriculture',
          country: profile.country,
          role: profile.role as 'user' | 'admin',
        };

        console.log('AuthContext: Login successful, setting user:', user.id);
        setAuthState({ user });

        // Log activity
        unifiedApi.user.logActivity('user_logged_in', 'auth', user.id);
      } else if (authData.user && !authData.session) {
        // User exists but session is null - email not confirmed
        throw new Error('Please check your email and confirm your account before signing in.');
      } else {
        throw new Error('Login failed. Please try again.');
      }
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Login failed. Please try again.';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (
    email: string,
    password: string,
    userData: {
      name: string;
      company: string;
      industry: 'construction' | 'agriculture';
      country: string;
      phone?: string;
      role?: string;
      companySize?: string;
      interests?: string[];
    }
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      // Register with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: userData.name,
            company: userData.company,
            industry: userData.industry,
            country: userData.country,
            phone: userData.phone,
            role: userData.role || 'user',
          },
          emailRedirectTo: `${window.location.origin}/app`,
        },
      });

      if (authError) {
        // Handle specific Supabase errors
        let errorMessage = authError.message;
        
        if (authError.message.includes('already registered') || authError.message.includes('already exists')) {
          errorMessage = 'An account with this email already exists. Please sign in instead.';
        } else if (authError.message.includes('password')) {
          errorMessage = 'Password must be at least 6 characters long.';
        } else if (authError.message.includes('email')) {
          errorMessage = 'Please enter a valid email address.';
        }
        
        throw new Error(errorMessage);
      }

      if (authData.user) {
        // Check if email confirmation is required
        if (authData.session === null && authData.user) {
          // Email confirmation required - user exists but needs to confirm
              // Still create profile so user can be set up
              try {
                const validRole = ['user', 'admin', 'supplier', 'agent'].includes(userData.role || '') ? userData.role : 'user';
                
                const { data: profile, error: profileError } = await supabase
                  .from('user_profiles')
                  .insert({
                    id: authData.user.id,
                    email: authData.user.email || email,
                    name: userData.name,
                    company: userData.company,
                    industry: userData.industry,
                    country: userData.country,
                    phone: userData.phone,
                    role: validRole,
                    metadata: {
                      companySize: userData.companySize,
                      interests: userData.interests || [],
                    },
                  })
                  .select()
                  .single();

            // If profile creation fails, it might already exist (user registered before)
            if (profileError && !profileError.message.includes('duplicate')) {
              throw profileError;
            }

            // If profile exists, get it
            const existingProfile = profileError && profileError.message.includes('duplicate')
              ? await unifiedApi.user.getProfile(authData.user.id)
              : profile;

            if (existingProfile) {
              const user: AuthUser = {
                id: existingProfile.id,
                name: existingProfile.name,
                email: existingProfile.email,
                company: existingProfile.company || '',
                industry: existingProfile.industry as 'construction' | 'agriculture',
                country: existingProfile.country,
                role: existingProfile.role as 'user' | 'admin',
              };
              setAuthState({ user });
            }

            // Note: User will need to confirm email, but profile is created
            // Don't throw error - let them know confirmation is needed
            if (authData.session === null) {
              throw new Error('Please check your email to confirm your account. You can sign in after confirmation.');
            }
          } catch (profileErr) {
            // If profile creation fails, still throw the original error
            if (profileErr instanceof Error && !profileErr.message.includes('confirm')) {
              throw profileErr;
            }
          }
        } else if (authData.session) {
          // User is logged in (email confirmation disabled)
          // Create user profile
          const validRole = ['user', 'admin', 'supplier', 'agent'].includes(userData.role || '') ? userData.role : 'user';
          
          const { data: profile, error: profileError } = await supabase
            .from('user_profiles')
            .insert({
              id: authData.user.id,
              email: authData.user.email || email,
              name: userData.name,
              company: userData.company,
              industry: userData.industry,
              country: userData.country,
              phone: userData.phone,
              role: validRole,
              metadata: {
                companySize: userData.companySize,
                interests: userData.interests || [],
              },
            })
            .select()
            .single();

          if (profileError) {
            // Profile might already exist - try to get it
            if (profileError.message.includes('duplicate')) {
              const existingProfile = await unifiedApi.user.getProfile(authData.user.id);
              if (existingProfile) {
                const user: AuthUser = {
                  id: existingProfile.id,
                  name: existingProfile.name,
                  email: existingProfile.email,
                  company: existingProfile.company || '',
                  industry: existingProfile.industry as 'construction' | 'agriculture',
                  country: existingProfile.country,
                  role: existingProfile.role as 'user' | 'admin',
                };
                setAuthState({ user });
                return; // Success - user already exists
              }
            }
            throw profileError;
          }

          // Convert to AuthUser format
          const user: AuthUser = {
            id: profile.id,
            name: profile.name,
            email: profile.email,
            company: profile.company || '',
            industry: profile.industry as 'construction' | 'agriculture',
            country: profile.country,
            role: profile.role as 'user' | 'admin',
          };

          setAuthState({ user });

          // Log activity
          unifiedApi.user.logActivity('user_registered', 'user_profile', user.id);
        }
      } else {
        throw new Error('Registration failed. Please try again.');
      }
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Registration failed. Please try again.';
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
      // Sign out from Supabase
      const { error: supabaseError } = await supabase.auth.signOut();
      
      // Also clear local auth
      await authAPI.logout();
      userManager.clearUser();
      setAuthState({ user: null });

      if (supabaseError) {
        console.error('Supabase logout error:', supabaseError);
      }
    } catch (err) {
      console.error('Logout error:', err);
      // Even if logout fails on server, clear local state
      userManager.clearUser();
      setAuthState({ user: null });
    } finally {
      setLoading(false);
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
    register,
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