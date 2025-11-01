// Custom hooks for supplier-related data
import { useApi, usePaginatedApi, useMutation } from './useApi';
import { supplierApi } from '../services/api';

export interface Supplier {
  id: string;
  name: string;
  location: string;
  industry: 'construction' | 'agriculture';
  materials: string[];
  rating: number;
  verified: boolean;
  deliveryTime: string;
  contactInfo: {
    phone: string;
    email: string;
    website?: string;
  };
  specialties: string[];
  certifications: string[];
  score: {
    reliability: number;
    quality: number;
    delivery: number;
    communication: number;
    overall: number;
  };
  lastDelivery?: string;
  tier: 'premium' | 'standard' | 'basic';
}

export interface SupplierReview {
  id: string;
  supplierId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  orderId?: string;
  createdAt: string;
  helpful: number;
}

export interface SupplierScore {
  supplierId: string;
  reliability: number;
  quality: number;
  delivery: number;
  communication: number;
  overall: number;
  totalReviews: number;
  lastUpdated: string;
}

// Hook for getting suppliers
export function useSuppliers(params?: {
  industry?: string;
  location?: string;
  rating?: number;
  search?: string;
}) {
  return useApi(() => supplierApi.getSuppliers(params), {
    dependencies: [params?.industry, params?.location, params?.rating, params?.search],
  });
}

// Hook for getting a specific supplier
export function useSupplier(supplierId: string) {
  return useApi(() => supplierApi.getSupplier(supplierId), {
    dependencies: [supplierId],
  });
}

// Hook for getting supplier scores
export function useSupplierScores(supplierId: string) {
  return useApi(() => supplierApi.getSupplierScores(supplierId), {
    dependencies: [supplierId],
  });
}

// Hook for updating supplier scores
export function useUpdateSupplierScore() {
  return useMutation(
    ({ supplierId, data }: { supplierId: string; data: any }) =>
      supplierApi.updateSupplierScore(supplierId, data),
    {
      onSuccess: (data) => {
        console.log('Supplier score updated successfully:', data);
      },
      onError: (error) => {
        console.error('Failed to update supplier score:', error);
      },
    }
  );
}

// Hook for getting supplier reviews
export function useSupplierReviews(supplierId: string) {
  return useApi(() => supplierApi.getSupplierReviews(supplierId), {
    dependencies: [supplierId],
  });
}

// Hook for adding supplier reviews
export function useAddSupplierReview() {
  return useMutation(
    ({ supplierId, data }: { supplierId: string; data: any }) =>
      supplierApi.addSupplierReview(supplierId, data),
    {
      onSuccess: (data) => {
        console.log('Supplier review added successfully:', data);
      },
      onError: (error) => {
        console.error('Failed to add supplier review:', error);
      },
    }
  );
}

// Hook for paginated suppliers
export function usePaginatedSuppliers(params?: {
  industry?: string;
  location?: string;
  rating?: number;
  search?: string;
  pageSize?: number;
}) {
  return usePaginatedApi(
    (page, limit) => supplierApi.getSuppliers({ ...params, limit, offset: (page - 1) * limit }),
    {
      pageSize: params?.pageSize || 20,
      dependencies: [params?.industry, params?.location, params?.rating, params?.search],
    }
  );
}

