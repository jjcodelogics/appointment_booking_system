import React, { useState, useEffect } from 'react';
import api from './utils/api';

// Layout
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

// Public Pages - Corrected import paths
import HomePage from './components/pages/Home';
import AboutPage from './components/pages/About';
import ServicesPage from './components/pages/Services';
import ContactPage from './components/pages/Contact';

// Auth & Booking - Corrected import paths
import AuthPage from './components/auth/Auth';
import Dashboard from './components/user/Dashboard';
import BookAppointment from './components/booking/BookAppointment';
import RescheduleAppointment from './components/booking/RescheduleAppointment';

const App = () => {
  const [view, setView] = useState('home');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rescheduleId, setRescheduleId] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Check for logged-in user on initial load
  useEffect(() => {
    api.checkAuthStatus()
      .then(userData => {
        if (userData) {
          setUser(userData);
          setView('dashboard'); // If logged in, go to dashboard
        }
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const navigate = (targetView) => setView(targetView);

  const handleLogin = (loggedInUser) => {
    setUser(loggedInUser);
    setView('dashboard');
  };

  const handleLogout = async () => {
    await api.logout();
    setUser(null);
    setView('home');
  };

  const navigateToDashboard = () => {
    setRefreshKey(prevKey => prevKey + 1); // Force dashboard to refresh data
    setView('dashboard');
  };

  const handleReschedule = (id) => {
    setRescheduleId(id);
    setView('rescheduling');
  };

  const renderView = () => {
    if (loading) return <div className="container"><p>Loading...</p></div>;

    // Logged-in user views
    if (user) {
      switch (view) {
        case 'dashboard':
          return <Dashboard key={refreshKey} user={user} onBookNew={() => navigate('booking')} onReschedule={handleReschedule} />;
        case 'booking':
          return <BookAppointment onBookingSuccess={navigateToDashboard} />;
        case 'rescheduling':
          return <RescheduleAppointment appointmentId={rescheduleId} onRescheduleSuccess={navigateToDashboard} />;
        default: // If logged in, default to dashboard
          return <Dashboard key={refreshKey} user={user} onBookNew={() => navigate('booking')} onReschedule={handleReschedule} />;
      }
    }

    // Public views
    switch (view) {
      case 'login':
        return <AuthPage onLogin={handleLogin} onNavigate={navigate} />;
      case 'services':
        return <ServicesPage onNavigate={navigate} />;
      case 'about':
        return <AboutPage onNavigate={navigate} />;
      case 'contact':
        return <ContactPage onNavigate={navigate} />;
      case 'home':
      default:
        return <HomePage onNavigate={navigate} />;
    }
  };

  return (
    <>
      <Header user={user} onNavigate={navigate} onLogout={handleLogout} />
      {renderView()}
      <Footer />
    </>
  );
};

export default App;