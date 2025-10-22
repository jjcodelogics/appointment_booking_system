const API_BASE_URL = 'http://localhost:3000';

async function request(endpoint, options = {}) {
  const url = API_BASE_URL + endpoint;
  const opts = {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...options,
  };
  if (opts.body && typeof opts.body !== 'string') {
    opts.body = JSON.stringify(opts.body);
  }
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
  return request('/myappointments/me', { method: 'GET' });
}

// Get all booked appointment slots (no personal details)
async function getAllBookedSlots() {
  return request('/myappointments/slots', { method: 'GET' });
}

async function getMyAppointments() {
  return request('/myappointments', { method: 'GET' });
}

window.api = {
  login: (username_email, password) =>
    request('/auth/login', {
      method: 'POST',
      // The request function handles stringifying the body
      body: { username_email, password },
    }),
  register: (username_email, name, password) =>
    request('/auth/register', {
      method: 'POST',
      // The request function handles stringifying the body
      body: { username_email, name, password },
    }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  checkAuthStatus: () => request('/auth/user'),
  getMyAppointments: getMyAppointments,
  bookAppointment: (appointmentData) =>
    request('/myappointments/book', {
      method: 'POST',
      body: appointmentData,
    }),
  cancelAppointment: (id) =>
    request(`/myappointments/cancel/${id}`, { method: 'DELETE' }),
  getCurrentUser: getCurrentUser,
  getAllBookedSlots: getAllBookedSlots,
};

window.api.rescheduleAppointment = async function (id, newDateISO) {
  return request(`/myappointments/reschedule/${encodeURIComponent(id)}`, {
    method: 'PUT',
    // The request function handles stringifying the body
    body: { appointment_date: newDateISO }
  });
};
