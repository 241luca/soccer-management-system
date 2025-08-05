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
