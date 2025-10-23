import React from 'react';

// `onNavigate` is a function from App.jsx to change pages
const Header = ({ onNavigate }) => {
  return (
    <header className="site-header">
      <div className="container">
        <a href="#" onClick={() => onNavigate('home')} className="brand">
          {/* Vite correctly serves images from the public folder */}
          <img src="/images/logo.jpg" alt="The Modern Shear" className="logo" />
        </a>
        <nav className="site-nav">
          <ul>
            {/* Use onClick to navigate instead of href */}
            <li><button onClick={() => onNavigate('services')} className="nav-button">Services</button></li>
            <li><button onClick={() => onNavigate('about')} className="nav-button">About</button></li>
            <li><button onClick={() => onNavigate('contact')} className="nav-button">Contact</button></li>
            <li><button onClick={() => onNavigate('login')} className="btn btn-header">Login &amp; Register</button></li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;