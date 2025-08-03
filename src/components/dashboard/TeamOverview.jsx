// components/dashboard/TeamOverview.jsx
import React from 'react';
import StatusBadge from '../common/StatusBadge';

const TeamOverview = ({ data, setSelectedTeam, setCurrentView }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold mb-4">Panoramica Squadre</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.teams.map(team => {
          const teamAthletes = data.athletes.filter(a => a.teamId === team.id);
          const validAgeAthletes = teamAthletes.filter(a => a.isAgeValid).length;
          const ageConformity = teamAthletes.length > 0 ? Math.round((validAgeAthletes / teamAthletes.length) * 100) : 100;
          
          return (
            <div key={team.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold text-lg">{team.name}</h3>
                  <p className="text-gray-600 text-sm">{team.category}</p>
                </div>
                <div className="text-right">
                  <StatusBadge 
                    status={ageConformity === 100 ? 'valid' : ageConformity >= 80 ? 'warning' : 'critical'}
                  >
                    {ageConformity}% conforme
                  </StatusBadge>
                </div>
              </div>
              
              <div className="mt-2 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Atlete: {teamAthletes.length}</span>
                  <span>Età: {team.minAge}-{team.maxAge} anni</span>
                </div>
                
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Budget: €{team.budget.toLocaleString()}</span>
                  <span>Stagione: {team.season}</span>
                </div>
                
                {/* Barra di riempimento squadra */}
                <div className="mt-2 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                    style={{width: `${Math.min((teamAthletes.length / team.players) * 100, 100)}%`}}
                  ></div>
                </div>
                <div className="text-xs text-gray-500">
                  {teamAthletes.length}/{team.players} giocatrici
                </div>
              </div>

              {/* Warning per anomalie età */}
              {ageConformity < 100 && (
                <div className="mt-2 p-2 bg-yellow-50 border-l-2 border-yellow-400 rounded">
                  <p className="text-xs text-yellow-700">
                    ⚠️ {teamAthletes.length - validAgeAthletes} atlete non conformi per età
                  </p>
                </div>
              )}
              
              <div className="mt-3 flex gap-1">
                <button 
                  onClick={() => {
                    setSelectedTeam(team);
                    setCurrentView('athletes');
                  }}
                  className="flex-1 bg-blue-500 text-white py-1 px-3 rounded text-xs hover:bg-blue-600 transition-colors"
                >
                  Visualizza Rosa
                </button>
                <button 
                  onClick={() => {
                    setSelectedTeam(team);
                    setCurrentView('matches');
                  }}
                  className="bg-green-500 text-white py-1 px-3 rounded text-xs hover:bg-green-600 transition-colors"
                >
                  Partite
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TeamOverview;