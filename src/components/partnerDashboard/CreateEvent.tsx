import { useState, useEffect } from 'react';
import { 
  X, 
  MapPin, 
  Calendar, 
  Tag, 
  Image as ImageIcon, 
  FileText, 
  DollarSign, 
  Users, 
  Link as LinkIcon,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Upload,
  Plus,
  Trash2,
  Check,
  Globe,
  Video,
  AlertCircle
} from 'lucide-react';
import { toast } from 'react-toastify';
import { createEvent, getEvent, updateEvent } from '../../services/partnerService';
import { API_BASE_URL, API_ENDPOINTS } from '../../config/api';
import { getCategories } from '../../services/eventService';

interface CreateEventProps {
  isOpen: boolean;
  onClose: () => void;
  onEventCreated?: () => void;
  eventId?: number | null; // If provided, we're editing
}

interface EventFormData {
  // Step 1: Location
  locationType: 'physical' | 'online' | 'hybrid';
  locationName: string;
  coordinates: { lat: number; lng: number } | null;
  onlineLink: string;
  linkShareTime: string;
  
  // Step 2: Date & Time
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  
  // Step 3: Categories
  closedCategories: string[];
  openInterests: string[];
  
  // Step 4: Event Details
  eventName: string;
  eventPhoto: File | null;
  photoPreview: string;
  
  // Step 5: Description & Limits
  description: string;
  attendeeLimit: number | null;
  isUnlimited: boolean;
  
  // Step 6: Pricing
  isFree: boolean;
  ticketTypes: TicketType[];
  
  // Promo Codes & Hosts (optional, shown on last step)
  promoCodes: PromoCode[];
  hosts: Host[];
}

interface TicketType {
  id: string;
  name: string;
  ticketStructure: 'basic' | 'class' | 'loyalty' | 'season' | 'timeslot';
  // Class-based fields
  classType?: 'vvip' | 'vip' | 'regular';
  // Loyalty-based fields
  loyaltyType?: 'diehard' | 'earlybird' | 'advance' | 'gate';
  // Season-based fields
  seasonType?: 'daily' | 'season';
  seasonDuration?: number; // Number of days for season ticket
  // Timeslot-based fields
  timeslot?: string; // e.g., "9:00 AM - 10:00 AM"
  startTime?: string; // Start time for timeslot tickets
  endTime?: string; // End time for timeslot tickets
  price: number;
  quantity: number;
  isUnlimited?: boolean; // For unlimited ticket availability
  vatIncluded?: boolean;
  existingId?: number; // For editing existing tickets
}

interface Host {
  id: string;
  username: string;
  name: string;
  isVerified: boolean;
}

interface PromoCode {
  id: string;
  code: string;
  discount: number;
  discountType: 'percentage' | 'fixed';
  maxUses: number;
  expiryDate: string;
  existingId?: number; // For editing existing promo codes
}

// Categories will be fetched from API

export default function CreateEvent({ isOpen, onClose, onEventCreated, eventId }: CreateEventProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingEvent, setIsLoadingEvent] = useState(false);
  const [error, setError] = useState('');
  const [timeslotErrors, setTimeslotErrors] = useState<Record<string, string>>({});
  const [categories, setCategories] = useState<any[]>([]);
  const [showCustomTicketForm, setShowCustomTicketForm] = useState(false);
  const [customTicket, setCustomTicket] = useState<Partial<TicketType>>({
    name: '',
    ticketStructure: 'basic',
    price: 0,
    quantity: 0,
  });
  const isEditMode = !!eventId;
  const [locationSuggestions, setLocationSuggestions] = useState<any[]>([]);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [locationSearchTimeout, setLocationSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  const [formData, setFormData] = useState<EventFormData>({
    locationType: 'physical',
    locationName: '',
    coordinates: null,
    onlineLink: '',
    linkShareTime: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    closedCategories: [],
    openInterests: [],
    eventName: '',
    eventPhoto: null,
    photoPreview: '',
    description: '',
    attendeeLimit: null,
    isUnlimited: true,
    isFree: true,
    ticketTypes: [],
    promoCodes: [],
    hosts: []
  });

  const [isOneDayEvent, setIsOneDayEvent] = useState(true);

  const totalSteps = 7; // Step 7 for promo codes (paid events only)

  // Helper functions for time conversion
  const parseTime = (time24: string): { hour: string; minute: string; period: 'AM' | 'PM' } => {
    if (!time24) return { hour: '12', minute: '00', period: 'AM' };
    const [hours, minutes] = time24.split(':');
    const hour24 = parseInt(hours);
    const period: 'AM' | 'PM' = hour24 >= 12 ? 'PM' : 'AM';
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
    return {
      hour: hour12.toString().padStart(2, '0'),
      minute: minutes || '00',
      period
    };
  };

  const formatTimeTo24 = (hour: string, minute: string, period: 'AM' | 'PM'): string => {
    let hour24 = parseInt(hour);
    if (period === 'PM' && hour24 !== 12) {
      hour24 += 12;
    } else if (period === 'AM' && hour24 === 12) {
      hour24 = 0;
    }
    return `${hour24.toString().padStart(2, '0')}:${minute}`;
  };

  // Time state for dropdowns - initialize with default times
  const [startTimeState, setStartTimeState] = useState(() => parseTime('09:00'));
  const [endTimeState, setEndTimeState] = useState(() => parseTime('17:00'));

  // Update formData when time state changes (user interaction)
  useEffect(() => {
    const newStartTime = formatTimeTo24(startTimeState.hour, startTimeState.minute, startTimeState.period);
    setFormData(prev => ({ ...prev, startTime: newStartTime }));
  }, [startTimeState.hour, startTimeState.minute, startTimeState.period]);

  useEffect(() => {
    const newEndTime = formatTimeTo24(endTimeState.hour, endTimeState.minute, endTimeState.period);
    setFormData(prev => ({ ...prev, endTime: newEndTime }));
  }, [endTimeState.hour, endTimeState.minute, endTimeState.period]);

  // Initialize time states when editing an event
  useEffect(() => {
    if (isEditMode && formData.startTime && formData.startTime !== '00:00') {
      const parsedStart = parseTime(formData.startTime);
      setStartTimeState(parsedStart);
    }
    if (isEditMode && formData.endTime && formData.endTime !== '00:00') {
      const parsedEnd = parseTime(formData.endTime);
      setEndTimeState(parsedEnd);
    }
  }, [isEditMode, formData.startTime, formData.endTime]);

  // Validate end time is after start time for one-day events
  const isEndTimeValid = (): boolean => {
    if (!isOneDayEvent) return true;
    if (!formData.startTime || !formData.endTime) return true;
    
    const start = formatTimeTo24(startTimeState.hour, startTimeState.minute, startTimeState.period);
    const end = formatTimeTo24(endTimeState.hour, endTimeState.minute, endTimeState.period);
    
    return end > start;
  };

  // Fetch categories on mount and reset form when modal opens
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getCategories();
        if (response.categories) {
          setCategories(response.categories);
        } else if (Array.isArray(response)) {
          setCategories(response);
        }
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    };
    
    if (isOpen) {
      fetchCategories();
      // Reset to step 1 whenever the modal opens
      setCurrentStep(1);
      // Clear location suggestions when modal closes
      setLocationSuggestions([]);
      setShowLocationSuggestions(false);
      
      // Reset form data when creating a new event (not editing)
      if (!eventId) {
        setFormData({
          locationType: 'physical',
          locationName: '',
          coordinates: null,
          onlineLink: '',
          linkShareTime: '',
          startDate: '',
          startTime: '',
          endDate: '',
          endTime: '',
          closedCategories: [],
          openInterests: [],
          eventName: '',
          eventPhoto: null,
          photoPreview: '',
          description: '',
          attendeeLimit: null,
          isUnlimited: true,
          isFree: true,
          ticketTypes: [],
          promoCodes: [],
          hosts: []
        });
        // Reset time states
        setStartTimeState(() => parseTime('09:00'));
        setEndTimeState(() => parseTime('17:00'));
        // Reset one-day event toggle
        setIsOneDayEvent(true);
        // Clear any errors
        setError('');
        setTimeslotErrors({});
      }
    }
    
    // Cleanup timeout on unmount
    return () => {
      if (locationSearchTimeout) {
        clearTimeout(locationSearchTimeout);
      }
    };
  }, [isOpen, eventId, locationSearchTimeout]);

  // Load event data if editing
  useEffect(() => {
    const loadEventData = async () => {
      if (isEditMode && eventId) {
        // Reset to step 1 when loading a different event for editing
        setCurrentStep(1);
        setIsLoadingEvent(true);
        try {
          const eventData = await getEvent(eventId);
          console.log('Loading event data for editing:', eventData);
          
          // Parse dates
          const startDate = eventData.start_date ? new Date(eventData.start_date) : null;
          const endDate = eventData.end_date ? new Date(eventData.end_date) : null;
          
          // Format dates for date inputs (YYYY-MM-DD)
          const formatDateForInput = (date: Date | null) => {
            if (!date) return '';
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
          };
          
          // Format time for time inputs (HH:MM)
          const formatTimeForInput = (date: Date | null) => {
            if (!date) return '';
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            return `${hours}:${minutes}`;
          };
          
          const formattedStartTime = formatTimeForInput(startDate);
          const formattedEndTime = formatTimeForInput(endDate);
          
          console.log('Loading event times:', {
            startDate: eventData.start_date,
            endDate: eventData.end_date,
            parsedStartDate: startDate,
            parsedEndDate: endDate,
            formattedStartTime,
            formattedEndTime
          });
          
          // Determine location type
          let locationType: 'physical' | 'online' | 'hybrid' = 'physical';
          if (eventData.is_online) {
            if (eventData.venue_name || eventData.venue_address) {
              locationType = 'hybrid';
            } else {
              locationType = 'online';
            }
          }
          
          // Parse coordinates
          let coordinates = null;
          if (eventData.latitude && eventData.longitude) {
            coordinates = {
              lat: parseFloat(eventData.latitude),
              lng: parseFloat(eventData.longitude)
            };
          }
          
          // Parse categories
          const closedCategories = eventData.category ? [String(eventData.category.id)] : [];
          
          // Parse interests (API returns array of strings)
          const parsedInterests = Array.isArray(eventData.interests) 
            ? eventData.interests.filter((i: any) => typeof i === 'string' && i.trim())
            : [];
          
          // Parse ticket types
          const ticketTypes: TicketType[] = (eventData.ticket_types || []).map((tt: any, index: number) => ({
            id: `existing-${tt.id}`,
            name: tt.name || '',
            ticketStructure: 'basic', // Default, can be enhanced later
            price: parseFloat(tt.price || 0),
            quantity: tt.quantity_total || 0,
            vatIncluded: false, // Default
            existingId: tt.id // Store original ID for updates
          }));
          
          // Parse promo codes
          const promoCodes: PromoCode[] = (eventData.promo_codes || []).map((pc: any) => ({
            id: `existing-${pc.id}`,
            code: pc.code || '',
            discount: parseFloat(pc.discount_value || pc.discount_amount || pc.discount_percentage || 0),
            discountType: pc.discount_type === 'percentage' ? 'percentage' : 'fixed',
            maxUses: pc.max_uses || 0,
            expiryDate: pc.expiry_date || pc.valid_until ? formatDateForInput(new Date(pc.expiry_date || pc.valid_until)) : '',
            existingId: pc.id
          }));
          
          // Parse hosts
          const hosts: Host[] = (eventData.hosts || []).map((h: any) => ({
            id: `existing-${h.id}`,
            username: h.user?.email || '',
            name: `${h.user?.first_name || ''} ${h.user?.last_name || ''}`.trim() || h.user?.email || '',
            isVerified: h.user?.is_verified || false
          }));
          
          // Check if event spans multiple days
          const isMultiDay = endDate && startDate && 
            endDate.toDateString() !== startDate.toDateString();
          setIsOneDayEvent(!isMultiDay);
          
          // Populate form with all event data
          setFormData({
            locationType,
            locationName: eventData.venue_name || eventData.venue_address || '',
            coordinates,
            onlineLink: eventData.online_link || '',
            linkShareTime: '', // Not stored in backend, can be enhanced
            startDate: formatDateForInput(startDate),
            startTime: formattedStartTime,
            endDate: formatDateForInput(endDate),
            endTime: formattedEndTime,
            closedCategories,
            openInterests: parsedInterests,
            eventName: eventData.title || '',
            eventPhoto: null, // File object, can't be loaded
            photoPreview: eventData.poster_image 
              ? (eventData.poster_image.startsWith('http') 
                  ? eventData.poster_image 
                  : `${API_BASE_URL}${eventData.poster_image.startsWith('/') ? '' : '/'}${eventData.poster_image}`)
              : '',
            description: eventData.description || '',
            attendeeLimit: eventData.attendee_capacity || null,
            isUnlimited: !eventData.ticket_types?.some((tt: any) => tt.quantity_total !== null),
            isFree: eventData.is_free || false,
            ticketTypes,
            promoCodes,
            hosts
          });
          
          console.log('Form data populated:', {
            locationType,
            eventName: eventData.title,
            startDate: formatDateForInput(startDate),
            startTime: formattedStartTime,
            endDate: formatDateForInput(endDate),
            endTime: formattedEndTime,
            isOneDayEvent: !isMultiDay,
            ticketTypes: ticketTypes.length,
            promoCodes: promoCodes.length
          });
        } catch (err) {
          console.error('Failed to load event:', err);
          setError('Failed to load event data. Please try again.');
        } finally {
          setIsLoadingEvent(false);
        }
      }
    };
    
    if (isOpen && isEditMode && eventId) {
      loadEventData();
    }
  }, [isOpen, isEditMode, eventId]);

  const handleNext = () => {
    // Clear any previous errors
    setError('');
    
    // Step 1 validation: Location
    if (currentStep === 1) {
      if (formData.locationType === 'physical' || formData.locationType === 'hybrid') {
        if (!formData.locationName.trim()) {
          setError('Please enter a location name');
          return;
        }
      }
      if (formData.locationType === 'online' || formData.locationType === 'hybrid') {
        if (!formData.onlineLink.trim()) {
          setError('Please enter an event link');
          return;
        }
      }
    }
    
    // Step 2 validation: Date & Time
    if (currentStep === 2) {
      if (!formData.startDate) {
        setError('Please select a start date');
        return;
      }
      if (!formData.startTime) {
        setError('Please select a start time');
        return;
      }
      if (!formData.endTime) {
        setError('Please select an end time');
        return;
      }
      if (!isOneDayEvent && !formData.endDate) {
        setError('Please select an end date for multi-day events');
        return;
      }
      if (isOneDayEvent && !isEndTimeValid()) {
        setError('End time must be after start time for one-day events');
        return;
      }
      if (!isOneDayEvent && formData.endDate && formData.startDate) {
        const startDateObj = new Date(formData.startDate);
        const endDateObj = new Date(formData.endDate);
        if (endDateObj < startDateObj) {
          setError('End date cannot be before start date for multi-day events');
          return;
        }
      }
    }
    
    // Step 3 validation: Categories
    if (currentStep === 3) {
      if (formData.closedCategories.length === 0) {
        setError('Please select at least one category');
        return;
      }
    }
    
    // Step 4 validation: Event Details
    if (currentStep === 4) {
      if (!formData.eventName.trim()) {
        setError('Please enter an event name');
        return;
      }
      if (!formData.eventPhoto && !formData.photoPreview) {
        setError('Please upload an event photo');
        return;
      }
    }
    
    // Step 5 validation: Description
    if (currentStep === 5) {
      if (!formData.description.trim()) {
        setError('Please enter an event description');
        return;
      }
    }
    
    // Step 6 validation: Pricing
    if (currentStep === 6) {
      if (!formData.isFree) {
        if (formData.ticketTypes.length === 0) {
          setError('Please add at least one ticket type for paid events');
          return;
        }
        // Validate all ticket types have required fields
        const invalidTicket = formData.ticketTypes.find(t => !t.name.trim() || t.price <= 0 || (!t.isUnlimited && t.quantity <= 0));
        if (invalidTicket) {
          setError('Please fill in all ticket details (name, price, and quantity)');
          return;
        }
      } else {
        // For free events, check if unlimited is false and no capacity is set
        if (!formData.isUnlimited && !formData.attendeeLimit) {
          setError('Please set an attendee capacity or select unlimited');
          return;
        }
      }
    }
    
    // Skip step 7 (promo codes) if event is free
    if (currentStep === 6 && formData.isFree) {
      // Skip to submission for free events
      return;
    }
    
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };


  const handleInterestAdd = (interest: string) => {
    if (formData.openInterests.length < 10 && interest.trim() && !formData.openInterests.includes(interest.trim())) {
      setFormData(prev => ({
        ...prev,
        openInterests: [...prev.openInterests, interest.trim()]
      }));
    }
  };

  const handleInterestRemove = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      openInterests: prev.openInterests.filter(i => i !== interest)
    }));
  };

  // Location search functionality
  const fetchLocationSuggestions = async (query: string) => {
    if (query.length < 3) {
      setLocationSuggestions([]);
      setShowLocationSuggestions(false);
      return;
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=ke`
      );
      const data = await response.json();
      setLocationSuggestions(data);
      setShowLocationSuggestions(true);
    } catch (error) {
      console.error('Error fetching location suggestions:', error);
    }
  };

  const handleLocationChange = (value: string) => {
    setFormData(prev => ({ ...prev, locationName: value }));
    
    // Clear previous timeout
    if (locationSearchTimeout) {
      clearTimeout(locationSearchTimeout);
    }
    
    // Debounce the API call
    const timeoutId = setTimeout(() => {
      fetchLocationSuggestions(value);
    }, 300);
    
    setLocationSearchTimeout(timeoutId);
  };

  const selectLocationSuggestion = (location: any) => {
    const locationName = location.display_name.split(',')[0];
    setFormData(prev => ({ 
      ...prev, 
      locationName: locationName,
      coordinates: {
        lat: parseFloat(location.lat),
        lng: parseFloat(location.lon)
      }
    }));
    setShowLocationSuggestions(false);
    setLocationSuggestions([]);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        eventPhoto: file,
        photoPreview: URL.createObjectURL(file)
      }));
    }
  };

  const generateAIDescription = () => {
    // Simulate AI generation
    const aiDescription = `Join us for an unforgettable experience at ${formData.eventName}! This exciting ${formData.closedCategories.join(', ')} event promises to deliver amazing moments and connections. Whether you're looking to ${formData.openInterests.join(', ')}, this is the perfect opportunity for you. Don't miss out on this incredible gathering!`;
    setFormData(prev => ({ ...prev, description: aiDescription }));
  };

  const addTicketType = () => {
    // Check if trying to add more than 8 timeslot tickets
    const timeslotTickets = formData.ticketTypes.filter(t => t.ticketStructure === 'timeslot');
    if (timeslotTickets.length >= 8) {
      alert('Maximum 8 time slot tickets allowed per event.');
      return;
    }

    const newTicket: TicketType = {
      id: Date.now().toString(),
      name: '',
      ticketStructure: 'basic',
      price: 0,
      quantity: 0,
  // vatIncluded removed per request
    };
    setFormData(prev => ({
      ...prev,
      ticketTypes: [newTicket, ...prev.ticketTypes]
    }));
  };

  const removeTicketType = (id: string) => {
    setFormData(prev => ({
      ...prev,
      ticketTypes: prev.ticketTypes.filter(t => t.id !== id)
    }));
  };

  const updateTicketType = (id: string, field: keyof TicketType, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      ticketTypes: prev.ticketTypes.map(t => 
        t.id === id ? { ...t, [field]: value } : t
      )
    }));
  };

  const addPromoCode = () => {
    const newPromo: PromoCode = {
      id: Date.now().toString(),
      code: '',
      discount: 0,
      discountType: 'percentage',
      maxUses: 0,
      expiryDate: ''
    };
    setFormData(prev => ({
      ...prev,
      promoCodes: [...prev.promoCodes, newPromo]
    }));
  };

  const removePromoCode = (id: string) => {
    setFormData(prev => ({
      ...prev,
      promoCodes: prev.promoCodes.filter(p => p.id !== id)
    }));
  };

  const updatePromoCode = (id: string, field: keyof PromoCode, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      promoCodes: prev.promoCodes.map(p => 
        p.id === id ? { ...p, [field]: value } : p
      )
    }));
  };

  const searchHost = (username: string) => {
    // Simulate searching for Niko Free members
    // In production, this would be an API call
    const mockHosts: Host[] = [
      { id: '1', username: '@annalane', name: 'Anna Lane', isVerified: true },
      { id: '2', username: '@victormuli', name: 'Victor Muli', isVerified: true },
      { id: '3', username: '@johndoe', name: 'John Doe', isVerified: false }
    ];
    return mockHosts.filter(h => 
      h.username.toLowerCase().includes(username.toLowerCase()) ||
      h.name.toLowerCase().includes(username.toLowerCase())
    );
  };

  const addHost = (host: Host) => {
    if (formData.hosts.length < 2 && !formData.hosts.find(h => h.id === host.id)) {
      setFormData(prev => ({
        ...prev,
        hosts: [...prev.hosts, host]
      }));
    }
  };

  const removeHost = (id: string) => {
    setFormData(prev => ({
      ...prev,
      hosts: prev.hosts.filter(h => h.id !== id)
    }));
  };

  const handleCustomTicketSave = () => {
    if (!customTicket.name || customTicket.price === undefined || customTicket.quantity === undefined) {
      alert('Please fill in all required fields for the ticket.');
      return;
    }
    
    // Validate timeslot tickets
    if (customTicket.ticketStructure === 'timeslot') {
      if (!customTicket.startTime || !customTicket.endTime) {
        alert('Please specify both start and end times for time slot tickets.');
        return;
      }
      // Show error but don't prevent save
      if (customTicket.endTime <= customTicket.startTime) {
        setTimeslotErrors(prev => ({ ...prev, custom: 'End time cannot be lower than start time' }));
      }
    }
    
    // Clear any errors before saving
    setTimeslotErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.custom;
      return newErrors;
    });
    
    const newTicket: TicketType = {
      id: Date.now().toString(),
      name: customTicket.name,
      ticketStructure: customTicket.ticketStructure || 'basic',
      classType: customTicket.classType,
      loyaltyType: customTicket.loyaltyType,
      seasonType: customTicket.seasonType,
      seasonDuration: customTicket.seasonDuration,
      timeslot: customTicket.timeslot,
      startTime: customTicket.startTime,
      endTime: customTicket.endTime,
      price: customTicket.price || 0,
      quantity: customTicket.quantity || 0,
      vatIncluded: false,
    };
    
    setFormData(prev => ({
      ...prev,
      ticketTypes: [...prev.ticketTypes, newTicket]
    }));
    
    // Reset custom ticket form
    setCustomTicket({
      name: '',
      ticketStructure: 'basic',
      price: 0,
      quantity: 0,
    });
    setShowCustomTicketForm(false);
  };

  const handleCustomTicketCancel = () => {
    setCustomTicket({
      name: '',
      ticketStructure: 'basic',
      price: 0,
      quantity: 0,
    });
    setShowCustomTicketForm(false);
  };

  const handleSubmit = async () => {
    // Prevent double submission
    if (isLoading) {
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      // Validate required fields
      if (!formData.eventName) {
        setError('Event name is required');
        setIsLoading(false);
        return;
      }
      
      if (!formData.startDate || !formData.startTime) {
        setError('Start date and time are required');
        setIsLoading(false);
        return;
      }
      
      if (formData.closedCategories.length === 0) {
        setError('Please select at least one category');
        setIsLoading(false);
        return;
      }
      
      if (!formData.isFree && formData.ticketTypes.length === 0) {
        setError('Please add at least one ticket type for paid events');
        setIsLoading(false);
        return;
      }
      
      if (!formData.locationName) {
        setError('Location name is required');
        setIsLoading(false);
        return;
      }
      
      // Remove duplicate ticket types (by name)
      const uniqueTicketTypes = formData.ticketTypes.filter((ticket, index, self) =>
        index === self.findIndex((t) => t.name === ticket.name && t.name !== '')
      );
      
      if (uniqueTicketTypes.length !== formData.ticketTypes.length) {
        console.warn('Removed duplicate ticket types');
        setFormData(prev => ({ ...prev, ticketTypes: uniqueTicketTypes }));
      }
      
      // Prepare form data
      const formDataToSend = new FormData();
      
      // Add all form fields
      formDataToSend.append('title', formData.eventName);
      formDataToSend.append('description', formData.description || '');
      formDataToSend.append('category_id', formData.closedCategories[0] || '');
      formDataToSend.append('location_type', formData.locationType);
      
      if (formData.locationName) {
        formDataToSend.append('venue_name', formData.locationName);
        formDataToSend.append('venue_address', formData.locationName);
      }
      
      if (formData.coordinates) {
        formDataToSend.append('latitude', formData.coordinates.lat.toString());
        formDataToSend.append('longitude', formData.coordinates.lng.toString());
      }
      
      if (formData.onlineLink) {
        formDataToSend.append('online_link', formData.onlineLink);
      }
      
      // Date and time
      const startDateTime = `${formData.startDate}T${formData.startTime}:00`;
      formDataToSend.append('start_date', startDateTime);
      
      // For one-day events, use the same date with end time, otherwise use end date
      if (isOneDayEvent) {
        const endDateTime = `${formData.startDate}T${formData.endTime || '23:59'}:00`;
        formDataToSend.append('end_date', endDateTime);
        console.log('One-day event - End time:', {
          endTime: formData.endTime,
          endTimeState,
          endDateTime
        });
      } else if (formData.endDate) {
        const endDateTime = `${formData.endDate}T${formData.endTime || '23:59'}:00`;
        formDataToSend.append('end_date', endDateTime);
        console.log('Multi-day event - End time:', {
          endDate: formData.endDate,
          endTime: formData.endTime,
          endTimeState,
          endDateTime
        });
      }
      
      console.log('Submitting event with times:', {
        startDate: formData.startDate,
        startTime: formData.startTime,
        startTimeState,
        endDate: formData.endDate,
        endTime: formData.endTime,
        endTimeState,
        isOneDayEvent
      });
      
      formDataToSend.append('is_free', formData.isFree ? 'true' : 'false');
      
      // Add poster image if available
      if (formData.eventPhoto) {
        formDataToSend.append('poster_image', formData.eventPhoto);
      }
      
      // Add interests
      if (formData.openInterests.length > 0) {
        formDataToSend.append('interests', JSON.stringify(formData.openInterests));
      }
      
      // Add ticket types (use uniqueTicketTypes if we filtered duplicates)
      const ticketTypesToSend = uniqueTicketTypes.length !== formData.ticketTypes.length 
        ? uniqueTicketTypes 
        : formData.ticketTypes;
      
      if (ticketTypesToSend.length > 0) {
        // Filter out empty ticket types
        const validTicketTypes = ticketTypesToSend.filter(t => t.name && t.name.trim() !== '');
        
        formDataToSend.append('ticket_types', JSON.stringify(validTicketTypes.map(t => ({
          id: t.existingId || (t.id && t.id.toString().startsWith('existing-') ? parseInt(t.id.toString().replace('existing-', '')) : undefined),
          name: t.name.trim(),
          ticket_structure: t.ticketStructure,
          class_type: t.classType,
          loyalty_type: t.loyaltyType,
          season_type: t.seasonType,
          season_duration: t.seasonDuration,
          timeslot: t.timeslot,
          price: t.price,
          quantity: t.quantity,
        }))));
        
        // Send existing ticket IDs for edit mode
        if (isEditMode) {
          const existingTicketIds = validTicketTypes
            .map(t => t.existingId || (t.id && t.id.toString().startsWith('existing-') ? parseInt(t.id.toString().replace('existing-', '')) : null))
            .filter(id => id !== null && id !== undefined);
          
          if (existingTicketIds.length > 0) {
            formDataToSend.append('existing_ticket_ids', JSON.stringify(existingTicketIds));
          }
        }
      }
      
      // Add attendee capacity
      if (formData.attendeeLimit && formData.attendeeLimit > 0) {
        formDataToSend.append('attendee_capacity', formData.attendeeLimit.toString());
      }
      
      // Add promo codes
      if (formData.promoCodes.length > 0) {
        const promoCodesPayload = formData.promoCodes.map(p => {
          const promo: any = {
            code: p.code,
            discount_type: p.discountType,
            discount: p.discount,
            max_uses: p.maxUses,
            expiry_date: p.expiryDate,
          };
          
          // Include existing ID if this is an existing promo code
          if (p.existingId) {
            promo.id = p.existingId;
          } else if (p.id && p.id.toString().startsWith('existing-')) {
            // Extract numeric ID from "existing-123" format
            const numericId = parseInt(p.id.toString().replace('existing-', ''));
            if (!isNaN(numericId)) {
              promo.id = numericId;
            }
          }
          
          return promo;
        });
        
        formDataToSend.append('promo_codes', JSON.stringify(promoCodesPayload));
        
        // Also send existing promo IDs for deletion logic
        const existingPromoIds = formData.promoCodes
          .filter(p => p.existingId || (p.id && p.id.toString().startsWith('existing-')))
          .map(p => {
            if (p.existingId) return p.existingId;
            if (p.id && p.id.toString().startsWith('existing-')) {
              return parseInt(p.id.toString().replace('existing-', ''));
            }
            return null;
          })
          .filter(id => id !== null);
        
        if (existingPromoIds.length > 0) {
          formDataToSend.append('existing_promo_ids', JSON.stringify(existingPromoIds));
        }
      }
      
      // Submit event
      if (isEditMode && eventId) {
        await updateEvent(eventId, formDataToSend);
        toast.success('Event updated successfully!', {
          position: 'top-right',
          autoClose: 3000,
        });
      } else {
        await createEvent(formDataToSend);
        toast.success('Event created successfully! Wait for admin approval.', {
          position: 'top-right',
          autoClose: 3000,
        });
      }
      
      if (onEventCreated) {
        onEventCreated();
      }
      
      // Close modal
      onClose();
      
    } catch (err) {
      const errorMessage = (err instanceof Error) ? err.message : 'Failed to submit event. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage, {
        position: 'top-right',
        autoClose: 5000,
      });
      console.error('Error submitting event:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75"
          onClick={onClose}
        />

  {/* Modal panel */}
  <div className="inline-block align-bottom bg-white dark:bg-gray-800 dark:text-gray-100 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#27aae2] to-[#1e8bb8] px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-white">{isEditMode ? 'Edit Event' : 'Create New Event'}</h3>
                <p className="text-sm text-white/80 mt-1">Step {currentStep} of {totalSteps}</p>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Loading indicator for event data */}
            {isLoadingEvent && (
              <div className="mt-4 flex items-center justify-center space-x-2 text-white">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span className="text-sm">Loading event details...</span>
              </div>
            )}

            {/* Progress bar */}
            <div className="mt-4 bg-white/20 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-white h-full transition-all duration-300"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mx-6 mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
              <button
                onClick={() => setError('')}
                className="ml-auto text-red-500 hover:text-red-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Content */}
          <div className="px-6 py-6 max-h-[60vh] overflow-y-auto">
            {/* Step 1: Location */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Event Location <span className="text-red-500">*</span>
                  </h4>
                  
                  {/* Location Type */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <button
                      onClick={() => setFormData(prev => ({ ...prev, locationType: 'physical' }))}
                      className={`p-4 border-2 rounded-lg transition-all ${
                        formData.locationType === 'physical'
                          ? 'border-[#27aae2] bg-[#27aae2]/10'
                          : 'border-gray-300 dark:border-gray-600 hover:border-[#27aae2]/50'
                      }`}
                    >
                      <MapPin className={`w-8 h-8 mx-auto mb-2 ${
                        formData.locationType === 'physical' ? 'text-[#27aae2]' : 'text-gray-400'
                      }`} />
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Physical</p>
                    </button>

                    <button
                      onClick={() => setFormData(prev => ({ ...prev, locationType: 'online' }))}
                      className={`p-4 border-2 rounded-lg transition-all ${
                        formData.locationType === 'online'
                          ? 'border-[#27aae2] bg-[#27aae2]/10'
                          : 'border-gray-300 dark:border-gray-600 hover:border-[#27aae2]/50'
                      }`}
                    >
                      <Globe className={`w-8 h-8 mx-auto mb-2 ${
                        formData.locationType === 'online' ? 'text-[#27aae2]' : 'text-gray-400'
                      }`} />
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Online</p>
                    </button>

                    <button
                      onClick={() => setFormData(prev => ({ ...prev, locationType: 'hybrid' }))}
                      className={`p-4 border-2 rounded-lg transition-all ${
                        formData.locationType === 'hybrid'
                          ? 'border-[#27aae2] bg-[#27aae2]/10'
                          : 'border-gray-300 dark:border-gray-600 hover:border-[#27aae2]/50'
                      }`}
                    >
                      <Video className={`w-8 h-8 mx-auto mb-2 ${
                        formData.locationType === 'hybrid' ? 'text-[#27aae2]' : 'text-gray-400'
                      }`} />
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Hybrid</p>
                    </button>
                  </div>

                  {/* Physical/Hybrid Location */}
                  {(formData.locationType === 'physical' || formData.locationType === 'hybrid') && (
                    <div className="mb-4 relative">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <MapPin className="w-4 h-4 inline mr-1" />
                        Location Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.locationName}
                        onChange={(e) => handleLocationChange(e.target.value)}
                        onFocus={() => {
                          if (formData.locationName.length >= 3) {
                            setShowLocationSuggestions(true);
                          }
                        }}
                        placeholder="e.g., Ngong Hills, Nairobi"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#27aae2]"
                      />
                      
                      {/* Location Suggestions Dropdown */}
                      {showLocationSuggestions && locationSuggestions.length > 0 && (
                        <div className="absolute z-10 w-full mt-2 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                          {locationSuggestions.map((location, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => selectLocationSuggestion(location)}
                              className="w-full px-4 py-3 text-left transition-colors flex items-start space-x-2 border-b border-gray-100 dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                              <MapPin className="w-4 h-4 mt-1 flex-shrink-0 text-[#27aae2]" />
                              <span className="text-sm text-gray-700 dark:text-gray-300">{location.display_name}</span>
                            </button>
                          ))}
                        </div>
                      )}
                      {/* <button className="mt-2 text-sm text-[#27aae2] hover:text-[#1e8bb8] font-medium">
                        📍 Pin on Map
                      </button> */}
                    </div>
                  )}

                  {/* Online/Hybrid Link */}
                  {(formData.locationType === 'online' || formData.locationType === 'hybrid') && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          <LinkIcon className="w-4 h-4 inline mr-1" />
                          Event Link <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="url"
                          value={formData.onlineLink}
                          onChange={(e) => setFormData(prev => ({ ...prev, onlineLink: e.target.value }))}
                          placeholder="https://zoom.us/j/..."
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#27aae2]"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Link Share Time
                        </label>
                        <select
                          value={formData.linkShareTime}
                          onChange={(e) => setFormData(prev => ({ ...prev, linkShareTime: e.target.value }))}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#27aae2]"
                        >
                          <option value="">Select when to share link</option>
                          <option value="immediately">Immediately after booking</option>
                          <option value="1hour">1 hour before event</option>
                          <option value="30min">30 minutes before event</option>
                          <option value="15min">15 minutes before event</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Date & Time */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    <Calendar className="w-5 h-5 inline mr-2" />
                    Date & Time <span className="text-red-500">*</span>
                  </h4>

                  {/* Toggle for One-Day or Multiday Event */}
                  <div className="flex items-center gap-4 mb-6">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="eventDuration"
                        value="oneDay"
                        checked={isOneDayEvent}
                        onChange={() => setIsOneDayEvent(true)}
                      />
                      One-Day Event
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="eventDuration"
                        value="multiDay"
                        checked={!isOneDayEvent}
                        onChange={() => setIsOneDayEvent(false)}
                      />
                      Multiday Event
                    </label>
                  </div>

                  {/* Date and Time Inputs */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Start Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData((prev) => ({ ...prev, startDate: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#27aae2]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Start Time <span className="text-red-500">*</span>
                      </label>
                      <div className="flex gap-2">
                        {/* Hour */}
                        <select
                          value={startTimeState.hour}
                          onChange={(e) => setStartTimeState(prev => ({ ...prev, hour: e.target.value }))}
                          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#27aae2]"
                        >
                          {Array.from({ length: 12 }, (_, i) => i + 1).map(hour => (
                            <option key={hour} value={hour.toString().padStart(2, '0')}>
                              {hour.toString().padStart(2, '0')}
                            </option>
                          ))}
                        </select>
                        
                        {/* Minute */}
                        <select
                          value={startTimeState.minute}
                          onChange={(e) => setStartTimeState(prev => ({ ...prev, minute: e.target.value }))}
                          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#27aae2]"
                        >
                          {Array.from({ length: 60 }, (_, i) => i).map(minute => (
                            <option key={minute} value={minute.toString().padStart(2, '0')}>
                              {minute.toString().padStart(2, '0')}
                            </option>
                          ))}
                        </select>
                        
                        {/* AM/PM */}
                        <select
                          value={startTimeState.period}
                          onChange={(e) => setStartTimeState(prev => ({ ...prev, period: e.target.value as 'AM' | 'PM' }))}
                          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#27aae2]"
                        >
                          <option value="AM">AM</option>
                          <option value="PM">PM</option>
                        </select>
                      </div>
                    </div>

                    {/* End Date for Multiday Events */}
                    {!isOneDayEvent && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          End Date <span className="text-red-500">*</span>
                      </label>
                      <input
                          type="date"
                          value={formData.endDate}
                          onChange={(e) => setFormData((prev) => ({ ...prev, endDate: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#27aae2]"
                      />
                    </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        End Time <span className="text-red-500">*</span>
                      </label>
                      <div className="flex gap-2">
                        {/* Hour */}
                        <select
                          value={endTimeState.hour}
                          onChange={(e) => setEndTimeState(prev => ({ ...prev, hour: e.target.value }))}
                          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#27aae2]"
                        >
                          {Array.from({ length: 12 }, (_, i) => i + 1).map(hour => (
                            <option key={hour} value={hour.toString().padStart(2, '0')}>
                              {hour.toString().padStart(2, '0')}
                            </option>
                          ))}
                        </select>
                        
                        {/* Minute */}
                        <select
                          value={endTimeState.minute}
                          onChange={(e) => setEndTimeState(prev => ({ ...prev, minute: e.target.value }))}
                          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#27aae2]"
                        >
                          {Array.from({ length: 60 }, (_, i) => i).map(minute => (
                            <option key={minute} value={minute.toString().padStart(2, '0')}>
                              {minute.toString().padStart(2, '0')}
                            </option>
                          ))}
                        </select>
                        
                        {/* AM/PM */}
                        <select
                          value={endTimeState.period}
                          onChange={(e) => setEndTimeState(prev => ({ ...prev, period: e.target.value as 'AM' | 'PM' }))}
                          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#27aae2]"
                        >
                          <option value="AM">AM</option>
                          <option value="PM">PM</option>
                        </select>
                      </div>
                      {/* Validation message for one-day events */}
                      {isOneDayEvent && !isEndTimeValid() && (
                        <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                          End time must be after start time
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Categories */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    <Tag className="w-5 h-5 inline mr-2" />
                    Categories & Interests <span className="text-red-500">*</span>
                  </h4>

                  {/* Closed Categories */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Select Category <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {categories.length > 0 ? (
                        categories.map(category => (
                          <button
                            key={category.id}
                            onClick={() => {
                              // Only allow one category selection
                              setFormData(prev => ({
                                ...prev,
                                closedCategories: prev.closedCategories.includes(category.id.toString())
                                  ? []
                                  : [category.id.toString()]
                              }));
                            }}
                            className={`px-4 py-2 rounded-lg border-2 transition-all text-sm font-medium ${
                              formData.closedCategories.includes(category.id.toString())
                                ? 'border-[#27aae2] bg-[#27aae2] text-white'
                                : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-[#27aae2]'
                            }`}
                          >
                            {formData.closedCategories.includes(category.id.toString()) && (
                              <Check className="w-4 h-4 inline mr-1" />
                            )}
                            {category.name}
                          </button>
                        ))
                      ) : (
                        <p className="text-gray-500 dark:text-gray-400">Loading categories...</p>
                      )}
                    </div>
                  </div>

                  {/* Open Interests */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Add Custom Interests & Tag (Max 10)
                    </label>
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        id="interestInput"
                        placeholder="e.g., Hiking, Photography"
                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#27aae2]"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            if (formData.openInterests.length < 10) {
                              handleInterestAdd((e.target as HTMLInputElement).value);
                              (e.target as HTMLInputElement).value = '';
                            }
                          }
                        }}
                        disabled={formData.openInterests.length >= 10}
                      />
                      <button
                        onClick={() => {
                          const input = document.getElementById('interestInput') as HTMLInputElement;
                          if (formData.openInterests.length < 10) {
                            handleInterestAdd(input.value);
                            input.value = '';
                          }
                        }}
                        disabled={formData.openInterests.length >= 10}
                        className="px-4 py-2 bg-[#27aae2] text-white rounded-lg hover:bg-[#1e8bb8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.openInterests.map(interest => (
                        <span
                          key={interest}
                          className="px-3 py-1 bg-[#27aae2]/10 text-[#27aae2] rounded-full text-sm font-medium flex items-center gap-2"
                        >
                          {interest}
                          <button
                            onClick={() => handleInterestRemove(interest)}
                            className="hover:text-red-500"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      {formData.openInterests.length}/10 interests added
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Event Name & Photo */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Event Details <span className="text-red-500">*</span>
                  </h4>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Event Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.eventName}
                      onChange={(e) => setFormData(prev => ({ ...prev, eventName: e.target.value }))}
                      placeholder="e.g., PICNICS AT NGONG HILLS"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#27aae2]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <ImageIcon className="w-4 h-4 inline mr-1" />
                      Event Photo <span className="text-red-500">*</span>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Make sure your event stands out with a photo that captures the vibe</p>
                    </label>
                    
                    {formData.photoPreview ? (
                      <div className="relative">
                        <img
                          src={formData.photoPreview}
                          alt="Event preview"
                          className="w-full h-64 object-cover rounded-lg"
                        />
                        <button
                          onClick={() => setFormData(prev => ({ ...prev, eventPhoto: null, photoPreview: '' }))}
                          className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-[#27aae2] transition-colors">
                        <Upload className="w-12 h-12 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">Click to upload event photo</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">PNG, JPG up to 10MB</p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Description */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    <FileText className="w-5 h-5 inline mr-2" />
                    Event Description <span className="text-red-500">*</span>
                  </h4>

                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Event Description <span className="text-red-500">*</span>
                      </label>
                      <button
                        onClick={generateAIDescription}
                        className="flex items-center gap-1 px-3 py-1 text-sm bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
                      >
                        <Sparkles className="w-4 h-4" />
                        AI Generate
                      </button>
                    </div>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows={6}
                      placeholder="Describe your event..."
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#27aae2]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 6: Pricing */}
            {currentStep === 6 && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    <DollarSign className="w-5 h-5 inline mr-2" />
                    Event Pricing <span className="text-red-500">*</span>
                  </h4>

                  <div className="flex items-center gap-4 mb-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={formData.isFree}
                        onChange={() => setFormData(prev => ({ ...prev, isFree: true, ticketTypes: [] }))}
                        className="w-4 h-4 text-[#27aae2] focus:ring-[#27aae2]"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Free Event</span>
                    </label>
                    
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={!formData.isFree}
                        onChange={() => setFormData(prev => ({ ...prev, isFree: false }))}
                        className="w-4 h-4 text-[#27aae2] focus:ring-[#27aae2]"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Paid Event</span>
                    </label>
                  </div>

                  {/* Free Event - Attendee Capacity */}
                  {formData.isFree && (
                    <div className="mb-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700/30">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        <Users className="w-4 h-4 inline mr-1" />
                        Attendee Capacity
                      </label>
                      
                      <div className="flex items-center gap-4 mb-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            checked={formData.isUnlimited}
                            onChange={() => setFormData(prev => ({ ...prev, isUnlimited: true, attendeeLimit: null }))}
                            className="w-4 h-4 text-[#27aae2] focus:ring-[#27aae2]"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">Unlimited</span>
                        </label>
                        
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            checked={!formData.isUnlimited}
                            onChange={() => setFormData(prev => ({ ...prev, isUnlimited: false }))}
                            className="w-4 h-4 text-[#27aae2] focus:ring-[#27aae2]"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">Limited</span>
                        </label>
                      </div>

                      {!formData.isUnlimited && (
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={formData.attendeeLimit || ''}
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9]/g, '');
                            setFormData(prev => ({ ...prev, attendeeLimit: val ? parseInt(val) : null }));
                          }}
                          placeholder="Maximum attendees"
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#27aae2]"
                        />
                      )}
                    </div>
                  )}

                  {/* Paid Event - Tickets */}
                  {!formData.isFree && (
                    <div>
                      {/* Ticket Types Info */}
                      <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <h5 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">Ticket Types Guide:</h5>
                        <ul className="text-xs text-blue-800 dark:text-blue-400 space-y-1">
                          <li><strong>Basic:</strong> One uniform price for all attendees (e.g., Tour packages)</li>
                          <li><strong>Class-Based:</strong> Different pricing tiers - VVIP, VIP, Regular</li>
                          <li><strong>Loyalty:</strong> Reward early/loyal customers - Die Hard, Early Bird, Advance, Gate</li>
                          <li><strong>Season:</strong> Daily tickets or multi-day passes for events spanning multiple days</li>
                          <li><strong>Time Slot:</strong> Book specific time periods (max 8 slots, e.g., hourly training sessions)</li>
                        </ul>
                      </div>

                      <div className="flex items-center justify-between mb-4">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Ticket Types
                        </label>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={addTicketType}
                            className="flex items-center gap-1 px-3 py-1 bg-[#27aae2] text-white rounded-lg hover:bg-[#1e8bb8] transition-colors text-sm"
                          >
                            <Plus className="w-4 h-4" />
                            Add Ticket
                          </button>
                          <button
                            onClick={() => setShowCustomTicketForm(s => !s)}
                            className="flex items-center gap-1 px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          >
                            Add Custom Ticket
                          </button>
                        </div>
                      </div>

                      {showCustomTicketForm && (
                        <div className="p-4 mb-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Name</label>
                              <input
                                type="text"
                                value={customTicket.name || ''}
                                onChange={(e) => setCustomTicket(prev => ({ ...prev, name: e.target.value }))
                                }
                                placeholder="e.g., Early Bird"
                                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#27aae2]"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Structure</label>
                              <select
                                value={customTicket.ticketStructure || 'basic'}
                                onChange={(e) => setCustomTicket(prev => ({ ...prev, ticketStructure: e.target.value as TicketType['ticketStructure'] }))}
                                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#27aae2]"
                              >
                                <option value="basic">Basic</option>
                                <option value="class">Class</option>
                                <option value="loyalty">Loyalty</option>
                                <option value="season">Season</option>
                                <option value="timeslot">Time Slot</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Price (KES)</label>
                              <input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                value={customTicket.price ?? 0}
                                onChange={(e) => setCustomTicket(prev => ({ ...prev, price: Number(e.target.value) }))}
                                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#27aae2]"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Quantity</label>
                              {!customTicket.isUnlimited && (
                                <input
                                  type="text"
                                  inputMode="numeric"
                                  pattern="[0-9]*"
                                  value={customTicket.quantity ?? 0}
                                  onChange={(e) => setCustomTicket(prev => ({ ...prev, quantity: Number(e.target.value) }))}
                                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#27aae2]"
                                />
                              )}
                              <div className="flex items-center gap-2 mt-2">
                                <input
                                  type="checkbox"
                                  checked={customTicket.isUnlimited || false}
                                  onChange={(e) => setCustomTicket(prev => ({ ...prev, isUnlimited: e.target.checked }))}
                                  className="w-4 h-4 text-[#27aae2] focus:ring-[#27aae2] rounded"
                                />
                                <label className="text-xs text-gray-600 dark:text-gray-400">Unlimited</label>
                              </div>
                            </div>
                          </div>

                          {/* Extra fields for timeslot tickets */}
                          {customTicket.ticketStructure === 'timeslot' && (
                            <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                              <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Time Slot Details</h5>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Start Time</label>
                                  <div className="flex gap-2">
                                    <select
                                      value={customTicket.startTime ? parseTime(customTicket.startTime).hour : '09'}
                                      onChange={(e) => {
                                        const currentStart = customTicket.startTime ? parseTime(customTicket.startTime) : { hour: '09', minute: '00', period: 'AM' as 'AM' | 'PM' };
                                        const newTime = formatTimeTo24(e.target.value, currentStart.minute, currentStart.period);
                                        setCustomTicket(prev => ({ ...prev, startTime: newTime }));
                                      }}
                                      className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#27aae2]"
                                    >
                                      {Array.from({ length: 12 }, (_, i) => {
                                        const hour = (i + 1).toString().padStart(2, '0');
                                        return <option key={hour} value={hour}>{hour}</option>;
                                      })}
                                    </select>
                                    <select
                                      value={customTicket.startTime ? parseTime(customTicket.startTime).minute : '00'}
                                      onChange={(e) => {
                                        const currentStart = customTicket.startTime ? parseTime(customTicket.startTime) : { hour: '09', minute: '00', period: 'AM' as 'AM' | 'PM' };
                                        const newTime = formatTimeTo24(currentStart.hour, e.target.value, currentStart.period);
                                        setCustomTicket(prev => ({ ...prev, startTime: newTime }));
                                      }}
                                      className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#27aae2]"
                                    >
                                      {['00', '15', '30', '45'].map(min => (
                                        <option key={min} value={min}>{min}</option>
                                      ))}
                                    </select>
                                    <select
                                      value={customTicket.startTime ? parseTime(customTicket.startTime).period : 'AM'}
                                      onChange={(e) => {
                                        const currentStart = customTicket.startTime ? parseTime(customTicket.startTime) : { hour: '09', minute: '00', period: 'AM' as 'AM' | 'PM' };
                                        const newTime = formatTimeTo24(currentStart.hour, currentStart.minute, e.target.value as 'AM' | 'PM');
                                        setCustomTicket(prev => ({ ...prev, startTime: newTime }));
                                      }}
                                      className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#27aae2]"
                                    >
                                      <option value="AM">AM</option>
                                      <option value="PM">PM</option>
                                    </select>
                                  </div>
                                </div>

                                <div>
                                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">End Time</label>
                                  <div className="flex gap-2">
                                    <select
                                      value={customTicket.endTime ? parseTime(customTicket.endTime).hour : '10'}
                                      onChange={(e) => {
                                        const currentEnd = customTicket.endTime ? parseTime(customTicket.endTime) : { hour: '10', minute: '00', period: 'AM' as 'AM' | 'PM' };
                                        const newTime = formatTimeTo24(e.target.value, currentEnd.minute, currentEnd.period);
                                        setCustomTicket(prev => ({ ...prev, endTime: newTime }));
                                        // Validate that end time is after start time
                                        if (customTicket.startTime && newTime <= customTicket.startTime) {
                                          setTimeslotErrors(prev => ({ ...prev, custom: 'End time cannot be lower than start time' }));
                                        } else {
                                          setTimeslotErrors(prev => {
                                            const newErrors = { ...prev };
                                            delete newErrors.custom;
                                            return newErrors;
                                          });
                                        }
                                      }}
                                      className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#27aae2]"
                                    >
                                      {Array.from({ length: 12 }, (_, i) => {
                                        const hour = (i + 1).toString().padStart(2, '0');
                                        return <option key={hour} value={hour}>{hour}</option>;
                                      })}
                                    </select>
                                    <select
                                      value={customTicket.endTime ? parseTime(customTicket.endTime).minute : '00'}
                                      onChange={(e) => {
                                        const currentEnd = customTicket.endTime ? parseTime(customTicket.endTime) : { hour: '10', minute: '00', period: 'AM' as 'AM' | 'PM' };
                                        const newTime = formatTimeTo24(currentEnd.hour, e.target.value, currentEnd.period);
                                        setCustomTicket(prev => ({ ...prev, endTime: newTime }));
                                        // Validate that end time is after start time
                                        if (customTicket.startTime && newTime <= customTicket.startTime) {
                                          setTimeslotErrors(prev => ({ ...prev, custom: 'End time cannot be lower than start time' }));
                                        } else {
                                          setTimeslotErrors(prev => {
                                            const newErrors = { ...prev };
                                            delete newErrors.custom;
                                            return newErrors;
                                          });
                                        }
                                      }}
                                      className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#27aae2]"
                                    >
                                      {['00', '15', '30', '45'].map(min => (
                                        <option key={min} value={min}>{min}</option>
                                      ))}
                                    </select>
                                    <select
                                      value={customTicket.endTime ? parseTime(customTicket.endTime).period : 'AM'}
                                      onChange={(e) => {
                                        const currentEnd = customTicket.endTime ? parseTime(customTicket.endTime) : { hour: '10', minute: '00', period: 'AM' as 'AM' | 'PM' };
                                        const newTime = formatTimeTo24(currentEnd.hour, currentEnd.minute, e.target.value as 'AM' | 'PM');
                                        setCustomTicket(prev => ({ ...prev, endTime: newTime }));
                                        // Validate that end time is after start time
                                        if (customTicket.startTime && newTime <= customTicket.startTime) {
                                          setTimeslotErrors(prev => ({ ...prev, custom: 'End time cannot be lower than start time' }));
                                        } else {
                                          setTimeslotErrors(prev => {
                                            const newErrors = { ...prev };
                                            delete newErrors.custom;
                                            return newErrors;
                                          });
                                        }
                                      }}
                                      className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#27aae2]"
                                    >
                                      <option value="AM">AM</option>
                                      <option value="PM">PM</option>
                                    </select>
                                  </div>
                                  {timeslotErrors.custom && (
                                    <div className="flex items-center gap-2 mt-2 text-red-600 dark:text-red-400">
                                      <AlertCircle className="h-4 w-4" />
                                      <p className="text-xs">{timeslotErrors.custom}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="flex items-center justify-end gap-2 mt-3">
                            <button
                              onClick={handleCustomTicketCancel}
                              className="px-3 py-1 rounded-lg border border-gray-300 dark:border-gray-600 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={handleCustomTicketSave}
                              className="px-4 py-1 bg-[#27aae2] text-white rounded-lg text-sm hover:bg-[#1e8bb8] transition-colors"
                            >
                              Save Ticket
                            </button>
                          </div>
                        </div>
                      )}

                      <div className="space-y-4">
                        {formData.ticketTypes.map((ticket) => (
                          <div key={ticket.id} className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg">
                            <div className="space-y-4">
                              {/* Ticket Structure Selection */}
                              <div>
                                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Ticket Structure</label>
                                <select
                                  value={ticket.ticketStructure}
                                  onChange={(e) => updateTicketType(ticket.id, 'ticketStructure', e.target.value)}
                                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#27aae2]"
                                >
                                  <option value="basic">Basic Ticket (Uniform Price)</option>
                                  <option value="class">Class-Based (VVIP, VIP, Regular)</option>
                                  <option value="loyalty">Loyalty-Based (Die Hard, Early Bird, etc.)</option>
                                  <option value="season">Season Ticket (Daily/Multi-day)</option>
                                  <option value="timeslot">Time Slot Ticket</option>
                                </select>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Ticket Name */}
                                <div>
                                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Ticket Name</label>
                                  <input
                                    type="text"
                                    value={ticket.name}
                                    onChange={(e) => updateTicketType(ticket.id, 'name', e.target.value)}
                                    placeholder={
                                      ticket.ticketStructure === 'basic' ? 'e.g., General Admission' :
                                      ticket.ticketStructure === 'class' ? 'e.g., VIP Access' :
                                      ticket.ticketStructure === 'loyalty' ? 'e.g., Early Bird Special' :
                                      ticket.ticketStructure === 'season' ? 'e.g., 3-Day Pass' :
                                      'e.g., Morning Session'
                                    }
                                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#27aae2]"
                                  />
                                </div>

                                {/* Class Type (only for class-based) */}
                                {ticket.ticketStructure === 'class' && (
                                  <div>
                                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Class Type</label>
                                    <select
                                      value={ticket.classType || 'regular'}
                                      onChange={(e) => updateTicketType(ticket.id, 'classType', e.target.value)}
                                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#27aae2]"
                                    >
                                      <option value="vvip">VVIP</option>
                                      <option value="vip">VIP</option>
                                      <option value="regular">Regular</option>
                                    </select>
                                  </div>
                                )}

                                {/* Loyalty Type (only for loyalty-based) */}
                                {ticket.ticketStructure === 'loyalty' && (
                                  <div>
                                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Loyalty Type</label>
                                    <select
                                      value={ticket.loyaltyType || 'earlybird'}
                                      onChange={(e) => updateTicketType(ticket.id, 'loyaltyType', e.target.value)}
                                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#27aae2]"
                                    >
                                      <option value="diehard">Die Hard</option>
                                      <option value="earlybird">Early Bird</option>
                                      <option value="advance">Advance</option>
                                      <option value="gate">Gate Ticket</option>
                                    </select>
                                  </div>
                                )}

                                {/* Season Type (only for season-based) */}
                                {ticket.ticketStructure === 'season' && (
                                  <>
                                    <div>
                                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Season Type</label>
                                      <select
                                        value={ticket.seasonType || 'daily'}
                                        onChange={(e) => updateTicketType(ticket.id, 'seasonType', e.target.value)}
                                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#27aae2]"
                                      >
                                        <option value="daily">Daily Ticket</option>
                                        <option value="season">Season Ticket</option>
                                      </select>
                                    </div>
                                    {ticket.seasonType === 'season' && (
                                      <div>
                                        <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Duration (Days)</label>
                                        <input
                                          type="number"
                                          value={ticket.seasonDuration || ''}
                                          onChange={(e) => updateTicketType(ticket.id, 'seasonDuration', parseInt(e.target.value) || 1)}
                                          placeholder="e.g., 3"
                                          min="1"
                                          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#27aae2]"
                                        />
                                      </div>
                                    )}
                                  </>
                                )}

                                {/* Time Slot (only for timeslot-based) */}
                                {ticket.ticketStructure === 'timeslot' && (
                                  <div>
                                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Start Time</label>
                                    <div className="flex gap-2">
                                      <select
                                        value={ticket.startTime ? parseTime(ticket.startTime).hour : '09'}
                                        onChange={(e) => {
                                          const currentStart = ticket.startTime ? parseTime(ticket.startTime) : { hour: '09', minute: '00', period: 'AM' as 'AM' | 'PM' };
                                          const newTime = formatTimeTo24(e.target.value, currentStart.minute, currentStart.period);
                                          updateTicketType(ticket.id, 'startTime', newTime);
                                        }}
                                        className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#27aae2]"
                                      >
                                        {Array.from({ length: 12 }, (_, i) => {
                                          const hour = (i + 1).toString().padStart(2, '0');
                                          return <option key={hour} value={hour}>{hour}</option>;
                                        })}
                                      </select>
                                      <select
                                        value={ticket.startTime ? parseTime(ticket.startTime).minute : '00'}
                                        onChange={(e) => {
                                          const currentStart = ticket.startTime ? parseTime(ticket.startTime) : { hour: '09', minute: '00', period: 'AM' as 'AM' | 'PM' };
                                          const newTime = formatTimeTo24(currentStart.hour, e.target.value, currentStart.period);
                                          updateTicketType(ticket.id, 'startTime', newTime);
                                        }}
                                        className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#27aae2]"
                                      >
                                        {['00', '15', '30', '45'].map(min => (
                                          <option key={min} value={min}>{min}</option>
                                        ))}
                                      </select>
                                      <select
                                        value={ticket.startTime ? parseTime(ticket.startTime).period : 'AM'}
                                        onChange={(e) => {
                                          const currentStart = ticket.startTime ? parseTime(ticket.startTime) : { hour: '09', minute: '00', period: 'AM' as 'AM' | 'PM' };
                                          const newTime = formatTimeTo24(currentStart.hour, currentStart.minute, e.target.value as 'AM' | 'PM');
                                          updateTicketType(ticket.id, 'startTime', newTime);
                                        }}
                                        className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#27aae2]"
                                      >
                                        <option value="AM">AM</option>
                                        <option value="PM">PM</option>
                                      </select>
                                    </div>

                                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1 mt-2">End Time</label>
                                    <div className="flex gap-2">
                                      <select
                                        value={ticket.endTime ? parseTime(ticket.endTime).hour : '10'}
                                        onChange={(e) => {
                                          const currentEnd = ticket.endTime ? parseTime(ticket.endTime) : { hour: '10', minute: '00', period: 'AM' as 'AM' | 'PM' };
                                          const newTime = formatTimeTo24(e.target.value, currentEnd.minute, currentEnd.period);
                                          updateTicketType(ticket.id, 'endTime', newTime);
                                          // Validate that end time is after start time
                                          if (ticket.startTime && newTime <= ticket.startTime) {
                                            setTimeslotErrors(prev => ({ ...prev, [ticket.id]: 'End time cannot be lower than start time' }));
                                          } else {
                                            setTimeslotErrors(prev => {
                                              const newErrors = { ...prev };
                                              delete newErrors[ticket.id];
                                              return newErrors;
                                            });
                                          }
                                        }}
                                        className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#27aae2]"
                                      >
                                        {Array.from({ length: 12 }, (_, i) => {
                                          const hour = (i + 1).toString().padStart(2, '0');
                                          return <option key={hour} value={hour}>{hour}</option>;
                                        })}
                                      </select>
                                      <select
                                        value={ticket.endTime ? parseTime(ticket.endTime).minute : '00'}
                                        onChange={(e) => {
                                          const currentEnd = ticket.endTime ? parseTime(ticket.endTime) : { hour: '10', minute: '00', period: 'AM' as 'AM' | 'PM' };
                                          const newTime = formatTimeTo24(currentEnd.hour, e.target.value, currentEnd.period);
                                          updateTicketType(ticket.id, 'endTime', newTime);
                                          // Validate that end time is after start time
                                          if (ticket.startTime && newTime <= ticket.startTime) {
                                            setTimeslotErrors(prev => ({ ...prev, [ticket.id]: 'End time cannot be lower than start time' }));
                                          } else {
                                            setTimeslotErrors(prev => {
                                              const newErrors = { ...prev };
                                              delete newErrors[ticket.id];
                                              return newErrors;
                                            });
                                          }
                                        }}
                                        className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#27aae2]"
                                      >
                                        {['00', '15', '30', '45'].map(min => (
                                          <option key={min} value={min}>{min}</option>
                                        ))}
                                      </select>
                                      <select
                                        value={ticket.endTime ? parseTime(ticket.endTime).period : 'AM'}
                                        onChange={(e) => {
                                          const currentEnd = ticket.endTime ? parseTime(ticket.endTime) : { hour: '10', minute: '00', period: 'AM' as 'AM' | 'PM' };
                                          const newTime = formatTimeTo24(currentEnd.hour, currentEnd.minute, e.target.value as 'AM' | 'PM');
                                          updateTicketType(ticket.id, 'endTime', newTime);
                                          // Validate that end time is after start time
                                          if (ticket.startTime && newTime <= ticket.startTime) {
                                            setTimeslotErrors(prev => ({ ...prev, [ticket.id]: 'End time cannot be lower than start time' }));
                                          } else {
                                            setTimeslotErrors(prev => {
                                              const newErrors = { ...prev };
                                              delete newErrors[ticket.id];
                                              return newErrors;
                                            });
                                          }
                                        }}
                                        className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#27aae2]"
                                      >
                                        <option value="AM">AM</option>
                                        <option value="PM">PM</option>
                                      </select>
                                    </div>
                                    
                                    {timeslotErrors[ticket.id] && (
                                      <div className="flex items-center gap-2 mt-2 text-red-600 dark:text-red-400">
                                        <AlertCircle className="h-4 w-4" />
                                        <p className="text-xs">{timeslotErrors[ticket.id]}</p>
                                      </div>
                                    )}

                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Max 8 time slots per event</p>
                                  </div>
                                )}

                                {/* Price */}
                                <div>
                                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Price (KES)</label>
                                  <input
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    value={ticket.price || ''}
                                    onChange={(e) => {
                                      const v = e.target.value.replace(/[^0-9.]/g, '');
                                      updateTicketType(ticket.id, 'price', parseFloat(v) || 0);
                                    }}
                                    placeholder="0"
                                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#27aae2]"
                                  />
                                </div>

                                {/* Quantity */}
                                <div>
                                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Quantity Available</label>
                                  {!ticket.isUnlimited && (
                                    <input
                                      type="text"
                                      inputMode="numeric"
                                      pattern="[0-9]*"
                                      value={ticket.quantity || ''}
                                      onChange={(e) => {
                                        const v = e.target.value.replace(/[^0-9]/g, '');
                                        updateTicketType(ticket.id, 'quantity', parseInt(v) || 0);
                                      }}
                                      placeholder="0"
                                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#27aae2]"
                                    />
                                  )}
                                  <div className="flex items-center gap-2 mt-2">
                                    <input
                                      type="checkbox"
                                      checked={ticket.isUnlimited || false}
                                      onChange={(e) => updateTicketType(ticket.id, 'isUnlimited', e.target.checked)}
                                      className="w-4 h-4 text-[#27aae2] focus:ring-[#27aae2] rounded"
                                    />
                                    <label className="text-xs text-gray-600 dark:text-gray-400">Unlimited</label>
                                  </div>
                                </div>
                              </div>

                              {/* Delete button */}
                              <div className="flex items-center justify-end pt-2">
                                <button
                                  onClick={() => removeTicketType(ticket.id)}
                                  className="flex items-center gap-1 px-3 py-1.5 text-red-500 border border-red-300 dark:border-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-xs"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  Remove
                                </button>
                              </div>

                              {/* Ticket Preview */}
                              <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Preview:</p>
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                  {ticket.name || 'Ticket Name'} 
                                  {ticket.ticketStructure === 'class' && ` (${ticket.classType?.toUpperCase() || 'CLASS'})`}
                                  {ticket.ticketStructure === 'loyalty' && ` (${ticket.loyaltyType?.replace(/([A-Z])/g, ' $1').trim() || 'LOYALTY TYPE'})`}
                                  {ticket.ticketStructure === 'season' && ticket.seasonType === 'season' && ` (${ticket.seasonDuration || 0}-Day Pass)`}
                                  {ticket.ticketStructure === 'timeslot' && ticket.startTime && ticket.endTime && (
                                    <span>
                                      {' ('}
                                      {(() => {
                                        const start = parseTime(ticket.startTime);
                                        const end = parseTime(ticket.endTime);
                                        return `${start.hour}:${start.minute} ${start.period} - ${end.hour}:${end.minute} ${end.period}`;
                                      })()}
                                      {')'}
                                    </span>
                                  )}
                                  {ticket.ticketStructure === 'timeslot' && (!ticket.startTime || !ticket.endTime) && ` (TIME SLOT)`}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  KES {ticket.price.toLocaleString()} • {ticket.quantity} available
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}

                        {formData.ticketTypes.length === 0 && (
                          <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                            No ticket types added yet. Click "Add Ticket" to create one.
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 7: Promo Codes (Paid Events Only) */}
            {currentStep === 7 && !formData.isFree && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    <Tag className="w-5 h-5 inline mr-2" />
                    Promo Codes (Optional)
                  </h4>

                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Add promotional codes to offer discounts to your attendees. This step is optional.
                  </p>

                  <div className="flex items-center justify-between mb-4">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Discount Codes
                    </label>
                    <button
                      onClick={addPromoCode}
                      className="flex items-center gap-1 px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      Add Promo Code
                    </button>
                  </div>

                  <div className="space-y-3">
                    {formData.promoCodes.map(promo => (
                      <div key={promo.id} className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Promo Code</label>
                            <input
                              type="text"
                              value={promo.code}
                              onChange={(e) => updatePromoCode(promo.id, 'code', e.target.value.toUpperCase())}
                              placeholder="e.g., EARLYBIRD"
                              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#27aae2]"
                            />
                          </div>

                          <div>
                            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Discount Type</label>
                            <select
                              value={promo.discountType}
                              onChange={(e) => updatePromoCode(promo.id, 'discountType', e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#27aae2]"
                            >
                              <option value="percentage">Percentage (%)</option>
                              <option value="fixed">Fixed Amount (KES)</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Discount Value</label>
                            <input
                              type="number"
                              value={promo.discount}
                              onChange={(e) => updatePromoCode(promo.id, 'discount', parseFloat(e.target.value) || 0)}
                              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#27aae2]"
                            />
                          </div>

                          <div>
                            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Max Uses</label>
                            <input
                              type="number"
                              value={promo.maxUses}
                              onChange={(e) => updatePromoCode(promo.id, 'maxUses', parseInt(e.target.value) || 0)}
                              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#27aae2]"
                            />
                          </div>

                          <div>
                            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Expiry Date</label>
                            <input
                              type="date"
                              value={promo.expiryDate}
                              onChange={(e) => updatePromoCode(promo.id, 'expiryDate', e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#27aae2]"
                            />
                          </div>

                          <div className="flex items-end">
                            <button
                              onClick={() => removePromoCode(promo.id)}
                              className="w-full p-2 text-red-500 border border-red-300 dark:border-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4 mx-auto" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}

                    {formData.promoCodes.length === 0 && (
                      <p className="text-center text-gray-500 dark:text-gray-400 py-8 text-sm">
                        No promo codes added yet. Promo codes are optional and can help you offer special discounts.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-600 flex items-center justify-between">
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
              Back
            </button>

            <div className="flex items-center gap-2">
              {/* Show Next button or Submit button based on step and event type */}
              {(currentStep < totalSteps && !(currentStep === 6 && formData.isFree)) ? (
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-6 py-2 bg-[#27aae2] text-white rounded-lg hover:bg-[#1e8bb8] transition-colors"
                >
                  Next
                  <ChevronRight className="w-5 h-5" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className={`flex items-center gap-2 px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors ${
                    isLoading ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 11-18 0a9 9 0 0118 0z" />
                      </svg>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      <span>{isEditMode ? 'Update Event' : 'Submit for Approval'}</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
