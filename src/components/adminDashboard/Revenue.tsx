import React, { useEffect, useState } from 'react';
import { DollarSign, BarChart3, Download } from 'lucide-react';
import { getDashboard, formatCurrency } from '../../services/adminService';
import { API_BASE_URL, API_ENDPOINTS } from '../../config/api';
import { getToken } from '../../services/authService';

export default function Revenue() {
	const [analytics, setAnalytics] = useState<any>(null);
	const [dashboardData, setDashboardData] = useState<any>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchData = async () => {
			try {
				// Fetch dashboard data
				const dashboard = await getDashboard();
				setDashboardData(dashboard);

				// Fetch analytics for last 30 days
				const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.admin.analytics}?days=30`, {
					headers: {
						'Content-Type': 'application/json',
						...(getToken() && { Authorization: `Bearer ${getToken()}` }),
					},
				});
				const data = await response.json();
				if (response.ok) {
					setAnalytics(data);
				}
			} catch (error) {
				console.error('Failed to fetch revenue data:', error);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, []);

	return (
		<div className="space-y-8">
			<div className="flex items-center justify-between mb-6">
				<h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
					<DollarSign className="w-6 h-6" /> Revenue Analytics
				</h2>
				<button className="flex items-center gap-2 px-5 py-2.5 bg-[#27aae2] text-white rounded-lg font-semibold hover:bg-[#1e8bb8] transition-colors">
					<Download className="w-4 h-4" />
					Export CSV
				</button>
			</div>

			{/* Revenue Summary Cards */}
			{loading ? (
				<div className="text-center py-8 text-gray-500">Loading revenue data...</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					<div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4">
						<DollarSign className="w-8 h-8 text-[#27aae2]" />
						<div>
							<p className="text-sm text-gray-500 dark:text-gray-400">Total Revenue</p>
							<p className="text-2xl font-bold text-gray-900 dark:text-white">
								{formatCurrency(dashboardData?.stats?.total_revenue || 0)}
							</p>
						</div>
					</div>
					<div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4">
						<BarChart3 className="w-8 h-8 text-[#27aae2]" />
						<div>
							<p className="text-sm text-gray-500 dark:text-gray-400">Last 30 Days</p>
							<p className="text-2xl font-bold text-gray-900 dark:text-white">
								{formatCurrency(analytics?.revenue || 0)}
							</p>
						</div>
					</div>
					<div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4">
						<BarChart3 className="w-8 h-8 text-[#27aae2]" />
						<div>
							<p className="text-sm text-gray-500 dark:text-gray-400">Platform Fees (30 days)</p>
							<p className="text-2xl font-bold text-gray-900 dark:text-white">
								{formatCurrency(analytics?.platform_fees || 0)}
							</p>
						</div>
					</div>
				</div>
			)}

			{/* Revenue Trend Chart (Placeholder) */}
			<div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 mt-8">
				<h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
					<BarChart3 className="w-5 h-5" /> Revenue Trend
				</h3>
				<div className="h-48 flex items-center justify-center text-gray-400 dark:text-gray-500">
					{/* Replace with chart library */}
					<span>Line chart placeholder</span>
				</div>
			</div>

			{/* Recent Transactions */}
			<div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 mt-8">
				<h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
					<DollarSign className="w-5 h-5" /> Revenue Summary
				</h3>
				{loading ? (
					<div className="text-center py-8 text-gray-500">Loading...</div>
				) : (
					<div className="space-y-4">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
								<p className="text-sm text-gray-500 dark:text-gray-400">Total Bookings</p>
								<p className="text-xl font-bold text-gray-900 dark:text-white">
									{analytics?.total_bookings || 0}
								</p>
								<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
									{analytics?.new_bookings || 0} new in last 30 days
								</p>
							</div>
							<div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
								<p className="text-sm text-gray-500 dark:text-gray-400">New Users (30 days)</p>
								<p className="text-xl font-bold text-gray-900 dark:text-white">
									{analytics?.new_users || 0}
								</p>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
