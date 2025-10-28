import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import '../../css/book-appointment.css';

// Receives the appointment ID and a function to call on success
const RescheduleAppointment = ({ appointmentId, onRescheduleSuccess }) => {
  const [datetime, setDatetime] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Slot-picker state (borrowed from BookAppointment)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTime, setSelectedTime] = useState('');
  const [unavailableSlots, setUnavailableSlots] = useState([]);
  const [currentAppointmentTime, setCurrentAppointmentTime] = useState(null);

  // Opening hours mapping (same as BookAppointment)
  const openingHours = {
    Tuesday: ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30'],
    Wednesday: ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30'],
    Thursday: ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30'],
    Friday: ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30'],
    Saturday: ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'],
    Sunday: [],
    Monday: []
  };

  useEffect(() => {
    // Fetch the user's appointments and find this appointment to prefill date/time
    const fetchCurrentAppointment = async () => {
      try {
        const resp = await api.getAllAppointments();
        const data = resp.data;
        const appointments = Array.isArray(data) ? data : (data.appointments || []);
        const appointment = appointments.find(a => String(a.appointment_id) === String(appointmentId));
        if (appointment && appointment.appointment_date) {
          const dt = new Date(appointment.appointment_date);
          const isoDate = dt.toISOString();
          const datePart = isoDate.split('T')[0];
          const timePart = `${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}`;
          setSelectedDate(datePart);
          setSelectedTime(timePart);
          setCurrentAppointmentTime(timePart);
          // set datetime as ISO for submission
          setDatetime(new Date(`${datePart}T${timePart}:00`).toISOString());
        }
      } catch (err) {
        // ignore; user may have no appointments or API error
        console.error('Could not fetch current appointment for reschedule:', err);
      }
    };

    fetchCurrentAppointment();
  }, [appointmentId]);

  // Fetch unavailable slots for selected date
  useEffect(() => {
    const fetchBookedSlots = async () => {
      if (!selectedDate) return;
      try {
        const response = await api.getSlotsForDate(selectedDate);
        // API returns array of 'HH:MM' strings
        const slots = response.data || [];
        // Exclude this appointment's own time so the user can re-select it
        const filtered = slots.filter(s => s !== currentAppointmentTime);
        setUnavailableSlots(filtered);
      } catch (err) {
        console.error('Failed to fetch booked slots:', err);
        setError('Failed to load availability. Please try again.');
      }
    };

    fetchBookedSlots();
  }, [selectedDate, currentAppointmentTime]);

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
    setSelectedTime('');
    setDatetime('');
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
    const fullDateTime = `${selectedDate}T${time}:00`;
    setDatetime(new Date(fullDateTime).toISOString());
  };

  const getDayOfWeek = (dateString) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const date = new Date(dateString);
    return days[date.getDay()];
  };

  const availableSlots = openingHours[getDayOfWeek(selectedDate)] || [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTime) {
      setError('Please select a time slot.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      await api.rescheduleAppointment(appointmentId, datetime);
      onRescheduleSuccess(); // Go back to the dashboard
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to reschedule. The time slot may no longer be available.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="booking-page-container">
      <form onSubmit={handleSubmit} className="booking-card" style={{ maxWidth: 680 }}>
        <h1 className="booking-title">Reschedule Appointment</h1>
        <p>Rescheduling appointment ID: {appointmentId}</p>
        {error && <div className="alert alert-danger">{error}</div>}

        <div className="form-section">
          <label className="section-label">1. Select Date</label>
          <input
            id="appointment_date"
            type="date"
            value={selectedDate}
            onChange={handleDateChange}
            min={new Date().toISOString().split('T')[0]}
            required
            className="date-input"
          />
        </div>

        <div className="form-section">
          <label className="section-label">2. Choose Time</label>
          <div className="slot-grid">
            {availableSlots.length > 0 ? (
              availableSlots.map((time) => {
                const isUnavailable = unavailableSlots.includes(time);
                const isSelected = selectedTime === time;
                return (
                  <div
                    key={time}
                    className={`slot ${isUnavailable ? 'unavailable' : ''} ${isSelected ? 'selected' : ''}`}
                    onClick={() => !isUnavailable && handleTimeSelect(time)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') !isUnavailable && handleTimeSelect(time); }}
                  >
                    {time}
                  </div>
                );
              })
            ) : (
              <div className="no-slots">No available slots</div>
            )}
          </div>

          <div className="slot-legend">
            <span className="legend-item"><span className="legend-swatch available" /> Available</span>
            <span className="legend-item"><span className="legend-swatch unavailable" /> Booked</span>
            <span className="legend-item"><span className="legend-swatch selected" /> Selected</span>
          </div>
        </div>

        <div className="booking-actions" style={{ marginTop: 24 }}>
          <button type="submit" className="btn-submit" disabled={loading || !selectedTime}>
            {loading ? 'Saving...' : 'Reschedule'}
          </button>
        </div>
      </form>
    </main>
  );
};

export default RescheduleAppointment;