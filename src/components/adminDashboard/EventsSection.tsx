import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

interface PendingEvent {
  id: string;
  title: string;
  partner: string;
  category: string;
  date: string;
  status: string;
}

interface EventsSectionProps {}

export default function EventsSection({}: EventsSectionProps) {
  const [pendingEvents, setPendingEvents] = React.useState<PendingEvent[]>([]);
  const [allEvents, setAllEvents] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [actionLoading, setActionLoading] = React.useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = React.useState<PendingEvent | null>(null);
  const [categoryFilter, setCategoryFilter] = React.useState<string>('All');
  const [statusFilter, setStatusFilter] = React.useState<string>('all'); // all, pending, approved, rejected

  React.useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { API_BASE_URL, API_ENDPOINTS } = await import('../../config/api');
        const { getToken } = await import('../../services/authService');

        const statusParam = statusFilter === 'all' ? '' : `?status=${statusFilter}`;
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.admin.events}${statusParam}`, {
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
            ...e, // Include full event data
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
      const { API_BASE_URL, API_ENDPOINTS } = await import('../../config/api');
      const { getToken } = await import('../../services/authService');

      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.admin.approveEvent(Number(eventId))}`, {
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
          const eventsResponse = await fetch(`${API_BASE_URL}${API_ENDPOINTS.admin.events}${statusParam}`, {
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
              ...e,
            }));
            setAllEvents(events);
            setPendingEvents(events.filter((e: any) => e.status === 'pending'));
          }
        };
        fetchEvents();
        alert('Event approved successfully. Email sent to partner.');
      } else {
        alert(data.error || 'Failed to approve event');
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
      const { API_BASE_URL, API_ENDPOINTS } = await import('../../config/api');
      const { getToken } = await import('../../services/authService');

      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.admin.rejectEvent(Number(eventId))}`, {
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
          const eventsResponse = await fetch(`${API_BASE_URL}${API_ENDPOINTS.admin.events}${statusParam}`, {
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
              ...e,
            }));
            setAllEvents(events);
            setPendingEvents(events.filter((e: any) => e.status === 'pending'));
          }
        };
        fetchEvents();
        alert('Event rejected. Email sent to partner.');
      } else {
        alert(data.error || 'Failed to reject event');
      }
    } catch (error) {
      console.error('Error rejecting event:', error);
      alert('Error rejecting event');
    } finally {
      setActionLoading(null);
    }
  };

  // Get unique categories
  const categories = Array.from(new Set(pendingEvents.map(e => e.category)));

  // Filter events by category
  const filteredEvents = categoryFilter === 'All'
    ? pendingEvents
    : pendingEvents.filter(e => e.category === categoryFilter);

  // Filter events based on status and category
  const displayEvents = statusFilter === 'all' ? allEvents : allEvents.filter(e => e.status === statusFilter);
  const filteredEvents = categoryFilter === 'All'
    ? displayEvents
    : displayEvents.filter(e => e.category === categoryFilter);

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Event Management</h2>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl p-8 max-w-2xl w-full relative overflow-y-auto max-h-[90vh]">
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white text-2xl font-bold"
              onClick={() => setSelectedEvent(null)}
            >
              &times;
            </button>
            {/* Event Image - full width */}
            <div className="w-full mb-6">
              <img
                src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80"
                alt="Event"
                className="w-full h-56 sm:h-72 object-cover rounded-xl border border-gray-200 dark:border-gray-800"
              />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Event Details for Approval</h2>
            <div className="space-y-6">
              {/* Event Name & Status */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 gap-2">
                <div className="flex-1">
                  <p className="font-semibold text-xl text-gray-900 dark:text-white mb-1">{selectedEvent.title}</p>
                  <span className="text-xs px-2 py-1 rounded bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 font-semibold mr-2">{selectedEvent.status?.toUpperCase() || 'PENDING'}</span>
                  <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium mr-2">{selectedEvent.category}</span>
                </div>
              </div>

              {/* Category & Partner */}
              <div>
                <p className="font-semibold mb-1 text-gray-900 dark:text-white">Category:</p>
                <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium mr-2">{selectedEvent.category}</span>
                <p className="font-semibold mb-1 mt-2 text-gray-900 dark:text-white">Partner:</p>
                <span className="inline-block px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-xs font-medium mr-2">{selectedEvent.partner}</span>
              </div>

              {/* Date & Time */}
              <div>
                <p className="font-semibold mb-1 text-gray-900 dark:text-white">Date & Time:</p>
                <span className="inline-block px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-xs font-medium mr-2">{selectedEvent.date}</span>
              </div>

              {/* Description (mocked for demo) */}
              <div>
                <p className="font-semibold mb-1 text-gray-900 dark:text-white">Description:</p>
                <span className="text-sm text-gray-700 dark:text-gray-300">This is a sample event description. The real description will be shown here.</span>
              </div>

              {/* Attendee Limit (mocked for demo) */}
              <div>
                <p className="font-semibold mb-1 text-gray-900 dark:text-white">Attendee Limit:</p>
                <span className="text-sm text-gray-700 dark:text-gray-300">Unlimited</span>
              </div>

              {/* Ticket Types (mocked for demo) */}
              <div>
                <p className="font-semibold mb-1 text-gray-900 dark:text-white">Ticket Types:</p>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-block px-3 py-1 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 rounded-full text-xs font-medium">Regular - $10</span>
                  <span className="inline-block px-3 py-1 bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300 rounded-full text-xs font-medium">VIP - $25</span>
                </div>
              </div>

              {/* Hosts (mocked for demo) */}
              <div>
                <p className="font-semibold mb-1 text-gray-900 dark:text-white">Hosts:</p>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-block px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs font-medium">@annalane (Verified)</span>
                  <span className="inline-block px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs font-medium">@victormuli (Verified)</span>
                </div>
              </div>

              {/* Promo Codes (mocked for demo) */}
              <div>
                <p className="font-semibold mb-1 text-gray-900 dark:text-white">Promo Codes:</p>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-block px-3 py-1 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium">EARLYBIRD - 20% off</span>
                </div>
              </div>

              {/* Approve/Reject Buttons */}
              <div className="flex gap-4 mt-6 justify-end">
                <button className="px-6 py-2.5 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Approve</span>
                </button>
                <button className="px-6 py-2.5 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center space-x-2">
                  <XCircle className="w-4 h-4" />
                  <span>Reject</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
