import React, { useState } from 'react';
import api from '../utils/api';

// Receives the appointment ID and a function to call on success
const RescheduleAppointment = ({ appointmentId, onRescheduleSuccess }) => {
  const [datetime, setDatetime] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.rescheduleAppointment(appointmentId, datetime);
      onRescheduleSuccess(); // Go back to the dashboard
    } catch (err) {
      setError(err.message || 'Failed to reschedule.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Reschedule Appointment</h1>
      <p>Rescheduling appointment ID: {appointmentId}</p>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit} className="card p-3" style={{ maxWidth: '450px', margin: '2rem auto' }}>
        <div className="mb-3">
          <label htmlFor="appointment_date" className="form-label">New Date & Time</label>
          <input
            id="appointment_date"
            type="datetime-local"
            name="appointment_date"
            value={datetime}
            onChange={(e) => setDatetime(e.target.value)}
            required
            className="form-control"
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Saving...' : 'Reschedule'}
        </button>
      </form>
    </div>
  );
};

export default RescheduleAppointment;