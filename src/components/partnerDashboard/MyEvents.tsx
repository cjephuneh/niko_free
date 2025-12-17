import { Calendar, MapPin, Users, Heart, Plus, Trash2, Edit, Sparkles, X, AlertTriangle, Clock, DollarSign, Tag, ToggleLeft, ToggleRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getPartnerEvents, deleteEvent, updatePromoCode, deletePromoCode } from '../../services/partnerService';
import { API_BASE_URL, API_ENDPOINTS } from '../../config/api';
import CreateEvent from './CreateEvent';
import PromoteEventModal from './PromoteEventModal';

interface MyEventsProps {
  onCreateEvent: () => void;
}

export default function MyEvents({ onCreateEvent }: MyEventsProps) {
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'ongoing' | 'past' | 'pending'>('all');
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [editEventId, setEditEventId] = useState<number | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [promoteEventId, setPromoteEventId] = useState<number | null>(null);
  const [isPromoteModalOpen, setIsPromoteModalOpen] = useState(false);
  const [deleteConfirmEventId, setDeleteConfirmEventId] = useState<number | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [showEventDetailsModal, setShowEventDetailsModal] = useState(false);
  const [selectedEventForDetails, setSelectedEventForDetails] = useState<any>(null);
  const [editingPromoCode, setEditingPromoCode] = useState<any>(null);
  const [isPromoCodeEditModalOpen, setIsPromoCodeEditModalOpen] = useState(false);
  const [promoCodeFormData, setPromoCodeFormData] = useState({
    code: '',
    discount_type: 'percentage',
    discount_value: 0,
    max_uses: null as number | null,
    max_uses_per_user: 1,
    valid_from: '',
    valid_until: '',
    is_active: true,
  });
  
  // Fetch events on mount and when filter changes
  useEffect(() => {
    fetchEvents();
  }, [filter]);

  // Expose refresh function via window for CreateEvent to call
  useEffect(() => {
    (window as any).refreshPartnerEvents = fetchEvents;
    return () => {
      delete (window as any).refreshPartnerEvents;
    };
  }, []);

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      // Map filter to API status
      let apiStatus: string | undefined;
      if (filter === 'pending') {
        apiStatus = 'pending';
      } else if (filter === 'all') {
        apiStatus = undefined; // Get all
      } else {
        // For upcoming, ongoing, past - we'll filter client-side based on dates
        apiStatus = 'approved'; // Get approved events and filter by date
      }
      
      const response = await getPartnerEvents(apiStatus);
      
      if (response.events) {
        let filteredEvents = response.events;
        
        // Filter by date for upcoming, ongoing, past
        if (filter !== 'all' && filter !== 'pending') {
          const now = new Date();
          filteredEvents = response.events.filter((event: any) => {
            const startDate = new Date(event.start_date);
            const endDate = event.end_date ? new Date(event.end_date) : startDate;
            
            if (filter === 'upcoming') {
              return startDate > now && event.status === 'approved';
            } else if (filter === 'ongoing') {
              return startDate <= now && endDate >= now && event.status === 'approved';
            } else if (filter === 'past') {
              return endDate < now && event.status === 'approved';
            }
            return true;
          });
        }
        
        setEvents(filteredEvents);
      }
    } catch (err: any) {
      console.error('Error fetching events:', err);
      setError(err.message || 'Failed to load events');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId: number) => {
    setDeleteConfirmEventId(eventId);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteConfirmEventId) return;
    
    try {
      setIsLoading(true);
      setError('');
      setIsDeleteModalOpen(false);
      await deleteEvent(deleteConfirmEventId);
      setEvents(prev => prev.filter(event => event.id !== deleteConfirmEventId));
      toast.success('Event deleted successfully!', {
        position: 'top-right',
        autoClose: 3000,
      });
    } catch (err: any) {
      console.error('Error deleting event:', err);
      const errorMessage = err.message || 'Failed to delete event';
      setError(errorMessage);
      toast.error(errorMessage, {
        position: 'top-right',
        autoClose: 5000,
      });
    } finally {
      setIsLoading(false);
      setDeleteConfirmEventId(null);
    }
  };

  const cancelDelete = () => {
    setIsDeleteModalOpen(false);
    setDeleteConfirmEventId(null);
  };

  const handleEditEvent = (eventId: number) => {
    setEditEventId(eventId);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditEventId(null);
    // Refresh events after edit
    fetchEvents();
  };

  const handlePromoteEvent = (eventId: number) => {
    setPromoteEventId(eventId);
    setIsPromoteModalOpen(true);
  };

  const handleClosePromoteModal = () => {
    setPromoteEventId(null);
    setIsPromoteModalOpen(false);
  };

  const handlePromotionSuccess = () => {
    fetchEvents(); // Refresh events list
  };

  const handleEditPromoCode = (promo: any) => {
    setEditingPromoCode(promo);
    setPromoCodeFormData({
      code: promo.code || '',
      discount_type: promo.discount_type || 'percentage',
      discount_value: promo.discount_value || 0,
      max_uses: promo.max_uses || null,
      max_uses_per_user: promo.max_uses_per_user || 1,
      valid_from: promo.valid_from ? new Date(promo.valid_from).toISOString().split('T')[0] : '',
      valid_until: promo.valid_until ? new Date(promo.valid_until).toISOString().split('T')[0] : '',
      is_active: promo.is_active !== false,
    });
    setIsPromoCodeEditModalOpen(true);
  };

  const handleDeletePromoCode = async (promoCodeId: number) => {
    if (!selectedEventForDetails) return;
    
    if (!window.confirm('Are you sure you want to delete this promo code?')) {
      return;
    }

    try {
      setIsLoading(true);
      await deletePromoCode(selectedEventForDetails.id, promoCodeId);
      
      // Refresh event details by fetching the event again
      const updatedPromoCodes = (selectedEventForDetails.promo_codes || []).filter((p: any) => p.id !== promoCodeId);
      setSelectedEventForDetails({
        ...selectedEventForDetails,
        promo_codes: updatedPromoCodes,
      });
      
      // Also update in events list
      setEvents(prev => prev.map(e => 
        e.id === selectedEventForDetails.id 
          ? { ...e, promo_codes: updatedPromoCodes }
          : e
      ));
      
      toast.success('Promo code deleted successfully!');
    } catch (err: any) {
      console.error('Error deleting promo code:', err);
      toast.error(err.message || 'Failed to delete promo code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePromoCode = async () => {
    if (!editingPromoCode || !selectedEventForDetails) return;

    if (!promoCodeFormData.code.trim()) {
      toast.error('Promo code is required');
      return;
    }

    if (promoCodeFormData.discount_value <= 0) {
      toast.error('Discount value must be greater than 0');
      return;
    }

    try {
      setIsLoading(true);
      const updateData: any = {
        code: promoCodeFormData.code.toUpperCase().trim(),
        discount_type: promoCodeFormData.discount_type,
        discount_value: promoCodeFormData.discount_value,
        max_uses: promoCodeFormData.max_uses || null,
        max_uses_per_user: promoCodeFormData.max_uses_per_user,
        is_active: promoCodeFormData.is_active,
      };

      if (promoCodeFormData.valid_from) {
        updateData.valid_from = new Date(promoCodeFormData.valid_from).toISOString();
      }
      if (promoCodeFormData.valid_until) {
        updateData.valid_until = new Date(promoCodeFormData.valid_until).toISOString();
      }

      const result = await updatePromoCode(selectedEventForDetails.id, editingPromoCode.id, updateData);
      
      // Update with the response data
      const updatedPromoCodes = (selectedEventForDetails.promo_codes || []).map((p: any) => 
        p.id === editingPromoCode.id ? result.promo_code : p
      );
      
      setSelectedEventForDetails({
        ...selectedEventForDetails,
        promo_codes: updatedPromoCodes,
      });
      
      // Also update in events list
      setEvents(prev => prev.map(e => 
        e.id === selectedEventForDetails.id 
          ? { ...e, promo_codes: updatedPromoCodes }
          : e
      ));
      
      setIsPromoCodeEditModalOpen(false);
      setEditingPromoCode(null);
      toast.success('Promo code updated successfully!');
    } catch (err: any) {
      console.error('Error updating promo code:', err);
      toast.error(err.message || 'Failed to update promo code');
    } finally {
      setIsLoading(false);
    }
  };

  const getEventStatus = (event: any): string => {
    if (event.status === 'pending') return 'pending';
    if (event.status === 'rejected') return 'rejected';
    
    const now = new Date();
    const startDate = new Date(event.start_date);
    const endDate = event.end_date ? new Date(event.end_date) : startDate;
    
    if (startDate > now) return 'upcoming';
    if (startDate <= now && endDate >= now) return 'ongoing';
    return 'past';
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getTotalTickets = (event: any): number => {
    if (event.ticket_types && event.ticket_types.length > 0) {
      return event.ticket_types.reduce((sum: number, tt: any) => sum + (tt.quantity_total || 0), 0);
    }
    return 0;
  };

  const getTicketsSold = (event: any): number => {
    return event.total_tickets_sold || 0;
  };

  const getEventImage = (event: any): string => {
    if (event.poster_image) {
      // Skip base64 data URIs - they shouldn't be in the database
      if (event.poster_image.startsWith('data:image')) {
        return 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400&h=250&fit=crop';
      }
      if (event.poster_image.startsWith('http')) {
        return event.poster_image;
      }
      // Handle paths like /uploads/events/filename.jpg
      return `${API_BASE_URL}${event.poster_image.startsWith('/') ? '' : '/'}${event.poster_image}`;
    }
    return 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400&h=250&fit=crop';
  };

  const getEventLocation = (event: any): string => {
    if (event.is_online && event.online_link) {
      return 'Online Event';
    }
    return event.venue_name || event.venue_address || 'Location TBD';
  };

  const handleEventClick = (event: any) => {
    setSelectedEventForDetails(event);
    setShowEventDetailsModal(true);
  };

  const handleToggleTicket = async (ticketTypeId: number, currentStatus: boolean) => {
    try {
      const { getPartnerToken } = await import('../../services/partnerService');
      const token = getPartnerToken();
      
      const response = await fetch(API_ENDPOINTS.partner.toggleTicket(ticketTypeId), {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const newStatus = data.ticket_type?.is_active ?? !currentStatus;
        
        // Update local state
        setSelectedEventForDetails((prev: any) => ({
          ...prev,
          ticket_types: prev.ticket_types.map((tt: any) => 
            tt.id === ticketTypeId ? { ...tt, is_available: newStatus, is_active: newStatus } : tt
          )
        }));
        
        // Refresh events list
        fetchEvents();
        
        toast.success(`Ticket ${newStatus ? 'enabled' : 'disabled'} successfully!`, {
          position: 'top-right',
          autoClose: 3000,
        });
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Failed to update ticket status' }));
        throw new Error(errorData.error || 'Failed to update ticket status');
      }
    } catch (err: any) {
      console.error('Error toggling ticket:', err);
      toast.error(err.message || 'Failed to update ticket status', {
        position: 'top-right',
        autoClose: 3000,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Events</h2>
            {!isLoading && (
              <span className="px-3 py-1 bg-[#27aae2] text-white rounded-full text-sm font-semibold">
                {events.length}
              </span>
            )}
          </div>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage and track your events</p>
        </div>
        <button 
          onClick={onCreateEvent}
          className="flex items-center space-x-2 bg-[#27aae2] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#1e8bc3] transition-all shadow-lg"
        >
          <Plus className="w-5 h-5" />
          <span>Create Event</span>
        </button>
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'all', label: 'All Events' },
          { id: 'upcoming', label: 'Upcoming' },
          { id: 'ongoing', label: 'Ongoing' },
          { id: 'past', label: 'Past' },
          { id: 'pending', label: 'Awaiting Approval' }
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setFilter(item.id as typeof filter)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === item.id
                ? 'bg-[#27aae2] text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#27aae2]"></div>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-500 rounded-xl p-4 text-center">
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Events Grid */}
      {!isLoading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {events.map((event) => {
            const status = getEventStatus(event);
            const totalTickets = getTotalTickets(event);
            const ticketsSold = getTicketsSold(event);
            const progress = totalTickets > 0 ? (ticketsSold / totalTickets) * 100 : 0;
            
            return (
              <div
                key={event.id}
                onClick={() => handleEventClick(event)}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all cursor-pointer"
              >
                <div className="relative h-40">
                  <img
                    src={getEventImage(event)}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      status === 'upcoming' ? 'bg-blue-500 text-white' :
                      status === 'ongoing' ? 'bg-green-500 text-white' :
                      status === 'pending' ? 'bg-yellow-500 text-white' :
                      'bg-gray-500 text-white'
                    }`}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                    {event.title}
                  </h3>

                  <div className="space-y-1.5 mb-3">
                    <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                      <Calendar className="w-3.5 h-3.5" />
                      <span className="text-xs">{formatDate(event.start_date)}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                      <MapPin className="w-3.5 h-3.5" />
                      <span className="text-xs truncate">{getEventLocation(event)}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {/* Promo Codes Display */}
                    {event.promo_codes && event.promo_codes.length > 0 && (
                      <div className="mb-2">
                        <div className="flex flex-wrap gap-1">
                          {event.promo_codes.slice(0, 3).map((promo: any, idx: number) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded text-xs font-medium"
                              title={`${promo.code}: ${promo.discount_type === 'percentage' ? promo.discount_value + '%' : 'KES ' + promo.discount_value} off`}
                            >
                              {promo.code}
                            </span>
                          ))}
                          {event.promo_codes.length > 3 && (
                            <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded text-xs">
                              +{event.promo_codes.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {totalTickets > 0 && (
                      <>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-gray-600 dark:text-gray-400">Tickets</span>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {ticketsSold} / {totalTickets}
                          </span>
                        </div>

                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                          <div
                            className="bg-[#27aae2] h-1.5 rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </>
                    )}

                    <div className="flex items-center justify-between pt-1.5">
                      <div className="flex items-center space-x-3 text-xs text-gray-600 dark:text-gray-400">
                        <div className="flex items-center space-x-1">
                          <Users className="w-3.5 h-3.5" />
                          <span>{event.bookings_count || 0}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Heart className="w-3.5 h-3.5" />
                          <span>{event.bucketlist_count || 0}</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-4">
                        {event.status === 'approved' && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePromoteEvent(event.id);
                            }}
                            className="flex items-center space-x-1 text-purple-600 hover:text-purple-700 transition-colors"
                            title="Promote event to Can't Miss section"
                          >
                            <Sparkles className="w-4 h-4" />
                            <span className="text-xs hidden sm:inline">Promote</span>
                          </button>
                        )}
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditEvent(event.id);
                          }}
                          className="flex items-center space-x-1 text-[#27aae2] hover:text-[#1e8bc3] transition-colors"
                          title="Edit event"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteEvent(event.id);
                          }}
                          className="flex items-center space-x-1 text-red-500 hover:text-red-600 transition-colors"
                          title="Delete event"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!isLoading && !error && events.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No {filter !== 'all' && filter} events found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {filter === 'all' 
              ? "You haven't created any events yet. Click 'Create Event' to get started!"
              : `You don't have any ${filter} events at the moment.`
            }
          </p>
        </div>
      )}

      {/* Edit Event Modal */}
      <CreateEvent
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        eventId={editEventId}
        onEventCreated={() => {
          handleCloseEditModal();
        }}
      />

      {/* Promote Event Modal */}
      {promoteEventId && (
        <PromoteEventModal
          isOpen={isPromoteModalOpen}
          onClose={handleClosePromoteModal}
          event={events.find(e => e.id === promoteEventId)}
          onSuccess={handlePromotionSuccess}
        />
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div 
              className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-75 backdrop-blur-sm"
              onClick={cancelDelete}
            />

            {/* Modal panel */}
            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              {/* Header with gradient */}
              <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-2 rounded-full">
                      <AlertTriangle className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white">Delete Event</h3>
                  </div>
                  <button
                    onClick={cancelDelete}
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="px-6 py-6">
                <div className="mb-6">
                  <p className="text-gray-700 dark:text-gray-300 text-base leading-relaxed">
                    Are you sure you want to delete this event? This action cannot be undone and all associated data will be permanently removed.
                  </p>
                </div>

                {/* Warning box */}
                <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-r-lg">
                  <div className="flex">
                    <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div className="ml-3">
                      <p className="text-sm text-red-800 dark:text-red-300 font-medium">
                        This will delete:
                      </p>
                      <ul className="mt-2 text-sm text-red-700 dark:text-red-400 list-disc list-inside space-y-1">
                        <li>All event details and information</li>
                        <li>All ticket types and bookings</li>
                        <li>All promo codes and analytics</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer with actions */}
              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 flex items-center justify-end gap-3">
                <button
                  onClick={cancelDelete}
                  className="px-6 py-2.5 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 font-medium transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-6 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 font-medium shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Event
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Event Details Modal */}
      {showEventDetailsModal && selectedEventForDetails && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div
              className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-75 backdrop-blur-sm"
              onClick={() => setShowEventDetailsModal(false)}
            ></div>

            {/* Center modal */}
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full relative z-10 max-h-[90vh]">
              {/* Close button */}
              <button
                onClick={() => setShowEventDetailsModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors z-10 bg-white dark:bg-gray-800 rounded-full p-2 shadow-lg"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="bg-white dark:bg-gray-800 overflow-y-auto max-h-[90vh]">
                {/* Event Image Header */}
                <div className="relative h-64">
                  <img
                    src={getEventImage(selectedEventForDetails)}
                    alt={selectedEventForDetails.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-6 left-6 right-6">
                    <h2 className="text-3xl font-bold text-white mb-2">
                      {selectedEventForDetails.title}
                    </h2>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        getEventStatus(selectedEventForDetails) === 'upcoming' ? 'bg-blue-500 text-white' :
                        getEventStatus(selectedEventForDetails) === 'ongoing' ? 'bg-green-500 text-white' :
                        getEventStatus(selectedEventForDetails) === 'pending' ? 'bg-yellow-500 text-white' :
                        'bg-gray-500 text-white'
                      }`}>
                        {getEventStatus(selectedEventForDetails).charAt(0).toUpperCase() + getEventStatus(selectedEventForDetails).slice(1)}
                      </span>
                      {selectedEventForDetails.is_free && (
                        <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-500 text-white">
                          Free Event
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="px-8 py-6 space-y-6">
                  {/* Event Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Event Information</h3>
                        
                        <div className="space-y-3">
                          <div className="flex items-start space-x-3">
                            <Calendar className="w-5 h-5 text-[#27aae2] mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">Date & Time</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {formatDate(selectedEventForDetails.start_date)}
                              </p>
                              {selectedEventForDetails.end_date && (
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  to {formatDate(selectedEventForDetails.end_date)}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-start space-x-3">
                            <MapPin className="w-5 h-5 text-[#27aae2] mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">Location</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {getEventLocation(selectedEventForDetails)}
                              </p>
                              {selectedEventForDetails.venue_address && !selectedEventForDetails.is_online && (
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {selectedEventForDetails.venue_address}
                                </p>
                              )}
                            </div>
                          </div>

                          {selectedEventForDetails.category && (
                            <div className="flex items-start space-x-3">
                              <Tag className="w-5 h-5 text-[#27aae2] mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">Category</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {selectedEventForDetails.category.name || selectedEventForDetails.category}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Description */}
                      {selectedEventForDetails.description && (
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Description</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                            {selectedEventForDetails.description}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Right Column - Stats */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Statistics</h3>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                          <div className="flex items-center space-x-2 mb-1">
                            <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            <p className="text-xs text-gray-600 dark:text-gray-400">Bookings</p>
                          </div>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {selectedEventForDetails.bookings_count || 0}
                          </p>
                        </div>

                        <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 border border-red-200 dark:border-red-800">
                          <div className="flex items-center space-x-2 mb-1">
                            <Heart className="w-4 h-4 text-red-600 dark:text-red-400" />
                            <p className="text-xs text-gray-600 dark:text-gray-400">Wishlisted</p>
                          </div>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {selectedEventForDetails.bucketlist_count || 0}
                          </p>
                        </div>

                        {selectedEventForDetails.capacity && (
                          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800 col-span-2">
                            <div className="flex items-center space-x-2 mb-1">
                              <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                              <p className="text-xs text-gray-600 dark:text-gray-400">Capacity</p>
                            </div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                              {selectedEventForDetails.capacity}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Promo Codes - Only show for paid events */}
                      {!selectedEventForDetails.is_free && selectedEventForDetails.promo_codes && selectedEventForDetails.promo_codes.length > 0 && (
                        <div>
                          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Promo Codes</h3>
                          <div className="space-y-2">
                            {selectedEventForDetails.promo_codes.map((promo: any, idx: number) => (
                              <div key={promo.id || idx} className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 border border-purple-200 dark:border-purple-800">
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <p className="font-mono font-bold text-purple-700 dark:text-purple-300">
                                      {promo.code}
                                    </p>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">
                                      {promo.discount_type === 'percentage' ? `${promo.discount_value}% off` : `KES ${promo.discount_value} off`}
                                    </p>
                                    {promo.max_uses && (
                                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                        Uses: {promo.current_uses || 0} / {promo.max_uses}
                                      </p>
                                    )}
                                    {promo.valid_until && (
                                      <p className="text-xs text-gray-500 dark:text-gray-500">
                                        Expires: {new Date(promo.valid_until).toLocaleDateString()}
                                      </p>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 ml-4">
                                    <button
                                      onClick={() => handleEditPromoCode(promo)}
                                      className="p-1.5 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/40 rounded transition-colors"
                                      title="Edit promo code"
                                    >
                                      <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => handleDeletePromoCode(promo.id)}
                                      className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 rounded transition-colors"
                                      title="Delete promo code"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                    </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {!selectedEventForDetails.is_free && (!selectedEventForDetails.promo_codes || selectedEventForDetails.promo_codes.length === 0) && (
                        <div>
                          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Promo Codes</h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400">No promo codes added yet. Add them when editing the event.</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Ticket Types Section */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Ticket Management</h3>
                    
                    {selectedEventForDetails.ticket_types && selectedEventForDetails.ticket_types.length > 0 ? (
                      <div className="space-y-3">
                        {selectedEventForDetails.ticket_types.map((ticket: any) => {
                          const soldPercentage = ticket.quantity_total > 0 
                            ? ((ticket.quantity_total - (ticket.quantity_available || 0)) / ticket.quantity_total) * 100 
                            : 0;
                          const ticketsSold = ticket.quantity_total - (ticket.quantity_available || 0);
                          const isAvailable = ticket.is_available !== false; // Default to true if not set

                          return (
                            <div
                              key={ticket.id}
                              className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 border border-gray-200 dark:border-gray-600"
                            >
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center space-x-3">
                                  <div>
                                    <h4 className="font-semibold text-gray-900 dark:text-white">
                                      {ticket.name}
                                    </h4>
                                    <div className="flex items-center gap-2 mt-1">
                                      {!selectedEventForDetails.is_free && (
                                        <p className="text-sm text-[#27aae2] font-medium">
                                          KES {parseFloat(ticket.price || 0).toLocaleString()}
                                        </p>
                                      )}
                                      {!isAvailable && (
                                        <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full font-semibold">
                                          SOLD OUT (Disabled)
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-3">
                                  <div className="text-right">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                      {ticketsSold} / {ticket.quantity_total || 0}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                      {ticket.quantity_available || 0} available
                                    </p>
                                  </div>

                                  {/* Toggle Button */}
                                  <button
                                    onClick={() => handleToggleTicket(ticket.id, isAvailable)}
                                    className={`p-2 rounded-lg transition-all ${
                                      isAvailable
                                        ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50'
                                        : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50'
                                    }`}
                                    title={isAvailable ? 'Disable this ticket type' : 'Enable this ticket type'}
                                  >
                                    {isAvailable ? (
                                      <ToggleRight className="w-6 h-6" />
                                    ) : (
                                      <ToggleLeft className="w-6 h-6" />
                                    )}
                                  </button>
                                </div>
                              </div>

                              {/* Progress Bar */}
                              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 overflow-hidden">
                                <div
                                  className={`h-2 rounded-full transition-all ${
                                    !isAvailable
                                      ? 'bg-red-500'
                                      : soldPercentage > 80
                                      ? 'bg-orange-500'
                                      : 'bg-[#27aae2]'
                                  }`}
                                  style={{ width: `${soldPercentage}%` }}
                                ></div>
                              </div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {soldPercentage.toFixed(1)}% sold
                              </p>

                              {ticket.description && (
                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                                  {ticket.description}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                        <p className="text-gray-600 dark:text-gray-400">No ticket types configured</p>
                      </div>
                    )}
                  </div>

                  {/* Close Button */}
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => setShowEventDetailsModal(false)}
                      className="w-full px-4 py-3 bg-[#27aae2] text-white rounded-xl font-medium hover:bg-[#1e8bc3] transition-all"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Promo Code Edit Modal */}
      {isPromoCodeEditModalOpen && editingPromoCode && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsPromoCodeEditModalOpen(false)}></div>
            <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6 z-10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Edit Promo Code</h3>
                <button
                  onClick={() => setIsPromoCodeEditModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Promo Code
                  </label>
                  <input
                    type="text"
                    value={promoCodeFormData.code}
                    onChange={(e) => setPromoCodeFormData({ ...promoCodeFormData, code: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="PROMO123"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Discount Type
                  </label>
                  <select
                    value={promoCodeFormData.discount_type}
                    onChange={(e) => setPromoCodeFormData({ ...promoCodeFormData, discount_type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Discount Value
                  </label>
                  <input
                    type="number"
                    value={promoCodeFormData.discount_value}
                    onChange={(e) => setPromoCodeFormData({ ...promoCodeFormData, discount_value: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Max Uses (leave empty for unlimited)
                  </label>
                  <input
                    type="number"
                    value={promoCodeFormData.max_uses || ''}
                    onChange={(e) => setPromoCodeFormData({ ...promoCodeFormData, max_uses: e.target.value ? parseInt(e.target.value) : null })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Max Uses Per User
                  </label>
                  <input
                    type="number"
                    value={promoCodeFormData.max_uses_per_user}
                    onChange={(e) => setPromoCodeFormData({ ...promoCodeFormData, max_uses_per_user: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Valid From (optional)
                  </label>
                  <input
                    type="date"
                    value={promoCodeFormData.valid_from}
                    onChange={(e) => setPromoCodeFormData({ ...promoCodeFormData, valid_from: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Valid Until (optional)
                  </label>
                  <input
                    type="date"
                    value={promoCodeFormData.valid_until}
                    onChange={(e) => setPromoCodeFormData({ ...promoCodeFormData, valid_until: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={promoCodeFormData.is_active}
                    onChange={(e) => setPromoCodeFormData({ ...promoCodeFormData, is_active: e.target.checked })}
                    className="w-4 h-4 text-[#27aae2] border-gray-300 rounded focus:ring-[#27aae2]"
                  />
                  <label htmlFor="is_active" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Active
                  </label>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setIsPromoCodeEditModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSavePromoCode}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-[#27aae2] text-white rounded-lg hover:bg-[#1e8bc3] transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
