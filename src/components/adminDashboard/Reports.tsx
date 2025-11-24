import React, { useEffect, useState } from 'react';
import { BarChart3, FileText, Users, Calendar, DollarSign, Download } from 'lucide-react';
import { getDashboard, formatCurrency, formatNumber } from '../../services/adminService';
import { API_BASE_URL, API_ENDPOINTS } from '../../config/api';
import { getToken } from '../../services/authService';

export default function Reports() {
	const [analytics, setAnalytics] = useState<any>(null);
	const [dashboardData, setDashboardData] = useState<any>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchData = async () => {
			try {
				// Fetch dashboard data
				const dashboard = await getDashboard();
				setDashboardData(dashboard);

				// Fetch analytics
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
				console.error('Failed to fetch reports data:', error);
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
					<FileText className="w-6 h-6" /> Reports & Analytics
				</h2>
				<button className="flex items-center gap-2 px-5 py-2.5 bg-[#27aae2] text-white rounded-lg font-semibold hover:bg-[#1e8bb8] transition-colors">
					<Download className="w-4 h-4" />
					Export CSV
				</button>
			</div>

			{/* Summary Cards */}
			{loading ? (
				<div className="text-center py-8 text-gray-500">Loading reports...</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					<div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4">
						<BarChart3 className="w-8 h-8 text-[#27aae2]" />
						<div>
							<p className="text-sm text-gray-500 dark:text-gray-400">Total Events</p>
							<p className="text-2xl font-bold text-gray-900 dark:text-white">
								{formatNumber(dashboardData?.stats?.total_events || 0)}
							</p>
							{analytics && (
								<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
									{analytics.new_events} new in last 30 days
								</p>
							)}
						</div>
					</div>
					<div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4">
						<Users className="w-8 h-8 text-[#27aae2]" />
						<div>
							<p className="text-sm text-gray-500 dark:text-gray-400">Total Partners</p>
							<p className="text-2xl font-bold text-gray-900 dark:text-white">
								{formatNumber(dashboardData?.stats?.total_partners || 0)}
							</p>
							{analytics && (
								<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
									{analytics.new_partners} new in last 30 days
								</p>
							)}
						</div>
					</div>
					<div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4">
						<DollarSign className="w-8 h-8 text-[#27aae2]" />
						<div>
							<p className="text-sm text-gray-500 dark:text-gray-400">Total Revenue</p>
							<p className="text-2xl font-bold text-gray-900 dark:text-white">
								{formatCurrency(dashboardData?.stats?.total_revenue || 0)}
							</p>
							{analytics && (
								<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
									{formatCurrency(analytics.revenue)} in last 30 days
								</p>
							)}
						</div>
					</div>
				</div>
			)}

			{/* Analytics Charts (Placeholder) */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
				<div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
					<h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
						<Calendar className="w-5 h-5" /> Events Over Time
					</h3>
					<div className="h-48 flex items-center justify-center text-gray-400 dark:text-gray-500">
						{/* Replace with chart library */}
						<span>Bar chart placeholder</span>
					</div>
				</div>
				<div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
					<h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
						<Users className="w-5 h-5" /> Partner Growth
					</h3>
					<div className="h-48 flex items-center justify-center text-gray-400 dark:text-gray-500">
						{/* Replace with chart library */}
						<span>Line chart placeholder</span>
					</div>
				</div>
			</div>

			{/* Top Categories */}
			{analytics && analytics.top_categories && analytics.top_categories.length > 0 && (
				<div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 mt-8">
					<h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
						<Calendar className="w-5 h-5" /> Top Categories
					</h3>
					<div className="space-y-2">
						{analytics.top_categories.map((cat: any, index: number) => (
							<div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
								<span className="text-gray-900 dark:text-white">{cat.name}</span>
								<span className="text-gray-600 dark:text-gray-400">{cat.event_count} events</span>
							</div>
						))}
					</div>
				</div>
			)}

			{/* Top Partners */}
			{analytics && analytics.top_partners && analytics.top_partners.length > 0 && (
				<div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 mt-8">
					<h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
						<Users className="w-5 h-5" /> Top Partners
					</h3>
					<div className="overflow-x-auto">
						<table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
							<thead>
								<tr>
									<th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">Partner</th>
									<th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">Bookings</th>
									<th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">Earnings</th>
								</tr>
							</thead>
							<tbody>
								{analytics.top_partners.map((partner: any, index: number) => (
									<tr key={index}>
										<td className="px-4 py-2 text-sm text-gray-900 dark:text-white">{partner.name}</td>
										<td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">{partner.booking_count}</td>
										<td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">{formatCurrency(partner.earnings)}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			)}
		</div>
	);
}
