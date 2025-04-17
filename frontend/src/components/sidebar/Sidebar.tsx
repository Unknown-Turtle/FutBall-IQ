import React from 'react';
import { useLocation } from 'react-router-dom';
import TeamsSidebar from './TeamsSidebar';
import './Sidebar.css';

const PlaceholderSidebar: React.FC<{ title: string }> = ({ title }) => {
  return (
    <div className="sidebar-menu">
      <h3>{title}</h3>
      <ul>
        <li>placeholder</li>
        <li>placeholder</li>
        <li>placeholder</li>
        <li>placeholder</li>
        <li>placeholder</li>
        <li>placeholder</li>
        <li>placeholder</li>
        <li>placeholder</li>
      </ul>
    </div>
  );
};

const Sidebar: React.FC = () => {
  const location = useLocation();
  const isTeamsRoute = location.pathname.startsWith('/teams');
  const isPlayersRoute = location.pathname.startsWith('/players');

  const getSidebarTitle = () => {
    if (isPlayersRoute) return 'Trending Players';
    return 'Menu';
  };

  return (
    <aside className="sidebar">
      {isTeamsRoute ? (
        <TeamsSidebar />
      ) : (
        <PlaceholderSidebar title={getSidebarTitle()} />
      )}
      <div className="sidebar-footer">
        <a href="#" target="_blank" rel="noopener noreferrer">Join our Discord!</a>
      </div>
    </aside>
  );
};

export default Sidebar; 