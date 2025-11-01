// Authentication utilities and JWT handling
import { jwtDecode } from 'jwt-decode';

export interface JWTPayload {
  sub: string; // user id
  email: string;
  name: string;
  company: string;
  industry: 'construction' | 'agriculture';
  country: string;
  role: 'user' | 'admin';
  iat: number;
  exp: number;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  company: string;
  industry: 'construction' | 'agriculture';
  country: string;
  role: 'user' | 'admin';
}

export class AuthError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'AuthError';
  }
}

export class TokenExpiredError extends AuthError {
  constructor() {
    super('Token has expired', 'TOKEN_EXPIRED');
  }
}

export class InvalidTokenError extends AuthError {
  constructor() {
    super('Invalid token', 'INVALID_TOKEN');
  }
}

// JWT token management
export const tokenManager = {
  getToken(): string | null {
    return localStorage.getItem('qivook_access_token');
  },

  setToken(token: string): void {
    localStorage.setItem('qivook_access_token', token);
  },

  removeToken(): void {
    localStorage.removeItem('qivook_access_token');
  },

  isTokenExpired(token: string): boolean {
    try {
      const decoded = jwtDecode<JWTPayload>(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp < currentTime;
    } catch {
      return true;
    }
  },

  decodeToken(token: string): JWTPayload {
    try {
      return jwtDecode<JWTPayload>(token);
    } catch (error) {
      throw new InvalidTokenError();
    }
  }
};

// User data management
export const userManager = {
  getUser(): AuthUser | null {
    const token = tokenManager.getToken();
    if (!token) return null;

    try {
      if (tokenManager.isTokenExpired(token)) {
        tokenManager.removeToken();
        return null;
      }

      const payload = tokenManager.decodeToken(token);
      return {
        id: payload.sub,
        name: payload.name,
        email: payload.email,
        company: payload.company,
        industry: payload.industry,
        country: payload.country,
        role: payload.role
      };
    } catch (error) {
      tokenManager.removeToken();
      return null;
    }
  },

  setUser(user: AuthUser, token: string): void {
    tokenManager.setToken(token);
  },

  clearUser(): void {
    tokenManager.removeToken();
  }
};

// API simulation for authentication
export const authAPI = {
  async login(email: string, password: string): Promise<{ user: AuthUser; token: string }> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Validate credentials (in production, this would be a real API call)
    const validCredentials = this.validateCredentials(email, password);
    if (!validCredentials) {
      throw new AuthError('Invalid email or password', 'INVALID_CREDENTIALS');
    }

    // Generate mock JWT token (in production, this comes from backend)
    const user = this.getUserByEmail(email);
    const token = this.generateMockToken(user);

    return { user, token };
  },

  async logout(): Promise<void> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // In production, this would invalidate the token on the server
    tokenManager.removeToken();
  },

  async refreshToken(): Promise<string> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const currentUser = userManager.getUser();
    if (!currentUser) {
      throw new AuthError('No user logged in', 'NO_USER');
    }

    // In production, this would call the refresh endpoint
    return this.generateMockToken(currentUser);
  },

  validateCredentials(email: string, password: string): boolean {
    // In production, this would be validated against the backend
    const validUsers = [
      { email: 'admin@qivook.com', password: 'admin123' },
      { email: 'user@qivook.com', password: 'user12345' },
      { email: 'demo@qivook.com', password: 'demo123' }
    ];

    return validUsers.some(user => user.email === email && user.password === password);
  },

  getUserByEmail(email: string): AuthUser {
    const users: Record<string, AuthUser> = {
      'admin@qivook.com': {
        id: '1',
        name: 'Admin User',
        email: 'admin@qivook.com',
        company: 'Qivook',
        industry: 'construction',
        country: 'KE',
        role: 'admin'
      },
      'user@qivook.com': {
        id: '2',
        name: 'Regular User',
        email: 'user@qivook.com',
        company: 'Test Company',
        industry: 'agriculture',
        country: 'UG',
        role: 'user'
      },
      'demo@qivook.com': {
        id: '3',
        name: 'Demo User',
        email: 'demo@qivook.com',
        company: 'Demo Corp',
        industry: 'construction',
        country: 'RW',
        role: 'user'
      }
    };

    const user = users[email];
    if (!user) {
      throw new AuthError('User not found', 'USER_NOT_FOUND');
    }

    return user;
  },

  generateMockToken(user: AuthUser): string {
    // In production, this would be generated by the backend
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({
      sub: user.id,
      email: user.email,
      name: user.name,
      company: user.company,
      industry: user.industry,
      country: user.country,
      role: user.role,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
    }));
    const signature = btoa('mock-signature');

    return `${header}.${payload}.${signature}`;
  }
};
