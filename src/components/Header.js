import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header = ({ hideNav }) => {
  const location = useLocation();

  return (
    <header className="header">
      <div className="header-brand">
        <img
          src="/logos/logo.jpg"
          alt="Martinez & Walker Logo"
          className="logo"
          onError={(e) => { e.target.style.display = 'none'; }}
        />
        <div className="company-info">
          <h1 className="company-name">Martinez &amp; Walker</h1>
          <p className="company-tagline">Professional Tax Services</p>
        </div>
      </div>
      {!hideNav && (
        <nav className="header-nav">
          <Link to="/" className={`nav-link${location.pathname === '/' ? ' nav-link-active' : ''}`}>
            Check In
          </Link>
          <Link to="/waiting" className={`nav-link${location.pathname === '/waiting' ? ' nav-link-active' : ''}`}>
            Waiting Room
          </Link>
          <Link to="/staff" className={`nav-link${location.pathname === '/staff' ? ' nav-link-active' : ''}`}>
            Staff
          </Link>
        </nav>
      )}
    </header>
  );
};

export default Header;
