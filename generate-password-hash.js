#!/usr/bin/env node

const bcrypt = require('bcryptjs');

async function generateHash() {
  const password = 'superadmin123456';
  const hash = await bcrypt.hash(password, 10);
  console.log('Password:', password);
  console.log('Hash:', hash);
  
  // Test the hash
  const isValid = await bcrypt.compare(password, hash);
  console.log('Validation test:', isValid ? 'PASSED' : 'FAILED');
}

generateHash().catch(console.error);
