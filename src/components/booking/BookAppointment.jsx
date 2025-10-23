import React, { useState } from 'react';
import api from '../../utils/api';
import '../../css/book-appointment.css'; // CSS is already imported, which is great.

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

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    setForm((prevForm) => ({ ...prevForm, [name]: newValue }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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

  // The new, cleaner JSX structure
  return (
    <main className="booking-page-container">
      <form onSubmit={handleSubmit} className="booking-card">
        <h1 className="booking-title">Book Your Appointment</h1>
        {error && <div className="error-message">{error}</div>}

        <div className="form-section">
          <label htmlFor="appointment_date" className="section-label">1. Select Date & Time</label>
          <input
            id="appointment_date"
            type="datetime-local"
            name="appointment_date"
            value={form.appointment_date}
            onChange={handleChange}
            required
            className="date-input"
          />
        </div>

        <div className="form-section">
          <label className="section-label">2. Choose Services</label>
          <div className="choice-group">
            {/* We wrap inputs in labels to make the whole area clickable */}
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
          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? 'Booking...' : 'Confirm Appointment'}
          </button>
        </div>
      </form>
    </main>
  );
};

export default BookAppointment;