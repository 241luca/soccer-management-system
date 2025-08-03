// components/matches/MatchModal.jsx - VERSIONE COMPLETA
import React, { useState, useEffect } from 'react';
import { X, Calendar, Users, Target, AlertCircle, Save } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';

const MatchModal = ({ match, data, onClose, onSave }) => {
  const [activeTab, setActiveTab] = useState('info');
  const [formData, setFormData] = useState({
    teamId: '',
    opponent: '',
    date: '',
    time: '',
    venue: '',
    competition: '',
    status: 'scheduled',
    homeGoals: '',
    awayGoals: '',
    notes: ''
  });

  const [lineup, setLineup] = useState([]);
  const [substitutes, setSubstitutes] = useState([]);

  useEffect(() => {
    if (match) {
      // Modalità modifica
      setFormData({
        teamId: match.teamId || '',
        opponent: match.opponent || '',
        date: match.date ? new Date(match.date).toISOString().split('T')[0] : '',
        time: match.time || '',
        venue: match.venue || '',
        competition: match.competition || '',
        status: match.status || 'scheduled',
        homeGoals: match.homeGoals !== null ? match.homeGoals.toString() : '',
        awayGoals: match.awayGoals !== null ? match.awayGoals.toString() : '',
        notes: match.notes || ''
      });
      
      // Lineup fittizia per demo
      const teamAthletes = data.athletes.filter(a => a.teamId === match.teamId);
      setLineup(teamAthletes.slice(0, 11));
      setSubstitutes(teamAthletes.slice(11, 16));
    } else {
      // Modalità creazione
      setFormData({
        teamId: data.teams[0]?.id || '',
        opponent: '',
        date: '',
        time: '15:00',
        venue: 'Casa',
        competition: '',
        status: 'scheduled',
        homeGoals: '',
        awayGoals: '',
        notes: ''
      });
      setLineup([]);
      setSubstitutes([]);
    }
  }, [match, data]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    const matchData = {
      id: match?.id || Date.now(),
      ...formData,
      teamId: parseInt(formData.teamId),
      teamName: data.teams.find(t => t.id === parseInt(formData.teamId))?.name || '',
      date: new Date(formData.date),
      homeGoals: formData.homeGoals ? parseInt(formData.homeGoals) : null,
      awayGoals: formData.awayGoals ? parseInt(formData.awayGoals) : null,
      lineup: lineup.map(a => a.id),
      substitutes: substitutes.map(a => a.id)
    };
    
    onSave(matchData);
  };

  const selectedTeam = data.teams.find(t => t.id === parseInt(formData.teamId));
  const availableAthletes = data.athletes.filter(a => a.teamId === parseInt(formData.teamId));

  const getMatchResult = () => {
    if (formData.status === 'completed' && formData.homeGoals !== '' && formData.awayGoals !== '') {
      const ourGoals = formData.venue === 'Casa' ? formData.homeGoals : formData.awayGoals;
      const theirGoals = formData.venue === 'Casa' ? formData.awayGoals : formData.homeGoals;
      return `${ourGoals} - ${theirGoals}`;
    }
    return null;
  };

  const isFormValid = () => {
    return formData.teamId && formData.opponent && formData.date && formData.time && 
           formData.venue && formData.competition;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold">
              {match ? 'Dettagli Partita' : 'Nuova Partita'}
            </h2>
            {match && (
              <p className="text-gray-600 mt-1">
                {match.teamName} vs {match.opponent}
              </p>
            )}
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 px-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('info')}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'info'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Informazioni
              </div>
            </button>
            <button
              onClick={() => setActiveTab('lineup')}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'lineup'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Formazione
              </div>
            </button>
            <button
              onClick={() => setActiveTab('result')}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'result'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Risultato
              </div>
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'info' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Squadra
                  </label>
                  <select
                    value={formData.teamId}
                    onChange={(e) => handleInputChange('teamId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Seleziona squadra</option>
                    {data.teams.map(team => (
                      <option key={team.id} value={team.id}>{team.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Avversario
                  </label>
                  <input
                    type="text"
                    value={formData.opponent}
                    onChange={(e) => handleInputChange('opponent', e.target.value)}
                    placeholder="Nome squadra avversaria"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Orario
                  </label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => handleInputChange('time', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Venue
                  </label>
                  <select
                    value={formData.venue}
                    onChange={(e) => handleInputChange('venue', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Casa">Casa</option>
                    <option value="Trasferta">Trasferta</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Competizione
                  </label>
                  <select
                    value={formData.competition}
                    onChange={(e) => handleInputChange('competition', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Seleziona competizione</option>
                    <option value="Campionato Giovanile">Campionato Giovanile</option>
                    <option value="Serie D">Serie D</option>
                    <option value="Coppa Italia">Coppa Italia</option>
                    <option value="Torneo Regionale">Torneo Regionale</option>
                    <option value="Amichevole">Amichevole</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stato
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="scheduled">Programmata</option>
                    <option value="completed">Giocata</option>
                    <option value="cancelled">Rimandata</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <StatusBadge 
                    status={formData.status === 'completed' ? 'completed' : 
                            formData.status === 'cancelled' ? 'critical' : 'scheduled'}
                  >
                    {formData.status === 'completed' ? 'Giocata' :
                     formData.status === 'cancelled' ? 'Rimandata' : 'Programmata'}
                  </StatusBadge>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Note
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Note aggiuntive sulla partita..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          )}

          {activeTab === 'lineup' && (
            <div className="space-y-6">
              {!selectedTeam ? (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Seleziona prima una squadra per gestire la formazione</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Formazione titolare */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Formazione Titolare ({lineup.length}/11)
                    </h3>
                    <div className="space-y-2 mb-4">
                      {lineup.map((player, index) => (
                        <div key={player.id} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                              {player.number}
                            </div>
                            <div>
                              <div className="font-medium">{player.name}</div>
                              <div className="text-sm text-gray-600">{player.position}</div>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              setLineup(lineup.filter((_, i) => i !== index));
                              setSubstitutes([...substitutes, player]);
                            }}
                            className="text-red-500 hover:text-red-700 text-sm"
                          >
                            Rimuovi
                          </button>
                        </div>
                      ))}
                    </div>
                    {lineup.length < 11 && (
                      <div className="text-sm text-orange-600 bg-orange-50 p-3 rounded-lg">
                        <AlertCircle className="h-4 w-4 inline mr-2" />
                        Formazione incompleta: {11 - lineup.length} giocatrici mancanti
                      </div>
                    )}
                  </div>

                  {/* Panchina */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Panchina ({substitutes.length})
                    </h3>
                    <div className="space-y-2 mb-4">
                      {substitutes.map((player, index) => (
                        <div key={player.id} className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                              {player.number}
                            </div>
                            <div>
                              <div className="font-medium">{player.name}</div>
                              <div className="text-sm text-gray-600">{player.position}</div>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              if (lineup.length < 11) {
                                setSubstitutes(substitutes.filter((_, i) => i !== index));
                                setLineup([...lineup, player]);
                              }
                            }}
                            className="text-green-500 hover:text-green-700 text-sm disabled:text-gray-400"
                            disabled={lineup.length >= 11}
                          >
                            Titolare
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Giocatrici disponibili */}
                    <div>
                      <h4 className="font-medium mb-2">Giocatrici Disponibili</h4>
                      <div className="max-h-40 overflow-y-auto space-y-1">
                        {availableAthletes
                          .filter(player => !lineup.find(p => p.id === player.id) && !substitutes.find(p => p.id === player.id))
                          .map((player) => (
                            <div key={player.id} className="flex items-center justify-between p-2 bg-gray-50 border border-gray-200 rounded text-sm">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 bg-gray-400 text-white rounded-full flex items-center justify-center text-xs">
                                  {player.number}
                                </div>
                                <span>{player.name} - {player.position}</span>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    if (lineup.length < 11) {
                                      setLineup([...lineup, player]);
                                    }
                                  }}
                                  disabled={lineup.length >= 11}
                                  className="text-green-500 hover:text-green-700 disabled:text-gray-400 text-xs"
                                >
                                  Titolare
                                </button>
                                <button
                                  onClick={() => setSubstitutes([...substitutes, player])}
                                  className="text-blue-500 hover:text-blue-700 text-xs"
                                >
                                  Panchina
                                </button>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'result' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gol Casa
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.homeGoals}
                    onChange={(e) => handleInputChange('homeGoals', e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={formData.status !== 'completed'}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gol Trasferta
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.awayGoals}
                    onChange={(e) => handleInputChange('awayGoals', e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={formData.status !== 'completed'}
                  />
                </div>
              </div>

              {formData.status !== 'completed' && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-blue-700">
                    <AlertCircle className="h-5 w-5" />
                    <span className="font-medium">Informazione</span>
                  </div>
                  <p className="text-blue-600 mt-1">
                    Imposta lo stato della partita su "Giocata" per inserire il risultato.
                  </p>
                </div>
              )}

              {getMatchResult() && (
                <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4 text-center">Risultato Finale</h3>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-gray-900 mb-2">
                      {getMatchResult()}
                    </div>
                    <div className="text-lg text-gray-600">
                      {selectedTeam?.name} vs {formData.opponent}
                    </div>
                    <div className="text-sm text-gray-500 mt-2">
                      {formData.date && new Date(formData.date).toLocaleDateString('it-IT')} • {formData.venue}
                    </div>
                  </div>
                </div>
              )}

              {/* Sezione statistiche giocatrici (placeholder) */}
              {formData.status === 'completed' && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Statistiche Giocatrici</h3>
                  <div className="bg-gray-50 p-4 rounded-lg text-center text-gray-500">
                    <Target className="h-8 w-8 mx-auto mb-2" />
                    <p>Funzionalità in sviluppo</p>
                    <p className="text-sm">Qui sarà possibile inserire gol, ammonizioni e sostituzioni</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            {!isFormValid() && (
              <>
                <AlertCircle className="h-4 w-4 text-orange-500" />
                <span>Compila tutti i campi obbligatori</span>
              </>
            )}
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annulla
            </button>
            <button
              onClick={handleSave}
              disabled={!isFormValid()}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {match ? 'Salva Modifiche' : 'Crea Partita'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchModal;