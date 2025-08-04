// Genera hash per superadmin
const bcrypt = require('bcryptjs');

async function generateHash() {
  const hash = await bcrypt.hash('superadmin123456', 10);
  console.log('Hash for superadmin123456:', hash);
}

generateHash();
