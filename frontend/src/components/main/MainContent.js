import React, { useState, useEffect } from 'react';
import './MainContent.css';
import axios from 'axios';

function MainContent() {
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    axios.get('/api/players')
      .then(response => {
        setPlayers(response.data);
      })
      .catch(error => {
        console.error("There was an error fetching the player data!", error);
      });
  }, []);

  return (
    <main className="main-content">
      <section className="renamethis">
        <h2>Player Stats</h2>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Nation</th>
              <th>Position</th>
              <th>Age</th>
              <th>Matches Played</th>
              <th>Starts</th>
              <th>Minutes Played</th>
              <th>Goals</th>
              <th>Assists</th>
              <th>xG</th>
              <th>xAG</th>
              <th>npxG</th>
              <th>npxGxAG</th>
            </tr>
          </thead>
          <tbody>
            {players.map(player => (
              <tr key={player.id}>
                <td>{player.player_name}</td>
                <td>{player.nation}</td>
                <td>{player.position}</td>
                <td>{player.age}</td>
                <td>{player.matches_played}</td>
                <td>{player.starts}</td>
                <td>{player.minutes_played}</td>
                <td>{player.goals}</td>
                <td>{player.assists}</td>
                <td>{player.xG}</td>
                <td>{player.xAG}</td>
                <td>{player.npxG}</td>
                <td>{player.npxGxAG}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <hr className="divider"/>
      <section className="placeholder">
        <h2>Placeholder</h2>
        <div className="articles">
          <article>
            <h3>INFO</h3>
          </article>
          <article>
            <h3>EXTRA INFO</h3>
          </article>
        </div>
      </section>
      <hr className="divider"/>
    </main>
  );
}

export default MainContent;
