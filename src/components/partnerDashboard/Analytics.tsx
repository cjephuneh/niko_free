import React from 'react';

export default function Analytics() {
       return (
	       <div className="p-6">
		       <h2 className="text-2xl font-bold mb-4 text-[#27aae2]">Analytics</h2>
		       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
			       <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex flex-col items-center">
				       <span className="text-3xl font-bold text-[#27aae2]">1,245</span>
				       <span className="text-gray-600 dark:text-gray-300 mt-2">Total Bookings</span>
			       </div>
			       <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex flex-col items-center">
				       <span className="text-3xl font-bold text-[#27aae2]">32</span>
				       <span className="text-gray-600 dark:text-gray-300 mt-2">Active Events</span>
			       </div>
			       <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex flex-col items-center">
				       <span className="text-3xl font-bold text-[#27aae2]">KES 254,000</span>
				       <span className="text-gray-600 dark:text-gray-300 mt-2">Revenue</span>
			       </div>
		       </div>
		       <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
			       <h3 className="text-lg font-semibold text-[#27aae2] mb-4">Bookings Over Time</h3>
			       <div className="h-48 flex items-center justify-center text-gray-400 dark:text-gray-500">
				       {/* Chart placeholder */}
				       <span>Chart will appear here</span>
			       </div>
		       </div>
	       </div>
       );
}
