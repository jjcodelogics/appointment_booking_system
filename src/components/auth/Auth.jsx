import React, { useState } from 'react';
import api from '../../utils/api';

// This component handles both Login and Registration
const AuthPage = ({ onLogin, onNavigate }) => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    username_email: '',
    password: '',
    name: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Password strength validation for registration view
    if (!isLoginView) {
      const { password } = formData;
      const errors = [];
      if (password.length < 8) {
        errors.push('be at least 8 characters long');
      }
      if (!/[A-Z]/.test(password)) {
        errors.push('contain an uppercase letter');
      }
      if (!/[a-z]/.test(password)) {
        errors.push('contain a lowercase letter');
      }
      if (!/[0-9]/.test(password)) {
        errors.push('contain a number');
      }
      if (!/[^A-Za-z0-9]/.test(password)) {
        errors.push('contain a special character');
      }

      if (errors.length > 0) {
        setError(`Password must ${errors.join(', ')}.`);
        return; // Stop the form submission
      }
    }

    try {
      let user;
      if (isLoginView) {
        user = await api.login(formData.username_email, formData.password);
      } else {
        user = await api.register(formData.username_email, formData.name, formData.password);
      }
      onLogin(user); // Notify App.jsx that login was successful
    } catch (err) {
      setError('Invalid credentials or server error. Please try again.');
    }
  };

  return (
    <main className="container auth-page">
      <div className="auth-card">
        <h2>{isLoginView ? 'Login' : 'Create Account'}</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          {!isLoginView && (
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required />
            </div>
          )}
          <div className="form-group">
            <label htmlFor="username_email">Email Address</label>
            <input type="email" id="username_email" name="username_email" value={formData.username_email} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} required />
          </div>
          <button type="submit" className="btn btn-primary full-width">
            {isLoginView ? 'Login' : 'Register'}
          </button>
        </form>
        <div className="auth-toggle">
          <button onClick={() => setIsLoginView(!isLoginView)} className="btn-link">
            {isLoginView ? 'Need an account? Register' : 'Already have an account? Login'}
          </button>
        </div>
      </div>
    </main>
  );
};

export default AuthPage;