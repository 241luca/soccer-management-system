# 👕 Team Kits API

API per la gestione delle maglie delle squadre con funzionalità e-commerce.

## Endpoints

- [GET /organizations/:orgId/kits](#get-organizationsorgidkits) - Lista maglie
- [GET /kits/:id](#get-kitsid) - Dettagli maglia
- [POST /organizations/:orgId/kits](#post-organizationsorgidkits) - Crea maglia
- [PUT /kits/:id](#put-kitsid) - Aggiorna maglia
- [DELETE /kits/:id](#delete-kitsid) - Disattiva maglia

## GET /organizations/:orgId/kits

Ottiene la lista delle maglie dell'organizzazione.

### Request

```http
GET /api/v1/organizations/43c973a6-5e20-43af-a295-805f1d7c86b1/kits
Authorization: Bearer <token>
```

### Query Parameters

| Parametro | Tipo | Descrizione | Esempio |
|-----------|------|-------------|---------|
| season | string | Filtra per stagione | "2024/2025" |
| kitType | string | Filtra per tipo maglia | "home" |
| teamId | string | Filtra per squadra | UUID team |

### Response

```json
[
  {
    "id": "789e0123-e89b-12d3-a456-426614174000",
    "organizationId": "43c973a6-5e20-43af-a295-805f1d7c86b1",
    "teamId": "456e7890-e89b-12d3-a456-426614174001",
    "season": "2024/2025",
    "kitType": "home",
    "primaryColor": "#FFD700",
    "secondaryColor": "#8B0000",
    "tertiaryColor": null,
    "pattern": "stripes",
    "manufacturer": "Nike",
    "sponsor": "Banca di Romagna",
    "imageUrl": "/uploads/kits/ravenna-home-2024.jpg",
    "shopUrl": "https://shop.ravennacalcio.it/maglia-home-2024",
    "merchandiseUrl": "https://shop.ravennacalcio.it/merchandising",
    "price": 89.90,
    "availableSizes": ["XS", "S", "M", "L", "XL", "XXL"],
    "isActive": true,
    "team": {
      "id": "456e7890-e89b-12d3-a456-426614174001",
      "name": "Prima Squadra"
    },
    "createdAt": "2024-06-01T10:00:00Z",
    "updatedAt": "2024-07-15T14:30:00Z"
  },
  {
    "id": "890e1234-e89b-12d3-a456-426614174001",
    "teamId": "456e7890-e89b-12d3-a456-426614174001",
    "season": "2024/2025",
    "kitType": "away",
    "primaryColor": "#FFFFFF",
    "secondaryColor": "#FFD700",
    "pattern": "solid",
    "manufacturer": "Nike",
    "price": 89.90,
    "availableSizes": ["S", "M", "L", "XL"],
    "isActive": true,
    "team": {
      "id": "456e7890-e89b-12d3-a456-426614174001",
      "name": "Prima Squadra"
    }
  }
]
```

### Tipi di Maglia

| Tipo | Descrizione |
|------|-------------|
| `home` | Maglia casa |
| `away` | Maglia trasferta |
| `third` | Terza maglia |
| `goalkeeper` | Maglia portiere |

### Pattern Disponibili

| Pattern | Descrizione |
|---------|-------------|
| `solid` | Tinta unita |
| `stripes` | Strisce verticali |
| `hoops` | Strisce orizzontali |
| `checkered` | Scacchi |
| `gradient` | Sfumatura |
| `custom` | Design personalizzato |

## GET /kits/:id

Ottiene i dettagli di una maglia specifica.

### Request

```http
GET /api/v1/kits/789e0123-e89b-12d3-a456-426614174000
Authorization: Bearer <token>
```

### Response

```json
{
  "id": "789e0123-e89b-12d3-a456-426614174000",
  "organizationId": "43c973a6-5e20-43af-a295-805f1d7c86b1",
  "teamId": "456e7890-e89b-12d3-a456-426614174001",
  "season": "2024/2025",
  "kitType": "home",
  "primaryColor": "#FFD700",
  "secondaryColor": "#8B0000",
  "tertiaryColor": null,
  "pattern": "stripes",
  "manufacturer": "Nike",
  "sponsor": "Banca di Romagna",
  "imageUrl": "/uploads/kits/ravenna-home-2024.jpg",
  "shopUrl": "https://shop.ravennacalcio.it/maglia-home-2024",
  "merchandiseUrl": "https://shop.ravennacalcio.it/merchandising",
  "price": 89.90,
  "availableSizes": ["XS", "S", "M", "L", "XL", "XXL"],
  "isActive": true,
  "team": {
    "id": "456e7890-e89b-12d3-a456-426614174001",
    "name": "Prima Squadra",
    "category": "PRIMA_SQUADRA",
    "season": "2024"
  },
  "organization": {
    "id": "43c973a6-5e20-43af-a295-805f1d7c86b1",
    "name": "ASD Ravenna Calcio"
  },
  "createdAt": "2024-06-01T10:00:00Z",
  "updatedAt": "2024-07-15T14:30:00Z"
}
```

## POST /organizations/:orgId/kits

Crea una nuova maglia.

### Request

```http
POST /api/v1/organizations/43c973a6-5e20-43af-a295-805f1d7c86b1/kits
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "teamId": "456e7890-e89b-12d3-a456-426614174001",
  "season": "2025/2026",
  "kitType": "home",
  "primaryColor": "#FFD700",
  "secondaryColor": "#000080",
  "pattern": "stripes",
  "manufacturer": "Adidas",
  "sponsor": "Nuovo Sponsor",
  "imageUrl": "/uploads/kits/ravenna-home-2025.jpg",
  "shopUrl": "https://shop.ravennacalcio.it/maglia-home-2025",
  "price": 94.90,
  "availableSizes": ["XS", "S", "M", "L", "XL", "XXL", "3XL"]
}
```

### Campi Richiesti

- `season` - Stagione (es. "2024/2025")
- `kitType` - Tipo maglia (home, away, third, goalkeeper)
- `primaryColor` - Colore principale in hex

### Response

```json
{
  "success": true,
  "data": {
    "id": "901e2345-e89b-12d3-a456-426614174002",
    // Tutti i campi della maglia creata
  }
}
```

## PUT /kits/:id

Aggiorna i dati di una maglia esistente.

### Request

```http
PUT /api/v1/kits/789e0123-e89b-12d3-a456-426614174000
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "price": 79.90,
  "shopUrl": "https://shop.ravennacalcio.it/promo-maglia-home-2024",
  "availableSizes": ["S", "M", "L", "XL"],
  "merchandiseUrl": "https://shop.ravennacalcio.it/merchandising-2024"
}
```

### Validazioni

| Campo | Validazione | Note |
|-------|------------|------|
| kitType | Enum valido | home, away, third, goalkeeper |
| primaryColor | Hex color valido | #RRGGBB |
| secondaryColor | Hex color valido | #RRGGBB |
| price | >= 0 | Decimale con 2 cifre |
| shopUrl | URL valido | https://... |
| merchandiseUrl | URL valido | https://... |
| availableSizes | Array di stringhe | ["S", "M", "L"] |

### Response

```json
{
  "success": true,
  "data": {
    // Maglia aggiornata
  }
}
```

### Error Responses

#### 400 Validation Error
```json
{
  "error": "Validation Error",
  "message": "Invalid shop URL"
}
```

```json
{
  "error": "Validation Error",
  "message": "Price cannot be negative"
}
```

## DELETE /kits/:id

Disattiva una maglia (soft delete).

### Request

```http
DELETE /api/v1/kits/789e0123-e89b-12d3-a456-426614174000
Authorization: Bearer <token>
```

### Response

```json
{
  "success": true,
  "message": "Team kit deactivated successfully"
}
```

## 🛒 Integrazione E-commerce

### Link Shop Online

Le maglie possono avere link diretti per:
- **shopUrl**: Link diretto alla maglia nello shop
- **merchandiseUrl**: Link alla sezione merchandising

### Gestione Taglie

```javascript
// Verifica disponibilità taglie
const availableSizesCount = kit.availableSizes.length;
const isAvailable = availableSizesCount > 0;

// Taglie standard
const standardSizes = ["XS", "S", "M", "L", "XL", "XXL", "3XL"];

// Taglie bambino
const youthSizes = ["3-4Y", "5-6Y", "7-8Y", "9-10Y", "11-12Y", "13-14Y"];
```

### Gestione Prezzi

```javascript
// Calcolo sconti
const originalPrice = 89.90;
const discountedPrice = 79.90;
const discountPercentage = Math.round(
  ((originalPrice - discountedPrice) / originalPrice) * 100
);
```

## 📊 Analytics e Report

### Inventory per Stagione
```javascript
// Conta maglie per stagione corrente
const currentSeason = "2024/2025";
const currentSeasonKits = kits.filter(k => 
  k.season === currentSeason && k.isActive
);

const kitsByType = currentSeasonKits.reduce((acc, kit) => {
  acc[kit.kitType] = (acc[kit.kitType] || 0) + 1;
  return acc;
}, {});
```

### Revenue Tracking
```javascript
// Stima revenue potenziale
const potentialRevenue = kits
  .filter(k => k.isActive && k.price)
  .reduce((total, kit) => {
    // Stima vendite per tipo maglia
    const estimatedSales = {
      'home': 500,
      'away': 300,
      'third': 200,
      'goalkeeper': 50
    };
    const sales = estimatedSales[kit.kitType] || 100;
    return total + (kit.price * sales);
  }, 0);
```

### Analisi Colori
```javascript
// Colori più utilizzati
const colorFrequency = kits.reduce((acc, kit) => {
  acc[kit.primaryColor] = (acc[kit.primaryColor] || 0) + 1;
  if (kit.secondaryColor) {
    acc[kit.secondaryColor] = (acc[kit.secondaryColor] || 0) + 0.5;
  }
  return acc;
}, {});
```

## 🎨 Gestione Design

### Upload Immagini

1. **Prima**: Upload immagine maglia tramite endpoint dedicato
2. **Poi**: Crea/aggiorna record kit con URL immagine

```javascript
// Workflow completo
// 1. Upload immagine
const formData = new FormData();
formData.append('image', file);
const uploadResponse = await fetch('/api/v1/upload/kit-image', {
  method: 'POST',
  body: formData
});
const { imageUrl } = await uploadResponse.json();

// 2. Crea kit con immagine
const kitData = {
  season: "2025/2026",
  kitType: "home",
  primaryColor: "#FFD700",
  imageUrl: imageUrl,
  // altri campi...
};
```

### Preview Colori

```javascript
// Genera preview CSS
const generateKitPreview = (kit) => {
  const styles = {
    background: kit.pattern === 'stripes' 
      ? `repeating-linear-gradient(90deg, ${kit.primaryColor} 0px, ${kit.primaryColor} 10px, ${kit.secondaryColor} 10px, ${kit.secondaryColor} 20px)`
      : kit.pattern === 'hoops'
      ? `repeating-linear-gradient(0deg, ${kit.primaryColor} 0px, ${kit.primaryColor} 20px, ${kit.secondaryColor} 20px, ${kit.secondaryColor} 40px)`
      : kit.primaryColor
  };
  return styles;
};
```

## 🔗 Integrazioni

### Shop Online

```javascript
// Redirect a shop esterno
const redirectToShop = (kit) => {
  if (kit.shopUrl) {
    // Track click analytics
    trackEvent('kit_shop_click', {
      kitId: kit.id,
      season: kit.season,
      type: kit.kitType
    });
    
    window.open(kit.shopUrl, '_blank');
  }
};
```

### QR Code per Stadium Shop

```javascript
// Genera QR code per acquisto rapido allo stadio
const generateQRCode = (kit) => {
  const quickBuyUrl = `${kit.shopUrl}?source=qr&kit=${kit.id}`;
  // Usa libreria QR code per generare immagine
  return generateQR(quickBuyUrl);
};
```

## 💡 Best Practices

1. **Immagini**: Usa immagini ad alta risoluzione (min 800x800px)
2. **Colori**: Usa sempre formato hex completo (#RRGGBB)
3. **Stagioni**: Usa formato consistente (YYYY/YYYY)
4. **Prezzi**: Aggiorna prezzi quando cambiano nel shop
5. **Taglie**: Mantieni aggiornata disponibilità
6. **URL**: Verifica periodicamente che i link shop funzionino

## 🎯 Use Cases

### 1. Catalogo Maglie
```javascript
// Mostra catalogo per tifosi
const catalog = kits
  .filter(k => k.isActive && k.shopUrl)
  .sort((a, b) => {
    // Ordina per stagione desc, poi per tipo
    if (a.season !== b.season) {
      return b.season.localeCompare(a.season);
    }
    const typeOrder = ['home', 'away', 'third', 'goalkeeper'];
    return typeOrder.indexOf(a.kitType) - typeOrder.indexOf(b.kitType);
  });
```

### 2. Gestione Inventario
```javascript
// Alert per taglie esaurite
const lowStockKits = kits.filter(kit => {
  return kit.isActive && 
         kit.availableSizes.length < 3 && 
         kit.availableSizes.length > 0;
});

// Maglie completamente esaurite
const outOfStock = kits.filter(kit => {
  return kit.isActive && kit.availableSizes.length === 0;
});
```

### 3. Storico Maglie
```javascript
// Timeline maglie per anniversari
const kitHistory = kits
  .filter(k => k.teamId === teamId)
  .sort((a, b) => a.season.localeCompare(b.season))
  .map(kit => ({
    season: kit.season,
    type: kit.kitType,
    manufacturer: kit.manufacturer,
    sponsor: kit.sponsor,
    image: kit.imageUrl
  }));
```

### 4. Comparazione Prezzi
```javascript
// Analisi prezzi nel tempo
const priceHistory = kits
  .filter(k => k.kitType === 'home' && k.price)
  .map(k => ({
    season: k.season,
    price: k.price
  }))
  .sort((a, b) => a.season.localeCompare(b.season));

const avgPriceIncrease = // calcola incremento medio annuo
```

## 🏪 Widget E-commerce

### Embed Shop
```html
<!-- Widget per sito web società -->
<div class="kit-shop-widget">
  <img src="{kit.imageUrl}" alt="{kit.season} {kit.kitType}">
  <h3>Maglia {kit.kitType} {kit.season}</h3>
  <p class="price">€{kit.price}</p>
  <p class="sizes">Taglie: {kit.availableSizes.join(', ')}</p>
  <a href="{kit.shopUrl}" class="buy-button">Acquista Ora</a>
</div>
```

### Notifiche Disponibilità
```javascript
// Sistema notifiche per nuove maglie
const notifyNewKit = async (kit) => {
  const notification = {
    type: 'new_kit_available',
    title: `Nuova Maglia ${kit.kitType} ${kit.season}`,
    message: `È ora disponibile nel nostro shop a €${kit.price}`,
    link: kit.shopUrl,
    image: kit.imageUrl
  };
  
  await sendNotificationToFans(notification);
};
```

## 📝 Note Implementazione

1. **Immagini**: Salvate in `/uploads/kits/` con naming convention
2. **Cache**: Le immagini kit sono cacheable (cambiano raramente)
3. **Soft Delete**: I kit non vengono mai cancellati fisicamente
4. **Multi-team**: Ogni kit appartiene a una squadra specifica
5. **Decimal Fields**: I prezzi sono salvati come Decimal nel DB
6. **Array Fields**: `availableSizes` è un array PostgreSQL

## 🔒 Permessi

- **Visualizzazione**: Pubblico (per shop online)
- **Creazione/Modifica/Cancellazione**:
  - Admin dell'organizzazione
  - Owner dell'organizzazione
  - Super Admin

## 🌐 Considerazioni SEO

Per shop online integrato:

1. **URL SEO-friendly**: `/shop/maglia-{kitType}-{season}`
2. **Meta tags**: Includere colori, sponsor, manufacturer
3. **Structured data**: Schema.org Product markup
4. **Alt text**: Descrizioni dettagliate per immagini
