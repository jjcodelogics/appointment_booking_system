const API_BASE_URL = 'http://localhost:3000';

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  options.credentials = 'include';
  options.headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Timeout logic for debugging
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  options.signal = controller.signal;

  try {
    const response = await fetch(url, options);
    clearTimeout(timeout);
    const text = await response.text();
    try {
      const data = JSON.parse(text);
      if (!response.ok) throw new Error(data.msg || 'An error occurred');
      return data;
    } catch (e) {
      throw new Error('Invalid JSON response: ' + text);
    }
  } catch (error) {
    throw error;
  }
}

// Get current user info
async function getCurrentUser() {
  return request('/me', { method: 'GET' });
}

// Get all booked appointment slots (no personal details)
async function getAllBookedSlots() {
  return request('/appointments/slots', { method: 'GET' });
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
  getMyAppointments: () => request('/myappointments'),
  bookAppointment: (appointmentData) =>
    request('/myappointments/book', {
      method: 'POST',
      body: JSON.stringify(appointmentData),
    }),
  cancelAppointment: (id) =>
    request(`/myappointments/cancel/${id}`, { method: 'DELETE' }),
  getAllAppointments: () => request('/appointments'),
  deleteAppointmentAsAdmin: (id) =>
    request(`/appointments/${id}`, { method: 'DELETE' }),
  getCurrentUser: getCurrentUser,
  getAllBookedSlots: getAllBookedSlots,
};