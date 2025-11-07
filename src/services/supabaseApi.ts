/**
 * Supabase API Service
 * Provides easy-to-use functions for database operations
 */

import { supabase, typedSupabase } from '../lib/supabase';

// Types
export interface Price {
  id: string;
  material: string;
  location: string;
  country: string;
  price: number;
  currency: string;
  unit: string;
  change_percent?: number;
  source?: string;
  created_at: string;
  updated_at: string;
}

export interface Supplier {
  id: string;
  name: string;
  country: string;
  industry: string;
  materials: string[];
  rating?: number;
  verified: boolean;
  phone?: string;
  email?: string;
  website?: string;
  created_at: string;
  updated_at: string;
}

export interface Shipment {
  id: string;
  tracking_number: string;
  route_id?: string;
  status: string;
  current_location?: any;
  estimated_delivery?: string;
  actual_delivery?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Supabase API Service
 */
export const supabaseApi = {
  /**
   * PRICES
   */
  prices: {
    // Get prices with filters
    async get(filters?: {
      material?: string;
      country?: string;
      location?: string;
      limit?: number;
      orderBy?: 'price' | 'updated_at' | 'created_at';
      ascending?: boolean;
    }) {
      let query = typedSupabase
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

      if (error) {
        console.error('Error fetching prices:', error);
        throw new Error(error.message);
      }

      return data as Price[];
    },

    // Get single price by ID
    async getById(id: string) {
      const { data, error } = await typedSupabase
        .from('prices')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching price:', error);
        throw new Error(error.message);
      }

      return data as Price;
    },

    // Insert new price
    async create(price: {
      material: string;
      location: string;
      country: string;
      price: number;
      currency?: string;
      unit?: string;
      change_percent?: number;
      source?: string;
    }) {
      const { data, error } = await typedSupabase
        .from('prices')
        .insert([price])
        .select()
        .single();

      if (error) {
        console.error('Error creating price:', error);
        throw new Error(error.message);
      }

      return data as Price;
    },

    // Update price
    async update(id: string, updates: {
      price?: number;
      change_percent?: number;
    }) {
      const { data, error } = await typedSupabase
        .from('prices')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating price:', error);
        throw new Error(error.message);
      }

      return data as Price;
    },

    // Delete price
    async delete(id: string) {
      const { error } = await typedSupabase
        .from('prices')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting price:', error);
        throw new Error(error.message);
      }

      return true;
    },
  },

  /**
   * SUPPLIERS
   */
  suppliers: {
    // Get suppliers with filters
    async get(filters?: {
      country?: string;
      industry?: string;
      material?: string;
      verified?: boolean;
      limit?: number;
      orderBy?: 'rating' | 'name' | 'created_at';
      ascending?: boolean;
    }) {
      let query = typedSupabase
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

      const orderBy = filters?.orderBy || 'created_at';
      const ascending = filters?.ascending !== undefined ? filters.ascending : false;

      query = query.order(orderBy, { ascending });

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching suppliers:', error);
        throw new Error(error.message);
      }

      return data as Supplier[];
    },

    // Get single supplier by ID
    async getById(id: string) {
      const { data, error } = await typedSupabase
        .from('suppliers')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching supplier:', error);
        throw new Error(error.message);
      }

      return data as Supplier;
    },

    // Create new supplier
    async create(supplier: {
      name: string;
      country: string;
      industry: string;
      materials: string[];
      rating?: number;
      verified?: boolean;
      phone?: string;
      email?: string;
      website?: string;
    }) {
      const { data, error } = await typedSupabase
        .from('suppliers')
        .insert([supplier])
        .select()
        .single();

      if (error) {
        console.error('Error creating supplier:', error);
        throw new Error(error.message);
      }

      return data as Supplier;
    },

    // Update supplier
    async update(id: string, updates: {
      rating?: number;
      verified?: boolean;
      name?: string;
      phone?: string;
      email?: string;
    }) {
      const { data, error } = await typedSupabase
        .from('suppliers')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating supplier:', error);
        throw new Error(error.message);
      }

      return data as Supplier;
    },

    // Rate supplier
    async rate(id: string, rating: number, review?: string) {
      // This would typically involve updating a ratings table
      // For now, we'll update the supplier rating
      const supplier = await this.getById(id);
      const newRating = supplier.rating
        ? (supplier.rating + rating) / 2
        : rating;

      return this.update(id, { rating: newRating });
    },
  },

  /**
   * SHIPMENTS
   */
  shipments: {
    // Get shipments
    async get(trackingNumber?: string) {
      let query = typedSupabase.from('shipments').select('*');

      if (trackingNumber) {
        query = query.eq('tracking_number', trackingNumber);
      } else {
        query = query.order('created_at', { ascending: false }).limit(50);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching shipments:', error);
        throw new Error(error.message);
      }

      return data as Shipment[];
    },

    // Get single shipment by tracking number
    async getByTrackingNumber(trackingNumber: string) {
      const { data, error } = await typedSupabase
        .from('shipments')
        .select('*')
        .eq('tracking_number', trackingNumber)
        .single();

      if (error) {
        console.error('Error fetching shipment:', error);
        throw new Error(error.message);
      }

      return data as Shipment;
    },

    // Create new shipment
    async create(shipment: {
      tracking_number: string;
      route_id?: string;
      status?: string;
      current_location?: any;
      estimated_delivery?: string;
    }) {
      const { data, error } = await typedSupabase
        .from('shipments')
        .insert([shipment])
        .select()
        .single();

      if (error) {
        console.error('Error creating shipment:', error);
        throw new Error(error.message);
      }

      return data as Shipment;
    },

    // Update shipment status
    async updateStatus(trackingNumber: string, status: string, location?: any) {
      const updates: any = {
        status,
        updated_at: new Date().toISOString(),
      };

      if (location) {
        updates.current_location = location;
      }

      if (status === 'delivered') {
        updates.actual_delivery = new Date().toISOString();
      }

      const { data, error } = await typedSupabase
        .from('shipments')
        .update(updates)
        .eq('tracking_number', trackingNumber)
        .select()
        .single();

      if (error) {
        console.error('Error updating shipment:', error);
        throw new Error(error.message);
      }

      return data as Shipment;
    },
  },

  /**
   * AUTHENTICATION (using Supabase Auth)
   */
  auth: {
    // Sign up
    async signUp(email: string, password: string, metadata?: any) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });

      if (error) throw error;
      return data;
    },

    // Sign in
    async signIn(email: string, password: string) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return data;
    },

    // Sign out
    async signOut() {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },

    // Get current session
    async getSession() {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      return session;
    },

    // Get current user
    async getUser() {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      return user;
    },
  },
};

export default supabaseApi;




