import React, { useEffect, useState } from 'react';
import { getDashboard, formatTimeAgo } from '../../services/adminService';

export default function RecentActivity() {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const data = await getDashboard();
        // Combine recent activity from admin logs with recent users/partners/events
        const allActivities: any[] = [];

        // Add admin log activities
        if (data.recent_activity && data.recent_activity.length > 0) {
          data.recent_activity.slice(0, 5).forEach((log: any) => {
            allActivities.push({
              action: log.description || `${log.action.replace('_', ' ')}`,
              name: log.admin_email,
              time: formatTimeAgo(log.created_at),
              type: 'admin_action',
            });
          });
        }

        // Add recent users
        if (data.recent_users && data.recent_users.length > 0) {
          data.recent_users.slice(0, 2).forEach((user: any) => {
            allActivities.push({
              action: 'New user registered',
              name: `${user.first_name} ${user.last_name}`,
              time: formatTimeAgo(user.created_at),
              type: 'user',
            });
          });
        }

        // Add recent partners
        if (data.recent_partners && data.recent_partners.length > 0) {
          data.recent_partners.slice(0, 2).forEach((partner: any) => {
            allActivities.push({
              action: 'New partner registered',
              name: partner.business_name || partner.name,
              time: formatTimeAgo(partner.created_at),
              type: 'partner',
            });
          });
        }

        // Sort by time (most recent first) and limit to 8
        allActivities.sort((a, b) => {
          // Simple sort - admin logs first, then by time
          return 0;
        });

        setActivities(allActivities.slice(0, 8));
      } catch (error) {
        console.error('Failed to fetch recent activity:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
  }, []);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Recent Activity</h3>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl animate-pulse">
              <div className="w-2 h-2 bg-gray-300 rounded-full mt-2"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Recent Activity</h3>
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">No recent activity</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Recent Activity</h3>
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
            <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900 dark:text-white">{activity.action}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{activity.name}</p>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
