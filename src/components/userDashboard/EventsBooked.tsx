import { Calendar, QrCode, MapPin, Clock, Search, SlidersHorizontal, Grid3x3, List } from 'lucide-react';
import { useState } from 'react';

interface Event {
  id: string;
  title: string;
  image: string;
  date: string;
  time: string;
  location: string;
  ticketId: string;
  category?: string;
  status?: 'upcoming' | 'today' | 'this-week';
}

interface EventsBookedProps {
  onEventClick: (event: Event) => void;
}

export default function EventsBooked({ onEventClick }: EventsBookedProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'upcoming' | 'today' | 'this-week'>('all');

  // Extended list of booked events
  const allBookedEvents: Event[] = [
    {
      id: '1',
      title: 'Nairobi Tech Summit 2025',
      image: 'https://images.pexels.com/photos/2747449/pexels-photo-2747449.jpeg?auto=compress&cs=tinysrgb&w=400',
      date: 'Sat, Nov 2',
      time: '9:00 AM',
      location: 'KICC, Nairobi',
      ticketId: 'TKT-2025-001',
      category: 'Technology',
      status: 'today'
    },
    {
      id: '2',
      title: 'Morning Yoga in the Park',
      image: 'https://images.pexels.com/photos/3822647/pexels-photo-3822647.jpeg?auto=compress&cs=tinysrgb&w=400',
      date: 'Tomorrow',
      time: '6:00 AM',
      location: 'Karura Forest',
      ticketId: 'TKT-2025-002',
      category: 'Health & Wellness',
      status: 'this-week'
    },
    {
      id: '3',
      title: 'Startup Networking Mixer',
      image: 'https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=400',
      date: 'Nov 10',
      time: '6:00 PM',
      location: 'iHub Nairobi',
      ticketId: 'TKT-2025-003',
      category: 'Business',
      status: 'this-week'
    },
    {
      id: '10',
      title: 'African Art Exhibition',
      image: 'https://images.pexels.com/photos/1839919/pexels-photo-1839919.jpeg?auto=compress&cs=tinysrgb&w=400',
      date: 'Nov 12, 2025',
      time: '10:00 AM',
      location: 'Nairobi National Museum',
      ticketId: 'TKT-2025-010',
      category: 'Arts & Culture',
      status: 'this-week'
    },
    {
      id: '11',
      title: 'Blockchain Conference Kenya',
      image: 'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=400',
      date: 'Nov 15, 2025',
      time: '8:00 AM',
      location: 'Radisson Blu Hotel',
      ticketId: 'TKT-2025-011',
      category: 'Technology',
      status: 'upcoming'
    },
    {
      id: '12',
      title: 'Marathon for Hope 2025',
      image: 'https://images.pexels.com/photos/2531756/pexels-photo-2531756.jpeg?auto=compress&cs=tinysrgb&w=400',
      date: 'Nov 18, 2025',
      time: '5:00 AM',
      location: 'Uhuru Park',
      ticketId: 'TKT-2025-012',
      category: 'Sports',
      status: 'upcoming'
    },
    {
      id: '13',
      title: 'Live Jazz & Soul Night',
      image: 'https://images.pexels.com/photos/1481308/pexels-photo-1481308.jpeg?auto=compress&cs=tinysrgb&w=400',
      date: 'Nov 20, 2025',
      time: '7:00 PM',
      location: 'Alliance Française',
      ticketId: 'TKT-2025-013',
      category: 'Music',
      status: 'upcoming'
    },
    {
      id: '14',
      title: 'Digital Marketing Workshop',
      image: 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=400',
      date: 'Nov 22, 2025',
      time: '2:00 PM',
      location: 'Nairobi Garage',
      ticketId: 'TKT-2025-014',
      category: 'Education',
      status: 'upcoming'
    },
    {
      id: '15',
      title: 'Wine & Paint Experience',
      image: 'https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=400',
      date: 'Nov 25, 2025',
      time: '5:00 PM',
      location: 'The Alchemist',
      ticketId: 'TKT-2025-015',
      category: 'Social',
      status: 'upcoming'
    }
  ];

  // Filter events
  const filteredEvents = allBookedEvents.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || event.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const statusCounts = {
    all: allBookedEvents.length,
    today: allBookedEvents.filter(e => e.status === 'today').length,
    'this-week': allBookedEvents.filter(e => e.status === 'this-week').length,
    upcoming: allBookedEvents.filter(e => e.status === 'upcoming').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Events Booked</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'} found
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

      {/* Status Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { key: 'all', label: 'All Events' },
          { key: 'today', label: 'Today' },
          { key: 'this-week', label: 'This Week' },
          { key: 'upcoming', label: 'Upcoming' }
        ].map((filter) => (
          <button
            key={filter.key}
            onClick={() => setFilterStatus(filter.key as typeof filterStatus)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap font-semibold text-sm transition-all ${
              filterStatus === filter.key
                ? 'bg-[#27aae2] text-white shadow-sm'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-[#27aae2] hover:text-[#27aae2]'
            }`}
          >
            {filter.label} ({statusCounts[filter.key as keyof typeof statusCounts]})
          </button>
        ))}
      </div>

      {/* Events Grid/List */}
      {filteredEvents.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <Calendar className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No events found</h3>
          <p className="text-gray-500 dark:text-gray-400">Try adjusting your search or filters</p>
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
                <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-0.5 rounded-full text-xs font-bold">
                  BOOKED
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
                    <Clock className="w-3.5 h-3.5 text-[#27aae2] flex-shrink-0" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-[#27aae2] flex-shrink-0" />
                    <span className="line-clamp-1">{event.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <QrCode className="w-3.5 h-3.5 text-[#27aae2] flex-shrink-0" />
                    <span className="font-mono text-xs">{event.ticketId}</span>
                  </div>
                </div>
                <button className="w-full py-2 bg-[#27aae2] text-white rounded-lg text-sm font-semibold hover:bg-[#1e8bb8] transition-colors">
                  View Ticket
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
                    <span className="bg-green-500 text-white px-2 py-0.5 rounded-full text-xs font-bold whitespace-nowrap">
                      BOOKED
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
                      <span>{event.date} • {event.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-[#27aae2] flex-shrink-0" />
                      <span className="line-clamp-1">{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <QrCode className="w-3.5 h-3.5 text-[#27aae2] flex-shrink-0" />
                      <span className="font-mono">{event.ticketId}</span>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-[#27aae2] text-white rounded-lg text-sm font-semibold hover:bg-[#1e8bb8] transition-colors">
                    View Ticket
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
