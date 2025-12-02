import { Clock, X, CreditCard, AlertCircle, Calendar, MapPin, DollarSign, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getUserBookings } from '../../services/userService';
import { API_BASE_URL, getImageUrl } from '../../config/api';
import { initiatePayment } from '../../services/paymentService';
import { getToken } from '../../services/authService';
import { useNavigate } from 'react-router-dom';

interface PendingBooking {
  id: number;
  booking_number: string;
  quantity: number;
  total_amount: number;
  created_at: string;
  event: {
    id: number;
    title: string;
    poster_image?: string;
    start_date: string;
    venue_name?: string;
    venue_address?: string;
    is_free: boolean;
  };
}

export default function PendingBookings() {
  const navigate = useNavigate();
  const [pendingBookings, setPendingBookings] = useState<PendingBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingPayment, setProcessingPayment] = useState<number | null>(null);
  const [cancellingBooking, setCancellingBooking] = useState<number | null>(null);

  useEffect(() => {
    fetchPendingBookings();
  }, []);

  const fetchPendingBookings = async () => {
    try {
      setIsLoading(true);
      setError('');
      const response = await getUserBookings('pending');
      const allBookings = response.bookings || [];
      
      // Show all pending bookings (including past events)
      // Users should be able to see and cancel past pending bookings
      // The "Pay Now" button will be disabled for past events anyway
      setPendingBookings(allBookings);
    } catch (err: any) {
      console.error('Error fetching pending bookings:', err);
      const errorMessage = err.message || 'Failed to load pending bookings';
      
      // If rate limited, show a more helpful message
      if (errorMessage.includes('Too many requests')) {
        setError('Too many requests. Please wait a moment and refresh the page.');
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayNow = async (booking: PendingBooking) => {
    if (booking.event.is_free) {
      // Free events shouldn't have pending bookings, but handle it gracefully
      alert('This is a free event. No payment required.');
      return;
    }

    try {
      setProcessingPayment(booking.id);
      
      // Navigate to event detail page where they can complete payment
      navigate(`/event-detail/${booking.event.id}?booking=${booking.id}&pay=true`);
    } catch (err: any) {
      console.error('Error initiating payment:', err);
      alert('Failed to initiate payment: ' + (err.message || 'Unknown error'));
    } finally {
      setProcessingPayment(null);
    }
  };

  const handleCancelBooking = async (bookingId: number) => {
    if (!confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) {
      return;
    }

    try {
      setCancellingBooking(bookingId);
      
      const token = getToken();
      if (!token) {
        throw new Error('You must be logged in to cancel a booking');
      }

      const response = await fetch(`${API_BASE_URL}/api/tickets/cancel/${bookingId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}), // Send empty JSON body
      });

      const data = await response.json();

      if (!response.ok) {
        // Check for specific error messages
        const errorMsg = data.msg || data.error || 'Failed to cancel booking';
        if (errorMsg.includes('past events') || errorMsg.includes('already started')) {
          throw new Error('Cannot cancel booking for events that have already passed');
        }
        throw new Error(errorMsg);
      }

      // Remove from list
      setPendingBookings(prev => prev.filter(b => b.id !== bookingId));
      alert('Booking cancelled successfully');
    } catch (err: any) {
      console.error('Error cancelling booking:', err);
      alert('Failed to cancel booking: ' + (err.message || 'Unknown error'));
    } finally {
      setCancellingBooking(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const isEventPast = (dateString: string): boolean => {
    if (!dateString) return false;
    const eventDate = new Date(dateString);
    const now = new Date();
    // Compare dates, accounting for timezone - only consider event past if it's clearly in the past
    // Add a small buffer (1 minute) to account for timing differences
    return eventDate.getTime() < (now.getTime() - 60000); // 1 minute buffer
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#27aae2]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-500 rounded-xl p-4">
        <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
      </div>
    );
  }

  if (pendingBookings.length === 0) {
    return (
      <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Pending Bookings</h3>
        <p className="text-gray-500 dark:text-gray-400">You have no pending bookings that require payment</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-500 rounded-xl p-4 mb-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-yellow-900 dark:text-yellow-200 mb-1">
              Action Required: Complete Your Bookings
            </h3>
            <p className="text-sm text-yellow-800 dark:text-yellow-300">
              You have {pendingBookings.length} pending booking{pendingBookings.length > 1 ? 's' : ''} that require payment. 
              Complete payment to secure your tickets.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        {pendingBookings.map((booking) => (
          <div
            key={booking.id}
            className="bg-white dark:bg-gray-800 rounded-xl border-2 border-orange-200 dark:border-orange-800 shadow-sm hover:shadow-md transition-all p-6"
          >
            <div className="flex flex-col md:flex-row gap-4">
              {/* Event Image */}
              <div className="w-full md:w-32 h-32 rounded-lg overflow-hidden flex-shrink-0 bg-gray-200 dark:bg-gray-700">
                <img
                  src={getImageUrl(booking.event.poster_image)}
                  alt={booking.event.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback if image fails to load
                    (e.target as HTMLImageElement).src = 'https://images.pexels.com/photos/2747449/pexels-photo-2747449.jpeg?auto=compress&cs=tinysrgb&w=400';
                  }}
                />
              </div>

              {/* Booking Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">
                      {booking.event.title}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                      <span className="bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 px-2 py-0.5 rounded-full text-xs font-semibold">
                        PENDING PAYMENT
                      </span>
                      <span className="text-gray-400">•</span>
                      <span className="font-mono text-xs">#{booking.booking_number}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#27aae2] flex-shrink-0" />
                    <span>{formatDate(booking.event.start_date)} at {formatTime(booking.event.start_date)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#27aae2] flex-shrink-0" />
                    <span>{booking.event.venue_name || booking.event.venue_address || 'Location TBA'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#27aae2] flex-shrink-0" />
                    <span>Booked on {formatDate(booking.created_at)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-[#27aae2] flex-shrink-0" />
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {booking.quantity} ticket{booking.quantity > 1 ? 's' : ''} • KES {parseFloat(booking.total_amount.toString()).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2">
                  {!booking.event.is_free && (
                    <button
                      onClick={() => handlePayNow(booking)}
                      disabled={processingPayment === booking.id}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#27aae2] text-white rounded-lg font-semibold hover:bg-[#1e8bb8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <CreditCard className="w-4 h-4" />
                      {processingPayment === booking.id ? 'Processing...' : 'Pay Now'}
                    </button>
                  )}
                  {(() => {
                    const eventIsPast = isEventPast(booking.event.start_date);
                    return (
                  <button
                    onClick={() => handleCancelBooking(booking.id)}
                        disabled={cancellingBooking === booking.id || eventIsPast}
                        title={eventIsPast ? 'Cannot cancel booking for events that have already passed' : ''}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-700 text-red-600 dark:text-red-400 border-2 border-red-200 dark:border-red-800 rounded-lg font-semibold hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <X className="w-4 h-4" />
                    {cancellingBooking === booking.id ? 'Cancelling...' : 'Cancel Booking'}
                  </button>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

