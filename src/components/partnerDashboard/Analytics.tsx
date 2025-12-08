import React, { useEffect, useState } from 'react';
import { Clock, Calendar, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getPartnerAnalytics } from '../../services/partnerService';

type TimePeriod = 'today' | '7_days' | '30_days' | 'all_time';

interface ChartDataPoint {
	date: string;
	active_events: number;
	total_events: number;
	bookings: number;
	cumulative_bookings: number;
	revenue: number;
	cumulative_revenue: number;
}

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
	chart_data?: ChartDataPoint[];
}

export default function Analytics() {
	const [data, setData] = useState<AnalyticsData | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [timePeriod, setTimePeriod] = useState<TimePeriod>('30_days');

	const timePeriodOptions = [
		{ value: 'today', label: 'Today' },
		{ value: '7_days', label: 'Last 7 Days' },
		{ value: '30_days', label: 'Last 1 Month' },
		{ value: 'all_time', label: 'All Time' },
	];

	// Map time period to days for API
	const getDaysForPeriod = (period: TimePeriod): number => {
		switch (period) {
			case 'today':
				return 1;
			case '7_days':
				return 7;
			case '30_days':
				return 30;
			case 'all_time':
				return 365; // Get all time data
			default:
				return 30;
		}
	};

	useEffect(() => {
		const fetchData = async () => {
			try {
				setLoading(true);
				setError('');
				const days = getDaysForPeriod(timePeriod);
				const response = await getPartnerAnalytics(days);
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
	}, [timePeriod]);

	const formatCurrency = (value?: number) =>
		`KES ${(value || 0).toLocaleString()}`;

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
	};

	const CustomTooltip = ({ active, payload, label }: any) => {
		if (active && payload && payload.length) {
			return (
				<div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
					<p className="font-semibold text-gray-900 dark:text-white mb-2">
						{formatDate(label)}
					</p>
					{payload.map((entry: any, index: number) => (
						<p key={index} className="text-sm" style={{ color: entry.color }}>
							{entry.name}:{' '}
							{entry.dataKey === 'cumulative_revenue' || entry.dataKey === 'revenue'
								? formatCurrency(entry.value)
								: entry.value.toLocaleString()}
						</p>
					))}
				</div>
			);
		}
		return null;
	};

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
							{(() => {
								// Calculate percentage change: compare 7 days revenue to previous 7 days
								// We need to get previous period data, but for now show nothing if we can't calculate
								const sevenDaysRevenue = data?.last_7_days.revenue || 0;
								const periodRevenue = data?.period?.revenue || 0;
								const periodDays = data?.period?.days || 30;
								
								// If period is 7 days, we can compare
								if (periodDays === 7 && periodRevenue > 0) {
									const change = ((sevenDaysRevenue - periodRevenue) / periodRevenue) * 100;
									if (Math.abs(change) > 0.1) {
										return (
											<div className={`text-sm font-medium ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
												{change >= 0 ? '+' : ''}{change.toFixed(1)}%
											</div>
										);
									}
								}
								return null;
							})()}
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
							{(() => {
								// Calculate percentage change: compare 24h revenue to previous 24h
								// For now, compare to 7 days average
								const last24hRevenue = data?.last_24_hours.revenue || 0;
								const sevenDaysRevenue = data?.last_7_days.revenue || 0;
								
								if (sevenDaysRevenue > 0) {
									// Average daily revenue over 7 days
									const avgDailyRevenue = sevenDaysRevenue / 7;
									if (avgDailyRevenue > 0) {
										const change = ((last24hRevenue - avgDailyRevenue) / avgDailyRevenue) * 100;
										if (Math.abs(change) > 0.1) {
											return (
												<div className={`text-sm font-medium ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
													{change >= 0 ? '+' : ''}{change.toFixed(1)}%
												</div>
											);
										}
									}
								}
								return null;
							})()}
						</div>
						<p className="text-xs text-gray-500 dark:text-gray-400 mt-3">Earnings in the last 24 hours.</p>
					</div>
				</div>
			</div>

			{/* Time Period Filter */}
			<div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
				<div className="flex items-center gap-2 flex-wrap">
					<span className="text-sm font-semibold text-gray-700 dark:text-gray-300 mr-2">Time Period:</span>
					{timePeriodOptions.map((option) => (
						<button
							key={option.value}
							onClick={() => setTimePeriod(option.value as TimePeriod)}
							className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
								timePeriod === option.value
									? 'bg-gradient-to-r from-[#27aae2] to-[#1e8bb8] text-white shadow-lg'
									: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
							}`}
						>
							{option.label}
						</button>
					))}
				</div>
			</div>

			{/* Line Chart */}
			<div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
				<div className="flex items-center justify-between mb-4">
					<div>
						<h4 className="text-sm font-semibold text-gray-900 dark:text-white">Analytics Overview</h4>
						<p className="text-xs text-gray-500 dark:text-gray-400">Track your performance over time</p>
					</div>
				</div>

				{data?.chart_data && data.chart_data.length > 0 ? (
					<ResponsiveContainer width="100%" height={400}>
						<LineChart
							data={data.chart_data}
							margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
						>
							<CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
							<XAxis
								dataKey="date"
								tick={{ fill: '#6b7280', fontSize: 12 }}
								stroke="#9ca3af"
								angle={-45}
								textAnchor="end"
								height={80}
								tickFormatter={formatDate}
							/>
							<YAxis
								yAxisId="left"
								tick={{ fill: '#6b7280', fontSize: 12 }}
								stroke="#9ca3af"
							/>
							<YAxis
								yAxisId="right"
								orientation="right"
								tick={{ fill: '#6b7280', fontSize: 12 }}
								stroke="#9ca3af"
								tickFormatter={(value) => `KES ${(value / 1000).toFixed(0)}k`}
							/>
							<Tooltip content={<CustomTooltip />} />
							<Legend
								wrapperStyle={{ paddingTop: '20px' }}
								iconType="line"
							/>
							<Line
								yAxisId="left"
								type="monotone"
								dataKey="active_events"
								stroke="#27aae2"
								strokeWidth={2}
								name="Active Events"
								dot={{ r: 4 }}
								activeDot={{ r: 6 }}
							/>
							<Line
								yAxisId="left"
								type="monotone"
								dataKey="cumulative_bookings"
								stroke="#10b981"
								strokeWidth={2}
								name="Total Bookings"
								dot={{ r: 4 }}
								activeDot={{ r: 6 }}
							/>
							<Line
								yAxisId="right"
								type="monotone"
								dataKey="cumulative_revenue"
								stroke="#f59e0b"
								strokeWidth={2}
								name="Revenue (KES)"
								dot={{ r: 4 }}
								activeDot={{ r: 6 }}
							/>
							<Line
								yAxisId="left"
								type="monotone"
								dataKey="total_events"
								stroke="#8b5cf6"
								strokeWidth={2}
								name="All Events"
								dot={{ r: 4 }}
								activeDot={{ r: 6 }}
							/>
						</LineChart>
					</ResponsiveContainer>
				) : (
					<div className="h-96 rounded border-2 border-dashed border-gray-200 dark:border-gray-700 flex items-center justify-center">
						<span className="text-sm text-gray-400">No chart data available</span>
					</div>
				)}
			</div>
		</div>
	);
}
