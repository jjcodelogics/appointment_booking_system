import React from 'react';
import ReactDOM from 'react-dom/client';
import Login from './components/Login';

const App = () => {
  const handleLogin = (usernameEmail, password) => {
    window.api.login(usernameEmail, password)
      .then((response) => {
        alert('Login successful!');
      })
      .catch((error) => {
        alert('Login failed: ' + error.message);
      });
  };

  return (
    <div>
      <h1>Welcome to Appointment Booking</h1>
      <Login onLogin={handleLogin} />
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);