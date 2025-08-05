# Issues da risolvere

## 1. Errore 401 - Insufficient permissions su update atleti

**Problema**: Quando un utente con ruolo Admin prova a modificare un atleta, riceve errore 401 "Insufficient permissions"

**Dettagli**:
- User: admin@demosoccerclub.com
- Role: Admin
- Organization: Demo Club (43c973a6-5e20-43af-a295-805f1d7c86b1)
- Endpoint: PUT /api/v1/athletes/:id
- Headers inviate:
  - Authorization: Bearer [token]
  - X-Organization-ID: 43c973a6-5e20-43af-a295-805f1d7c86b1
  - Content-Type: application/json

**Possibili cause**:
1. Il backend non riconosce il ruolo Admin per modificare atleti
2. Manca un permesso specifico nel backend
3. Il token non contiene i permessi corretti
4. L'organizzazione non è associata correttamente all'utente

**Soluzione temporanea**: 
- Aggiunto logging per debug
- Rimozione campi potenzialmente problematici dal payload

**Da fare**:
- Verificare nel backend i permessi del ruolo Admin
- Controllare middleware di autorizzazione
- Verificare che il token JWT contenga i permessi corretti

## 2. API Documenti Atleti non implementate

**Endpoint mancanti**:
- GET /api/v1/athletes/:id/documents
- POST /api/v1/athletes/:id/documents
- DELETE /api/v1/athletes/:id/documents/:docId
- GET /api/v1/athletes/:id/documents/:docId/download

## 3. API Tipi Documento Personalizzati

**Endpoint mancanti**:
- GET /api/v1/organization/document-types
- POST /api/v1/organization/document-types
- DELETE /api/v1/organization/document-types/:id
