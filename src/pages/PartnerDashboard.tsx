import { Calendar, Users, Zap, Home, Bell, UserPlus, QrCode, Award, Menu, X, Search, User, Settings as SettingsIcon, LogOut, Moon, Sun, BarChart3, HelpCircle, AlertTriangle } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { getPartnerToken, getPartner, getPartnerProfile, logoutPartner, getPartnerDashboard } from '../services/partnerService';
import { getImageUrl, API_BASE_URL, API_ENDPOINTS } from '../config/api';
import AskSupport from '../components/partnerDashboard/AskSupport';
import Overview from '../components/partnerDashboard/Overview';
import MyEvents from '../components/partnerDashboard/MyEvents';
import Attendees from '../components/partnerDashboard/Attendees';
import BoostEvent from '../components/partnerDashboard/BoostEvent';
import NotificationSettings from '../components/partnerDashboard/NotificationSettings';
import Notifications from '../components/partnerDashboard/Notifications';
import AssignRoles from '../components/partnerDashboard/AssignRoles';
import TicketScanner from '../components/partnerDashboard/TicketScanner';
import PartnerVerification from '../components/partnerDashboard/PartnerVerification';
import Settings from '../components/partnerDashboard/Settings';
import MyProfile from '../components/partnerDashboard/MyProfile';
import CreateEvent from '../components/partnerDashboard/CreateEvent';
import WithdrawFunds from '../components/partnerDashboard/WithdrawFunds';
import Analytics from '../components/partnerDashboard/Analytics';

interface PartnerDashboardProps {
  onNavigate: (page: string) => void;
}

export default function PartnerDashboard({ onNavigate }: PartnerDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'events' | 'attendees' | 'boost' | 'analytics' | 'notifications' | 'roles' | 'scanner' | 'verification' | 'settings' | 'profile'>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [createEventOpen, setCreateEventOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const { isDarkMode, toggleTheme } = useTheme();
  const [partnerData, setPartnerData] = useState<any>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [pendingEarnings, setPendingEarnings] = useState<number>(0);
  const [availableBalance, setAvailableBalance] = useState(0);
  const [showPasswordWarning, setShowPasswordWarning] = useState(false);
  const navigate = useNavigate();

  // Check authentication on mount
  useEffect(() => {
    const token = getPartnerToken();
    if (!token) {
      navigate('/');
      return;
    }
    setIsAuthorized(true);
    
    const fetchPartnerData = async () => {
      try {
        // Get from localStorage first (fast)
        const cachedPartner = getPartner();
        if (cachedPartner) {
          setPartnerData(cachedPartner);
        }

        // Fetch dashboard data to get pending earnings
        const dashboardData = await getPartnerDashboard();
        if (dashboardData?.stats?.pending_earnings !== undefined) {
          setPendingEarnings(dashboardData.stats.pending_earnings);
        }

        // Then fetch fresh profile data
        const response = await getPartnerProfile();
        if (response) {
          const partner = response.partner || response;
          
          // Ensure logo is included - don't filter out valid logos
          const updatedPartnerData = {
            ...partner,
            // Keep the logo field even if it exists, don't filter base64 here
            logo: partner.logo || cachedPartner?.logo || null
          };
          
          setPartnerData(updatedPartnerData);
          
          // Check if password needs to be changed (first login)
          const hasSeenPasswordWarning = localStorage.getItem(`partner_password_warning_${partner.id}`);
          
          // Show warning if password_changed_at is null/undefined and user hasn't seen the warning
          if (!partner.password_changed_at && !hasSeenPasswordWarning) {
            setShowPasswordWarning(true);
          }
        }
      } catch (err: any) {
        console.error('Error fetching partner data:', err);
        // If error fetching, might be invalid token, redirect to login
        if (err?.message?.includes('401') || err?.message?.includes('Unauthorized') || err?.message?.includes('Not authenticated')) {
          logoutPartner();
          navigate('/');
          return;
        }
        // Fallback to localStorage if API fails
        const cachedPartner = getPartner();
        if (cachedPartner) {
          setPartnerData(cachedPartner);
        }
      }
    };

    const fetchFinancialData = async () => {
      try {
        const token = getPartnerToken();
        if (!token) return;

        // Fetch dashboard data which includes financial stats
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.partner.dashboard}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          const stats = data.stats || {};
          
          // Get current balance (pending earnings - available to withdraw)
          const pendingEarnings = parseFloat(stats.pending_earnings || 0);
          setAvailableBalance(pendingEarnings);
        }
      } catch (err) {
        console.error('Error fetching financial data:', err);
      }
    };

    fetchPartnerData();
    fetchFinancialData();
  }, [navigate]);

  const menuItems = [
    { id: 'overview', label: 'Home', icon: Home },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'attendees', label: 'Attendees', icon: Users },
    { id: 'boost', label: 'Boost Event', icon: Zap },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'roles', label: 'Assign Roles', icon: UserPlus },
    // { id: 'scanner', label: 'Scan Tickets', icon: QrCode },
    { id: 'verification', label: 'Partner Verification', icon: Award }
  ];

  // Close account menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target as Node)) {
        setAccountMenuOpen(false);
      }
    };

    if (accountMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [accountMenuOpen]);

  // Show loading or redirect if not authorized
  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#27aae2] mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Checking authentication...</p>
        </div>
      </div>
    );
  }

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
      <div className="flex">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 lg:transform-none ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}>
          <div className="h-full flex flex-col">
            {/* Sidebar Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Partner Portal</h2>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="lg:hidden text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Menu Items */}
            <nav className="flex-1 overflow-y-auto p-4">
              <ul className="space-y-2">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => {
                          setActiveTab(item.id as typeof activeTab);
                          setSidebarOpen(false);
                        }}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all ${
                          activeTab === item.id
                            ? 'bg-[#27aae2] text-white shadow-lg'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span>{item.label}</span>
                      </button>
                    </li>
                  );
                })}
                {/* Contact Support Button */}
                <li>
                  <button
                    onClick={() => setActiveTab('support')}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all mt-4
                      ${activeTab === 'support' ? 'bg-gradient-to-r from-[#27aae2] to-[#1e8bb8] text-white shadow-lg' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'}`}
                  >
                    <HelpCircle className="w-5 h-5" />
                    <span>Contact Support</span>
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-x-hidden">
          {/* Top Bar */}
          <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 fixed top-0 right-0 left-0 lg:left-64 z-30 shadow-sm">
            <div className="px-2 sm:px-4 lg:px-8 py-2 sm:py-3 md:py-4">
              <div className="flex items-center justify-between gap-2 sm:gap-4">
                {/* Left Section - Menu & Title */}
                <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
                  <button
                    onClick={() => setSidebarOpen(true)}
                    className="lg:hidden text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                  <div className="hidden sm:block">
                    <h1 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 dark:text-white">
                      {menuItems.find(item => item.id === activeTab)?.label}
                    </h1>
                  </div>
                </div>

                {/* Center Section - Search Bar */}
                <div className="flex-1 max-w-md hidden md:block">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search events, attendees..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 md:pl-10 pr-3 md:pr-4 py-2 md:py-2.5 text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg md:rounded-xl focus:outline-none focus:ring-2 focus:ring-[#27aae2] focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Right Section - Actions & Account */}
                <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
                  {/* Dark Mode Toggle */}
                  <button
                    onClick={toggleTheme}
                    className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    aria-label="Toggle dark mode"
                  >
                    {isDarkMode ? (
                      <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-300" />
                    ) : (
                      <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-300" />
                    )}
                  </button>
                  
                  {/* Account Menu */}
                  <div className="relative" ref={accountMenuRef}>
                    <button
                      onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                      className="flex items-center space-x-2 sm:space-x-3 p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg sm:rounded-xl transition-colors"
                    >
                      {partnerData?.logo ? (
                        <img 
                          src={getImageUrl(partnerData.logo)}
                          alt={partnerData.business_name}
                          className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                          onError={(e) => {
                            // Fallback to UI Avatars if image fails to load
                            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(partnerData?.business_name || 'Partner')}&background=27aae2&color=fff&size=128`;
                          }}
                        />
                      ) : (
                        <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 bg-gradient-to-br from-[#27aae2] to-[#1e8bb8] rounded-full flex items-center justify-center">
                          <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-white" />
                        </div>
                      )}
                      <div className="hidden lg:block text-left">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {partnerData?.business_name || 'Partner Account'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {partnerData?.email || 'Loading...'}
                        </p>
                      </div>
                    </button>

                    {/* Dropdown Menu */}
                    {accountMenuOpen && (
                      <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3">
                          {partnerData?.logo ? (
                            <img 
                              src={getImageUrl(partnerData.logo)}
                              alt={partnerData.business_name}
                              className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(partnerData?.business_name || 'Partner')}&background=27aae2&color=fff&size=128`;
                              }}
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gradient-to-br from-[#27aae2] to-[#1e8bb8] rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-white" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                              {partnerData?.business_name || 'Partner Account'}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {partnerData?.email || 'Loading...'}
                            </p>
                          </div>
                        </div>
                        <button 
                          onClick={() => {
                            setActiveTab('profile');
                            setAccountMenuOpen(false);
                          }}
                          className="w-full px-4 py-2.5 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-3"
                        >
                          <User className="w-4 h-4" />
                          <span>My Profile</span>
                        </button>
                        <button 
                          onClick={() => {
                            setActiveTab('settings');
                            setAccountMenuOpen(false);
                          }}
                          className="w-full px-4 py-2.5 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-3"
                        >
                          <SettingsIcon className="w-4 h-4" />
                          <span>Settings</span>
                        </button>
                        <div className="border-t border-gray-100 dark:border-gray-700 mt-2 pt-2">
                          <button 
                            onClick={() => {
                              logoutPartner();
                              navigate('/');
                            }}
                            className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center space-x-3"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>Log Out</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Mobile Search Bar */}
              <div className="mt-2 md:hidden">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search events..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#27aae2] focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="px-2 sm:px-4 lg:px-8 py-3 sm:py-4 lg:py-6 pt-[7.5rem] sm:pt-32 md:pt-20 lg:pt-24">
            {activeTab === 'overview' && <Overview onWithdrawClick={() => setWithdrawOpen(true)} />}
            {activeTab === 'events' && (
              <MyEvents 
                onCreateEvent={() => setCreateEventOpen(true)}
                key={activeTab} // Force re-render when tab changes
              />
            )}
            {activeTab === 'attendees' && <Attendees />}
            {activeTab === 'boost' && <BoostEvent />}
            {activeTab === 'analytics' && <Analytics />}
            {activeTab === 'notifications' && <Notifications />}
            {activeTab === 'roles' && <AssignRoles />}
            {activeTab === 'scanner' && <TicketScanner />}
            {activeTab === 'verification' && <PartnerVerification />}
            {activeTab === 'settings' && <Settings />}
            {activeTab === 'profile' && <MyProfile />}
            {activeTab === 'support' && (
              <AskSupport onSent={() => setActiveTab('overview')} />
            )}
          </div>
        </main>

        {/* Create Event Modal */}
        <CreateEvent 
          isOpen={createEventOpen} 
          onClose={() => setCreateEventOpen(false)}
          onEventCreated={() => {
            // Force refresh events by re-mounting the component
            // This is handled by the key prop on MyEvents
            if (activeTab === 'events') {
              // Trigger a re-render
              setCreateEventOpen(false);
            }
          }}
        />

        {/* Withdraw Funds Modal */}
        <WithdrawFunds 
          isOpen={withdrawOpen} 
          onClose={() => {
            setWithdrawOpen(false);
            // Refresh dashboard data after withdrawal
            const refreshData = async () => {
              try {
                const dashboardData = await getPartnerDashboard();
                if (dashboardData?.stats?.pending_earnings !== undefined) {
                  setPendingEarnings(dashboardData.stats.pending_earnings);
                }
              } catch (err) {
                console.error('Error refreshing dashboard:', err);
              }
            };
            refreshData();
          }}
          availableBalance={availableBalance}
        />

        {/* Password Change Warning Modal */}
        {showPasswordWarning && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border-4 border-red-500">
              {/* Header with red gradient */}
              <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4 flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Security Alert</h2>
                  <p className="text-sm text-red-100">Action Required</p>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Update Your Password
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                    For your security, please update your default password immediately. This is required for all new partner accounts.
                  </p>
                  <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded">
                    <p className="text-sm text-red-800 dark:text-red-200 font-medium">
                      ⚠️ Your account is using a default password. Please change it to secure your account.
                    </p>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => {
                      if (partnerData?.id) {
                        localStorage.setItem(`partner_password_warning_${partnerData.id}`, 'true');
                      }
                      setShowPasswordWarning(false);
                      setActiveTab('settings');
                    }}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold hover:from-red-600 hover:to-red-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                  >
                    <SettingsIcon className="w-5 h-5" />
                    <span>Update Password Now</span>
                  </button>
                  <button
                    onClick={() => {
                      if (partnerData?.id) {
                        localStorage.setItem(`partner_password_warning_${partnerData.id}`, 'true');
                      }
                      setShowPasswordWarning(false);
                    }}
                    className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
                  >
                    Later
                  </button>
                </div>

                <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center">
                  You can update your password anytime in Settings → Security
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
