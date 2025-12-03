import { Calendar, MapPin, Globe, CheckCircle2, ChevronLeft, Star, Award, Users } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import EventCard from '../components/EventCard';
import SEO from '../components/SEO';
import { getImageUrl, API_BASE_URL } from '../config/api';

interface PartnerProfilePageProps {
  partnerId: string;
  onNavigate: (page: string, params?: any) => void;
}

interface PartnerData {
  id: number;
  business_name: string;
  email: string;
  phone_number?: string;
  location?: string;
  website?: string;
  description?: string;
  logo?: string;
  is_verified: boolean;
  category?: {
    id: number;
    name: string;
  };
  contact_person?: string;
  total_events?: number;
  total_attendees?: number;
  rating?: number;
}

interface PartnerEvent {
  id: number;
  title: string;
  description: string;
  poster_image?: string;
  start_date: string;
  end_date?: string;
  venue_name?: string;
  venue_address?: string;
  is_online: boolean;
  is_free: boolean;
  category?: {
    name: string;
  };
  bookings_count?: number;
  status: string;
}

interface Review {
  id: number;
  rating: number;
  comment?: string;
  created_at: string;
  user?: {
    first_name: string;
    last_name: string;
  };
  event?: {
    id: number;
    title: string;
  };
}

export default function PartnerProfilePage({ partnerId, onNavigate }: PartnerProfilePageProps) {
  const [searchParams] = useSearchParams();
  const [partnerData, setPartnerData] = useState<PartnerData | null>(null);
  const [currentEvents, setCurrentEvents] = useState<PartnerEvent[]>([]);
  const [pastEvents, setPastEvents] = useState<PartnerEvent[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'current' | 'past'>('current');
  const [activeSection, setActiveSection] = useState<'about' | 'events'>('about');
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);

  // Fetch partner data
  useEffect(() => {
    const fetchPartnerData = async () => {
      if (!partnerId || partnerId.trim() === '' || isNaN(parseInt(partnerId))) {
        setError('Invalid partner ID');
        setIsLoading(false);
        return;
      }

      const parsedPartnerId = parseInt(partnerId);
      if (parsedPartnerId <= 0) {
        setError('Invalid partner ID');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Fetch all events to find partner events
        const eventsResponse = await fetch(`${API_BASE_URL}/api/events`);
        if (!eventsResponse.ok) {
          throw new Error('Failed to load events');
        }
        const eventsData = await eventsResponse.json();
        const allEvents = eventsData.events || eventsData || [];
        
        // Filter events by partner ID
        const partnerEvents = allEvents.filter((event: any) => 
          event.partner?.id === parsedPartnerId
        );

        if (partnerEvents.length === 0) {
          throw new Error('Partner not found or has no events');
        }

        // Extract partner data from first event
        const partner = partnerEvents[0].partner;
        setPartnerData({
          id: partner.id,
          business_name: partner.business_name,
          email: partner.email,
          phone_number: partner.phone_number,
          location: partner.location,
          website: partner.website,
          description: partner.description,
          logo: partner.logo,
          is_verified: partner.is_verified,
          category: partner.category,
          contact_person: partner.contact_person,
          total_events: partnerEvents.length,
          total_attendees: partnerEvents.reduce((sum: number, event: any) => 
            sum + (event.bookings_count || event.attendee_count || 0), 0
          ),
        });

        // Separate current and past events
        const now = new Date();
        const current = partnerEvents.filter((event: any) => 
          event.status === 'approved' && new Date(event.start_date) >= now
        );
        const past = partnerEvents.filter((event: any) => 
          event.status === 'approved' && new Date(event.start_date) < now
        );
        
        setCurrentEvents(current);
        setPastEvents(past);

        // For now, we'll skip reviews since there's no public endpoint
        // You can add this later when the backend endpoint is available
        setReviews([]);
        setAverageRating(0);
        setTotalReviews(0);
      } catch (err: any) {
        console.error('Error fetching partner data:', err);
        setError(err.message || 'Failed to load partner details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPartnerData();
  }, [partnerId]);

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return 'TBA';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  // Format time
  const formatTime = (dateString: string) => {
    if (!dateString) return 'TBA';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  // Transform event data for EventCard
  const transformEventForCard = (event: PartnerEvent) => {
    return {
      id: event.id.toString(),
      title: event.title,
      image: event.poster_image ? getImageUrl(event.poster_image) : 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30',
      date: formatDate(event.start_date),
      time: formatTime(event.start_date),
      location: event.is_online 
        ? 'Online Event' 
        : event.venue_name || event.venue_address || 'Location TBA',
      attendees: event.bookings_count || 0,
      category: event.category?.name || 'General',
      price: event.is_free ? 'Free' : 'Paid',
      onClick: (id: string) => onNavigate('event-detail', { eventId: id }),
    };
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#27aae2] mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading partner profile...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (!isLoading && (error || !partnerData)) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar onNavigate={onNavigate} currentPage="partner-profile" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Partner Not Found</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
              {error || 'The partner you are looking for does not exist or could not be loaded.'}
            </p>
            <button
              onClick={() => onNavigate('landing')}
              className="px-6 py-3 bg-[#27aae2] text-white rounded-lg font-medium hover:bg-[#1e8bb8] transition-colors"
            >
              Back to Events
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {partnerData && (
        <SEO
          title={`${partnerData.business_name} - Partner Profile | Niko Free`}
          description={partnerData.description || `View events and details for ${partnerData.business_name} on Niko Free.`}
          keywords={`${partnerData.business_name}, event organizer, ${partnerData.category?.name || 'events'}, kenya events, niko free`}
          image={partnerData.logo ? getImageUrl(partnerData.logo) : 'https://niko-free.com/src/images/Niko%20Free%20Logo.png'}
          url={`https://niko-free.com/partner/${partnerId}`}
          type="profile"
        />
      )}
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200 relative">
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
          <Navbar onNavigate={onNavigate} currentPage="partner-profile" />

          <button
            onClick={() => window.history.back()}
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-[#27aae2] transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="font-medium">Back</span>
          </button>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Partner Header */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 mb-8">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                {/* Partner Logo */}
                <div className="relative flex-shrink-0">
                  {partnerData.logo ? (
                    <img
                      src={getImageUrl(partnerData.logo)}
                      alt={partnerData.business_name}
                      className="w-32 h-32 rounded-full object-cover border-4 border-gray-200 dark:border-gray-700"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(partnerData.business_name)}&background=27aae2&color=fff&size=256`;
                      }}
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#27aae2] to-[#1e8bb8] flex items-center justify-center border-4 border-gray-200 dark:border-gray-700">
                      <span className="text-white text-4xl font-bold">
                        {partnerData.business_name?.charAt(0)?.toUpperCase() || 'P'}
                      </span>
                    </div>
                  )}
                  {partnerData.is_verified && (
                    <div className="absolute -bottom-2 -right-2 bg-black text-white p-2 rounded-full">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                  )}
                </div>

                {/* Partner Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap mb-3">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                      {partnerData.business_name}
                    </h1>
                    {partnerData.is_verified && (
                      <span className="px-3 py-1 text-sm font-medium bg-black text-white rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        Verified Partner
                      </span>
                    )}
                  </div>
                  
                  {partnerData.category && (
                    <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
                      {partnerData.category.name}
                    </p>
                  )}

                  {/* Rating - Always show */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-5 h-5 ${
                            star <= averageRating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'fill-gray-300 text-gray-300 dark:fill-gray-600 dark:text-gray-600'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="font-bold text-gray-900 dark:text-white">
                      {totalReviews > 0 ? averageRating.toFixed(1) : '0.0'}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      ({totalReviews} {totalReviews === 1 ? 'review' : 'reviews'})
                    </span>
                  </div>

                  {/* Stats */}
                  <div className="flex flex-wrap gap-6">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-[#27aae2]" />
                      <span className="text-gray-700 dark:text-gray-300">
                        <span className="font-bold text-gray-900 dark:text-white">
                          {currentEvents.length + pastEvents.length}
                        </span> Events
                      </span>
                    </div>
                    {partnerData.total_attendees !== undefined && (
                      <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-[#27aae2]" />
                        <span className="text-gray-700 dark:text-gray-300">
                          <span className="font-bold text-gray-900 dark:text-white">
                            {partnerData.total_attendees}
                          </span> Attendees
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              {(partnerData.website || partnerData.location) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                  {partnerData.website && (
                    <div className="flex items-start gap-3">
                      <Globe className="w-5 h-5 text-[#27aae2] flex-shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Website</p>
                        <a 
                          href={partnerData.website.startsWith('http') ? partnerData.website : `https://${partnerData.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#27aae2] hover:underline font-medium break-all"
                        >
                          {partnerData.website}
                        </a>
                      </div>
                    </div>
                  )}

                  {partnerData.location && (
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-[#27aae2] flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Location</p>
                        <p className="text-gray-900 dark:text-white font-medium">{partnerData.location}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* About & Events Section with Toggle */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 mb-8">
              {/* Section Toggle Buttons */}
              <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
                <button
                  onClick={() => setActiveSection('about')}
                  className={`px-6 py-2.5 rounded-lg font-semibold transition-colors ${
                    activeSection === 'about'
                      ? 'bg-[#27aae2] text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  About
                </button>
                <button
                  onClick={() => setActiveSection('events')}
                  className={`px-6 py-2.5 rounded-lg font-semibold transition-colors ${
                    activeSection === 'events'
                      ? 'bg-[#27aae2] text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  Events
                </button>
              </div>

              {/* About Content */}
              {activeSection === 'about' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Award className="w-6 h-6 text-[#27aae2]" />
                    About {partnerData?.business_name}
                  </h2>
                  {partnerData?.description ? (
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                      {partnerData.description}
                    </p>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 italic">
                      No description available for this partner.
                    </p>
                  )}
                </div>
              )}

              {/* Events Content */}
              {activeSection === 'events' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <Calendar className="w-6 h-6 text-[#27aae2]" />
                      Events
                    </h2>
                    
                    {/* Event Tabs */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => setActiveTab('current')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          activeTab === 'current'
                            ? 'bg-[#27aae2] text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        Current ({currentEvents.length})
                      </button>
                      <button
                        onClick={() => setActiveTab('past')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          activeTab === 'past'
                            ? 'bg-[#27aae2] text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        Past ({pastEvents.length})
                      </button>
                    </div>
                  </div>

                  {/* Events Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {activeTab === 'current' && currentEvents.length === 0 && (
                      <div className="col-span-full text-center py-12">
                        <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 dark:text-gray-400">No current events</p>
                      </div>
                    )}
                    
                    {activeTab === 'past' && pastEvents.length === 0 && (
                      <div className="col-span-full text-center py-12">
                        <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 dark:text-gray-400">No past events</p>
                      </div>
                    )}

                    {activeTab === 'current' && currentEvents.map((event) => (
                      <EventCard
                        key={event.id}
                        {...transformEventForCard(event)}
                      />
                    ))}

                    {activeTab === 'past' && pastEvents.map((event) => (
                      <EventCard
                        key={event.id}
                        {...transformEventForCard(event)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Reviews Section */}
            {reviews.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <Star className="w-6 h-6 text-[#27aae2]" />
                  Reviews
                </h2>

                <div className="space-y-6">
                  {reviews.slice(0, 6).map((review) => (
                    <div key={review.id} className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-b-0 last:pb-0">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-[#27aae2]/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-[#27aae2] font-bold text-lg">
                            {review.user?.first_name?.[0]?.toUpperCase() || 'U'}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2 gap-4">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-900 dark:text-white">
                                {review.user?.first_name} {review.user?.last_name}
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {formatDate(review.created_at)}
                              </p>
                              {review.event && (
                                <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                                  Event: {review.event.title}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-4 h-4 ${
                                    star <= review.rating
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          {review.comment && (
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                              {review.comment}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {reviews.length > 6 && (
                    <div className="text-center pt-4">
                      <p className="text-gray-600 dark:text-gray-400">
                        Showing 6 of {reviews.length} reviews
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
}
