import React from 'react';
import { Bell, Check, Clock, DollarSign, ShoppingBag, Users } from 'lucide-react';
import Header from '../components/Layout/Header';
import Button from '../components/UI/Button';
import { useApp } from '../contexts/AppContext';

const Notifications: React.FC = () => {
  const { state, dispatch } = useApp();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order':
        return ShoppingBag;
      case 'payment':
        return DollarSign;
      case 'kitchen':
        return Clock;
      case 'staff':
        return Users;
      default:
        return Bell;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'order':
        return 'text-blue-600 bg-blue-50';
      case 'payment':
        return 'text-green-600 bg-green-50';
      case 'kitchen':
        return 'text-yellow-600 bg-yellow-50';
      case 'staff':
        return 'text-purple-600 bg-purple-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const markAsRead = (notificationId: string) => {
    dispatch({
      type: 'MARK_NOTIFICATION_READ',
      payload: notificationId
    });
  };

  const markAllAsRead = () => {
    state.notifications.forEach(notification => {
      if (!notification.read) {
        dispatch({
          type: 'MARK_NOTIFICATION_READ',
          payload: notification.id
        });
      }
    });
  };

  const unreadCount = state.notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Notifications" />
      
      <div className="p-4 lg:p-6">
        {/* Header Actions */}
        <div className="flex justify-between items-center mb-6">
          <div className="text-sm text-gray-600">
            {unreadCount} unread notifications
          </div>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              icon={Check}
              onClick={markAllAsRead}
            >
              Mark All Read
            </Button>
          )}
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {state.notifications.map((notification) => {
            const Icon = getNotificationIcon(notification.type);
            const colorClass = getNotificationColor(notification.type);
            
            return (
              <div
                key={notification.id}
                className={`bg-white rounded-lg border p-4 ${
                  !notification.read ? 'border-blue-200 bg-blue-50' : 'border-gray-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${colorClass}`}>
                    <Icon size={20} />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className={`font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                          {notification.message}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {new Date(notification.timestamp).toLocaleString()}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        )}
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsRead(notification.id)}
                          >
                            Mark Read
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    {notification.actionable && (
                      <div className="mt-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // Handle action based on notification type
                            console.log('Action clicked for:', notification.type);
                          }}
                        >
                          View Details
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {state.notifications.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-2">
              <Bell size={48} />
            </div>
            <p className="text-gray-600">No notifications yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;