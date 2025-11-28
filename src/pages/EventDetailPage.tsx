import { Calendar, MapPin, Users, Clock, ExternalLink, ChevronLeft, Heart } from 'lucide-react';
import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import LoginModal from '../components/LoginModal';
import TicketSelector from '../components/TicketSelector';
import EventActions from '../components/EventActions';
import PaymentModal from '../components/PaymentModal';
import { getEventDetails } from '../services/eventService';
import { bookTicket } from '../services/paymentService';
import { addToBucketlist, removeFromBucketlist } from '../services/userService';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE_URL } from '../config/api';

interface EventDetailPageProps {
  eventId: string;
  onNavigate: (page: string) => void;
}

export default function EventDetailPage({ eventId, onNavigate }: EventDetailPageProps) {
  const { isAuthenticated } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedTicketType, setSelectedTicketType] = useState<string>('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [copyLinkText, setCopyLinkText] = useState('Copy Link');
  const [eventData, setEventData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingData, setBookingData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [inBucketlist, setInBucketlist] = useState(false);
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoCodeError, setPromoCodeError] = useState('');
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);

  // Validate promo code
  const handleValidatePromo = async () => {
    if (!promoCode.trim()) {
      setPromoCodeError('Please enter a promo code');
      return;
    }

    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    setIsValidatingPromo(true);
    setPromoCodeError('');

    try {
      const token = localStorage.getItem('token');
      const parsedEventId = parseInt(eventId);
      
      if (isNaN(parsedEventId) || parsedEventId <= 0) {
        setPromoCodeError('Invalid event ID');
        setIsValidatingPromo(false);
        return;
      }
      
      const requestBody = {
        code: promoCode.trim().toUpperCase(),
        event_id: parsedEventId
      };
      
      console.log('Validating promo code:', requestBody); // Debug log
      
      const response = await fetch(`${API_BASE_URL}/api/tickets/validate-promo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      
      console.log('Promo validation response:', { status: response.status, data }); // Debug log

      if (response.ok && data.valid) {
        setPromoCodeError('');
      } else {
        setPromoCodeError(data.error || 'Invalid promo code');
      }
    } catch (err: any) {
      console.error('Error validating promo code:', err);
      setPromoCodeError('Failed to validate promo code. Please try again.');
    } finally {
      setIsValidatingPromo(false);
    }
  };

  // Fetch event details from API
  useEffect(() => {
    const fetchEvent = async () => {
      // Validate eventId - only check if it's empty or not a valid number
      if (!eventId || eventId.trim() === '' || isNaN(parseInt(eventId))) {
        setError('Invalid event ID');
        setIsLoading(false);
        return;
      }

      const parsedEventId = parseInt(eventId);
      if (parsedEventId <= 0) {
        setError('Invalid event ID');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const data = await getEventDetails(parsedEventId);
        if (data && data.id) {
          setEventData(data);
          // Check if event is in bucketlist
          setInBucketlist(data.in_bucketlist || false);
        } else {
          setError('Event not found or invalid response from server');
        }
      } catch (err: any) {
        console.error('Error fetching event:', err);
        // Provide more helpful error messages
        let errorMessage = 'Failed to load event details';
        if (err.message) {
          if (err.message.includes('404') || err.message.includes('not found')) {
            errorMessage = 'Event not found. It may have been removed or is not available.';
          } else if (err.message.includes('Unable to connect')) {
            errorMessage = 'Unable to connect to server. Please check your internet connection.';
          } else {
            errorMessage = err.message;
          }
        }
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  // Format date and time
  const formatDate = (dateString: string) => {
    if (!dateString) return 'TBA';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (dateString: string) => {
    if (!dateString) return 'TBA';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatTimeRange = (startDate: string, endDate: string) => {
    if (!startDate || !endDate) return 'TBA';
    const start = formatTime(startDate);
    const end = formatTime(endDate);
    return `${start} - ${end}`;
  };

  // Share functionality
  const eventUrl = window.location.href;
  const shareText = eventData ? `Check out this event: ${eventData.title}` : 'Check out this event';

  const handleWhatsAppShare = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${eventUrl}`)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleLinkedInShare = () => {
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(eventUrl)}`;
    window.open(linkedinUrl, '_blank');
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(eventUrl);
      setCopyLinkText('Link Copied!');
      setTimeout(() => {
        setCopyLinkText('Copy Link');
      }, 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = eventUrl;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopyLinkText('Link Copied!');
        setTimeout(() => {
          setCopyLinkText('Copy Link');
        }, 2000);
      } catch (fallbackErr) {
        console.error('Fallback copy failed:', fallbackErr);
      }
      document.body.removeChild(textArea);
    }
  };

  // Handle ticket booking
  const handleBuyTicket = async (ticketId?: string, quantity: number = 1) => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    if (!eventData) return;

    // Get selected ticket type
    const ticketTypes = eventData.ticket_types || [];
    let ticketTypeId: number | null = null;

    if (ticketTypes.length > 0) {
      // If a specific ticket type is selected, use it
      if (selectedTicketType) {
        const selected = ticketTypes.find((tt: any) => tt.id?.toString() === selectedTicketType);
        ticketTypeId = selected?.id || ticketTypes[0].id;
      } else {
        // Use first available ticket type
        ticketTypeId = ticketTypes[0].id;
      }
    } else if (ticketId) {
      // If ticketId was passed from TicketSelector, try to use it
      ticketTypeId = parseInt(ticketId) || null;
    }

    // For free events, we can proceed without ticket type (backend will create default)
    // For paid events, ticket type is required
    if (!ticketTypeId && !eventData.is_free) {
      setError('Please select a ticket type');
      return;
    }

    setIsBooking(true);
    setError(null);
    setSuccessMessage(null);

    try {
      console.log('Booking ticket with:', { event_id: parseInt(eventId), ticket_type_id: ticketTypeId, quantity });
      
      // Prepare booking data - ticket_type_id is optional for free events
      const bookingData: any = {
        event_id: parseInt(eventId),
        quantity: quantity,
      };
      
      // Only include ticket_type_id if we have one (required for paid events)
      if (ticketTypeId) {
        bookingData.ticket_type_id = ticketTypeId;
      }
      
      // Include promo code if provided and validated
      if (promoCode && promoCode.trim() && !promoCodeError) {
        bookingData.promo_code = promoCode.trim().toUpperCase();
      }
      
      // Book the ticket
      const bookingResult = await bookTicket(bookingData);

      console.log('Booking result:', bookingResult);
      setBookingData(bookingResult);

      // If event is free, booking is automatically confirmed
      if (eventData.is_free || !bookingResult.requires_payment) {
        setSuccessMessage('You\'re in! Go to your dashboard to download your ticket.');
        // Refresh event data to update attendee count (don't fail if refresh fails)
        // Only refresh if eventId is valid
        if (eventId && !isNaN(parseInt(eventId)) && parseInt(eventId) > 0) {
          try {
            const updatedData = await getEventDetails(parseInt(eventId));
            if (updatedData && updatedData.id) {
              setEventData(updatedData);
            }
          } catch (refreshErr) {
            console.warn('Failed to refresh event data after booking:', refreshErr);
            // Don't show error - booking was successful
          }
        }
      } else {
        // Show payment modal for paid events
        const bookingId = bookingResult.booking?.id || bookingResult.booking_id;
        console.log('Showing payment modal for booking ID:', bookingId);
        if (bookingId) {
          setShowPaymentModal(true);
        } else {
          setError('Booking created but could not get booking ID. Please try again.');
        }
      }
    } catch (err: any) {
      console.error('Booking error:', err);
      // Handle duplicate booking error
      if (err.message && (err.message.includes('already booked') || err.message.includes('pending booking'))) {
        setError(err.message + ' You can view your booking in your dashboard.');
      } else {
        setError(err.message || 'Failed to book ticket. Please try again.');
      }
      setIsBooking(false);
    }
  };

  // Handle payment success
  const handlePaymentSuccess = () => {
    setSuccessMessage('Payment successful! Your tickets have been confirmed. Check your email.');
    setShowPaymentModal(false);
    // Refresh event data (don't fail if refresh fails)
    // Only refresh if eventId is valid
    if (eventId && !isNaN(parseInt(eventId)) && parseInt(eventId) > 0) {
      getEventDetails(parseInt(eventId))
        .then((data) => {
          if (data && data.id) {
            setEventData(data);
          }
        })
        .catch((err) => {
          console.warn('Failed to refresh event data after payment:', err);
          // Don't show error - payment was successful
        });
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#27aae2] mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading event details...</p>
        </div>
      </div>
    );
  }

  // Error state - only show if we're not loading and there's an actual error
  if (!isLoading && (error || (!eventData && error))) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar onNavigate={onNavigate} currentPage="event-detail" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {error && error.includes('not found') ? 'Event Not Found' : 'Load Failed'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
              {error || 'The event you are looking for does not exist or could not be loaded.'}
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => onNavigate('landing')}
                className="px-6 py-3 bg-[#27aae2] text-white rounded-lg font-medium hover:bg-[#1e8bb8] transition-colors"
              >
                Back to Events
              </button>
              <button
                onClick={() => {
                  setError(null);
                  setIsLoading(true);
                  // Retry loading
                  getEventDetails(parseInt(eventId))
                    .then((data) => {
                      if (data && data.id) {
                        setEventData(data);
                        setError(null);
                      } else {
                        setError('Event not found or invalid response from server');
                      }
                    })
                    .catch((err) => {
                      setError(err.message || 'Failed to load event details');
                    })
                    .finally(() => setIsLoading(false));
                }}
                className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Format ticket types for TicketSelector component
  const ticketTypes = eventData.ticket_types || [];
  const isFree = eventData.is_free || false;
  
  // Determine ticket type structure
  let ticketType: 'uniform' | 'class' | 'loyalty' | 'season' | 'timeslot' = 'uniform';
  let tickets: any = { 
    uniform: [],
    class: [],
    loyalty: [],
    season: [],
    timeslot: []
  };

  if (ticketTypes.length === 0 && isFree) {
    ticketType = 'uniform';
    tickets = {
      uniform: [{ id: 'free', name: 'Free Ticket', price: 0, available: eventData.capacity || 999 }],
      class: [],
      loyalty: [],
      season: [],
      timeslot: []
    };
  } else if (ticketTypes.length > 0) {
    // Use uniform for now - can be enhanced based on ticket type structure
    ticketType = 'uniform';
    const mappedTickets = ticketTypes.map((tt: any) => ({
      id: tt.id?.toString() || tt.name?.toLowerCase().replace(/\s+/g, '-') || 'ticket-1',
      name: tt.name || 'Standard Ticket',
      price: parseFloat(tt.price || 0),
      available: tt.quantity_available || tt.quantity || tt.available || 0
    }));
    
    tickets = {
      uniform: mappedTickets.length > 0 ? mappedTickets : [{ id: 'default', name: 'Standard Ticket', price: 0, available: 0 }],
      class: [],
      loyalty: [],
      season: [],
      timeslot: []
    };
  } else {
    // No tickets available - show default
    tickets = {
      uniform: [{ id: 'default', name: 'Ticket', price: 0, available: 0 }],
      class: [],
      loyalty: [],
      season: [],
      timeslot: []
    };
  }

  const eventImage = eventData.poster_image 
    ? (eventData.poster_image.startsWith('http') 
        ? eventData.poster_image 
        : `${API_BASE_URL}${eventData.poster_image.startsWith('/') ? '' : '/'}${eventData.poster_image}`)
    : 'https://images.pexels.com/photos/2747449/pexels-photo-2747449.jpeg?auto=compress&cs=tinysrgb&w=1200';

  const location = eventData.is_online 
    ? (eventData.online_link ? `Online - ${eventData.online_link}` : 'Online Event')
    : (eventData.venue_name || eventData.venue_address || 'Location TBA');

  return (
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
        <Navbar onNavigate={onNavigate} currentPage="event-detail" />

        <button
          onClick={() => onNavigate('landing')}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-[#27aae2] transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="font-medium">Back to Events</span>
        </button>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg">
                <div className="relative h-96">
                  <img
                    src={eventImage}
                    alt={eventData.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4 flex items-center gap-2">
                    <span className="px-4 py-2 bg-[#27aae2] text-white text-sm font-semibold rounded-full">
                      {eventData.category?.name || 'Event'}
                    </span>
                  </div>
                  {/* Wishlist Button */}
                  <div className="absolute top-4 right-4">
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        if (!isAuthenticated) {
                          setShowLoginModal(true);
                          return;
                        }
                        
                        setIsTogglingWishlist(true);
                        try {
                          if (inBucketlist) {
                            await removeFromBucketlist(parseInt(eventId));
                            setInBucketlist(false);
                          } else {
                            await addToBucketlist(parseInt(eventId));
                            setInBucketlist(true);
                          }
                          // Update event data
                          const updatedData = await getEventDetails(parseInt(eventId));
                          if (updatedData && updatedData.id) {
                            setEventData(updatedData);
                          }
                        } catch (err: any) {
                          console.error('Error toggling wishlist:', err);
                          if (err.message && !err.message.includes('already in bucketlist')) {
                            alert(err.message || 'Failed to update wishlist');
                          }
                        } finally {
                          setIsTogglingWishlist(false);
                        }
                      }}
                      disabled={isTogglingWishlist}
                      className="w-12 h-12 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white dark:hover:bg-gray-700 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      title={inBucketlist ? 'Remove from wishlist' : 'Add to wishlist'}
                    >
                      <Heart className={`w-6 h-6 transition-all ${inBucketlist ? 'fill-red-500 text-red-500' : 'text-gray-600 dark:text-gray-400'}`} />
                    </button>
                  </div>
                </div>

                <div className="p-8">
                  <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">{eventData.title}</h1>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-[#27aae2]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-5 h-5 text-[#27aae2]" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Date</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{formatDate(eventData.start_date)}</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-[#27aae2]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Clock className="w-5 h-5 text-[#27aae2]" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Time</p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {formatTimeRange(eventData.start_date, eventData.end_date)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-[#27aae2]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-5 h-5 text-[#27aae2]" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Location</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{location}</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-[#27aae2]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Users className="w-5 h-5 text-[#27aae2]" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Attendees</p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {eventData.attendee_count || 0} {eventData.capacity ? `/ ${eventData.capacity}` : ''}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">About This Event</h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">{eventData.description}</p>
                  </div>

                  {(eventData.interests && eventData.interests.length > 0) && (
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-8 mt-8">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Interests & Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {eventData.interests.map((interest: any, index: number) => (
                          <span
                            key={index}
                            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm font-medium hover:bg-[#27aae2]/10 hover:text-[#27aae2] transition-colors cursor-pointer"
                          >
                            {typeof interest === 'string' ? interest : interest.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {eventData.partner && (
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-8 mt-8">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Hosted By</h3>
                      <div className="flex items-center space-x-4">
                        <div className="relative flex-shrink-0">
                          {eventData.partner.logo ? (
                            <img
                              src={eventData.partner.logo.startsWith('http') 
                                ? eventData.partner.logo 
                                : `${API_BASE_URL}${eventData.partner.logo.startsWith('/') ? '' : '/'}${eventData.partner.logo}`}
                              alt={eventData.partner.business_name}
                              className="w-16 h-16 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
                              onError={(e) => {
                                // Fallback to placeholder if image fails to load
                                (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(eventData.partner.business_name) + '&background=27aae2&color=fff&size=128';
                              }}
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-full bg-[#27aae2] flex items-center justify-center border-2 border-gray-200 dark:border-gray-700">
                              <span className="text-white text-xl font-bold">
                                {eventData.partner.business_name?.charAt(0)?.toUpperCase() || 'P'}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-semibold text-gray-900 dark:text-white text-lg truncate">
                              {eventData.partner.business_name}
                            </h4>
                            {eventData.partner.is_verified && (
                              <span className="px-2 py-0.5 text-xs font-medium bg-black text-white rounded-full flex-shrink-0">
                                Verified
                              </span>
                            )}
                          </div>
                          <p className="text-gray-600 dark:text-gray-400">
                            {eventData.partner.category?.name || 'Event Organizer'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-4">
                {/* Event Map - Only show if physical location */}
                {!eventData.is_online && eventData.venue_name && (
                  <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                      <h3 className="font-bold text-gray-900 dark:text-white flex items-center space-x-2">
                        <MapPin className="w-5 h-5 text-[#27aae2]" />
                        <span>Event Venue</span>
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{location}</p>
                    </div>
                    <div className="relative h-64 bg-gray-200 dark:bg-gray-700">
                      <iframe
                        width="100%"
                        height="100%"
                        frameBorder="0"
                        style={{ border: 0 }}
                        src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.8159534114384!2d36.82035431475395!3d-1.2880051359988408!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f10d6d6f8f8f3%3A0x3f0e0e0e0e0e0e0e!2s${encodeURIComponent(location)}!5e0!3m2!1sen!2ske!4v1234567890123!5m2!1sen!2ske`}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title="Event Location Map"
                      ></iframe>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute bottom-2 right-2 bg-white dark:bg-gray-800 px-3 py-1.5 rounded-lg text-xs font-medium text-[#27aae2] hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-md flex items-center space-x-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Open in Maps</span>
                      </a>
                    </div>
                  </div>
                )}

                {/* Ticketing Section */}
                {successMessage ? (
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border-2 border-green-500">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">You're In! 🎉</h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">{successMessage}</p>
                      <button
                        onClick={() => {
                          setSuccessMessage(null);
                          onNavigate('user-dashboard');
                        }}
                        className="px-6 py-2 bg-[#27aae2] text-white rounded-lg hover:bg-[#1e8bb8] transition-colors font-semibold"
                      >
                        Go to Dashboard
                      </button>
                    </div>
                  </div>
                ) : (
                  <TicketSelector
                    ticketType={ticketType}
                    tickets={tickets}
                    selectedTicketType={selectedTicketType}
                    selectedTimeSlot={selectedTimeSlot}
                    onSelectTicketType={setSelectedTicketType}
                    onSelectTimeSlot={setSelectedTimeSlot}
                    isRSVPed={false}
                    onBuyTicket={handleBuyTicket}
                    promoCode={promoCode}
                    onPromoCodeChange={setPromoCode}
                    promoCodeError={promoCodeError}
                    isValidatingPromo={isValidatingPromo}
                    onValidatePromo={handleValidatePromo}
                  />
                )}

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mt-4">
                    <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                  </div>
                )}

                {/* Loading State */}
                {isBooking && (
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg mt-4">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#27aae2] mx-auto mb-2"></div>
                      <p className="text-gray-600 dark:text-gray-400">Processing booking...</p>
                    </div>
                  </div>
                )}

                {/* Event Actions */}
                <EventActions />

                {/* Share Section */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-4">Share Event</h3>
                  <div className="space-y-2">
                    <button 
                      onClick={handleWhatsAppShare}
                      className="w-full py-2.5 px-4 bg-[#27aae2] text-white rounded-lg font-medium hover:bg-[#1e8bb8] transition-colors text-sm"
                    >
                      Share on WhatsApp
                    </button>
                    <button 
                      onClick={handleLinkedInShare}
                      className="w-full py-2.5 px-4 bg-gray-900 dark:bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors text-sm"
                    >
                      Share on LinkedIn
                    </button>
                    <button 
                      onClick={handleCopyLink}
                      className="w-full py-2.5 px-4 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:border-[#27aae2] hover:text-[#27aae2] transition-colors text-sm"
                    >
                      {copyLinkText}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onNavigate={onNavigate}
      />

      {/* Payment Modal */}
      {showPaymentModal && bookingData && (bookingData.booking?.id || bookingData.booking_id) && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            setBookingData(null);
          }}
          bookingId={bookingData.booking?.id || bookingData.booking_id}
          amount={parseFloat(bookingData.booking?.total_amount || bookingData.amount || bookingData.booking?.amount || 0)}
          eventTitle={eventData?.title || 'Event'}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}
