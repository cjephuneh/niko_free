import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useParams, useLocation } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import EventDetailPage from './pages/EventDetailPage';
import PartnerProfilePage from './pages/PartnerProfilePage';
import UserDashboard from './pages/UserDashboard';
import PartnerDashboard from './pages/PartnerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import BecomePartner from './pages/BecomePartner';
import AboutUs from './pages/AboutUs';
import ThisWeekend from './pages/ThisWeekend';
import CalendarPage from './pages/CalendarPage';
import DownloadTicket from './pages/DownloadTicket';
import TermsOfService from './pages/TermsOfService';
import PrivacyPolicy from './pages/PrivacyPolicy';
import ContactUs from './pages/ContactUs';
import Feedback from './pages/Feedback';
import AdminRoute from './components/AdminRoute';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { googleLogin } from './services/authService';
import { useAuth } from './contexts/AuthContext';

// Wrapper component to extract eventId from URL params
function EventDetailPageWrapper({ onNavigate }: { onNavigate: (page: string, params?: any) => void }) {
  const { eventId } = useParams<{ eventId: string }>();
  return <EventDetailPage eventId={eventId || '1'} onNavigate={onNavigate} />;
}

// Wrapper component to extract partnerId from URL params
function PartnerProfilePageWrapper({ onNavigate }: { onNavigate: (page: string, params?: any) => void }) {
  const { partnerId } = useParams<{ partnerId: string }>();
  return <PartnerProfilePage partnerId={partnerId || '1'} onNavigate={onNavigate} />;
}

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setAuthData } = useAuth();

  // Handle Google OAuth callback
  useEffect(() => {
    const handleGoogleCallback = async () => {
      // Check if we have an ID token in the URL hash
      const hash = window.location.hash.substring(1);
      const params = new URLSearchParams(hash);
      const idToken = params.get('id_token');
      const error = params.get('error');

      if (error) {
        console.error('Google OAuth error:', error);
        toast.error('Google Sign-In was cancelled or failed.', {
          position: 'top-right',
          autoClose: 3000,
        });
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
      }

      if (idToken) {
        try {
          // Verify nonce if stored
          const storedNonce = sessionStorage.getItem('google_oauth_nonce');
          sessionStorage.removeItem('google_oauth_nonce');
          sessionStorage.removeItem('google_oauth_redirect');

          // Send token to backend
          const loginResponse = await googleLogin(idToken);

          // Update AuthContext
          if (loginResponse.access_token && loginResponse.user) {
            setAuthData(loginResponse.user, loginResponse.access_token);
            toast.success('Logged in successfully with Google!', {
              position: 'top-right',
              autoClose: 3000,
            });
            // Navigate to user dashboard
            navigate('/user-dashboard');
          }

          // Clean up URL
          window.history.replaceState({}, document.title, window.location.pathname);
        } catch (err) {
          console.error('Google login error:', err);
          toast.error('Google login failed. Please try again.', {
            position: 'top-right',
            autoClose: 3000,
          });
          // Clean up URL
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }
    };

    // Check for OAuth callback on mount and when location changes
    if (window.location.hash.includes('id_token=') || window.location.hash.includes('error=')) {
      handleGoogleCallback();
    }
  }, [location, navigate, setAuthData]);

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      offset: 100,
      easing: 'ease-out-cubic'
    });
  }, []);

  const navigateToEventDetail = (eventId: string) => {
    navigate(`/event-detail/${eventId}`);
  };

  const navigateTo = (page: string, params?: any) => {
    if (page === 'partner-profile' && params?.partnerId) {
      navigate(`/partner/${params.partnerId}`);
    } else if (page === 'event-detail' && params?.eventId) {
      navigate(`/event-detail/${params.eventId}`);
    } else {
      navigate(`/${page === 'landing' ? '' : page}`);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Routes>
        <Route 
          path="/" 
          element={
            <LandingPage
              onNavigate={navigateTo}
              onEventClick={navigateToEventDetail}
            />
          } 
        />
        <Route 
          path="/event-detail/:eventId" 
          element={<EventDetailPageWrapper onNavigate={navigateTo} />} 
        />
        <Route 
          path="/partner/:partnerId" 
          element={<PartnerProfilePageWrapper onNavigate={navigateTo} />} 
        />
        <Route 
          path="/user-dashboard" 
          element={<UserDashboard onNavigate={navigateTo} />} 
        />
        <Route 
          path="/partner-dashboard" 
          element={<PartnerDashboard onNavigate={navigateTo} />} 
        />
        <Route 
          path="/admin-dashboard" 
          element={<AdminRoute onNavigate={navigateTo} />} 
        />
        <Route 
          path="/become-partner" 
          element={<BecomePartner onNavigate={navigateTo} />} 
        />
        <Route 
          path="/about" 
          element={<AboutUs onNavigate={navigateTo} />} 
        />
        <Route 
          path="/this-weekend" 
          element={
            <ThisWeekend 
              onNavigate={navigateTo} 
              onEventClick={navigateToEventDetail} 
            />
          } 
        />
        <Route 
          path="/calendar" 
          element={
            <CalendarPage 
              onNavigate={navigateTo} 
              onEventClick={navigateToEventDetail} 
            />
          } 
        />
        <Route 
          path="/download-ticket/:bookingNumber" 
          element={<DownloadTicket />} 
        />
        <Route 
          path="/api/tickets/download/:bookingNumber" 
          element={<DownloadTicket />} 
        />
        <Route 
          path="/terms" 
          element={<TermsOfService onNavigate={navigateTo} />} 
        />
        <Route 
          path="/privacy" 
          element={<PrivacyPolicy onNavigate={navigateTo} />} 
        />
        <Route 
          path="/contact" 
          element={<ContactUs onNavigate={navigateTo} />} 
        />
        <Route 
          path="/feedback" 
          element={<Feedback onNavigate={navigateTo} />} 
        />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
      <ToastContainer />
    </BrowserRouter>
  );
}

export default App;
