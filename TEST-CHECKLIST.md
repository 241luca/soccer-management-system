# ✅ Checklist Test Multi-Tenant

## 🔐 Test Autenticazione

- [ ] Login con demo@soccermanager.com / demo123456
- [ ] Login con superadmin@soccermanager.com / superadmin123456
- [ ] Logout funziona correttamente
- [ ] Refresh token funziona
- [ ] Errore con credenziali errate

## 🏢 Test Organizzazione

- [ ] Visualizzare info organizzazione corrente
- [ ] Vedere statistiche organizzazione
- [ ] Limiti del piano rispettati
- [ ] Logo e settings organizzazione

## 👥 Test Gestione Utenti

- [ ] Lista utenti dell'organizzazione
- [ ] Invitare nuovo utente
- [ ] Accettare invito
- [ ] Cambiare ruolo utente
- [ ] Rimuovere utente

## 🔒 Test Permessi

- [ ] Owner può fare tutto
- [ ] Admin non può modificare billing
- [ ] Coach può solo gestire team/atleti
- [ ] Staff può solo visualizzare

## 🏃 Test Funzionalità Core

- [ ] Creare nuovo atleta
- [ ] Modificare atleta esistente
- [ ] Creare nuovo team
- [ ] Assegnare atleti al team
- [ ] Upload documenti
- [ ] Notifiche funzionanti

## 🔄 Test Multi-Org (se applicabile)

- [ ] Switch tra organizzazioni
- [ ] Dati isolati tra org
- [ ] Permessi corretti per org

## 🛡️ Test Sicurezza

- [ ] Non posso vedere dati di altre org
- [ ] Token scaduto viene rifiutato
- [ ] Rate limiting funziona
- [ ] Input validation attiva

## 📱 Test Frontend

- [ ] Login page funziona
- [ ] Dashboard mostra dati corretti
- [ ] Navigazione funziona
- [ ] Forms validati correttamente
- [ ] Errori mostrati bene

## 🐛 Bug Trovati

1. _____________________
2. _____________________
3. _____________________

## 📝 Note

_____________________
_____________________
_____________________

---

Testato da: ____________
Data: ____________
Risultato: [ ] PASS [ ] FAIL
