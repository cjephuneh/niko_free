import React, { useState, useEffect } from 'react';
import { MapPin, Calendar, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import EventCard from '../components/EventCard';
import { getEvents } from '../services/eventService';

interface ThisWeekendProps {
  onNavigate: (page: string) => void;
  onEventClick: (eventId: string) => void;
}

export default function ThisWeekend({ onNavigate, onEventClick }: ThisWeekendProps) {
  const [selectedLocation, setSelectedLocation] = useState('Nairobi, Kenya');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDay, setSelectedDay] = useState('All');
  const [showNextWeekLeftArrow, setShowNextWeekLeftArrow] = useState(false);
  const nextWeekRef = React.useRef<HTMLDivElement>(null);
  const [weekendEvents, setWeekendEvents] = useState<any[]>([]);
  const [nextWeekEvents, setNextWeekEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const days = ['All', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Helper to map API event to EventCard shape
  const mapEventToCard = (e: any) => {
    const start = new Date(e.start_date);
    const weekdayName = start.toLocaleDateString('en-US', { weekday: 'long' }); // Thursday, Friday, etc.
    const dateLabel = start.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }); // Thu, Nov 2
    const timeLabel = start.toLocaleTimeString('en-KE', { hour: 'numeric', minute: '2-digit' });
    const categoryName = e.category?.name || 'Other';
    const isFree = e.is_free === true;
    const ticketTypes = e.ticket_types || [];
    let priceLabel = 'Paid';
    if (isFree) {
      priceLabel = 'Free';
    } else if (ticketTypes.length > 0) {
      const minPrice = Math.min(...ticketTypes.map((t: any) => t.price || 0));
      if (minPrice > 0) {
        priceLabel = `KES ${Math.round(minPrice).toLocaleString()}`;
      }
    }
    const attendees = (e.attendee_count ?? 20);
    const locationLabel = e.venue_name || e.location?.name || 'TBA';

    return {
      id: String(e.id),
      title: e.title,
      image: e.poster_image || 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&w=800',
      date: dateLabel,
      day: weekdayName,
      time: timeLabel,
      location: locationLabel,
      attendees,
      category: categoryName,
      price: priceLabel,
    };
  };

  // Fetch events for this weekend (Thu–Sun) and next week
  useEffect(() => {
    const fetchThisWeekend = async () => {
      try {
        setLoading(true);
        const data = await getEvents({ per_page: 200 });
        const events = data.events || [];

        const today = new Date();
        const base = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const day = base.getDay(); // 0=Sun ... 6=Sat

        // Upcoming Thursday (4)
        const daysUntilThursday = (4 - day + 7) % 7;
        const thursday = new Date(base);
        thursday.setDate(base.getDate() + daysUntilThursday);

        const mondayAfter = new Date(thursday);
        mondayAfter.setDate(thursday.getDate() + 4); // Thu–Sun inclusive

        const nextWeekStart = new Date(mondayAfter);
        const nextWeekEnd = new Date(nextWeekStart);
        nextWeekEnd.setDate(nextWeekStart.getDate() + 7); // Next Mon–Sun

        const weekendFiltered = events.filter((e: any) => {
          if (!e.start_date) return false;
          const d = new Date(e.start_date);
          return d >= thursday && d < mondayAfter;
        }).map(mapEventToCard);

        const nextWeekFiltered = events.filter((e: any) => {
          if (!e.start_date) return false;
          const d = new Date(e.start_date);
          return d >= nextWeekStart && d < nextWeekEnd;
        }).map(mapEventToCard);

        setWeekendEvents(weekendFiltered);
        setNextWeekEvents(nextWeekFiltered);
      } catch (err: any) {
        console.error('Failed to fetch weekend events:', err);
        setError(err.message || 'Failed to load events');
      } finally {
        setLoading(false);
      }
    };

    fetchThisWeekend();
  }, []);

  // Filter events based on selected day and category
  const filteredWeekendEvents = weekendEvents.filter(event => {
    const matchesDay = selectedDay === 'All' || event.day === selectedDay;
    const matchesCategory = selectedCategory === 'All' || event.category === selectedCategory;
    return matchesDay && matchesCategory;
  });

  const categories = ['All', 'Music', 'Culture', 'Sports', 'Food', 'Technology', 'Fitness'];

  const handleNextWeekScroll = () => {
    if (nextWeekRef.current) {
      setShowNextWeekLeftArrow(nextWeekRef.current.scrollLeft > 0);
    }
  };

  const scrollNextWeek = (direction: 'left' | 'right') => {
    if (!nextWeekRef.current) return;
    const scrollAmount = 600;
    nextWeekRef.current.scrollBy({
      left: direction === 'right' ? scrollAmount : -scrollAmount,
      behavior: 'smooth'
    });
  };

  React.useEffect(() => {
    const element = nextWeekRef.current;
    if (element) {
      element.addEventListener('scroll', handleNextWeekScroll);
      return () => element.removeEventListener('scroll', handleNextWeekScroll);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 transition-colors duration-200 relative">
      {/* Light mode dot pattern overlay */}
      <div className="block dark:hidden fixed inset-0 pointer-events-none z-0" style={{
        backgroundImage: 'radial-gradient(circle, rgba(0, 0, 0, 0.08) 1px, transparent 1px)',
        backgroundSize: '30px 30px'
      }}></div>
      
      {/* Dark mode dot pattern overlay */}
      <div className="hidden dark:block fixed inset-0 pointer-events-none z-0" style={{
        backgroundImage: 'radial-gradient(circle, rgba(156, 163, 175, 0.15) 1px, transparent 1px)',
        backgroundSize: '30px 30px'
      }}></div>
      
      <div className="relative z-10">
        <Navbar onNavigate={onNavigate} currentPage="this-weekend" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12" data-aos="fade-down">
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full mb-6" style={{ backgroundColor: '#27aae2' }}>
            <Calendar className="w-4 h-4 text-white" />
            <span className="text-white text-sm font-medium">This Weekend</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-200">
            Weekend Events Near You
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto transition-colors duration-200">
            Discover exciting events happening this weekend in your area
          </p>
        </div>

        {/* Marketing Banner */}
        <div 
          className="relative overflow-hidden rounded-3xl mb-12 shadow-2xl"
          style={{
            background: 'linear-gradient(135deg, #27aae2 0%, #1a8ec4 100%)'
          }}
          data-aos="fade-up"
        >
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
          
          <div className="relative px-6 sm:px-12 py-8 sm:py-12 flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Left Content */}
            <div className="flex-1 text-center md:text-left">
              <div className="inline-block px-4 py-1 bg-white/20 backdrop-blur-sm rounded-full mb-4">
                <span className="text-white text-sm font-semibold">🎉 Special Offer</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3">
                Get 20% Off Your First Event!
              </h2>
              <p className="text-lg sm:text-xl text-white/90 mb-6 max-w-2xl">
                Join thousands of event-goers discovering amazing experiences. Use code <span className="font-bold bg-white/20 px-3 py-1 rounded-lg">FIRST20</span> at checkout.
              </p>
              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                <button
                  onClick={() => onNavigate('calendar')}
                  className="px-8 py-4 bg-white text-gray-900 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  Browse All Events
                </button>
                <button
                  onClick={() => onNavigate('become-partner')}
                  className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white border-2 border-white rounded-xl font-bold hover:bg-white/20 transition-all duration-200"
                >
                  Host Your Event
                </button>
              </div>
            </div>

            {/* Right Image/Icon */}
            <div className="hidden lg:block flex-shrink-0">
              <div className="w-48 h-48 relative">
                <div className="absolute inset-0 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <Calendar className="w-24 h-24 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                  <span className="text-2xl font-bold text-gray-900">20%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Day Selection Buttons */}
        <div className="flex flex-wrap gap-3 mb-8 justify-center" data-aos="fade-up">
          {days.map((day) => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-6 py-3 rounded-full font-semibold transition-all ${
                selectedDay === day
                  ? 'text-white shadow-lg'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-2 border-gray-200 dark:border-gray-700'
              }`}
              style={selectedDay === day ? { backgroundColor: '#27aae2' } : {}}
              onMouseEnter={(e) => {
                if (selectedDay !== day) {
                  e.currentTarget.style.borderColor = '#27aae2';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedDay !== day) {
                  e.currentTarget.style.borderColor = '';
                }
              }}
            >
              {day}
            </button>
          ))}
        </div>

        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" data-aos="fade-up" data-aos-delay="100">
          {loading && filteredWeekendEvents.length === 0 && (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-600 dark:text-gray-400 text-lg transition-colors duration-200">Loading weekend events...</p>
            </div>
          )}
          {!loading && filteredWeekendEvents.map((event) => (
            <EventCard
              key={event.id}
              {...event}
              onClick={onEventClick}
            />
          ))}
        </div>

        {!loading && filteredWeekendEvents.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 text-lg transition-colors duration-200">No events found for this weekend</p>
          </div>
        )}
      </div>

      {/* Next Week Section */}
      <div className="bg-gradient-to-b from-gray-100 to-white dark:from-gray-800 dark:to-gray-900 py-16 transition-colors duration-200" data-aos="fade-up">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full mb-6" style={{ backgroundColor: '#27aae2' }}>
              <Calendar className="w-4 h-4 text-white" />
              <span className="text-white text-sm font-medium">Coming Soon</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-200">
              Next Week
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto transition-colors duration-200">
              Plan ahead with upcoming events for next week
            </p>
          </div>

          <div className="relative">
            <div ref={nextWeekRef} className="overflow-x-auto hide-scrollbar">
              <div className="flex gap-6 pb-4">
                {nextWeekEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex-shrink-0 w-full sm:w-[calc(50%-12px)] lg:w-[calc(25%-18px)] min-w-[280px]"
                  >
                    <EventCard
                      {...event}
                      onClick={onEventClick}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Scroll Arrows for Next Week */}
            <button
              onClick={() => scrollNextWeek('left')}
              className={`hidden lg:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-12 h-12 bg-white dark:bg-gray-800 rounded-full items-center justify-center shadow-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all z-10 ${showNextWeekLeftArrow ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            >
              <ChevronLeft className="w-6 h-6 text-gray-900 dark:text-white" />
            </button>
            <button
              onClick={() => scrollNextWeek('right')}
              className="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-12 h-12 bg-white dark:bg-gray-800 rounded-full items-center justify-center shadow-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all z-10"
            >
              <ChevronRight className="w-6 h-6 text-gray-900 dark:text-white" />
            </button>
          </div>
        </div>
      </div>

      <Footer />
      </div>
    </div>
  );
}
