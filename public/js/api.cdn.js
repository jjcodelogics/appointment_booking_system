const API_BASE_URL = 'http://localhost:3000';

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  options.credentials = 'include';
  options.headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  try {
    const response = await fetch(url, options);
    const data = await response.json();
    if (!response.ok) throw new Error(data.msg || 'An error occurred');
    return data;
  } catch (error) {
    throw error;
  }
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
};