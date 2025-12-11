import React, { useState, useEffect } from 'react';
import { Calendar, Heart, Download, QrCode, Bell, Users, Check, Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import MyTickets from '../components/userDashboard/MyTickets';
import Notifications from '../components/userDashboard/Notifications';
import Messages from '../components/userDashboard/Messages';
import EventDetail from '../components/userDashboard/EventDetail';
import MyProfile from '../components/userDashboard/MyProfile';
import Settings from '../components/userDashboard/Settings';
import EventsBooked from '../components/userDashboard/EventsBooked';
import BucketList from '../components/userDashboard/BucketList';
import PendingBookings from '../components/userDashboard/PendingBookings';
import EventHistory from '../components/userDashboard/EventHistory';
import { getUserProfile, getUserBookings, getBucketlist, getUserNotifications } from '../services/userService';
import { API_BASE_URL, getImageUrl } from '../config/api';

interface UserDashboardProps {
  onNavigate: (page: string) => void;
}

export default function UserDashboard({ onNavigate }: UserDashboardProps) {
  const { user, isAuthenticated, logout: logoutUser } = useAuth();
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [activeEventsTab, setActiveEventsTab] = useState<'going' | 'saved'>('going');
  const [activeView, setActiveView] = useState<'dashboard' | 'tickets' | 'notifications' | 'messages' | 'eventDetail' | 'profile' | 'settings' | 'eventsBooked' | 'bucketList' | 'eventHistory'>('dashboard');
  const [selectedEvent, setSelectedEvent] = useState<{
    id: string;
    title: string;
    image: string;
    date: string;
    time?: string;
    location: string;
    price?: string;
    ticketId?: string;
    rating?: number;
    isOutdated?: boolean;
  } | null>(null);
  const { isDarkMode, toggleTheme } = useTheme();
  const accountMenuRef = React.useRef<HTMLDivElement>(null);
  const accountButtonRef = React.useRef<HTMLButtonElement>(null);
  
  // User profile data from API
  const [userProfile, setUserProfile] = useState({
    name: 'User',
    avatar: '',
    joinDate: '',
    eventsAttended: 0
  });
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [bucketlistEvents, setBucketlistEvents] = useState<any[]>([]);
  const [eventHistory, setEventHistory] = useState<any[]>([]);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Fetch user data and events
  useEffect(() => {
    if (isAuthenticated) {
      fetchUserData();
    }
  }, [isAuthenticated]);

  const fetchUserData = async () => {
    try {
      setIsLoadingData(true);
      
      // Fetch user profile
      const profileData = await getUserProfile();
      const userData = profileData.user || profileData;
      const fullName = `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || 'User';
      // Use getImageUrl helper to properly handle profile picture URLs (handles /uploads/ paths and full URLs)
      const avatar = userData.profile_picture 
        ? getImageUrl(userData.profile_picture)
        : '';
      const joinDate = userData.created_at 
        ? new Date(userData.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        : '';

      setUserProfile({
        name: fullName,
        avatar: avatar,
        joinDate: joinDate,
        eventsAttended: 0
      });

      // Fetch upcoming bookings
      const upcomingBookings = await getUserBookings('upcoming');
      const upcoming = (upcomingBookings.bookings || []).map((booking: any) => {
        const event = booking.event || {};
        const startDate = event.start_date ? new Date(event.start_date) : new Date();
        return {
          id: booking.id?.toString() || event.id?.toString() || '',
          bookingId: booking.id, // Keep booking ID for ticket operations
          title: event.title || 'Event',
          image: event.poster_image 
            ? `${API_BASE_URL}${event.poster_image.startsWith('/') ? '' : '/'}${event.poster_image}`
            : 'https://images.pexels.com/photos/2747449/pexels-photo-2747449.jpeg?auto=compress&cs=tinysrgb&w=400',
          date: startDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
          time: startDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
          location: event.venue_name || event.venue_address || 'Location TBA',
          ticketId: booking.booking_number || `TKT-${booking.id}`,
          eventId: event.id,
          attendees: event.attendee_count || 0
        };
      });
      setUpcomingEvents(upcoming);

      // Fetch bucketlist
      const bucketlistData = await getBucketlist();
      const bucketlist = (bucketlistData.events || []).map((event: any) => {
        const startDate = event.start_date ? new Date(event.start_date) : new Date();
        const now = new Date();
        return {
          id: event.id?.toString() || '',
          title: event.title || 'Event',
          image: event.poster_image 
            ? (event.poster_image.startsWith('http') 
                ? event.poster_image 
                : `${API_BASE_URL}${event.poster_image.startsWith('/') ? '' : '/'}${event.poster_image}`)
            : 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&w=400',
          date: startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          location: event.venue_name || event.venue_address || 'Location TBA',
          price: event.is_free ? 'Free' : `KES ${event.ticket_types?.[0]?.price ? parseFloat(event.ticket_types[0].price).toLocaleString() : 0}`,
          isOutdated: startDate < now,
          eventId: event.id,
          status: event.status, // Include status so we can show it if needed
          is_published: event.is_published,
          attendees: event.attendee_count || 0
        };
      });
      setBucketlistEvents(bucketlist);

      // Fetch past bookings (event history)
      const pastBookings = await getUserBookings('past');
      const history = (pastBookings.bookings || []).map((booking: any) => {
        const event = booking.event || {};
        const startDate = event.start_date ? new Date(event.start_date) : new Date();
        return {
          id: booking.id?.toString() || event.id?.toString() || '',
          title: event.title || 'Event',
          image: event.poster_image 
            ? `${API_BASE_URL}${event.poster_image.startsWith('/') ? '' : '/'}${event.poster_image}`
            : 'https://images.pexels.com/photos/1481308/pexels-photo-1481308.jpeg?auto=compress&cs=tinysrgb&w=400',
          date: startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          location: event.venue_name || event.venue_address || 'Location TBA',
          rating: 5, // TODO: Get actual rating from reviews
          eventId: event.id,
          attendees: event.attendee_count || 0
        };
      });
      setEventHistory(history);

      // Update events attended count
      setUserProfile(prev => ({
        ...prev,
        eventsAttended: history.length
      }));

      // Fetch unread notification count
      try {
        const notificationsData = await getUserNotifications(true); // unread only
        setUnreadNotificationCount(notificationsData.unread_count || 0);
      } catch (err) {
        console.error('Error fetching notification count:', err);
      }

    } catch (err: any) {
      console.error('Error fetching user data:', err);
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleEventClick = (event: any) => {
    setSelectedEvent(event);
    setActiveView('eventDetail');
  };

  const handleBackToEvents = () => {
    setSelectedEvent(null);
    setActiveView('dashboard');
  };

  const handleBackToDashboard = () => {
    setActiveView('dashboard');
  };

  React.useEffect(() => {
    if (!accountMenuOpen) return;
    function handleClickOutside(event: MouseEvent) {
      const menu = accountMenuRef.current;
      const button = accountButtonRef.current;
      if (
        menu &&
        !menu.contains(event.target as Node) &&
        button &&
        !button.contains(event.target as Node)
      ) {
        setAccountMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [accountMenuOpen]);

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
      {/* Top Navigation */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Left - Logo */}
            <div className="flex items-center space-x-4">
              <button
                className="text-xl font-bold text-gray-900 dark:text-white focus:outline-none hover:text-[#27aae2] transition-colors"
                onClick={() => onNavigate('landing')}
                aria-label="Go to Landing Page"
              >
                Niko Free
              </button>
            </div>

            {/* Right - Notifications, Messages, Account */}
            <div className="flex items-center space-x-3">
              {/* Notifications */}
              <button 
                onClick={() => setActiveView('notifications')}
                className="relative p-2.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
              >
                <Bell className="w-5 h-5" />
                {unreadNotificationCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
                {unreadNotificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                  </span>
                )}
              </button>

              {/* Messages */}
              {/* <button 
                onClick={() => setActiveView('messages')}
                className="relative p-2.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#27aae2] rounded-full"></span>
              </button> */}

              {/* Account Menu */}
              <div className="relative">
                <button
                  ref={accountButtonRef}
                  onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                  className="flex items-center space-x-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                >
                  <img
                    src={userProfile.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userProfile.name)}&background=27aae2&color=fff`}
                    alt={userProfile.name}
                    className="w-9 h-9 rounded-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(userProfile.name)}&background=27aae2&color=fff`;
                    }}
                  />
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{userProfile.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Member</p>
                  </div>
                </button>

                {/* Account Dropdown */}
                {accountMenuOpen && (
                  <div ref={accountMenuRef} className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{userProfile.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Joined {userProfile.joinDate}</p>
                    </div>
                    <button 
                      onClick={() => setActiveView('profile')}
                      className="w-full px-4 py-2.5 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      My Profile
                    </button>
                    <button 
                      onClick={() => setActiveView('settings')}
                      className="w-full px-4 py-2.5 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      Settings
                    </button>
                    
                    {/* Dark/Light Mode Toggle */}
                    <button 
                      onClick={toggleTheme}
                      className="w-full px-4 py-2.5 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-between"
                    >
                      <span>Theme</span>
                      <div className="flex items-center space-x-2">
                        {isDarkMode ? (
                          <>
                            <Moon className="w-4 h-4 text-[#27aae2]" />
                            <span className="text-xs font-semibold text-[#27aae2]">Dark</span>
                          </>
                        ) : (
                          <>
                            <Sun className="w-4 h-4 text-[#27aae2]" />
                            <span className="text-xs font-semibold text-[#27aae2]">Light</span>
                          </>
                        )}
                      </div>
                    </button>
                    
                    <div className="border-t border-gray-100 mt-2 pt-2">
                      <button 
                        onClick={() => {
                          logoutUser();
                          onNavigate('landing');
                        }}
                        className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        Log Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column - Profile & Stats */}
          <aside className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 sticky top-24">
              {/* Profile Section */}
              <div className="text-center mb-6">
                <img
                  src={userProfile.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userProfile.name)}&background=27aae2&color=fff&size=128`}
                  alt={userProfile.name}
                  className="w-24 h-24 rounded-full object-cover mx-auto mb-3 border-4 border-[#27aae2]/20"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(userProfile.name)}&background=27aae2&color=fff&size=128`;
                  }}
                />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{userProfile.name}</h2>
                {userProfile.joinDate && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">Joined {userProfile.joinDate}</p>
                )}
              </div>

              {/* User Stats */}
              <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
                <div className="bg-gradient-to-br from-[#27aae2]/10 to-[#27aae2]/20 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-10 h-10 bg-[#27aae2] rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      {upcomingEvents.length + bucketlistEvents.filter(e => !e.isOutdated).length}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-gray-900 dark:text-white mb-3">Your Events</p>
                  
                  {/* Tabs */}
                  <div className="flex gap-2 mb-3">
                    <button
                      onClick={() => setActiveEventsTab('going')}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1 ${
                        activeEventsTab === 'going'
                          ? 'bg-[#27aae2] text-white shadow-sm'
                          : 'bg-white/50 text-[#27aae2] hover:bg-white/80'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Going ({upcomingEvents.length})</span>
                    </button>
                    <button
                      onClick={() => setActiveEventsTab('saved')}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1 ${
                        activeEventsTab === 'saved'
                          ? 'bg-[#27aae2] text-white shadow-sm'
                          : 'bg-white/50 text-[#27aae2] hover:bg-white/80'
                      }`}
                    >
                      <Heart className="w-3.5 h-3.5" />
                      <span>Liked ({bucketlistEvents.filter(e => !e.isOutdated).length})</span>
                    </button>
                  </div>

                  {/* Event List - with scrolling support */}
                  <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-gray-500">
                    {isLoadingData ? (
                      <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#27aae2] mx-auto"></div>
                      </div>
                    ) : activeEventsTab === 'going' ? (
                      upcomingEvents.length > 0 ? (
                        upcomingEvents.map((event) => (
                          <div 
                            key={event.id} 
                            onClick={() => handleEventClick(event)}
                            className="bg-white/70 rounded-lg p-2 hover:bg-white transition-colors cursor-pointer"
                          >
                            <div className="flex items-center gap-2">
                              <img
                                src={event.image}
                                alt={event.title}
                                className="w-10 h-10 rounded object-cover"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{event.title}</p>
                                <p className="text-xs text-gray-700 dark:text-gray-300">{event.date}</p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-gray-500 dark:text-gray-400 text-center py-2">No upcoming events</p>
                      )
                    ) : (
                      bucketlistEvents.filter(e => !e.isOutdated).length > 0 ? (
                        bucketlistEvents.filter(e => !e.isOutdated).map((event) => (
                          <div 
                            key={event.id} 
                            onClick={() => handleEventClick(event)}
                            className="bg-white/70 rounded-lg p-2 hover:bg-white transition-colors cursor-pointer"
                          >
                            <div className="flex items-center gap-2">
                              <img
                                src={event.image}
                                alt={event.title}
                                className="w-10 h-10 rounded object-cover"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{event.title}</p>
                                <p className="text-xs text-gray-700 dark:text-gray-300">{event.price}</p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-gray-500 dark:text-gray-400 text-center py-2">No saved events</p>
                      )
                    )}
                  </div>
                </div>

              </div>

              {/* Quick Actions */}
              <div className="space-y-2">
                <button 
                  onClick={() => setActiveView('dashboard')}
                  className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    activeView === 'dashboard'
                      ? 'bg-[#27aae2] text-white'
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                  }`}
                >
                  Browse Events
                </button>
                <button 
                  onClick={() => setActiveView('tickets')}
                  className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    activeView === 'tickets'
                      ? 'bg-[#27aae2] text-white'
                      : 'border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-[#27aae2] hover:text-[#27aae2]'
                  }`}
                >
                  My Tickets
                </button>
              </div>
            </div>
          </aside>

          {/* Right Column - Events Content */}
          <main className="lg:col-span-9">
          {activeView === 'dashboard' ? (
            <>
          {/* Pending Bookings Section */}
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Pending Bookings</h2>
            </div>
            <PendingBookings />
          </section>

          {/* Events Booked Section */}
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Events Booked</h2>
              <button 
                onClick={() => setActiveView('eventsBooked')}
                className="text-[#27aae2] hover:text-[#1e8bb8] font-semibold text-sm"
              >
                View All
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {isLoadingData ? (
                <div className="col-span-full text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#27aae2] mx-auto"></div>
                  <p className="text-gray-500 dark:text-gray-400 mt-2">Loading events...</p>
                </div>
              ) : upcomingEvents.length > 0 ? (
                upcomingEvents.map((event) => (
                <div
                  key={event.id}
                  onClick={() => handleEventClick(event)}
                  className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all border border-gray-100 dark:border-gray-700 cursor-pointer"
                >
                  <div className="relative h-36">
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-0.5 rounded-full text-xs font-bold">
                      BOOKED
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2 line-clamp-1 text-sm">{event.title}</h3>
                    <div className="space-y-1.5 text-xs text-gray-600 dark:text-gray-300 mb-3">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-3.5 h-3.5 text-[#27aae2]" />
                        <span>{event.date} • {event.time}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <QrCode className="w-3.5 h-3.5 text-[#27aae2]" />
                        <span className="font-mono text-xs">{event.ticketId}</span>
                      </div>
                      {event.attendees !== undefined && (
                        <div className="flex items-center space-x-2">
                          <Users className="w-3.5 h-3.5 text-[#27aae2]" />
                          <span>{event.attendees} attending</span>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEventClick(event);
                        }}
                        className="flex-1 py-2 bg-[#27aae2] text-white rounded-lg text-sm font-semibold hover:bg-[#1e8bb8] transition-colors"
                      >
                        View Ticket
                      </button>
                      <button 
                        onClick={async (e) => {
                          e.stopPropagation();
                          try {
                            const { downloadTicket } = await import('../services/userService');
                            // Use bookingId if available, otherwise fall back to id
                            const bookingId = (event as any).bookingId || parseInt(event.id);
                            const blob = await downloadTicket(bookingId);
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `ticket-${event.ticketId}.pdf`;
                            document.body.appendChild(a);
                            a.click();
                            window.URL.revokeObjectURL(url);
                            document.body.removeChild(a);
                          } catch (err: any) {
                            console.error('Error downloading ticket:', err);
                            alert('Failed to download ticket: ' + (err.message || 'Unknown error'));
                          }
                        }}
                        className="px-3 py-2 bg-white dark:bg-gray-700 text-[#27aae2] border-2 border-[#27aae2] rounded-lg text-sm font-semibold hover:bg-[#27aae2]/10 transition-colors"
                        title="Download Ticket"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
                ))
              ) : (
                <div className="col-span-full text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">No booked events yet</p>
                </div>
              )}
            </div>
          </section>

          {/* Bucket List Section */}
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Bucket List</h2>
              <button 
                onClick={() => setActiveView('bucketList')}
                className="text-[#27aae2] hover:text-[#1e8bb8] font-semibold text-sm"
              >
                View All
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {isLoadingData ? (
                <div className="col-span-full text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#27aae2] mx-auto"></div>
                  <p className="text-gray-500 dark:text-gray-400 mt-2">Loading events...</p>
                </div>
              ) : bucketlistEvents.length > 0 ? (
                bucketlistEvents.map((event) => (
                <div
                  key={event.id}
                  onClick={() => handleEventClick(event)}
                  className={`bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all border border-gray-100 dark:border-gray-700 cursor-pointer ${
                    event.isOutdated ? 'opacity-75' : ''
                  }`}
                >
                  <div className="relative h-36">
                    <img
                      src={event.image}
                      alt={event.title}
                      className={`w-full h-full object-cover ${event.isOutdated ? 'grayscale' : ''}`}
                    />
                    {event.isOutdated && (
                      <div className="absolute top-2 right-2 bg-gray-500 text-white px-2 py-0.5 rounded-full text-xs font-bold">
                        PAST EVENT
                      </div>
                    )}
                    <button className="absolute top-2 left-2 w-8 h-8 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform">
                      <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                    </button>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2 line-clamp-1 text-sm">{event.title}</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-300 mb-2">{event.date}</p>
                    {event.attendees !== undefined && (
                      <div className="flex items-center space-x-1 mb-2">
                        <Users className="w-3 h-3 text-[#27aae2]" />
                        <span className="text-xs text-gray-600 dark:text-gray-400">{event.attendees} attending</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-[#27aae2]">{event.price}</span>
                      <button 
                        className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                          event.isOutdated
                            ? 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400 cursor-not-allowed'
                            : 'bg-[#27aae2] text-white hover:bg-[#1e8bb8]'
                        }`}
                        disabled={event.isOutdated}
                      >
                        {event.isOutdated ? 'Expired' : 'Book Now'}
                      </button>
                    </div>
                  </div>
                </div>
                ))
              ) : (
                <div className="col-span-full text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">No saved events yet</p>
                </div>
              )}
            </div>
          </section>

          {/* Event History Section */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Event History</h2>
              <button 
                onClick={() => setActiveView('eventHistory')}
                className="text-[#27aae2] hover:text-[#1e8bb8] font-semibold text-sm"
              >
                View All
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {isLoadingData ? (
                <div className="col-span-full text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#27aae2] mx-auto"></div>
                  <p className="text-gray-500 dark:text-gray-400 mt-2">Loading events...</p>
                </div>
              ) : eventHistory.length > 0 ? (
                eventHistory.map((event) => (
                <div
                  key={event.id}
                  onClick={() => handleEventClick(event)}
                  className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all border border-gray-100 dark:border-gray-700 cursor-pointer"
                >
                  <div className="relative h-36">
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 bg-gray-500 text-white px-2 py-0.5 rounded-full text-xs font-bold">
                      COMPLETED
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2 line-clamp-1 text-sm">{event.title}</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-300 mb-2">{event.date}</p>
                    {event.attendees !== undefined && (
                      <div className="flex items-center space-x-1 mb-2">
                        <Users className="w-3 h-3 text-[#27aae2]" />
                        <span className="text-xs text-gray-600 dark:text-gray-400">{event.attendees} attending</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-0.5 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-4 h-4 ${i < event.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 fill-gray-300'}`}
                          viewBox="0 0 20 20"
                        >
                          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                        </svg>
                      ))}
                    </div>
                    <button className="w-full py-2 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-semibold hover:border-[#27aae2] hover:text-[#27aae2] transition-all flex items-center justify-center space-x-2">
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Receipt</span>
                    </button>
                  </div>
                </div>
                ))
              ) : (
                <div className="col-span-full text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">No past events yet</p>
                </div>
              )}
            </div>
          </section>
          </>
          ) : activeView === 'tickets' ? (
            <MyTickets />
          ) : activeView === 'notifications' ? (
            <Notifications />
          ) : activeView === 'eventDetail' && selectedEvent ? (
            <EventDetail event={selectedEvent} onBack={handleBackToEvents} />
          ) : activeView === 'profile' ? (
            <MyProfile />
          ) : activeView === 'settings' ? (
            <Settings />
          ) : activeView === 'eventsBooked' ? (
            <EventsBooked onEventClick={handleEventClick} onBack={handleBackToDashboard} />
          ) : activeView === 'bucketList' ? (
            <BucketList onEventClick={handleEventClick} onBack={handleBackToDashboard} />
          ) : activeView === 'eventHistory' ? (
            <EventHistory onEventClick={handleEventClick} onBack={handleBackToDashboard} />
          ) : (
            <Messages />
          )}
          </main>
        </div>
      </div>
      </div>
    </div>
  );
}
