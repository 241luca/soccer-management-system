// Script per pulire i dati di sessione dal browser
// Apri la console del browser e incolla questo codice

// Pulisci tutti i dati di sessione
localStorage.removeItem('token');
localStorage.removeItem('user');
localStorage.removeItem('organization');
localStorage.removeItem('refreshToken');

// Pulisci anche eventuali altri dati
localStorage.clear();

console.log('✅ Dati di sessione puliti!');
console.log('🔄 Ricarica la pagina per effettuare un nuovo login');

// Ricarica automaticamente la pagina dopo 1 secondo
setTimeout(() => {
  window.location.reload();
}, 1000);
