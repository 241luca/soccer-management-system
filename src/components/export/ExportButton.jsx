// components/export/ExportButton.jsx
import React, { useState } from 'react';
import { Download, FileText, FileSpreadsheet, File } from 'lucide-react';
import ExportManager from './ExportManager';

const ExportButton = ({ data, stats, dataType = 'all', buttonText = 'Esporta', size = 'normal', variant = 'primary', toast }) => {
  const [showExportModal, setShowExportModal] = useState(false);

  const getButtonClasses = () => {
    const baseClasses = 'flex items-center gap-2 font-medium transition-colors';
    
    const sizeClasses = {
      small: 'px-3 py-1.5 text-sm',
      normal: 'px-4 py-2 text-sm',
      large: 'px-6 py-3 text-base'
    };
    
    const variantClasses = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700',
      secondary: 'bg-gray-600 text-white hover:bg-gray-700',
      outline: 'border border-blue-600 text-blue-600 hover:bg-blue-50',
      ghost: 'text-blue-600 hover:bg-blue-50'
    };
    
    return `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} rounded-lg`;
  };

  const getIcon = () => {
    switch (dataType) {
      case 'athletes':
        return <FileSpreadsheet className="h-4 w-4" />;
      case 'matches':
        return <FileText className="h-4 w-4" />;
      case 'payments':
        return <File className="h-4 w-4" />;
      case 'transport':
        return <FileSpreadsheet className="h-4 w-4" />;
      default:
        return <Download className="h-4 w-4" />;
    }
  };

  return (
    <>
      <button
        onClick={() => setShowExportModal(true)}
        className={getButtonClasses()}
        title="Esporta dati in PDF, Excel o CSV"
      >
        {getIcon()}
        {buttonText}
      </button>

      {showExportModal && (
        <ExportManager
          data={data}
          stats={stats}
          toast={toast}
          onClose={() => setShowExportModal(false)}
        />
      )}
    </>
  );
};

export default ExportButton;