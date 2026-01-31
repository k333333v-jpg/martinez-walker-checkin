import React from 'react';

const Header = ({ title }) => {
  return (
    <header className="header">
      <div className="header-content">
        <img 
          src="/logos/logo.jpg" 
          alt="Martinez & Walker Logo" 
          className="logo"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
        <div className="company-info">
          <h1 className="company-name">Martinez & Walker</h1>
          <p className="company-tagline">Professional Tax Services</p>
          {title && <h2 className="page-title">{title}</h2>}
        </div>
      </div>
    </header>
  );
};

export default Header;