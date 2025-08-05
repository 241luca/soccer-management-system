# 🏢 Anagrafica Società - Feature Documentation

## Overview

Il modulo Anagrafica Società fornisce una gestione completa di tutti i dati relativi alle organizzazioni sportive, inclusi dati legali, fiscali, dirigenza, sponsor, staff, maglie e documenti.

## 🎯 Obiettivi

1. **Centralizzazione Dati**: Tutti i dati societari in un unico posto
2. **Compliance**: Gestione documenti legali e fiscali
3. **Trasparenza**: Documenti pubblici accessibili
4. **E-commerce**: Integrazione shop online per maglie
5. **Gestione Sponsor**: Tracking sponsor e revenue
6. **Staff Management**: Gestione personale con compensi

## 📋 Funzionalità Principali

### 1. Dati Societari Completi

#### Informazioni Base
- Nome completo e abbreviato
- Logo e colori sociali
- Anno di fondazione
- Codice società

#### Sede e Contatti
- Indirizzo completo
- Telefono, email, sito web
- Social media links

#### Dati Fiscali
- Codice Fiscale
- Partita IVA
- IBAN e banca
- Numero affiliazione federale

#### Dirigenza
- Presidente (nome, email, telefono)
- Segretario (nome, email, telefono)

### 2. Gestione Sponsor

#### Tipi di Sponsor
- **Main Sponsor**: Sponsor principale
- **Technical Sponsor**: Fornitore tecnico
- **Gold/Silver/Bronze**: Livelli di partnership
- **Partner**: Partner commerciali

#### Funzionalità
- Contratti con date inizio/fine
- Importi annuali
- Visibilità (maglia, stadio, web, eventi)
- Logo e contatti
- Report revenue totale

### 3. Gestione Staff

#### Ruoli Staff
- Allenatori (head, assistant, goalkeeper)
- Preparatori atletici
- Staff medico (medici, fisioterapisti)
- Dirigenti e scout
- Personale supporto

#### Gestione Compensi
- Stipendi e tipo contratto
- Frequenza pagamenti
- Qualifiche e certificazioni
- Date inizio/fine rapporto

### 4. Team Kits (Maglie)

#### Gestione Divise
- Maglie per stagione (home, away, third, goalkeeper)
- Colori e pattern
- Sponsor e manufacturer

#### E-commerce Integration
- Link shop online
- Prezzi e taglie disponibili
- Link merchandising

### 5. Documenti Societari

#### Categorie Documenti
- Statuti e atti costitutivi
- Bilanci (consuntivi/preventivi)
- Verbali assemblee
- Certificazioni CONI/federali
- Regolamenti interni
- Contratti e convenzioni

#### Funzionalità
- Upload sicuro (max 10MB)
- Documenti pubblici/privati
- Categorizzazione e tags
- Download controllato
- Ricerca avanzata

## 🖥️ Interfaccia Utente

### Dashboard Anagrafica

```
┌─────────────────────────────────────────────────────────┐
│  🏢 Anagrafica Società - ASD Ravenna Calcio            │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  [Tab Menu]                                             │
│  ┌──────────┬──────────┬─────────┬──────────┬────────┐│
│  │ Generale │ Contatti │ Fiscale │ Dirigenza│ Social ││
│  ├──────────┼──────────┼─────────┼──────────┼────────┤│
│  │ Sponsor  │  Staff   │ Maglie  │Documenti │ Venues ││
│  └──────────┴──────────┴─────────┴──────────┴────────┘│
│                                                         │
│  [Content Area - Dynamic based on selected tab]        │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Tab Generale
- Form con dati base società
- Upload logo
- Selezione colori con preview
- Descrizione e note

### Tab Sponsor
- Lista sponsor con cards
- Summary statistiche (totale, per tipo, revenue)
- Azioni: aggiungi, modifica, elimina
- Filtri per tipo e stato

### Tab Staff
- Tabella staff con ruoli e team
- Indicatori compensi (per admin)
- Filtri per ruolo e team
- Export lista staff

### Tab Maglie
- Grid visuale maglie per stagione
- Preview colori e pattern
- Link shop per acquisto
- Gestione taglie disponibili

### Tab Documenti
- Lista documenti con icone tipo file
- Indicatore pubblico/privato
- Upload drag & drop
- Filtri per categoria e anno

## 🔐 Permessi e Ruoli

### Visualizzazione

| Ruolo | Dati Base | Fiscale | Sponsor | Staff | Compensi | Documenti |
|-------|-----------|---------|---------|-------|----------|-----------|
| Super Admin | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Owner | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Admin | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Staff | ✅ | ❌ | ✅ | ✅ | ❌ | Pubblici |
| Coach | ✅ | ❌ | ✅ | ✅ | ❌ | Pubblici |

### Modifica

| Ruolo | Può Modificare |
|-------|----------------|
| Super Admin | Tutto |
| Owner | Tutto nella propria org |
| Admin | Tutto nella propria org |
| Altri | Nessuna modifica |

## 💾 Struttura Dati

### Organization (Extended)
```typescript
interface Organization {
  // Base
  id: string;
  name: string;
  code: string;
  logoUrl?: string;
  
  // Anagrafica
  fullName?: string;
  address?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  country?: string;
  
  // Contatti
  phone?: string;
  email?: string;
  website?: string;
  
  // Fiscale
  fiscalCode?: string;
  vatNumber?: string;
  iban?: string;
  bankName?: string;
  
  // Sport
  foundedYear?: number;
  federationNumber?: string;
  primaryColor?: string;
  secondaryColor?: string;
  
  // Dirigenza
  presidentName?: string;
  presidentEmail?: string;
  presidentPhone?: string;
  secretaryName?: string;
  secretaryEmail?: string;
  secretaryPhone?: string;
  
  // Social
  socialFacebook?: string;
  socialInstagram?: string;
  socialTwitter?: string;
  socialYoutube?: string;
  
  // Relations count
  _count: {
    teams: number;
    users: number;
    athletes: number;
    venues: number;
    sponsors: number;
    staffMembers: number;
  };
}
```

### Sponsor
```typescript
interface Sponsor {
  id: string;
  organizationId: string;
  name: string;
  logoUrl?: string;
  website?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  sponsorType: 'main' | 'technical' | 'gold' | 'silver' | 'bronze' | 'partner';
  contractStartDate?: Date;
  contractEndDate?: Date;
  annualAmount?: number;
  description?: string;
  visibility: string[]; // ['jersey', 'website', 'stadium', 'materials', 'events']
  notes?: string;
  isActive: boolean;
}
```

## 🔄 Workflow Operativi

### 1. Onboarding Nuova Società
1. Super Admin crea organizzazione base
2. Owner completa anagrafica
3. Upload logo e documenti obbligatori
4. Configurazione colori e social
5. Aggiunta sponsor iniziali

### 2. Rinnovo Sponsor
1. Alert 60 giorni prima scadenza
2. Negoziazione nuovo contratto
3. Aggiornamento importi e date
4. Comunicazione a staff marketing

### 3. Aggiornamento Stagionale
1. Nuove maglie per stagione
2. Aggiornamento staff tecnico
3. Rinnovo documenti federali
4. Aggiornamento bilanci

## 📊 Report e Analytics

### Report Disponibili
1. **Sponsor Revenue**: Totale entrate da sponsor
2. **Staff Costs**: Costi personale per ruolo
3. **Document Compliance**: Stato documenti obbligatori
4. **Kit Sales**: Link vendite maglie (da shop)

### KPI Principali
- Valore totale sponsor attivi
- Numero documenti scaduti/in scadenza
- Costo medio staff per ruolo
- Completezza dati anagrafica (%)

## 🚀 Roadmap Futura

### Phase 1 (Completata)
- ✅ CRUD completo anagrafica
- ✅ Gestione sponsor
- ✅ Staff con compensi
- ✅ Maglie e-commerce ready
- ✅ Upload documenti

### Phase 2 (Pianificata)
- 📅 Gestione venues/impianti
- 📅 Storia societaria timeline
- 📅 Integrazione shop e-commerce
- 📅 Gallery foto/video
- 📅 Organigramma interattivo

### Phase 3 (Futura)
- 🔮 Firma digitale documenti
- 🔮 Notifiche scadenze automatiche
- 🔮 Integrazione PEC
- 🔮 Backup automatico documenti
- 🔮 OCR per estrazione dati

## 🛠️ Configurazione

### Variabili Ambiente
```bash
# Upload settings
UPLOAD_MAX_SIZE=10485760  # 10MB in bytes
UPLOAD_PATH=./uploads/documents/organizations

# Storage
STORAGE_TYPE=local  # local | s3 | azure
STORAGE_BUCKET=soccer-docs

# Features flags
ENABLE_PUBLIC_DOCS=true
ENABLE_SPONSOR_MODULE=true
ENABLE_ECOMMERCE_LINKS=true
```

### Configurazione Iniziale

1. **Categorie Documenti**
   ```sql
   -- Personalizza categorie per organizzazione
   INSERT INTO document_categories (org_id, name, is_required)
   VALUES 
     (org_id, 'statuto', true),
     (org_id, 'certificato_coni', true),
     (org_id, 'bilancio', false);
   ```

2. **Ruoli Staff Default**
   ```sql
   -- Template ruoli per nuove organizzazioni
   INSERT INTO staff_role_templates (name, permissions)
   VALUES
     ('head-coach', '{"view_team", "edit_roster"}'),
     ('team-manager', '{"view_all", "edit_staff"}');
   ```

3. **Validazioni Custom**
   - Codice Fiscale per paese
   - IBAN per paese
   - Formati documento accettati

## 🎨 Customizzazione UI

### Temi Colore
```typescript
// Usa colori società per UI
const theme = {
  primary: organization.primaryColor || '#3B82F6',
  secondary: organization.secondaryColor || '#1E40AF',
  accent: lighten(organization.primaryColor, 0.3)
};
```

### Branding
- Logo in header
- Colori in grafici
- Watermark documenti PDF
- Email signature

### Widget Embeddabili
```html
<!-- Widget sponsor per sito web -->
<iframe 
  src="https://app.soccermanager.com/widget/sponsors/{orgId}"
  width="100%" 
  height="400"
  frameborder="0">
</iframe>

<!-- Widget shop maglie -->
<iframe 
  src="https://app.soccermanager.com/widget/shop/{orgId}"
  width="100%" 
  height="600"
  frameborder="0">
</iframe>
```

## 📱 Mobile Considerations

### App Features
- Visualizzazione documenti offline
- Notifiche push scadenze
- Scanner documenti integrato
- Quick access sponsor contacts

### Responsive Design
- Tab navigation → Dropdown mobile
- Card grid → Stack mobile
- Table → Card view mobile
- Modals → Full screen mobile

## 🔗 Integrazioni

### E-commerce Platforms
- **WooCommerce**: API REST per sync maglie
- **Shopify**: Webhook per disponibilità taglie
- **Custom Shop**: OAuth2 integration

### Accounting Software
- Export sponsor data per fatturazione
- Import bilanci da gestionale
- Sync anagrafica fornitori

### Federation Systems
- Upload documenti a portale FIGC
- Sync tesseramenti
- Download comunicati

### Communication
- Email massive a sponsor
- WhatsApp Business per staff
- Newsletter integration

## 🏆 Best Practices

### Data Management
1. **Backup regolare** documenti critici
2. **Versionamento** per statuti/regolamenti
3. **Audit trail** per modifiche fiscali
4. **Archiviazione** documenti vecchi

### Security
1. **Crittografia** documenti sensibili
2. **2FA** per accesso dati fiscali
3. **Watermark** su documenti scaricati
4. **Access log** per compliance

### Performance
1. **CDN** per loghi/immagini
2. **Lazy loading** lista documenti
3. **Cache** dati anagrafica (cambiano poco)
4. **Compress** upload immagini

### UX Guidelines
1. **Auto-save** form anagrafica
2. **Inline editing** dove possibile
3. **Bulk actions** per documenti
4. **Smart defaults** per nuovi record

## 📈 Metriche di Successo

### Adoption Metrics
- % organizzazioni con anagrafica completa
- Numero medio sponsor per org
- Documenti caricati per mese
- Utilizzo link e-commerce

### Business Metrics
- Revenue totale da sponsor
- Costo medio staff
- Tempo completamento anagrafica
- Documenti scaduti/totali ratio

### Technical Metrics
- Upload success rate
- Average document size
- Page load time anagrafica
- API response time

## 🚨 Troubleshooting

### Problemi Comuni

#### Upload Documenti Fallisce
```bash
# Check permissions
ls -la uploads/documents/organizations/

# Check disk space
df -h

# Check file size limit
grep upload_max /etc/nginx/nginx.conf
```

#### Validazione IBAN Fallisce
```javascript
// Test IBAN validator
const testIBAN = 'IT60X0542811101000000123456';
const isValid = /^IT\d{2}[A-Z]\d{22}$/.test(testIBAN);
console.log('IBAN valido:', isValid);
```

#### Sponsor Summary Errato
```sql
-- Check sponsor data
SELECT 
  sponsor_type,
  COUNT(*) as count,
  SUM(annual_amount) as total
FROM sponsors
WHERE 
  organization_id = 'xxx' AND
  is_active = true
GROUP BY sponsor_type;
```

### Performance Issues

#### Slow Document List
```sql
-- Add indexes
CREATE INDEX idx_org_docs_year ON organization_documents(organization_id, year);
CREATE INDEX idx_org_docs_category ON organization_documents(organization_id, category);
```

#### Heavy Organization Details
```javascript
// Use field selection
const lightDetails = await prisma.organization.findUnique({
  where: { id },
  select: {
    // only needed fields
    name: true,
    email: true,
    phone: true
  }
});
```

## 🎓 Training Materials

### Video Tutorials
1. Completare anagrafica società (10 min)
2. Gestire sponsor e contratti (15 min)
3. Caricare documenti ufficiali (8 min)
4. Configurare maglie e shop (12 min)

### Quick Start Guides
- [Anagrafica in 5 minuti](../guides/quick-start-anagrafica.md)
- [Sponsor Management 101](../guides/sponsor-basics.md)
- [Document Best Practices](../guides/document-management.md)

### FAQ

**Q: Posso modificare il codice fiscale dopo la creazione?**
A: Sì, ma solo Admin e Owner possono farlo per motivi di sicurezza.

**Q: Quanti sponsor posso aggiungere?**
A: Non c'è limite al numero di sponsor.

**Q: I documenti sono sicuri?**
A: Sì, sono salvati in modo sicuro e accessibili solo agli autorizzati.

**Q: Posso scaricare tutti i documenti insieme?**
A: Attualmente no, ma è nella roadmap futura.

## 📞 Supporto

### Canali di Supporto
- **Email**: support@soccermanager.com
- **Chat**: In-app chat widget
- **Docs**: https://docs.soccermanager.com
- **Community**: https://community.soccermanager.com

### SLA
- Critical issues: 4 ore
- Major issues: 24 ore  
- Minor issues: 72 ore
- Feature requests: Valutate mensilmente

---

**Ultimo aggiornamento**: Agosto 2025
**Versione**: 2.0.0
**Autore**: Team Development
