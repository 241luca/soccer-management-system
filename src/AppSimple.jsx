// App.jsx - Versione semplificata per debug
import React, { useState, useEffect } from 'react';

const SoccerManagementApp = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Simula caricamento
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <h2>Caricamento Soccer Management System...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        <h2>Errore: {error}</h2>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Soccer Management System</h1>
      <p>L'applicazione è stata caricata correttamente!</p>
      <p>Ora stiamo diagnosticando il problema con i componenti...</p>
      
      <div style={{ marginTop: '20px', padding: '10px', background: '#f0f0f0' }}>
        <h3>Componenti da caricare:</h3>
        <ul>
          <li>✓ React App</li>
          <li>? Navigation</li>
          <li>? Dashboard</li>
          <li>? Organizations</li>
        </ul>
      </div>
    </div>
  );
};

export default SoccerManagementApp;