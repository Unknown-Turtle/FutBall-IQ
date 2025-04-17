import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';

const TeamsSidebar: React.FC = React.memo(() => {
  const teams = useMemo(() => 
    Array.from({ length: 20 }, (_, i) => ({
      id: i + 1,
      name: `Team ${i + 1}`
    })),
    []
  );

  return (
    <div className="sidebar-menu">
      <h3>Teams</h3>
      <ul>
        {teams.map(team => (
          <li key={team.id}>
            <Link to={`/teams/${team.id}`}>
              {team.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
});

export default TeamsSidebar; 