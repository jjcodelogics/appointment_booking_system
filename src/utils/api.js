// This replaces the need for public/js/api.cdn.js

async function request(endpoint, options = {}) {
  // The base URL is handled by Vite's proxy in development
  const url = endpoint;
  const opts = {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  };
  if (opts.body && typeof opts.body !== 'string') {
    opts.body = JSON.stringify(opts.body);
  }

  const res = await fetch(url, opts);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ msg: res.statusText }));
    throw new Error(errorData.msg || 'An error occurred');
  }
  // Handle empty responses for actions like logout
  if (res.status === 204 || res.headers.get('content-length') === '0') {
    return null;
  }
  return res.json();
}

const api = {
  login: (username_email, password) =>
    request('/auth/login', {
      method: 'POST',
      body: { username_email, password },
    }),
  register: (username_email, name, password) =>
    request('/auth/register', {
      method: 'POST',
      body: { username_email, name, password },
    }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  checkAuthStatus: () => request('/auth/user'),
  getAllAppointments: () => request('/myappointments'), // Assuming this endpoint exists

  bookAppointment: (appointmentData) =>
    request('/myappointments/book', {
      method: 'POST',
      body: appointmentData,
    }),

  rescheduleAppointment: (id, newDateISO) =>
    request(`/myappointments/reschedule/${id}`, {
      method: 'PUT',
      body: { appointment_date: newDateISO },
    }),
};

export default api;