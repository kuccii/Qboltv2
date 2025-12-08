import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, X, Check, AlertTriangle, TrendingUp, Users, FileText, Clock, CreditCard, Wallet } from 'lucide-react';
import { useNotifications as useNotificationsHook } from '../hooks/useData';
import { unifiedApi } from '../services/unifiedApi';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  time: string;
  read: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { notifications: apiNotifications, markAsRead: markApiAsRead, markAllAsRead: markAllApiAsRead } = useNotificationsHook();
  const [applications, setApplications] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch financing applications for notifications
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const apps = await unifiedApi.financing.getApplications({ limit: 5 });
        setApplications(apps);
      } catch (err) {
        console.error('Error fetching applications:', err);
      }
    };

    if (isOpen) {
      fetchApplications();
    }
  }, [isOpen]);

  // Transform API notifications and add financing application notifications
  useEffect(() => {
    const transformedNotifications: Notification[] = [];

    // Add API notifications
    apiNotifications.forEach((notif: any) => {
      const timeAgo = getTimeAgo(new Date(notif.created_at || notif.timestamp));
      transformedNotifications.push({
        id: notif.id,
        title: notif.title || notif.type || 'Notification',
        message: notif.message || notif.content || '',
        type: mapNotificationType(notif.type),
        time: timeAgo,
        read: notif.read || false,
        action: notif.action_url ? {
          label: 'View',
          onClick: () => {
            navigate(notif.action_url);
            onClose();
          }
        } : undefined
      });
    });

    // Add financing application notifications (recent status changes)
    applications.forEach((app) => {
      if (app.status === 'approved' || app.status === 'rejected' || app.status === 'under_review') {
        const timeAgo = getTimeAgo(new Date(app.updated_at || app.created_at));
        const statusMessage = app.status === 'approved' 
          ? `Your financing application for ${app.financing_offers?.provider_name || 'financing'} has been approved!`
          : app.status === 'rejected'
          ? `Your financing application for ${app.financing_offers?.provider_name || 'financing'} was rejected.`
          : `Your financing application for ${app.financing_offers?.provider_name || 'financing'} is under review.`;

        transformedNotifications.push({
          id: `app-${app.id}`,
          title: `Financing Application ${app.status === 'approved' ? 'Approved' : app.status === 'rejected' ? 'Rejected' : 'Update'}`,
          message: statusMessage,
          type: app.status === 'approved' ? 'success' : app.status === 'rejected' ? 'error' : 'info',
          time: timeAgo,
          read: false,
          action: {
            label: 'View Application',
            onClick: () => {
              navigate('/app/financing');
              onClose();
            }
          }
        });
      }
    });

    // Sort by time (most recent first)
    transformedNotifications.sort((a, b) => {
      const timeA = parseTimeAgo(a.time);
      const timeB = parseTimeAgo(b.time);
      return timeB - timeA;
    });

    setNotifications(transformedNotifications.slice(0, 10)); // Limit to 10 most recent
  }, [apiNotifications, applications, navigate, onClose]);

  const getTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  const parseTimeAgo = (timeStr: string): number => {
    if (timeStr === 'Just now') return 0;
    const match = timeStr.match(/(\d+)\s+(minute|hour|day)/);
    if (!match) return Date.now();
    const value = parseInt(match[1]);
    const unit = match[2];
    const multipliers: Record<string, number> = { minute: 60000, hour: 3600000, day: 86400000 };
    return value * (multipliers[unit] || 0);
  };

  const mapNotificationType = (type: string): 'info' | 'warning' | 'success' | 'error' => {
    if (type === 'price_alert' || type === 'warning') return 'warning';
    if (type === 'success' || type === 'approved') return 'success';
    if (type === 'error' || type === 'rejected') return 'error';
    return 'info';
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const markAsRead = async (id: string) => {
    // Update local state
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );

    // Mark as read in API if it's an API notification
    if (!id.startsWith('app-')) {
      try {
        await markApiAsRead(id);
      } catch (err) {
        console.error('Error marking notification as read:', err);
      }
    }
  };

  const markAllAsRead = async () => {
    // Update local state
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );

    // Mark all as read in API
    try {
      await markAllApiAsRead();
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  const getTypeIcon = (type: string, title?: string) => {
    // Check if it's a financing notification
    if (title?.toLowerCase().includes('financing') || title?.toLowerCase().includes('application')) {
      return <Wallet size={16} className="text-blue-500" />;
    }

    switch (type) {
      case 'warning': return <AlertTriangle size={16} className="text-orange-500" />;
      case 'error': return <AlertTriangle size={16} className="text-red-500" />;
      case 'success': return <Check size={16} className="text-green-500" />;
      case 'info': return <TrendingUp size={16} className="text-blue-500" />;
      default: return <Bell size={16} className="text-gray-500" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'warning': return 'border-l-orange-500 bg-orange-50 dark:bg-orange-900/20';
      case 'error': return 'border-l-red-500 bg-red-50 dark:bg-red-900/20';
      case 'success': return 'border-l-green-500 bg-green-50 dark:bg-green-900/20';
      case 'info': return 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/20';
      default: return 'border-l-gray-500 bg-gray-50 dark:bg-gray-700';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (!isOpen) return null;

  return (
    <div 
      ref={dropdownRef}
      className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Notifications
          {unreadCount > 0 && (
            <span className="ml-2 px-2 py-1 text-xs bg-red-500 text-white rounded-full">
              {unreadCount}
            </span>
          )}
        </h3>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
            >
              Mark all read
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            <Bell size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <p>No notifications</p>
            <p className="text-sm mt-1">You're all caught up!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 border-l-4 ${getTypeColor(notification.type)} ${
                  !notification.read ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700/50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {getTypeIcon(notification.type, notification.title)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className={`text-sm font-medium ${
                        !notification.read 
                          ? 'text-gray-900 dark:text-white' 
                          : 'text-gray-700 dark:text-gray-300'
                      }`}>
                        {notification.title}
                      </h4>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                      )}
                    </div>
                    <p className={`text-sm mt-1 ${
                      !notification.read 
                        ? 'text-gray-700 dark:text-gray-300' 
                        : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {notification.message}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <Clock size={12} />
                        {notification.time}
                      </span>
                      {notification.action && (
                        <button
                          onClick={() => {
                            notification.action?.onClick();
                            markAsRead(notification.id);
                          }}
                          className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                        >
                          {notification.action.label}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 space-y-2">
        {applications.length > 0 && (
          <button 
            onClick={() => {
              navigate('/app/financing');
              onClose();
            }}
            className="w-full text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium flex items-center justify-center gap-2"
          >
            <Wallet size={14} />
            View All Applications ({applications.length})
          </button>
        )}
        <button 
          onClick={() => {
            navigate('/app/notifications');
            onClose();
          }}
          className="w-full text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
        >
          View all notifications
        </button>
      </div>
    </div>
  );
};

export default NotificationDropdown;
