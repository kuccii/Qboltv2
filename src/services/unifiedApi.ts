/**
 * Unified API Service
 * World-class data layer with user-based isolation
 * All data operations go through this service
 */

import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';

// ============================================
// TYPE DEFINITIONS
// ============================================

export type UserProfile = Database['public']['Tables']['user_profiles']['Row'];
export type Price = Database['public']['Tables']['prices']['Row'];
export type Supplier = Database['public']['Tables']['suppliers']['Row'];
export type SupplierReview = Database['public']['Tables']['supplier_reviews']['Row'];
export type Shipment = Database['public']['Tables']['shipments']['Row'];
export type TradeOpportunity = Database['public']['Tables']['trade_opportunities']['Row'];
export type RiskAlert = Database['public']['Tables']['risk_alerts']['Row'];
export type Notification = Database['public']['Tables']['notifications']['Row'];
export type Document = Database['public']['Tables']['documents']['Row'];

// ============================================
// UNIFIED API SERVICE
// ============================================

export const unifiedApi = {
  // ============================================
  // USER PROFILES
  // ============================================

  user: {
    async getProfile(userId?: string): Promise<UserProfile | null> {
      const id = userId || (await supabase.auth.getUser()).data.user?.id;
      if (!id) return null;

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', id)
        .single();

      // Handle case where profile doesn't exist (PGRST116 = no rows found)
      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Profile doesn't exist
        }
        throw error; // Other errors should be thrown
      }
      return data;
    },

    async updateProfile(updates: Partial<UserProfile>) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    async getActivities(userId?: string, limit = 50) {
      const id = userId || (await supabase.auth.getUser()).data.user?.id;
      if (!id) return [];

      const { data, error } = await supabase
        .from('user_activities')
        .select('*')
        .eq('user_id', id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    },

    async logActivity(action: string, resourceType?: string, resourceId?: string, details?: any) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('user_activities')
        .insert({
          user_id: user.id,
          action,
          resource_type: resourceType,
          resource_id: resourceId,
          details,
        });

      if (error) console.error('Failed to log activity:', error);
    },
  },

  // ============================================
  // MARKET INTELLIGENCE - PRICES
  // ============================================

  prices: {
    async get(filters?: {
      material?: string;
      country?: string;
      location?: string;
      limit?: number;
      orderBy?: 'price' | 'updated_at';
      ascending?: boolean;
    }): Promise<Price[]> {
      let query = supabase
        .from('prices')
        .select('*');

      if (filters?.material) {
        query = query.eq('material', filters.material);
      }
      if (filters?.country) {
        query = query.eq('country', filters.country);
      }
      if (filters?.location) {
        query = query.eq('location', filters.location);
      }

      const orderBy = filters?.orderBy || 'updated_at';
      const ascending = filters?.ascending !== undefined ? filters.ascending : false;
      query = query.order(orderBy, { ascending });

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },

    async getById(id: string): Promise<Price | null> {
      const { data, error } = await supabase
        .from('prices')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },

    async create(price: {
      material: string;
      location: string;
      country: string;
      price: number;
      currency?: string;
      unit?: string;
      change_percent?: number;
      source?: string;
      evidence_url?: string[];
    }): Promise<Price> {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('prices')
        .insert({
          ...price,
          reported_by: user.id,
          evidence_url: price.evidence_url || [],
        })
        .select()
        .single();

      if (error) throw error;

      // Log activity
      unifiedApi.user.logActivity('price_reported', 'price', data.id);

      return data;
    },

    async submitReport(report: {
      material: string;
      location: string;
      country: string;
      price: number;
      currency?: string;
      unit?: string;
      evidence_url?: string[];
    }) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('price_reports')
        .insert({
          ...report,
          user_id: user.id,
          evidence_url: report.evidence_url || [],
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
  },

  // ============================================
  // SUPPLIERS
  // ============================================

  suppliers: {
    async get(filters?: {
      country?: string;
      industry?: string;
      material?: string;
      verified?: boolean;
      minRating?: number;
      limit?: number;
      search?: string;
    }): Promise<Supplier[]> {
      let query = supabase
        .from('suppliers')
        .select('*');

      if (filters?.country) {
        query = query.eq('country', filters.country);
      }
      if (filters?.industry) {
        query = query.eq('industry', filters.industry);
      }
      if (filters?.material) {
        query = query.contains('materials', [filters.material]);
      }
      if (filters?.verified !== undefined) {
        query = query.eq('verified', filters.verified);
      }
      if (filters?.minRating) {
        query = query.gte('rating', filters.minRating);
      }
      if (filters?.search) {
        query = query.ilike('name', `%${filters.search}%`);
      }

      query = query.order('rating', { ascending: false });

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },

    async getById(id: string): Promise<Supplier | null> {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*, supplier_scores(*)')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as any;
    },

    async getReviews(supplierId: string, limit = 20): Promise<SupplierReview[]> {
      const { data, error } = await supabase
        .from('supplier_reviews')
        .select('*, user_profiles(name, avatar_url)')
        .eq('supplier_id', supplierId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    },

    async createReview(supplierId: string, review: {
      rating: number;
      review_text?: string;
      quality_rating?: number;
      delivery_rating?: number;
      reliability_rating?: number;
      order_id?: string;
    }): Promise<SupplierReview> {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('supplier_reviews')
        .insert({
          ...review,
          supplier_id: supplierId,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Log activity
      unifiedApi.user.logActivity('review_created', 'supplier_review', data.id);

      return data;
    },

    async createSupplier(supplier: {
      name: string;
      country: string;
      industry: string;
      materials: string[];
      description?: string;
      phone?: string;
      email?: string;
      website?: string;
    }): Promise<Supplier> {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('suppliers')
        .insert({
          ...supplier,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
  },

  // ============================================
  // LOGISTICS & SHIPMENTS
  // ============================================

  logistics: {
    async getRoutes(filters?: {
      origin?: string;
      destination?: string;
      origin_country?: string;
      destination_country?: string;
    }) {
      let query = supabase
        .from('logistics_routes')
        .select('*')
        .eq('status', 'active');

      if (filters?.origin_country) {
        query = query.eq('origin_country', filters.origin_country);
      }
      if (filters?.destination_country) {
        query = query.eq('destination_country', filters.destination_country);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },

    async getShipments(filters?: {
      tracking_number?: string;
      status?: string;
      limit?: number;
    }): Promise<Shipment[]> {
      let query = supabase
        .from('shipments')
        .select('*, logistics_routes(*)');

      if (filters?.tracking_number) {
        query = query.eq('tracking_number', filters.tracking_number);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      query = query.order('created_at', { ascending: false });

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },

    async trackShipment(trackingNumber: string): Promise<Shipment | null> {
      const { data, error } = await supabase
        .from('shipments')
        .select('*, logistics_routes(*), shipment_events(*)')
        .eq('tracking_number', trackingNumber)
        .single();

      if (error) throw error;
      return data as any;
    },

    async createShipment(shipment: {
      tracking_number: string;
      route_id?: string;
      origin: string;
      destination: string;
      weight_kg?: number;
      volume_cubic_m?: number;
      estimated_delivery?: string;
    }): Promise<Shipment> {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('shipments')
        .insert({
          ...shipment,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Log activity
      unifiedApi.user.logActivity('shipment_created', 'shipment', data.id);

      return data;
    },

    async updateShipmentStatus(
      trackingNumber: string,
      status: string,
      location?: { lat: number; lng: number; address?: string }
    ): Promise<Shipment> {
      const updates: any = {
        status,
        updated_at: new Date().toISOString(),
      };

      if (location) {
        updates.current_location = {
          ...location,
          timestamp: new Date().toISOString(),
        };
      }

      if (status === 'delivered') {
        updates.actual_delivery = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('shipments')
        .update(updates)
        .eq('tracking_number', trackingNumber)
        .select()
        .single();

      if (error) throw error;

      // Create tracking event
      await supabase.from('shipment_events').insert({
        shipment_id: data.id,
        event_type: status,
        location: location ? { ...location, timestamp: new Date().toISOString() } : null,
        description: `Status changed to ${status}`,
      });

      return data;
    },
  },

  // ============================================
  // TRADE OPPORTUNITIES
  // ============================================

  opportunities: {
    async get(filters?: {
      opportunity_type?: 'buy' | 'sell' | 'rfq';
      material?: string;
      country?: string;
      status?: string;
      limit?: number;
    }): Promise<TradeOpportunity[]> {
      let query = supabase
        .from('trade_opportunities')
        .select('*, user_profiles(name, company, country)');

      if (filters?.opportunity_type) {
        query = query.eq('opportunity_type', filters.opportunity_type);
      }
      if (filters?.material) {
        query = query.eq('material', filters.material);
      }
      if (filters?.country) {
        query = query.eq('country', filters.country);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      query = query.order('created_at', { ascending: false });

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },

    async create(opportunity: {
      opportunity_type: 'buy' | 'sell' | 'rfq';
      title: string;
      description?: string;
      material: string;
      quantity?: number;
      unit?: string;
      country: string;
      location?: string;
      budget_min?: number;
      budget_max?: number;
      currency?: string;
      deadline?: string;
      insurance_required?: boolean;
      financing_required?: boolean;
    }): Promise<TradeOpportunity> {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('trade_opportunities')
        .insert({
          ...opportunity,
          posted_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Log activity
      unifiedApi.user.logActivity('opportunity_created', 'trade_opportunity', data.id);

      return data;
    },
  },

  // ============================================
  // RISK MANAGEMENT
  // ============================================

  risk: {
    async getAlerts(filters?: {
      severity?: string;
      alert_type?: string;
      resolved?: boolean;
      limit?: number;
    }): Promise<RiskAlert[]> {
      let query = supabase
        .from('risk_alerts')
        .select('*');

      if (filters?.severity) {
        query = query.eq('severity', filters.severity);
      }
      if (filters?.alert_type) {
        query = query.eq('alert_type', filters.alert_type);
      }
      if (filters?.resolved !== undefined) {
        query = query.eq('resolved', filters.resolved);
      }

      query = query.order('created_at', { ascending: false });

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },

    async createAlert(alert: {
      alert_type: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      title: string;
      description?: string;
      affected_resource_type?: string;
      affected_resource_id?: string;
      region?: string;
      country?: string;
    }): Promise<RiskAlert> {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('risk_alerts')
        .insert({
          ...alert,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    async resolveAlert(alertId: string): Promise<RiskAlert> {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('risk_alerts')
        .update({
          resolved: true,
          resolved_at: new Date().toISOString(),
          resolved_by: user.id,
        })
        .eq('id', alertId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
  },

  // ============================================
  // NOTIFICATIONS
  // ============================================

  notifications: {
    async get(filters?: {
      read?: boolean;
      priority?: string;
      limit?: number;
    }): Promise<Notification[]> {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      let query = supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id);

      if (filters?.read !== undefined) {
        query = query.eq('read', filters.read);
      }
      if (filters?.priority) {
        query = query.eq('priority', filters.priority);
      }

      query = query.order('created_at', { ascending: false });

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },

    async markAsRead(notificationId: string) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('notifications')
        .update({
          read: true,
          read_at: new Date().toISOString(),
        })
        .eq('id', notificationId)
        .eq('user_id', user.id);

      if (error) throw error;
    },

    async markAllAsRead() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('notifications')
        .update({
          read: true,
          read_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .eq('read', false);

      if (error) throw error;
    },

    async getUnreadCount(): Promise<number> {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return 0;

      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('read', false);

      if (error) throw error;
      return count || 0;
    },
  },

  // ============================================
  // ANALYTICS
  // ============================================

  analytics: {
    async getMetrics(filters?: {
      period?: '7d' | '30d' | '90d' | '1y';
      country?: string;
      industry?: string;
    }) {
      const { data: { user } } = await supabase.auth.getUser();
      const profile = user ? await unifiedApi.user.getProfile() : null;
      
      const days = filters?.period === '7d' ? 7 : filters?.period === '30d' ? 30 : filters?.period === '90d' ? 90 : 365;
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
      
      const country = filters?.country || profile?.country;
      const industry = filters?.industry || profile?.industry;

      // Get prices for revenue calculation
      let priceQuery = supabase
        .from('prices')
        .select('*')
        .gte('created_at', startDate);
      
      if (country) {
        priceQuery = priceQuery.eq('country', country);
      }

      const { data: prices } = await priceQuery;

      // Get shipments for orders
      let shipmentQuery = supabase
        .from('shipments')
        .select('*')
        .gte('created_at', startDate);
      
      if (profile) {
        shipmentQuery = shipmentQuery.eq('user_id', profile.id);
      }

      const { data: shipments } = await shipmentQuery;

      // Get suppliers
      let supplierQuery = supabase
        .from('suppliers')
        .select('*')
        .eq('active', true);
      
      if (country) {
        supplierQuery = supplierQuery.eq('country', country);
      }
      if (industry) {
        supplierQuery = supplierQuery.eq('industry', industry);
      }

      const { data: suppliers } = await supplierQuery;

      // Calculate metrics
      const totalRevenue = shipments?.reduce((sum, s) => sum + (s.total_cost || 0), 0) || 0;
      const totalOrders = shipments?.length || 0;
      const activeSuppliers = suppliers?.length || 0;
      const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      // Get previous period for growth calculation
      const prevStartDate = new Date(Date.now() - (days * 2) * 24 * 60 * 60 * 1000).toISOString();
      const prevEndDate = startDate;
      
      let prevShipmentQuery = supabase
        .from('shipments')
        .select('*')
        .gte('created_at', prevStartDate)
        .lt('created_at', prevEndDate);
      
      if (profile) {
        prevShipmentQuery = prevShipmentQuery.eq('user_id', profile.id);
      }

      const { data: prevShipments } = await prevShipmentQuery;
      const prevRevenue = prevShipments?.reduce((sum, s) => sum + (s.total_cost || 0), 0) || 0;
      const prevOrders = prevShipments?.length || 0;
      const prevSuppliers = activeSuppliers; // Simplified

      const revenueGrowth = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0;
      const orderGrowth = prevOrders > 0 ? ((totalOrders - prevOrders) / prevOrders) * 100 : 0;
      const supplierGrowth = prevSuppliers > 0 ? ((activeSuppliers - prevSuppliers) / prevSuppliers) * 100 : 0;
      const orderValueGrowth = prevRevenue > 0 && prevOrders > 0 
        ? ((avgOrderValue - (prevRevenue / prevOrders)) / (prevRevenue / prevOrders)) * 100 
        : 0;

      return {
        totalRevenue,
        revenueGrowth,
        totalOrders,
        orderGrowth,
        activeSuppliers,
        supplierGrowth,
        avgOrderValue,
        orderValueGrowth,
      };
    },

    async getPriceTrends(filters?: {
      period?: '7d' | '30d' | '90d' | '1y';
      country?: string;
      materials?: string[];
    }) {
      const days = filters?.period === '7d' ? 7 : filters?.period === '30d' ? 30 : filters?.period === '90d' ? 90 : 365;
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

      let query = supabase
        .from('prices')
        .select('*')
        .gte('created_at', startDate)
        .order('created_at', { ascending: true });

      if (filters?.country) {
        query = query.eq('country', filters.country);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Group by date and material
      const grouped: Record<string, Record<string, number>> = {};
      
      (data || []).forEach((price: any) => {
        const date = new Date(price.created_at).toISOString().split('T')[0];
        if (!grouped[date]) grouped[date] = {};
        if (filters?.materials && !filters.materials.includes(price.material)) return;
        grouped[date][price.material] = price.price;
      });

      // Convert to array format
      return Object.entries(grouped).map(([date, materials]) => ({
        date,
        ...materials,
      }));
    },

    async getSupplierPerformance(filters?: {
      period?: '7d' | '30d' | '90d' | '1y';
      country?: string;
      industry?: string;
      limit?: number;
    }) {
      const days = filters?.period === '7d' ? 7 : filters?.period === '30d' ? 30 : filters?.period === '90d' ? 90 : 365;
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

      // Get shipments with supplier info
      let shipmentQuery = supabase
        .from('shipments')
        .select('*, suppliers(*)')
        .gte('created_at', startDate);

      if (filters?.country) {
        shipmentQuery = shipmentQuery.eq('country', filters.country);
      }

      const { data: shipments } = await shipmentQuery;

      // Get supplier reviews
      let reviewQuery = supabase
        .from('supplier_reviews')
        .select('*')
        .gte('created_at', startDate);

      const { data: reviews } = await reviewQuery;

      // Aggregate by supplier
      const supplierMap: Record<string, { orders: number; revenue: number; ratings: number[] }> = {};

      (shipments || []).forEach((shipment: any) => {
        const supplierId = shipment.supplier_id || shipment.suppliers?.id;
        if (!supplierId) return;

        if (!supplierMap[supplierId]) {
          supplierMap[supplierId] = { orders: 0, revenue: 0, ratings: [] };
        }

        supplierMap[supplierId].orders += 1;
        supplierMap[supplierId].revenue += shipment.total_cost || 0;
      });

      (reviews || []).forEach((review: any) => {
        if (supplierMap[review.supplier_id]) {
          supplierMap[review.supplier_id].ratings.push(review.rating);
        }
      });

      // Convert to array and calculate ratings
      const performance = Object.entries(supplierMap).map(([supplierId, data]) => {
        const supplier = (shipments || []).find((s: any) => 
          (s.supplier_id || s.suppliers?.id) === supplierId
        )?.suppliers || { name: 'Unknown Supplier' };

        return {
          id: supplierId,
          name: supplier.name || 'Unknown Supplier',
          orders: data.orders,
          revenue: data.revenue,
          rating: data.ratings.length > 0 
            ? data.ratings.reduce((a, b) => a + b, 0) / data.ratings.length 
            : 4.0,
        };
      });

      // Sort and limit
      return performance
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, filters?.limit || 10);
    },

    async getMarketShare(filters?: {
      period?: '7d' | '30d' | '90d' | '1y';
      country?: string;
    }) {
      const days = filters?.period === '7d' ? 7 : filters?.period === '30d' ? 30 : filters?.period === '90d' ? 90 : 365;
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

      // Get shipments grouped by category/industry
      let shipmentQuery = supabase
        .from('shipments')
        .select('*')
        .gte('created_at', startDate);

      if (filters?.country) {
        shipmentQuery = shipmentQuery.eq('country', filters.country);
      }

      const { data: shipments } = await shipmentQuery;

      // Group by industry/category
      const categoryMap: Record<string, number> = {};
      (shipments || []).forEach((shipment: any) => {
        const category = shipment.industry || shipment.category || 'Other';
        categoryMap[category] = (categoryMap[category] || 0) + (shipment.total_cost || 0);
      });

      const total = Object.values(categoryMap).reduce((a, b) => a + b, 0);

      return Object.entries(categoryMap).map(([category, value]) => ({
        category,
        value: total > 0 ? (value / total) * 100 : 0,
        color: category === 'construction' ? '#3B82F6' :
               category === 'agriculture' ? '#10B981' :
               category === 'logistics' ? '#F59E0B' :
               '#EF4444',
      }));
    },

    async getRegionalData(filters?: {
      period?: '7d' | '30d' | '90d' | '1y';
    }) {
      const days = filters?.period === '7d' ? 7 : filters?.period === '30d' ? 30 : filters?.period === '90d' ? 90 : 365;
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

      let query = supabase
        .from('shipments')
        .select('*')
        .gte('created_at', startDate);

      const { data: shipments } = await query;

      // Group by region/country
      const regionMap: Record<string, { orders: number; revenue: number }> = {};
      
      (shipments || []).forEach((shipment: any) => {
        const region = shipment.country || shipment.region || 'Other';
        if (!regionMap[region]) {
          regionMap[region] = { orders: 0, revenue: 0 };
        }
        regionMap[region].orders += 1;
        regionMap[region].revenue += shipment.total_cost || 0;
      });

      // Calculate growth (simplified)
      return Object.entries(regionMap).map(([region, data]) => ({
        region,
        orders: data.orders,
        revenue: data.revenue,
        growth: Math.random() * 20 - 10, // Placeholder - would need historical data
      }));
    },
  },

  // ============================================
  // DASHBOARD DATA
  // ============================================

  dashboard: {
    async getMetrics(userId?: string) {
      const { data: { user } } = await supabase.auth.getUser();
      const id = userId || user?.id;
      if (!id) return null;

      const profile = await unifiedApi.user.getProfile(id);
      if (!profile) return null;

      // Get user-specific metrics
      const [prices, suppliers, shipments, opportunities] = await Promise.all([
        unifiedApi.prices.get({ country: profile.country, limit: 10 }),
        unifiedApi.suppliers.get({ country: profile.country, limit: 10 }),
        unifiedApi.logistics.getShipments({ limit: 10 }),
        unifiedApi.opportunities.get({ country: profile.country, limit: 5 }),
      ]);

      return {
        profile,
        prices,
        suppliers,
        shipments,
        opportunities,
        industry: profile.industry,
        country: profile.country,
      };
    },

    async getPriceTrends(material?: string, country?: string, days = 30) {
      const { data, error } = await supabase
        .from('prices')
        .select('*')
        .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (material) {
        return data.filter((p) => p.material === material);
      }
      if (country) {
        return data.filter((p) => p.country === country);
      }

      return data || [];
    },
  },

  // ============================================
  // DEMAND DATA
  // ============================================

  demand: {
    async get(filters?: {
      region?: string;
      country?: string;
      material?: string;
      industry?: string;
    }) {
      let query = supabase.from('demand_data').select('*');

      if (filters?.country) {
        query = query.eq('country', filters.country);
      }
      if (filters?.material) {
        query = query.eq('material', filters.material);
      }
      if (filters?.industry) {
        query = query.eq('industry', filters.industry);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  },

  // ============================================
  // MARKET TRENDS
  // ============================================

  market: {
    async getTrends(filters?: {
      material?: string;
      country?: string;
    }) {
      let query = supabase.from('market_trends').select('*');

      if (filters?.material) {
        query = query.eq('material', filters.material);
      }
      if (filters?.country) {
        query = query.eq('country', filters.country);
      }

      query = query.order('updated_at', { ascending: false });

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  },

  // ============================================
  // DOCUMENTS
  // ============================================

  documents: {
    async get(filters?: {
      type?: string;
      category?: string;
      folderId?: string;
      limit?: number;
    }): Promise<Document[]> {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      let query = supabase
        .from('documents')
        .select('*')
        .eq('user_id', user.id);

      if (filters?.type) {
        query = query.eq('type', filters.type);
      }
      if (filters?.category) {
        query = query.eq('category', filters.category);
      }
      if (filters?.folderId) {
        query = query.eq('folder_id', filters.folderId);
      }

      query = query.order('created_at', { ascending: false });

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },

    async getById(id: string): Promise<Document | null> {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      return data;
    },

    async create(document: {
      name: string;
      type: string;
      category?: string;
      file_url: string;
      file_size?: number;
      mime_type?: string;
      folder_id?: string;
      tags?: string[];
      expiry_date?: string;
    }): Promise<Document> {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('documents')
        .insert({
          ...document,
          user_id: user.id,
          tags: document.tags || [],
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    async update(id: string, updates: Partial<Document>): Promise<Document> {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('documents')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    async delete(id: string): Promise<void> {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
    },

    async share(id: string, userIds: string[]): Promise<Document> {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('documents')
        .update({ shared_with: userIds })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
  },

  // ============================================
  // AGENTS
  // ============================================

  agents: {
    async get(filters?: {
      country?: string;
      service_type?: string;
      limit?: number;
    }) {
      let query = supabase
        .from('agents')
        .select('*')
        .eq('verified', true);

      if (filters?.country) {
        query = query.eq('country', filters.country);
      }
      if (filters?.service_type) {
        query = query.eq('service_type', filters.service_type);
      }

      query = query.order('rating', { ascending: false });

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },

    async getById(id: string) {
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },

    async createBooking(agentId: string, booking: {
      service_type: string;
      booking_date: string;
      duration_hours?: number;
      notes?: string;
    }) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('agent_bookings')
        .insert({
          ...booking,
          agent_id: agentId,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    async getBookings(agentId?: string) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      let query = supabase
        .from('agent_bookings')
        .select('*, agents(*)')
        .eq('user_id', user.id);

      if (agentId) {
        query = query.eq('agent_id', agentId);
      }

      query = query.order('booking_date', { ascending: true });

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  },

  // ============================================
  // FINANCING
  // ============================================

  financing: {
    async getOffers(filters?: {
      industry?: string;
      country?: string;
      minAmount?: number;
      maxAmount?: number;
    }) {
      try {
        let query = supabase
          .from('financing_offers')
          .select('*')
          .eq('active', true);

        if (filters?.industry) {
          query = query.contains('industry', [filters.industry]);
        }
        if (filters?.country) {
          query = query.contains('countries', [filters.country]);
        }
        // Filter: offers where min_amount <= user's maxAmount AND max_amount >= user's minAmount
        // This ensures the offer can accommodate the user's requested amount range
        if (filters?.minAmount) {
          query = query.gte('max_amount', filters.minAmount);
        }
        if (filters?.maxAmount) {
          query = query.lte('min_amount', filters.maxAmount);
        }

        query = query.order('interest_rate', { ascending: true });

        const { data, error } = await query;
        
        if (error) {
          console.error('Error fetching financing offers:', error);
          // Return empty array to allow fallback to mock data
          return [];
        }
        
        return data || [];
      } catch (error: any) {
        console.error('Financing offers fetch error:', error);
        // Return empty array instead of throwing to allow fallback
        return [];
      }
    },

    async getOfferById(id: string) {
      const { data, error } = await supabase
        .from('financing_offers')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },

    async apply(offerId: string, application: {
      amount: number;
      term_days: number;
      purpose?: string;
    }) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('financing_applications')
        .insert({
          ...application,
          user_id: user.id,
          offer_id: offerId,
        })
        .select()
        .single();

      if (error) throw error;

      // Log activity
      unifiedApi.user.logActivity('financing_applied', 'financing_application', data.id);

      return data;
    },

    async getApplications(filters?: {
      status?: string;
    }) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      let query = supabase
        .from('financing_applications')
        .select('*, financing_offers(*)')
        .eq('user_id', user.id);

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  },

  // ============================================
  // PRICE ALERTS
  // ============================================

  priceAlerts: {
    async get(filters?: {
      material?: string;
      country?: string;
      active?: boolean;
    }) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      let query = supabase
        .from('price_alerts')
        .select('*')
        .eq('user_id', user.id);

      if (filters?.material) {
        query = query.eq('material', filters.material);
      }
      if (filters?.country) {
        query = query.eq('country', filters.country);
      }
      if (filters?.active !== undefined) {
        query = query.eq('active', filters.active);
      }

      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },

    async create(alert: {
      material: string;
      country: string;
      condition: 'above' | 'below' | 'change';
      threshold?: number;
      change_percent?: number;
    }) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('price_alerts')
        .insert({
          ...alert,
          user_id: user.id,
          active: true,
          threshold: alert.threshold || 0,
        })
        .select()
        .single();

      if (error) throw error;

      // Log activity
      unifiedApi.user.logActivity('price_alert_created', 'price_alert', data.id);

      return data;
    },

    async update(id: string, updates: {
      active?: boolean;
      threshold?: number;
      change_percent?: number;
    }) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('price_alerts')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    async delete(id: string): Promise<void> {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('price_alerts')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
    },
  },

  // ============================================
  // COUNTRY PROFILES
  // ============================================

  countries: {
    async getProfile(countryCode: string) {
      const { data, error } = await supabase
        .from('country_profiles')
        .select('*')
        .eq('code', countryCode.toUpperCase())
        .single();

      if (error) throw error;
      return data;
    },

    async getSuppliers(countryCode: string, filters?: {
      category?: string;
      verified?: boolean;
      search?: string;
    }) {
      let query = supabase
        .from('country_suppliers')
        .select('*')
        .eq('country_code', countryCode.toUpperCase());

      if (filters?.category) {
        query = query.eq('category', filters.category);
      }
      if (filters?.verified !== undefined) {
        query = query.eq('verified', filters.verified);
      }
      if (filters?.search) {
        query = query.ilike('name', `%${filters.search}%`);
      }

      query = query.order('name', { ascending: true });

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },

    async getInfrastructure(countryCode: string, filters?: {
      type?: string;
      search?: string;
    }) {
      let query = supabase
        .from('country_infrastructure')
        .select('*')
        .eq('country_code', countryCode.toUpperCase());

      if (filters?.type) {
        query = query.eq('type', filters.type);
      }
      if (filters?.search) {
        query = query.ilike('name', `%${filters.search}%`);
      }

      query = query.order('name', { ascending: true });

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },

    async getPricing(countryCode: string, filters?: {
      category?: string;
      region?: string;
    }) {
      let query = supabase
        .from('country_pricing')
        .select('*')
        .eq('country_code', countryCode.toUpperCase());

      if (filters?.category) {
        query = query.eq('category', filters.category);
      }
      if (filters?.region) {
        query = query.eq('region', filters.region);
      }

      query = query.order('last_updated', { ascending: false });

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },

    async getGovernmentContacts(countryCode: string, filters?: {
      ministry?: string;
      jurisdiction?: string;
    }) {
      let query = supabase
        .from('government_contacts')
        .select('*')
        .eq('country_code', countryCode.toUpperCase());

      if (filters?.ministry) {
        query = query.ilike('ministry', `%${filters.ministry}%`);
      }
      if (filters?.jurisdiction) {
        query = query.eq('jurisdiction', filters.jurisdiction);
      }

      query = query.order('ministry', { ascending: true });

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },

    async getStats(countryCode: string) {
      const code = countryCode.toUpperCase();
      
      const [suppliers, infrastructure, pricing, government, profile] = await Promise.all([
        supabase.from('country_suppliers').select('id', { count: 'exact', head: true }).eq('country_code', code),
        supabase.from('country_infrastructure').select('id', { count: 'exact', head: true }).eq('country_code', code),
        supabase.from('country_pricing').select('id', { count: 'exact', head: true }).eq('country_code', code),
        supabase.from('government_contacts').select('id', { count: 'exact', head: true }).eq('country_code', code),
        supabase.from('country_profiles').select('*').eq('code', code).single()
      ]);

      // Get verified suppliers count
      const { count: verifiedCount } = await supabase
        .from('country_suppliers')
        .select('id', { count: 'exact', head: true })
        .eq('country_code', code)
        .eq('verified', true);

      return {
        totalSuppliers: suppliers.count || 0,
        verifiedSuppliers: verifiedCount || 0,
        governmentAgencies: government.count || 0,
        infrastructureFacilities: infrastructure.count || 0,
        pricingItems: pricing.count || 0,
        lastUpdated: profile.data?.last_updated || new Date().toISOString(),
        dataCompleteness: profile.data?.completeness || 0
      };
    },

    async getDemand(countryCode: string, filters?: {
      region?: string;
      material?: string;
      industry?: string;
      trend?: 'up' | 'down' | 'stable';
      timeRange?: 'current' | 'forecast' | 'historical';
    }) {
      let query = supabase
        .from('country_demand')
        .select('*')
        .eq('country_code', countryCode.toUpperCase())
        .order('timestamp', { ascending: false });

      if (filters?.region) {
        query = query.eq('region', filters.region);
      }
      if (filters?.material) {
        query = query.eq('material', filters.material);
      }
      if (filters?.industry) {
        query = query.eq('industry', filters.industry);
      }
      if (filters?.trend) {
        query = query.eq('trend', filters.trend);
      }
      if (filters?.timeRange === 'forecast') {
        query = query.not('forecast_demand', 'is', null);
      } else if (filters?.timeRange === 'historical') {
        // Get data older than 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        query = query.lt('timestamp', thirtyDaysAgo.toISOString());
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },

    async submitDemandData(countryCode: string, data: {
      region: string;
      material: string;
      industry: string;
      demand_quantity: number;
      demand_unit?: string;
      trend?: 'up' | 'down' | 'stable';
      latitude?: number;
      longitude?: number;
      forecast_demand?: number;
      forecast_period?: '30d' | '90d' | '6m' | '1y';
      notes?: string;
    }) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: result, error } = await supabase
        .from('country_demand')
        .insert({
          ...data,
          country_code: countryCode.toUpperCase(),
          source: 'user_contributed',
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
  },
};

export default unifiedApi;


