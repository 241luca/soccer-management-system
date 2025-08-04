// Test component per verificare il funzionamento base
import React from 'react';

function TestApp() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>🚀 Test Soccer Management System</h1>
      <p>Se vedi questo messaggio, React funziona correttamente!</p>
      <hr />
      <p>Ambiente: {import.meta.env.MODE}</p>
      <p>API URL: {import.meta.env.VITE_API_URL || 'Non configurato'}</p>
      <button 
        onClick={() => alert('Click funziona!')}
        style={{
          padding: '10px 20px',
          background: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        Test Click
      </button>
    </div>
  );
}

export default TestApp;
