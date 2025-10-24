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
  login: (username_email, password) =>
    api.post('/auth/login', { username_email, password }),
  
  register: (username_email, name, password) =>
    api.post('/auth/register', { username_email, name, password }),
  
  logout: () => api.post('/auth/logout'),
  
  checkAuthStatus: () => api.get('/auth/user'),

  // --- Appointments ---
  getAllAppointments: () => api.get('/myappointments'),

  bookAppointment: (appointmentData) =>
    api.post('/myappointments/book', appointmentData),

  rescheduleAppointment: (id, newDateISO) =>
    api.put(`/myappointments/reschedule/${id}`, { appointment_date: newDateISO }),
  
  cancelAppointment: (id) =>
    api.delete(`/myappointments/cancel/${id}`),
};