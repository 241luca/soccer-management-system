// Script per generare l'hash corretto della password
// backend/scripts/generate-password-hash.js

import bcrypt from 'bcryptjs';

const passwords = [
  { email: 'demo@soccermanager.com', password: 'demo123456' },
  { email: 'admin@demosoccerclub.com', password: 'admin123' },
  { email: 'superadmin@soccermanager.com', password: 'superadmin123456' }
];

async function generateHashes() {
  console.log('Generating password hashes...\n');
  
  for (const { email, password } of passwords) {
    const hash = await bcrypt.hash(password, 10);
    console.log(`${email}:`);
    console.log(`Password: ${password}`);
    console.log(`Hash: ${hash}`);
    console.log(`SQL: UPDATE "User" SET "passwordHash" = '${hash}' WHERE email = '${email}';`);
    console.log('---');
  }
}

generateHashes();
