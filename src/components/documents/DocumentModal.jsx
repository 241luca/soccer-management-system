// components/documents/DocumentModal.jsx
import React, { useState, useEffect } from 'react';
import { X, Upload, FileText, Calendar, User, AlertTriangle, CheckCircle, Download, Trash2 } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';

const DocumentModal = ({ document, isUpload, onClose, onSave, athletes }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'medical',
    athleteId: '',
    expiryDate: '',
    notes: '',
    file: null
  });
  const [activeTab, setActiveTab] = useState('info');
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (document && !isUpload) {
      setFormData({
        name: document.name || '',
        type: document.type || 'medical',
        athleteId: document.athleteId || '',
        expiryDate: document.expiryDate ? new Date(document.expiryDate).toISOString().split('T')[0] : '',
        notes: document.notes || '',
        file: null
      });
    } else {
      // Reset form for new upload
      setFormData({
        name: '',
        type: 'medical',
        athleteId: '',
        expiryDate: '',
        notes: '',
        file: null
      });
    }
  }, [document, isUpload]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (file) => {
    setFormData(prev => ({ ...prev, file }));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileChange(files[0]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validazione base
    if (!formData.name || !formData.athleteId || !formData.expiryDate) {
      alert('Compila tutti i campi obbligatori');
      return;
    }
    
    if (isUpload && !formData.file) {
      alert('Seleziona un file da caricare');
      return;
    }
    
    // Simula upload/salvataggio
    const documentData = {
      ...formData,
      id: document?.id || Date.now(),
      uploadDate: new Date().toISOString(),
      uploadedBy: 'Segreteria',
      fileSize: formData.file ? `${Math.round(formData.file.size / 1024)} KB` : document?.fileSize || '0 KB'
    };
    
    onSave(documentData);
  };

  const getDocumentStatus = () => {
    if (!formData.expiryDate) return null;
    
    const today = new Date();
    const expiryDate = new Date(formData.expiryDate);
    const daysToExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
    
    if (daysToExpiry < 0) return { status: 'expired', label: 'Scaduto', color: 'red' };
    if (daysToExpiry <= 15) return { status: 'critical', label: 'Critico', color: 'orange' };
    if (daysToExpiry <= 30) return { status: 'warning', label: 'In Scadenza', color: 'yellow' };
    return { status: 'valid', label: 'Valido', color: 'green' };
  };

  const documentStatus = getDocumentStatus();
  const selectedAthlete = athletes.find(a => a.id === parseInt(formData.athleteId));

  const tabs = [
    { id: 'info', label: 'Informazioni', icon: FileText },
    { id: 'upload', label: isUpload ? 'Upload File' : 'File', icon: Upload },
    { id: 'history', label: 'Cronologia', icon: Calendar }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-blue-500" />
            <div>
              <h2 className="text-xl font-semibold">
                {isUpload ? 'Carica Nuovo Documento' : `Modifica: ${document?.name}`}
              </h2>
              <p className="text-sm text-gray-600">
                {isUpload ? 'Aggiungi un nuovo documento al sistema' : 'Visualizza e modifica documento esistente'}
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 px-6">
          <nav className="-mb-px flex space-x-8">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <form onSubmit={handleSubmit}>
            {/* Tab: Informazioni */}
            {activeTab === 'info' && (
              <div className="space-y-6">
                {/* Status Badge */}
                {documentStatus && (
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <div className={`p-2 rounded-full bg-${documentStatus.color}-100`}>
                      {documentStatus.status === 'valid' ? (
                        <CheckCircle className={`h-5 w-5 text-${documentStatus.color}-600`} />
                      ) : (
                        <AlertTriangle className={`h-5 w-5 text-${documentStatus.color}-600`} />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">Stato Documento</p>
                      <StatusBadge status={documentStatus.status}>
                        {documentStatus.label}
                      </StatusBadge>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Nome Documento */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome Documento *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="es. Certificato Medico Sportivo"
                      required
                    />
                  </div>

                  {/* Tipo Documento */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipologia *
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="medical">Certificato Medico</option>
                      <option value="insurance">Polizza Assicurativa</option>
                      <option value="figc">Documento FIGC</option>
                      <option value="other">Altro</option>
                    </select>
                  </div>

                  {/* Atleta */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Atleta *
                    </label>
                    <select
                      name="athleteId"
                      value={formData.athleteId}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Seleziona atleta...</option>
                      {athletes.map(athlete => (
                        <option key={athlete.id} value={athlete.id}>
                          {athlete.name} - {athlete.teamName}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Data Scadenza */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Data Scadenza *
                    </label>
                    <input
                      type="date"
                      name="expiryDate"
                      value={formData.expiryDate}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                {/* Atleta Selezionato Info */}
                {selectedAthlete && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-blue-500" />
                      <div>
                        <h4 className="font-medium text-blue-800">{selectedAthlete.name}</h4>
                        <p className="text-sm text-blue-600">{selectedAthlete.teamName} - {selectedAthlete.position}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Note */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Note e Osservazioni
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Aggiungi note, osservazioni o promemoria..."
                  />
                </div>
              </div>
            )}

            {/* Tab: Upload File */}
            {activeTab === 'upload' && (
              <div className="space-y-6">
                {!isUpload && document && (
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="h-8 w-8 text-blue-500" />
                        <div>
                          <h4 className="font-medium">{document.name}</h4>
                          <p className="text-sm text-gray-600">
                            Caricato il {new Date(document.uploadDate).toLocaleDateString('it-IT')} • {document.fileSize}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className="p-2 text-blue-600 hover:text-blue-800 transition-colors"
                          title="Download"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          className="p-2 text-red-600 hover:text-red-800 transition-colors"
                          title="Elimina"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Upload Area */}
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    isDragging
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  
                  {formData.file ? (
                    <div>
                      <h3 className="text-lg font-medium text-green-600 mb-2">
                        ✅ File selezionato
                      </h3>
                      <p className="text-sm text-gray-600">
                        {formData.file.name} ({Math.round(formData.file.size / 1024)} KB)
                      </p>
                      <button
                        type="button"
                        onClick={() => handleFileChange(null)}
                        className="mt-2 text-sm text-red-600 hover:text-red-800"
                      >
                        Rimuovi file
                      </button>
                    </div>
                  ) : (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {isUpload ? 'Carica nuovo documento' : 'Sostituisci documento esistente'}
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Trascina il file qui o clicca per selezionarlo
                      </p>
                      
                      <input
                        type="file"
                        onChange={(e) => handleFileChange(e.target.files[0])}
                        className="hidden"
                        id="file-upload"
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      />
                      <label
                        htmlFor="file-upload"
                        className="inline-block px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg cursor-pointer transition-colors"
                      >
                        Seleziona File
                      </label>
                      
                      <p className="text-xs text-gray-500 mt-2">
                        Formati supportati: PDF, JPG, PNG, DOC, DOCX (max 10MB)
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab: Cronologia */}
            {activeTab === 'history' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Cronologia Documento</h3>
                
                <div className="space-y-3">
                  {/* Timeline placeholder */}
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium">Documento caricato</p>
                      <p className="text-sm text-gray-600">
                        {document ? new Date(document.uploadDate).toLocaleDateString('it-IT') : 'Nuovo documento'} • {document?.uploadedBy || 'Segreteria'}
                      </p>
                    </div>
                  </div>
                  
                  {document && (
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <div>
                        <p className="font-medium">Validazione completata</p>
                        <p className="text-sm text-gray-600">
                          Documento verificato e approvato
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Annulla
          </button>
          
          <div className="flex gap-3">
            {!isUpload && (
              <button
                type="button"
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
              >
                Elimina
              </button>
            )}
            <button
              onClick={handleSubmit}
              className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              {isUpload ? 'Carica Documento' : 'Salva Modifiche'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentModal;