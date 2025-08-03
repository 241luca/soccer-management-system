# 🔄 Guida Migrazione a Multi-Tenant

Questa guida ti aiuterà a migrare dalla versione 1.0 (single-tenant) alla versione 2.0 (multi-tenant) del Soccer Management System.

## ⚠️ Importante

**SEMPRE fare un backup completo del database prima di iniziare la migrazione!**

```bash
pg_dump -U your_user -d soccer_management > backup_$(date +%Y%m%d_%H%M%S).sql
```

## 📋 Checklist Pre-Migrazione

- [ ] Backup del database completato
- [ ] Ambiente di test disponibile
- [ ] Downtime pianificato comunicato agli utenti
- [ ] Accesso amministrativo al database
- [ ] Versione 2.0 del codice scaricata

## 🚀 Procedura di Migrazione

### Step 1: Preparazione Ambiente

```bash
# Fermare il server
pm2 stop soccer-management # o il tuo processo

# Backup del codice attuale
cp -r soccer-management-system soccer-management-backup

# Aggiornare al nuovo codice
cd soccer-management-system
git pull origin main
git checkout v2.0.0
```

### Step 2: Aggiornamento Dipendenze

```bash
# Backend
cd backend
npm install

# Frontend
cd ..
npm install
```

### Step 3: Migrazione Database

Il sistema include uno script di migrazione automatica che:
- Crea le nuove tabelle necessarie
- Migra i dati esistenti
- Mantiene l'integrità referenziale

```bash
cd backend

# Eseguire le migrazioni Prisma
npm run prisma:migrate deploy

# Eseguire lo script di migrazione dati
npm run migrate:to-multitenant
```

### Step 4: Creazione Organizzazione Default

Lo script di migrazione creerà automaticamente:

1. **Organizzazione Default**
   - Nome: [Nome dalla configurazione precedente]
   - Piano: Pro (può essere modificato)
   - Tutti i dati esistenti saranno assegnati a questa org

2. **Conversione Utenti**
   - Gli admin diventano Owner dell'organizzazione
   - I coach mantengono il ruolo Coach
   - Lo staff mantiene il ruolo Staff

3. **Super Admin**
   - Email: superadmin@yourdomain.com
   - Password: [generata e mostrata durante la migrazione]

### Step 5: Configurazione

Aggiornare il file `.env`:

```env
# Nuove variabili richieste
MULTI_TENANT_ENABLED=true
DEFAULT_ORGANIZATION_DOMAIN=yourdomain.com
SUPER_ADMIN_EMAIL=superadmin@yourdomain.com
```

### Step 6: Test Post-Migrazione

1. **Verificare l'accesso**
   ```bash
   # Avviare il server
   npm run dev
   
   # Testare login con un utente esistente
   curl -X POST http://localhost:3000/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email": "existing@user.com", "password": "password"}'
   ```

2. **Controllare i dati**
   - Verificare che tutti gli atleti siano visibili
   - Controllare che i documenti siano accessibili
   - Verificare i pagamenti e le scadenze

3. **Test delle funzionalità**
   - Creare un nuovo atleta
   - Modificare un team esistente
   - Verificare le notifiche

## 🔧 Risoluzione Problemi

### Errore: "Organization not found"

Se gli utenti ricevono questo errore:

```sql
-- Verificare che tutti gli utenti abbiano un'organizzazione
SELECT u.email, uo.organizationId 
FROM "User" u 
LEFT JOIN "UserOrganization" uo ON u.id = uo.userId 
WHERE uo.organizationId IS NULL;
```

### Errore: "Permission denied"

Verificare i permessi dei ruoli:

```sql
-- Controllare i permessi di un ruolo
SELECT * FROM "Role" WHERE organizationId = 'your-org-id';
```

### Dati mancanti dopo la migrazione

```sql
-- Verificare che tutti i dati abbiano organizationId
SELECT COUNT(*) FROM "Athlete" WHERE organizationId IS NULL;
SELECT COUNT(*) FROM "Team" WHERE organizationId IS NULL;
```

## 📝 Modifiche al Codice Frontend

Se hai personalizzazioni nel frontend, dovrai:

1. **Aggiornare le chiamate API** per includere il contesto organizzazione
2. **Gestire la selezione organizzazione** per utenti multi-org
3. **Aggiornare i permessi** nel frontend

Esempio di modifica API call:

```javascript
// Prima
const response = await fetch('/api/v1/athletes');

// Dopo
const response = await fetch('/api/v1/athletes', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'X-Organization-ID': currentOrgId // se necessario
  }
});
```

## 🔄 Rollback

Se necessario tornare alla versione precedente:

```bash
# Ripristinare il database
psql -U your_user -d soccer_management < backup_file.sql

# Ripristinare il codice
rm -rf soccer-management-system
mv soccer-management-backup soccer-management-system

# Riavviare il server
cd soccer-management-system/backend
npm run dev
```

## ✅ Checklist Post-Migrazione

- [ ] Tutti gli utenti possono effettuare il login
- [ ] I dati storici sono visibili
- [ ] Le funzionalità principali funzionano
- [ ] I report sono generati correttamente
- [ ] Le notifiche email funzionano
- [ ] I permessi sono applicati correttamente
- [ ] Il Super Admin può accedere al pannello globale

## 📞 Supporto

Se riscontri problemi durante la migrazione:

1. Controlla i log del server: `logs/migration.log`
2. Consulta la documentazione: [MULTI-TENANT-SETUP-GUIDE.md](./MULTI-TENANT-SETUP-GUIDE.md)
3. Apri una issue su GitHub
4. Contatta il supporto: support@soccermanager.com

---

**Ricorda**: La migrazione è un processo delicato. Prenditi il tempo necessario e testa accuratamente in un ambiente di staging prima di applicare in produzione.
