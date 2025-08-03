// data/configTables.js

export const configTables = {
  positions: {
    name: 'Posizioni Giocatrici',
    description: 'Ruoli delle atlete in campo',
    icon: 'users',
    fields: [
      { key: 'id', label: 'ID', type: 'number', required: true, readonly: true },
      { key: 'name', label: 'Nome Posizione', type: 'text', required: true },
      { key: 'description', label: 'Descrizione', type: 'textarea', required: false },
      { key: 'sortOrder', label: 'Ordine', type: 'number', required: true },
      { key: 'isActive', label: 'Attiva', type: 'boolean', required: true }
    ],
    data: [
      { id: 1, name: 'Portiere', description: 'Ruolo difensivo primario, protezione della porta', sortOrder: 1, isActive: true },
      { id: 2, name: 'Difensore Centrale', description: 'Difesa al centro del campo', sortOrder: 2, isActive: true },
      { id: 3, name: 'Difensore Laterale', description: 'Difesa sui lati del campo', sortOrder: 3, isActive: true },
      { id: 4, name: 'Centrocampista Difensivo', description: 'Mediano davanti alla difesa', sortOrder: 4, isActive: true },
      { id: 5, name: 'Centrocampista Centrale', description: 'Regista al centro del campo', sortOrder: 5, isActive: true },
      { id: 6, name: 'Centrocampista Offensivo', description: 'Trequartista dietro l\'attacco', sortOrder: 6, isActive: true },
      { id: 7, name: 'Ala Destra', description: 'Attaccante esterno destro', sortOrder: 7, isActive: true },
      { id: 8, name: 'Ala Sinistra', description: 'Attaccante esterno sinistro', sortOrder: 8, isActive: true },
      { id: 9, name: 'Punta Centrale', description: 'Attaccante centrale principale', sortOrder: 9, isActive: true }
    ],
    validations: {
      name: { minLength: 2, maxLength: 50 },
      sortOrder: { min: 1, max: 99 }
    }
  },

  documentTypes: {
    name: 'Tipi Documento',
    description: 'Categorie di documenti richiesti',
    icon: 'file-text',
    fields: [
      { key: 'id', label: 'ID', type: 'number', required: true, readonly: true },
      { key: 'name', label: 'Nome Documento', type: 'text', required: true },
      { key: 'required', label: 'Obbligatorio', type: 'boolean', required: true },
      { key: 'validityDays', label: 'Validità (giorni)', type: 'number', required: true },
      { key: 'category', label: 'Categoria', type: 'select', options: ['medical', 'insurance', 'administrative', 'other'], required: true },
      { key: 'isActive', label: 'Attivo', type: 'boolean', required: true }
    ],
    data: [
      { id: 1, name: 'Certificato Medico', required: true, validityDays: 365, category: 'medical', isActive: true },
      { id: 2, name: 'Assicurazione', required: true, validityDays: 365, category: 'insurance', isActive: true },
      { id: 3, name: 'Modulo Iscrizione', required: true, validityDays: 365, category: 'administrative', isActive: true },
      { id: 4, name: 'Liberatoria Foto', required: false, validityDays: 1095, category: 'administrative', isActive: true },
      { id: 5, name: 'Consenso Privacy', required: true, validityDays: 1095, category: 'administrative', isActive: true }
    ],
    validations: {
      name: { minLength: 3, maxLength: 100 },
      validityDays: { min: 1, max: 3650 }
    }
  },

  paymentTypes: {
    name: 'Tipi Pagamento',
    description: 'Categorie di pagamenti e quote',
    icon: 'credit-card',
    fields: [
      { key: 'id', label: 'ID', type: 'number', required: true, readonly: true },
      { key: 'name', label: 'Nome Pagamento', type: 'text', required: true },
      { key: 'amount', label: 'Importo (€)', type: 'number', required: true },
      { key: 'frequency', label: 'Frequenza', type: 'select', options: ['annual', 'monthly', 'quarterly', 'one-time'], required: true },
      { key: 'category', label: 'Categoria', type: 'select', options: ['membership', 'transport', 'equipment', 'events', 'other'], required: true },
      { key: 'isActive', label: 'Attivo', type: 'boolean', required: true }
    ],
    data: [
      { id: 1, name: 'Quota Sociale', amount: 200, frequency: 'annual', category: 'membership', isActive: true },
      { id: 2, name: 'Trasporto Mensile', amount: 30, frequency: 'monthly', category: 'transport', isActive: true },
      { id: 3, name: 'Kit Divise', amount: 80, frequency: 'annual', category: 'equipment', isActive: true },
      { id: 4, name: 'Torneo Estivo', amount: 50, frequency: 'one-time', category: 'events', isActive: true },
      { id: 5, name: 'Assicurazione Extra', amount: 25, frequency: 'annual', category: 'membership', isActive: false }
    ],
    validations: {
      name: { minLength: 3, maxLength: 100 },
      amount: { min: 0, max: 10000 }
    }
  },

  competitionTypes: {
    name: 'Tipi Competizione',
    description: 'Campionati e tornei disponibili',
    icon: 'trophy',
    fields: [
      { key: 'id', label: 'ID', type: 'number', required: true, readonly: true },
      { key: 'name', label: 'Nome Competizione', type: 'text', required: true },
      { key: 'category', label: 'Categoria', type: 'select', options: ['giovanili', 'seniores', 'mista'], required: true },
      { key: 'season', label: 'Stagione', type: 'text', required: true },
      { key: 'startDate', label: 'Data Inizio', type: 'date', required: false },
      { key: 'endDate', label: 'Data Fine', type: 'date', required: false },
      { key: 'isActive', label: 'Attiva', type: 'boolean', required: true }
    ],
    data: [
      { id: 1, name: 'Campionato Regionale Under 15', category: 'giovanili', season: '2024-25', startDate: '2024-09-01', endDate: '2025-05-31', isActive: true },
      { id: 2, name: 'Campionato Regionale Under 17', category: 'giovanili', season: '2024-25', startDate: '2024-09-01', endDate: '2025-05-31', isActive: true },
      { id: 3, name: 'Serie C Regionale', category: 'seniores', season: '2024-25', startDate: '2024-09-01', endDate: '2025-05-31', isActive: true },
      { id: 4, name: 'Coppa Provinciale', category: 'mista', season: '2024-25', startDate: '2024-10-01', endDate: '2025-03-31', isActive: true },
      { id: 5, name: 'Torneo Primavera', category: 'giovanili', season: '2024-25', startDate: '2025-03-01', endDate: '2025-04-30', isActive: false }
    ],
    validations: {
      name: { minLength: 5, maxLength: 150 },
      season: { pattern: /^\d{4}-\d{2}$/ }
    }
  },

  venueTypes: {
    name: 'Tipi Venue',
    description: 'Tipologie di strutture sportive',
    icon: 'map-pin',
    fields: [
      { key: 'id', label: 'ID', type: 'number', required: true, readonly: true },
      { key: 'name', label: 'Nome Venue', type: 'text', required: true },
      { key: 'location', label: 'Località', type: 'text', required: true },
      { key: 'capacity', label: 'Capienza', type: 'number', required: false },
      { key: 'surface', label: 'Superficie', type: 'select', options: ['erba naturale', 'erba sintetica', 'terra', 'indoor'], required: true },
      { key: 'facilities', label: 'Servizi', type: 'text', required: false },
      { key: 'isActive', label: 'Attivo', type: 'boolean', required: true }
    ],
    data: [
      { id: 1, name: 'Centro Sportivo Comunale', location: 'Ravenna Centro', capacity: 500, surface: 'erba naturale', facilities: 'Spogliatoi, Bar, Parcheggio', isActive: true },
      { id: 2, name: 'Campo Sintetico Nord', location: 'Ravenna Nord', capacity: 200, surface: 'erba sintetica', facilities: 'Spogliatoi, Illuminazione', isActive: true },
      { id: 3, name: 'Palazzetto dello Sport', location: 'Centro Città', capacity: 800, surface: 'indoor', facilities: 'Spalti, Riscaldamento, Bar', isActive: true },
      { id: 4, name: 'Campo Allenamento', location: 'Sede Sociale', capacity: 100, surface: 'erba sintetica', facilities: 'Spogliatoi', isActive: true }
    ],
    validations: {
      name: { minLength: 5, maxLength: 100 },
      location: { minLength: 3, maxLength: 100 },
      capacity: { min: 0, max: 50000 }
    }
  },

  transportZones: {
    name: 'Zone Trasporto',
    description: 'Zone geografiche per il trasporto',
    icon: 'map',
    fields: [
      { key: 'id', label: 'ID', type: 'text', required: true, readonly: true },
      { key: 'name', label: 'Nome Zona', type: 'text', required: true },
      { key: 'distance', label: 'Distanza', type: 'text', required: true },
      { key: 'fee', label: 'Tariffa (€)', type: 'number', required: true },
      { key: 'color', label: 'Colore', type: 'select', options: ['green', 'blue', 'yellow', 'orange', 'red', 'purple'], required: true },
      { key: 'isActive', label: 'Attiva', type: 'boolean', required: true }
    ],
    data: [
      { id: 'A', name: 'Centro Città', distance: '0-5km', fee: 30, color: 'green', isActive: true },
      { id: 'B', name: 'Prima Periferia', distance: '5-15km', fee: 45, color: 'blue', isActive: true },
      { id: 'C', name: 'Seconda Periferia', distance: '15-25km', fee: 60, color: 'orange', isActive: true },
      { id: 'D', name: 'Comuni Limitrofi', distance: '25km+', fee: 80, color: 'red', isActive: true }
    ],
    validations: {
      name: { minLength: 3, maxLength: 50 },
      distance: { minLength: 3, maxLength: 20 },
      fee: { min: 0, max: 500 }
    }
  },

  teamCategories: {
    name: 'Categorie Squadre',
    description: 'Definizioni categorie e fasce età',
    icon: 'users',
    fields: [
      { key: 'id', label: 'ID', type: 'number', required: true, readonly: true },
      { key: 'name', label: 'Nome Categoria', type: 'text', required: true },
      { key: 'minAge', label: 'Età Minima', type: 'number', required: true },
      { key: 'maxAge', label: 'Età Massima', type: 'number', required: true },
      { key: 'budget', label: 'Budget (€)', type: 'number', required: false },
      { key: 'season', label: 'Stagione', type: 'text', required: true },
      { key: 'isActive', label: 'Attiva', type: 'boolean', required: true }
    ],
    data: [
      { id: 1, name: 'Under 13', minAge: 11, maxAge: 13, budget: 8000, season: '2024-25', isActive: true },
      { id: 2, name: 'Under 15', minAge: 13, maxAge: 15, budget: 12000, season: '2024-25', isActive: true },
      { id: 3, name: 'Under 17', minAge: 15, maxAge: 17, budget: 15000, season: '2024-25', isActive: true },
      { id: 4, name: 'Under 19', minAge: 17, maxAge: 19, budget: 18000, season: '2024-25', isActive: true },
      { id: 5, name: 'Seniores', minAge: 18, maxAge: 99, budget: 25000, season: '2024-25', isActive: true }
    ],
    validations: {
      name: { minLength: 3, maxLength: 50 },
      minAge: { min: 5, max: 50 },
      maxAge: { min: 5, max: 99 },
      budget: { min: 0, max: 100000 }
    }
  },

  statusTypes: {
    name: 'Stati Sistema',
    description: 'Stati configurabili per moduli',
    icon: 'activity',
    fields: [
      { key: 'id', label: 'ID', type: 'number', required: true, readonly: true },
      { key: 'name', label: 'Nome Stato', type: 'text', required: true },
      { key: 'module', label: 'Modulo', type: 'select', options: ['athletes', 'matches', 'payments', 'documents', 'transport', 'global'], required: true },
      { key: 'color', label: 'Colore', type: 'select', options: ['gray', 'blue', 'green', 'yellow', 'orange', 'red', 'purple'], required: true },
      { key: 'description', label: 'Descrizione', type: 'textarea', required: false },
      { key: 'isActive', label: 'Attivo', type: 'boolean', required: true }
    ],
    data: [
      { id: 1, name: 'Attivo', module: 'global', color: 'green', description: 'Elemento attivo e funzionante', isActive: true },
      { id: 2, name: 'Inattivo', module: 'global', color: 'gray', description: 'Elemento disattivato', isActive: true },
      { id: 3, name: 'In Attesa', module: 'global', color: 'yellow', description: 'In attesa di approvazione o azione', isActive: true },
      { id: 4, name: 'Programmata', module: 'matches', color: 'blue', description: 'Partita programmata', isActive: true },
      { id: 5, name: 'Completata', module: 'matches', color: 'green', description: 'Partita terminata', isActive: true },
      { id: 6, name: 'Annullata', module: 'matches', color: 'red', description: 'Partita annullata', isActive: true },
      { id: 7, name: 'Pagato', module: 'payments', color: 'green', description: 'Pagamento completato', isActive: true },
      { id: 8, name: 'In Sospeso', module: 'payments', color: 'orange', description: 'Pagamento in attesa', isActive: true },
      { id: 9, name: 'Scaduto', module: 'payments', color: 'red', description: 'Pagamento scaduto', isActive: true }
    ],
    validations: {
      name: { minLength: 2, maxLength: 50 }
    }
  }
};

// Helper functions for config tables
export const getConfigTable = (tableName) => {
  return configTables[tableName] || null;
};

export const getAllConfigTables = () => {
  return Object.keys(configTables).map(key => ({
    id: key,
    ...configTables[key]
  }));
};

export const validateConfigRecord = (tableName, record) => {
  const table = getConfigTable(tableName);
  if (!table) return { valid: false, errors: ['Tabella non trovata'] };

  const errors = [];
  
  // Check required fields
  table.fields.forEach(field => {
    if (field.required && (record[field.key] === undefined || record[field.key] === '')) {
      errors.push(`${field.label} è obbligatorio`);
    }
  });

  // Check validations
  if (table.validations) {
    Object.keys(table.validations).forEach(fieldKey => {
      const value = record[fieldKey];
      const validation = table.validations[fieldKey];
      
      if (value !== undefined && value !== '') {
        if (validation.minLength && value.length < validation.minLength) {
          errors.push(`${fieldKey} deve avere almeno ${validation.minLength} caratteri`);
        }
        if (validation.maxLength && value.length > validation.maxLength) {
          errors.push(`${fieldKey} deve avere massimo ${validation.maxLength} caratteri`);
        }
        if (validation.min && value < validation.min) {
          errors.push(`${fieldKey} deve essere almeno ${validation.min}`);
        }
        if (validation.max && value > validation.max) {
          errors.push(`${fieldKey} deve essere massimo ${validation.max}`);
        }
        if (validation.pattern && !validation.pattern.test(value)) {
          errors.push(`${fieldKey} non è nel formato corretto`);
        }
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

export const getNextId = (tableName) => {
  const table = getConfigTable(tableName);
  if (!table || !table.data) return 1;
  
  const ids = table.data.map(record => 
    typeof record.id === 'number' ? record.id : parseInt(record.id) || 0
  );
  
  return Math.max(...ids, 0) + 1;
};
