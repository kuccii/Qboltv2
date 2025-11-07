/**
 * Supabase Realtime Service
 * Handles real-time subscriptions for prices, suppliers, and shipments
 */

import { supabase } from '../lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface PriceUpdate {
  id: string;
  material: string;
  location: string;
  country: string;
  price: number;
  currency: string;
  unit: string;
  change_percent?: number;
  updated_at: string;
}

export interface SupplierUpdate {
  id: string;
  name: string;
  country: string;
  industry: string;
  materials: string[];
  rating?: number;
  verified: boolean;
  updated_at: string;
}

export interface ShipmentUpdate {
  id: string;
  tracking_number: string;
  status: string;
  current_location?: any;
  updated_at: string;
}

export class SupabaseRealtimeService {
  private channels: Map<string, RealtimeChannel> = new Map();

  /**
   * Subscribe to price updates
   */
  subscribeToPrices(
    filters: { material?: string; country?: string } = {},
    callback: (update: PriceUpdate) => void
  ): () => void {
    const channelName = `prices:${JSON.stringify(filters)}`;

    // Remove existing channel if any
    if (this.channels.has(channelName)) {
      this.unsubscribe(channelName);
    }

    let channel = supabase.channel(channelName);

    // Build filter string for Supabase
    let filterString = '';
    if (filters.material) {
      filterString = `material=eq.${filters.material}`;
    }
    if (filters.country) {
      if (filterString) filterString += `,`;
      filterString += `country=eq.${filters.country}`;
    }

    channel = channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'prices',
        filter: filterString || undefined,
      },
      (payload) => {
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          callback(payload.new as PriceUpdate);
        }
      }
    );

    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        if (import.meta.env.DEV) {
          console.log(`Subscribed to prices: ${channelName}`);
        }
      } else if (status === 'CHANNEL_ERROR') {
        console.error(`Error subscribing to prices: ${channelName}`);
      }
    });

    this.channels.set(channelName, channel);

    // Return unsubscribe function
    return () => {
      try {
        this.unsubscribe(channelName);
      } catch (err: any) {
        // Ignore errors during cleanup - especially WebSocket closure errors
        const errorMsg = err?.message || err?.toString() || '';
        if (
          !errorMsg.includes('WebSocket is closed') &&
          !errorMsg.includes('connection is closed') &&
          !errorMsg.includes('not found') &&
          !errorMsg.includes('not subscribed')
        ) {
          // Only log unexpected errors
          if (import.meta.env.DEV) {
            console.warn(`Error unsubscribing from ${channelName}:`, err);
          }
        }
      }
    };
  }

  /**
   * Subscribe to supplier updates
   */
  subscribeToSuppliers(
    filters: { country?: string; industry?: string } = {},
    callback: (update: SupplierUpdate) => void
  ): () => void {
    const channelName = `suppliers:${JSON.stringify(filters)}`;

    if (this.channels.has(channelName)) {
      this.unsubscribe(channelName);
    }

    let channel = supabase.channel(channelName);

    let filterString = '';
    if (filters.country) {
      filterString = `country=eq.${filters.country}`;
    }
    if (filters.industry) {
      if (filterString) filterString += `,`;
      filterString += `industry=eq.${filters.industry}`;
    }

    channel = channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'suppliers',
        filter: filterString || undefined,
      },
      (payload) => {
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          callback(payload.new as SupplierUpdate);
        }
      }
    );

    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        if (import.meta.env.DEV) {
          console.log(`Subscribed to suppliers: ${channelName}`);
        }
      }
    });

    this.channels.set(channelName, channel);

    return () => {
      try {
        this.unsubscribe(channelName);
      } catch (err: any) {
        // Ignore errors during cleanup - especially WebSocket closure errors
        const errorMsg = err?.message || err?.toString() || '';
        if (
          !errorMsg.includes('WebSocket is closed') &&
          !errorMsg.includes('connection is closed') &&
          !errorMsg.includes('not found') &&
          !errorMsg.includes('not subscribed') &&
          !errorMsg.includes('closed before') &&
          !errorMsg.includes('WebSocket connection')
        ) {
          // Only log unexpected errors in dev mode
          if (import.meta.env.DEV) {
            console.warn(`Error unsubscribing from ${channelName}:`, err);
          }
        }
      }
    };
  }

  /**
   * Subscribe to notifications
   */
  subscribeToNotifications(
    callback: (notification: any) => void
  ): () => void {
    const channelName = 'notifications';

    if (this.channels.has(channelName)) {
      this.unsubscribe(channelName);
    }

    let channel = supabase.channel(channelName);

    channel = channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'notifications',
      },
      (payload) => {
        if (payload.eventType === 'INSERT') {
          callback(payload.new);
        }
      }
    );

    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        if (import.meta.env.DEV) {
          console.log(`Subscribed to notifications: ${channelName}`);
        }
      }
    });

    this.channels.set(channelName, channel);

    return () => {
      try {
        this.unsubscribe(channelName);
      } catch (err: any) {
        // Ignore errors during cleanup - especially WebSocket closure errors
        const errorMsg = err?.message || err?.toString() || '';
        if (
          !errorMsg.includes('WebSocket is closed') &&
          !errorMsg.includes('connection is closed') &&
          !errorMsg.includes('not found') &&
          !errorMsg.includes('not subscribed') &&
          !errorMsg.includes('closed before') &&
          !errorMsg.includes('WebSocket connection')
        ) {
          // Only log unexpected errors in dev mode
          if (import.meta.env.DEV) {
            console.warn(`Error unsubscribing from ${channelName}:`, err);
          }
        }
      }
    };
  }

  /**
   * Subscribe to risk alerts
   */
  subscribeToRiskAlerts(
    callback: (alert: any) => void
  ): () => void {
    const channelName = 'risk_alerts';

    if (this.channels.has(channelName)) {
      this.unsubscribe(channelName);
    }

    let channel = supabase.channel(channelName);

    channel = channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'risk_alerts',
      },
      (payload) => {
        if (payload.eventType === 'INSERT') {
          callback(payload.new);
        }
      }
    );

    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        if (import.meta.env.DEV) {
          console.log(`Subscribed to risk alerts: ${channelName}`);
        }
      }
    });

    this.channels.set(channelName, channel);

    return () => {
      try {
        this.unsubscribe(channelName);
      } catch (err: any) {
        // Ignore errors during cleanup - especially WebSocket closure errors
        const errorMsg = err?.message || err?.toString() || '';
        if (
          !errorMsg.includes('WebSocket is closed') &&
          !errorMsg.includes('connection is closed') &&
          !errorMsg.includes('not found') &&
          !errorMsg.includes('not subscribed') &&
          !errorMsg.includes('closed before') &&
          !errorMsg.includes('WebSocket connection')
        ) {
          // Only log unexpected errors in dev mode
          if (import.meta.env.DEV) {
            console.warn(`Error unsubscribing from ${channelName}:`, err);
          }
        }
      }
    };
  }

  /**
   * Subscribe to trade opportunities
   */
  subscribeToTradeOpportunities(
    filters?: { opportunity_type?: string; material?: string; country?: string },
    callback?: (update: any) => void
  ): () => void {
    const channelName = `trade_opportunities:${JSON.stringify(filters)}`;

    if (this.channels.has(channelName)) {
      this.unsubscribe(channelName);
    }

    let channel = supabase.channel(channelName);

    let filterString = '';
    if (filters?.opportunity_type) {
      filterString = `opportunity_type=eq.${filters.opportunity_type}`;
    }
    if (filters?.country) {
      if (filterString) filterString += `,`;
      filterString += `country=eq.${filters.country}`;
    }

    channel = channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'trade_opportunities',
        filter: filterString || undefined,
      },
      (payload) => {
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          callback?.(payload.new);
        }
      }
    );

    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        if (import.meta.env.DEV) {
          console.log(`Subscribed to trade opportunities: ${channelName}`);
        }
      }
    });

    this.channels.set(channelName, channel);

    return () => {
      try {
        this.unsubscribe(channelName);
      } catch (err: any) {
        // Ignore errors during cleanup - especially WebSocket closure errors
        const errorMsg = err?.message || err?.toString() || '';
        if (
          !errorMsg.includes('WebSocket is closed') &&
          !errorMsg.includes('connection is closed') &&
          !errorMsg.includes('not found') &&
          !errorMsg.includes('not subscribed') &&
          !errorMsg.includes('closed before') &&
          !errorMsg.includes('WebSocket connection')
        ) {
          // Only log unexpected errors in dev mode
          if (import.meta.env.DEV) {
            console.warn(`Error unsubscribing from ${channelName}:`, err);
          }
        }
      }
    };
  }

  /**
   * Subscribe to shipment tracking updates
   */
  subscribeToShipments(
    trackingNumber?: string,
    callback?: (update: ShipmentUpdate) => void
  ): () => void {
    const channelName = trackingNumber
      ? `shipment:${trackingNumber}`
      : 'shipments:all';

    if (this.channels.has(channelName)) {
      this.unsubscribe(channelName);
    }

    let channel = supabase.channel(channelName);

    channel = channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'shipments',
        filter: trackingNumber ? `tracking_number=eq.${trackingNumber}` : undefined,
      },
      (payload) => {
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          callback?.(payload.new as ShipmentUpdate);
        }
      }
    );

    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        if (import.meta.env.DEV) {
          console.log(`Subscribed to shipments: ${channelName}`);
        }
      }
    });

    this.channels.set(channelName, channel);

    return () => {
      try {
        this.unsubscribe(channelName);
      } catch (err: any) {
        // Ignore errors during cleanup - especially WebSocket closure errors
        const errorMsg = err?.message || err?.toString() || '';
        if (
          !errorMsg.includes('WebSocket is closed') &&
          !errorMsg.includes('connection is closed') &&
          !errorMsg.includes('not found') &&
          !errorMsg.includes('not subscribed') &&
          !errorMsg.includes('closed before') &&
          !errorMsg.includes('WebSocket connection')
        ) {
          // Only log unexpected errors in dev mode
          if (import.meta.env.DEV) {
            console.warn(`Error unsubscribing from ${channelName}:`, err);
          }
        }
      }
    };
  }

  /**
   * Unsubscribe from a specific channel
   */
  unsubscribe(channelName: string): void {
    const channel = this.channels.get(channelName);
    if (channel) {
      try {
        // Check channel state before attempting to unsubscribe
        const channelState = channel.state;
        
        // Only unsubscribe if channel is in a valid state
        if (channelState === 'joined' || channelState === 'subscribed') {
          try {
            channel.unsubscribe();
          } catch (unsubErr: any) {
            // Ignore unsubscribe errors - channel might already be closed
            const unsubMsg = unsubErr?.message || '';
            if (!unsubMsg.includes('WebSocket') && !unsubMsg.includes('closed')) {
              if (import.meta.env.DEV) {
                console.warn(`Error unsubscribing channel ${channelName}:`, unsubErr);
              }
            }
          }
        }
        
        // Remove channel with error handling
        try {
          supabase.removeChannel(channel).catch((err: any) => {
            // Silently ignore WebSocket closure errors
            const errorMsg = err?.message || err?.toString() || '';
            if (
              !errorMsg.includes('not found') && 
              !errorMsg.includes('not subscribed') &&
              !errorMsg.includes('WebSocket is closed') &&
              !errorMsg.includes('connection is closed') &&
              !errorMsg.includes('closed before') &&
              !errorMsg.includes('WebSocket connection')
            ) {
              // Only log unexpected errors in dev mode
              if (import.meta.env.DEV) {
                console.warn(`Error removing channel ${channelName}:`, err);
              }
            }
          });
        } catch (removeErr: any) {
          // Ignore errors when removing channel
          const removeMsg = removeErr?.message || '';
          if (!removeMsg.includes('WebSocket') && !removeMsg.includes('closed')) {
            if (import.meta.env.DEV) {
              console.warn(`Error during channel removal for ${channelName}:`, removeErr);
            }
          }
        }
      } catch (err: any) {
        // Ignore errors during cleanup
        const errorMsg = err?.message || err?.toString() || '';
        if (
          !errorMsg.includes('WebSocket is closed') &&
          !errorMsg.includes('connection is closed') &&
          !errorMsg.includes('closed before') &&
          !errorMsg.includes('WebSocket connection')
        ) {
          // Only log unexpected errors in dev mode
          if (import.meta.env.DEV) {
            console.warn(`Error during channel cleanup for ${channelName}:`, err);
          }
        }
      } finally {
        this.channels.delete(channelName);
        // Only log in development mode
        if (import.meta.env.DEV) {
          console.log(`Unsubscribed from: ${channelName}`);
        }
      }
    }
  }

  /**
   * Unsubscribe from all channels
   */
  unsubscribeAll(): void {
    this.channels.forEach((channel, channelName) => {
      try {
        // Only remove if channel is still valid
        if (channel.state === 'joined' || channel.state === 'subscribed') {
          channel.unsubscribe();
        }
        supabase.removeChannel(channel).catch((err) => {
          // Ignore errors if channel is already disconnected or WebSocket is closed
          const errorMsg = err?.message || '';
          if (
            !errorMsg.includes('not found') && 
            !errorMsg.includes('not subscribed') &&
            !errorMsg.includes('WebSocket is closed') &&
            !errorMsg.includes('connection is closed')
          ) {
            console.warn(`Error removing channel ${channelName}:`, err);
          }
        });
      } catch (err: any) {
        // Ignore errors during cleanup
        const errorMsg = err?.message || '';
        if (
          !errorMsg.includes('WebSocket is closed') &&
          !errorMsg.includes('connection is closed')
        ) {
          console.warn(`Error during channel cleanup for ${channelName}:`, err);
        }
      }
    });
    this.channels.clear();
  }

  /**
   * Get all active channels
   */
  getActiveChannels(): string[] {
    return Array.from(this.channels.keys());
  }

  /**
   * Check if a channel is subscribed
   */
  isSubscribed(channelName: string): boolean {
    const channel = this.channels.get(channelName);
    return channel ? channel.state === 'joined' : false;
  }
}

// Create singleton instance
export const supabaseRealtime = new SupabaseRealtimeService();

