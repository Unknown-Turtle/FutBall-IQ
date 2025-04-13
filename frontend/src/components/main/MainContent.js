import React, { useState, useEffect } from 'react';
import './MainContent.css';
import axios from 'axios';

function MainContent() {

  return (
    <main className="main-content">
      <hr className="divider"/>

      
      <section className="about-section">
        <h2>About FutBall-IQ</h2>
        <div className="articles">
          <article>
            <h3>Project Overview</h3>
            <p>FutBall-IQ is a football analysis platform designed to provide deep insights into player performance, team dynamics, and match strategies. Explore detailed statistics, interactive data visualizations, and stay updated with the latest in football analysis.</p>
          </article>
          <article>
            <h3>Key Features</h3>
            <ul>
              <li>In-depth Player Stats</li>
              <li>Team Performance Analytics</li>
              <li>Custom Match Insights</li>
              <li>Interactive Visualizations</li>
            </ul>
          </article>
        </div>
      </section>

      <hr className="divider"/>

      
      <section className="player-overview">
        <h2>Player Overview</h2>
        <div className="articles">
          <article>
            <h3>Player Statistics</h3>
            <p>Dive into comprehensive player profiles, track individual performance metrics like goals, assists, pass accuracy, and more.</p>
          </article>
          <article>
            <h3>Advanced Analytics</h3>
            <p>Visualize heatmaps, player movements, and compare player performances across seasons and leagues.</p>
          </article>
        </div>
      </section>

      <hr className="divider"/>

      
      <section className="team-overview">
        <h2>Team Overview</h2>
        <div className="articles">
          <article>
            <h3>Team Insights</h3>
            <p>Analyze team dynamics, strategies, formations, and compare team stats across leagues and tournaments.</p>
          </article>
          <article>
            <h3>Performance Trends</h3>
            <p>Track win/loss ratios, recent match results, and identify trends in team performances over time.</p>
          </article>
        </div>
      </section>

      <hr className="divider"/>
    </main>
  );
}

export default MainContent;