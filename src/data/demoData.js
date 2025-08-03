// data/demoData.js

export const generateDemoData = () => {
  const teams = [
    { id: 1, name: 'Under 15', category: 'Giovanili', players: 28, budget: 15000, minAge: 13, maxAge: 15, season: '2024-25' },
    { id: 2, name: 'Under 17', category: 'Giovanili', players: 30, budget: 18000, minAge: 15, maxAge: 17, season: '2024-25' },
    { id: 3, name: 'Under 19', category: 'Giovanili', players: 32, budget: 20000, minAge: 17, maxAge: 19, season: '2024-25' },
    { id: 4, name: 'Prima Squadra', category: 'Seniores', players: 25, budget: 45000, minAge: 18, maxAge: 99, season: '2024-25' },
    { id: 5, name: 'Seconda Squadra', category: 'Seniores', players: 22, budget: 12000, minAge: 18, maxAge: 99, season: '2024-25' }
  ];

  const zones = [
    { id: 'A', name: 'Centro', distance: '0-5km', monthlyFee: 30, color: 'green' },
    { id: 'B', name: 'Periferia', distance: '5-15km', monthlyFee: 45, color: 'blue' },
    { id: 'C', name: 'Frazioni', distance: '15-25km', monthlyFee: 60, color: 'orange' },
    { id: 'D', name: 'Comuni limitrofi', distance: '25km+', monthlyFee: 80, color: 'red' }
  ];

  const buses = [
    { id: 1, name: 'Pulmino Nord', capacity: 16, route: 'Percorso A-B', driver: 'Mario Rossi', plate: 'AB123CD' },
    { id: 2, name: 'Pulmino Sud', capacity: 20, route: 'Percorso C-D', driver: 'Luigi Bianchi', plate: 'EF456GH' },
    { id: 3, name: 'Pulmino Centro', capacity: 12, route: 'Percorso Centro', driver: 'Anna Verdi', plate: 'IJ789KL' }
  ];

  const athletes = generateAthletes(teams, zones, buses);
  const matches = generateMatches(teams);

  return { teams, athletes, zones, buses, matches };
};

const generateAthletes = (teams, zones, buses) => {
  const athletes = [];
  const positions = ['Portiere', 'Difensore', 'Centrocampista', 'Attaccante'];
  const names = [
    'Sofia Rossi', 'Giulia Bianchi', 'Martina Ferrari', 'Chiara Romano', 'Francesca Ricci',
    'Alessia Marino', 'Federica Greco', 'Valentina Bruno', 'Camilla Gallo', 'Elena Conti',
    'Sara Vitali', 'Giorgia De Luca', 'Alice Mancini', 'Beatrice Lombardi', 'Caterina Moretti',
    'Azzurra Esposito', 'Benedetta Fontana', 'Carlotta Giordano', 'Diletta Longo', 'Emma Marchetti'
  ];

  const addresses = [
    'Via Romea 45, Ravenna RA', 'Via Adriatica 123, Marina di Ravenna RA', 'Via Faenza 67, Ravenna RA',
    'Via Cavour 89, Ravenna RA', 'Via Salara 156, Ravenna RA', 'Via Classe 234, Classe RA',
    'Via Standiana 78, Ravenna RA', 'Via Dismano 445, Ravenna RA', 'Via Reale 12, Cervia RA',
    'Via Nazionale 67, Russi RA', 'Via Europa 89, Lugo RA', 'Via Emilia 234, Faenza RA'
  ];

  teams.forEach(team => {
    for (let i = 0; i < Math.min(team.players, 12); i++) {
      const athleteId = athletes.length + 1;
      const randomName = names[Math.floor(Math.random() * names.length)];
      
      let age;
      if (team.name.includes('Under')) {
        const maxAge = parseInt(team.name.replace('Under ', ''));
        age = Math.max(team.minAge, maxAge - Math.floor(Math.random() * 3));
      } else {
        age = 18 + Math.floor(Math.random() * 12);
      }
      
      const randomZone = zones[Math.floor(Math.random() * zones.length)];
      const useBus = Math.random() > 0.3;
      const randomBus = buses[Math.floor(Math.random() * buses.length)];
      
      const isAgeValid = age >= team.minAge && age <= team.maxAge;
      const needsPromotion = !isAgeValid && age > team.maxAge;
      
      athletes.push({
        id: athleteId,
        name: `${randomName} ${athleteId}`,
        age: age,
        teamId: team.id,
        teamName: team.name,
        position: positions[Math.floor(Math.random() * positions.length)],
        number: Math.floor(Math.random() * 99) + 1,
        medicalExpiry: new Date(2025, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        insuranceExpiry: new Date(2025, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        membershipFee: team.category === 'Seniores' ? 100 : team.category === 'Giovanili' ? 80 : 60,
        feeStatus: Math.random() > 0.2 ? 'paid' : 'pending',
        phone: `+39 ${Math.floor(Math.random() * 900000000) + 100000000}`,
        email: `${randomName.toLowerCase().replace(' ', '.')}${athleteId}@email.com`,
        status: 'active',
        address: addresses[Math.floor(Math.random() * addresses.length)],
        zone: randomZone,
        usesBus: useBus,
        assignedBus: useBus ? randomBus : null,
        busFee: useBus ? randomZone.monthlyFee : 0,
        busFeeStatus: useBus ? (Math.random() > 0.2 ? 'paid' : 'pending') : null,
        latitude: 44.4184 + (Math.random() - 0.5) * 0.1,
        longitude: 12.2035 + (Math.random() - 0.5) * 0.15,
        isAgeValid: isAgeValid,
        needsPromotion: needsPromotion,
        suggestedTeam: needsPromotion ? teams.find(t => age >= t.minAge && age <= t.maxAge)?.name : null,
        gamesPlayed: Math.floor(Math.random() * 10),
        goals: Math.floor(Math.random() * 5),
        yellowCards: Math.floor(Math.random() * 3),
        redCards: Math.floor(Math.random() * 1),
        minutesPlayed: Math.floor(Math.random() * 900),
        documents: [
          {
            id: 1,
            type: 'medical',
            name: 'Certificato Medico Sportivo',
            uploadDate: new Date(2024, 10, 15),
            expiryDate: new Date(2025, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
            status: Math.random() > 0.1 ? 'valid' : 'expired',
            fileSize: '245 KB',
            uploadedBy: 'Segreteria'
          },
          {
            id: 2,
            type: 'insurance',
            name: 'Polizza Assicurativa',
            uploadDate: new Date(2024, 8, 20),
            expiryDate: new Date(2025, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
            status: Math.random() > 0.15 ? 'valid' : 'expiring',
            fileSize: '189 KB',
            uploadedBy: 'Famiglia'
          }
        ],
        payments: generatePayments(athleteId, team, randomZone, useBus)
      });
    }
  });

  return athletes;
};

const generateMatches = (teams) => {
  const matches = [];
  const opponents = ['ASD Rimini FC', 'Forlì Calcio', 'Cesena Women', 'Imola FC', 'Faenza United'];
  
  teams.forEach(team => {
    for (let i = 0; i < 3; i++) {
      const matchDate = new Date(2025, 8 + i, Math.floor(Math.random() * 30) + 1);
      matches.push({
        id: matches.length + 1,
        teamId: team.id,
        teamName: team.name,
        opponent: opponents[Math.floor(Math.random() * opponents.length)],
        date: matchDate,
        time: '15:00',
        venue: Math.random() > 0.5 ? 'Casa' : 'Trasferta',
        competition: team.category === 'Giovanili' ? 'Campionato Giovanile' : 'Serie D',
        status: matchDate < new Date() ? 'completed' : 'scheduled',
        homeGoals: matchDate < new Date() ? Math.floor(Math.random() * 4) : null,
        awayGoals: matchDate < new Date() ? Math.floor(Math.random() * 4) : null
      });
    }
  });

  return matches;
};

const generatePayments = (athleteId, team, zone, usesBus) => {
  const payments = [];
  const methods = ['bank_transfer', 'cash', 'card'];
  const today = new Date();
  
  // Quota associativa annuale
  const membershipAmount = team.category === 'Seniores' ? 120 : 80;
  payments.push({
    id: 1,
    type: 'membership',
    description: 'Quota Associativa 2025',
    amount: membershipAmount,
    dueDate: new Date(2025, 0, 31), // 31 gennaio
    status: Math.random() > 0.1 ? 'paid' : 'pending',
    paidDate: Math.random() > 0.2 ? new Date(2025, 0, 20) : null,
    method: Math.random() > 0.2 ? methods[Math.floor(Math.random() * methods.length)] : null,
    receiptNumber: Math.random() > 0.2 ? `RIC-${2025}0120-${athleteId}` : null
  });
  
  // Quote mensili per i mesi passati e futuri
  const monthlyAmount = team.category === 'Seniores' ? 100 : 80;
  const months = [
    { month: 6, name: 'Luglio', year: 2025 },
    { month: 7, name: 'Agosto', year: 2025 },
    { month: 8, name: 'Settembre', year: 2025 },
    { month: 9, name: 'Ottobre', year: 2025 },
    { month: 10, name: 'Novembre', year: 2025 },
    { month: 11, name: 'Dicembre', year: 2025 }
  ];
  
  months.forEach((monthData, index) => {
    const dueDate = new Date(monthData.year, monthData.month, 15);
    const isPast = dueDate < today;
    const isNear = Math.abs(dueDate - today) < (30 * 24 * 60 * 60 * 1000); // Entro 30 giorni
    
    let status;
    if (isPast) {
      status = Math.random() > 0.15 ? 'paid' : Math.random() > 0.5 ? 'overdue' : 'pending';
    } else if (isNear) {
      status = Math.random() > 0.3 ? 'paid' : 'pending';
    } else {
      status = Math.random() > 0.7 ? 'paid' : 'pending';
    }
    
    payments.push({
      id: payments.length + 1,
      type: 'membership',
      description: `Quota Mensile ${monthData.name} ${monthData.year}`,
      amount: monthlyAmount,
      dueDate: dueDate,
      status: status,
      paidDate: status === 'paid' ? new Date(dueDate.getTime() - Math.random() * 10 * 24 * 60 * 60 * 1000) : null,
      method: status === 'paid' ? methods[Math.floor(Math.random() * methods.length)] : null,
      receiptNumber: status === 'paid' ? `RIC-${monthData.year}${String(monthData.month + 1).padStart(2, '0')}-${athleteId}` : null
    });
  });
  
  // Trasporto (se utilizza il bus)
  if (usesBus && zone) {
    months.forEach((monthData, index) => {
      const dueDate = new Date(monthData.year, monthData.month, 10);
      const isPast = dueDate < today;
      
      let status;
      if (isPast) {
        status = Math.random() > 0.2 ? 'paid' : Math.random() > 0.6 ? 'pending' : 'overdue';
      } else {
        status = Math.random() > 0.5 ? 'paid' : 'pending';
      }
      
      payments.push({
        id: payments.length + 1,
        type: 'transport',
        description: `Trasporto ${monthData.name} ${monthData.year}`,
        amount: zone.monthlyFee,
        dueDate: dueDate,
        status: status,
        paidDate: status === 'paid' ? new Date(dueDate.getTime() - Math.random() * 5 * 24 * 60 * 60 * 1000) : null,
        method: status === 'paid' ? methods[Math.floor(Math.random() * methods.length)] : null,
        receiptNumber: status === 'paid' ? `TRA-${monthData.year}${String(monthData.month + 1).padStart(2, '0')}-${athleteId}` : null
      });
    });
  }
  
  // Equipaggiamento (occasionale)
  if (Math.random() > 0.7) {
    payments.push({
      id: payments.length + 1,
      type: 'equipment',
      description: 'Divisa Ufficiale 2025',
      amount: 45,
      dueDate: new Date(2025, 8, 30), // 30 settembre
      status: Math.random() > 0.4 ? 'paid' : Math.random() > 0.7 ? 'pending' : 'overdue',
      paidDate: Math.random() > 0.6 ? new Date(2025, 8, 25) : null,
      method: Math.random() > 0.6 ? methods[Math.floor(Math.random() * methods.length)] : null,
      receiptNumber: Math.random() > 0.6 ? `EQU-20250925-${athleteId}` : null
    });
  }
  
  // Pagamenti extra (ritiri, tornei, etc.)
  if (Math.random() > 0.6) {
    const extraEvents = [
      { name: 'Ritiro Pre-Campionato', amount: 80, month: 7 },
      { name: 'Torneo di Pasqua', amount: 25, month: 3 },
      { name: 'Festa di Fine Anno', amount: 15, month: 11 }
    ];
    
    const event = extraEvents[Math.floor(Math.random() * extraEvents.length)];
    payments.push({
      id: payments.length + 1,
      type: 'extra',
      description: event.name,
      amount: event.amount,
      dueDate: new Date(2025, event.month, 15),
      status: Math.random() > 0.5 ? 'paid' : 'pending',
      paidDate: Math.random() > 0.7 ? new Date(2025, event.month, 10) : null,
      method: Math.random() > 0.7 ? methods[Math.floor(Math.random() * methods.length)] : null,
      receiptNumber: Math.random() > 0.7 ? `EXT-2025${String(event.month + 1).padStart(2, '0')}-${athleteId}` : null
    });
  }
  
  return payments;
};

export { generateAthletes, generateMatches, generatePayments };