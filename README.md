# FreyaFNA — Financial Needs Analysis (FNA) Platform

> **Live Production:** [https://freyafna.com](https://freyafna.com) | [https://www.freyafna.com](https://www.freyafna.com)

A high-conversion financial needs analysis and lead qualification platform built with **Next.js 16 (App Router)**, **React 19**, **TypeScript**, **Tailwind CSS v4**, **Neon PostgreSQL**, **Drizzle ORM**, **Resend**, and containerized **Chromium for PDF generation**.

---

## 🏗️ Production Architecture & Stack

* **Hosting & Compute:** **Vercel** Serverless Platform with automated deployments.
* **Database:** **Neon Serverless PostgreSQL** with `@neondatabase/serverless` WebSocket connection pooling and ACID transaction support.
* **Transactional Email:** **Resend SMTP** (`smtp.resend.com`) delivering 48-Hour VIP Strategy Brief links and advisor notifications.
* **Source Control & CI/CD:** **GitHub** repository (`ronaldoamadorgonzales/freyafna.git`) with automatic Vercel production deployment triggers on `main`.
* **PDF Report Generation:** Serverless Chromium via `@sparticuz/chromium` and `puppeteer-core` with automated binary pack inflation and 60s max execution duration.

---

## 🚀 Local Development

1. **Clone repository:**
   ```bash
   git clone git@github.com:ronaldoamadorgonzales/freyafna.git
   cd fna
   ```

2. **Environment Variables:**
   Copy `.env.example` to `.env` and fill in your Neon `DATABASE_URL`, `SESSION_SECRET`, and Resend SMTP credentials:
   ```bash
   cp .env.example .env
   ```

3. **Install Dependencies & Start Dev Server:**
   ```bash
   npm install
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing & Verification

```bash
# Run unit and integration tests (Vitest)
npm test

# Verify production build & types
npm run build
```

---

## 🔒 Git & Deployment Workflow

- `main` is linked to Vercel production.
- Develop all features, fixes, and docs on isolated branches (`feat/...`, `fix/...`, or `docs/...`).
- Run `npm test` and `npm run build` prior to merging.
- Confirm changes before pushing to `main`.
