import React from 'react';
import { Link } from 'react-router-dom';
import './Header2.css';

const Header2: React.FC = () => {
  return (
    <header className="header2">
      <div className="home-button">
        <Link to="/">
          <img src="/path/to/your/home-button-image.png" alt="Home" className="home-button-img" />
        </Link>
      </div>
      <div className="search-bar">
        <input type="text" placeholder="Search..." />
      </div>
      <nav className="nav-links">
        <Link to="/teams">Teams</Link>
        <Link to="/players">Players</Link>
        <Link to="/about">About</Link>
      </nav>
    </header>
  );
};

export default Header2; 