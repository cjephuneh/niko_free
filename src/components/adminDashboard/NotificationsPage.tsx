import React, { useEffect, useMemo, useState } from 'react';
import { Bell } from 'lucide-react';
import { getUserNotifications, markNotificationRead, markAllNotificationsRead } from '../../services/userService';

interface AdminNotification {
  id: number;
  title: string;
  description: string;
  time: string;
  read: boolean;
  action_url?: string;
  action_text?: string;
  event_id?: number;
}

export default function NotificationsPage() {
  const [notificationList, setNotificationList] = useState<AdminNotification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getUserNotifications(filter === 'unread');

      const formatted: AdminNotification[] = (response.notifications || []).map((notif: any) => ({
        id: notif.id,
        title: notif.title || 'Notification',
        description: notif.message || '',
        time: notif.created_at || '',
        read: notif.is_read || false,
        action_url: notif.action_url,
        action_text: notif.action_text,
        event_id: notif.event_id,
      }));

      setNotificationList(formatted);
    } catch (err: any) {
      console.error('Error loading admin notifications:', err);
      setError(err.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const filteredNotifications = useMemo(() => {
    if (filter === 'all') return notificationList;
    if (filter === 'unread') return notificationList.filter(n => !n.read);
    if (filter === 'read') return notificationList.filter(n => n.read);
    return notificationList;
  }, [filter, notificationList]);

  const handleMarkAsRead = async (id: number) => {
    try {
      await markNotificationRead(id);
      setNotificationList(list => list.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (err: any) {
      console.error('Error marking notification as read:', err);
      alert(err.message || 'Failed to mark notification as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotificationList(list => list.map(n => ({ ...n, read: true })));
    } catch (err: any) {
      console.error('Error marking all notifications as read:', err);
      alert(err.message || 'Failed to mark all notifications as read');
    }
  };

  const formatTime = (iso: string) => {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleString();
  };

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-2xl shadow p-6 mt-4">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
        <Bell className="w-6 h-6 text-[#27aae2]" />
        Notifications
      </h2>

      {error && (
        <div className="mb-4 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

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

      <div className="mb-4 flex justify-end">
        <button
          onClick={handleMarkAllAsRead}
          disabled={notificationList.every(n => n.read)}
          className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 text-sm font-semibold hover:bg-gray-200 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Mark all as read
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#27aae2]" />
        </div>
      ) : (
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
                  <span className="text-xs text-gray-500 dark:text-gray-400">{formatTime(note.time)}</span>
                </div>
                <p className="text-gray-700 dark:text-gray-300 text-sm">{note.description}</p>
                <div className="flex items-center justify-between mt-2">
                  {note.action_url && note.action_text && (
                    <button
                      className="px-4 py-2 rounded-lg bg-[#27aae2] text-white text-sm font-semibold hover:bg-[#1a8ec4] transition-colors"
                      onClick={() => {
                        // Handle navigation to event details
                        if (note.event_id) {
                          // Switch to events tab and trigger event selection
                          // The parent AdminDashboard will handle this via a custom event
                          window.dispatchEvent(new CustomEvent('admin-navigate-event', { 
                            detail: { eventId: note.event_id } 
                          }));
                        } else if (note.action_url) {
                          // For other action URLs, navigate directly
                          if (note.action_url.startsWith('/')) {
                            window.location.href = note.action_url;
                          } else {
                            window.location.href = `/${note.action_url}`;
                          }
                        }
                        // Mark as read when action is taken
                        if (!note.read) {
                          handleMarkAsRead(note.id);
                        }
                      }}
                    >
                      {note.action_text}
                    </button>
                  )}
                  {!note.read && (
                    <button
                      className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                      onClick={() => handleMarkAsRead(note.id)}
                    >
                      Mark as Read
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
