// Real-time notification context for system notifications
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Bell, AlertTriangle, CheckCircle, Info, TrendingUp, TrendingDown, Users, Package, DollarSign, Truck } from 'lucide-react';

export type NotificationType = 'price_alert' | 'supplier_update' | 'logistics_update' | 'system' | 'market_trend' | 'order_update';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  actionUrl?: string;
  actionLabel?: string;
  data?: any;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => string;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
  getNotificationsByType: (type: NotificationType) => Notification[];
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Load notifications from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('qivook-notifications');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setNotifications(parsed.map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp)
        })));
      } catch (error) {
        console.error('Failed to load notifications:', error);
      }
    }
  }, []);

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('qivook-notifications', JSON.stringify(notifications));
  }, [notifications]);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>): string => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification: Notification = {
      id,
      timestamp: new Date(),
      read: false,
      ...notification,
    };

    setNotifications(prev => [newNotification, ...prev]);

    // Show browser notification if permission is granted
    if (Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: notification.type,
      });
    }

    return id;
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const getNotificationsByType = useCallback((type: NotificationType) => {
    return notifications.filter(notification => notification.type === type);
  }, [notifications]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
    getNotificationsByType,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  );
};

// Notification container component
const NotificationContainer: React.FC = () => {
  const { notifications, markAsRead, removeNotification } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'price_alert':
        return <TrendingUp className="w-5 h-5 text-orange-500" />;
      case 'supplier_update':
        return <Users className="w-5 h-5 text-primary-500" />;
      case 'logistics_update':
        return <Truck className="w-5 h-5 text-green-500" />;
      case 'market_trend':
        return <TrendingDown className="w-5 h-5 text-purple-500" />;
      case 'order_update':
        return <Package className="w-5 h-5 text-indigo-500" />;
      case 'system':
        return <Info className="w-5 h-5 text-gray-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'border-l-red-500 bg-red-50 dark:bg-red-900/20';
      case 'high':
        return 'border-l-orange-500 bg-orange-50 dark:bg-orange-900/20';
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
      case 'low':
        return 'border-l-blue-500 bg-primary-50 dark:bg-primary-900/20';
      default:
        return 'border-l-gray-500 bg-gray-50 dark:bg-gray-800';
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Notifications
          </h3>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Bell size={20} />
          </button>
        </div>

        {/* Notifications List */}
        {isOpen && (
          <div className="max-h-96 overflow-y-auto">
            {notifications.slice(0, 10).map((notification) => (
              <div
                key={notification.id}
                className={`p-4 border-l-4 ${getPriorityColor(notification.priority)} ${
                  !notification.read ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                } hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer`}
                onClick={() => {
                  markAsRead(notification.id);
                  if (notification.actionUrl) {
                    window.location.href = notification.actionUrl;
                  }
                }}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {notification.title}
                      </h4>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatTimestamp(notification.timestamp)}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                      {notification.message}
                    </p>
                    {notification.actionLabel && (
                      <button className="mt-2 text-xs text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300">
                        {notification.actionLabel} →
                      </button>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeNotification(notification.id);
                    }}
                    className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Hook for creating notifications
export const useNotificationCreator = () => {
  const { addNotification } = useNotifications();

  return {
    createPriceAlert: (material: string, location: string, price: number, threshold: number) =>
      addNotification({
        type: 'price_alert',
        title: 'Price Alert',
        message: `${material} price in ${location} is ${price} KES (${threshold > price ? 'below' : 'above'} threshold)`,
        priority: 'high',
        actionUrl: '/app/prices',
        actionLabel: 'View Prices',
        data: { material, location, price, threshold }
      }),

    createSupplierUpdate: (supplierName: string, updateType: string) =>
      addNotification({
        type: 'supplier_update',
        title: 'Supplier Update',
        message: `${supplierName} has updated their ${updateType}`,
        priority: 'medium',
        actionUrl: '/app/suppliers',
        actionLabel: 'View Supplier',
        data: { supplierName, updateType }
      }),

    createLogisticsUpdate: (trackingNumber: string, status: string) =>
      addNotification({
        type: 'logistics_update',
        title: 'Shipment Update',
        message: `Shipment ${trackingNumber} status: ${status}`,
        priority: 'medium',
        actionUrl: '/app/logistics',
        actionLabel: 'Track Shipment',
        data: { trackingNumber, status }
      }),

    createMarketTrend: (trend: string, material: string, change: number) =>
      addNotification({
        type: 'market_trend',
        title: 'Market Trend',
        message: `${material} prices are trending ${trend} by ${Math.abs(change)}%`,
        priority: 'low',
        actionUrl: '/app/prices',
        actionLabel: 'View Analysis',
        data: { trend, material, change }
      }),

    createSystemNotification: (title: string, message: string, priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium') =>
      addNotification({
        type: 'system',
        title,
        message,
        priority,
        data: { system: true }
      }),
  };
};

