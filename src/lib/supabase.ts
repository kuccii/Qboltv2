/**
 * Supabase Client Configuration
 * This is the main Supabase client for database, auth, and real-time features
 */

import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://idgnxbrfsnqrzpciwgpv.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlkZ254YnJmc25xcnpwY2l3Z3B2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwOTA3ODYsImV4cCI6MjA3NzY2Njc4Nn0.d4nYESFeaVTF5ToP2h6G_bCAZq0XCUsRPUgj527Bjd0';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials missing. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
}

// Singleton pattern to prevent multiple client instances
let supabaseInstance: ReturnType<typeof createClient> | null = null;

// Create Supabase client with optimized settings for session persistence
// Use singleton pattern to prevent multiple instances
const createSupabaseClient = () => {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      storageKey: 'supabase.auth.token',
      flowType: 'pkce',
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
    global: {
      headers: {
        'x-client-info': 'qivook@1.0.0',
      },
    },
  });

  return supabaseInstance;
};

export const supabase = createSupabaseClient();

// Database types (to be updated based on your schema)
export type Database = {
  public: {
    Tables: {
      prices: {
        Row: {
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
        };
        Insert: {
          material: string;
          location: string;
          country: string;
          price: number;
          currency?: string;
          unit?: string;
          change_percent?: number;
          source?: string;
        };
        Update: {
          price?: number;
          change_percent?: number;
          updated_at?: string;
        };
      };
      suppliers: {
        Row: {
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
        };
        Insert: {
          name: string;
          country: string;
          industry: string;
          materials: string[];
          rating?: number;
          verified?: boolean;
          phone?: string;
          email?: string;
          website?: string;
        };
        Update: {
          rating?: number;
          verified?: boolean;
          updated_at?: string;
        };
      };
      shipments: {
        Row: {
          id: string;
          tracking_number: string;
          route_id?: string;
          status: string;
          current_location?: any;
          estimated_delivery?: string;
          actual_delivery?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          tracking_number: string;
          route_id?: string;
          status?: string;
          current_location?: any;
          estimated_delivery?: string;
        };
        Update: {
          status?: string;
          current_location?: any;
          actual_delivery?: string;
          updated_at?: string;
        };
      };
    };
  };
};

// Typed Supabase client - reuse the same instance to avoid multiple GoTrueClient instances
export const typedSupabase = supabase as ReturnType<typeof createClient<Database>>;

// Helper function to check Supabase connection
export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    const { error } = await supabase.from('prices').select('count').limit(1);
    // If we get here, connection works (even if table doesn't exist yet)
    return true;
  } catch (err) {
    console.error('Supabase connection check failed:', err);
    return false;
  }
};

// Export convenience functions
export default supabase;

