<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Production Infrastructure Stack
- **Hosting & Compute**: Vercel Serverless Platform (`https://freyafna.com` and `https://www.freyafna.com`).
- **Database**: Neon Serverless PostgreSQL (`@neondatabase/serverless` with WebSocket connection pooling).
- **Transactional Email**: Resend SMTP (`smtp.resend.com`) for 48-Hour VIP Strategy Brief dispatch.
- **Source Control & CI/CD**: GitHub (`ronaldoamadorgonzales/freyafna.git`) with automatic Vercel deployments on `main`.

# Git & Deployment Workflow
- The `main` branch is connected to Vercel production (`https://freyafna.com`).
- Never make direct commits or push untested code to `main`.
- All new features and bug fixes MUST be developed on dedicated branches (`feat/...`, `fix/...`, or `docs/...`).
- Run full test suite (`npm test`) and production build verification (`npm run build`) before merging to `main`.
- Confirm changes with user before pushing to `main`.

