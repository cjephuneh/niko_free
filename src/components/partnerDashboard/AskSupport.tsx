import React, { useState } from 'react';
import { sendSupportMessage } from '../../services/partnerService';

interface AskSupportProps {
  onSent?: () => void;
}

export default function AskSupport({ onSent }: AskSupportProps) {
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    try {
      setIsSubmitting(true);
      await sendSupportMessage('Partner Support Request', message.trim());
      setMessage('');
      if (onSent) onSent();
      alert('Your message has been sent to the admin!');
    } catch (err: any) {
      console.error('Error sending support message:', err);
      alert(err.message || 'Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full mx-auto bg-white dark:bg-gray-900 rounded-xl shadow p-8">
      <h2 className="text-2xl font-bold text-[#27aae2] mb-4">Ask for Support</h2>
      <p className="text-gray-700 dark:text-gray-300 mb-4">Contact the admin directly or send a message below.</p>
      <div className="mb-4 text-left">
        <div className="mb-2">
          <span className="font-semibold text-gray-900 dark:text-white">Admin Phone:</span>
          <a href="tel:+254700123456" className="ml-2 text-[#27aae2] hover:underline">+254 700 123 456</a>
        </div>
        <div>
          <span className="font-semibold text-gray-900 dark:text-white">Admin Email:</span>
          <a href="mailto:admin@niko-free.com" className="ml-2 text-[#27aae2] hover:underline">admin@niko-free.com</a>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="mt-4">
        <textarea
          rows={4}
          placeholder="Type your message to the admin..."
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#27aae2] mb-4"
          required
          value={message}
          onChange={e => setMessage(e.target.value)}
          disabled={isSubmitting}
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full px-4 py-2 bg-[#27aae2] text-white rounded-lg hover:bg-[#1e8bb8] font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Sending...' : 'Send Message'}
        </button>
      </form>
    </div>
  );
}
