// Patch per forzare selezione organizzazione per utenti multi-org
import fs from 'fs';
import path from 'path';

const authServicePath = path.join(process.cwd(), 'src/services/auth.service.ts');
let content = fs.readFileSync(authServicePath, 'utf8');

// Trova la sezione che gestisce multiple organizations
const multiOrgSection = content.indexOf('} else if (user.userOrganizations.length > 1) {');
const endSection = content.indexOf('} else {', multiOrgSection);

if (multiOrgSection > -1 && endSection > -1) {
  const beforeSection = content.substring(0, multiOrgSection);
  const afterSection = content.substring(endSection);
  
  // Nuova logica: sempre mostra selezione per utenti multi-org
  const newSection = `} else if (user.userOrganizations.length > 1) {
      // Multiple organizations - ALWAYS show selection
      return {
        requiresOrganizationSelection: true,
        organizations: user.userOrganizations.map(uo => ({
          id: uo.organization.id,
          name: uo.organization.name,
          subdomain: uo.organization.subdomain,
          role: uo.role.name,
          isDefault: uo.isDefault // Include default flag for UI
        }))
      };`;
  
  content = beforeSection + newSection + afterSection;
  
  fs.writeFileSync(authServicePath, content);
  console.log('✅ Auth service modificato per forzare selezione per utenti multi-org');
  console.log('🔄 Riavvia il backend per applicare le modifiche');
} else {
  console.error('❌ Non riesco a trovare la sezione da modificare');
}
