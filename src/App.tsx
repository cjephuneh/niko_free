import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useParams } from 'react-router-dom';
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
import AdminRoute from './components/AdminRoute';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
