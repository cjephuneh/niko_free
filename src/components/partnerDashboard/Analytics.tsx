import React, { useEffect, useState } from 'react';
import { Clock, Calendar, TrendingUp } from 'lucide-react';
import { getPartnerAnalytics } from '../../services/partnerService';

interface AnalyticsData {
	summary: {
		total_bookings: number;
		total_events: number;
		active_events: number;
		total_revenue: number;
	};
	last_7_days: {
		bookings: number;
		revenue: number;
	};
	last_24_hours: {
		bookings: number;
		revenue: number;
	};
}

export default function Analytics() {
	const [data, setData] = useState<AnalyticsData | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	useEffect(() => {
		const fetchData = async () => {
			try {
				setLoading(true);
				setError('');
				const response = await getPartnerAnalytics(30);
				console.log('Analytics response:', response);
				if (response && (response.summary || response.last_7_days || response.last_24_hours)) {
					setData(response);
				} else {
					throw new Error('Invalid response format from analytics API');
				}
			} catch (err: any) {
				console.error('Error fetching analytics:', err);
				setError(err.message || 'Failed to load analytics');
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, []);

	const formatCurrency = (value?: number) =>
		`KES ${(value || 0).toLocaleString()}`;

	if (loading) {
		return (
			<div className="p-6 flex items-center justify-center">
				<div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#27aae2]" />
			</div>
		);
	}

	if (error) {
		return (
			<div className="p-6">
				<h2 className="text-2xl font-bold mb-4 text-[#27aae2]">Analytics</h2>
				<div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
					<p className="text-red-600 dark:text-red-400 text-sm">
						{error}
					</p>
				</div>
			</div>
		);
	}

	if (!data) {
		return (
			<div className="p-6">
				<h2 className="text-2xl font-bold mb-4 text-[#27aae2]">Analytics</h2>
				<div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-8 text-center">
					<p className="text-gray-500 dark:text-gray-400">No analytics data available</p>
				</div>
			</div>
		);
	}

	return (
		<div className="p-6">
			<h2 className="text-2xl font-bold mb-4 text-[#27aae2]">Analytics</h2>

			{/* Top summary cards */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
				<div className="bg-white dark:bg-gray-800 rounded-lg shadow p-5 flex items-center space-x-4">
					<div className="p-3 bg-[#e6f7fb] dark:bg-[#0f1724] rounded-lg">
						<Calendar className="w-6 h-6 text-[#27aae2]" />
					</div>
					<div>
						<div className="text-sm text-gray-500 dark:text-gray-400">Total Bookings</div>
						<div className="text-2xl font-semibold text-gray-900 dark:text-white">
							{data?.summary.total_bookings ?? 0}
						</div>
					</div>
				</div>

				<div className="bg-white dark:bg-gray-800 rounded-lg shadow p-5 flex items-center space-x-4">
					<div className="p-3 bg-[#eaf8f1] dark:bg-[#071214] rounded-lg">
						<TrendingUp className="w-6 h-6 text-[#27aae2]" />
					</div>
					<div>
						<div className="text-sm text-gray-500 dark:text-gray-400">Active Events</div>
						<div className="text-2xl font-semibold text-gray-900 dark:text-white">
							{data?.summary.active_events ?? 0}
						</div>
					</div>
				</div>

				<div className="bg-white dark:bg-gray-800 rounded-lg shadow p-5 flex items-center space-x-4">
					<div className="p-3 bg-[#fff4e6] dark:bg-[#1a1208] rounded-lg">
						<Clock className="w-6 h-6 text-[#27aae2]" />
					</div>
					<div>
						<div className="text-sm text-gray-500 dark:text-gray-400">Revenue</div>
						<div className="text-2xl font-semibold text-gray-900 dark:text-white">
							{formatCurrency(data?.summary.total_revenue)}
						</div>
					</div>
				</div>
			</div>

			{/* Earning Overview */}
			<div className="mb-8 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
				<div className="flex items-center justify-between mb-4">
					<h3 className="text-lg font-semibold text-[#27aae2]">Earning Overview</h3>
					<p className="text-sm text-gray-500 dark:text-gray-400">Track your partner performance</p>
				</div>

				<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
					<div className="rounded-lg border border-gray-200 dark:border-gray-700 p-5">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-xs text-gray-500 dark:text-gray-400">All time earnings</p>
								<div className="mt-2 text-2xl font-bold text-[#27aae2]">
									{formatCurrency(data?.summary.total_revenue)}
								</div>
							</div>
						</div>
						<p className="text-xs text-gray-500 dark:text-gray-400 mt-3">Total earnings since launch.</p>
					</div>

					<div className="rounded-lg border border-gray-200 dark:border-gray-700 p-5">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-xs text-gray-500 dark:text-gray-400">Last 7 days</p>
								<div className="mt-2 text-2xl font-bold text-[#27aae2]">
									{formatCurrency(data?.last_7_days.revenue)}
								</div>
							</div>
							<div className="text-sm text-green-500 font-medium">+12%</div>
						</div>
						<p className="text-xs text-gray-500 dark:text-gray-400 mt-3">Earnings in the last 7 days.</p>
					</div>

					<div className="rounded-lg border border-gray-200 dark:border-gray-700 p-5">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-xs text-gray-500 dark:text-gray-400">Last 24 hours</p>
								<div className="mt-2 text-2xl font-bold text-[#27aae2]">
									{formatCurrency(data?.last_24_hours.revenue)}
								</div>
							</div>
							<div className="text-sm text-red-500 font-medium">-4%</div>
						</div>
						<p className="text-xs text-gray-500 dark:text-gray-400 mt-3">Earnings in the last 24 hours.</p>
					</div>
				</div>
			</div>

			{/* Chart placeholder */}
			<div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
				<div className="flex items-center justify-between mb-4">
					<div>
						<h4 className="text-sm font-semibold text-gray-900 dark:text-white">Earnings chart</h4>
						<p className="text-xs text-gray-500 dark:text-gray-400">Overview by selected timeframe</p>
					</div>
					<div className="flex items-center space-x-2">
						<button className="text-xs px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">All</button>
						<button className="text-xs px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">7d</button>
						<button className="text-xs px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">24h</button>
					</div>
				</div>

				<div className="h-56 rounded border-2 border-dashed border-gray-200 dark:border-gray-700 flex items-center justify-center">
					<span className="text-sm text-gray-400">Chart coming soon</span>
				</div>
			</div>
		</div>
	);
}
