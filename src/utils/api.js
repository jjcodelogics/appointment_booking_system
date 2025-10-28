import axios from 'axios';

// Create an Axios instance with default settings
const api = axios.create({
  baseURL: '/api', // Use a relative URL; Vite's proxy will handle it
  withCredentials: true, // This is crucial! It tells Axios to send cookies with requests
});

// Axios will now automatically handle the CSRF token for you.
// It reads the 'XSRF-TOKEN' cookie and sets the 'X-XSRF-TOKEN' header.

export default {
  // --- User Authentication ---
  login: (username_email, password) => api.post('/auth/login', { username_email, password }),

  register: (username_email, name, password) =>
    api.post('/auth/register', { username_email, name, password }),

  logout: () => api.post('/auth/logout'),

  checkAuthStatus: () => api.get('/auth/user'),

  // --- Appointments ---
  getSlotsForDate: date => api.get(`/appointments/slots?date=${date}`),

  getAllAppointments: () => api.get('/appointments/my-appointments'),

  bookAppointment: appointmentData => api.post('/appointments/book', appointmentData),

  rescheduleAppointment: (id, newDateISO) =>
    api.put(`/appointments/reschedule/${id}`, { appointment_date: newDateISO }),

  cancelAppointment: id => api.delete(`/appointments/cancel/${id}`),

  // --- Admin Appointments ---
  getAdminAppointments: (queryString = '') =>
    api.get(`/admin/appointments${queryString ? `?${queryString}` : ''}`),

  adminBookAppointment: appointmentData => api.post('/admin/appointments', appointmentData),

  updateAdminAppointment: (id, updates) => api.put(`/admin/appointments/${id}`, updates),

  bulkOperations: data => api.post('/admin/appointments/bulk', data),

  exportAppointments: (queryString = '') =>
    api.get(`/admin/appointments/export${queryString ? `?${queryString}` : ''}`, {
      responseType: 'blob',
    }),
};
