# 📄 Organization Documents API

API per la gestione dei documenti societari con upload e categorizzazione.

## Endpoints

- [GET /organizations/:orgId/documents](#get-organizationsorgiddocuments) - Lista documenti
- [POST /organizations/:orgId/documents](#post-organizationsorgiddocuments) - Upload documento
- [GET /documents/:id/download](#get-documentsiddownload) - Download documento
- [PUT /documents/:id](#put-documentsid) - Aggiorna metadata
- [DELETE /documents/:id](#delete-documentsid) - Elimina documento

## GET /organizations/:orgId/documents

Ottiene la lista dei documenti dell'organizzazione.

### Request

```http
GET /api/v1/organizations/43c973a6-5e20-43af-a295-805f1d7c86b1/documents
Authorization: Bearer <token>
```

### Query Parameters

| Parametro | Tipo | Descrizione | Esempio |
|-----------|------|-------------|---------|
| category | string | Filtra per categoria | "statuto" |
| year | integer | Filtra per anno | 2024 |
| isPublic | boolean | Filtra pubblici/privati | true |

### Response

```json
[
  {
    "id": "abc123-e89b-12d3-a456-426614174000",
    "organizationId": "43c973a6-5e20-43af-a295-805f1d7c86b1",
    "name": "Statuto Societario 2024",
    "description": "Statuto aggiornato con modifiche assemblea straordinaria",
    "category": "statuto",
    "fileUrl": "/uploads/documents/organizations/abc123-statuto-2024.pdf",
    "fileName": "statuto-asd-ravenna-2024.pdf",
    "fileSize": 245760,
    "mimeType": "application/pdf",
    "year": 2024,
    "isPublic": true,
    "tags": ["legale", "ufficiale", "2024"],
    "uploadedBy": {
      "id": "user123",
      "firstName": "Mario",
      "lastName": "Rossi",
      "email": "m.rossi@ravennacalcio.it"
    },
    "createdAt": "2024-03-15T10:00:00Z",
    "updatedAt": "2024-03-15T10:00:00Z"
  },
  {
    "id": "def456-e89b-12d3-a456-426614174001",
    "name": "Bilancio Consuntivo 2023",
    "category": "bilancio",
    "fileSize": 512000,
    "mimeType": "application/pdf",
    "year": 2023,
    "isPublic": false,
    "tags": ["bilancio", "2023", "approvato"],
    "uploadedBy": {
      "id": "user456",
      "firstName": "Luigi",
      "lastName": "Bianchi",
      "email": "l.bianchi@ravennacalcio.it"
    }
  }
]
```

### Categorie Documenti

| Categoria | Descrizione | Pubblico tipico |
|-----------|-------------|-----------------|
| `statuto` | Statuto societario | Sì |
| `bilancio` | Bilanci (consuntivo/preventivo) | Dipende |
| `verbale` | Verbali assemblee/consigli | No |
| `certificato` | Certificazioni (CONI, ecc.) | Sì |
| `regolamento` | Regolamenti interni | Sì |
| `contratto` | Contratti e convenzioni | No |
| `progetto` | Progetti e proposte | Dipende |
| `report` | Report e relazioni | Dipende |
| `other` | Altri documenti | Dipende |

## POST /organizations/:orgId/documents

Upload di un nuovo documento.

### Request

```http
POST /api/v1/organizations/43c973a6-5e20-43af-a295-805f1d7c86b1/documents
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

### Form Data

| Campo | Tipo | Richiesto | Descrizione |
|-------|------|-----------|-------------|
| file | File | Sì | Il file da caricare (max 10MB) |
| name | string | No | Nome documento (default: nome file) |
| description | string | No | Descrizione del documento |
| category | string | No | Categoria (default: "other") |
| year | integer | No | Anno riferimento (default: corrente) |
| isPublic | boolean | No | Documento pubblico (default: false) |
| tags | JSON array | No | Tags per ricerca |

### Esempio cURL

```bash
curl -X POST \
  https://api.soccermanager.com/api/v1/organizations/43c973a6/documents \
  -H "Authorization: Bearer <token>" \
  -F "file=@/path/to/statuto.pdf" \
  -F "name=Statuto Societario 2025" \
  -F "description=Versione aggiornata dello statuto" \
  -F "category=statuto" \
  -F "year=2025" \
  -F "isPublic=true" \
  -F 'tags=["legale","2025","ufficiale"]'
```

### Response

```json
{
  "success": true,
  "data": {
    "id": "ghi789-e89b-12d3-a456-426614174002",
    "organizationId": "43c973a6-5e20-43af-a295-805f1d7c86b1",
    "name": "Statuto Societario 2025",
    "description": "Versione aggiornata dello statuto",
    "category": "statuto",
    "fileUrl": "/uploads/documents/organizations/ghi789-1234567890-statuto.pdf",
    "fileName": "statuto.pdf",
    "fileSize": 245760,
    "mimeType": "application/pdf",
    "year": 2025,
    "isPublic": true,
    "tags": ["legale", "2025", "ufficiale"],
    "uploadedBy": {
      "id": "user123",
      "firstName": "Mario",
      "lastName": "Rossi",
      "email": "m.rossi@ravennacalcio.it"
    },
    "createdAt": "2025-01-20T14:30:00Z",
    "updatedAt": "2025-01-20T14:30:00Z"
  }
}
```

### Tipi File Supportati

- **PDF**: application/pdf
- **Word**: application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document
- **Excel**: application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
- **Immagini**: image/jpeg, image/png, image/gif

### Error Responses

#### 400 Bad Request - No file
```json
{
  "error": "Bad Request",
  "message": "No file uploaded"
}
```

#### 413 Payload Too Large
```json
{
  "error": "Payload Too Large",
  "message": "File size exceeds 10MB limit"
}
```

#### 415 Unsupported Media Type
```json
{
  "error": "Unsupported Media Type",
  "message": "Invalid file type. Only PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, and GIF are allowed."
}
```

## GET /documents/:id/download

Scarica un documento.

### Request

```http
GET /api/v1/documents/abc123-e89b-12d3-a456-426614174000/download
Authorization: Bearer <token>
```

### Response

- **Status**: 200 OK
- **Headers**:
  - `Content-Type`: MIME type del file
  - `Content-Disposition`: attachment; filename="nome-file.pdf"
  - `Content-Length`: Dimensione file in bytes
- **Body**: Stream del file

### Error Responses

#### 403 Forbidden - Private Document
```json
{
  "error": "Forbidden",
  "message": "No access to this document"
}
```

#### 404 Not Found - File Missing
```json
{
  "error": "Not Found",
  "message": "File not found on server"
}
```

## PUT /documents/:id

Aggiorna i metadata di un documento (non il file).

### Request

```http
PUT /api/v1/documents/abc123-e89b-12d3-a456-426614174000
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "name": "Statuto Societario 2025 - Rev. 2",
  "description": "Seconda revisione con modifiche art. 15",
  "category": "statuto",
  "year": 2025,
  "isPublic": true,
  "tags": ["legale", "2025", "ufficiale", "rev2"]
}
```

### Campi Modificabili

- `name` - Nome del documento
- `description` - Descrizione
- `category` - Categoria
- `year` - Anno di riferimento
- `isPublic` - Visibilità pubblica
- `tags` - Array di tags

**Nota**: Il file stesso non può essere modificato. Per aggiornare il file, caricare una nuova versione.

### Response

```json
{
  "success": true,
  "data": {
    // Documento aggiornato con tutti i campi
  }
}
```

## DELETE /documents/:id

Elimina un documento (file e record database).

### Request

```http
DELETE /api/v1/documents/abc123-e89b-12d3-a456-426614174000
Authorization: Bearer <token>
```

### Response

```json
{
  "success": true,
  "message": "Document deleted successfully"
}
```

### Note

- Il file viene eliminato fisicamente dal server
- L'operazione non è reversibile
- Solo Admin/Owner possono eliminare documenti

## 📁 Organizzazione File

### Struttura Directory
```
/backend/uploads/documents/organizations/
├── {uuid}-{timestamp}-{filename}
├── abc123-1234567890-statuto.pdf
├── def456-1234567891-bilancio-2023.pdf
└── ghi789-1234567892-verbale-assemblea.pdf
```

### Naming Convention
- **UUID**: Identificativo univoco
- **Timestamp**: Unix timestamp upload
- **Filename**: Nome file originale sanitizzato

## 🔍 Ricerca e Filtri

### Ricerca per Tags
```javascript
// Cerca documenti con specifici tags
const searchByTags = async (tags) => {
  const docs = await fetch(`/api/v1/organizations/${orgId}/documents`);
  const filtered = docs.filter(doc => 
    tags.every(tag => doc.tags.includes(tag))
  );
  return filtered;
};
```

### Documenti Recenti
```javascript
// Ultimi 10 documenti caricati
const recentDocs = documents
  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  .slice(0, 10);
```

### Documenti per Anno
```javascript
// Raggruppa documenti per anno
const docsByYear = documents.reduce((acc, doc) => {
  const year = doc.year || new Date(doc.createdAt).getFullYear();
  acc[year] = acc[year] || [];
  acc[year].push(doc);
  return acc;
}, {});
```

## 🔒 Sicurezza e Permessi

### Controllo Accessi

1. **Documenti Pubblici** (`isPublic: true`):
   - Accessibili a tutti i membri dell'organizzazione
   - Potenzialmente accessibili pubblicamente

2. **Documenti Privati** (`isPublic: false`):
   - Solo Admin e Owner dell'organizzazione
   - Super Admin

### Upload Sicuro

- **Validazione MIME type**: Verifica tipo file reale
- **Limite dimensione**: Max 10MB per file
- **Sanitizzazione filename**: Rimozione caratteri pericolosi
- **Scansione antivirus**: (Raccomandato in produzione)

## 💡 Best Practices

1. **Categorizzazione**: Usa categorie consistenti per facilitare ricerca
2. **Naming**: Nomi descrittivi con anno/versione
3. **Tags**: Usa tags per ricerca avanzata
4. **Descrizioni**: Aggiungi sempre descrizioni dettagliate
5. **Versioning**: Carica nuove versioni invece di sovrascrivere
6. **Backup**: Implementa backup automatico documenti critici

## 🎯 Use Cases

### 1. Archivio Legale
```javascript
// Tutti i documenti legali pubblici
const legalDocs = documents.filter(doc => 
  ['statuto', 'certificato', 'regolamento'].includes(doc.category) &&
  doc.isPublic
);
```

### 2. Trasparenza Finanziaria
```javascript
// Bilanci pubblici ultimi 5 anni
const currentYear = new Date().getFullYear();
const publicFinancials = documents.filter(doc =>
  doc.category === 'bilancio' &&
  doc.isPublic &&
  doc.year >= currentYear - 5
);
```

### 3. Gestione Verbali
```javascript
// Verbali assemblee ordinati per data
const meetingMinutes = documents
  .filter(doc => doc.category === 'verbale')
  .sort((a, b) => b.year - a.year || 
    new Date(b.createdAt) - new Date(a.createdAt)
  );
```

### 4. Compliance Check
```javascript
// Verifica documenti obbligatori
const requiredDocs = ['statuto', 'certificato'];
const compliance = requiredDocs.map(category => ({
  category,
  present: documents.some(doc => 
    doc.category === category && 
    doc.year === currentYear
  )
}));
```

## 📊 Analytics

### Storage Usage
```javascript
// Calcola spazio utilizzato
const totalSize = documents.reduce((sum, doc) => 
  sum + (doc.fileSize || 0), 0
);
const totalSizeMB = (totalSize / 1024 / 1024).toFixed(2);
```

### Upload Activity
```javascript
// Upload per mese
const uploadsByMonth = documents.reduce((acc, doc) => {
  const month = new Date(doc.createdAt).toISOString().slice(0, 7);
  acc[month] = (acc[month] || 0) + 1;
  return acc;
}, {});
```

## 🔧 Manutenzione

### Pulizia File Orfani
```javascript
// Identifica file senza record DB
// Da eseguire periodicamente via cron
const cleanupOrphanFiles = async () => {
  const dbFiles = await getDocumentFilenames();
  const diskFiles = await fs.readdir(uploadPath);
  
  const orphans = diskFiles.filter(file => 
    !dbFiles.includes(file)
  );
  
  // Log e rimuovi file orfani
};
```

### Archiviazione
```javascript
// Archivia documenti vecchi
const archiveOldDocuments = async () => {
  const cutoffDate = new Date();
  cutoffDate.setFullYear(cutoffDate.getFullYear() - 7);
  
  const toArchive = documents.filter(doc =>
    new Date(doc.createdAt) < cutoffDate
  );
  
  // Sposta in storage a lungo termine
};
```

## 📝 Note Implementazione

1. **Transazioni**: Upload atomico (file + DB record)
2. **Streaming**: Download usa streaming per file grandi
3. **Cache Headers**: Documenti pubblici sono cacheable
4. **Virus Scan**: Raccomandato per upload pubblici
5. **CDN**: Considera CDN per documenti pubblici frequenti
6. **Backup**: Implementa backup incrementale giornaliero
