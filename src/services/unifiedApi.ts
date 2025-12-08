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
      industry?: 'construction' | 'agriculture';
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
      // Industry filtering: Map materials to industries
      if (filters?.industry) {
        const constructionMaterials = ['Cement', 'Steel', 'Timber', 'Sand', 'Bricks', 'Tiles', 'Paint', 'Wood', 'Glass', 'Aluminum', 'Aggregates'];
        const agricultureMaterials = ['Fertilizer', 'Seeds', 'Pesticides', 'Feed', 'Machinery', 'Irrigation Equipment', 'Storage Bags', 'Tools'];
        const materials = filters.industry === 'construction' ? constructionMaterials : agricultureMaterials;
        query = query.in('material', materials);
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

    async updateReview(reviewId: string, updates: {
      rating?: number;
      review_text?: string;
      quality_rating?: number;
      delivery_rating?: number;
      reliability_rating?: number;
    }): Promise<SupplierReview> {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('supplier_reviews')
        .update(updates)
        .eq('id', reviewId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    async deleteReview(reviewId: string): Promise<void> {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('supplier_reviews')
        .delete()
        .eq('id', reviewId)
        .eq('user_id', user.id);

      if (error) throw error;
    },

    async markReviewHelpful(reviewId: string): Promise<void> {
      const { error } = await supabase.rpc('increment_helpful_count', {
        review_id: reviewId
      });
      if (error) {
        // If RPC doesn't exist, manually increment
        const { data: review } = await supabase
          .from('supplier_reviews')
          .select('helpful_count')
          .eq('id', reviewId)
          .single();
        
        if (review) {
          await supabase
            .from('supplier_reviews')
            .update({ helpful_count: (review.helpful_count || 0) + 1 })
            .eq('id', reviewId);
        }
      }
    },

    async getReviewStats(supplierId: string) {
      const { data, error } = await supabase
        .from('supplier_reviews')
        .select('rating')
        .eq('supplier_id', supplierId);

      if (error) throw error;

      const reviews = data || [];
      const total = reviews.length;
      const average = total > 0 
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / total 
        : 0;
      const distribution = [1, 2, 3, 4, 5].map(rating => ({
        rating,
        count: reviews.filter(r => r.rating === rating).length
      }));

      return {
        total,
        average: Math.round(average * 10) / 10,
        distribution
      };
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
      verified?: boolean;
      insurance_active?: boolean;
      rating?: number;
      total_reviews?: number;
      total_orders?: number;
      on_time_delivery_rate?: number;
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

    async update(id: string, updates: Partial<{
      name: string;
      country: string;
      industry: string;
      materials: string[];
      description: string;
      verified: boolean;
      insurance_active: boolean;
      rating: number;
      total_reviews: number;
      total_orders: number;
      on_time_delivery_rate: number;
      phone: string;
      email: string;
      website: string;
      verified_at: string | null;
    }>): Promise<Supplier> {
      const { data, error } = await supabase
        .from('suppliers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    async deleteSupplier(id: string): Promise<void> {
      const { error } = await supabase
        .from('suppliers')
        .delete()
        .eq('id', id);

      if (error) throw error;
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

    // Admin CRUD methods
    async getAll(filters?: { limit?: number }) {
      let query = supabase
        .from('logistics_routes')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;
      if (error) throw error;
      return { data: data || [] };
    },

    async create(route: {
      origin: string;
      destination: string;
      origin_country: string;
      destination_country: string;
      distance_km?: number;
      estimated_days?: number;
      cost_per_ton?: number;
      status?: string;
    }) {
      const { data, error } = await supabase
        .from('logistics_routes')
        .insert(route)
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    async update(id: string, updates: any) {
      const { data, error } = await supabase
        .from('logistics_routes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    async delete(id: string) {
      const { error } = await supabase
        .from('logistics_routes')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },

    async getShipmentsAdmin(filters?: { status?: string; limit?: number }) {
      let query = supabase
        .from('shipments')
        .select('*, logistics_routes(*), user_profiles(*)')
        .order('created_at', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;
      if (error) throw error;
      return { data: data || [] };
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
  // INSURANCE MANAGEMENT
  // ============================================

  insurance: {
    async getPolicies(filters?: {
      active?: boolean;
    }) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // Fetch insurance from suppliers and shipments
      const [suppliersResult, shipmentsResult] = await Promise.all([
        supabase
          .from('suppliers')
          .select('id, name, insurance_active, insurance_expiry, insurance_details')
          .eq('insurance_active', true),
        supabase
          .from('shipments')
          .select('id, tracking_number, insurance_active, insurance_details, created_at')
          .eq('user_id', user.id)
          .eq('insurance_active', true)
      ]);

      const policies: any[] = [];

      // Transform supplier insurance
      if (suppliersResult.data) {
        suppliersResult.data.forEach((supplier: any) => {
          if (supplier.insurance_active) {
            policies.push({
              id: `supplier-${supplier.id}`,
              type: 'supplier_liability',
              provider: supplier.insurance_details?.provider || 'Unknown',
              coverageAmount: supplier.insurance_details?.coverage_amount || 0,
              expiryDate: supplier.insurance_expiry ? new Date(supplier.insurance_expiry) : null,
              status: supplier.insurance_expiry && new Date(supplier.insurance_expiry) > new Date() ? 'active' : 'expired',
              entityType: 'supplier',
              entityId: supplier.id,
              entityName: supplier.name,
              details: supplier.insurance_details || {}
            });
          }
        });
      }

      // Transform shipment insurance
      if (shipmentsResult.data) {
        shipmentsResult.data.forEach((shipment: any) => {
          if (shipment.insurance_active && shipment.insurance_details) {
            policies.push({
              id: `shipment-${shipment.id}`,
              type: shipment.insurance_details.type || 'cargo',
              provider: shipment.insurance_details.provider || 'Unknown',
              coverageAmount: shipment.insurance_details.coverage_amount || 0,
              expiryDate: shipment.insurance_details.expiry_date ? new Date(shipment.insurance_details.expiry_date) : null,
              status: shipment.insurance_details.expiry_date && new Date(shipment.insurance_details.expiry_date) > new Date() ? 'active' : 'expired',
              entityType: 'shipment',
              entityId: shipment.id,
              entityName: `Shipment ${shipment.tracking_number}`,
              details: shipment.insurance_details
            });
          }
        });
      }

      // Filter by active status if requested
      if (filters?.active !== undefined) {
        return policies.filter(p => 
          filters.active ? p.status === 'active' : p.status !== 'active'
        );
      }

      return policies;
    },

    async getCoverageSummary() {
      try {
        const policies = await this.getPolicies({ active: true });
        
        const totalCoverage = policies.reduce((sum, p) => sum + (p.coverageAmount || 0), 0);
        const activePolicies = policies.filter(p => p.status === 'active').length;
        const expiringSoon = policies.filter(p => {
          if (!p.expiryDate) return false;
          const daysUntilExpiry = (p.expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
          return daysUntilExpiry > 0 && daysUntilExpiry <= 30;
        }).length;

        // Get risk profile to calculate recommendations
        let riskProfile;
        try {
          riskProfile = await unifiedApi.riskProfile.get();
        } catch (err) {
          // Risk profile doesn't exist yet, use defaults
          riskProfile = null;
        }

        // Calculate coverage gaps based on risk profile and alerts
        const alerts = await unifiedApi.risk.getAlerts({ resolved: false });
        const highRiskAlerts = alerts.filter((a: any) => a.severity === 'high' || a.severity === 'critical');
        
        // Base recommended coverage on risk tolerance
        let baseRecommendedCoverage = 3000000; // Default
        if (riskProfile?.risk_tolerance === 'low') {
          baseRecommendedCoverage = 5000000; // Conservative - more coverage
        } else if (riskProfile?.risk_tolerance === 'high') {
          baseRecommendedCoverage = 2000000; // Aggressive - less coverage
        }

        // Adjust based on high-risk alerts
        const recommendedCoverage = highRiskAlerts.length > 0 
          ? Math.max(baseRecommendedCoverage, 5000000)
          : baseRecommendedCoverage;

        // Use risk profile's min_coverage preference if set
        const minCoverage = riskProfile?.insurance_preferences?.min_coverage || 1000000;
        const finalRecommendedCoverage = Math.max(recommendedCoverage, minCoverage);

        // Calculate coverage gaps
        const coverageGaps = totalCoverage < finalRecommendedCoverage 
          ? (highRiskAlerts.length > 0 ? 2 : 1)
          : 0;

        return {
          activePolicies,
          totalCoverage,
          coverageGaps,
          expiringSoon,
          recommendedCoverage: finalRecommendedCoverage,
          policies
        };
      } catch (error) {
        console.error('Error getting insurance coverage summary:', error);
        return {
          activePolicies: 0,
          totalCoverage: 0,
          coverageGaps: 0,
          expiringSoon: 0,
          recommendedCoverage: 3000000,
          policies: []
        };
      }
    },

    // Insurance Quotes
    async getQuotes(filters?: {
      quoteType?: string;
      status?: string;
      limit?: number;
    }) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      let query = supabase
        .from('insurance_quotes')
        .select('*, insurance_providers(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (filters?.quoteType) {
        query = query.eq('quote_type', filters.quoteType);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },

    async requestQuote(request: {
      providerId: string;
      quoteType: 'cargo' | 'liability' | 'property' | 'general' | 'trade_credit';
      coverageAmount: number;
      termDays: number;
      currency?: string;
      additionalData?: any;
    }) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get user profile for quote data
      const profile = await unifiedApi.user.getProfile(user.id);
      
      // Import insurance partner service
      const { insurancePartnerService } = await import('./insurancePartners');
      
      // Request quote from partner
      const quoteResponse = await insurancePartnerService.requestQuote(
        request.providerId,
        {
          quoteType: request.quoteType,
          coverageAmount: request.coverageAmount,
          termDays: request.termDays,
          currency: request.currency || 'KES',
          userData: {
            name: profile.name,
            email: profile.email,
            company: profile.company || '',
            country: profile.country,
            industry: profile.industry || 'construction'
          },
          additionalData: request.additionalData
        }
      );

      if (!quoteResponse.success) {
        throw new Error(quoteResponse.error || 'Failed to get quote');
      }

      // Save quote to database
      const expiresAt = quoteResponse.expiresAt 
        ? new Date(quoteResponse.expiresAt)
        : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // Default 7 days

      const { data, error } = await supabase
        .from('insurance_quotes')
        .insert({
          user_id: user.id,
          provider_id: request.providerId,
          quote_type: request.quoteType,
          coverage_amount: quoteResponse.coverageAmount || request.coverageAmount,
          premium: quoteResponse.premium || 0,
          currency: quoteResponse.currency || request.currency || 'KES',
          term_days: request.termDays,
          deductible: quoteResponse.deductible,
          coverage_details: quoteResponse.coverageDetails || {},
          requirements: quoteResponse.requirements || [],
          exclusions: quoteResponse.exclusions || [],
          quote_data: quoteResponse,
          status: 'pending',
          expires_at: expiresAt,
          partner_quote_id: quoteResponse.quoteId
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    // Insurance Applications
    async getApplications(filters?: {
      status?: string;
      limit?: number;
    }) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      let query = supabase
        .from('insurance_applications')
        .select('*, insurance_quotes(*), insurance_providers(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },

    async submitApplication(request: {
      quoteId: string;
      additionalData?: any;
    }) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get quote
      const { data: quote, error: quoteError } = await supabase
        .from('insurance_quotes')
        .select('*, insurance_providers(*)')
        .eq('id', request.quoteId)
        .eq('user_id', user.id)
        .single();

      if (quoteError || !quote) {
        throw new Error('Quote not found');
      }

      // Check if quote is still valid
      if (quote.status !== 'pending' || new Date(quote.expires_at) < new Date()) {
        throw new Error('Quote expired or no longer valid');
      }

      // Get user profile
      const profile = await unifiedApi.user.getProfile(user.id);

      // Import insurance partner service
      const { insurancePartnerService } = await import('./insurancePartners');

      // Submit application to partner
      const appResponse = await insurancePartnerService.submitApplication(
        quote.provider_id,
        {
          quoteId: request.quoteId,
          userData: {
            name: profile.name,
            email: profile.email,
            company: profile.company || '',
            country: profile.country,
            industry: profile.industry || 'construction'
          },
          additionalData: request.additionalData
        }
      );

      if (!appResponse.success) {
        throw new Error(appResponse.error || 'Failed to submit application');
      }

      // Save application to database
      const { data, error } = await supabase
        .from('insurance_applications')
        .insert({
          user_id: user.id,
          quote_id: request.quoteId,
          provider_id: quote.provider_id,
          application_type: quote.quote_type,
          coverage_amount: quote.coverage_amount,
          requested_premium: quote.premium,
          currency: quote.currency,
          term_days: quote.term_days,
          application_data: request.additionalData || {},
          status: 'pending',
          partner_application_id: appResponse.partnerApplicationId
        })
        .select()
        .single();

      if (error) throw error;

      // Update quote status
      await supabase
        .from('insurance_quotes')
        .update({ status: 'accepted' })
        .eq('id', request.quoteId);

      // Log activity
      unifiedApi.user.logActivity('insurance_applied', 'insurance_application', data.id);

      // Return data with redirect URL if available
      return {
        ...data,
        redirectUrl: appResponse.redirectUrl
      };
    },

    // Insurance Policies (enhanced to use new table)
    async getPoliciesEnhanced(filters?: {
      active?: boolean;
      limit?: number;
    }) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      let query = supabase
        .from('insurance_policies')
        .select('*, insurance_providers(*), insurance_applications(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (filters?.active !== undefined) {
        if (filters.active) {
          query = query.eq('status', 'active');
        } else {
          query = query.neq('status', 'active');
        }
      }
      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },

    // Insurance Claims
    async getClaims(filters?: {
      status?: string;
      limit?: number;
    }) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      let query = supabase
        .from('insurance_claims')
        .select('*, insurance_policies(*), insurance_providers(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },

    async submitClaim(request: {
      policyId: string;
      claimType: 'cargo_loss' | 'cargo_damage' | 'liability' | 'property_damage' | 'other';
      claimAmount: number;
      description: string;
      incidentDate: string;
      incidentLocation?: string;
      supportingDocuments?: string[];
    }) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get policy
      const { data: policy, error: policyError } = await supabase
        .from('insurance_policies')
        .select('*, insurance_providers(*)')
        .eq('id', request.policyId)
        .eq('user_id', user.id)
        .single();

      if (policyError || !policy) {
        throw new Error('Policy not found');
      }

      if (policy.status !== 'active') {
        throw new Error('Policy is not active');
      }

      // Save claim to database
      const { data, error } = await supabase
        .from('insurance_claims')
        .insert({
          user_id: user.id,
          policy_id: request.policyId,
          provider_id: policy.provider_id,
          claim_type: request.claimType,
          claim_amount: request.claimAmount,
          currency: policy.currency,
          description: request.description,
          incident_date: request.incidentDate,
          incident_location: request.incidentLocation,
          supporting_documents: request.supportingDocuments || [],
          status: 'submitted'
        })
        .select()
        .single();

      if (error) throw error;

      // Log activity
      unifiedApi.user.logActivity('insurance_claim_submitted', 'insurance_claim', data.id);

      return data;
    },

    // Insurance Providers (public)
    async getProviders(filters?: {
      coverageType?: string;
      country?: string;
      active?: boolean;
    }) {
      let query = supabase
        .from('insurance_providers')
        .select('*')
        .order('rating', { ascending: false });

      if (filters?.active !== undefined) {
        query = query.eq('active', filters.active);
      } else {
        query = query.eq('active', true); // Default to active only
      }

      if (filters?.coverageType) {
        query = query.contains('coverage_types', [filters.coverageType]);
      }

      if (filters?.country) {
        query = query.contains('countries', [filters.country]);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },

    // Admin methods for insurance applications
    async getApplicationsAdmin(filters?: { status?: string; limit?: number }) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Check admin role
      const profile = await unifiedApi.user.getProfile(user.id);
      if (profile.role !== 'admin') {
        throw new Error('Admin access required');
      }

      let query = supabase
        .from('insurance_applications')
        .select('*, insurance_providers(*), insurance_quotes(*), user_profiles(*)')
        .order('created_at', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;
      if (error) throw error;
      return { data: data || [] };
    },

    async updateApplicationStatus(id: string, status: string, notes?: string) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Check admin role
      const profile = await unifiedApi.user.getProfile(user.id);
      if (profile.role !== 'admin') {
        throw new Error('Admin access required');
      }

      const { data, error } = await supabase
        .from('insurance_applications')
        .update({ status, approval_notes: notes, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select('*, insurance_providers(*), insurance_quotes(*), user_profiles(*)')
        .single();

      if (error) throw error;

      // Create notification for user
      if (data.user_id) {
        try {
          const statusMessages: Record<string, { title: string; message: string }> = {
            approved: {
              title: 'Insurance Application Approved',
              message: `Your insurance application for ${data.insurance_providers?.name || 'insurance'} has been approved!${notes ? ` ${notes}` : ''}`
            },
            rejected: {
              title: 'Insurance Application Rejected',
              message: `Your insurance application for ${data.insurance_providers?.name || 'insurance'} was rejected.${notes ? ` Reason: ${notes}` : ''}`
            },
            under_review: {
              title: 'Insurance Application Under Review',
              message: `Your insurance application for ${data.insurance_providers?.name || 'insurance'} is now under review.`
            }
          };

          const statusInfo = statusMessages[status];
          if (statusInfo) {
            await unifiedApi.notifications.create({
              user_id: data.user_id,
              type: status === 'approved' ? 'success' : status === 'rejected' ? 'error' : 'info',
              title: statusInfo.title,
              message: statusInfo.message,
              action_url: '/app/risk',
              priority: status === 'approved' ? 'high' : 'normal'
            });
          }
        } catch (notifError) {
          console.error('Failed to create notification:', notifError);
        }
      }

      // If approved, create policy (future enhancement)
      if (status === 'approved' && data) {
        // TODO: Create insurance policy from approved application
        // This would involve creating a record in insurance_policies table
      }

      return data;
    },
  },

  // ============================================
  // RISK PROFILES
  // ============================================

  riskProfile: {
    async get(): Promise<any> {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('risk_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
      
      // Return default profile if none exists
      if (!data) {
        return {
          user_id: user.id,
          risk_tolerance: 'medium',
          alert_preferences: {
            price_volatility: { enabled: true, threshold: 'medium' },
            supply_shortage: { enabled: true, threshold: 'medium' },
            logistics_delay: { enabled: true, threshold: 'medium' },
            supplier_risk: { enabled: true, threshold: 'medium' },
            market_risk: { enabled: true, threshold: 'medium' },
            compliance_issue: { enabled: true, threshold: 'medium' }
          },
          regions_of_interest: [],
          materials_of_interest: [],
          insurance_preferences: {
            min_coverage: 1000000,
            preferred_providers: [],
            auto_recommend: true
          },
          notification_settings: {
            email_alerts: true,
            push_alerts: true,
            high_priority_only: false
          }
        };
      }

      return data;
    },

    async createOrUpdate(profile: {
      risk_tolerance?: 'low' | 'medium' | 'high';
      alert_preferences?: any;
      regions_of_interest?: string[];
      materials_of_interest?: string[];
      insurance_preferences?: any;
      notification_settings?: any;
    }): Promise<any> {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Check if profile exists
      const { data: existing } = await supabase
        .from('risk_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (existing) {
        // Update existing profile
        const { data, error } = await supabase
          .from('risk_profiles')
          .update({
            ...profile,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Create new profile
        const { data, error } = await supabase
          .from('risk_profiles')
          .insert({
            user_id: user.id,
            risk_tolerance: profile.risk_tolerance || 'medium',
            alert_preferences: profile.alert_preferences || {
              price_volatility: { enabled: true, threshold: 'medium' },
              supply_shortage: { enabled: true, threshold: 'medium' },
              logistics_delay: { enabled: true, threshold: 'medium' },
              supplier_risk: { enabled: true, threshold: 'medium' },
              market_risk: { enabled: true, threshold: 'medium' },
              compliance_issue: { enabled: true, threshold: 'medium' }
            },
            regions_of_interest: profile.regions_of_interest || [],
            materials_of_interest: profile.materials_of_interest || [],
            insurance_preferences: profile.insurance_preferences || {
              min_coverage: 1000000,
              preferred_providers: [],
              auto_recommend: true
            },
            notification_settings: profile.notification_settings || {
              email_alerts: true,
              push_alerts: true,
              high_priority_only: false
            }
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },

    // Admin methods for risk alerts
    async getAllAlerts(filters?: { severity?: string; resolved?: boolean; limit?: number }) {
      let query = supabase
        .from('risk_alerts')
        .select('*, user_profiles(*)')
        .order('created_at', { ascending: false });

      if (filters?.severity) {
        query = query.eq('severity', filters.severity);
      }
      if (filters?.resolved !== undefined) {
        query = query.eq('resolved', filters.resolved);
      }
      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;
      if (error) throw error;
      return { data: data || [] };
    },

    async createAlert(alert: {
      alert_type: string;
      severity: string;
      title: string;
      description?: string;
      affected_resource_type?: string;
      affected_resource_id?: string;
      region?: string;
      country?: string;
      metadata?: any;
    }) {
      const { data, error } = await supabase
        .from('risk_alerts')
        .insert(alert)
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    async updateAlert(id: string, updates: any) {
      const { data, error } = await supabase
        .from('risk_alerts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    async deleteAlert(id: string) {
      const { error } = await supabase
        .from('risk_alerts')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },

    async resolveAlert(id: string, resolvedBy?: string) {
      const { data, error } = await supabase
        .from('risk_alerts')
        .update({
          resolved: true,
          resolved_at: new Date().toISOString(),
          resolved_by: resolvedBy || null
        })
        .eq('id', id)
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

    // Admin CRUD methods
    async getAll(filters?: { limit?: number }) {
      let query = supabase
        .from('demand_data')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;
      if (error) throw error;
      return { data: data || [] };
    },

    async create(demand: {
      region: string;
      country: string;
      material: string;
      industry: string;
      demand_quantity?: number;
      demand_period?: string;
      source?: string;
      metadata?: any;
    }) {
      const { data, error } = await supabase
        .from('demand_data')
        .insert(demand)
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    async update(id: string, updates: any) {
      const { data, error } = await supabase
        .from('demand_data')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    async delete(id: string) {
      const { error } = await supabase
        .from('demand_data')
        .delete()
        .eq('id', id);

      if (error) throw error;
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

      // Check if user is admin
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      const isAdmin = profile?.role === 'admin';

      let query = supabase
        .from('documents')
        .delete()
        .eq('id', id);

      // Only restrict by user_id if not admin
      if (!isAdmin) {
        query = query.eq('user_id', user.id);
      }

      const { error } = await query;
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

    // Admin methods
    async getAll(filters?: { limit?: number }) {
      let query = supabase
        .from('documents')
        .select('*, user_profiles(id, name, email)')
        .order('created_at', { ascending: false });

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;
      if (error) throw error;
      return { data: data || [] };
    },

    async getByUser(userId: string, filters?: { limit?: number }) {
      let query = supabase
        .from('documents')
        .select('*, user_profiles(id, name, email)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;
      if (error) throw error;
      return { data: data || [] };
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

    // Admin CRUD methods
    async getAll(filters?: { limit?: number }) {
      let query = supabase
        .from('agents')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;
      if (error) throw error;
      return { data: data || [] };
    },

    async create(agent: {
      name: string;
      service_type: string;
      country: string;
      regions?: string[];
      description?: string;
      verified?: boolean;
      rating?: number;
      phone?: string;
      email?: string;
      website?: string;
    }) {
      const { data, error } = await supabase
        .from('agents')
        .insert(agent)
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    async update(id: string, updates: Partial<{
      name: string;
      service_type: string;
      country: string;
      regions: string[];
      description: string;
      verified: boolean;
      rating: number;
      phone: string;
      email: string;
      website: string;
    }>) {
      const { data, error } = await supabase
        .from('agents')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    async delete(id: string) {
      const { error } = await supabase
        .from('agents')
        .delete()
        .eq('id', id);

      if (error) throw error;
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

      // Get offer to find provider
      const { data: offer, error: offerError } = await supabase
        .from('financing_offers')
        .select('*')
        .eq('id', offerId)
        .single();

      if (offerError || !offer) {
        throw new Error('Financing offer not found');
      }

      // Get user profile
      const profile = await unifiedApi.user.getProfile(user.id);

      // Try to forward to partner if provider has partner integration
      let partnerApplicationId: string | undefined;
      let redirectUrl: string | undefined;
      
      try {
        // Import financing partner service
        const { financingPartnerService } = await import('./financingPartners');
        
        // Check if offer has partner_id or provider_name matches a partner
        // For now, we'll check if provider_type suggests partner integration
        if (offer.provider_type === 'fintech' || offer.provider_type === 'bank') {
          // Try to forward to partner (this will fail gracefully if no partner configured)
          const partnerResponse = await financingPartnerService.forwardApplication(
            offer.provider_name, // Use provider name as partner identifier
            {
              offerId,
              amount: application.amount,
              termDays: application.term_days,
              purpose: application.purpose,
              userData: {
                name: profile.name,
                email: profile.email,
                company: profile.company || '',
                country: profile.country,
                industry: profile.industry || 'construction'
              }
            }
          );

          if (partnerResponse.success) {
            partnerApplicationId = partnerResponse.partnerApplicationId;
            redirectUrl = partnerResponse.redirectUrl;
          }
        }
      } catch (err) {
        // Partner integration failed, continue with internal application
        console.warn('Partner integration failed, using internal application:', err);
      }

      // Save application to database
      const { data, error } = await supabase
        .from('financing_applications')
        .insert({
          ...application,
          user_id: user.id,
          offer_id: offerId,
          partner_application_id: partnerApplicationId,
          metadata: redirectUrl ? { redirectUrl } : {}
        })
        .select()
        .single();

      if (error) throw error;

      // Log activity
      unifiedApi.user.logActivity('financing_applied', 'financing_application', data.id);

      // Return data with redirect URL if available
      return {
        ...data,
        redirectUrl
      };
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

    // Admin CRUD methods
    async getAll(filters?: { limit?: number }) {
      let query = supabase
        .from('financing_offers')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;
      if (error) throw error;
      return { data: data || [] };
    },

    async create(offer: {
      provider_name: string;
      provider_type: 'bank' | 'fintech' | 'platform';
      industry?: string[];
      countries?: string[];
      min_amount?: number;
      max_amount?: number;
      interest_rate?: number;
      term_days?: number;
      requirements?: any;
      features?: any;
      active?: boolean;
      metadata?: any;
    }) {
      const { data, error } = await supabase
        .from('financing_offers')
        .insert(offer)
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    async update(id: string, updates: any) {
      const { data, error } = await supabase
        .from('financing_offers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    async delete(id: string) {
      const { error } = await supabase
        .from('financing_offers')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },

    async getApplicationsAdmin(filters?: { status?: string; limit?: number }) {
      let query = supabase
        .from('financing_applications')
        .select('*, financing_offers(*), user_profiles(*)')
        .order('created_at', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;
      if (error) throw error;
      return { data: data || [] };
    },

    async updateApplicationStatus(id: string, status: string, notes?: string) {
      const { data, error } = await supabase
        .from('financing_applications')
        .update({ status, approval_notes: notes, reviewed_at: new Date().toISOString() })
        .eq('id', id)
        .select('*, financing_offers(*), user_profiles(*)')
        .single();

      if (error) throw error;

      // Create notification for user
      if (data.user_id) {
        try {
          const statusMessages: Record<string, { title: string; message: string }> = {
            approved: {
              title: 'Financing Application Approved',
              message: `Your financing application for ${data.financing_offers?.provider_name || 'financing'} has been approved!${data.approved_amount ? ` Approved amount: ${data.approved_amount}` : ''}`
            },
            rejected: {
              title: 'Financing Application Rejected',
              message: `Your financing application for ${data.financing_offers?.provider_name || 'financing'} was rejected.${notes ? ` Reason: ${notes}` : ''}`
            },
            under_review: {
              title: 'Financing Application Under Review',
              message: `Your financing application for ${data.financing_offers?.provider_name || 'financing'} is now under review.`
            }
          };

          const statusInfo = statusMessages[status];
          if (statusInfo) {
            await supabase
              .from('notifications')
              .insert({
                user_id: data.user_id,
                type: status === 'approved' ? 'success' : status === 'rejected' ? 'error' : 'info',
                title: statusInfo.title,
                message: statusInfo.message,
                action_url: '/app/financing',
                priority: status === 'approved' ? 'high' : 'medium',
                metadata: {
                  application_id: id,
                  status: status,
                  offer_id: data.offer_id
                }
              });
          }
        } catch (notifError) {
          // Don't fail the status update if notification fails
          console.error('Error creating notification:', notifError);
        }
      }

      return data;
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
      location?: string;
      condition: 'above' | 'below' | 'change';
      threshold?: number;
      change_percent?: number;
      notification_preferences?: {
        email?: boolean;
        in_app?: boolean;
        sms?: boolean;
      };
    }) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('price_alerts')
        .insert({
          material: alert.material,
          country: alert.country,
          location: alert.location || null,
          condition: alert.condition,
          threshold: alert.threshold || null,
          change_percent: alert.change_percent || null,
          user_id: user.id,
          active: true,
          notification_preferences: alert.notification_preferences || {
            email: true,
            in_app: true,
            sms: false
          },
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
      location?: string;
      notification_preferences?: {
        email?: boolean;
        in_app?: boolean;
        sms?: boolean;
      };
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

    async getHistory(alertId: string) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get notifications for this alert
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .eq('type', 'price_alert')
        .eq('metadata->>alert_id', alertId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data || [];
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

  // ============================================
  // UNIFIED SEARCH
  // ============================================

  search: {
    async unified(query: string, types?: ('supplier' | 'price' | 'opportunity' | 'document')[]) {
      if (!query || query.length < 2) return [];

      const searchTypes = types || ['supplier', 'price', 'opportunity', 'document'];
      const results: any[] = [];

      // Search suppliers
      if (searchTypes.includes('supplier')) {
        const { data } = await supabase
          .from('suppliers')
          .select('id, name, country, industry, materials, rating, verified')
          .or(`name.ilike.%${query}%,materials.cs.{${query}}`)
          .limit(10);
        
        if (data) {
          results.push(...data.map(s => ({
            id: s.id,
            type: 'supplier',
            title: s.name,
            subtitle: `${s.country} - ${s.industry}`,
            description: `Rating: ${s.rating || 'N/A'}`,
            url: `/app/supplier-directory/${s.id}`,
            score: (s.rating || 0) / 5,
            metadata: { verified: s.verified, country: s.country }
          })));
        }
      }

      // Search prices
      if (searchTypes.includes('price')) {
        const { data } = await supabase
          .from('prices')
          .select('id, material, location, country, price, currency, unit, change_percent')
          .or(`material.ilike.%${query}%,location.ilike.%${query}%`)
          .order('created_at', { ascending: false })
          .limit(10);
        
        if (data) {
          results.push(...data.map(p => ({
            id: p.id,
            type: 'price',
            title: `${p.material} Price`,
            subtitle: `${p.location}, ${p.country} - ${p.price} ${p.currency}/${p.unit}`,
            description: `Change: ${p.change_percent || 0}%`,
            url: `/app/prices`,
            score: 0.8,
            metadata: { material: p.material, location: p.location }
          })));
        }
      }

      // Search opportunities
      if (searchTypes.includes('opportunity')) {
        const { data } = await supabase
          .from('trade_opportunities')
          .select('id, title, description, material, country, status')
          .or(`title.ilike.%${query}%,description.ilike.%${query}%,material.ilike.%${query}%`)
          .eq('status', 'active')
          .limit(10);
        
        if (data) {
          results.push(...data.map(o => ({
            id: o.id,
            type: 'opportunity',
            title: o.title,
            subtitle: `${o.material} - ${o.country}`,
            description: o.description,
            url: `/app/opportunities/${o.id}`,
            score: 0.7,
            metadata: { status: o.status }
          })));
        }
      }

      // Search documents (if user is authenticated)
      if (searchTypes.includes('document')) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data } = await supabase
            .from('documents')
            .select('id, name, category, description, created_at')
            .eq('user_id', user.id)
            .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
            .limit(10);
          
          if (data) {
            results.push(...data.map(d => ({
              id: d.id,
              type: 'document',
              title: d.name,
              subtitle: d.category,
              description: d.description,
              url: `/app/documents/${d.id}`,
              score: 0.6,
              metadata: { category: d.category }
            })));
          }
        }
      }

      // Sort by score and return
      return results.sort((a, b) => b.score - a.score);
    }
  },

  // ============================================
  // ADMIN (User Management & System Admin)
  // ============================================

  admin: {
    async getUsers(filters?: {
      role?: string;
      status?: string;
      search?: string;
      limit?: number;
    }) {
      let query = supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.role) {
        query = query.eq('role', filters.role);
      }
      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,company.ilike.%${filters.search}%`);
      }
      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;
      if (error) throw error;
      return { data: data || [] };
    },

    async getUserById(id: string) {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },

    async updateUser(id: string, updates: {
      name?: string;
      company?: string;
      industry?: string;
      role?: string;
      is_active?: boolean;
    }) {
      const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    async updateUserRole(id: string, role: string) {
      const { data, error } = await supabase
        .from('user_profiles')
        .update({ role })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    async getUserCount() {
      const { count, error } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true });

      if (error) throw error;
      return count || 0;
    },

    async getUserActivity(userId: string, filters?: { limit?: number }) {
      let query = supabase
        .from('user_activities')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;
      if (error) throw error;
      return { data: data || [] };
    },

    // Count methods for admin dashboard
    async getPriceCount() {
      const { count, error } = await supabase
        .from('prices')
        .select('*', { count: 'exact', head: true });
      if (error) throw error;
      return count || 0;
    },

    async getSupplierCount() {
      const { count, error } = await supabase
        .from('suppliers')
        .select('*', { count: 'exact', head: true });
      if (error) throw error;
      return count || 0;
    },

    async getAgentCount() {
      const { count, error } = await supabase
        .from('agents')
        .select('*', { count: 'exact', head: true });
      if (error) throw error;
      return count || 0;
    },

    async getDocumentCount() {
      const { count, error } = await supabase
        .from('documents')
        .select('*', { count: 'exact', head: true });
      if (error) throw error;
      return count || 0;
    },

    async getLogisticsRouteCount() {
      const { count, error } = await supabase
        .from('logistics_routes')
        .select('*', { count: 'exact', head: true });
      if (error) throw error;
      return count || 0;
    },

    async getFinancingOfferCount() {
      const { count, error } = await supabase
        .from('financing_offers')
        .select('*', { count: 'exact', head: true });
      if (error) throw error;
      return count || 0;
    },

    async getRiskAlertCount() {
      const { count, error } = await supabase
        .from('risk_alerts')
        .select('*', { count: 'exact', head: true });
      if (error) throw error;
      return count || 0;
    },

    async getDemandDataCount() {
      const { count, error } = await supabase
        .from('demand_data')
        .select('*', { count: 'exact', head: true });
      if (error) throw error;
      return count || 0;
    },

    async getNotificationCount() {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true });
      if (error) throw error;
      return count || 0;
    },
  },
};

export default unifiedApi;


