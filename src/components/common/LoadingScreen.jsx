// components/common/LoadingScreen.jsx
import React from 'react';

const LoadingScreen = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <h2 className="text-2xl font-bold text-gray-700">⚽ Caricamento Sistema</h2>
        <p className="text-gray-500">Inizializzazione moduli enterprise...</p>
        <div className="mt-4 flex justify-center space-x-1">
          <div className="animate-pulse bg-blue-500 h-2 w-2 rounded-full"></div>
          <div className="animate-pulse bg-blue-500 h-2 w-2 rounded-full" style={{animationDelay: '0.1s'}}></div>
          <div className="animate-pulse bg-blue-500 h-2 w-2 rounded-full" style={{animationDelay: '0.2s'}}></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;