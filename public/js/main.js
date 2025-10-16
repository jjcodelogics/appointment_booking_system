// /public/js/main.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import LoginRegister from './components/LoginRegister.js';
import UserDashboard from './components/UserDashboard.js';
import AdminDashboard from './components/AdminDashboard.js';

// This is a simple way to handle a "multi-page app" with React.
// We check which root element exists and render the corresponding component.

const loginRootEl = document.getElementById('login-register-root');
if (loginRootEl) {
  const root = ReactDOM.createRoot(loginRootEl);
  root.render(<React.StrictMode><LoginRegister /></React.StrictMode>);
}

const userDashboardRootEl = document.getElementById('user-dashboard-root');
if (userDashboardRootEl) {
  const root = ReactDOM.createRoot(userDashboardRootEl);
  root.render(<React.StrictMode><UserDashboard /></React.StrictMode>);
}

const adminDashboardRootEl = document.getElementById('admin-dashboard-root');
if (adminDashboardRootEl) {
  const root = ReactDOM.createRoot(adminDashboardRootEl);
  root.render(<React.StrictMode><AdminDashboard /></React.StrictMode>);
}