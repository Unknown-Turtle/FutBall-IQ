import React from 'react';
import './Header1.css';

function Header1() {
  const teamLogos = [
    'team1.png', 'team2.png', 'team3.png', // Add paths for all 20 team images
    //...
  ];

  return (
    <header className="header1">
      {teamLogos.map((logo, index) => (
        <img key={index} src={logo} alt={`Team ${index + 1}`} className="team-logo" />
      ))}
    </header>
  );
}

export default Header1;