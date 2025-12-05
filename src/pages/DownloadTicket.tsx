import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { API_BASE_URL } from '../config/api';
import { Download, AlertCircle, CheckCircle } from 'lucide-react';

export default function DownloadTicket() {
  const { bookingNumber } = useParams<{ bookingNumber: string }>();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!bookingNumber) {
      setError('Invalid booking number');
      setStatus('error');
      return;
    }

    const downloadTicket = async () => {
      try {
        // Fetch the ticket PDF from the public endpoint
        const response = await fetch(`${API_BASE_URL}/api/tickets/download/${bookingNumber}`, {
          method: 'GET',
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Failed to download ticket');
        }

        // Get the PDF blob
        const blob = await response.blob();
        
        // Create a download link
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ticket-${bookingNumber}.pdf`;
        document.body.appendChild(a);
        a.click();
        
        // Cleanup
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        setStatus('success');
      } catch (err: any) {
        console.error('Error downloading ticket:', err);
        setError(err.message || 'Failed to download ticket');
        setStatus('error');
      }
    };

    downloadTicket();
  }, [bookingNumber]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
        {status === 'loading' && (
          <>
            <div className="w-16 h-16 border-4 border-[#27aae2] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Downloading Ticket...
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Please wait while we prepare your ticket
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Download Complete!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Your ticket has been downloaded successfully.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Booking: {bookingNumber}
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Download Failed
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {error || 'Unable to download ticket. The link may have expired or the ticket may not exist.'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Booking: {bookingNumber}
            </p>
          </>
        )}
      </div>
    </div>
  );
}

