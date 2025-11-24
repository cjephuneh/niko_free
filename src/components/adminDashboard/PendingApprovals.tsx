import React, { useEffect, useState } from 'react';
import { getDashboard } from '../../services/adminService';

interface PendingApprovalsProps {
  onReviewPartners: () => void;
  onReviewEvents: () => void;
}

export default function PendingApprovals({ onReviewPartners, onReviewEvents }: PendingApprovalsProps) {
  const [pendingPartners, setPendingPartners] = useState<any[]>([]);
  const [pendingEvents, setPendingEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPending = async () => {
      try {
        const data = await getDashboard();
        setPendingPartners(data.pending_partners || []);
        setPendingEvents(data.pending_events || []);
      } catch (error) {
        console.error('Failed to fetch pending approvals:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPending();
  }, []);

  const totalPending = pendingPartners.length + pendingEvents.length;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Pending Approvals</h3>
        <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-full text-sm font-semibold">
          {loading ? '...' : totalPending}
        </span>
      </div>
      <div className="space-y-4">
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <p className="font-semibold text-gray-900 dark:text-white">Partner Applications</p>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {loading ? '...' : `${pendingPartners.length} pending`}
            </span>
          </div>
          <button
            onClick={onReviewPartners}
            className="text-sm text-[#27aae2] hover:text-[#1e8bb8] font-medium"
          >
            Review now →
          </button>
        </div>
        <div className="p-4 bg-[#27aae2]/10 dark:bg-[#27aae2]/20 border border-[#27aae2]/30 dark:border-[#27aae2]/40 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <p className="font-semibold text-gray-900 dark:text-white">Event Submissions</p>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {loading ? '...' : `${pendingEvents.length} pending`}
            </span>
          </div>
          <button
            onClick={onReviewEvents}
            className="text-sm text-[#27aae2] hover:text-[#1e8bb8] font-medium"
          >
            Review now →
          </button>
        </div>
      </div>
    </div>
  );
}
