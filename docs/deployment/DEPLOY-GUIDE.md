# 🚀 Deployment Guide

Guida completa per deployare Soccer Management System in produzione.

## 📋 Prerequisiti

- Server Linux (Ubuntu 20.04+ consigliato)
- Node.js 18+
- PostgreSQL 14+
- Nginx (per reverse proxy)
- PM2 (process manager)
- SSL certificate (Let's Encrypt)

## 🏗️ Architettura Consigliata

```
[Client Browser]
      ↓
[Cloudflare CDN]
      ↓
[Nginx Reverse Proxy]
      ↓
[PM2 Process Manager]
   ├── Frontend (Static)
   └── Backend API
      ↓
[PostgreSQL Database]
```

## 📦 Setup Server

### 1. Prepara il Server

```bash
# Update sistema
sudo apt update && sudo apt upgrade -y

# Installa dipendenze
sudo apt install -y curl git nginx postgresql postgresql-contrib

# Installa Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Installa PM2
sudo npm install -g pm2
```

### 2. Setup PostgreSQL

```bash
# Accedi a PostgreSQL
sudo -u postgres psql

# Crea database e utente
CREATE DATABASE soccer_management;
CREATE USER soccer_user WITH ENCRYPTED PASSWORD 'your-secure-password';
GRANT ALL PRIVILEGES ON DATABASE soccer_management TO soccer_user;
\q
```

### 3. Clona Repository

```bash
# Crea directory app
sudo mkdir -p /var/www/soccer-management
sudo chown $USER:$USER /var/www/soccer-management

# Clona repository
cd /var/www
git clone https://github.com/241luca/soccer-management-system.git soccer-management
cd soccer-management
```

## 🔧 Configurazione

### 1. Backend Configuration

```bash
cd backend
cp .env.example .env
nano .env
```

Modifica `.env` con valori production:

```env
NODE_ENV=production
PORT=3000

# Database
DATABASE_URL="postgresql://soccer_user:your-secure-password@localhost:5432/soccer_management"

# JWT Secrets (genera con: openssl rand -base64 32)
JWT_SECRET=your-production-secret-key
JWT_REFRESH_SECRET=your-production-refresh-secret

# CORS
CORS_ORIGIN=https://yourdomain.com

# Altri settaggi...
```

### 2. Build e Setup

```bash
# Backend
cd /var/www/soccer-management/backend
npm install --production
npm run prisma:migrate
npm run build

# Frontend
cd /var/www/soccer-management
npm install
npm run build
```

## 🌐 Nginx Configuration

Crea file di configurazione:

```bash
sudo nano /etc/nginx/sites-available/soccer-management
```

Contenuto:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    
    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    
    # Frontend
    location / {
        root /var/www/soccer-management/dist;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # Backend API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # WebSocket
    location /socket.io {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    # File uploads
    client_max_body_size 10M;
}
```

Abilita sito:

```bash
sudo ln -s /etc/nginx/sites-available/soccer-management /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 🔒 SSL Certificate

```bash
# Installa Certbot
sudo apt install certbot python3-certbot-nginx

# Ottieni certificato
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo systemctl enable certbot.timer
```

## 🚦 PM2 Setup

### 1. Crea ecosystem file

```bash
nano /var/www/soccer-management/ecosystem.config.js
```

```javascript
module.exports = {
  apps: [
    {
      name: 'soccer-backend',
      script: './backend/dist/server.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true
    }
  ]
};
```

### 2. Avvia con PM2

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## 📊 Monitoring

### 1. PM2 Monitoring

```bash
# Status
pm2 status

# Logs
pm2 logs

# Monitoring
pm2 monit
```

### 2. Sistema Monitoring

```bash
# Installa monitoring tools
sudo apt install htop iotop nethogs

# Database monitoring
sudo -u postgres psql -d soccer_management -c "SELECT * FROM pg_stat_activity;"
```

## 🔄 Update Procedure

```bash
#!/bin/bash
# update.sh

cd /var/www/soccer-management

# Backup database
pg_dump soccer_management > backup_$(date +%Y%m%d).sql

# Pull updates
git pull origin main

# Update backend
cd backend
npm install --production
npm run prisma:migrate
npm run build

# Update frontend
cd ..
npm install
npm run build

# Restart services
pm2 restart all

echo "Update completato!"
```

## 🛡️ Security Checklist

- [ ] Firewall configurato (ufw)
- [ ] SSH key-only authentication
- [ ] Fail2ban installato
- [ ] Database backup automatico
- [ ] Monitoring attivo
- [ ] SSL certificate valido
- [ ] Environment variables sicure
- [ ] Rate limiting configurato
- [ ] CORS configurato correttamente
- [ ] Headers di sicurezza (Helmet.js)

## 🐳 Docker Alternative

Per deployment con Docker, vedi [Docker Guide](./DOCKER.md).

## 📱 Scaling

### Vertical Scaling
- Aumenta CPU/RAM del server
- Ottimizza query database
- Abilita caching (Redis)

### Horizontal Scaling
- Load balancer (HAProxy/Nginx)
- Multiple backend instances
- Database replication
- CDN per assets statici

## 🆘 Troubleshooting

### Backend non risponde
```bash
pm2 logs soccer-backend --lines 100
```

### Database connection issues
```bash
sudo -u postgres psql
\l  # Lista database
\du # Lista utenti
```

### Nginx errors
```bash
sudo nginx -t
sudo tail -f /var/log/nginx/error.log
```

### Disk space
```bash
df -h
du -sh /var/www/soccer-management/*
```

## 📞 Supporto

Per assistenza deployment:
- Email: lucamambelli@lmtecnologie.it
- Issues: [GitHub](https://github.com/241luca/soccer-management-system/issues)

---

Buon deployment! 🚀