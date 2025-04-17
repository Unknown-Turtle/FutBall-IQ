import React from 'react';
import { Link } from 'react-router-dom';

const DefaultSidebar: React.FC = () => {
  return (
    <div className="sidebar-menu">
      <h3>Menu</h3>
      <ul>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/teams">Teams</Link></li>
        <li><Link to="/players">Players</Link></li>
        <li><Link to="/about">About</Link></li>
      </ul>
    </div>
  );
};

export default DefaultSidebar; 