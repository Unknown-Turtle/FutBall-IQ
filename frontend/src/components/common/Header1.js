import React from 'react';
import './Header1.css';

function Header1() {
  const teamLogos = [
    'team1.png', 'team2.png', 'team3.png', 'team4.png', 'team5.png',
    'team6.png', 'team7.png', 'team8.png', 'team9.png', 'team10.png',
    'team11.png', 'team12.png', 'team13.png', 'team14.png', 'team15.png',
    'team16.png', 'team17.png', 'team18.png', 'team19.png', 'team20.png'
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