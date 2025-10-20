import React, { useState } from 'react';
import DOMPurify from 'dompurify';

const Login = ({ onLogin }) => {
  const [usernameEmail, setUsernameEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const sanitizedUsernameEmail = DOMPurify.sanitize(usernameEmail);
    const sanitizedPassword = DOMPurify.sanitize(password);
    onLogin(sanitizedUsernameEmail, sanitizedPassword);
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Username/Email:
        <input
          type="text"
          value={usernameEmail}
          onChange={(e) => setUsernameEmail(e.target.value)}
          required
        />
      </label>
      <label>
        Password:
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </label>
      <button type="submit">Login</button>
    </form>
  );
};

export default Login;