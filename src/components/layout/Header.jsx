import React from 'react';

// Now accepts a `user` object and a `onLogout` function
const Header = ({ user, onNavigate, onLogout }) => {
  return (
    <header className="site-header">
      <div className="container">
        <div className="header-inner">
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('home'); }}>
            <img src="/images/logo.jpg" alt="The Modern Shear Logo" className="logo" />
          </a>
          <nav className="site-nav">
            <ul>
              {/* --- Always show public links --- */}
              <li><a href="#" onClick={(e) => { e.preventDefault(); onNavigate('home'); }} className="nav-button">Home</a></li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); onNavigate('services'); }} className="nav-button">Services</a></li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); onNavigate('about'); }} className="nav-button">About</a></li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); onNavigate('contact'); }} className="nav-button">Contact</a></li>

              {/* --- Conditional links based on user login status --- */}
              {user ? (
                <>
                  {user.role === 'admin' ? (
                    <li><a href="#" onClick={(e) => { e.preventDefault(); onNavigate('admin-dashboard'); }} className="nav-button">Admin Dashboard</a></li>
                  ) : (
                    <li><a href="#" onClick={(e) => { e.preventDefault(); onNavigate('dashboard'); }} className="nav-button">Dashboard</a></li>
                  )}
                  <li><button onClick={onLogout} className="btn btn-secondary">Logout</button></li>
                </>
              ) : (
                <li>
                  <button onClick={() => onNavigate('login')} className="btn btn-primary">
                    Login / Register
                  </button>
                </li>
              )}
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;