import React from 'react';
import { Bell } from 'lucide-react';

// Dummy notifications data
const notifications = [
  {
    id: '1',
    title: 'New Partner Request',
    description: 'Tech Hub Africa has requested to become a partner.',
    time: '2 hours ago',
    read: false,
  },
  {
    id: '2',
    title: 'Event Approval Needed',
    description: 'Nairobi Innovation Week is pending your approval.',
    time: '5 hours ago',
    read: false,
  },
  {
    id: '3',
    title: 'User Flagged',
    description: 'Sarah Johnson was flagged for suspicious activity.',
    time: '1 day ago',
    read: true,
  },
];

export default function NotificationsPage() {
  const [notificationList, setNotificationList] = React.useState(notifications);
  const [filter, setFilter] = React.useState<'all' | 'unread' | 'read'>('all');

  // Filter notifications
  const filteredNotifications = React.useMemo(() => {
    if (filter === 'all') return notificationList;
    if (filter === 'unread') return notificationList.filter(n => !n.read);
    if (filter === 'read') return notificationList.filter(n => n.read);
    return notificationList;
  }, [filter, notificationList]);

  // Mark as read handler
  const handleMarkAsRead = (id: string) => {
    setNotificationList(list => list.map(n => n.id === id ? { ...n, read: true } : n));
  };

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-2xl shadow p-6 mt-4">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
        <Bell className="w-6 h-6 text-[#27aae2]" />
        Notifications
      </h2>

      {/* Filter Tabs */}
      <div className="mb-6 flex gap-2">
        <button
          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${filter === 'all' ? 'bg-[#27aae2] text-white' : 'bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300'}`}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        <button
          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${filter === 'unread' ? 'bg-[#27aae2] text-white' : 'bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300'}`}
          onClick={() => setFilter('unread')}
        >
          Unread
        </button>
        <button
          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${filter === 'read' ? 'bg-[#27aae2] text-white' : 'bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300'}`}
          onClick={() => setFilter('read')}
        >
          Read
        </button>
      </div>

      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400">No notifications.</div>
        ) : (
          filteredNotifications.map((note) => (
            <div
              key={note.id}
              className={`p-4 rounded-xl border shadow-sm flex flex-col gap-1 ${note.read ? 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700' : 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700'}`}
            >
              <div className="flex items-center justify-between">
                <span className={`font-semibold text-lg ${note.read ? 'text-gray-900 dark:text-white' : 'text-[#27aae2]'}`}>{note.title}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{note.time}</span>
              </div>
              <p className="text-gray-700 dark:text-gray-300 text-sm">{note.description}</p>
              {!note.read && (
                <button
                  className="mt-2 self-end px-3 py-1 rounded bg-[#27aae2] text-white text-xs font-semibold hover:bg-[#1a8ec4] transition-colors"
                  onClick={() => handleMarkAsRead(note.id)}
                >
                  Mark as Read
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
