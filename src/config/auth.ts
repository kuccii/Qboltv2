// Authentication configuration
export const authConfig = {
  // Token settings
  tokenKey: 'qbolt_access_token',
  tokenExpiryBuffer: 5 * 60 * 1000, // 5 minutes before expiry
  
  // Session settings
  sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
  refreshThreshold: 10 * 60 * 1000, // 10 minutes before expiry
  
  // API settings
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api',
  authEndpoints: {
    login: '/auth/login',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
    profile: '/auth/profile'
  },
  
  // Security settings
  maxLoginAttempts: 5,
  lockoutDuration: 15 * 60 * 1000, // 15 minutes
  passwordMinLength: 8,
  
  // Demo mode (for development)
  // If VITE_API_BASE_URL is not set, we're using Supabase auth only (no custom API)
  isDemoMode: import.meta.env.VITE_DEMO_MODE === 'true' || !import.meta.env.VITE_API_BASE_URL,
  demoCredentials: {
    admin: { email: 'admin@qivook.com', password: 'admin123' },
    user: { email: 'user@qivook.com', password: 'user12345' },
    demo: { email: 'demo@qivook.com', password: 'demo123' }
  }
};

// Environment validation
export const validateAuthConfig = () => {
  const requiredEnvVars = [
    'VITE_API_BASE_URL'
  ];

  const missingVars = requiredEnvVars.filter(
    varName => !import.meta.env[varName]
  );

  if (missingVars.length > 0 && !authConfig.isDemoMode) {
    console.warn(
      `Missing environment variables: ${missingVars.join(', ')}. ` +
      'Running in demo mode. Set VITE_DEMO_MODE=true to suppress this warning.'
    );
  }
};

// Role-based access control configuration
export const rbacConfig = {
  roles: {
    admin: {
      permissions: [
        'users:read',
        'users:write',
        'users:delete',
        'suppliers:read',
        'suppliers:write',
        'suppliers:delete',
        'prices:read',
        'prices:write',
        'reports:read',
        'reports:write',
        'settings:read',
        'settings:write'
      ]
    },
    user: {
      permissions: [
        'suppliers:read',
        'prices:read',
        'reports:read',
        'profile:read',
        'profile:write'
      ]
    }
  },
  
  checkPermission(userRole: string, permission: string): boolean {
    const rolePermissions = rbacConfig.roles[userRole as keyof typeof rbacConfig.roles];
    return rolePermissions?.permissions.includes(permission) || false;
  }
};
