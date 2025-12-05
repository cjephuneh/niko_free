import { useEffect, useState } from 'react';
import { DollarSign, BarChart3, Download, TrendingUp } from 'lucide-react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { getDashboard, formatCurrency } from '../../services/adminService';
import { API_BASE_URL, API_ENDPOINTS } from '../../config/api';
import { getToken } from '../../services/authService';

type TimePeriod = 'today' | '7_days' | '30_days' | 'all_time';

export default function Revenue() {
	const [analytics, setAnalytics] = useState<any>(null);
	const [dashboardData, setDashboardData] = useState<any>(null);
	const [chartData, setChartData] = useState<any>(null);
	const [loading, setLoading] = useState(true);
	const [chartLoading, setChartLoading] = useState(true);
	const [timePeriod, setTimePeriod] = useState<TimePeriod>('all_time');

	useEffect(() => {
		const fetchData = async () => {
			try {
				// Fetch dashboard data
				const dashboard = await getDashboard();
				setDashboardData(dashboard);

				// Fetch analytics for last 30 days
				const response = await fetch(`${API_ENDPOINTS.admin.analytics}?days=30`, {
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

	useEffect(() => {
		const fetchChartData = async () => {
			setChartLoading(true);
			try {
				const response = await fetch(`${API_BASE_URL}/api/admin/analytics/charts?period=${timePeriod}`, {
					headers: {
						'Content-Type': 'application/json',
						...(getToken() && { Authorization: `Bearer ${getToken()}` }),
					},
				});
				const data = await response.json();
				if (response.ok) {
					setChartData(data);
				}
			} catch (error) {
				console.error('Failed to fetch chart data:', error);
			} finally {
				setChartLoading(false);
			}
		};

		fetchChartData();
	}, [timePeriod]);

	const timePeriodOptions = [
		{ value: 'today', label: 'Today' },
		{ value: '7_days', label: 'Last 7 Days' },
		{ value: '30_days', label: 'Last 1 Month' },
		{ value: 'all_time', label: 'All Time' },
	];

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
					<div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg">
						<div className="flex items-center justify-between mb-2">
							<DollarSign className="w-8 h-8 opacity-90" />
							<TrendingUp className="w-5 h-5 opacity-75" />
						</div>
						<p className="text-orange-100 text-sm font-medium mb-1">Total Revenue</p>
						<p className="text-3xl font-bold">
							{formatCurrency(dashboardData?.stats?.total_revenue || 0)}
						</p>
					</div>
					<div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
						<div className="flex items-center justify-between mb-2">
							<BarChart3 className="w-8 h-8 opacity-90" />
							<TrendingUp className="w-5 h-5 opacity-75" />
						</div>
						<p className="text-green-100 text-sm font-medium mb-1">Last 30 Days</p>
						<p className="text-3xl font-bold">
							{formatCurrency(analytics?.revenue || 0)}
						</p>
					</div>
					<div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
						<div className="flex items-center justify-between mb-2">
							<DollarSign className="w-8 h-8 opacity-90" />
							<TrendingUp className="w-5 h-5 opacity-75" />
						</div>
						<p className="text-blue-100 text-sm font-medium mb-1">Platform Fees (30 days)</p>
						<p className="text-3xl font-bold">
							{formatCurrency(analytics?.platform_fees || 0)}
						</p>
					</div>
				</div>
			)}

			{/* Time Period Filter */}
			<div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
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

			{/* Revenue Trend Chart */}
			<div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
				<div className="flex items-center justify-between mb-4">
					<h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
						<BarChart3 className="w-5 h-5 text-[#27aae2]" /> Revenue Trend
					</h3>
				</div>
				{chartLoading ? (
					<div className="h-64 flex items-center justify-center">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#27aae2]"></div>
					</div>
				) : chartData?.revenue && chartData.revenue.length > 0 ? (
					<ResponsiveContainer width="100%" height={400}>
						<AreaChart data={chartData.revenue} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
							<defs>
								<linearGradient id="gradient-revenue" x1="0" y1="0" x2="0" y2="1">
									<stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
									<stop offset="95%" stopColor="#f59e0b" stopOpacity={0.05}/>
								</linearGradient>
							</defs>
							<CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" opacity={0.3} />
							<XAxis 
								dataKey="label" 
								stroke="#6b7280"
								className="dark:text-gray-400"
								style={{ fontSize: '11px', fontWeight: '500' }}
								tick={{ fill: '#6b7280' }}
								axisLine={{ stroke: '#e5e7eb' }}
							/>
							<YAxis 
								stroke="#6b7280"
								className="dark:text-gray-400"
								style={{ fontSize: '11px', fontWeight: '500' }}
								tick={{ fill: '#6b7280' }}
								tickFormatter={(value) => formatCurrency(value)}
								axisLine={{ stroke: '#e5e7eb' }}
							/>
							<Tooltip 
								contentStyle={{ 
									backgroundColor: '#fff', 
									border: '1px solid #e5e7eb',
									borderRadius: '10px',
									boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
									padding: '10px 12px',
									fontSize: '13px'
								}}
								labelStyle={{ 
									fontWeight: '600', 
									marginBottom: '4px',
									color: '#111827'
								}}
								formatter={(value: any) => [formatCurrency(value), 'Revenue']}
								separator=""
								cursor={{ stroke: '#f59e0b', strokeWidth: 2, strokeDasharray: '5 5' }}
							/>
							<Area 
								type="monotone"
								dataKey="value" 
								stroke="#f59e0b"
								strokeWidth={2.5}
								fill="url(#gradient-revenue)"
								dot={{ fill: '#f59e0b', r: 3, strokeWidth: 2, stroke: '#fff' }}
								activeDot={{ r: 6, stroke: '#f59e0b', strokeWidth: 2.5, fill: '#fff' }}
							/>
						</AreaChart>
					</ResponsiveContainer>
				) : (
					<div className="h-64 flex items-center justify-center text-gray-400 dark:text-gray-500">
						<p>No revenue data available for this period</p>
					</div>
				)}
			</div>

			{/* Revenue Summary */}
			<div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
				<h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
					<DollarSign className="w-5 h-5 text-[#27aae2]" /> Revenue Summary
				</h3>
				{loading ? (
					<div className="text-center py-8 text-gray-500">Loading...</div>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div className="p-5 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-xl border border-gray-200 dark:border-gray-600">
							<p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Bookings</p>
							<p className="text-2xl font-bold text-gray-900 dark:text-white">
								{analytics?.total_bookings || 0}
							</p>
							<p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
								{analytics?.new_bookings || 0} new in last 30 days
							</p>
						</div>
						<div className="p-5 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-xl border border-gray-200 dark:border-gray-600">
							<p className="text-sm text-gray-500 dark:text-gray-400 mb-1">New Users (30 days)</p>
							<p className="text-2xl font-bold text-gray-900 dark:text-white">
								{analytics?.new_users || 0}
							</p>
							<p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
								Active users contributing to revenue
							</p>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
