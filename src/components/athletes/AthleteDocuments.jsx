// components/athletes/AthleteDocuments.enhanced.jsx
import React, { useState, useEffect } from 'react';
import { FileText, Upload, Download, Trash2, Calendar, AlertTriangle, Check, X, Eye, Plus, Settings } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import { useDocuments } from '../../hooks/useCrud';
import { getEnumValues } from '../../config/api/entityConfigs';

const AthleteDocuments = ({ athleteId, isEditing = false, toast }) => {
  // Usa il nuovo hook CRUD per documenti
  const documentsCrud = useDocuments({ 
    toast,
    onSuccess: (operation, data) => {
      if (operation === 'create') {
        loadDocuments();
      }
    }
  });

  const [documents, setDocuments] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [customTypes, setCustomTypes] = useState([]);

  // Ottieni i tipi di documento dalle configurazioni
  const documentTypes = getEnumValues('document', 'type') || [];

  // Mappatura tipi documento con configurazioni aggiuntive
  const documentTypeConfig = {
    MEDICAL_CERTIFICATE: { label: 'Certificato Medico Sportivo', required: true, requiresExpiry: true },
    INSURANCE: { label: 'Assicurazione Sportiva', required: true, requiresExpiry: true },
    IDENTITY_CARD: { label: 'Carta d\'Identità', required: true, requiresExpiry: true },
    PHOTO: { label: 'Foto Tessera', required: false, requiresExpiry: false },
    PARENT_AUTHORIZATION: { label: 'Autorizzazione Genitori (minori)', required: false, requiresExpiry: false },
    PRIVACY_CONSENT: { label: 'Consenso Privacy', required: true, requiresExpiry: false },
    REGISTRATION_FORM: { label: 'Modulo Iscrizione', required: true, requiresExpiry: false },
    OTHER: { label: 'Altro', required: false, requiresExpiry: false }
  };

  // Combina configurazioni con tipi personalizzati
  const allDocumentTypes = [
    ...documentTypes.map(type => ({
      value: type,
      label: documentTypeConfig[type]?.label || type,
      required: documentTypeConfig[type]?.required || false,
      requiresExpiry: documentTypeConfig[type]?.requiresExpiry || false
    })),
    ...customTypes
  ];

  useEffect(() => {
    if (athleteId) {
      loadDocuments();
    }
    loadCustomTypes();
  }, [athleteId]);

  const loadDocuments = async () => {
    if (!athleteId) {
      return;
    }
    
    const result = await documentsCrud.fetchList({ athleteId });
    if (result.success) {
      // I documenti sono già trasformati con proprietà calcolate
      setDocuments(result.data);
    }
  };

  const loadCustomTypes = async () => {
    // Per ora usiamo solo i tipi standard
    // In futuro possiamo caricare tipi personalizzati dal backend
    setCustomTypes([]);
  };

  const handleUpload = async (file, documentType, expiryDate) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', documentType);
    formData.append('athleteId', athleteId);
    if (expiryDate) {
      formData.append('expiryDate', expiryDate);
    }

    // Il nuovo sistema gestisce automaticamente validazione ed errori
    const result = await documentsCrud.create(formData);
    
    if (result.success) {
      setShowUploadModal(false);
      loadDocuments();
    }
  };

  const handleDelete = async (documentId) => {
    if (!confirm('Sei sicuro di voler eliminare questo documento?')) return;

    // Il sistema gestisce automaticamente toast ed errori
    const result = await documentsCrud.remove(documentId);
    
    if (result.success) {
      loadDocuments();
    }
  };

  const handleDownload = async (document) => {
    try {
      // Usa l'URL già presente nel documento trasformato
      if (document.downloadUrl) {
        window.open(document.downloadUrl, '_blank');
      } else {
        // Fallback al metodo vecchio
        const response = await fetch(`/api/documents/${document.id}/download`);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = document.fileName;
        link.click();
      }
    } catch (error) {
      toast?.showError('Errore nel download del documento');
    }
  };

  const getDocumentStatus = (doc) => {
    // Usa le proprietà già calcolate dalla trasformazione
    if (doc.isExpired) return 'expired';
    if (doc.isExpiring) return 'expiring';
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
    const [errors, setErrors] = useState({});

    // Controlla se il tipo selezionato richiede data di scadenza
    useEffect(() => {
      const selectedType = allDocumentTypes.find(t => t.value === documentType);
      if (selectedType) {
        setShowExpiryDate(selectedType.requiresExpiry || false);
        if (!selectedType.requiresExpiry) {
          setExpiryDate('');
        }
      }
    }, [documentType]);

    const validate = () => {
      const newErrors = {};
      
      if (!documentType) {
        newErrors.documentType = 'Seleziona un tipo di documento';
      }
      
      if (!selectedFile) {
        newErrors.file = 'Seleziona un file';
      } else if (selectedFile.size > 10 * 1024 * 1024) {
        newErrors.file = 'Il file non può superare i 10MB';
      }
      
      const selectedTypeInfo = allDocumentTypes.find(t => t.value === documentType);
      if (selectedTypeInfo?.requiresExpiry && !expiryDate) {
        newErrors.expiryDate = 'Data di scadenza obbligatoria per questo tipo';
      }
      
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
      if (validate()) {
        handleUpload(selectedFile, documentType, expiryDate || null);
      }
    };

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
                onChange={(e) => {
                  setDocumentType(e.target.value);
                  setErrors({...errors, documentType: ''});
                }}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.documentType ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Seleziona tipo...</option>
                {allDocumentTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label} {type.required && '*'}
                  </option>
                ))}
              </select>
              {errors.documentType && (
                <p className="text-red-500 text-xs mt-1">{errors.documentType}</p>
              )}
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
                  onChange={(e) => {
                    setExpiryDate(e.target.value);
                    setErrors({...errors, expiryDate: ''});
                  }}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.expiryDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                  min={new Date().toISOString().split('T')[0]}
                />
                {errors.expiryDate && (
                  <p className="text-red-500 text-xs mt-1">{errors.expiryDate}</p>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                File * (Max 10MB, PDF/JPG/PNG)
              </label>
              <input
                type="file"
                onChange={(e) => {
                  setSelectedFile(e.target.files[0]);
                  setErrors({...errors, file: ''});
                }}
                accept=".pdf,.jpg,.jpeg,.png"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.file ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.file && (
                <p className="text-red-500 text-xs mt-1">{errors.file}</p>
              )}
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
              onClick={handleSubmit}
              disabled={documentsCrud.loading}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg disabled:opacity-50"
            >
              {documentsCrud.loading ? 'Caricamento...' : 'Carica'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (documentsCrud.loading && documents.length === 0) {
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
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            Carica Documento
          </button>
        </div>
      )}

      {/* Lista documenti richiesti */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {allDocumentTypes.filter(type => type.required).map(docType => {
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
                            Scade: {uploadedDoc.expiryDate.formatted}
                          </span>
                        )}
                        {uploadedDoc.daysUntilExpiry !== undefined && uploadedDoc.daysUntilExpiry > 0 && (
                          <span className="text-xs text-gray-500">
                            ({uploadedDoc.daysUntilExpiry} giorni)
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDownload(uploadedDoc)}
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
                    onClick={() => setShowUploadModal(true)}
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
      {documents.filter(d => !allDocumentTypes.find(t => t.value === d.type && t.required)).length > 0 && (
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Altri Documenti</h4>
          <div className="space-y-2">
            {documents.filter(d => !allDocumentTypes.find(t => t.value === d.type && t.required)).map(doc => (
              <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium">{doc.fileName}</p>
                    <p className="text-sm text-gray-500">
                      {allDocumentTypes.find(t => t.value === doc.type)?.label || doc.typeFormatted || doc.type}
                    </p>
                    {doc.uploadedAt && (
                      <p className="text-xs text-gray-400">
                        Caricato il {doc.uploadedAt.formatted}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {doc.expiryDate && (
                    <StatusBadge status={getStatusColor(getDocumentStatus(doc))} size="sm">
                      {doc.daysUntilExpiry !== undefined && doc.daysUntilExpiry > 0 
                        ? `${doc.daysUntilExpiry}gg` 
                        : getStatusText(getDocumentStatus(doc))
                      }
                    </StatusBadge>
                  )}
                  
                  <button
                    onClick={() => handleDownload(doc)}
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
    </div>
  );
};

export default AthleteDocuments;