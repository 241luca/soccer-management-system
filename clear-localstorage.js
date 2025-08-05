// Script per pulire il localStorage e forzare un fresh login
// Esegui questo nella console del browser

console.log('🧹 Pulizia localStorage in corso...');

// Salva solo il token se presente
const token = localStorage.getItem('token');
const accessToken = localStorage.getItem('accessToken');

// Pulisci tutto
localStorage.clear();

// Ripristina solo i token se presenti
if (token) localStorage.setItem('token', token);
if (accessToken) localStorage.setItem('accessToken', accessToken);

console.log('✅ localStorage pulito!');
console.log('🔄 Ricarica la pagina per fare un login pulito');
