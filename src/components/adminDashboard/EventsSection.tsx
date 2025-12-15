import React from 'react';
import { CheckCircle, XCircle, Search, Sparkles, X, Loader2 } from 'lucide-react';
import { API_BASE_URL } from '../../config/api';
import { toast } from 'react-toastify';

interface PendingEvent {
  id: string;
  title: string;
  partner: string;
  category: string;
  date: string;
  status: string;
  poster_image?: string;
  description?: string;
  [key: string]: any; // Allow additional properties
}

interface PromotedEvent {
  id: number;
  event_id: number;
  event_title: string;
  partner_name: string;
  start_date: string;
  end_date: string;
  days_count: number;
  total_cost: number;
  is_active: boolean;
  is_paid: boolean;
  views?: number;
  clicks?: number;
}

interface EventsSectionProps {}

interface EventStats {
  total_events: number;
  free_events: number;
  paid_events: number;
  multiday_events: number;
}

export default function EventsSection({}: EventsSectionProps) {
  const [pendingEvents, setPendingEvents] = React.useState<PendingEvent[]>([]);
  const [allEvents, setAllEvents] = React.useState<any[]>([]);
  const [promotedEvents, setPromotedEvents] = React.useState<PromotedEvent[]>([]);
  const [eventStats, setEventStats] = React.useState<EventStats | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [actionLoading, setActionLoading] = React.useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = React.useState<any | null>(null);
  const [categoryFilter, setCategoryFilter] = React.useState<string>('All');
  const [statusFilter, setStatusFilter] = React.useState<string>('all'); // all, pending, approved, rejected
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const [activeTab, setActiveTab] = React.useState<'all' | 'promoted'>('all');
  const [showPromoteModal, setShowPromoteModal] = React.useState(false);
  const [eventToPromote, setEventToPromote] = React.useState<any | null>(null);
  const [promoteDays, setPromoteDays] = React.useState(7);
  const [promoteStartDate, setPromoteStartDate] = React.useState('');
  const [promoteStartTime, setPromoteStartTime] = React.useState('');
  const [promoteEndDate, setPromoteEndDate] = React.useState('');
  const [promoteEndTime, setPromoteEndTime] = React.useState('');
  const [showApprovalModal, setShowApprovalModal] = React.useState(false);
  const [showRejectionModal, setShowRejectionModal] = React.useState(false);
  const [eventToApprove, setEventToApprove] = React.useState<any | null>(null);
  const [eventToReject, setEventToReject] = React.useState<any | null>(null);
  const [rejectionReason, setRejectionReason] = React.useState('');

  // Fetch event stats
  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const { API_BASE_URL } = await import('../../config/api');
        const { getToken } = await import('../../services/authService');

        const response = await fetch(`${API_BASE_URL}/api/admin/events/stats`, {
          headers: {
            'Content-Type': 'application/json',
            ...(getToken() && { Authorization: `Bearer ${getToken()}` }),
          },
        });
        
        if (!response.ok) {
          console.error('Failed to fetch event stats:', response.status, response.statusText);
          return;
        }
        
        const data = await response.json();
        console.log('Event stats loaded:', data); // Debug log
        setEventStats(data);
      } catch (error) {
        console.error('Failed to fetch event stats:', error);
        // Set default stats if fetch fails
        setEventStats({
          total_events: 0,
          free_events: 0,
          paid_events: 0,
          multiday_events: 0
        });
      }
    };

    fetchStats();
  }, []);

  React.useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { API_ENDPOINTS } = await import('../../config/api');
        const { getToken } = await import('../../services/authService');

        const statusParam = statusFilter === 'all' ? '' : `?status=${statusFilter}`;
        const response = await fetch(`${API_ENDPOINTS.admin.events}${statusParam}`, {
          headers: {
            'Content-Type': 'application/json',
            ...(getToken() && { Authorization: `Bearer ${getToken()}` }),
          },
        });
        const data = await response.json();
        if (response.ok) {
          const events = (data.events || []).map((e: any) => ({
            id: String(e.id),
            title: e.title,
            partner: e.partner?.business_name || 'N/A',
            category: e.category?.name || 'N/A',
            date: e.start_date ? new Date(e.start_date).toLocaleDateString() : 'TBD',
            status: e.status,
            poster_image: e.poster_image,
            description: e.description,
            is_promoted: e.is_promoted || false,
            promotion_id: e.promotion_id || null,
            fullEvent: e, // Store full event data
          }));
          setAllEvents(events);
          setPendingEvents(events.filter((e: any) => e.status === 'pending'));
        }
      } catch (error) {
        console.error('Failed to fetch events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [statusFilter]);

  // Fetch promoted events
  React.useEffect(() => {
    const fetchPromotedEvents = async () => {
      if (activeTab !== 'promoted') return;
      
      try {
        setLoading(true);
        const { API_BASE_URL } = await import('../../config/api');
        const { getToken } = await import('../../services/authService');

        const response = await fetch(`${API_BASE_URL}/api/admin/promoted-events`, {
          headers: {
            'Content-Type': 'application/json',
            ...(getToken() && { Authorization: `Bearer ${getToken()}` }),
          },
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('Error fetching promoted events:', errorData);
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Promoted events data:', data); // Debug log
        setPromotedEvents(data.promotions || []);
      } catch (error) {
        console.error('Failed to fetch promoted events:', error);
        setPromotedEvents([]);
        toast.error('Failed to fetch promoted events');
      } finally {
        setLoading(false);
      }
    };

    fetchPromotedEvents();
  }, [activeTab]);

  const handleApproveEvent = async (eventId: string) => {
    setActionLoading(eventId);
    try {
      const { API_ENDPOINTS } = await import('../../config/api');
      const { getToken } = await import('../../services/authService');

      const response = await fetch(API_ENDPOINTS.admin.approveEvent(Number(eventId)), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(getToken() && { Authorization: `Bearer ${getToken()}` }),
        },
      });

      const data = await response.json();
      if (response.ok) {
        // Refresh events list
        const fetchEvents = async () => {
          const statusParam = statusFilter === 'all' ? '' : `?status=${statusFilter}`;
          const eventsResponse = await fetch(`${API_ENDPOINTS.admin.events}${statusParam}`, {
            headers: {
              'Content-Type': 'application/json',
              ...(getToken() && { Authorization: `Bearer ${getToken()}` }),
            },
          });
          const eventsData = await eventsResponse.json();
          if (eventsResponse.ok) {
            const events = (eventsData.events || []).map((e: any) => ({
              id: String(e.id),
              title: e.title,
              partner: e.partner?.business_name || 'N/A',
              category: e.category?.name || 'N/A',
              date: e.start_date ? new Date(e.start_date).toLocaleDateString() : 'TBD',
              status: e.status,
              poster_image: e.poster_image,
              description: e.description,
              fullEvent: e,
            }));
            setAllEvents(events);
            setPendingEvents(events.filter((e: any) => e.status === 'pending'));
          }
        };
        fetchEvents();
        setShowApprovalModal(false);
        setEventToApprove(null);
        toast.success('Event approved successfully! Email sent to partner.', {
          position: 'top-right',
          autoClose: 3000,
        });
      } else {
        toast.error(data.error || 'Failed to approve event', {
          position: 'top-right',
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.error('Error approving event:', error);
      toast.error('Error approving event');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectEvent = async (eventId: string, reason: string) => {
    setActionLoading(eventId);
    try {
      const { API_ENDPOINTS } = await import('../../config/api');
      const { getToken } = await import('../../services/authService');

      const response = await fetch(API_ENDPOINTS.admin.rejectEvent(Number(eventId)), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(getToken() && { Authorization: `Bearer ${getToken()}` }),
        },
        body: JSON.stringify({ reason }),
      });

      const data = await response.json();
      if (response.ok) {
        // Refresh events list
        const fetchEvents = async () => {
          const statusParam = statusFilter === 'all' ? '' : `?status=${statusFilter}`;
          const eventsResponse = await fetch(`${API_ENDPOINTS.admin.events}${statusParam}`, {
            headers: {
              'Content-Type': 'application/json',
              ...(getToken() && { Authorization: `Bearer ${getToken()}` }),
            },
          });
          const eventsData = await eventsResponse.json();
          if (eventsResponse.ok) {
            const events = (eventsData.events || []).map((e: any) => ({
              id: String(e.id),
              title: e.title,
              partner: e.partner?.business_name || 'N/A',
              category: e.category?.name || 'N/A',
              date: e.start_date ? new Date(e.start_date).toLocaleDateString() : 'TBD',
              status: e.status,
              poster_image: e.poster_image,
              description: e.description,
              fullEvent: e,
            }));
            setAllEvents(events);
            setPendingEvents(events.filter((e: any) => e.status === 'pending'));
          }
        };
        fetchEvents();
        setShowRejectionModal(false);
        setEventToReject(null);
        setRejectionReason('');
        toast.info('Event rejected. Email sent to partner.', {
          position: 'top-right',
          autoClose: 3000,
        });
      } else {
        toast.error(data.error || 'Failed to reject event', {
          position: 'top-right',
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.error('Error rejecting event:', error);
      toast.error('Error rejecting event');
    } finally {
      setActionLoading(null);
    }
  };

  // Filter events based on status and category
  const displayEvents = statusFilter === 'all' ? allEvents : allEvents.filter(e => e.status === statusFilter);
  const categoryFiltered = categoryFilter === 'All'
    ? displayEvents
    : displayEvents.filter(e => e.category === categoryFilter);
  
  // Apply search filter
  const filteredEvents = searchQuery.trim() === ''
    ? categoryFiltered
    : categoryFiltered.filter(e =>
        e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.partner.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.category.toLowerCase().includes(searchQuery.toLowerCase())
      );

  // Get unique categories from all events
  const categories = Array.from(new Set(allEvents.map(e => e.category)));

  const handleUnpromoteEvent = async (eventId: string) => {
    setActionLoading(eventId);
    try {
      const { API_ENDPOINTS } = await import('../../config/api');
      const { getToken } = await import('../../services/authService');

      const response = await fetch(API_ENDPOINTS.admin.unpromoteEvent(Number(eventId)), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(getToken() && { Authorization: `Bearer ${getToken()}` }),
        },
      });

      const data = await response.json();
      if (response.ok) {
        toast.success('Promotion removed successfully!');
        // Refresh events list
        const { API_ENDPOINTS } = await import('../../config/api');
        const statusParam = statusFilter === 'all' ? '' : `?status=${statusFilter}`;
        const eventsResponse = await fetch(`${API_ENDPOINTS.admin.events}${statusParam}`, {
          headers: {
            'Content-Type': 'application/json',
            ...(getToken() && { Authorization: `Bearer ${getToken()}` }),
          },
        });
        const eventsData = await eventsResponse.json();
        if (eventsResponse.ok) {
          const events = (eventsData.events || []).map((e: any) => ({
            id: String(e.id),
            title: e.title,
            partner: e.partner?.business_name || 'N/A',
            category: e.category?.name || 'N/A',
            date: e.start_date ? new Date(e.start_date).toLocaleDateString() : 'TBD',
            status: e.status,
            poster_image: e.poster_image,
            description: e.description,
            is_promoted: e.is_promoted || false,
            promotion_id: e.promotion_id || null,
            fullEvent: e,
          }));
          setAllEvents(events);
        }
      } else {
        toast.error(data.error || 'Failed to remove promotion');
      }
    } catch (error) {
      console.error('Error removing promotion:', error);
      toast.error('Failed to remove promotion');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div>
      {/* Event Statistics Cards */}
      {activeTab === 'all' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium mb-1">Total Events</p>
                <p className="text-3xl font-bold">{eventStats?.total_events || 0}</p>
              </div>
              <div className="bg-white/20 rounded-xl p-3">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium mb-1">Free Events</p>
                <p className="text-3xl font-bold">{eventStats?.free_events || 0}</p>
              </div>
              <div className="bg-white/20 rounded-xl p-3">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium mb-1">Paid Events</p>
                <p className="text-3xl font-bold">{eventStats?.paid_events || 0}</p>
              </div>
              <div className="bg-white/20 rounded-xl p-3">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium mb-1">Multiday Events</p>
                <p className="text-3xl font-bold">{eventStats?.multiday_events || 0}</p>
              </div>
              <div className="bg-white/20 rounded-xl p-3">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header with Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Event Management</h2>
          <span className="px-3 py-1 bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40 text-blue-700 dark:text-blue-300 rounded-full text-sm font-semibold border border-blue-300 dark:border-blue-700">
            {allEvents.length}
          </span>
        </div>
        
        {/* Search Bar */}
        <div className="w-full sm:w-96">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#27aae2] focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 font-semibold transition-colors border-b-2 ${
              activeTab === 'all'
                ? 'border-[#27aae2] text-[#27aae2]'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            All Events
          </button>
          <button
            onClick={() => setActiveTab('promoted')}
            className={`px-4 py-2 font-semibold transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === 'promoted'
                ? 'border-[#27aae2] text-[#27aae2]'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Promoted Events
          </button>
        </div>
      </div>
      
      {/* Status and Category Filter - Only for All Events tab */}
      {activeTab === 'all' && (
        <div className="mb-6 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label htmlFor="status-filter" className="font-semibold text-gray-700 dark:text-gray-300">Status:</label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="all">All Events</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="category-filter" className="font-semibold text-gray-700 dark:text-gray-300">Category:</label>
            <select
              id="category-filter"
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="All">All</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* All Events Tab Content */}
      {activeTab === 'all' && (
        <>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No events found</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredEvents.map((event) => (
          <div
            key={event.id}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-lg transition-all overflow-hidden border border-gray-100 dark:border-gray-700 cursor-pointer group"
            onClick={(e) => {
              // Only open modal if the card itself is clicked, not a button inside
              if ((e.target as HTMLElement).tagName !== 'BUTTON' && (e.target as HTMLElement).tagName !== 'SPAN') {
                setSelectedEvent(event);
              }
            }}
          >
            {/* Event Image */}
            <div className="relative h-48 overflow-hidden">
              {event?.poster_image || event?.fullEvent?.poster_image ? (
                <img
                  src={
                    event.poster_image || event.fullEvent?.poster_image
                      ? (() => {
                          const imgPath = event.poster_image || event.fullEvent?.poster_image;
                          if (imgPath.startsWith('http')) return imgPath;
                          return `${API_BASE_URL}${imgPath.startsWith('/') ? '' : '/'}${imgPath}`;
                        })()
                      : 'https://images.pexels.com/photos/2747449/pexels-photo-2747449.jpeg?auto=compress&cs=tinysrgb&w=800'
                  }
                  alt={event.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center">
                  <svg className="w-16 h-16 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
              
              {/* Status Badge */}
              <div className="absolute top-3 right-3">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm ${
                  event.status === 'approved' ? 'bg-green-500/90 text-white' :
                  event.status === 'rejected' ? 'bg-red-500/90 text-white' :
                  'bg-orange-500/90 text-white'
                }`}>
                  {event.status?.toUpperCase() || 'PENDING'}
                </span>
              </div>
            </div>

            {/* Event Content */}
            <div className="p-4">
              {/* Title */}
              <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-[#27aae2] transition-colors">
                {event.title}
              </h3>

              {/* Category Badge */}
              <div className="mb-3">
                <span className="inline-block px-2.5 py-1 bg-[#27aae2]/10 text-[#27aae2] rounded-full text-xs font-semibold">
                  {event.category}
                </span>
              </div>

              {/* Event Details */}
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="truncate">{event.partner}</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>{event.date}</span>
                </div>
              </div>

              {/* Stats Section - Tickets, Likes, Attendees */}
              <div className="space-y-2 mb-4">
                {/* Tickets Progress (for paid events with tickets) */}
                {!event.fullEvent?.is_free && event.fullEvent?.ticket_types && event.fullEvent.ticket_types.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                        </svg>
                        Tickets
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {event.fullEvent?.total_tickets_sold || 0}/{event.fullEvent?.ticket_types?.reduce((sum: number, tt: any) => sum + (tt.quantity_total || 0), 0) || 0}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-[#27aae2] to-blue-500 h-full rounded-full transition-all duration-300"
                        style={{ 
                          width: `${event.fullEvent?.ticket_types?.reduce((sum: number, tt: any) => sum + (tt.quantity_total || 0), 0) > 0 
                            ? ((event.fullEvent?.total_tickets_sold || 0) / event.fullEvent?.ticket_types?.reduce((sum: number, tt: any) => sum + (tt.quantity_total || 0), 0) * 100)
                            : 0}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Likes and Attendees */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-3 text-xs">
                    {/* Likes */}
                    <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                      <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                      </svg>
                      <span className="font-medium">{event.fullEvent?.likes_count || 0}</span>
                    </div>

                    {/* Attendees */}
                    <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span className="font-medium">{event.fullEvent?.attendee_count || 0}</span>
                    </div>
                  </div>

                  {/* Event Type Badge */}
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    event.fullEvent?.is_free 
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                  }`}>
                    {event.fullEvent?.is_free ? 'FREE' : 'PAID'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              {event.status === 'pending' && (
                <div className="flex gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <button
                    className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center space-x-1 disabled:opacity-50 text-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEventToApprove(event);
                      setShowApprovalModal(true);
                    }}
                    disabled={loading || actionLoading === event.id}
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Approve</span>
                  </button>
                  <button
                    className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center justify-center space-x-1 disabled:opacity-50 text-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEventToReject(event);
                      setShowRejectionModal(true);
                    }}
                    disabled={loading || actionLoading === event.id}
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject</span>
                  </button>
                </div>
              )}

              {/* Promote/Unpromote Button for Approved Events */}
              {event.status === 'approved' && (
                <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                  {event.is_promoted ? (
                    <button
                      className="w-full px-3 py-2 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-lg font-medium hover:from-red-700 hover:to-red-600 transition-all flex items-center justify-center space-x-1 text-sm"
                      onClick={async (e) => {
                        e.stopPropagation();
                        await handleUnpromoteEvent(event.id);
                      }}
                      disabled={actionLoading === event.id}
                    >
                      <X className="w-4 h-4" />
                      <span>{actionLoading === event.id ? 'Removing...' : 'Remove Promotion'}</span>
                    </button>
                  ) : (
                    <button
                      className="w-full px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg font-medium hover:from-blue-700 hover:to-blue-600 transition-all flex items-center justify-center space-x-1 text-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEventToPromote(event.fullEvent || event);
                        setShowPromoteModal(true);
                        const now = new Date();
                        const dateStr = now.toISOString().split('T')[0];
                        const timeStr = now.toTimeString().split(' ')[0].slice(0, 5);
                        setPromoteStartDate(dateStr);
                        setPromoteStartTime(timeStr);
                        // Set end date to 7 days from now
                        const endDate = new Date(now);
                        endDate.setDate(endDate.getDate() + 7);
                        setPromoteEndDate(endDate.toISOString().split('T')[0]);
                        setPromoteEndTime(timeStr);
                      }}
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Promote Event</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
          ))}
        </div>
          )}
        </>
      )}

      {/* Promoted Events Tab Content */}
      {activeTab === 'promoted' && (
        <div>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : promotedEvents.length === 0 ? (
            <div className="text-center py-12">
              <Sparkles className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              <p className="text-gray-500 dark:text-gray-400 text-lg">No promoted events yet</p>
              <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">Promoted events will appear here</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Event
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Partner
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Revenue
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Reach
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {promotedEvents.map((promo) => {
                    const now = new Date();
                    const startDate = new Date(promo.start_date);
                    const endDate = new Date(promo.end_date);
                    const isActive = now >= startDate && now <= endDate && promo.is_active;
                    const isPast = now > endDate;
                    const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
                    
                    return (
                      <tr key={promo.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {promo.event_title}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                          {promo.partner_name}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 dark:text-white font-medium">
                            {promo.days_count} {promo.days_count === 1 ? 'day' : 'days'}
                          </div>
                          {isActive && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} left
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-semibold text-gray-900 dark:text-white">
                            KES {promo.total_cost.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            KES {(promo.total_cost / promo.days_count).toFixed(0)}/day
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-700 dark:text-gray-300">
                            <div className="flex items-center gap-1">
                              <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              {promo.views || 0} views
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                              </svg>
                              {promo.clicks || 0} clicks
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            isActive
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : isPast
                              ? 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                          }`}>
                            {isActive ? 'Active' : isPast ? 'Ended' : 'Scheduled'}
                          </span>
                          {promo.is_paid && (
                            <div className="mt-1">
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                                Paid
                              </span>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Promote Event Modal */}
      {showPromoteModal && eventToPromote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 z-10 bg-gradient-to-r from-[#27aae2] to-[#1e8bb8] px-6 py-4 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-6 h-6 text-white" />
                  <h2 className="text-xl font-bold text-white">Promote Event</h2>
                </div>
                <button
                  onClick={() => {
                    setShowPromoteModal(false);
                    setEventToPromote(null);
                    setPromoteDays(7);
                    setPromoteStartDate('');
                    setPromoteStartTime('');
                    setPromoteEndDate('');
                    setPromoteEndTime('');
                  }}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Event Info */}
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-4 border border-blue-100 dark:border-gray-600">
                <h3 className="font-bold text-gray-900 dark:text-white mb-1">{eventToPromote.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  by {typeof eventToPromote.partner === 'string' 
                    ? eventToPromote.partner 
                    : eventToPromote.partner?.business_name || eventToPromote.fullEvent?.partner?.business_name || 'N/A'}
                </p>
              </div>

              {/* Promotion Settings */}
              <div className="space-y-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#27aae2]" />
                    Promotion Duration (Quick Select)
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                    {[1, 3, 7, 14, 30].map((days) => (
                      <button
                        key={days}
                        onClick={() => {
                          setPromoteDays(days);
                          if (promoteStartDate) {
                            const start = new Date(`${promoteStartDate}T${promoteStartTime || '00:00'}`);
                            const end = new Date(start);
                            end.setDate(end.getDate() + days);
                            setPromoteEndDate(end.toISOString().split('T')[0]);
                            setPromoteEndTime(promoteStartTime || '23:59');
                          }
                        }}
                        className={`px-3 py-2 rounded-lg font-medium text-sm transition-all ${
                          promoteDays === days
                            ? 'bg-gradient-to-r from-[#27aae2] to-[#1e8bb8] text-white shadow-lg'
                            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 hover:border-[#27aae2]'
                        }`}
                      >
                        {days} {days === 1 ? 'Day' : 'Days'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                    <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-3 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Promotion Start
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                          Date
                        </label>
                        <input
                          type="date"
                          value={promoteStartDate}
                          onChange={(e) => {
                            setPromoteStartDate(e.target.value);
                            if (e.target.value && promoteDays) {
                              const start = new Date(`${e.target.value}T${promoteStartTime || '00:00'}`);
                              const end = new Date(start);
                              end.setDate(end.getDate() + promoteDays);
                              setPromoteEndDate(end.toISOString().split('T')[0]);
                            }
                          }}
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                          Time
                        </label>
                        <input
                          type="time"
                          value={promoteStartTime}
                          onChange={(e) => {
                            setPromoteStartTime(e.target.value);
                            if (promoteStartDate && promoteDays) {
                              const start = new Date(`${promoteStartDate}T${e.target.value}`);
                              const end = new Date(start);
                              end.setDate(end.getDate() + promoteDays);
                              setPromoteEndDate(end.toISOString().split('T')[0]);
                              setPromoteEndTime(e.target.value);
                            }
                          }}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <svg className="w-4 h-4 text-[#27aae2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Promotion End
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                          Date
                        </label>
                        <input
                          type="date"
                          value={promoteEndDate}
                          onChange={(e) => {
                            setPromoteEndDate(e.target.value);
                            if (e.target.value && promoteStartDate) {
                              const start = new Date(`${promoteStartDate}T${promoteStartTime || '00:00'}`);
                              const end = new Date(`${e.target.value}T${promoteEndTime || '23:59'}`);
                              const diffTime = Math.abs(end.getTime() - start.getTime());
                              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                              setPromoteDays(diffDays);
                            }
                          }}
                          min={promoteStartDate || new Date().toISOString().split('T')[0]}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#27aae2] text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                          Time
                        </label>
                        <input
                          type="time"
                          value={promoteEndTime}
                          onChange={(e) => setPromoteEndTime(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#27aae2] text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl p-5 border border-gray-200 dark:border-gray-600 space-y-3">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Promotion Summary</h4>
                <div className="grid grid-cols-1 gap-4">
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Duration</p>
                    <p className="font-bold text-gray-900 dark:text-white">{promoteDays} {promoteDays === 1 ? 'day' : 'days'}</p>
                  </div>
                </div>
                {promoteStartDate && promoteEndDate && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Promotion Period</p>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">
                      {new Date(promoteStartDate).toLocaleDateString()} {promoteStartTime && `at ${promoteStartTime}`} → {new Date(promoteEndDate).toLocaleDateString()} {promoteEndTime && `at ${promoteEndTime}`}
                    </p>
                  </div>
                )}
                <div className="bg-gradient-to-r from-[#27aae2] to-[#1e8bb8] rounded-lg p-4 border border-[#1e8bb8]">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-white">Promotion Duration:</span>
                    <span className="font-bold text-white text-xl">{promoteDays} {promoteDays === 1 ? 'Day' : 'Days'}</span>
                  </div>
                  <p className="text-xs text-blue-100 mt-1">Admin promotion - Free</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowPromoteModal(false);
                    setEventToPromote(null);
                    setPromoteDays(7);
                    setPromoteStartDate('');
                    setPromoteStartTime('');
                    setPromoteEndDate('');
                    setPromoteEndTime('');
                  }}
                  className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    // Handle promotion
                    try {
                      setActionLoading(eventToPromote.id);
                      const { API_BASE_URL } = await import('../../config/api');
                      const { getToken } = await import('../../services/authService');

                      let startDateTime: Date;
                      let endDateTime: Date;
                      
                      if (promoteStartDate && promoteStartTime && promoteEndDate && promoteEndTime) {
                        startDateTime = new Date(`${promoteStartDate}T${promoteStartTime}`);
                        endDateTime = new Date(`${promoteEndDate}T${promoteEndTime}`);
                        
                        if (startDateTime < new Date()) {
                          toast.error('Start date/time cannot be in the past');
                          setActionLoading(null);
                          return;
                        }
                        
                        if (endDateTime <= startDateTime) {
                          toast.error('End date/time must be after start date/time');
                          setActionLoading(null);
                          return;
                        }
                        
                        // Calculate actual days
                        const diffTime = Math.abs(endDateTime.getTime() - startDateTime.getTime());
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        setPromoteDays(diffDays);
                      } else if (promoteStartDate && promoteStartTime) {
                        startDateTime = new Date(`${promoteStartDate}T${promoteStartTime}`);
                        if (startDateTime < new Date()) {
                          toast.error('Start date/time cannot be in the past');
                          setActionLoading(null);
                          return;
                        }
                        endDateTime = new Date(startDateTime);
                        endDateTime.setDate(endDateTime.getDate() + promoteDays);
                        setPromoteEndDate(endDateTime.toISOString().split('T')[0]);
                        setPromoteEndTime(promoteStartTime);
                      } else {
                        startDateTime = new Date();
                        endDateTime = new Date();
                        endDateTime.setDate(endDateTime.getDate() + promoteDays);
                        const dateStr = startDateTime.toISOString().split('T')[0];
                        const timeStr = startDateTime.toTimeString().split(' ')[0].slice(0, 5);
                        setPromoteStartDate(dateStr);
                        setPromoteStartTime(timeStr);
                        setPromoteEndDate(endDateTime.toISOString().split('T')[0]);
                        setPromoteEndTime(timeStr);
                      }

                      const response = await fetch(`${API_BASE_URL}/api/admin/events/${eventToPromote.id}/promote`, {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          ...(getToken() && { Authorization: `Bearer ${getToken()}` }),
                        },
                        body: JSON.stringify({
                          days_count: promoteDays,
                          start_date: startDateTime.toISOString(),
                          end_date: endDateTime.toISOString(),
                          is_free: true, // Admin promotions are free
                        }),
                      });

                      const data = await response.json();
                      
                      if (response.ok) {
                        toast.success('Event promoted successfully!');
                        setShowPromoteModal(false);
                        setEventToPromote(null);
                        setPromoteDays(7);
                        setPromoteStartDate('');
                        setPromoteStartTime('');
                        setPromoteEndDate('');
                        setPromoteEndTime('');
                        // Refresh promoted events if on that tab
                        if (activeTab === 'promoted') {
                          const promoResponse = await fetch(`${API_BASE_URL}/api/admin/promoted-events`, {
                            headers: {
                              'Content-Type': 'application/json',
                              ...(getToken() && { Authorization: `Bearer ${getToken()}` }),
                            },
                          });
                          const promoData = await promoResponse.json();
                          if (promoResponse.ok) {
                            setPromotedEvents(promoData.promotions || []);
                          }
                        }
                      } else {
                        toast.error(data.error || 'Failed to promote event');
                      }
                    } catch (error) {
                      console.error('Error promoting event:', error);
                      toast.error('Failed to promote event');
                    } finally {
                      setActionLoading(null);
                    }
                  }}
                  disabled={actionLoading === eventToPromote.id}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-[#27aae2] to-[#1e8bb8] text-white rounded-lg font-semibold hover:from-[#1e8bb8] hover:to-[#27aae2] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {actionLoading === eventToPromote.id ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Promote Event
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Approval Confirmation Modal */}
      {showApprovalModal && eventToApprove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full">
            <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-white" />
                  <h2 className="text-xl font-bold text-white">Approve Event</h2>
                </div>
                <button
                  onClick={() => {
                    setShowApprovalModal(false);
                    setEventToApprove(null);
                  }}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">{eventToApprove.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  by {eventToApprove.partner}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {eventToApprove.category} • {eventToApprove.date}
                </p>
              </div>

              <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl p-4 border border-gray-200 dark:border-gray-600">
                <p className="text-gray-700 dark:text-gray-300 text-center">
                  Are you sure you want to approve this event?
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-2">
                  An approval email will be sent to the partner.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowApprovalModal(false);
                    setEventToApprove(null);
                  }}
                  className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    await handleApproveEvent(eventToApprove.id);
                  }}
                  disabled={actionLoading === eventToApprove.id}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg font-semibold hover:from-green-700 hover:to-green-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {actionLoading === eventToApprove.id ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Approving...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Approve Event
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Confirmation Modal */}
      {showRejectionModal && eventToReject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full">
            <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <XCircle className="w-6 h-6 text-white" />
                  <h2 className="text-xl font-bold text-white">Reject Event</h2>
                </div>
                <button
                  onClick={() => {
                    setShowRejectionModal(false);
                    setEventToReject(null);
                    setRejectionReason('');
                  }}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 border border-red-200 dark:border-red-800">
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">{eventToReject.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  by {eventToReject.partner}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {eventToReject.category} • {eventToReject.date}
                </p>
              </div>

              <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl p-4 border border-gray-200 dark:border-gray-600">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Rejection Reason (Optional)
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Enter reason for rejection..."
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 min-h-[100px] resize-none"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  This reason will be sent to the partner via email.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowRejectionModal(false);
                    setEventToReject(null);
                    setRejectionReason('');
                  }}
                  className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    const reason = rejectionReason.trim() || 'Event does not meet requirements';
                    await handleRejectEvent(eventToReject.id, reason);
                  }}
                  disabled={actionLoading === eventToReject.id}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-lg font-semibold hover:from-red-700 hover:to-red-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {actionLoading === eventToReject.id ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Rejecting...
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5" />
                      Reject Event
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Event Details Modal (Redesigned for Approval) */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4">
          <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
            {/* Header with gradient background */}
            <div className="sticky top-0 z-10 bg-gradient-to-r from-[#27aae2] to-[#1e8bb8] px-6 py-4 rounded-t-2xl">
              <button
                className="absolute top-4 right-4 text-white hover:text-gray-200 text-5xl font-bold transition-colors w-10 h-10 flex items-center justify-center"
                onClick={() => setSelectedEvent(null)}
              >
                &times;
              </button>
              <h2 className="text-2xl font-bold text-white">Event Details</h2>
            </div>

            <div className="p-6">
              <div className="space-y-6">
                {/* Event Image Card */}
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-4 border border-blue-100 dark:border-gray-600">
                  {selectedEvent?.poster_image || selectedEvent?.fullEvent?.poster_image ? (
                    <img
                      src={
                        selectedEvent.poster_image || selectedEvent.fullEvent?.poster_image
                          ? (() => {
                              const imgPath = selectedEvent.poster_image || selectedEvent.fullEvent?.poster_image;
                              if (imgPath.startsWith('http')) return imgPath;
                              return `${API_BASE_URL}${imgPath.startsWith('/') ? '' : '/'}${imgPath}`;
                            })()
                          : 'https://images.pexels.com/photos/2747449/pexels-photo-2747449.jpeg?auto=compress&cs=tinysrgb&w=800'
                      }
                      alt={selectedEvent.title}
                      className="w-full h-64 sm:h-80 object-cover rounded-lg shadow-lg"
                    />
                  ) : (
                    <div className="w-full h-64 sm:h-80 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                      <span className="text-gray-400 dark:text-gray-500">No image available</span>
                    </div>
                  )}
                </div>

                {/* Event Title & Status Card */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-2xl text-gray-900 dark:text-white mb-3">
                        {selectedEvent.title}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          selectedEvent.status === 'approved' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                          selectedEvent.status === 'rejected' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' :
                          'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300'
                        }`}>
                          {selectedEvent.status?.toUpperCase() || 'PENDING'}
                        </span>
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 rounded-full text-xs font-semibold">
                          {selectedEvent.category}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Event Information Card */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                  <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-[#27aae2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Event Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Partner</p>
                      <p className="text-sm text-gray-900 dark:text-white font-medium">
                        {selectedEvent.partner}
                      </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Event Date</p>
                      <p className="text-sm text-gray-900 dark:text-white font-medium">
                        {selectedEvent.date}
                      </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Category</p>
                      <p className="text-sm text-gray-900 dark:text-white font-medium">
                        {selectedEvent.category}
                      </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Attendee Limit</p>
                      <p className="text-sm text-gray-900 dark:text-white font-medium">
                        {selectedEvent?.fullEvent?.attendee_limit || 'Unlimited'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Description Card */}
                {(selectedEvent?.description || selectedEvent?.fullEvent?.description) && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                    <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <svg className="w-5 h-5 text-[#27aae2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                      </svg>
                      Description
                    </h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap break-words overflow-wrap-anywhere">
                      {selectedEvent?.description || selectedEvent?.fullEvent?.description || 'No description provided'}
                    </p>
                  </div>
                )}

                {/* Ticket Types Card */}
                {selectedEvent?.fullEvent?.ticket_types && selectedEvent.fullEvent.ticket_types.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                    <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5 text-[#27aae2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                      </svg>
                      Ticket Types
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {selectedEvent.fullEvent.ticket_types.map((ticket: any, idx: number) => (
                        <div key={idx} className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                          <p className="font-semibold text-gray-900 dark:text-white mb-1">{ticket.name}</p>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Price:</span>
                            <span className="font-bold text-green-600 dark:text-green-400">
                              {ticket.price > 0 ? `KES ${ticket.price.toLocaleString()}` : 'Free'}
                            </span>
                          </div>
                          {ticket.quantity_total && (
                            <div className="flex items-center justify-between text-sm mt-1">
                              <span className="text-gray-600 dark:text-gray-400">Available:</span>
                              <span className="font-medium text-gray-900 dark:text-white">{ticket.quantity_total}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Hosts Card */}
                {selectedEvent?.fullEvent?.hosts && selectedEvent.fullEvent.hosts.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                    <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5 text-[#27aae2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Event Hosts
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedEvent.fullEvent.hosts.map((host: any, idx: number) => (
                        <span key={idx} className="px-3 py-1.5 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 dark:from-purple-900/40 dark:to-pink-900/40 dark:text-purple-300 rounded-full text-sm font-medium border border-purple-200 dark:border-purple-800">
                          @{host.user?.email?.split('@')[0] || 'host'} {host.user?.is_verified && '✓'}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Promo Codes Card */}
                {selectedEvent?.fullEvent?.promo_codes && selectedEvent.fullEvent.promo_codes.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                    <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5 text-[#27aae2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      Promo Codes
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {selectedEvent.fullEvent.promo_codes.map((promo: any, idx: number) => (
                        <div key={idx} className="bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
                          <p className="font-bold text-gray-900 dark:text-white mb-1">{promo.code}</p>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Discount:</span>
                            <span className="font-bold text-orange-600 dark:text-orange-400">
                              {promo.discount_type === 'percentage' ? `${promo.discount_value}%` : `KES ${promo.discount_value}`} off
                            </span>
                          </div>
                          {promo.max_uses && (
                            <div className="flex items-center justify-between text-sm mt-1">
                              <span className="text-gray-600 dark:text-gray-400">Max uses:</span>
                              <span className="font-medium text-gray-900 dark:text-white">{promo.max_uses}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Location Card */}
                {(selectedEvent?.fullEvent?.venue_name || selectedEvent?.fullEvent?.online_link) && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                    <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5 text-[#27aae2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Location
                    </h4>
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                      {selectedEvent.fullEvent.venue_name && (
                        <p className="text-sm text-gray-900 dark:text-white font-medium mb-2">
                          📍 {selectedEvent.fullEvent.venue_name}
                        </p>
                      )}
                      {selectedEvent.fullEvent.online_link && (
                        <a 
                          href={selectedEvent.fullEvent.online_link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-[#27aae2] hover:underline break-all"
                        >
                          🔗 {selectedEvent.fullEvent.online_link}
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons for Pending Events */}
                {selectedEvent.status === 'pending' && (
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6 border border-gray-200 dark:border-gray-600">
                    <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-4 text-center">Review Event</h4>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <button
                        className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg font-semibold hover:from-green-700 hover:to-green-600 transition-all flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl disabled:opacity-50"
                        onClick={async () => {
                          await handleApproveEvent(selectedEvent.id);
                          setSelectedEvent(null);
                        }}
                        disabled={actionLoading === selectedEvent.id}
                      >
                        <CheckCircle className="w-5 h-5" />
                        <span>{actionLoading === selectedEvent.id ? 'Processing...' : 'Approve Event'}</span>
                      </button>
                      <button
                        className="px-8 py-3 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-lg font-semibold hover:from-red-700 hover:to-red-600 transition-all flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl disabled:opacity-50"
                        onClick={async () => {
                          await handleRejectEvent(selectedEvent.id);
                          setSelectedEvent(null);
                        }}
                        disabled={actionLoading === selectedEvent.id}
                      >
                        <XCircle className="w-5 h-5" />
                        <span>{actionLoading === selectedEvent.id ? 'Processing...' : 'Reject Event'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
