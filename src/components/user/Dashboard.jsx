import React, { useEffect, useState } from 'react';
import api from '../../utils/api';

// Helper function to format the date
const formatAppointmentDate = (isoString) => {
  const date = new Date(isoString);
  const day = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(date);
  const dayOfMonth = date.getDate();
  const hour = date.getHours().toString().padStart(2, '0');
  const minute = date.getMinutes().toString().padStart(2, '0');

  // Function to get the ordinal suffix (st, nd, rd, th)
  const getOrdinal = (n) => {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
  };

  return `${day} ${dayOfMonth}${getOrdinal(dayOfMonth)} at ${hour}:${minute}`;
};

// --- Add Price Calculation Logic ---
const calculatePrice = (appointment) => {
  // If the Service data isn't included for some reason, return 0
  if (!appointment.Service) {
    return 0;
  }

  let total = 0;
  const prices = {
    cut_male: 15,
    cut_female: 45,
    washing: 10,
    coloring: 80,
  };

  // Access properties from the nested 'Service' object
  const { cut, gender, washing, coloring } = appointment.Service;

  if (cut) {
    if (gender === 'male') {
      total += prices.cut_male;
    } else {
      total += prices.cut_female;
    }
  }

  if (washing) {
    total += prices.washing;
  }

  if (coloring) {
    total += prices.coloring;
  }

  return total;
};

// This is the main dashboard for a logged-in user
const Dashboard = ({ user, onBookNew, onReschedule }) => {
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState('');

  const fetchAppointments = () => {
    api.getAllAppointments()
      .then((data) => setAppointments(data))
      .catch((err) => setError('Could not load your appointments. Please try refreshing the page.'));
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleCancel = async (id) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        await api.cancelAppointment(id);
        fetchAppointments(); // Re-fetch appointments to update the list
      } catch (err) {
        setError('Failed to cancel the appointment. Please try again later.');
      }
    }
  };

  return (
    <main className="container dashboard-page">
      <div className="dashboard-header">
        <h1>Welcome, {user?.name || 'Guest'}!</h1>
        <button onClick={onBookNew} className="btn btn-primary">Book New Appointment</button>
      </div>

      <section className="appointments-list">
        <h2>Your Upcoming Appointments</h2>
        {error && <div className="error-message">{error}</div>}
        {appointments.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Amount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((app) => (
                <tr key={app.appointment_id}>
                  <td>{formatAppointmentDate(app.appointment_date)}</td>
                  <td>${calculatePrice(app)}</td>
                  <td className="actions-cell">
                    <button onClick={() => onReschedule(app.appointment_id)} className="btn btn-secondary btn-sm">
                      Reschedule
                    </button>
                    <button onClick={() => handleCancel(app.appointment_id)} className="btn btn-danger btn-sm">
                      Cancel
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>You have no upcoming appointments.</p>
        )}
      </section>
    </main>
  );
};

export default Dashboard;