import { Calendar, MapPin, Download, QrCode, Share2, Ticket, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useState } from 'react';

interface TicketData {
  id: string;
  eventTitle: string;
  eventImage: string;
  date: string;
  time: string;
  location: string;
  ticketId: string;
  ticketType: string;
  price: string;
  status: 'active' | 'used' | 'cancelled';
  qrCode?: string;
  orderNumber: string;
  purchaseDate: string;
}

export default function MyTickets() {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'active' | 'used' | 'cancelled'>('all');
  const [selectedTicket, setSelectedTicket] = useState<TicketData | null>(null);

  const tickets: TicketData[] = [
    {
      id: '1',
      eventTitle: 'Nairobi Tech Summit 2025',
      eventImage: 'https://images.pexels.com/photos/2747449/pexels-photo-2747449.jpeg?auto=compress&cs=tinysrgb&w=400',
      date: 'Sat, Nov 2, 2025',
      time: '9:00 AM - 6:00 PM',
      location: 'KICC, Nairobi',
      ticketId: 'TKT-2025-001',
      ticketType: 'VIP Pass',
      price: 'KES 2,500',
      status: 'active',
      qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=TKT-2025-001',
      orderNumber: 'ORD-20251025-001',
      purchaseDate: 'Oct 25, 2025'
    },
    {
      id: '2',
      eventTitle: 'Morning Yoga in the Park',
      eventImage: 'https://images.pexels.com/photos/3822647/pexels-photo-3822647.jpeg?auto=compress&cs=tinysrgb&w=400',
      date: 'Sun, Nov 3, 2025',
      time: '6:00 AM - 8:00 AM',
      location: 'Karura Forest',
      ticketId: 'TKT-2025-002',
      ticketType: 'General Admission',
      price: 'Free',
      status: 'active',
      qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=TKT-2025-002',
      orderNumber: 'ORD-20251026-002',
      purchaseDate: 'Oct 26, 2025'
    },
    {
      id: '3',
      eventTitle: 'Startup Networking Mixer',
      eventImage: 'https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=400',
      date: 'Wed, Nov 10, 2025',
      time: '6:00 PM - 9:00 PM',
      location: 'iHub Nairobi',
      ticketId: 'TKT-2025-003',
      ticketType: 'Early Bird',
      price: 'KES 1,000',
      status: 'active',
      qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=TKT-2025-003',
      orderNumber: 'ORD-20251027-003',
      purchaseDate: 'Oct 27, 2025'
    },
    {
      id: '4',
      eventTitle: 'Jazz Night Live',
      eventImage: 'https://images.pexels.com/photos/1481308/pexels-photo-1481308.jpeg?auto=compress&cs=tinysrgb&w=400',
      date: 'Sat, Oct 25, 2025',
      time: '7:00 PM - 11:00 PM',
      location: 'Alliance Française',
      ticketId: 'TKT-2025-004',
      ticketType: 'Standard',
      price: 'KES 1,500',
      status: 'used',
      qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=TKT-2025-004',
      orderNumber: 'ORD-20251020-004',
      purchaseDate: 'Oct 20, 2025'
    },
    {
      id: '5',
      eventTitle: 'Food & Wine Tasting',
      eventImage: 'https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=400',
      date: 'Sun, Oct 15, 2025',
      time: '12:00 PM - 4:00 PM',
      location: 'Villa Rosa Kempinski',
      ticketId: 'TKT-2025-005',
      ticketType: 'Premium',
      price: 'KES 3,500',
      status: 'used',
      qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=TKT-2025-005',
      orderNumber: 'ORD-20251010-005',
      purchaseDate: 'Oct 10, 2025'
    },
    {
      id: '6',
      eventTitle: 'Photography Workshop',
      eventImage: 'https://images.pexels.com/photos/2833392/pexels-photo-2833392.jpeg?auto=compress&cs=tinysrgb&w=400',
      date: 'Sat, Oct 5, 2025',
      time: '10:00 AM - 2:00 PM',
      location: 'Nairobi National Park',
      ticketId: 'TKT-2025-006',
      ticketType: 'Workshop Pass',
      price: 'KES 2,000',
      status: 'cancelled',
      qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=TKT-2025-006',
      orderNumber: 'ORD-20250928-006',
      purchaseDate: 'Sep 28, 2025'
    }
  ];

  const filteredTickets = tickets.filter(ticket => {
    if (selectedFilter === 'all') return true;
    return ticket.status === selectedFilter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <div className="flex items-center space-x-0.5 sm:space-x-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
            <CheckCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            <span className="text-xs font-semibold">Active</span>
          </div>
        );
      case 'used':
        return (
          <div className="flex items-center space-x-0.5 sm:space-x-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
            <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            <span className="text-xs font-semibold">Used</span>
          </div>
        );
      case 'cancelled':
        return (
          <div className="flex items-center space-x-0.5 sm:space-x-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
            <XCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            <span className="text-xs font-semibold">Cancelled</span>
          </div>
        );
      default:
        return null;
    }
  };

  const handleDownloadTicket = (ticket: TicketData) => {
    // In a real app, this would generate a PDF
    console.log('Downloading ticket:', ticket.ticketId);
    alert(`Downloading ticket ${ticket.ticketId}`);
  };

  const handleShareTicket = (ticket: TicketData) => {
    // In a real app, this would open a share dialog
    const shareText = `I'm attending ${ticket.eventTitle}! 🎉`;
    console.log('Sharing:', shareText);
    alert(`Share: ${shareText}`);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-0.5 sm:mb-1">My Tickets</h1>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Manage all your event tickets</p>
        </div>
        
        {/* Filter Buttons - Responsive */}
        <div className="flex items-center overflow-x-auto bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl p-0.5 sm:p-1 border border-gray-200 dark:border-gray-700 scrollbar-hide">
          <button
            onClick={() => setSelectedFilter('all')}
            className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              selectedFilter === 'all'
                ? 'bg-[#27aae2] text-white'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            All ({tickets.length})
          </button>
          <button
            onClick={() => setSelectedFilter('active')}
            className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              selectedFilter === 'active'
                ? 'bg-[#27aae2] text-white'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            Active ({tickets.filter(t => t.status === 'active').length})
          </button>
          <button
            onClick={() => setSelectedFilter('used')}
            className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              selectedFilter === 'used'
                ? 'bg-[#27aae2] text-white'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            Used ({tickets.filter(t => t.status === 'used').length})
          </button>
          <button
            onClick={() => setSelectedFilter('cancelled')}
            className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              selectedFilter === 'cancelled'
                ? 'bg-[#27aae2] text-white'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            Cancelled ({tickets.filter(t => t.status === 'cancelled').length})
          </button>
        </div>
      </div>

      {/* Tickets Grid */}
      {filteredTickets.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-2xl border border-gray-200 dark:border-gray-700 p-6 sm:p-12 text-center">
          <Ticket className="w-10 h-10 sm:w-16 sm:h-16 text-gray-300 dark:text-gray-600 mx-auto mb-2 sm:mb-3" />
          <h3 className="text-base sm:text-xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">No tickets found</h3>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">You don't have any {selectedFilter !== 'all' ? selectedFilter : ''} tickets yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
          {filteredTickets.map((ticket) => (
            <div
              key={ticket.id}
              className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all"
            >
              {/* Ticket Header with Image */}
              <div className="relative h-28 sm:h-36">
                <img
                  src={ticket.eventImage}
                  alt={ticket.eventTitle}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-1.5 sm:top-2 right-1.5 sm:right-2">
                  {getStatusBadge(ticket.status)}
                </div>
              </div>

              {/* Ticket Content */}
              <div className="p-3 sm:p-4">
                <h3 className="text-sm sm:text-lg font-bold text-gray-900 dark:text-white mb-2 sm:mb-3 line-clamp-1">{ticket.eventTitle}</h3>

                {/* Event Details - Compact */}
                <div className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4">
                  <div className="flex items-start space-x-1.5 sm:space-x-2">
                    <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#27aae2] mt-0.5 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white truncate">{ticket.date}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{ticket.time}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-1.5 sm:space-x-2">
                    <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#27aae2] mt-0.5 flex-shrink-0" />
                    <p className="text-xs sm:text-sm text-gray-900 dark:text-white truncate">{ticket.location}</p>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-start space-x-1.5 sm:space-x-2 min-w-0 flex-1">
                      <Ticket className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#27aae2] mt-0.5 flex-shrink-0" />
                      <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white truncate">{ticket.ticketType}</p>
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-[#27aae2] whitespace-nowrap">{ticket.price}</span>
                  </div>
                  <div className="flex items-start space-x-1.5 sm:space-x-2">
                    <QrCode className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#27aae2] mt-0.5 flex-shrink-0" />
                    <p className="text-xs font-mono font-semibold text-gray-900 dark:text-white">{ticket.ticketId}</p>
                  </div>
                </div>

                {/* Action Buttons - Mobile Optimized */}
                <div className="flex gap-1.5 sm:gap-2 pt-2.5 sm:pt-3 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => setSelectedTicket(ticket)}
                    disabled={ticket.status === 'cancelled'}
                    className={`flex-1 py-1.5 sm:py-2 rounded-md sm:rounded-lg font-semibold text-xs sm:text-sm transition-all flex items-center justify-center space-x-1 sm:space-x-1.5 ${
                      ticket.status === 'cancelled'
                        ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                        : 'bg-[#27aae2] text-white hover:bg-[#1e8bb8]'
                    }`}
                  >
                    <QrCode className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    <span className="hidden xs:inline sm:hidden">QR</span>
                    <span className="hidden sm:inline">View QR</span>
                  </button>
                  <button
                    onClick={() => handleDownloadTicket(ticket)}
                    className="p-1.5 sm:p-2 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-md sm:rounded-lg font-semibold hover:border-[#27aae2] hover:text-[#27aae2] transition-all"
                    title="Download"
                  >
                    <Download className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </button>
                  <button
                    onClick={() => handleShareTicket(ticket)}
                    disabled={ticket.status === 'cancelled'}
                    className={`p-1.5 sm:p-2 border rounded-md sm:rounded-lg font-semibold transition-all ${
                      ticket.status === 'cancelled'
                        ? 'border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                        : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-[#27aae2] hover:text-[#27aae2]'
                    }`}
                    title="Share"
                  >
                    <Share2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* QR Code Modal */}
      {selectedTicket && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4"
          onClick={() => setSelectedTicket(null)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl max-w-xs sm:max-w-sm w-full p-4 sm:p-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <h3 className="text-base sm:text-2xl font-bold text-gray-900 dark:text-white mb-0.5 sm:mb-1 line-clamp-2">{selectedTicket.eventTitle}</h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3 sm:mb-6">{selectedTicket.date}</p>

              {/* QR Code */}
              <div className="bg-white p-3 sm:p-6 rounded-xl sm:rounded-2xl mb-3 sm:mb-6 inline-block">
                <img
                  src={selectedTicket.qrCode}
                  alt="QR Code"
                  className="w-40 h-40 sm:w-56 sm:h-56 mx-auto"
                />
              </div>

              {/* Ticket ID */}
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg sm:rounded-xl p-2.5 sm:p-4 mb-3 sm:mb-6">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-0.5 sm:mb-1">Ticket ID</p>
                <p className="text-xs sm:text-lg font-mono font-bold text-gray-900 dark:text-white break-all">{selectedTicket.ticketId}</p>
              </div>

              <button
                onClick={() => setSelectedTicket(null)}
                className="w-full py-2 sm:py-3 bg-[#27aae2] text-white rounded-lg sm:rounded-xl font-semibold hover:bg-[#1e8bb8] transition-colors text-sm sm:text-base"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
