// /public/js/components/LoginRegister.js
import React, { useState } from 'react';
import * as api from '../api.js';

const LoginRegister = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username_email: '',
    name: '',
    password: '',
  });
  const [error, setError] = useState('');

  const { username_email, name, password } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isLogin) {
        await api.login(username_email, password);
        window.location.href = '/dashboard.html'; // Redirect on success
      } else {
        await api.register(username_email, name, password);
        setIsLogin(true); // Switch to login form after registration
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: '450px', margin: '3rem auto' }}>
        <h1>{isLogin ? 'Login' : 'Register'}</h1>
        <form onSubmit={onSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                className="form-control"
                value={name}
                onChange={onChange}
                required
              />
            </div>
          )}
          <div className="form-group">
            <label htmlFor="username_email">Email</label>
            <input
              type="email"
              id="username_email"
              name="username_email"
              className="form-control"
              value={username_email}
              onChange={onChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              className="form-control"
              value={password}
              onChange={onChange}
              minLength="6"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
            {isLogin ? 'Login' : 'Create Account'}
          </button>
        </form>
        {error && <p className="error-message">{error}</p>}
        <p style={{ marginTop: '1rem', textAlign: 'center' }}>
          {isLogin ? "Don't have an account?" : 'Already have an account?'}
          <a href="#" onClick={() => setIsLogin(!isLogin)} style={{ marginLeft: '5px' }}>
            {isLogin ? 'Register' : 'Login'}
          </a>
        </p>
      </div>
    </div>
  );
};

export default LoginRegister;