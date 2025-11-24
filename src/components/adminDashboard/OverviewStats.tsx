import React, { useEffect, useState } from 'react';
import { Users, Calendar, DollarSign, BarChart3 } from 'lucide-react';
import { getDashboard, formatCurrency, formatNumber } from '../../services/adminService';

export default function OverviewStats() {
  const [stats, setStats] = useState({
    total_users: 0,
    total_partners: 0,
    total_events: 0,
    total_revenue: 0,
    users_change: 0,
    partners_change: 0,
    events_change: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getDashboard();
        setStats(data.stats);
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statsConfig = [
    {
      label: 'Total Users',
      value: loading ? '...' : formatNumber(stats.total_users),
      icon: Users,
      color: 'from-[#27aae2] to-[#1e8bb8]',
      change: stats.users_change
        ? `${stats.users_change > 0 ? '+' : ''}${stats.users_change.toFixed(1)}% this month`
        : 'No change',
    },
    {
      label: 'Active Partners',
      value: loading ? '...' : formatNumber(stats.total_partners),
      icon: Users,
      color: 'from-green-500 to-green-600',
      change: stats.partners_change
        ? `${stats.partners_change > 0 ? '+' : ''}${stats.partners_change.toFixed(1)}% this month`
        : 'No change',
    },
    {
      label: 'Total Events',
      value: loading ? '...' : formatNumber(stats.total_events),
      icon: Calendar,
      color: 'from-gray-700 to-gray-900',
      change: stats.events_change
        ? `${stats.events_change > 0 ? '+' : ''}${stats.events_change} this month`
        : 'No change',
    },
    {
      label: 'Platform Revenue',
      value: loading ? '...' : formatCurrency(stats.total_revenue),
      icon: DollarSign,
      color: 'from-orange-500 to-orange-600',
      change: '7% commission',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsConfig.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all border border-gray-100 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">{stat.label}</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{stat.value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{stat.change}</p>
          </div>
        );
      })}
    </div>
  );
}
