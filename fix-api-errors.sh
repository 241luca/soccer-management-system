#!/bin/bash

echo "🔧 Fix per errori API nel sistema di gestione..."

# 1. Fix per OrganizationDetails - rimuovere campi che potrebbero non essere validi
echo "📝 Aggiornamento OrganizationDetails per filtrare i campi..."

cat > /tmp/organization_details_fix.js << 'EOF'
  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);
      setSuccessMessage('');
      
      // Filtra solo i campi che sono effettivamente modificabili
      const fieldsToUpdate = {
        name: formData.name,
        fullName: formData.fullName,
        description: formData.description,
        address: formData.address,
        city: formData.city,
        province: formData.province,
        postalCode: formData.postalCode,
        country: formData.country,
        phone: formData.phone,
        email: formData.email,
        website: formData.website,
        fiscalCode: formData.fiscalCode,
        vatNumber: formData.vatNumber,
        iban: formData.iban,
        bankName: formData.bankName,
        presidentName: formData.presidentName,
        presidentEmail: formData.presidentEmail,
        presidentPhone: formData.presidentPhone,
        secretaryName: formData.secretaryName,
        secretaryEmail: formData.secretaryEmail,
        secretaryPhone: formData.secretaryPhone,
        primaryColor: formData.primaryColor,
        secondaryColor: formData.secondaryColor,
        socialFacebook: formData.socialFacebook,
        socialInstagram: formData.socialInstagram,
        socialTwitter: formData.socialTwitter,
        socialYoutube: formData.socialYoutube,
        foundedYear: formData.foundedYear ? parseInt(formData.foundedYear) : null,
        federationNumber: formData.federationNumber
      };
      
      // Rimuovi i campi null o undefined
      Object.keys(fieldsToUpdate).forEach(key => {
        if (fieldsToUpdate[key] === null || fieldsToUpdate[key] === undefined || fieldsToUpdate[key] === '') {
          delete fieldsToUpdate[key];
        }
      });
      
      // Se abbiamo un organizationId specifico, usiamolo nell'URL
      const url = organizationId 
        ? `/organizations/${organizationId}/details`
        : '/organizations/current/details';
      
      const options = {};
      
      // Se stiamo modificando un'organizzazione specifica come Super Admin
      // NON inviare X-Organization-ID header
      if (!organizationId) {
        // Solo per l'organizzazione corrente
        const org = localStorage.getItem('organization');
        if (org) {
          const orgData = JSON.parse(org);
          options.headers = {
            'X-Organization-ID': orgData.id
          };
        }
      }
      
      console.log('Saving organization with data:', fieldsToUpdate);
      const response = await api.patch(url, fieldsToUpdate, options);
EOF

echo "✅ Fix per OrganizationDetails completato"

# 2. Fix per assicurarsi che l'organization ID sia sempre presente
echo "📝 Creazione script per verificare organization ID..."

cat > src/utils/ensureOrganizationId.js << 'EOF'
// Utility per assicurarsi che l'organization ID sia sempre presente
export function ensureOrganizationId() {
  const user = localStorage.getItem('user');
  const organization = localStorage.getItem('organization');
  
  if (!organization && user) {
    try {
      const userData = JSON.parse(user);
      if (userData.organizationId) {
        // Crea un oggetto organization minimale
        const minimalOrg = {
          id: userData.organizationId,
          name: 'Organization',
          code: 'ORG'
        };
        localStorage.setItem('organization', JSON.stringify(minimalOrg));
        console.log('Created minimal organization object:', minimalOrg);
      }
    } catch (e) {
      console.error('Error ensuring organization ID:', e);
    }
  }
}
EOF

echo "✅ Utility ensureOrganizationId creata"

# 3. Aggiorna App.jsx per chiamare ensureOrganizationId
echo "📝 Aggiornamento App.jsx..."

# Questo è troppo complesso per sed, facciamolo manualmente
echo "⚠️  NOTA: Aggiungi manualmente in App.jsx dopo la riga 'import { api } from './services/api';"
echo "   import { ensureOrganizationId } from './utils/ensureOrganizationId';"
echo ""
echo "   E nel useEffect iniziale, dopo setUser(userData):"
echo "   ensureOrganizationId();"

echo ""
echo "✅ Fix completato!"
echo ""
echo "🎯 Prossimi passi:"
echo "1. Applica il fix manuale in OrganizationDetails.jsx (sostituisci la funzione handleSave)"
echo "2. Aggiungi l'import e la chiamata a ensureOrganizationId in App.jsx"
echo "3. Riavvia l'applicazione"
