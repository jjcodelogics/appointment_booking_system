import React, { useState } from 'react';
import api from '../../utils/api';

// onBookingSuccess is a function passed from the parent to tell it to go back to the dashboard
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
      onBookingSuccess(); // Tell the parent component the booking was successful
    } catch (err) {
      setError(err.message || 'Failed to book appointment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Book Appointment</h1>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit} className="card p-3" style={{ maxWidth: '450px', margin: '2rem auto' }}>
        <div className="mb-3">
          <label htmlFor="appointment_date" className="form-label">Date & Time</label>
          <input
            id="appointment_date"
            type="datetime-local"
            name="appointment_date"
            value={form.appointment_date}
            onChange={handleChange}
            required
            className="form-control"
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Gender</label>
          <div>
            <div className="form-check form-check-inline">
              <input className="form-check-input" type="radio" name="gender" id="male" value="male" checked={form.gender === 'male'} onChange={handleChange} />
              <label className="form-check-label" htmlFor="male">Male</label>
            </div>
            <div className="form-check form-check-inline">
              <input className="form-check-input" type="radio" name="gender" id="female" value="female" checked={form.gender === 'female'} onChange={handleChange} />
              <label className="form-check-label" htmlFor="female">Female</label>
            </div>
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label">Services</label>
          <div className="form-check">
            <input className="form-check-input" type="checkbox" name="washing" id="washing" checked={form.washing} onChange={handleChange} />
            <label className="form-check-label" htmlFor="washing">Washing</label>
          </div>
          <div className="form-check">
            <input className="form-check-input" type="checkbox" name="coloring" id="coloring" checked={form.coloring} onChange={handleChange} />
            <label className="form-check-label" htmlFor="coloring">Coloring</label>
          </div>
          <div className="form-check">
            <input className="form-check-input" type="checkbox" name="cut" id="cut" checked={form.cut} onChange={handleChange} />
            <label className="form-check-label" htmlFor="cut">Cut</label>
          </div>
        </div>

        <div className="mb-3">
          <label htmlFor="notes" className="form-label">Notes</label>
          <textarea
            id="notes"
            name="notes"
            value={form.notes}
            onChange={handleChange}
            className="form-control"
            rows="3"
          ></textarea>
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Booking...' : 'Book Appointment'}
        </button>
      </form>
    </div>
  );
};

export default BookAppointment;