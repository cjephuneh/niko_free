import { useEffect, useState } from 'react';
import { FileText, Users, Calendar, DollarSign, Download, TrendingUp } from 'lucide-react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { getDashboard, formatCurrency, formatNumber } from '../../services/adminService';
import { API_BASE_URL, API_ENDPOINTS } from '../../config/api';
import { getToken } from '../../services/authService';

type TimePeriod = 'today' | '7_days' | '30_days' | 'all_time';

export default function Reports() {
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

				// Fetch analytics
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
				console.error('Failed to fetch reports data:', error);
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

	const ChartCard = ({ title, icon: Icon, data, dataKey, color, formatValue }: any) => (
		<div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
			<div className="flex items-center justify-between mb-4">
				<h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
					<Icon className="w-5 h-5 text-[#27aae2]" />
					{title}
				</h3>
			</div>
			{chartLoading ? (
				<div className="h-64 flex items-center justify-center">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#27aae2]"></div>
				</div>
			) : data && data.length > 0 ? (
				<ResponsiveContainer width="100%" height={280}>
					<AreaChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
						<defs>
							<linearGradient id={`gradient-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
								<stop offset="5%" stopColor={color} stopOpacity={0.3}/>
								<stop offset="95%" stopColor={color} stopOpacity={0.05}/>
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
							tickFormatter={(value) => formatValue ? formatValue(value) : value.toString()}
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
							formatter={(value: any) => [formatValue ? formatValue(value) : value, '']}
							separator=""
							cursor={{ stroke: color, strokeWidth: 2, strokeDasharray: '5 5' }}
						/>
						<Area 
							type="monotone"
							dataKey={dataKey} 
							stroke={color}
							strokeWidth={2.5}
							fill={`url(#gradient-${color.replace('#', '')})`}
							dot={{ fill: color, r: 3, strokeWidth: 2, stroke: '#fff' }}
							activeDot={{ r: 6, stroke: color, strokeWidth: 2.5, fill: '#fff' }}
						/>
					</AreaChart>
				</ResponsiveContainer>
			) : (
				<div className="h-64 flex items-center justify-center text-gray-400 dark:text-gray-500">
					<p>No data available for this period</p>
				</div>
			)}
		</div>
	);

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
				<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
					<div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
						<div className="flex items-center justify-between mb-2">
							<Calendar className="w-8 h-8 opacity-90" />
							<TrendingUp className="w-5 h-5 opacity-75" />
						</div>
						<p className="text-blue-100 text-sm font-medium mb-1">Total Events</p>
						<p className="text-3xl font-bold">
							{formatNumber(dashboardData?.stats?.total_events || 0)}
						</p>
						{analytics && (
							<p className="text-xs text-blue-100 mt-2">
								{analytics.new_events} new in last 30 days
							</p>
						)}
					</div>
					<div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
						<div className="flex items-center justify-between mb-2">
							<Users className="w-8 h-8 opacity-90" />
							<TrendingUp className="w-5 h-5 opacity-75" />
						</div>
						<p className="text-purple-100 text-sm font-medium mb-1">Total Partners</p>
						<p className="text-3xl font-bold">
							{formatNumber(dashboardData?.stats?.total_partners || 0)}
						</p>
						{analytics && (
							<p className="text-xs text-purple-100 mt-2">
								{analytics.new_partners} new in last 30 days
							</p>
						)}
					</div>
					<div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
						<div className="flex items-center justify-between mb-2">
							<Users className="w-8 h-8 opacity-90" />
							<TrendingUp className="w-5 h-5 opacity-75" />
						</div>
						<p className="text-green-100 text-sm font-medium mb-1">Total Users</p>
						<p className="text-3xl font-bold">
							{formatNumber(dashboardData?.stats?.total_users || 0)}
						</p>
					</div>
					<div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg">
						<div className="flex items-center justify-between mb-2">
							<DollarSign className="w-8 h-8 opacity-90" />
							<TrendingUp className="w-5 h-5 opacity-75" />
						</div>
						<p className="text-orange-100 text-sm font-medium mb-1">Total Revenue</p>
						<p className="text-3xl font-bold">
							{formatCurrency(dashboardData?.stats?.total_revenue || 0)}
						</p>
						{analytics && (
							<p className="text-xs text-orange-100 mt-2">
								{formatCurrency(analytics.revenue)} in last 30 days
							</p>
						)}
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

			{/* Analytics Charts */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<ChartCard
					title="Events Over Time"
					icon={Calendar}
					data={chartData?.events}
					dataKey="value"
					color="#27aae2"
					formatValue={(value: number) => value.toString()}
				/>
				<ChartCard
					title="Partners Over Time"
					icon={Users}
					data={chartData?.partners}
					dataKey="value"
					color="#8b5cf6"
					formatValue={(value: number) => value.toString()}
				/>
				<ChartCard
					title="Users Over Time"
					icon={Users}
					data={chartData?.users}
					dataKey="value"
					color="#10b981"
					formatValue={(value: number) => value.toString()}
				/>
				<ChartCard
					title="Revenue Over Time"
					icon={DollarSign}
					data={chartData?.revenue}
					dataKey="value"
					color="#f59e0b"
					formatValue={(value: number) => formatCurrency(value)}
				/>
			</div>

			{/* Top Categories */}
			{analytics && analytics.top_categories && analytics.top_categories.length > 0 && (
				<div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
					<h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
						<Calendar className="w-5 h-5 text-[#27aae2]" /> Top Categories
					</h3>
					<div className="space-y-2">
						{analytics.top_categories.map((cat: any, index: number) => (
							<div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
								<span className="text-gray-900 dark:text-white font-medium">{cat.name}</span>
								<span className="text-gray-600 dark:text-gray-400 font-semibold">{cat.event_count} events</span>
							</div>
						))}
					</div>
				</div>
			)}

			{/* Top Partners */}
			{analytics && analytics.top_partners && analytics.top_partners.length > 0 && (
				<div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
					<h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
						<Users className="w-5 h-5 text-[#27aae2]" /> Top Partners
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
									<tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
										<td className="px-4 py-2 text-sm text-gray-900 dark:text-white font-medium">{partner.name}</td>
										<td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">{partner.booking_count}</td>
										<td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 font-semibold">{formatCurrency(partner.earnings)}</td>
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
