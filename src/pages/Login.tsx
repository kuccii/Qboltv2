import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Building2, Mail, Lock, ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { authConfig } from '../config/auth';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTime, setLockoutTime] = useState<Date | null>(null);
  
  const { login, loading, error, clearError, authState } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Navigate to industry selection when authenticated - but only if we're on login page
  useEffect(() => {
    if (authState.user && location.pathname === '/login') {
      console.log('Login page: User authenticated, navigating to industry selection');
      navigate('/select-industry', { replace: true });
    }
  }, [authState.user, navigate, location.pathname]);

  // Check for lockout status on mount
  useEffect(() => {
    const storedAttempts = localStorage.getItem('qbolt_login_attempts');
    const storedLockout = localStorage.getItem('qbolt_lockout_time');
    
    if (storedAttempts) {
      setLoginAttempts(parseInt(storedAttempts));
    }
    
    if (storedLockout) {
      const lockout = new Date(storedLockout);
      if (lockout > new Date()) {
        setIsLocked(true);
        setLockoutTime(lockout);
      } else {
        // Lockout expired, reset
        localStorage.removeItem('qbolt_login_attempts');
        localStorage.removeItem('qbolt_lockout_time');
      }
    }
  }, []);

  // Clear error when user starts typing
  useEffect(() => {
    if (error) {
      clearError();
    }
  }, [email, password, clearError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('Login form submitted', { email, password: password ? '***' : '', isLocked, loading });
    
    clearError();
    
    // Check if account is locked
    if (isLocked) {
      console.log('Account is locked');
      return;
    }
    
    // Validate input
    if (!email || !password) {
      console.log('Email or password missing', { email: !!email, password: !!password });
      return;
    }
    
    if (password.length < authConfig.passwordMinLength) {
      console.log('Password too short', { passwordLength: password.length, required: authConfig.passwordMinLength });
      return;
    }
    
    console.log('Attempting login...');
    
    try {
      await login(email, password);
      console.log('Login successful');
      // Reset login attempts on successful login
      setLoginAttempts(0);
      localStorage.removeItem('qbolt_login_attempts');
      localStorage.removeItem('qbolt_lockout_time');
      // Navigation will happen automatically via useEffect when authState.user is set
    } catch (err) {
      console.error('Login error:', err);
      const newAttempts = loginAttempts + 1;
      setLoginAttempts(newAttempts);
      localStorage.setItem('qbolt_login_attempts', newAttempts.toString());
      
      // Lock account after max attempts
      if (newAttempts >= authConfig.maxLoginAttempts) {
        const lockout = new Date(Date.now() + authConfig.lockoutDuration);
        setIsLocked(true);
        setLockoutTime(lockout);
        localStorage.setItem('qbolt_lockout_time', lockout.toISOString());
      }
    }
  };

  const getRemainingLockoutTime = () => {
    if (!lockoutTime) return '';
    const now = new Date();
    const diff = lockoutTime.getTime() - now.getTime();
    if (diff <= 0) return '';
    
    const minutes = Math.ceil(diff / (1000 * 60));
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex">
      {/* Left side - Login Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Building2 className="text-white" size={32} />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome back</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Sign in to your Qivook account</p>
          </div>

          {/* Error Messages */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 p-4 rounded-lg mb-6 flex items-start gap-3">
              <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Login Failed</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Account Locked Message */}
          {isLocked && (
            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300 p-4 rounded-lg mb-6 flex items-start gap-3">
              <Lock size={20} className="flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Account Temporarily Locked</p>
                <p className="text-sm">
                  Too many failed login attempts. Please try again in {getRemainingLockoutTime()}.
                </p>
              </div>
            </div>
          )}

          {/* Demo Credentials */}
          {authConfig.isDemoMode && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 p-4 rounded-lg mb-6">
              <p className="font-medium text-sm mb-3">Demo Credentials:</p>
              <div className="text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Admin:</span>
                  <span>admin@qivook.com / admin123</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">User:</span>
                  <span>user@qivook.com / user12345</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Demo:</span>
                  <span>demo@qivook.com / demo123</span>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={18} className="text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 w-full rounded-lg border border-gray-300 dark:border-gray-600 py-3 px-4 text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="you@company.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={18} className="text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 w-full rounded-lg border border-gray-300 dark:border-gray-600 py-3 px-4 text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="••••••••"
                  required
                  disabled={isLocked}
                  minLength={authConfig.passwordMinLength}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  disabled={isLocked}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {password && password.length < authConfig.passwordMinLength && (
                <p className="text-xs text-orange-600 dark:text-orange-400">
                  Password must be at least {authConfig.passwordMinLength} characters
                </p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                />
                <label htmlFor="remember" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Remember me
                </label>
              </div>
              <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading || isLocked || !email || !password || password.length < authConfig.passwordMinLength}
              onClick={(e) => {
                console.log('Button clicked', { 
                  loading, 
                  isLocked, 
                  hasEmail: !!email, 
                  hasPassword: !!password,
                  passwordLength: password.length,
                  minLength: authConfig.passwordMinLength,
                  disabled: loading || isLocked || !email || !password || password.length < authConfig.passwordMinLength
                });
              }}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : isLocked ? (
                <>
                  <Lock size={16} />
                  Account Locked
                </>
              ) : (
                <>
                  Sign in <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Don't have an account?{" "}
              <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
                Sign up
              </Link>
            </p>
          </div>

          <div className="mt-8 text-center text-xs text-gray-500 dark:text-gray-400">
            <p>Secure authentication powered by Qivook</p>
            {loginAttempts > 0 && !isLocked && (
              <p className="text-orange-600 dark:text-orange-400 mt-1">
                {loginAttempts} failed attempt{loginAttempts !== 1 ? 's' : ''} 
                ({authConfig.maxLoginAttempts - loginAttempts} remaining)
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Right side - Hero Section */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-blue-600 to-purple-600 items-center justify-center p-8">
        <div className="text-center text-white max-w-md">
          <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Building2 size={40} />
          </div>
          <h2 className="text-3xl font-bold mb-4">Trade Intelligence Platform</h2>
          <p className="text-blue-100 text-lg leading-relaxed">
            Empowering East African businesses with real-time market intelligence, supplier insights, and trade financing solutions.
          </p>
          <div className="mt-8 space-y-4">
            <div className="flex items-center gap-3 text-blue-100">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>Real-time price tracking</span>
            </div>
            <div className="flex items-center gap-3 text-blue-100">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>Verified supplier network</span>
            </div>
            <div className="flex items-center gap-3 text-blue-100">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>Trade financing solutions</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;