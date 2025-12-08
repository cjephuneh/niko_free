import { Search, Download, Users, Mail, Phone, Calendar, FileSpreadsheet, FileText, X, Ticket } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getPartnerAttendees } from '../../services/partnerService';

interface Attendee {
  id: number;
  name: string;
  email: string;
  phone: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  location: string;
  ticketType: string;
  event: string;
  eventDate: string;
  bookingDate: string;
  status: 'Confirmed' | 'Cancelled' | 'Pending';
  isCurrentEvent: boolean;
}

export default function Attendees() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<string>('all');
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [pastEventsCount, setPastEventsCount] = useState(0);
  const [currentEventsCount, setCurrentEventsCount] = useState(0);
  const [showEventDetailsModal, setShowEventDetailsModal] = useState(false);
  const [selectedEventDetails, setSelectedEventDetails] = useState<any>(null);

  // Fetch attendees and dashboard stats on mount
  useEffect(() => {
    fetchAttendees();
    fetchDashboardStats();
  }, []);

  const fetchAttendees = async () => {
    try {
      setIsLoading(true);
      setError('');
      const response = await getPartnerAttendees();
      
      // Transform API data to component format
      const formattedAttendees: Attendee[] = (response.attendees || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        email: item.email ? `${item.email.split('@')[0].slice(0, 4)}***@${item.email.split('@')[1]}` : '',
        phone: item.phone ? `+254${item.phone.slice(-3)}***${item.phone.slice(-3)}` : '',
        age: item.age || 0,
        gender: item.gender || 'Other',
        location: item.location || '',
        ticketType: item.ticketType || 'Regular',
        event: item.event || '',
        eventDate: item.eventDate ? new Date(item.eventDate).toISOString().split('T')[0] : '',
        bookingDate: item.bookingDate ? new Date(item.bookingDate).toISOString().split('T')[0] : '',
        status: item.status === 'Confirmed' ? 'Confirmed' : 'Pending',
        isCurrentEvent: item.isCurrentEvent || false,
        // Store booking data for event ID lookup
        booking: item.booking || null
      }));
      
      setAttendees(formattedAttendees);
      
      // Use counts from API response if available
      if (response.past_events_count !== undefined) {
        setPastEventsCount(response.past_events_count);
      }
      if (response.current_events_count !== undefined) {
        setCurrentEventsCount(response.current_events_count);
      }
    } catch (err: any) {
      console.error('Error fetching attendees:', err);
      setError(err.message || 'Failed to load attendees');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const { getPartnerToken } = await import('../../services/partnerService');
      const { API_BASE_URL, API_ENDPOINTS } = await import('../../config/api');
      const token = getPartnerToken();
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.partner.dashboard}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.stats?.past_events !== undefined) {
          setPastEventsCount(data.stats.past_events);
        }
        if (data.stats?.upcoming_events !== undefined) {
          setCurrentEventsCount(data.stats.upcoming_events);
        }
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    }
  };

  const filteredAttendees = attendees.filter(attendee => {
    const matchesSearch = attendee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         attendee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         attendee.event.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSelectedEvent = selectedEvent === 'all' || attendee.event === selectedEvent;
    return matchesSearch && matchesSelectedEvent;
  });

  // Get unique ticket types for filtering
  const allAttendees = attendees;

  // Calculate demographics
  // Use dashboard stats for event counts (more accurate than counting from attendees)
  const uniqueCurrentEvents = new Set(
    allAttendees.filter(a => a.isCurrentEvent).map(a => a.event)
  ).size;
  
  const demographics = {
    totalAttendees: allAttendees.length,
    currentEvents: currentEventsCount > 0 ? currentEventsCount : uniqueCurrentEvents, // Use dashboard count if available
    pastEvents: pastEventsCount > 0 ? pastEventsCount : new Set(allAttendees.filter(a => !a.isCurrentEvent).map(a => a.event)).size, // Use dashboard count if available
    averageAge: allAttendees.length > 0 ? Math.round(allAttendees.reduce((sum, a) => sum + a.age, 0) / allAttendees.length) : 0
  };

  // Get attendees by event
  const eventSummary = Array.from(new Set(allAttendees.map(a => a.event)))
    .map(event => ({
      event,
      count: allAttendees.filter(a => a.event === event).length,
      date: allAttendees.find(a => a.event === event)?.eventDate || '',
      isCurrent: allAttendees.find(a => a.event === event)?.isCurrentEvent || false
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Get unique events for dropdown
  const uniqueEvents = ['all', ...Array.from(new Set(allAttendees.map(a => a.event)))];

  const stats = [
    {
      label: 'Total Attendees',
      value: demographics.totalAttendees.toString(),
      icon: Users,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30'
    },
    {
      label: 'Current Events',
      value: demographics.currentEvents.toString(),
      icon: Calendar,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/30'
    },
    {
      label: 'Past Events',
      value: demographics.pastEvents.toString(),
      icon: Calendar,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30'
    },
    // {
    //   label: 'Average Age',
    //   value: demographics.averageAge.toString(),
    //   icon: TrendingUp,
    //   color: 'text-orange-600 dark:text-orange-400',
    //   bgColor: 'bg-orange-100 dark:bg-orange-900/30'
    // }
  ];

  const handleExport = (format: 'excel' | 'pdf') => {
    // In production, this would trigger actual file download
    alert(`Exporting ${filteredAttendees.length} attendees to ${format.toUpperCase()}...`);
    setExportMenuOpen(false);
  };

  const handleEventFilter = (event: string) => {
    setSelectedEvent(event);
  };

  const handleShowEventDetails = async (eventName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      // Get all attendees for this event
      const eventAttendees = allAttendees.filter(a => a.event === eventName);
      
      // Find the event ID from the first attendee's booking data
      const firstAttendee = eventAttendees[0];
      let eventId: number | null = null;
      
      if (firstAttendee) {
        const booking = (firstAttendee as any).booking;
        if (booking) {
          // Try event.id first (from event object), then event_id
          eventId = booking.event?.id || booking.event_id || null;
        }
      }
      
      // Fetch event details to get actual ticket type information
      let ticketTypes: any[] = [];
      if (eventId) {
        const { getPartnerToken } = await import('../../services/partnerService');
        const { API_BASE_URL, API_ENDPOINTS } = await import('../../config/api');
        const token = getPartnerToken();
        
        if (token) {
          const eventResponse = await fetch(`${API_BASE_URL}${API_ENDPOINTS.partner.event(eventId)}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          
          if (eventResponse.ok) {
            const eventData = await eventResponse.json();
            const event = eventData.event || eventData;
            
            // Get ticket types from event
            if (event.ticket_types && Array.isArray(event.ticket_types)) {
              // Calculate sold tickets per type from attendees
              const ticketTypeBreakdown = eventAttendees.reduce((acc: any, attendee) => {
                const ticketTypeName = attendee.ticketType;
                if (!acc[ticketTypeName]) {
                  acc[ticketTypeName] = 0;
                }
                acc[ticketTypeName] += 1;
                return acc;
              }, {});
              
              // Map event ticket types with sold counts
              ticketTypes = event.ticket_types.map((tt: any) => {
                const sold = ticketTypeBreakdown[tt.name] || 0;
                const total = tt.quantity_total !== null && tt.quantity_total !== undefined 
                  ? tt.quantity_total 
                  : null; // null means unlimited
                const available = total !== null ? Math.max(0, total - sold) : null;
                
                return {
                  type: tt.name,
                  sold: sold,
                  total: total,
                  available: available
                };
              });
            }
          }
        }
      }
      
      // Fallback: if we couldn't fetch event data, calculate from attendees only
      if (ticketTypes.length === 0) {
        const ticketTypeBreakdown = eventAttendees.reduce((acc: any, attendee) => {
          const ticketType = attendee.ticketType;
          if (!acc[ticketType]) {
            acc[ticketType] = {
              type: ticketType,
              sold: 0,
              total: null, // Unknown total
              available: null
            };
          }
          acc[ticketType].sold += 1;
          return acc;
        }, {});
        
        ticketTypes = Object.values(ticketTypeBreakdown);
      }
      
      const totalTicketsSold = eventAttendees.length;
      const totalUsers = new Set(eventAttendees.map(a => a.email)).size;

      setSelectedEventDetails({
        eventName,
        totalTicketsSold,
        totalUsers,
        ticketTypes
      });
      setShowEventDetailsModal(true);
    } catch (err) {
      console.error('Error fetching event details:', err);
      // Still show modal with basic info
      const eventAttendees = allAttendees.filter(a => a.event === eventName);
      const ticketTypeBreakdown = eventAttendees.reduce((acc: any, attendee) => {
        const ticketType = attendee.ticketType;
        if (!acc[ticketType]) {
          acc[ticketType] = {
            type: ticketType,
            sold: 0,
            total: null,
            available: null
          };
        }
        acc[ticketType].sold += 1;
        return acc;
      }, {});
      
      setSelectedEventDetails({
        eventName,
        totalTicketsSold: eventAttendees.length,
        totalUsers: new Set(eventAttendees.map(a => a.email)).size,
        ticketTypes: Object.values(ticketTypeBreakdown)
      });
      setShowEventDetailsModal(true);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#27aae2]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Attendees</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your event attendees and view demographics
          </p>
        </div>
        
        {/* Export Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setExportMenuOpen(!exportMenuOpen)}
            className="flex items-center space-x-2 bg-[#27aae2] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#1e8bc3] transition-all shadow-lg"
          >
            <Download className="w-5 h-5" />
            <span>Export Data</span>
          </button>
          
          {exportMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-10">
              <button
                onClick={() => handleExport('excel')}
                className="w-full px-4 py-2.5 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-3"
              >
                <FileSpreadsheet className="w-4 h-4 text-green-600" />
                <span>Export to Excel</span>
              </button>
              <button
                onClick={() => handleExport('pdf')}
                className="w-full px-4 py-2.5 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-3"
              >
                <FileText className="w-4 h-4 text-red-600" />
                <span>Export to PDF</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {stat.value}
                </p>
              </div>
              <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Event Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Attendees by Event</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {eventSummary.map((event, index) => (
            <div 
              key={index}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
                event.event === selectedEvent
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' // Blue border for selected event
                  : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50' // Default border for other events
              }`}
              onClick={(e) => handleShowEventDetails(event.event, e)}
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{event.event}</h4>
                {event.isCurrent && (
                  <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">Current</span>
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{event.date}</p>
              <p className="text-2xl font-bold text-[#27aae2]">{event.count} attendees</p>
            </div>
          ))}
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name, email, or event..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[#27aae2] focus:border-transparent"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Event Selector Dropdown */}
          <select
            value={selectedEvent}
            onChange={(e) => setSelectedEvent(e.target.value)}
            className="px-4 py-3 rounded-xl font-medium transition-all text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#27aae2]"
          >
            <option value="all">All Events</option>
            {uniqueEvents.filter(e => e !== 'all').map((event) => (
              <option key={event} value={event}>{event}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-500 rounded-xl p-4">
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Attendees Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  First Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Ticket Type
                </th>
                {/* <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Age
                </th> */}
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Phone Number
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Email
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredAttendees.map((attendee) => (
                <tr key={attendee.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {attendee.name.split(' ')[0]}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#27aae2]/10 text-[#27aae2] dark:bg-[#27aae2]/20">
                      {attendee.ticketType}
                    </span>
                  </td>
                  {/* <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {attendee.age}
                    </div>
                  </td> */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                      <Phone className="w-4 h-4" />
                      <span>{attendee.phone}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                      <Mail className="w-4 h-4" />
                      <span>{attendee.email}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredAttendees.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No attendees found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </div>

      {/* Event Details Modal */}
      {showEventDetailsModal && selectedEventDetails && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 backdrop-blur-sm"
              onClick={() => setShowEventDetailsModal(false)}
            ></div>

            {/* Center modal */}
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full relative z-10">
              {/* Close button */}
              <button
                onClick={() => setShowEventDetailsModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors z-10"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="bg-white dark:bg-gray-800 px-8 pt-8 pb-8">
                {/* Title */}
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {selectedEventDetails.eventName}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">Event Ticket Details</p>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border-2 border-blue-200 dark:border-blue-800">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <Ticket className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Total Tickets Sold</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {selectedEventDetails.totalTicketsSold}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border-2 border-green-200 dark:border-green-800">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                        <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Total Users</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {selectedEventDetails.totalUsers}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Ticket Type Breakdown */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Ticket Type Breakdown
                  </h3>
                  <div className="space-y-3">
                    {selectedEventDetails.ticketTypes.map((ticket: any, index: number) => {
                      const soldPercentage = ticket.total !== null && ticket.total > 0 
                        ? (ticket.sold / ticket.total) * 100 
                        : 0;
                      const isSoldOut = ticket.total !== null && ticket.available !== null && ticket.available <= 0;

                      return (
                        <div 
                          key={index}
                          className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 border border-gray-200 dark:border-gray-600"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-semibold text-gray-900 dark:text-white">
                                {ticket.type}
                              </h4>
                              {isSoldOut && (
                                <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full font-semibold">
                                  SOLD OUT
                                </span>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {ticket.sold} {ticket.total !== null ? ` / ${ticket.total}` : ''}
                              </p>
                              {ticket.available !== null ? (
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {ticket.available} available
                                </p>
                              ) : (
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  Unlimited
                                </p>
                              )}
                            </div>
                          </div>
                          
                          {/* Progress Bar - only show if we have total tickets */}
                          {ticket.total !== null && (
                            <>
                              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5 overflow-hidden">
                                <div
                                  className={`h-2.5 rounded-full transition-all ${
                                    isSoldOut
                                      ? 'bg-red-500'
                                      : soldPercentage > 80
                                      ? 'bg-orange-500'
                                      : 'bg-[#27aae2]'
                                  }`}
                                  style={{ width: `${Math.min(100, soldPercentage)}%` }}
                                ></div>
                              </div>
                              
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {soldPercentage.toFixed(1)}% sold
                              </p>
                            </>
                          )}
                          {ticket.total === null && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {ticket.sold} sold (unlimited tickets)
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Close Button */}
                <div className="mt-6">
                  <button
                    onClick={() => setShowEventDetailsModal(false)}
                    className="w-full px-4 py-3 bg-[#27aae2] text-white rounded-xl font-medium hover:bg-[#1e8bc3] transition-all"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
