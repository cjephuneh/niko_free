import { Settings, Menu, X, Search, User, LogOut, Shield, FileText, DollarSign, BarChart3, Users, Calendar } from 'lucide-react';
import { MessageSquare } from 'lucide-react';
import { Users as UsersIcon } from 'lucide-react';
import { Sun, Moon } from 'lucide-react';
import MessagesPage from '../components/adminDashboard/MessagesPage';
import { useState } from 'react';
import { useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUser } from '../services/authService';
import OverviewStats from '../components/adminDashboard/OverviewStats';
import UsersPage from '../components/adminDashboard/UsersPage';
import PartnersSection from '../components/adminDashboard/PartnersSection';
import EventsSection from '../components/adminDashboard/EventsSection';
import RecentActivity from '../components/adminDashboard/RecentActivity';
import PendingApprovals from '../components/adminDashboard/PendingApprovals';
import Reports from '../components/adminDashboard/Reports';
import Revenue from '../components/adminDashboard/Revenue';
import MyProfilePage from '../components/adminDashboard/MyProfilePage';
import SettingsPage from '../components/adminDashboard/SettingsPage';
import NotificationsPage from '../components/adminDashboard/NotificationsPage';

interface AdminDashboardProps {
  onNavigate: (page: string) => void;
}

export default function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const { user: authUser, logout } = useAuth();
  const [adminUser, setAdminUser] = useState<any>(null);
  
  // Example notification count
  const [notificationCount, setNotificationCount] = useState(3);
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'partners' | 'events' | 'settings' | 'reports' | 'revenue' | 'users' | 'profile' | 'notifications' | 'messages'>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  // Ref for account menu
  const accountMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Get admin user from auth context or localStorage
    const user = authUser || getUser();
    setAdminUser(user);
  }, [authUser]);

  // Close account dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (accountMenuOpen && accountMenuRef.current && !accountMenuRef.current.contains(event.target as Node)) {
        setAccountMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [accountMenuOpen]);
  const [searchQuery, setSearchQuery] = useState('');

  // Removed hardcoded data - components now fetch their own data

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200 relative">
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
      
      <div className="relative z-10 flex min-h-screen w-full">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Left Sidebar */}
      <aside className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 lg:transform-none ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="h-full flex flex-col">
          {/* Sidebar Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#27aae2] to-[#1e8bb8] rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900 dark:text-white">Admin Portal</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">System Control</p>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Sidebar Menu */}
          <nav className="flex-1 overflow-y-auto p-4">
            <div className="space-y-2">
              <button
                onClick={() => setActiveTab('overview')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all ${
                  activeTab === 'overview'
                    ? 'bg-[#27aae2] text-white shadow-lg'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <BarChart3 className="w-5 h-5" />
                <span>Overview</span>
              </button>

              <button
                onClick={() => setActiveTab('partners')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all ${
                  activeTab === 'partners'
                    ? 'bg-[#27aae2] text-white shadow-lg'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Users className="w-5 h-5" />
                <span>Partners</span>
              </button>

              <button
                onClick={() => setActiveTab('users')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all ${
                  activeTab === 'users'
                    ? 'bg-[#27aae2] text-white shadow-lg'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <UsersIcon className="w-5 h-5" />
                <span>Users</span>
              </button>

              <button
                onClick={() => setActiveTab('events')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all ${
                  activeTab === 'events'
                    ? 'bg-[#27aae2] text-white shadow-lg'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Calendar className="w-5 h-5" />
                <span>Events</span>
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all ${
                  activeTab === 'settings'
                    ? 'bg-[#27aae2] text-white shadow-lg'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Settings className="w-5 h-5" />
                <span>Settings</span>
              </button>

              <button
                onClick={() => setActiveTab('reports')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all ${
                  activeTab === 'reports'
                    ? 'bg-[#27aae2] text-white shadow-lg'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <FileText className="w-5 h-5" />
                <span>Reports</span>
              </button>

              <button
                onClick={() => setActiveTab('revenue')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all ${
                  activeTab === 'revenue'
                    ? 'bg-[#27aae2] text-white shadow-lg'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <DollarSign className="w-5 h-5" />
                <span>Revenue</span>
              </button>
            </div>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Navigation */}
        <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30 shadow-sm">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              {/* Left - Menu & Title */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <Menu className="w-6 h-6" />
                </button>
              </div>

              {/* Center - Search Bar */}
              <div className="hidden md:flex flex-1 max-w-md mx-8">
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-100 dark:bg-gray-700 dark:text-white border-0 rounded-xl focus:ring-2 focus:ring-[#27aae2] focus:bg-white dark:focus:bg-gray-600 transition-all"
                  />
                </div>
              </div>

              {/* Right - Account Menu */}
              <div className="flex items-center space-x-2">
                {/* Dark/Light Mode Toggle */}
                <button
                  onClick={() => {
                    setDarkMode(!darkMode);
                    document.documentElement.classList.toggle('dark');
                  }}
                  className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  aria-label="Toggle dark mode"
                >
                  {darkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />}
                </button>
                {/* Message Icon */}
                <button
                  className="relative p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  aria-label="Messages"
                  onClick={() => setActiveTab('messages')}
                >
                  <MessageSquare className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                  {/* Example: message count badge (optional) */}
                  {/* <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full px-1.5 py-0.5 min-w-[18px] text-center shadow">2</span> */}
                </button>
                {/* Notification Icon with Counter */}
                <button
                  className="relative p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  aria-label="Notifications"
                  onClick={() => setActiveTab('notifications')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {notificationCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full px-1.5 py-0.5 min-w-[18px] text-center shadow">
                      {notificationCount}
                    </span>
                  )}
                </button>

                <div className="relative" ref={accountMenuRef}>
                  <button
                    onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                    className="flex items-center space-x-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                  >
                    <img
                      src={adminUser?.profile_picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(adminUser?.first_name + ' ' + adminUser?.last_name || 'Admin')}&background=27aae2&color=fff`}
                      alt="Admin"
                      className="w-9 h-9 rounded-full object-cover"
                    />
                    <div className="hidden sm:block text-left">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {adminUser?.first_name && adminUser?.last_name 
                          ? `${adminUser.first_name} ${adminUser.last_name}`
                          : 'System Admin'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {adminUser?.email || 'Administrator'}
                      </p>
                    </div>
                  </button>

                  {/* Account Dropdown */}
                  {accountMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {adminUser?.first_name && adminUser?.last_name 
                            ? `${adminUser.first_name} ${adminUser.last_name}`
                            : 'System Admin'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {adminUser?.email || 'admin@nikofree.com'}
                        </p>
                      </div>
                      <button onClick={() => { setActiveTab('profile'); setAccountMenuOpen(false); }} className="w-full px-4 py-2.5 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-2">
                        <User className="w-4 h-4" />
                        <span>My Profile</span>
                      </button>
                      <button onClick={() => { setActiveTab('settings'); setAccountMenuOpen(false); }} className="w-full px-4 py-2.5 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-2">
                        <Settings className="w-4 h-4" />
                        <span>Settings</span>
                      </button>
                      <div className="border-t border-gray-100 dark:border-gray-700 mt-2 pt-2">
                        <button 
                          onClick={() => {
                            logout();
                            onNavigate('landing');
                          }}
                          className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center space-x-2"
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
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="flex-1 overflow-x-hidden p-6 lg:p-8">
          {activeTab === 'messages' && <MessagesPage />}
          {activeTab === 'notifications' && <NotificationsPage />}
          {activeTab === 'users' && <UsersPage />}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <OverviewStats />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <PendingApprovals
                  onReviewPartners={() => setActiveTab('partners')}
                  onReviewEvents={() => setActiveTab('events')}
                />
                <RecentActivity />
              </div>
            </div>
          )}
          {activeTab === 'partners' && <PartnersSection />}
          {activeTab === 'events' && <EventsSection />}
          {activeTab === 'reports' && <Reports />}
          {activeTab === 'revenue' && <Revenue />}
          {activeTab === 'settings' && <SettingsPage />}
          {activeTab === 'profile' && <MyProfilePage />}
        </main>
      </div>
      </div>
    </div>
  );
}
