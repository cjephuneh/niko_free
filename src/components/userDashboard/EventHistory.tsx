import { Calendar, MapPin, Download, Search, SlidersHorizontal, Grid3x3, List, ArrowLeft, Star } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getUserBookings } from '../../services/userService';
import { API_BASE_URL } from '../../config/api';

interface Event {
  id: number;
  title: string;
  image: string;
  date: string;
  location: string;
  rating: number;
  category?: string;
  attendees?: number;
}

interface EventHistoryProps {
  onEventClick: (event: Event) => void;
  onBack?: () => void;
}

export default function EventHistory({ onEventClick, onBack }: EventHistoryProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEventHistory();
  }, []);

  const fetchEventHistory = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const response = await getUserBookings('past');
      
      // Transform API data to component format
      const formattedEvents: Event[] = (response.bookings || []).map((booking: any) => {
        const event = booking.event || {};
        const startDate = event.start_date ? new Date(event.start_date) : new Date();
        
        return {
          id: booking.id || event.id,
          title: event.title || 'Event',
          image: event.poster_image 
            ? `${API_BASE_URL}${event.poster_image.startsWith('/') ? '' : '/'}${event.poster_image}`
            : 'https://images.pexels.com/photos/1481308/pexels-photo-1481308.jpeg?auto=compress&cs=tinysrgb&w=400',
          date: startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          location: event.venue_name || event.venue_address || 'Location TBA',
          rating: 5, // TODO: Get actual rating from reviews
          category: event.category?.name || 'General',
          attendees: event.attendee_count || 0
        };
      });
      
      setEvents(formattedEvents);
    } catch (err: any) {
      console.error('Error fetching event history:', err);
      setError(err.message || 'Failed to load event history');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter events
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#27aae2]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      {onBack && (
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-[#27aae2] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Events</span>
        </button>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Event History</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {filteredEvents.length} past {filteredEvents.length === 1 ? 'event' : 'events'}
          </p>
        </div>
        
        {/* View Mode Toggle */}
        <div className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded transition-colors ${
              viewMode === 'grid'
                ? 'bg-[#27aae2] text-white'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <Grid3x3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded transition-colors ${
              viewMode === 'list'
                ? 'bg-[#27aae2] text-white'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search events by name or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-[#27aae2] focus:border-transparent"
          />
        </div>

        {/* Filter Button */}
        <button className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
          <SlidersHorizontal className="w-4 h-4" />
          <span className="font-semibold">Filters</span>
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-500 rounded-xl p-4">
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Events Grid/List */}
      {filteredEvents.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <Calendar className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No past events found</h3>
          <p className="text-gray-500 dark:text-gray-400">Try adjusting your search</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredEvents.map((event) => (
            <div
              key={event.id}
              onClick={() => onEventClick(event)}
              className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all border border-gray-100 dark:border-gray-700 cursor-pointer group"
            >
              <div className="relative h-40">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 right-2 bg-gray-500 text-white px-2 py-0.5 rounded-full text-xs font-bold">
                  COMPLETED
                </div>
                {event.category && (
                  <div className="absolute top-2 left-2 bg-black/60 text-white px-2 py-0.5 rounded-full text-xs font-semibold">
                    {event.category}
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 text-sm">{event.title}</h3>
                <div className="space-y-1.5 text-xs text-gray-600 dark:text-gray-300 mb-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-[#27aae2] flex-shrink-0" />
                    <span>{event.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-[#27aae2] flex-shrink-0" />
                    <span className="line-clamp-1">{event.location}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-0.5 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < event.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 fill-gray-300'}`}
                    />
                  ))}
                </div>
                <button className="w-full py-2 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-semibold hover:border-[#27aae2] hover:text-[#27aae2] transition-all flex items-center justify-center space-x-2">
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Receipt</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredEvents.map((event) => (
            <div
              key={event.id}
              onClick={() => onEventClick(event)}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-all border border-gray-100 dark:border-gray-700 cursor-pointer p-4"
            >
              <div className="flex gap-4">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-24 h-24 sm:w-32 sm:h-32 rounded-lg object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-bold text-gray-900 dark:text-white text-base sm:text-lg line-clamp-1">{event.title}</h3>
                    <span className="bg-gray-500 text-white px-2 py-0.5 rounded-full text-xs font-bold whitespace-nowrap">
                      COMPLETED
                    </span>
                  </div>
                  {event.category && (
                    <span className="inline-block bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded text-xs font-semibold mb-3">
                      {event.category}
                    </span>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-300 mb-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-[#27aae2] flex-shrink-0" />
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-[#27aae2] flex-shrink-0" />
                      <span className="line-clamp-1">{event.location}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-0.5 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < event.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 fill-gray-300'}`}
                      />
                    ))}
                  </div>
                  <button className="px-4 py-2 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-semibold hover:border-[#27aae2] hover:text-[#27aae2] transition-all flex items-center gap-2">
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Receipt</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
