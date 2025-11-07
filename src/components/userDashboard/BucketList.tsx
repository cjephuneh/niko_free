import { Calendar, MapPin, Heart, Search, SlidersHorizontal, Grid3x3, List, DollarSign, AlertCircle } from 'lucide-react';
import { useState } from 'react';

interface Event {
  id: string;
  title: string;
  image: string;
  date: string;
  location: string;
  price: string;
  isOutdated: boolean;
  category?: string;
}

interface BucketListProps {
  onEventClick: (event: Event) => void;
}

export default function BucketList({ onEventClick }: BucketListProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'available' | 'expired'>('all');

  // Extended list of bucket list events
  const allBucketListEvents: Event[] = [
    {
      id: '4',
      title: 'Sunset Music Festival',
      image: 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&w=400',
      date: 'Nov 15, 2025',
      location: 'Uhuru Gardens',
      price: 'KES 800',
      isOutdated: false,
      category: 'Music'
    },
    {
      id: '5',
      title: 'Mt. Kenya Hiking Adventure',
      image: 'https://images.pexels.com/photos/618848/pexels-photo-618848.jpeg?auto=compress&cs=tinysrgb&w=400',
      date: 'Oct 20, 2025',
      location: 'Mt. Kenya',
      price: 'Free',
      isOutdated: true,
      category: 'Adventure'
    },
    {
      id: '6',
      title: 'Art Gallery Opening',
      image: 'https://images.pexels.com/photos/1839919/pexels-photo-1839919.jpeg?auto=compress&cs=tinysrgb&w=400',
      date: 'Nov 20, 2025',
      location: 'Nairobi Gallery',
      price: 'KES 500',
      isOutdated: false,
      category: 'Arts & Culture'
    },
    {
      id: '16',
      title: 'Safari Weekend Getaway',
      image: 'https://images.pexels.com/photos/631317/pexels-photo-631317.jpeg?auto=compress&cs=tinysrgb&w=400',
      date: 'Dec 5, 2025',
      location: 'Maasai Mara',
      price: 'KES 15,000',
      isOutdated: false,
      category: 'Travel'
    },
    {
      id: '17',
      title: 'Comedy Night Special',
      image: 'https://images.pexels.com/photos/1587927/pexels-photo-1587927.jpeg?auto=compress&cs=tinysrgb&w=400',
      date: 'Nov 28, 2025',
      location: 'Carnivore Grounds',
      price: 'KES 1,200',
      isOutdated: false,
      category: 'Entertainment'
    },
    {
      id: '18',
      title: 'Gourmet Food Festival',
      image: 'https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=400',
      date: 'Dec 10, 2025',
      location: 'Two Rivers Mall',
      price: 'KES 2,000',
      isOutdated: false,
      category: 'Food & Drink'
    },
    {
      id: '19',
      title: 'Charity Run for Kids',
      image: 'https://images.pexels.com/photos/2531756/pexels-photo-2531756.jpeg?auto=compress&cs=tinysrgb&w=400',
      date: 'Oct 1, 2025',
      location: 'Karura Forest',
      price: 'Free',
      isOutdated: true,
      category: 'Sports'
    },
    {
      id: '20',
      title: 'Photography Masterclass',
      image: 'https://images.pexels.com/photos/2833392/pexels-photo-2833392.jpeg?auto=compress&cs=tinysrgb&w=400',
      date: 'Nov 30, 2025',
      location: 'Nairobi National Museum',
      price: 'KES 3,500',
      isOutdated: false,
      category: 'Education'
    },
    {
      id: '21',
      title: 'Beach Bonfire Party',
      image: 'https://images.pexels.com/photos/1983032/pexels-photo-1983032.jpeg?auto=compress&cs=tinysrgb&w=400',
      date: 'Dec 15, 2025',
      location: 'Diani Beach',
      price: 'KES 1,500',
      isOutdated: false,
      category: 'Social'
    },
    {
      id: '22',
      title: 'Classical Orchestra Performance',
      image: 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&w=400',
      date: 'Dec 20, 2025',
      location: 'Kenya National Theatre',
      price: 'KES 2,500',
      isOutdated: false,
      category: 'Music'
    },
    {
      id: '23',
      title: 'Vintage Car Show',
      image: 'https://images.pexels.com/photos/164634/pexels-photo-164634.jpeg?auto=compress&cs=tinysrgb&w=400',
      date: 'Sep 15, 2025',
      location: 'Ngong Racecourse',
      price: 'KES 500',
      isOutdated: true,
      category: 'Automotive'
    }
  ];

  // Filter events
  const filteredEvents = allBucketListEvents.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = 
      filterStatus === 'all' || 
      (filterStatus === 'available' && !event.isOutdated) ||
      (filterStatus === 'expired' && event.isOutdated);
    return matchesSearch && matchesFilter;
  });

  const statusCounts = {
    all: allBucketListEvents.length,
    available: allBucketListEvents.filter(e => !e.isOutdated).length,
    expired: allBucketListEvents.filter(e => e.isOutdated).length
  };

  const handleRemoveFromBucket = (eventId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // Add logic to remove from bucket list
    console.log('Remove from bucket list:', eventId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Bucket List</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'} saved
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
            placeholder="Search saved events..."
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
          { key: 'all', label: 'All Saved', icon: Heart },
          { key: 'available', label: 'Available', icon: Calendar },
          { key: 'expired', label: 'Expired', icon: AlertCircle }
        ].map((filter) => (
          <button
            key={filter.key}
            onClick={() => setFilterStatus(filter.key as typeof filterStatus)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap font-semibold text-sm transition-all ${
              filterStatus === filter.key
                ? 'bg-[#27aae2] text-white shadow-sm'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-[#27aae2] hover:text-[#27aae2]'
            }`}
          >
            <filter.icon className="w-4 h-4" />
            {filter.label} ({statusCounts[filter.key as keyof typeof statusCounts]})
          </button>
        ))}
      </div>

      {/* Events Grid/List */}
      {filteredEvents.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <Heart className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No saved events found</h3>
          <p className="text-gray-500 dark:text-gray-400">Try adjusting your search or filters</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredEvents.map((event) => (
            <div
              key={event.id}
              onClick={() => onEventClick(event)}
              className={`bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all border border-gray-100 dark:border-gray-700 cursor-pointer group ${
                event.isOutdated ? 'opacity-75' : ''
              }`}
            >
              <div className="relative h-40">
                <img
                  src={event.image}
                  alt={event.title}
                  className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${
                    event.isOutdated ? 'grayscale' : ''
                  }`}
                />
                {event.isOutdated && (
                  <div className="absolute top-2 right-2 bg-gray-500 text-white px-2 py-0.5 rounded-full text-xs font-bold">
                    EXPIRED
                  </div>
                )}
                <button 
                  onClick={(e) => handleRemoveFromBucket(event.id, e)}
                  className="absolute top-2 left-2 w-8 h-8 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform"
                >
                  <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                </button>
                {event.category && (
                  <div className="absolute bottom-2 left-2 bg-black/60 text-white px-2 py-0.5 rounded-full text-xs font-semibold">
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
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-3.5 h-3.5 text-[#27aae2] flex-shrink-0" />
                    <span className="font-semibold text-[#27aae2]">{event.price}</span>
                  </div>
                </div>
                <button 
                  className={`w-full py-2 rounded-lg text-sm font-semibold transition-colors ${
                    event.isOutdated
                      ? 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400 cursor-not-allowed'
                      : 'bg-[#27aae2] text-white hover:bg-[#1e8bb8]'
                  }`}
                  disabled={event.isOutdated}
                >
                  {event.isOutdated ? 'Expired' : 'Book Now'}
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
              className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-all border border-gray-100 dark:border-gray-700 cursor-pointer p-4 ${
                event.isOutdated ? 'opacity-75' : ''
              }`}
            >
              <div className="flex gap-4">
                <img
                  src={event.image}
                  alt={event.title}
                  className={`w-24 h-24 sm:w-32 sm:h-32 rounded-lg object-cover flex-shrink-0 ${
                    event.isOutdated ? 'grayscale' : ''
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-bold text-gray-900 dark:text-white text-base sm:text-lg line-clamp-1">{event.title}</h3>
                    <button 
                      onClick={(e) => handleRemoveFromBucket(event.id, e)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                    >
                      <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {event.category && (
                      <span className="inline-block bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded text-xs font-semibold">
                        {event.category}
                      </span>
                    )}
                    {event.isOutdated && (
                      <span className="inline-block bg-gray-500 text-white px-2 py-0.5 rounded text-xs font-bold">
                        EXPIRED
                      </span>
                    )}
                  </div>
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
                  <div className="flex items-center justify-between">
                    <span className="text-base font-bold text-[#27aae2]">{event.price}</span>
                    <button 
                      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                        event.isOutdated
                          ? 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400 cursor-not-allowed'
                          : 'bg-[#27aae2] text-white hover:bg-[#1e8bb8]'
                      }`}
                      disabled={event.isOutdated}
                    >
                      {event.isOutdated ? 'Expired' : 'Book Now'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
