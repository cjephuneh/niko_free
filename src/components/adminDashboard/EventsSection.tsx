import React from 'react';
import { CheckCircle, XCircle, Search } from 'lucide-react';
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

interface EventsSectionProps {}

export default function EventsSection({}: EventsSectionProps) {
  const [pendingEvents, setPendingEvents] = React.useState<PendingEvent[]>([]);
  const [allEvents, setAllEvents] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [actionLoading, setActionLoading] = React.useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = React.useState<any | null>(null);
  const [categoryFilter, setCategoryFilter] = React.useState<string>('All');
  const [statusFilter, setStatusFilter] = React.useState<string>('all'); // all, pending, approved, rejected
  const [searchQuery, setSearchQuery] = React.useState<string>('');

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
        alert('Event approved successfully. Email sent to partner.');
        toast.success('Event approved successfully! Email sent to partner.', {
          position: 'top-right',
          autoClose: 3000,
        });
      } else {
        alert(data.error || 'Failed to approve event');
        toast.error(data.error || 'Failed to approve event', {
          position: 'top-right',
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.error('Error approving event:', error);
      alert('Error approving event');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectEvent = async (eventId: string) => {
    const reason = prompt('Enter rejection reason (optional):') || 'Event does not meet requirements';
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
        alert('Event rejected. Email sent to partner.');
        toast.info('Event rejected. Email sent to partner.', {
          position: 'top-right',
          autoClose: 3000,
        });
      } else {
        alert(data.error || 'Failed to reject event');
        toast.error(data.error || 'Failed to reject event', {
          position: 'top-right',
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.error('Error rejecting event:', error);
      alert('Error rejecting event');
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

  return (
    <div>
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
      
      {/* Status and Category Filter */}
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
      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading...</div>
      ) : filteredEvents.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No events found</div>
      ) : (
        <div className="space-y-4">
          {filteredEvents.map((event) => (
          <div
            key={event.id}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-lg transition-all p-6 border border-gray-100 dark:border-gray-700 cursor-pointer"
            onClick={(e) => {
              // Only open modal if the card itself is clicked, not a button inside
              if ((e.target as HTMLElement).tagName !== 'BUTTON' && (e.target as HTMLElement).tagName !== 'SPAN') {
                setSelectedEvent(event);
              }
            }}
          >
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{event.title}</h3>
                  <span className="px-3 py-1 bg-[#27aae2]/20 text-[#27aae2] rounded-full text-xs font-semibold">
                    {event.category}
                  </span>
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <span>By: {event.partner}</span>
                  <span>Date: {event.date}</span>
                </div>
              </div>
              {event.status === 'pending' && (
                <div className="flex gap-2">
                  <button
                    className="px-6 py-2.5 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
                    onClick={async (e) => {
                      e.stopPropagation();
                      await handleApproveEvent(event.id);
                    }}
                    disabled={loading || actionLoading === event.id}
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>{actionLoading === event.id ? 'Processing...' : 'Approve'}</span>
                  </button>
                  <button
                    className="px-6 py-2.5 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
                    onClick={async (e) => {
                      e.stopPropagation();
                      await handleRejectEvent(event.id);
                    }}
                    disabled={loading || actionLoading === event.id}
                  >
                    <XCircle className="w-4 h-4" />
                    <span>{actionLoading === event.id ? 'Processing...' : 'Reject'}</span>
                  </button>
                </div>
              )}
              {event.status === 'approved' && (
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                  APPROVED
                </span>
              )}
              {event.status === 'rejected' && (
                <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                  REJECTED
                </span>
              )}
            </div>
          </div>
          ))}
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
