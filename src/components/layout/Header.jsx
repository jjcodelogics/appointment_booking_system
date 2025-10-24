import React from 'react';

// Now accepts a `user` object and a `onLogout` function
const Header = ({ user, onNavigate, onLogout }) => {
  return (
    <header className="site-header">
      <div className="container">
        <a href="#" onClick={() => onNavigate('home')} className="brand">
          <img src="/images/logo.jpg" alt="The Modern Shear" className="logo" />
        </a>
        <nav className="site-nav">
          <ul>
            {/* Public links - Changed from button to a */}
            <li><a href="#" onClick={(e) => { e.preventDefault(); onNavigate('home'); }} className="nav-button">Home</a></li>
            <li><a href="#" onClick={(e) => { e.preventDefault(); onNavigate('services'); }} className="nav-button">Services</a></li>
            <li><a href="#" onClick={(e) => { e.preventDefault(); onNavigate('about'); }} className="nav-button">About</a></li>
            <li><a href="#" onClick={(e) => { e.preventDefault(); onNavigate('contact'); }} className="nav-button">Contact</a></li>

            {/* Conditional links based on user state */}
            {user ? (
              <>
                <li><a href="#" onClick={(e) => { e.preventDefault(); onNavigate('dashboard'); }} className="nav-button">Dashboard</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); onLogout(); }} className="btn btn-header">Logout</a></li>
              </>
            ) : (
              <li><a href="#" onClick={(e) => { e.preventDefault(); onNavigate('login'); }} className="btn btn-header">Login &amp; Register</a></li>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;