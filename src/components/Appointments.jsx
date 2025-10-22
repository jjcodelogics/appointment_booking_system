import React, { useEffect, useState } from 'react';
import api from '../utils/api';

// Receive the new navigation functions as props
const Appointments = ({ user, onLogout, onBookNew, onReschedule }) => {
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getAllAppointments()
      .then((data) => setAppointments(data))
      .catch((err) => setError(err.message || 'Error fetching appointments.'));
  }, []);

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Welcome, {user.name}!</h2>
        <div>
          <button onClick={onBookNew} className="btn btn-primary me-2">Book New Appointment</button>
          <button onClick={onLogout} className="btn btn-secondary">Logout</button>
        </div>
      </div>
      
      <h3>Your Appointments</h3>
      {error && <div className="alert alert-danger">{error}</div>}
      {appointments.length > 0 ? (
        <ul className="list-group">
          {appointments.map((appointment) => (
            <li key={appointment.appointment_id} className="list-group-item d-flex justify-content-between align-items-center">
              {new Date(appointment.appointment_date).toLocaleString()}
              <button onClick={() => onReschedule(appointment.appointment_id)} className="btn btn-sm btn-outline-secondary">
                Reschedule
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p>You have no appointments.</p>
      )}
    </div>
  );
};

export default Appointments;