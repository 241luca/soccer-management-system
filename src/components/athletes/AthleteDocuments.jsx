// components/athletes/AthleteDocuments.jsx
import React, { useState, useEffect } from 'react';
import { FileText, Upload, Download, Trash2, Calendar, AlertTriangle, Check, X, Eye, Plus, Settings } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import { api } from '../../services/api';

const AthleteDocuments = ({ athleteId, isEditing = false, toast }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [customTypes, setCustomTypes] = useState([]);

  // Tipi di documento predefiniti
  const defaultDocumentTypes = [
    { value: 'medical_certificate', label: 'Certificato Medico Sportivo', required: true, requiresExpiry: true },
    { value: 'insurance', label: 'Assicurazione Sportiva', required: true, requiresExpiry: true },
    { value: 'identity_card', label: 'Carta d\'Identità', required: true, requiresExpiry: true },
    { value: 'photo', label: 'Foto Tessera', required: false, requiresExpiry: false },
    { value: 'parent_authorization', label: 'Autorizzazione Genitori (minori)', required: false, requiresExpiry: false },
    { value: 'privacy_consent', label: 'Consenso Privacy', required: true, requiresExpiry: false },
    { value: 'registration_form', label: 'Modulo Iscrizione', required: true, requiresExpiry: false },
    { value: 'other', label: 'Altro', required: false, requiresExpiry: false }
  ];

  // Combina tipi predefiniti e personalizzati
  const documentTypes = [...defaultDocumentTypes, ...customTypes];

  useEffect(() => {
    if (athleteId) {
      loadDocuments();
    } else {
      // Se non c'è un atleteId (nuovo atleta), non caricare
      setLoading(false);
    }
    loadCustomTypes();
  }, [athleteId]);

  const loadDocuments = async () => {
    if (!athleteId) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const response = await api.get(`/athletes/${athleteId}/documents`);
      setDocuments(response.data || response || []);
    } catch (error) {
      console.error('Error loading documents:', error);
      // Non mostrare errore se è 404 (nessun documento)
      if (error.message && !error.message.includes('404')) {
        toast?.showError('Errore nel caricamento documenti');
      }
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const loadCustomTypes = async () => {
    try {
      // Carica tipi personalizzati dall'organizzazione
      const response = await api.get('/organization/document-types');
      const types = (response.data || response || []).map(type => ({
        ...type,
        value: type.value || type.id,
        label: type.label || type.name,
        required: type.required || false,
        requiresExpiry: type.requiresExpiry || false
      }));
      setCustomTypes(types);
    } catch (error) {
      // Ignora errori, usa solo tipi predefiniti
      console.log('No custom document types');
    }
  };

  const handleUpload = async (file, documentType, expiryDate) => {
    try {
      setUploading(true);
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', documentType);
      if (expiryDate) {
        formData.append('expiryDate', expiryDate);
      }

      await api.post(`/athletes/${athleteId}/documents`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      toast?.showSuccess('Documento caricato con successo');
      setShowUploadModal(false);
      loadDocuments();
    } catch (error) {
      console.error('Error uploading document:', error);
      toast?.showError('Errore nel caricamento del documento');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (documentId) => {
    if (!confirm('Sei sicuro di voler eliminare questo documento?')) return;

    try {
      await api.delete(`/athletes/${athleteId}/documents/${documentId}`);
      toast?.showSuccess('Documento eliminato');
      loadDocuments();
    } catch (error) {
      console.error('Error deleting document:', error);
      toast?.showError('Errore nell\'eliminazione del documento');
    }
  };

  const handleDownload = async (documentId, fileName) => {
    try {
      const response = await api.get(`/athletes/${athleteId}/documents/${documentId}/download`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading document:', error);
      toast?.showError('Errore nel download del documento');
    }
  };

  const getDocumentStatus = (doc) => {
    if (!doc.expiryDate) return 'valid';
    
    const today = new Date();
    const expiry = new Date(doc.expiryDate);
    const daysUntilExpiry = Math.floor((expiry - today) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) return 'expired';
    if (daysUntilExpiry <= 30) return 'expiring';
    return 'valid';
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'expired': return 'Scaduto';
      case 'expiring': return 'In scadenza';
      case 'valid': return 'Valido';
      default: return 'Sconosciuto';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'expired': return 'critical';
      case 'expiring': return 'warning';
      case 'valid': return 'valid';
      default: return 'unknown';
    }
  };

  const UploadModal = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [documentType, setDocumentType] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [showExpiryDate, setShowExpiryDate] = useState(false);

    // Controlla se il tipo selezionato richiede data di scadenza
    useEffect(() => {
      const selectedType = documentTypes.find(t => t.value === documentType);
      if (selectedType) {
        setShowExpiryDate(selectedType.requiresExpiry || false);
        // Se non richiede scadenza, pulisci il campo
        if (!selectedType.requiresExpiry) {
          setExpiryDate('');
        }
      }
    }, [documentType]);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <h3 className="text-lg font-semibold mb-4">Carica Documento</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo Documento *
              </label>
              <select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleziona tipo...</option>
                {documentTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label} {type.required && '*'}
                  </option>
                ))}
              </select>
            </div>

            {/* Checkbox per data scadenza opzionale */}
            {documentType && !showExpiryDate && (
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="addExpiry"
                  checked={expiryDate !== ''}
                  onChange={(e) => {
                    if (!e.target.checked) {
                      setExpiryDate('');
                    }
                  }}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="addExpiry" className="text-sm text-gray-700">
                  Aggiungi data di scadenza (opzionale)
                </label>
              </div>
            )}

            {/* Campo data scadenza */}
            {(showExpiryDate || expiryDate !== '') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data Scadenza *
                </label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                File * (Max 10MB, PDF/JPG/PNG)
              </label>
              <input
                type="file"
                onChange={(e) => setSelectedFile(e.target.files[0])}
                accept=".pdf,.jpg,.jpeg,.png"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button
              onClick={() => setShowUploadModal(false)}
              className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg"
            >
              Annulla
            </button>
            <button
              onClick={() => {
                if (!selectedFile || !documentType) {
                  alert('Compila tutti i campi obbligatori');
                  return;
                }
                const selectedTypeInfo = documentTypes.find(t => t.value === documentType);
                if (selectedTypeInfo?.requiresExpiry && !expiryDate) {
                  alert('Inserisci la data di scadenza per questo tipo di documento');
                  return;
                }
                handleUpload(selectedFile, documentType, expiryDate || null);
              }}
              disabled={uploading}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg disabled:opacity-50"
            >
              {uploading ? 'Caricamento...' : 'Carica'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const TypeManagementModal = () => {
    const [newType, setNewType] = useState({
      label: '',
      required: false,
      requiresExpiry: false
    });

    const handleAddType = async () => {
      if (!newType.label) {
        alert('Inserisci il nome del tipo di documento');
        return;
      }

      try {
        const typeValue = newType.label.toLowerCase().replace(/\s+/g, '_');
        const typeToAdd = {
          ...newType,
          value: typeValue,
          id: Date.now().toString() // ID temporaneo
        };

        // Salva nel backend
        await api.post('/organization/document-types', typeToAdd);
        
        // Aggiungi localmente
        setCustomTypes([...customTypes, typeToAdd]);
        setNewType({ label: '', required: false, requiresExpiry: false });
        toast?.showSuccess('Tipo documento aggiunto');
        setShowTypeModal(false);
      } catch (error) {
        // Se il backend non supporta, salva solo localmente
        const typeValue = newType.label.toLowerCase().replace(/\s+/g, '_');
        const typeToAdd = {
          ...newType,
          value: typeValue
        };
        setCustomTypes([...customTypes, typeToAdd]);
        setNewType({ label: '', required: false, requiresExpiry: false });
        toast?.showSuccess('Tipo documento aggiunto localmente');
        setShowTypeModal(false);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <h3 className="text-lg font-semibold mb-4">Gestione Tipi Documento</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome Tipo Documento *
              </label>
              <input
                type="text"
                value={newType.label}
                onChange={(e) => setNewType({...newType, label: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="es. Certificato Vaccinazioni"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="required"
                  checked={newType.required}
                  onChange={(e) => setNewType({...newType, required: e.target.checked})}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="required" className="text-sm text-gray-700">
                  Documento obbligatorio
                </label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="requiresExpiry"
                  checked={newType.requiresExpiry}
                  onChange={(e) => setNewType({...newType, requiresExpiry: e.target.checked})}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="requiresExpiry" className="text-sm text-gray-700">
                  Richiede data di scadenza
                </label>
              </div>
            </div>

            {/* Lista tipi personalizzati */}
            {customTypes.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Tipi Personalizzati:</h4>
                <div className="space-y-1">
                  {customTypes.map((type, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span>{type.label}</span>
                      <button
                        onClick={() => {
                          setCustomTypes(customTypes.filter((_, i) => i !== index));
                        }}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button
              onClick={() => setShowTypeModal(false)}
              className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg"
            >
              Chiudi
            </button>
            <button
              onClick={handleAddType}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
            >
              Aggiungi Tipo
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-gray-500">Caricamento documenti...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con pulsante upload */}
      {isEditing && (
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Documenti Atleta</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowTypeModal(true)}
              className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg flex items-center gap-2"
              title="Gestisci tipi documento"
            >
              <Settings className="h-4 w-4" />
              Tipi Documento
            </button>
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Carica Documento
            </button>
          </div>
        </div>
      )}

      {/* Lista documenti richiesti */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {documentTypes.filter(type => type.required).map(docType => {
          const uploadedDoc = documents.find(d => d.type === docType.value);
          
          return (
            <div key={docType.value} className="border rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{docType.label}</h4>
                  
                  {uploadedDoc ? (
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={getStatusColor(getDocumentStatus(uploadedDoc))}>
                          {getStatusText(getDocumentStatus(uploadedDoc))}
                        </StatusBadge>
                        {uploadedDoc.expiryDate && (
                          <span className="text-sm text-gray-500">
                            Scade: {new Date(uploadedDoc.expiryDate).toLocaleDateString('it-IT')}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDownload(uploadedDoc.id, uploadedDoc.fileName)}
                          className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                        >
                          <Download className="h-3 w-3" />
                          Download
                        </button>
                        
                        {isEditing && (
                          <button
                            onClick={() => handleDelete(uploadedDoc.id)}
                            className="text-sm text-red-600 hover:text-red-800 flex items-center gap-1"
                          >
                            <Trash2 className="h-3 w-3" />
                            Elimina
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-2">
                      <StatusBadge status="critical">
                        Mancante
                      </StatusBadge>
                      <p className="text-sm text-gray-500 mt-1">
                        Documento obbligatorio non caricato
                      </p>
                    </div>
                  )}
                </div>
                
                {!uploadedDoc && isEditing && (
                  <button
                    onClick={() => {
                      // Pre-seleziona il tipo quando si clicca sul pulsante upload
                      setShowUploadModal(true);
                    }}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    <Upload className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Altri documenti caricati */}
      {documents.filter(d => !documentTypes.find(t => t.value === d.type && t.required)).length > 0 && (
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Altri Documenti</h4>
          <div className="space-y-2">
            {documents.filter(d => !documentTypes.find(t => t.value === d.type && t.required)).map(doc => (
              <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium">{doc.fileName}</p>
                    <p className="text-sm text-gray-500">
                      {documentTypes.find(t => t.value === doc.type)?.label || doc.type}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDownload(doc.id, doc.fileName)}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                  
                  {isEditing && (
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="text-sm text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mostra upload modal */}
      {showUploadModal && <UploadModal />}
      
      {/* Mostra modal gestione tipi */}
      {showTypeModal && <TypeManagementModal />}
    </div>
  );
};

export default AthleteDocuments;
