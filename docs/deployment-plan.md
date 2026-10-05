# FreyaFNA Apex Domain Production Deployment Plan

> **Goal:** Deploy FreyaFNA to a production VPS hosting the apex domain (`https://<my_domain>.com` and `https://www.<my_domain>.com`) with automated SSL, persistent PostgreSQL storage, transactional email delivery, and containerized Chromium for PDF generation.

---

## 1. Architecture Overview

```
[ DNS Provider / Registrar (Cloudflare, Namecheap, GoDaddy, etc.) ]
       │
       ├── A Record: @  ──────► [ VPS Public IP ]
       └── A/CNAME : www ─────► [ VPS Public IP ]
                                       │
                         [ VPS Host (Ubuntu 24.04 / Debian 12) ]
                                       │
                      ┌────────────────┴────────────────┐
                      │  Automatic HTTPS Reverse Proxy  │
                      │  (Caddy / Coolify / Traefik)    │
                      │  Port 80 / 443 (Auto SSL)       │
                      └────────────────┬────────────────┘
                                       │ (internal network)
                                       ▼
                      ┌─────────────────────────────────┐
                      │  FreyaFNA Container (Next.js)   │
                      │  Port 3000                      │
                      │  - Puppeteer + Chromium         │
                      │  - AES-GCM Auth & 48h JWT       │
                      │  - SMTP Engine                  │
                      └────────────────┬────────────────┘
                                       │
                                       ▼
                      ┌─────────────────────────────────┐
                      │  PostgreSQL 16 Container        │
                      │  Persistent Docker Named Volume │
                      └─────────────────────────────────┘
```

---

## 2. Pre-Deployment: GitHub Sync Checklist

Ensure all current local features are committed and pushed to your personal GitHub repository:

- [ ] **Remote URL:** `https://github.com/ronaldoamadorgonzales/freyafna.git`
- [ ] **Git Author:** `Ronald Gonzales <ronaldoamadorgonzales@gmail.com>`
- [ ] **Staging & Commit:** Stage all modified routes, tests, seed scripts, schema updates, and UI components.
- [ ] **Push to Main:** `git push origin main`

---

## 3. Step-by-Step Deployment Guide

### Phase 1: DNS Configuration (At your Domain Registrar)

When you purchase your domain, create the following DNS records pointing directly to your VPS IP address:

| Type | Name / Host | Target / Value | TTL | Note |
| :--- | :--- | :--- | :--- | :--- |
| **A** | `@` (apex) | `YOUR_VPS_IP` | Auto / 300s | Routes `https://<my_domain>.com` |
| **A** *(or CNAME)* | `www` | `YOUR_VPS_IP` *(or `@`)* | Auto / 300s | Routes `https://www.<my_domain>.com` |

---

### Phase 2: VPS Server Provisioning

1. **VPS Specs:**
   - OS: Ubuntu 24.04 LTS or Debian 12
   - RAM: Minimum 1 GB (2 GB recommended for seamless Docker builds)
   - Disk: 20 GB+ SSD
2. **Initial Server Setup:**
   ```bash
   # Update packages
   sudo apt update && sudo apt upgrade -y

   # Install Docker & Docker Compose Plugin
   curl -fsSL https://get.docker.com | sh
   sudo usermod -aG docker $USER
   ```

---

### Phase 3: Deployment Setup (Docker Compose + Caddy)

Create a dedicated application directory on your VPS:

```bash
mkdir -p /opt/freyafna && cd /opt/freyafna
git clone https://github.com/ronaldoamadorgonzales/freyafna.git .
```

#### 1. Production Environment File (`.env.production`)

```env
# Domain & App URL (Apex domain)
NODE_ENV=production
APP_URL=https://yourdomain.com
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# Database Configuration
POSTGRES_DB=kintsugi_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=YOUR_STRONG_RANDOM_DB_PASSWORD
DATABASE_URL=postgres://postgres:YOUR_STRONG_RANDOM_DB_PASSWORD@postgres:5432/kintsugi_db

# Security Key (Generate with: openssl rand -base64 32)
SESSION_SECRET=YOUR_RANDOM_32_CHAR_SESSION_SECRET

# Transactional Email (Resend / Brevo / SMTP Provider)
SMTP_HOST=smtp.resend.com
SMTP_PORT=587
SMTP_USER=resend
SMTP_PASS=re_your_api_key_here
EMAIL_FROM=FreyaFNA <advisor@yourdomain.com>
```

#### 2. Production Caddyfile (`Caddyfile`)

Caddy handles automatic HTTPS provisioning and redirects `www` to apex domain (or vice versa):

```caddyfile
# Redirect www to apex domain
www.yourdomain.com {
    redir https://yourdomain.com{uri} permanent
}

# Apex Domain
yourdomain.com {
    reverse_proxy app:3000 {
        header_up Host {host}
        header_up X-Real-IP {remote_host}
        header_up X-Forwarded-Proto {scheme}
    }

    # Gzip / Zstandard compression
    encode zstd gzip
}
```

#### 3. Production Docker Compose (`docker-compose.prod.yml`)

```yaml
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: freyafna-app
    restart: always
    env_file:
      - .env.production
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - internal-net

  postgres:
    image: postgres:16-alpine
    container_name: freyafna-db
    restart: always
    environment:
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]
      interval: 5s
      timeout: 5s
      retries: 5
    networks:
      - internal-net

  caddy:
    image: caddy:alpine
    container_name: freyafna-caddy
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile:ro
      - caddy_data:/data
      - caddy_config:/config
    depends_on:
      - app
    networks:
      - internal-net

volumes:
  pgdata:
  caddy_data:
  caddy_config:

networks:
  internal-net:
    driver: bridge
```

---

### Phase 4: Launching & Database Migrations

1. **Start Containers:**
   ```bash
   docker compose -f docker-compose.prod.yml up -d --build
   ```
2. **Run Initial Database Migration / Seed (First Time Only):**
   ```bash
   docker compose -f docker-compose.prod.yml exec app npx tsx lib/db/seed.ts
   ```
3. **Verify Health:**
   ```bash
   docker compose -f docker-compose.prod.yml ps
   curl -I https://yourdomain.com
   ```

---

## 4. Post-Deployment Maintenance

- **Automated Database Backups:**
  Add a simple daily cron job on the VPS:
  ```bash
  # Daily backup at 3:00 AM
  0 3 * * * docker exec freyafna-db pg_dump -U postgres kintsugi_db | gzip > /opt/backups/db_$(date +\%F).sql.gz
  ```
- **Updating with New Git Commits:**
  ```bash
  cd /opt/freyafna
  git pull origin main
  docker compose -f docker-compose.prod.yml up -d --build
  ```
