import React, { useState, useEffect } from 'react';
import api from './utils/api';

// Layout Components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

// Page Components
import HomePage from './components/pages/HomePage';
import AboutPage from './components/pages/AboutPage';
import ServicesPage from './components/pages/ServicesPage';
import ContactPage from './components/pages/ContactPage';

// Auth & User Components
import Login from './components/auth/Login';
import Appointments from './components/Appointments';
import BookAppointment from './components/booking/BookAppointment';
import RescheduleAppointment from './components/booking/RescheduleAppointment';

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('home'); // Start on the home page
  const [rescheduleId, setRescheduleId] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    api.checkAuthStatus()
      .then(userData => {
        if (userData) setUser(userData);
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const handleLogin = (loggedInUser) => {
    setUser(loggedInUser);
    setView('dashboard');
  };

  const handleLogout = async () => {
    await api.logout();
    setUser(null);
    setView('home');
  };

  const navigate = (targetView) => setView(targetView);

  const navigateToDashboard = () => {
    setRefreshKey(prevKey => prevKey + 1);
    setView('dashboard');
  };

  const navigateToBooking = () => setView('booking');
  const navigateToReschedule = (id) => {
    setRescheduleId(id);
    setView('rescheduling');
  };

  const renderView = () => {
    if (loading) {
      return <div>Loading...</div>;
    }

    if (!user) {
      switch (view) {
        case 'services':
          return <ServicesPage onNavigate={navigate} />;
        case 'about':
          return <AboutPage onNavigate={navigate} />;
        case 'contact':
          return <ContactPage onNavigate={navigate} />;
        case 'login':
          return <Login onLogin={handleLogin} />;
        case 'home':
        default:
          return <HomePage onNavigate={navigate} />;
      }
    }

    switch (view) {
      case 'dashboard':
        return (
          <Appointments
            key={refreshKey}
            user={user}
            onLogout={handleLogout}
            onBookNew={navigateToBooking}
            onReschedule={navigateToReschedule}
          />
        );
      case 'booking':
        return <BookAppointment onBookingSuccess={navigateToDashboard} />;
      case 'rescheduling':
        return (
          <RescheduleAppointment
            appointmentId={rescheduleId}
            onRescheduleSuccess={navigateToDashboard}
          />
        );
      case 'home':
      default:
        return <HomePage onNavigate={navigate} />;
    }
  };

  return (
    <>
      <Header onNavigate={navigate} />
      <div className="container mt-4">{renderView()}</div>
      <Footer />
    </>
  );
};

export default App;