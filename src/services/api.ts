// API service layer for Qivook platform
import { authConfig } from '../config/auth';
import { tokenManager } from '../lib/auth';

export interface ApiResponse<T = any> {
  data: T;
  success: boolean;
  message?: string;
  errors?: string[];
}

export interface ApiError {
  message: string;
  status: number;
  code?: string;
}

export class ApiClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;

  constructor() {
    this.baseURL = authConfig.apiBaseUrl;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  }

  private async getAuthHeaders(): Promise<Record<string, string>> {
    const token = tokenManager.getToken();
    if (token && !tokenManager.isTokenExpired(token)) {
      return {
        ...this.defaultHeaders,
        'Authorization': `Bearer ${token}`,
      };
    }
    return this.defaultHeaders;
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');
    
    let data: any;
    try {
      data = isJson ? await response.json() : await response.text();
    } catch (error) {
      throw new ApiError('Failed to parse response', response.status);
    }

    if (!response.ok) {
      throw new ApiError(
        data.message || `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        data.code
      );
    }

    return {
      data: data.data || data,
      success: true,
      message: data.message,
    };
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    const url = new URL(`${this.baseURL}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: await this.getAuthHeaders(),
    });

    return this.handleResponse<T>(response);
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: await this.getAuthHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PUT',
      headers: await this.getAuthHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'DELETE',
      headers: await this.getAuthHeaders(),
    });

    return this.handleResponse<T>(response);
  }

  async upload<T>(endpoint: string, file: File, additionalData?: Record<string, any>): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
    }

    const headers = await this.getAuthHeaders();
    delete headers['Content-Type']; // Let browser set it for FormData

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
    });

    return this.handleResponse<T>(response);
  }
}

// Create singleton instance
export const apiClient = new ApiClient();

// Specific API services
export const priceApi = {
  // Price tracking
  getPrices: (params?: {
    material?: string;
    location?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  }) => apiClient.get('/prices', params),

  getPriceHistory: (material: string, location: string, period: string) =>
    apiClient.get(`/prices/history/${material}/${location}`, { period }),

  submitPriceReport: (data: {
    material: string;
    location: string;
    price: number;
    unit: string;
    notes?: string;
  }) => apiClient.post('/prices/reports', data),

  getPriceAlerts: () => apiClient.get('/prices/alerts'),
};

export const supplierApi = {
  // Supplier management
  getSuppliers: (params?: {
    industry?: string;
    location?: string;
    rating?: number;
    search?: string;
    limit?: number;
    offset?: number;
  }) => apiClient.get('/suppliers', params),

  getSupplier: (id: string) => apiClient.get(`/suppliers/${id}`),

  getSupplierScores: (supplierId: string) => apiClient.get(`/suppliers/${supplierId}/scores`),

  updateSupplierScore: (supplierId: string, data: {
    reliability: number;
    quality: number;
    delivery: number;
    communication: number;
  }) => apiClient.put(`/suppliers/${supplierId}/scores`, data),

  getSupplierReviews: (supplierId: string) => apiClient.get(`/suppliers/${supplierId}/reviews`),

  addSupplierReview: (supplierId: string, data: {
    rating: number;
    comment: string;
    orderId?: string;
  }) => apiClient.post(`/suppliers/${supplierId}/reviews`, data),
};

export const logisticsApi = {
  // Logistics and shipping
  getLogisticsRoutes: (params?: {
    origin?: string;
    destination?: string;
    status?: string;
    industry?: string;
  }) => apiClient.get('/logistics/routes', params),

  getRouteDetails: (routeId: string) => apiClient.get(`/logistics/routes/${routeId}`),

  calculateShipping: (data: {
    origin: string;
    destination: string;
    weight: number;
    volume: number;
    material: string;
  }) => apiClient.post('/logistics/calculate', data),

  trackShipment: (trackingNumber: string) => apiClient.get(`/logistics/track/${trackingNumber}`),

  getLogisticsAlerts: () => apiClient.get('/logistics/alerts'),
};

export const demandApi = {
  // Demand mapping and analysis
  getDemandData: (params?: {
    region?: string;
    material?: string;
    industry?: string;
    period?: string;
  }) => apiClient.get('/demand', params),

  getDemandHeatmap: (material: string, region: string) =>
    apiClient.get(`/demand/heatmap/${material}/${region}`),

  getDemandForecast: (material: string, location: string, days: number) =>
    apiClient.get(`/demand/forecast/${material}/${location}`, { days }),

  submitDemandData: (data: {
    material: string;
    location: string;
    quantity: number;
    timestamp: string;
    source: string;
  }) => apiClient.post('/demand/submit', data),
};

export const financingApi = {
  // Financial services
  getFinancingOffers: (params?: {
    industry?: string;
    amount?: number;
    term?: number;
    location?: string;
  }) => apiClient.get('/financing/offers', params),

  getFinancingOffer: (offerId: string) => apiClient.get(`/financing/offers/${offerId}`),

  applyForFinancing: (data: {
    offerId: string;
    amount: number;
    term: number;
    businessInfo: any;
  }) => apiClient.post('/financing/apply', data),

  getFinancingStatus: (applicationId: string) => apiClient.get(`/financing/status/${applicationId}`),

  getPaymentHistory: () => apiClient.get('/financing/payments'),
};

export const riskApi = {
  // Risk management
  getRiskAlerts: (params?: {
    severity?: string;
    type?: string;
    region?: string;
  }) => apiClient.get('/risk/alerts', params),

  getRiskAssessment: (supplierId: string) => apiClient.get(`/risk/assessment/${supplierId}`),

  submitRiskReport: (data: {
    type: string;
    severity: string;
    description: string;
    location: string;
    supplierId?: string;
  }) => apiClient.post('/risk/reports', data),

  getRiskMitigationStrategies: (riskType: string) =>
    apiClient.get(`/risk/mitigation/${riskType}`),
};

export const documentApi = {
  // Document management
  getDocuments: (params?: {
    type?: string;
    category?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }) => apiClient.get('/documents', params),

  uploadDocument: (file: File, metadata: {
    name: string;
    type: string;
    category: string;
    tags?: string[];
  }) => apiClient.upload('/documents/upload', file, metadata),

  getDocument: (documentId: string) => apiClient.get(`/documents/${documentId}`),

  deleteDocument: (documentId: string) => apiClient.delete(`/documents/${documentId}`),

  shareDocument: (documentId: string, data: {
    userIds: string[];
    permissions: string[];
  }) => apiClient.post(`/documents/${documentId}/share`, data),
};

export const adminApi = {
  // Admin functions
  getSystemStats: () => apiClient.get('/admin/stats'),

  getUsers: (params?: {
    role?: string;
    status?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }) => apiClient.get('/admin/users', params),

  updateUser: (userId: string, data: any) => apiClient.put(`/admin/users/${userId}`, data),

  getSystemHealth: () => apiClient.get('/admin/health'),

  getAuditLogs: (params?: {
    action?: string;
    userId?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  }) => apiClient.get('/admin/audit-logs', params),
};

// Error handling utility
export const handleApiError = (error: any): string => {
  if (error instanceof ApiError) {
    return error.message;
  }
  
  if (error.message) {
    return error.message;
  }
  
  return 'An unexpected error occurred. Please try again.';
};

