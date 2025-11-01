// Real API service layer for Qivook
import axios from 'axios';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.qivook.com/v1';
const API_TIMEOUT = 10000;

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('qivook_access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired, redirect to login
      localStorage.removeItem('qivook_access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Real API Services
export const realApiService = {
  // Authentication
  auth: {
    login: async (email: string, password: string) => {
      const response = await apiClient.post('/auth/login', { email, password });
      return response.data;
    },
    register: async (userData: any) => {
      const response = await apiClient.post('/auth/register', userData);
      return response.data;
    },
    refreshToken: async () => {
      const response = await apiClient.post('/auth/refresh');
      return response.data;
    },
  },

  // Market Intelligence
  market: {
    getPrices: async (params: {
      material?: string;
      country?: string;
      dateFrom?: string;
      dateTo?: string;
    }) => {
      const response = await apiClient.get('/market/prices', { params });
      return response.data;
    },
    submitPriceReport: async (reportData: any) => {
      const response = await apiClient.post('/market/price-reports', reportData);
      return response.data;
    },
    getDemandData: async (params: any) => {
      const response = await apiClient.get('/market/demand', { params });
      return response.data;
    },
  },

  // Suppliers
  suppliers: {
    getSuppliers: async (params: {
      country?: string;
      industry?: string;
      material?: string;
      verified?: boolean;
      page?: number;
      limit?: number;
    }) => {
      const response = await apiClient.get('/suppliers', { params });
      return response.data;
    },
    getSupplier: async (id: string) => {
      const response = await apiClient.get(`/suppliers/${id}`);
      return response.data;
    },
    rateSupplier: async (id: string, rating: number, review?: string) => {
      const response = await apiClient.post(`/suppliers/${id}/rate`, {
        rating,
        review,
      });
      return response.data;
    },
  },

  // Logistics
  logistics: {
    getRoutes: async (params: any) => {
      const response = await apiClient.get('/logistics/routes', { params });
      return response.data;
    },
    trackShipment: async (trackingNumber: string) => {
      const response = await apiClient.get(`/logistics/track/${trackingNumber}`);
      return response.data;
    },
    getInfrastructure: async (country?: string) => {
      const response = await apiClient.get('/logistics/infrastructure', {
        params: { country },
      });
      return response.data;
    },
  },

  // Financing
  financing: {
    getOffers: async (params: any) => {
      const response = await apiClient.get('/financing/offers', { params });
      return response.data;
    },
    applyForLoan: async (applicationData: any) => {
      const response = await apiClient.post('/financing/apply', applicationData);
      return response.data;
    },
    getApplicationStatus: async (applicationId: string) => {
      const response = await apiClient.get(`/financing/status/${applicationId}`);
      return response.data;
    },
  },

  // Analytics
  analytics: {
    getDashboardMetrics: async (params: any) => {
      const response = await apiClient.get('/analytics/dashboard', { params });
      return response.data;
    },
    getPriceTrends: async (params: any) => {
      const response = await apiClient.get('/analytics/price-trends', { params });
      return response.data;
    },
    getSupplierPerformance: async (params: any) => {
      const response = await apiClient.get('/analytics/supplier-performance', { params });
      return response.data;
    },
  },

  // Country Data
  countries: {
    getCountryData: async (countryCode: string) => {
      const response = await apiClient.get(`/countries/${countryCode}`);
      return response.data;
    },
    getCountrySuppliers: async (countryCode: string, params: any) => {
      const response = await apiClient.get(`/countries/${countryCode}/suppliers`, { params });
      return response.data;
    },
    getCountryPricing: async (countryCode: string, params: any) => {
      const response = await apiClient.get(`/countries/${countryCode}/pricing`, { params });
      return response.data;
    },
  },
};

// Error handling utility
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Helper function to handle API errors
export const handleApiError = (error: any): ApiError => {
  if (error.response) {
    return new ApiError(
      error.response.data?.message || 'API request failed',
      error.response.status,
      error.response.data?.code
    );
  } else if (error.request) {
    return new ApiError('Network error - please check your connection');
  } else {
    return new ApiError('An unexpected error occurred');
  }
};

export default realApiService;

