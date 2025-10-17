// main.cdn.js - The Application Bootstrap

// 1. IMPORT all separated components
import LoginRegister from './components/LoginRegister.js';
import UserDashboardComponent from './components/UserDashboard.js'; 
import AdminDashboard from './components/AdminDashboard.js'; 
import BookAppointment from './components/BookAppointment.js'; 

// 2. Render logic for Login/Register
const loginRootEl = document.getElementById('login-register-root');
if (loginRootEl) {
  ReactDOM.createRoot(loginRootEl).render(
    React.createElement(LoginRegister)
  );
}

// 3. Render logic for User Dashboard
const dashboardRootEl = document.getElementById('user-dashboard-root');
if (dashboardRootEl) {
  ReactDOM.createRoot(dashboardRootEl).render(
    React.createElement(UserDashboardComponent) // Note the updated component name
  );
}

// 4. Render logic for Admin Dashboard
const adminDashboardRootEl = document.getElementById('admin-dashboard-root');
if (adminDashboardRootEl) {
  ReactDOM.createRoot(adminDashboardRootEl).render(
    React.createElement(AdminDashboard)
  );
}

// 5. Render logic for booking page
const bookRootEl = document.getElementById('book-appointment-root');
if (bookRootEl) {
  ReactDOM.createRoot(bookRootEl).render(
    React.createElement(BookAppointment)
  );
}

// 6. Logout button logic 
const logoutBtn = document.getElementById('logout-button');
if (logoutBtn) {
  logoutBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    try {
      await window.api.logout();
      window.location.href = '/index.html'; // Redirect to home
    } catch (err) {
      console.error('Logout failed', err);
    }
  });
}