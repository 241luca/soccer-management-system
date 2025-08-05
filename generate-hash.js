const bcrypt = require('bcryptjs');

const password = 'superadmin123456';
const saltRounds = 10;

bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err) {
        console.error('Error:', err);
    } else {
        console.log('Password Hash:', hash);
    }
});
