import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Appointments from './components/Appointments';
import BookAppointment from './components/BookAppointment';
import RescheduleAppointment from './components/RescheduleAppointment';
import api from './utils/api';

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  // State to manage which "page" is visible
  const [view, setView] = useState('dashboard'); // 'dashboard', 'booking', 'rescheduling'
  const [rescheduleId, setRescheduleId] = useState(null);
  // Add a key that we can change to force a refresh
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
  };

  // When returning to the dashboard, increment the key to trigger a refresh
  const navigateToDashboard = () => {
    setRefreshKey(prevKey => prevKey + 1);
    setView('dashboard');
  };

  // Functions to navigate between views
  const navigateToBooking = () => setView('booking');
  const navigateToReschedule = (id) => {
    setRescheduleId(id);
    setView('rescheduling');
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  // If not logged in, always show the Login component
  if (!user) {
    return (
      <div className="container">
        <Login onLogin={handleLogin} />
      </div>
    );
  }

  // If logged in, render the correct view
  return (
    <div className="container mt-4">
      {view === 'dashboard' && (
        <Appointments
          key={refreshKey} // Add the key here
          user={user}
          onLogout={handleLogout}
          onBookNew={navigateToBooking}
          onReschedule={navigateToReschedule}
        />
      )}
      {view === 'booking' && (
        <BookAppointment onBookingSuccess={navigateToDashboard} />
      )}
      {view === 'rescheduling' && (
        <RescheduleAppointment
          appointmentId={rescheduleId}
          onRescheduleSuccess={navigateToDashboard}
        />
      )}
    </div>
  );
};

export default App;