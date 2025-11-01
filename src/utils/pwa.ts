// PWA utilities for offline support and app installation
export interface PWAInstallPrompt {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

class PWAManager {
  private installPrompt: PWAInstallPrompt | null = null;
  private isInstalled = false;
  private isOnline = navigator.onLine;

  constructor() {
    this.setupEventListeners();
    this.checkInstallationStatus();
  }

  private setupEventListeners() {
    // Listen for beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.installPrompt = e as any;
    });

    // Listen for appinstalled event
    window.addEventListener('appinstalled', () => {
      this.isInstalled = true;
      this.installPrompt = null;
    });

    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.handleOnlineStatusChange(true);
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.handleOnlineStatusChange(false);
    });

    // Listen for service worker updates
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });
    }
  }

  private checkInstallationStatus() {
    // Check if app is running in standalone mode (installed)
    this.isInstalled = window.matchMedia('(display-mode: standalone)').matches ||
                      (window.navigator as any).standalone === true;
  }

  private handleOnlineStatusChange(isOnline: boolean) {
    // Dispatch custom event for components to listen to
    window.dispatchEvent(new CustomEvent('pwa-online-change', { 
      detail: { isOnline } 
    }));
  }

  // Check if PWA can be installed
  canInstall(): boolean {
    return this.installPrompt !== null && !this.isInstalled;
  }

  // Install the PWA
  async install(): Promise<boolean> {
    if (!this.installPrompt) {
      return false;
    }

    try {
      await this.installPrompt.prompt();
      const choiceResult = await this.installPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        this.installPrompt = null;
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to install PWA:', error);
      return false;
    }
  }

  // Check if app is installed
  isAppInstalled(): boolean {
    return this.isInstalled;
  }

  // Check if device is online
  isDeviceOnline(): boolean {
    return this.isOnline;
  }

  // Register service worker
  async registerServiceWorker(): Promise<boolean> {
    if (!('serviceWorker' in navigator)) {
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', registration);
      return true;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return false;
    }
  }

  // Request notification permission
  async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      return 'denied';
    }

    if (Notification.permission === 'default') {
      return await Notification.requestPermission();
    }

    return Notification.permission;
  }

  // Show notification
  showNotification(title: string, options?: NotificationOptions): void {
    if (Notification.permission === 'granted') {
      new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options
      });
    }
  }

  // Get app info
  getAppInfo() {
    return {
      isInstalled: this.isInstalled,
      isOnline: this.isOnline,
      canInstall: this.canInstall(),
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
    };
  }
}

// Create singleton instance
export const pwaManager = new PWAManager();

// Hook for PWA functionality
export const usePWA = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [canInstall, setCanInstall] = useState(pwaManager.canInstall());
  const [isInstalled, setIsInstalled] = useState(pwaManager.isAppInstalled());

  useEffect(() => {
    const handleOnlineChange = (event: CustomEvent) => {
      setIsOnline(event.detail.isOnline);
    };

    const handleBeforeInstallPrompt = () => {
      setCanInstall(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setCanInstall(false);
    };

    window.addEventListener('pwa-online-change', handleOnlineChange as EventListener);
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('pwa-online-change', handleOnlineChange as EventListener);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  return {
    isOnline,
    canInstall,
    isInstalled,
    install: () => pwaManager.install(),
    requestNotificationPermission: () => pwaManager.requestNotificationPermission(),
    showNotification: (title: string, options?: NotificationOptions) => 
      pwaManager.showNotification(title, options),
    getAppInfo: () => pwaManager.getAppInfo(),
  };
};

// Offline storage utilities
export class OfflineStorage {
  private static readonly STORAGE_PREFIX = 'qivook-offline-';

  static setItem(key: string, value: any): void {
    try {
      localStorage.setItem(
        `${this.STORAGE_PREFIX}${key}`,
        JSON.stringify({
          value,
          timestamp: Date.now(),
        })
      );
    } catch (error) {
      console.error('Failed to save to offline storage:', error);
    }
  }

  static getItem(key: string): any {
    try {
      const item = localStorage.getItem(`${this.STORAGE_PREFIX}${key}`);
      if (!item) return null;

      const parsed = JSON.parse(item);
      return parsed.value;
    } catch (error) {
      console.error('Failed to read from offline storage:', error);
      return null;
    }
  }

  static removeItem(key: string): void {
    localStorage.removeItem(`${this.STORAGE_PREFIX}${key}`);
  }

  static clear(): void {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(this.STORAGE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  }

  static getAllKeys(): string[] {
    const keys = Object.keys(localStorage);
    return keys
      .filter(key => key.startsWith(this.STORAGE_PREFIX))
      .map(key => key.replace(this.STORAGE_PREFIX, ''));
  }

  static getStorageSize(): number {
    let size = 0;
    const keys = Object.keys(localStorage);
    
    keys.forEach(key => {
      if (key.startsWith(this.STORAGE_PREFIX)) {
        size += localStorage.getItem(key)?.length || 0;
      }
    });

    return size;
  }
}

// Import React for the hook
import { useState, useEffect } from 'react';

