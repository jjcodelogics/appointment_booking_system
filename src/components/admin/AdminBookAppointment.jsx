import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

const AdminBookAppointment = ({ onBookingSuccess }) => {
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    gender: 'male',
    cut: false,
    washing: false,
    coloring: false,
    notes: '',
    customer_name: '',
    customer_phone: '',
    staff_assigned: '',
    status: 'confirmed',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [bookedSlots, setBookedSlots] = useState([]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleDateChange = async (e) => {
    const newDate = e.target.value;
    setFormData((prev) => ({ ...prev, date: newDate }));
    
    if (newDate) {
      try {
        const response = await api.getSlotsForDate(newDate);
        setBookedSlots(response.data || []);
      } catch (err) {
        console.error('Error fetching slots:', err);
      }
    }
  };

  const isSlotBooked = (time) => {
    if (!formData.date || !time) return false;
    const selectedDateTime = new Date(`${formData.date}T${time}`);
    return bookedSlots.some((slot) => {
      const bookedDateTime = new Date(slot);
      return bookedDateTime.getTime() === selectedDateTime.getTime();
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    const { date, time, gender, cut, washing, coloring, notes, customer_name, customer_phone, staff_assigned, status } = formData;

    // Validate required fields
    if (!customer_name.trim()) {
      setError('Customer name is required for admin bookings.');
      return;
    }

    if (!date || !time) {
      setError('Please select both a date and time.');
      return;
    }

    if (!cut && !washing && !coloring) {
      setError('Please select at least one service.');
      return;
    }

    const appointmentDateTime = new Date(`${date}T${time}`);
    const appointmentISO = appointmentDateTime.toISOString();

    try {
      await api.adminBookAppointment({
        appointment_date: appointmentISO,
        gender,
        cut,
        washing,
        coloring,
        notes,
        customer_name,
        customer_phone,
        staff_assigned,
        status,
      });
      setMessage('Appointment booked successfully!');
      setTimeout(() => {
        onBookingSuccess();
      }, 1500);
    } catch (err) {
      console.error('Booking error:', err);
      setError(err.response?.data?.msg || 'Failed to book appointment. Please try again.');
    }
  };

  return (
    <main className="container book-appointment-page">
      <h1>Book New Appointment (Admin)</h1>
      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="booking-form">
        {/* Customer Information */}
        <fieldset>
          <legend>Customer Information</legend>
          <div className="form-group">
            <label htmlFor="customer_name">Customer Name: *</label>
            <input
              type="text"
              id="customer_name"
              name="customer_name"
              value={formData.customer_name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="customer_phone">Phone Number:</label>
            <input
              type="tel"
              id="customer_phone"
              name="customer_phone"
              value={formData.customer_phone}
              onChange={handleChange}
              placeholder="Optional"
            />
          </div>
        </fieldset>

        {/* Appointment Details */}
        <fieldset>
          <legend>Select Date and Time</legend>
          <div className="form-group">
            <label htmlFor="date">Date:</label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleDateChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="time">Time:</label>
            <input
              type="time"
              id="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              required
            />
            {isSlotBooked(formData.time) && (
              <p className="warning-text">⚠️ This slot is already booked!</p>
            )}
          </div>
        </fieldset>

        {/* Services */}
        <fieldset>
          <legend>Select Services</legend>
          <div className="form-group">
            <label htmlFor="gender">Gender:</label>
            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              required
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="unisex">Unisex</option>
            </select>
          </div>
          <div className="checkbox-group">
            <label>
              <input
                type="checkbox"
                name="cut"
                checked={formData.cut}
                onChange={handleChange}
              />
              Haircut
            </label>
            <label>
              <input
                type="checkbox"
                name="washing"
                checked={formData.washing}
                onChange={handleChange}
              />
              Washing
            </label>
            <label>
              <input
                type="checkbox"
                name="coloring"
                checked={formData.coloring}
                onChange={handleChange}
              />
              Coloring
            </label>
          </div>
        </fieldset>

        {/* Admin Fields */}
        <fieldset>
          <legend>Admin Options</legend>
          <div className="form-group">
            <label htmlFor="staff_assigned">Staff Assigned:</label>
            <input
              type="text"
              id="staff_assigned"
              name="staff_assigned"
              value={formData.staff_assigned}
              onChange={handleChange}
              placeholder="Optional"
            />
          </div>
          <div className="form-group">
            <label htmlFor="status">Status:</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="notes">Notes:</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="4"
              placeholder="Optional notes"
            />
          </div>
        </fieldset>

        <button type="submit" className="btn btn-primary">Book Appointment</button>
      </form>
    </main>
  );
};

export default AdminBookAppointment;
