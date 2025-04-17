import React, { useMemo } from 'react';
import { Routes, Route, useParams } from 'react-router-dom';
import './Teams.css';

interface TeamDetailProps {
  id: string;
}

const TeamDetail: React.FC<TeamDetailProps> = React.memo(({ id }) => {
  return (
    <div className="team-detail">
      <h2>Team {id} Details</h2>
      <div className="team-info">
        <div className="team-stats">
          <h3>Team Statistics</h3>
          <p>Coming soon...</p>
        </div>
        <div className="team-roster">
          <h3>Team Roster</h3>
          <p>Coming soon...</p>
        </div>
      </div>
    </div>
  );
});

const TeamList: React.FC = React.memo(() => {
  const teams = useMemo(() => 
    Array.from({ length: 20 }, (_, i) => ({
      id: i + 1,
      name: `Team ${i + 1}`
    })),
    []
  );

  return (
    <div className="teams-overview">
      <h2>Teams Overview</h2>
      <div className="teams-grid">
        {teams.map(team => (
          <div key={team.id} className="team-card">
            <h3>{team.name}</h3>
            <p>Click in sidebar to view details</p>
          </div>
        ))}
      </div>
    </div>
  );
});

const TeamRouter: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  return id ? <TeamDetail id={id} /> : <TeamList />;
};

const Teams: React.FC = () => {
  return (
    <div className="teams">
      <Routes>
        <Route path="/" element={<TeamList />} />
        <Route path=":id" element={<TeamRouter />} />
      </Routes>
    </div>
  );
};

export default Teams; 