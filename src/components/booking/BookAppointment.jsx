import React, { useState } from 'react';
import api from '../../utils/api';
import '../../css/book-appointment.css';

// Mock data for available time slots
const availableSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00',
];
const unavailableSlots = ['11:00', '14:30']; // Example of already booked slots

const BookAppointment = ({ onBookingSuccess }) => {
  const [form, setForm] = useState({
    appointment_date: '',
    gender: 'male',
    washing: true,
    coloring: false,
    cut: true,
    notes: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTime, setSelectedTime] = useState('');

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
    setSelectedTime(''); // Reset time when date changes
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
    setForm(prev => ({ ...prev, appointment_date: `${selectedDate}T${time}` }));
  };

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    setForm((prevForm) => ({ ...prevForm, [name]: newValue }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTime) {
      setError('Please select a time slot.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await api.bookAppointment(form);
      onBookingSuccess();
    } catch (err) {
      setError(err.message || 'Failed to book appointment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="booking-page-container">
      <form onSubmit={handleSubmit} className="booking-card">
        <h1 className="booking-title">Book Your Appointment</h1>
        {error && <div className="error-message">{error}</div>}

        <div className="form-section">
          <label htmlFor="appointment_date" className="section-label">1. Select Date & Time</label>
          <input
            id="appointment_date"
            type="date"
            value={selectedDate}
            onChange={handleDateChange}
            required
            className="date-input"
          />
          <div className="slot-grid">
            {availableSlots.map(time => {
              const isUnavailable = unavailableSlots.includes(time);
              const isSelected = selectedTime === time;
              return (
                <div
                  key={time}
                  className={`slot ${isUnavailable ? 'unavailable' : ''} ${isSelected ? 'selected' : ''}`}
                  onClick={() => !isUnavailable && handleTimeSelect(time)}
                >
                  {time}
                </div>
              );
            })}
          </div>
        </div>

        <div className="form-section">
          <label className="section-label">2. Choose Services</label>
          <div className="choice-group">
            <label className="choice-pill">
              <input type="checkbox" name="washing" checked={form.washing} onChange={handleChange} />
              <span>Washing</span>
            </label>
            <label className="choice-pill">
              <input type="checkbox" name="coloring" checked={form.coloring} onChange={handleChange} />
              <span>Coloring</span>
            </label>
            <label className="choice-pill">
              <input type="checkbox" name="cut" checked={form.cut} onChange={handleChange} />
              <span>Cut</span>
            </label>
          </div>
        </div>

        <div className="form-section">
          <label className="section-label">3. Client Type</label>
          <div className="choice-group">
            <label className="choice-pill">
              <input type="radio" name="gender" value="male" checked={form.gender === 'male'} onChange={handleChange} />
              <span>Men's Cut</span>
            </label>
            <label className="choice-pill">
              <input type="radio" name="gender" value="female" checked={form.gender === 'female'} onChange={handleChange} />
              <span>Women's Cut</span>
            </label>
          </div>
        </div>

        <div className="form-section">
          <label htmlFor="notes" className="section-label">4. Add Notes (Optional)</label>
          <textarea
            id="notes"
            name="notes"
            value={form.notes}
            onChange={handleChange}
            className="notes-textarea"
            placeholder="e.g., specific style requests, allergies..."
          ></textarea>
        </div>

        <div className="booking-actions">
          <button type="submit" className="btn-submit" disabled={loading || !selectedTime}>
            {loading ? 'Booking...' : 'Confirm Appointment'}
          </button>
        </div>
      </form>
    </main>
  );
};

export default BookAppointment;