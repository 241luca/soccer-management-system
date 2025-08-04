// Patch temporanea per aggiungere logging di debug
import fs from 'fs';
import path from 'path';

const authServicePath = path.join(process.cwd(), 'src/services/auth.service.ts');
let content = fs.readFileSync(authServicePath, 'utf8');

// Trova il punto dove aggiungere i log
const loginMethodStart = content.indexOf('async login(data: LoginInput) {');
const userCheckPoint = content.indexOf('if (!user) {', loginMethodStart);

// Aggiungi log dopo il caricamento dell'utente
const beforeCheck = content.substring(0, userCheckPoint);
const afterCheck = content.substring(userCheckPoint);

const newContent = beforeCheck + `
    // DEBUG LOG
    console.log('=== LOGIN DEBUG ===');
    console.log('Email:', data.email);
    console.log('User found:', !!user);
    if (user) {
      console.log('User ID:', user.id);
      console.log('UserOrganizations count:', user.userOrganizations.length);
      console.log('UserOrganizations:', user.userOrganizations.map(uo => ({
        orgId: uo.organizationId,
        orgName: uo.organization?.name,
        roleId: uo.roleId,
        isActive: uo.isActive
      })));
    }
    console.log('===================');

    ` + afterCheck;

fs.writeFileSync(authServicePath, newContent);
console.log('✅ Debug logging aggiunto a auth.service.ts');
console.log('🔄 Riavvia il backend per applicare le modifiche');
