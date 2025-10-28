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
import AdminDashboard from './components/admin/AdminDashboard';
import AdminBookAppointment from './components/admin/AdminBookAppointment';

const App = () => {
  const [view, setView] = useState('home');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rescheduleId, setRescheduleId] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const checkLoggedIn = () => {
    api
      .checkUserSession()
      .then(data => {
        if (data.user) {
          setUser(data.user);
          setIsLoggedIn(true);
        } else {
          setUser(null);
          setIsLoggedIn(false);
        }
      })
      .catch(() => {
        setUser(null);
        setIsLoggedIn(false);
      });
  };

  // Check for logged-in user on initial load
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        // This endpoint should return the user data if a session is active
        const response = await api.checkAuthStatus();
        if (response.data && response.data.user) {
          setUser(response.data.user);
          // We no longer automatically navigate to the dashboard here.
          // The user is logged in, but the page remains 'home'.
        }
      } catch (error) {
        // No active session, which is fine.
        console.log('No active session found.');
      } finally {
        setLoading(false); // Corrected from setIsLoading to setLoading
      }
    };

    checkLoginStatus();
  }, []); // The empty dependency array ensures this runs only once on mount

  const navigate = targetView => setView(targetView);

  const handleLogin = loggedInUser => {
    setUser(loggedInUser);
    // Role-based redirection
    if (loggedInUser.role === 'admin') {
      setView('admin-dashboard');
    } else {
      setView('dashboard');
    }
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

  const handleReschedule = id => {
    setRescheduleId(id);
    setView('rescheduling');
  };

  const renderView = () => {
    if (loading)
      return (
        <div className="container">
          <p>Loading...</p>
        </div>
      );

    // Prioritize rendering public pages first
    switch (view) {
      case 'home':
        return <HomePage onNavigate={navigate} />;
      case 'services':
        return <ServicesPage onNavigate={navigate} />;
      case 'about':
        return <AboutPage onNavigate={navigate} />;
      case 'contact':
        return <ContactPage onNavigate={navigate} />;
      case 'login':
        // If user is already logged in, redirect them from login page to dashboard
        if (user) {
          return (
            <Dashboard
              key={refreshKey}
              user={user}
              onBookNew={() => navigate('booking')}
              onReschedule={handleReschedule}
            />
          );
        }
        return <AuthPage onLogin={handleLogin} onNavigate={navigate} />;
    }

    // If the view is not a public one, then check for user-specific views
    if (user) {
      switch (view) {
        case 'dashboard':
          return (
            <Dashboard
              key={refreshKey}
              user={user}
              onBookNew={() => navigate('booking')}
              onReschedule={handleReschedule}
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
        case 'admin-dashboard':
          if (user.role === 'admin') {
            return (
              <AdminDashboard
                key={refreshKey}
                user={user}
                onBookNew={() => navigate('admin-booking')}
              />
            );
          }
          // If non-admin tries to access admin dashboard, redirect to user dashboard
          return (
            <Dashboard
              key={refreshKey}
              user={user}
              onBookNew={() => navigate('booking')}
              onReschedule={handleReschedule}
            />
          );
        case 'admin-booking':
          if (user.role === 'admin') {
            return (
              <AdminBookAppointment
                onBookingSuccess={() => {
                  setRefreshKey(prevKey => prevKey + 1);
                  navigate('admin-dashboard');
                }}
              />
            );
          }
          // If non-admin tries to access admin booking, redirect to user booking
          return <BookAppointment onBookingSuccess={navigateToDashboard} />;
      }
    }

    // Fallback to home page if no other view matches
    return <HomePage onNavigate={navigate} />;
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
