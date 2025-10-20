const API_BASE_URL = 'http://localhost:3000';

async function request(endpoint, options = {}) {
  const url = API_BASE_URL + endpoint;
  const opts = {
    credentials: 'include', // send session cookie
    headers: { 'Content-Type': 'application/json' },
    ...options,
  };
  if (opts.body && typeof opts.body !== 'string') opts.body = JSON.stringify(opts.body);
  const res = await fetch(url, opts);
  const text = await res.text();
  if (!text) {
    if (res.ok) return null;
    throw new Error('Empty response');
  }
  const data = JSON.parse(text);
  if (!res.ok) throw new Error(data.msg || 'An error occurred');
  return data;
}

// Get current user info
async function getCurrentUser() {
  // backend exposes /myappointments/me (router mounted at /myappointments)
  return request('/myappointments/me', { method: 'GET' });
}

// Get all booked appointment slots (no personal details)
async function getAllBookedSlots() {
  // slots route is defined inside the myappointments router:
  return request('/myappointments/appointments/slots', { method: 'GET' });
}

async function getAllAppointments() {
  return request('/appointments', { method: 'GET' }); // admin endpoint
}

async function getMyAppointments() {
  return request('/myappointments', { method: 'GET' }); // user endpoint
}

window.api = {
  login: (username_email, password) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username_email, password }),
    }),
  register: (username_email, name, password) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username_email, name, password }),
    }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  checkAuthStatus: () => request('/auth/user'),
  getMyAppointments: getMyAppointments,
  bookAppointment: (appointmentData) =>
    request('/myappointments/book', {
      method: 'POST',
      body: JSON.stringify(appointmentData),
    }),
  cancelAppointment: (id) =>
    request(`/myappointments/cancel/${id}`, { method: 'DELETE' }),
  getAllAppointments: getAllAppointments,
  deleteAppointmentAsAdmin: (id) =>
    request(`/appointments/${id}`, { method: 'DELETE' }),
  getCurrentUser: getCurrentUser,
  getAllBookedSlots: getAllBookedSlots,
};

window.api.rescheduleAppointment = async function (id, newDateISO) {
  return request(`/myappointments/reschedule/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify({ appointment_date: newDateISO })
  });
};
