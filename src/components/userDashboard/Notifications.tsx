import { Bell, Calendar, Users, Ticket, X, CheckCheck } from 'lucide-react';
import { useState } from 'react';

interface Notification {
  id: string;
  type: 'event' | 'social' | 'ticket' | 'system';
  title: string;
  message: string;
  time: string;
  read: boolean;
  image?: string;
  actionLabel?: string;
}

export default function Notifications() {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'event',
      title: 'Event Reminder',
      message: 'Nairobi Tech Summit 2025 starts tomorrow at 9:00 AM',
      time: '2 hours ago',
      read: false,
      image: 'https://images.pexels.com/photos/2747449/pexels-photo-2747449.jpeg?auto=compress&cs=tinysrgb&w=100',
      actionLabel: 'View Event'
    },
    {
      id: '2',
      type: 'social',
      title: 'New Follower',
      message: 'Sarah Kim started following you',
      time: '5 hours ago',
      read: false,
      image: 'https://i.pravatar.cc/100?img=45'
    },
    {
      id: '3',
      type: 'ticket',
      title: 'Ticket Confirmed',
      message: 'Your ticket for Morning Yoga in the Park has been confirmed',
      time: '1 day ago',
      read: true,
      actionLabel: 'View Ticket'
    },
    {
      id: '4',
      type: 'event',
      title: 'Event Update',
      message: 'Startup Networking Mixer venue has been changed to Nairobi Garage',
      time: '1 day ago',
      read: true,
      image: 'https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=100'
    },
    {
      id: '5',
      type: 'social',
      title: 'Friend Request',
      message: 'John Doe wants to connect with you',
      time: '2 days ago',
      read: false,
      image: 'https://i.pravatar.cc/100?img=12',
      actionLabel: 'View Profile'
    },
    {
      id: '6',
      type: 'system',
      title: 'New Features',
      message: 'Check out our new event recommendation system',
      time: '3 days ago',
      read: true
    },
    {
      id: '7',
      type: 'event',
      title: 'Price Drop Alert',
      message: 'Sunset Music Festival tickets are now 20% off!',
      time: '3 days ago',
      read: true,
      image: 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&w=100',
      actionLabel: 'Book Now'
    },
    {
      id: '8',
      type: 'social',
      title: 'Event Invitation',
      message: 'Alex Johnson invited you to Art Gallery Opening',
      time: '4 days ago',
      read: true,
      actionLabel: 'View Event'
    }
  ]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'event':
        return <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-[#27aae2]" />;
      case 'social':
        return <Users className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />;
      case 'ticket':
        return <Ticket className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />;
      case 'system':
        return <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />;
      default:
        return <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />;
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter(notif => notif.id !== id));
  };

  const filteredNotifications = notifications.filter(notif => 
    filter === 'all' ? true : !notif.read
  );

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-0.5 sm:mb-1">Notifications</h1>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            <CheckCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Mark all as read</span>
            <span className="sm:hidden">Mark all</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl p-0.5 sm:p-1 border border-gray-200 dark:border-gray-700 w-fit">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-md sm:rounded-lg text-xs sm:text-sm font-semibold transition-all ${
            filter === 'all'
              ? 'bg-[#27aae2] text-white'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-md sm:rounded-lg text-xs sm:text-sm font-semibold transition-all ${
            filter === 'unread'
              ? 'bg-[#27aae2] text-white'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-2xl border border-gray-200 dark:border-gray-700 p-8 sm:p-12 text-center">
          <Bell className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 dark:text-gray-600 mx-auto mb-3 sm:mb-4" />
          <h3 className="text-base sm:text-xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">No notifications</h3>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            {filter === 'unread' ? "You're all caught up!" : 'No notifications to show'}
          </p>
        </div>
      ) : (
        <div className="space-y-2 sm:space-y-3">
          {filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl border transition-all hover:shadow-md ${
                notification.read
                  ? 'border-gray-200 dark:border-gray-700'
                  : 'border-[#27aae2]/30 bg-[#27aae2]/5 dark:bg-[#27aae2]/10'
              }`}
            >
              <div className="p-3 sm:p-4">
                <div className="flex gap-3 sm:gap-4">
                  {/* Icon/Image */}
                  <div className="flex-shrink-0">
                    {notification.image ? (
                      <img
                        src={notification.image}
                        alt=""
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                        {getIcon(notification.type)}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
                        {notification.title}
                      </h3>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-[#27aae2] rounded-full flex-shrink-0 mt-1.5"></div>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {notification.message}
                    </p>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs text-gray-500 dark:text-gray-500">
                        {notification.time}
                      </span>
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        {notification.actionLabel && (
                          <button className="text-xs sm:text-sm font-semibold text-[#27aae2] hover:text-[#1e8bb8] transition-colors">
                            {notification.actionLabel}
                          </button>
                        )}
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
                          >
                            Mark read
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                          title="Delete"
                        >
                          <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
