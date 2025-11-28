import { Zap, TrendingUp, Star, Loader2, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getPartnerEvents, promoteEvent } from '../../services/partnerService';
import { checkPaymentStatus } from '../../services/paymentService';

export default function BoostEvent() {
  const [selectedEvent, setSelectedEvent] = useState<number | null>(null);
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [durationCount, setDurationCount] = useState<number>(1);
  const [events, setEvents] = useState<any[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [paymentInitiated, setPaymentInitiated] = useState(false);
  const [paymentId, setPaymentId] = useState<number | null>(null);
  const [success, setSuccess] = useState(false);
  const [startDate, setStartDate] = useState<string>('');
  const [startTime, setStartTime] = useState<string>('');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setIsLoadingEvents(true);
      setError('');
      const response = await getPartnerEvents('approved');
      console.log('Events response:', response); // Debug log
      
      // API returns { events: [...], total: ..., page: ..., pages: ... }
      const eventsList = response?.events || [];
      
      if (Array.isArray(eventsList)) {
        // Filter to only show published events (required for promotion)
        const publishedEvents = eventsList.filter((e: any) => e.is_published === true);
        setEvents(publishedEvents);
        
        if (publishedEvents.length === 0 && eventsList.length > 0) {
          setError('You have approved events, but none are published yet. Please publish an event first to promote it.');
        } else if (publishedEvents.length === 0) {
          setError('No approved and published events available. Please create, get approved, and publish an event first.');
        } else {
          setError(''); // Clear any previous errors
        }
      } else {
        setEvents([]);
        setError('Invalid response format from server');
      }
    } catch (err: any) {
      console.error('Error fetching events:', err);
      setError(err.message || 'Failed to load events. Please check your connection and try again.');
      setEvents([]);
    } finally {
      setIsLoadingEvents(false);
    }
  };

  // Poll payment status if payment was initiated
  useEffect(() => {
    if (!paymentInitiated || !paymentId) return;

    const pollInterval = setInterval(async () => {
      try {
        const result = await checkPaymentStatus(paymentId);
        
        if (result.payment?.status === 'completed') {
          clearInterval(pollInterval);
          setPaymentInitiated(false);
          setSuccess(true);
          setTimeout(() => {
            setSuccess(false);
            setSelectedEvent(null);
            setSelectedTier(null);
            setDurationCount(1);
            fetchEvents();
          }, 3000);
        } else if (result.payment?.status === 'failed') {
          clearInterval(pollInterval);
          setPaymentInitiated(false);
          setError('Payment failed. Please try again.');
        }
      } catch (err: any) {
        console.error('Error checking payment status:', err);
      }
    }, 3000); // Poll every 3 seconds

    return () => clearInterval(pollInterval);
  }, [paymentInitiated, paymentId]);

  const boostTiers = [
    {
      id: 'cant-miss',
      name: "Can't Miss!",
      price: 0, // Free for testing
      duration: 'per day',
      description: 'Featured at the top of the homepage',
      features: [
        'Top homepage placement',
        'Priority in search results',
        'Highlighted in category listings',
        'Social media promotion',
        'Newsletter feature'
      ],
      badge: 'Free Test',
      color: 'from-purple-600 to-pink-600',
      isFree: true
    },
    {
      id: 'cant-miss-paid',
      name: "Can't Miss! (Paid)",
      price: 400,
      duration: 'per day',
      description: 'Featured at the top of the homepage',
      features: [
        'Top homepage placement',
        'Priority in search results',
        'Highlighted in category listings',
        'Social media promotion',
        'Newsletter feature'
      ],
      badge: 'Most Popular',
      color: 'from-blue-600 to-cyan-600',
      isFree: false
    }
  ];

  const handleProceedToPayment = async () => {
    if (!selectedEvent || !selectedTier) {
      setError('Please select an event and boost package');
      return;
    }

    // Validate event ID
    if (typeof selectedEvent !== 'number' || selectedEvent <= 0) {
      setError('Invalid event selected. Please select a valid event.');
      return;
    }

    const tier = boostTiers.find(t => t.id === selectedTier);
    if (!tier) {
      setError('Invalid boost package selected');
      return;
    }

    // For free tier, no phone number needed
    if (tier.isFree) {
      if (!phoneNumber.trim()) {
        // Free promotion doesn't need phone
      }
    } else {
      // For paid tier, phone number is required
      if (!phoneNumber.trim()) {
        setError('Please enter your phone number for payment');
        return;
      }
    }

    try {
      setIsProcessing(true);
      setError('');

      console.log('Promoting event:', {
        eventId: selectedEvent,
        daysCount: durationCount,
        isFree: tier.isFree,
        phoneNumber: phoneNumber || undefined
      });

      const result = await promoteEvent(
        selectedEvent,
        durationCount,
        tier.isFree,
        phoneNumber || undefined
      );

      console.log('Promotion result:', result);

      if (tier.isFree) {
        // Free promotion - success immediately
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          setSelectedEvent(null);
          setSelectedTier(null);
          setDurationCount(1);
          fetchEvents();
        }, 3000);
      } else {
        // Paid promotion - payment initiated, poll for status
        if (result.payment_id) {
          setPaymentId(result.payment_id);
          setPaymentInitiated(true);
        } else {
          setError('Payment initiation failed. Please try again.');
        }
      }
    } catch (err: any) {
      console.error('Promotion error:', err);
      // Extract error message from response if available
      const errorMessage = err.message || err.error || 'Failed to promote event. Please try again.';
      setError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const selectedTierData = boostTiers.find(t => t.id === selectedTier);
  const totalCost = selectedTierData 
    ? (selectedTierData.price * durationCount) 
    : 0;

  const calculateEndDate = () => {
    if (!startDate || !startTime) return '';
    try {
      const startDateTime = new Date(`${startDate}T${startTime}`);
      const endDateTime = new Date(startDateTime);
      endDateTime.setDate(endDateTime.getDate() + durationCount);
      
      const year = endDateTime.getFullYear();
      const month = String(endDateTime.getMonth() + 1).padStart(2, '0');
      const day = String(endDateTime.getDate()).padStart(2, '0');
      
      return `${year}-${month}-${day}  Time: ${startTime}`;
    } catch (err) {
      return 'Invalid date';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Boost Your Event</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Increase visibility and reach more attendees
        </p>
      </div>

      {/* Event Selection */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Select Event to Boost
        </label>
        {isLoadingEvents ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-5 h-5 animate-spin text-[#27aae2]" />
            <span className="ml-2 text-gray-600 dark:text-gray-400">Loading events...</span>
          </div>
        ) : (
          <select
            value={selectedEvent || ''}
            onChange={(e) => setSelectedEvent(e.target.value ? parseInt(e.target.value) : null)}
            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[#27aae2] focus:border-transparent"
          >
            <option value="">Choose an event...</option>
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.title}
              </option>
            ))}
          </select>
        )}
        {error && !isLoadingEvents && (
          <p className="text-sm text-red-500 dark:text-red-400 mt-2">
            {error}
          </p>
        )}
        {events.length === 0 && !isLoadingEvents && !error && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            No approved events available. Please create and get an event approved first.
          </p>
        )}
      </div>

      {/* Boost Tiers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {boostTiers.map((tier) => (
          <div
            key={tier.id}
            className={`bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all ${
              selectedTier === tier.id ? 'ring-2 ring-[#27aae2]' : ''
            }`}
          >
            {/* Header with gradient */}
            <div className={`bg-gradient-to-r ${tier.color} p-6 text-white relative`}>
              {tier.badge && (
                <div className="absolute top-4 right-4">
                  <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold">
                    {tier.badge}
                  </span>
                </div>
              )}
              <Zap className="w-10 h-10 mb-3" />
              <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
              <p className="text-white/90 text-sm">{tier.description}</p>
            </div>

            <div className="p-6">
              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline space-x-2 mt-1">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">
                    KES {tier.price.toLocaleString()}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">
                    {tier.duration}
                  </span>
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-6">
                {tier.features.map((feature, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <Star className="w-5 h-5 text-[#27aae2] flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 dark:text-gray-300 text-sm">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {/* Select Button */}
              <button
                onClick={() => { setSelectedTier(tier.id); setDurationCount(1); }}
                disabled={!selectedEvent}
                className={`w-full py-3 rounded-xl font-semibold transition-all ${
                  selectedTier === tier.id
                    ? 'bg-[#27aae2] text-white'
                    : selectedEvent
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                }`}
              >
                {selectedTier === tier.id ? 'Selected' : 'Select Plan'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Checkout Section */}
      {selectedEvent && selectedTier && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Complete Your Boost
          </h3>

          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">Selected Event</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {events.find(e => e.id === selectedEvent)?.title}
              </span>
            </div>

            <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">Boost Package</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {selectedTierData?.name}
              </span>
            </div>

            <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">Start Date</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-40 px-3 py-2 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-center"
              />
            </div>

            <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">Start Time</span>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-40 px-3 py-2 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-center"
              />
            </div>

            {startDate && startTime && (
              <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">End Date and Time</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {calculateEndDate()}
                </span>
              </div>
            )}

            <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">Duration</span>
              <div className="text-right">
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={durationCount}
                  onChange={(e) => setDurationCount(Math.max(1, parseInt(e.target.value || '1')))}
                  className="w-20 px-3 py-2 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-center"
                />
                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                  days
                </span>
              </div>
            </div>

            {/* Phone Number Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Phone Number {selectedTierData?.isFree ? '(Optional)' : '(Required for payment)'}
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="254712345678"
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-[#27aae2] focus:border-transparent"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Enter your M-Pesa phone number
              </p>
            </div>

            <div className="flex justify-between items-center pt-4">
              <span className="text-xl font-bold text-gray-900 dark:text-white">Total</span>
              <span className="text-2xl font-bold text-[#27aae2]">
                KES {totalCost.toLocaleString()}
              </span>
            </div>

            {/* Success Message */}
            {success && (
              <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-500 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <p className="text-sm font-medium text-green-900 dark:text-green-300">
                    Event promoted successfully!
                  </p>
                </div>
              </div>
            )}

            {/* Payment Status */}
            {paymentInitiated && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-300">
                      M-Pesa STK Push sent! Please check your phone to complete payment.
                    </p>
                    <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                      Enter your M-Pesa PIN when prompted. Waiting for payment confirmation...
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && !paymentInitiated && !success && (
              <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-500 rounded-lg p-3">
                <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
              </div>
            )}

            <button 
              onClick={handleProceedToPayment}
              disabled={isProcessing || paymentInitiated || success}
              className="w-full bg-[#27aae2] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#1e8bc3] transition-all shadow-lg mt-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : paymentInitiated ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Waiting for Payment...</span>
                </>
              ) : success ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  <span>Success!</span>
                </>
              ) : (
                <span>Proceed to Payment</span>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Info Section */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6">
        <div className="flex items-start space-x-3">
          <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
              Why boost your event?
            </h4>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Boosted events receive 3-5x more views and 2-3x more bookings on average.
              Stand out from the competition and maximize your event's potential.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
