import { useState, useEffect, useCallback, useRef } from 'react';

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'price_alert' | 'supplier_update' | 'logistics_update';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
  metadata?: Record<string, any>;
}

export interface NotificationSettings {
  priceAlerts: boolean;
  supplierUpdates: boolean;
  logisticsUpdates: boolean;
  systemUpdates: boolean;
  email: boolean;
  push: boolean;
}

const defaultSettings: NotificationSettings = {
  priceAlerts: true,
  supplierUpdates: true,
  logisticsUpdates: true,
  systemUpdates: true,
  email: false,
  push: false,
};

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [settings, setSettings] = useState<NotificationSettings>(defaultSettings);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load notifications from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('qivook_notifications');
      if (stored) {
        const parsed = JSON.parse(stored);
        setNotifications(parsed.map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp)
        })));
      }

      const storedSettings = localStorage.getItem('qivook_notification_settings');
      if (storedSettings) {
        setSettings(JSON.parse(storedSettings));
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  }, []);

  // Save notifications to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('qivook_notifications', JSON.stringify(notifications));
    } catch (error) {
      console.error('Failed to save notifications:', error);
    }
  }, [notifications]);

  // Save settings to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('qivook_notification_settings', JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save notification settings:', error);
    }
  }, [settings]);

  // Update unread count
  useEffect(() => {
    const unread = notifications.filter(n => !n.read).length;
    setUnreadCount(unread);
  }, [notifications]);

  // WebSocket connection for real-time notifications
  useEffect(() => {
    const connectWebSocket = () => {
      try {
        const ws = new WebSocket(import.meta.env.VITE_WS_URL || 'ws://localhost:3001/notifications');
        
        ws.onopen = () => {
          setIsConnected(true);
          console.log('WebSocket connected');
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            handleIncomingNotification(data);
          } catch (error) {
            console.error('Failed to parse notification:', error);
          }
        };

        ws.onclose = () => {
          setIsConnected(false);
          console.log('WebSocket disconnected');
          
          // Attempt to reconnect after 5 seconds
          reconnectTimeoutRef.current = setTimeout(() => {
            connectWebSocket();
          }, 5000);
        };

        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          setIsConnected(false);
        };

        wsRef.current = ws;
      } catch (error) {
        console.error('Failed to connect WebSocket:', error);
        setIsConnected(false);
      }
    };

    // Only connect in production or when WS_URL is set
    if (import.meta.env.PROD || import.meta.env.VITE_WS_URL) {
      connectWebSocket();
    } else {
      // In development, simulate notifications
      simulateNotifications();
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  // Simulate notifications in development
  const simulateNotifications = useCallback(() => {
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'price_alert',
        title: 'Price Alert: Cement',
        message: 'Cement prices in Nairobi have increased by 5.2%',
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        read: false,
        action: {
          label: 'View Details',
          onClick: () => console.log('View price details')
        },
        metadata: { material: 'cement', region: 'Nairobi', change: 5.2 }
      },
      {
        id: '2',
        type: 'supplier_update',
        title: 'New Supplier Added',
        message: 'Steel Masters Ltd has been added to the directory',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        read: false,
        action: {
          label: 'View Supplier',
          onClick: () => console.log('View supplier')
        },
        metadata: { supplierId: 'steel-masters' }
      },
      {
        id: '3',
        type: 'logistics_update',
        title: 'Route Status Update',
        message: 'Nairobi to Kampala route is experiencing delays',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
        read: true,
        action: {
          label: 'View Route',
          onClick: () => console.log('View route details')
        },
        metadata: { route: 'Nairobi-Kampala', status: 'delayed' }
      }
    ];

    setNotifications(mockNotifications);
  }, []);

  // Handle incoming notification
  const handleIncomingNotification = useCallback((data: any) => {
    const notification: Notification = {
      id: data.id || Date.now().toString(),
      type: data.type || 'info',
      title: data.title || 'Notification',
      message: data.message || '',
      timestamp: new Date(data.timestamp || Date.now()),
      read: false,
      action: data.action,
      metadata: data.metadata
    };

    setNotifications(prev => [notification, ...prev.slice(0, 99)]); // Keep only last 100 notifications
  }, []);

  // Add notification
  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false
    };

    setNotifications(prev => [newNotification, ...prev.slice(0, 99)]);
  }, []);

  // Mark notification as read
  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
  }, []);

  // Delete notification
  const deleteNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // Clear all notifications
  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  // Update settings
  const updateSettings = useCallback((newSettings: Partial<NotificationSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  // Get notifications by type
  const getNotificationsByType = useCallback((type: Notification['type']) => {
    return notifications.filter(n => n.type === type);
  }, [notifications]);

  // Get unread notifications
  const getUnreadNotifications = useCallback(() => {
    return notifications.filter(n => !n.read);
  }, [notifications]);

  // Check if user has permission for notification type
  const canReceiveNotification = useCallback((type: Notification['type']) => {
    switch (type) {
      case 'price_alert':
        return settings.priceAlerts;
      case 'supplier_update':
        return settings.supplierUpdates;
      case 'logistics_update':
        return settings.logisticsUpdates;
      case 'info':
      case 'success':
      case 'warning':
      case 'error':
        return settings.systemUpdates;
      default:
        return true;
    }
  }, [settings]);

  // Request notification permission
  const requestPermission = useCallback(async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }, []);

  // Show browser notification
  const showBrowserNotification = useCallback((notification: Notification) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: notification.id
      });
    }
  }, []);

  return {
    // State
    notifications,
    unreadCount,
    settings,
    isConnected,
    
    // Actions
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    updateSettings,
    
    // Getters
    getNotificationsByType,
    getUnreadNotifications,
    canReceiveNotification,
    
    // Permissions
    requestPermission,
    showBrowserNotification,
  };
}

// Notification types and their configurations
export const notificationTypes = {
  info: {
    name: 'Information',
    color: 'blue',
    icon: 'ℹ️'
  },
  success: {
    name: 'Success',
    color: 'green',
    icon: '✅'
  },
  warning: {
    name: 'Warning',
    color: 'yellow',
    icon: '⚠️'
  },
  error: {
    name: 'Error',
    color: 'red',
    icon: '❌'
  },
  price_alert: {
    name: 'Price Alert',
    color: 'orange',
    icon: '📈'
  },
  supplier_update: {
    name: 'Supplier Update',
    color: 'blue',
    icon: '🏢'
  },
  logistics_update: {
    name: 'Logistics Update',
    color: 'purple',
    icon: '🚛'
  }
};
