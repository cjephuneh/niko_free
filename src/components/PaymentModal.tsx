import { useState, useEffect } from 'react';
import { X, Phone, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { initiatePayment, checkPaymentStatus } from '../services/paymentService';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: number;
  amount: number;
  eventTitle: string;
  onPaymentSuccess?: () => void;
  onNavigate?: (page: string) => void;
}

export default function PaymentModal({
  isOpen,
  onClose,
  bookingId,
  amount: initialAmount,
  eventTitle,
  onPaymentSuccess,
  onNavigate
}: PaymentModalProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentInitiated, setPaymentInitiated] = useState(false);
  const [paymentId, setPaymentId] = useState<number | null>(null);
  const [checkoutRequestId, setCheckoutRequestId] = useState<string | null>(null);
  const [displayAmount, setDisplayAmount] = useState(initialAmount);
  const [paymentCompleted, setPaymentCompleted] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      // Reset state when modal closes
      setPhoneNumber('');
      setError('');
      setPaymentInitiated(false);
      setPaymentId(null);
      setCheckoutRequestId(null);
      setDisplayAmount(initialAmount);
      setPaymentCompleted(false);
    } else {
      // Update amount when modal opens
      setDisplayAmount(initialAmount);
    }
  }, [isOpen, initialAmount]);

  // Poll payment status if payment was initiated
  useEffect(() => {
    if (!paymentInitiated || !paymentId) return;

    const pollInterval = setInterval(async () => {
      try {
        const result = await checkPaymentStatus(paymentId);
        
        if (result.payment?.status === 'completed') {
          clearInterval(pollInterval);
          setPaymentCompleted(true);
          
          // Call success callback
          if (onPaymentSuccess) {
            onPaymentSuccess();
          }
          
          // Show success message for 2 seconds, then redirect to dashboard
          setTimeout(() => {
            onClose();
            // Navigate to user dashboard
            if (onNavigate) {
              onNavigate('user-dashboard');
            }
          }, 2000);
        } else if (result.payment?.status === 'failed') {
          clearInterval(pollInterval);
          const errorMsg = result.payment?.error_message || '';
          // Check if it's a validation error (ResultCode 2001)
          if (errorMsg.toLowerCase().includes('initiator') || errorMsg.toLowerCase().includes('invalid')) {
            setError('Payment validation failed. Please ensure your phone number is registered for M-Pesa. If testing, use a registered test number.');
          } else {
            setError('Payment failed. Please try again.');
          }
          setPaymentInitiated(false);
        }
      } catch (err: any) {
        console.error('Error checking payment status:', err);
      }
    }, 3000); // Check every 3 seconds

    // Stop polling after 5 minutes
    const timeout = setTimeout(() => {
      clearInterval(pollInterval);
    }, 300000);

    return () => {
      clearInterval(pollInterval);
      clearTimeout(timeout);
    };
  }, [paymentInitiated, paymentId, onPaymentSuccess, onClose, onNavigate]);

  const formatPhoneNumber = (phone: string): string => {
    // Remove all non-digits
    let cleaned = phone.replace(/\D/g, '');
    
    // If starts with 0, replace with 254
    if (cleaned.startsWith('0')) {
      cleaned = '254' + cleaned.substring(1);
    }
    // If doesn't start with 254, add it
    else if (!cleaned.startsWith('254')) {
      cleaned = '254' + cleaned;
    }
    
    return cleaned;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!phoneNumber.trim()) {
      setError('Please enter your phone number');
      return;
    }

    // Validate phone number format (should be 12 digits starting with 254)
    const formattedPhone = formatPhoneNumber(phoneNumber);
    if (formattedPhone.length !== 12) {
      setError('Please enter a valid phone number (e.g., 0712345678 or 254712345678)');
      return;
    }

    setIsLoading(true);

    try {
      console.log('Initiating payment for booking:', bookingId, 'with phone:', formattedPhone);
      
      const result = await initiatePayment({
        booking_id: bookingId,
        phone_number: formattedPhone,
      });

      console.log('Payment initiation result:', result);

      // Update amount from API response if available and prop amount is 0
      if (result.amount && (displayAmount === 0 || !displayAmount)) {
        setDisplayAmount(result.amount);
      }

      if (result.payment_id && result.checkout_request_id) {
        setPaymentId(result.payment_id);
        setCheckoutRequestId(result.checkout_request_id);
        setPaymentInitiated(true);
        setIsLoading(false);
      } else if (result.checkout_request_id) {
        // Some APIs might return checkout_request_id directly
        setPaymentId(result.payment_id || bookingId);
        setCheckoutRequestId(result.checkout_request_id);
        setPaymentInitiated(true);
        setIsLoading(false);
      } else {
        throw new Error(result.message || 'Failed to initiate payment');
      }
    } catch (err: any) {
      console.error('Payment initiation error:', err);
      setError(err.message || 'Failed to initiate payment. Please try again.');
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 max-w-md w-full mx-4 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {!paymentInitiated ? (
          <>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Complete Payment
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Enter your M-Pesa phone number to receive a payment request
            </p>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3">
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 dark:text-white mb-1">{eventTitle}</p>
                  <p className="text-2xl font-bold text-[#27aae2]">
                    KES {displayAmount > 0 ? displayAmount.toLocaleString() : '0.00'}
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Phone className="w-4 h-4 inline mr-1" />
                  M-Pesa Phone Number
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="0712345678 or 254712345678"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#27aae2]"
                  disabled={isLoading}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Enter the phone number registered with M-Pesa
                </p>
              </div>

              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 flex items-start space-x-2">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !phoneNumber.trim()}
                  className="flex-1 px-4 py-3 bg-[#27aae2] text-white rounded-lg hover:bg-[#1e8bb8] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    'Pay with M-Pesa'
                  )}
                </button>
              </div>
            </form>
          </>
        ) : paymentCompleted ? (
          <div className="text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Ticket Bought! 🎉
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Your payment was successful. Your tickets have been confirmed!
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Redirecting to your dashboard...
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Payment Request Sent!
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Please check your phone and enter your M-Pesa PIN to complete the payment.
              </p>
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <strong>Amount:</strong> KES {displayAmount > 0 ? displayAmount.toLocaleString() : '0.00'}
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                  <strong>Phone:</strong> {phoneNumber}
                </p>
              </div>
              <div className="flex items-center justify-center space-x-2 text-gray-600 dark:text-gray-400">
                <Loader2 className="w-5 h-5 animate-spin" />
                <p className="text-sm">Waiting for payment confirmation...</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            >
              I'll complete this later
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

