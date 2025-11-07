import { Calendar, MapPin, Clock, Users, Share2, Heart, Download, ArrowLeft, Ticket as TicketIcon, Star } from 'lucide-react';
import { useState } from 'react';

interface EventDetailProps {
  event: {
    id: string;
    title: string;
    image: string;
    date: string;
    time?: string;
    location: string;
    price?: string;
    ticketId?: string;
    description?: string;
    category?: string;
    attendees?: number;
    rating?: number;
    organizer?: {
      name: string;
      avatar: string;
    };
  };
  onBack: () => void;
}

export default function EventDetail({ event, onBack }: EventDetailProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  // Default values
  const eventData = {
    ...event,
    time: event.time || 'TBA',
    description: event.description || 'Join us for an amazing event experience! This is a great opportunity to connect with like-minded individuals and enjoy a memorable time together.',
    category: event.category || 'General',
    attendees: event.attendees || 234,
    rating: event.rating || 4.8,
    organizer: event.organizer || {
      name: 'Event Organizer',
      avatar: 'https://i.pravatar.cc/100?img=25'
    }
  };

  const handleShare = (platform: string) => {
    const eventUrl = window.location.href;
    const shareText = `Check out this event: ${eventData.title}`;

    switch (platform) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(`${shareText}\n${eventUrl}`)}`, '_blank');
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(eventUrl)}`, '_blank');
        break;
      case 'copy':
        navigator.clipboard.writeText(eventUrl);
        alert('Link copied to clipboard!');
        break;
    }
    setShowShareMenu(false);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
        <span className="text-sm sm:text-base font-semibold">Back to Events</span>
      </button>

      {/* Event Header Image */}
      <div className="relative h-64 sm:h-80 lg:h-96 rounded-xl sm:rounded-2xl overflow-hidden">
        <img
          src={eventData.image}
          alt={eventData.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        
        {/* Category Badge */}
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 bg-[#27aae2] text-white text-xs sm:text-sm font-semibold rounded-full">
            {eventData.category}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="absolute top-4 right-4 flex gap-2">
          <button
            onClick={() => setIsLiked(!isLiked)}
            className="p-2 sm:p-2.5 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full hover:scale-110 transition-transform"
          >
            <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-700 dark:text-gray-300'}`} />
          </button>
          <div className="relative">
            <button
              onClick={() => setShowShareMenu(!showShareMenu)}
              className="p-2 sm:p-2.5 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full hover:scale-110 transition-transform"
            >
              <Share2 className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700 dark:text-gray-300" />
            </button>
            
            {/* Share Menu */}
            {showShareMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-10">
                <button
                  onClick={() => handleShare('whatsapp')}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Share on WhatsApp
                </button>
                <button
                  onClick={() => handleShare('linkedin')}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Share on LinkedIn
                </button>
                <button
                  onClick={() => handleShare('copy')}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Copy Link
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Event Title */}
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">
            {eventData.title}
          </h1>
          <div className="flex items-center gap-4 text-white/90">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-semibold">{eventData.rating}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span className="text-sm">{eventData.attendees} attending</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left Column - Event Details */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Date & Time */}
          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4">When & Where</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#27aae2]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-[#27aae2]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Date</p>
                  <p className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">{eventData.date}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#27aae2]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-[#27aae2]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Time</p>
                  <p className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">{eventData.time}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#27aae2]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-[#27aae2]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Location</p>
                  <p className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">{eventData.location}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4">About This Event</h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
              {eventData.description}
            </p>
          </div>

          {/* Organizer */}
          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4">Organized By</h2>
            <div className="flex items-center gap-4">
              <img
                src={eventData.organizer.avatar}
                alt={eventData.organizer.name}
                className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover"
              />
              <div>
                <p className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">{eventData.organizer.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Event Organizer</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Ticket Info */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6 sticky top-24">
            {eventData.ticketId ? (
              <>
                {/* Booked Ticket */}
                <div className="text-center mb-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full mb-4">
                    <TicketIcon className="w-4 h-4" />
                    <span className="text-sm font-semibold">Ticket Booked</span>
                  </div>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 mb-4">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Ticket ID</p>
                  <p className="text-sm sm:text-base font-mono font-bold text-gray-900 dark:text-white">{eventData.ticketId}</p>
                </div>

                <div className="space-y-2">
                  <button className="w-full py-2.5 sm:py-3 bg-[#27aae2] text-white rounded-lg font-semibold hover:bg-[#1e8bb8] transition-colors flex items-center justify-center gap-2">
                    <TicketIcon className="w-4 h-4" />
                    <span>View Ticket</span>
                  </button>
                  <button className="w-full py-2.5 sm:py-3 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:border-[#27aae2] hover:text-[#27aae2] transition-all flex items-center justify-center gap-2">
                    <Download className="w-4 h-4" />
                    <span>Download</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Available Ticket */}
                <div className="mb-6">
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-2">Price</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                    {eventData.price || 'Free'}
                  </p>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Service Fee</span>
                    <span className="font-semibold text-gray-900 dark:text-white">Free</span>
                  </div>
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-3 flex items-center justify-between">
                    <span className="font-semibold text-gray-900 dark:text-white">Total</span>
                    <span className="text-lg font-bold text-[#27aae2]">{eventData.price || 'Free'}</span>
                  </div>
                </div>

                <button className="w-full py-3 sm:py-3.5 bg-[#27aae2] text-white rounded-lg font-semibold hover:bg-[#1e8bb8] transition-colors text-sm sm:text-base">
                  Book Ticket
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
