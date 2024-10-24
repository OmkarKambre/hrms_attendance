import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './NavBar.css'; // Import the CSS file for styling

const NavBar = ({ onLogout }) => {
  const location = useLocation(); // Get the current location
  const [isMenuOpen, setIsMenuOpen] = useState(false); // State to manage menu visibility

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="navbar">
      <h1 className="navbar-title">Employee Portal</h1>
      <button className="menu-toggle" onClick={toggleMenu}>
        ☰ {/* Hamburger menu icon */}
      </button>
      <div className={`navbar-links ${isMenuOpen ? 'open' : ''}`}>
        <Link
          to="/EmployeeDetails" // Ensure this matches the route path in App.jsx
          className={`navbar-link ${location.pathname === '/EmployeeDetails' ? 'active' : ''}`}
        >
          Profile
        </Link>
        <Link
          to="/ApplyLeave" // Ensure this matches the route path in App.jsx
          className={`navbar-link ${location.pathname === '/ApplyLeave' ? 'active' : ''}`}
        >
          Apply Leave
        </Link>
        <Link
          to="/LeaveHistory"
          className={`navbar-link ${location.pathname === '/LeaveHistory' ? 'active' : ''}`}
        >
          Leave History
        </Link>
        <span className="navbar-link logout-text" onClick={onLogout}>Logout</span>
      </div>
    </nav>
  );
};

export default NavBar;
