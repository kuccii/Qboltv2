/**
 * Analytics Utility
 * Centralized analytics tracking with support for multiple providers
 */

type AnalyticsEvent = {
  event: string;
  properties?: Record<string, any>;
  timestamp?: string;
};

type UserProperties = {
  userId: string;
  email?: string;
  name?: string;
  company?: string;
  industry?: string;
  country?: string;
  [key: string]: any;
};

class Analytics {
  private isEnabled = import.meta.env.VITE_ENABLE_ANALYTICS === 'true';
  private isDevelopment = import.meta.env.DEV;
  private queue: AnalyticsEvent[] = [];

  constructor() {
    if (this.isDevelopment) {
      console.log('[Analytics] Initialized in development mode');
    }
  }

  /**
   * Track custom event
   */
  track(event: string, properties?: Record<string, any>) {
    if (!this.isEnabled) return;

    const analyticsEvent: AnalyticsEvent = {
      event,
      properties,
      timestamp: new Date().toISOString()
    };

    // Log in development
    if (this.isDevelopment) {
      console.log(`[Analytics] Track:`, analyticsEvent);
    }

    // Add to queue
    this.queue.push(analyticsEvent);

    // Send to analytics providers
    this.sendToProviders(analyticsEvent);
  }

  /**
   * Track page view
   */
  page(pageName: string, properties?: Record<string, any>) {
    this.track('Page View', {
      page: pageName,
      url: window.location.href,
      ...properties
    });
  }

  /**
   * Identify user
   */
  identify(properties: UserProperties) {
    if (!this.isEnabled) return;

    if (this.isDevelopment) {
      console.log('[Analytics] Identify:', properties);
    }

    // Send to analytics providers
    if (window.analytics) {
      window.analytics.identify(properties.userId, properties);
    }

    // Mixpanel
    if (window.mixpanel) {
      window.mixpanel.identify(properties.userId);
      window.mixpanel.people.set(properties);
    }

    // Google Analytics 4
    if (window.gtag) {
      window.gtag('set', 'user_properties', properties);
    }
  }

  /**
   * Track user action
   */
  action(action: string, properties?: Record<string, any>) {
    this.track(`Action: ${action}`, properties);
  }

  /**
   * Track feature usage
   */
  feature(featureName: string, properties?: Record<string, any>) {
    this.track(`Feature Used: ${featureName}`, properties);
  }

  /**
   * Track conversion
   */
  conversion(conversionType: string, value?: number, properties?: Record<string, any>) {
    this.track(`Conversion: ${conversionType}`, {
      value,
      ...properties
    });
  }

  /**
   * Track error
   */
  error(errorMessage: string, properties?: Record<string, any>) {
    this.track('Error Occurred', {
      error: errorMessage,
      ...properties
    });
  }

  /**
   * Business-specific tracking methods
   */

  // User authentication
  login(method: string, userId: string) {
    this.track('User Logged In', { method, userId });
  }

  logout() {
    this.track('User Logged Out');
  }

  signup(method: string, userId: string) {
    this.track('User Signed Up', { method, userId });
  }

  // Price tracking
  priceViewed(material: string, country: string) {
    this.track('Price Viewed', { material, country });
  }

  priceAlertCreated(material: string, threshold: number) {
    this.track('Price Alert Created', { material, threshold });
  }

  // Supplier interactions
  supplierViewed(supplierId: string, supplierName: string) {
    this.track('Supplier Viewed', { supplierId, supplierName });
  }

  supplierContacted(supplierId: string, method: string) {
    this.track('Supplier Contacted', { supplierId, method });
  }

  // Search
  searchPerformed(query: string, results: number) {
    this.track('Search Performed', { query, results });
  }

  // Data export
  dataExported(type: string, format: string) {
    this.track('Data Exported', { type, format });
  }

  // Admin actions
  adminAction(action: string, entity: string, entityId?: string) {
    this.track(`Admin: ${action}`, { entity, entityId });
  }

  /**
   * Send to analytics providers
   */
  private sendToProviders(event: AnalyticsEvent) {
    // Segment
    if (window.analytics) {
      window.analytics.track(event.event, event.properties);
    }

    // Mixpanel
    if (window.mixpanel) {
      window.mixpanel.track(event.event, event.properties);
    }

    // Google Analytics 4
    if (window.gtag) {
      window.gtag('event', event.event, event.properties);
    }

    // Amplitude
    if (window.amplitude) {
      window.amplitude.getInstance().logEvent(event.event, event.properties);
    }

    // Custom analytics endpoint (optional)
    if (import.meta.env.VITE_ANALYTICS_ENDPOINT) {
      this.sendToCustomEndpoint(event);
    }
  }

  /**
   * Send to custom analytics endpoint
   */
  private async sendToCustomEndpoint(event: AnalyticsEvent) {
    try {
      await fetch(import.meta.env.VITE_ANALYTICS_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      });
    } catch (error) {
      if (this.isDevelopment) {
        console.error('[Analytics] Failed to send to custom endpoint:', error);
      }
    }
  }

  /**
   * Get event queue (for debugging)
   */
  getQueue(): AnalyticsEvent[] {
    return [...this.queue];
  }

  /**
   * Clear event queue
   */
  clearQueue() {
    this.queue = [];
  }
}

// Create singleton instance
export const analytics = new Analytics();

// Add to window for debugging
if (import.meta.env.DEV) {
  (window as any).analytics_debug = analytics;
}

// Type declarations for external analytics libraries
declare global {
  interface Window {
    analytics?: any;
    mixpanel?: any;
    gtag?: any;
    amplitude?: any;
    Sentry?: any;
  }
}

export default analytics;


