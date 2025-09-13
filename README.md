# 💸 Ritchie Invest API (NestJS) 💸

A backend service for Ritchie Invest — the "Duolingo of investing". It powers a mobile learning app (React Native /
Expo) that helps beginners understand and practice financial investment in a fun, progressive, and personalized way.

The platform serves:

- Interactive lessons grouped into chapters
- Gamified learning modules (MCQ, fill‑in‑the‑blank, true/false)
- User progression & XP with investment feature unlocking
- Secure authentication (JWT access + refresh tokens via httpOnly cookies)
- Scheduled market data ingestion (Alpha Vantage)

> Goal: Empower young adults to build financial literacy and confidence—without needing a finance degree.

---

## 🧭 Table of Contents

- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Getting Started (Local)](#-getting-started-local)
- [Environment Variables](#-environment-variables)
- [Database & Migrations](#-database--migrations)
- [Running Tests](#-running-tests)
- [Troubleshooting](#-troubleshooting)
- [Authors](#-authors)

---

## ⚙️ Tech Stack

- Runtime: Node.js (>= 22.16.0)
- Framework: NestJS 11
- Language: TypeScript
- ORM: Prisma (PostgreSQL)
- Auth: @nestjs/jwt + bcryptjs
- Validation: class-validator / class-transformer
- Security: helmet, httpOnly cookies
- Scheduling: @nestjs/schedule + cron
- Documentation: @nestjs/swagger + @scalar/nestjs-api-reference
- Testing: Jest + Supertest
- Package Manager: pnpm (Corepack)

---

## ✅ Prerequisites

- Node.js >= 22.16.0
- pnpm (enable via Corepack: `corepack enable`)
- Docker + Docker Compose (for PostgreSQL)

Optional:

- pgAdmin (included in docker-compose)
- Alpha Vantage API key (for real market data)

---

## 🚀 Getting Started (Local)

1. Clone the repository:

```bash
git clone <repository-url>
cd ritchie-invest-api
```

2. Install dependencies:

```bash
pnpm install
```

3. Copy environment template:

```bash
cp .env.example .env

# Edit values as needed
```

4. Start PostgreSQL (and pgAdmin UI at http://localhost:8080):

```bash
docker compose up -d
```

5. Run database migrations & generate Prisma client:

```bash
pnpx prisma migrate dev
```

6. Start the API (watch mode):

```bash
pnpm start:dev
```

7. Create a superadmin user (optional):

```bash
SUPERADMIN_EMAIL=admin@example.com \
SUPERADMIN_PASSWORD=changeMe123 \
pnpm run cli:bootstrap-superadmin

# Requires both env vars; exits with error if missing.
```

8. Access:

- Health: http://localhost:3000/health
- API Reference UI: http://localhost:3000/reference

---

## 🕵️‍♂️ Environment Variables

Defined in `.env.example` (copy to `.env`).

| Variable                            | Required           | Description                                                                                                   |
|-------------------------------------|--------------------|---------------------------------------------------------------------------------------------------------------|
| DATABASE_URL                        | Yes                | PostgreSQL connection string (includes schema).                                                               |
| ADMIN_APP_BASE_URL                  | Yes                | Allowed CORS origin for admin web app.                                                                        |
| MOBILE_APP_BASE_URL                 | Yes                | Allowed CORS origin for mobile (web preview/Expo).                                                            |
| JWT_ACCESS_SECRET                   | Yes                | Secret for signing access tokens.                                                                             |
| JWT_REFRESH_SECRET                  | Yes                | Secret for signing refresh tokens.                                                                            |
| REFRESH_TOKEN_TTL_MS                | Yes                | Refresh token validity (ms). Default in code: 604800000 (7 days).                                             |
| ALPHA_VANTAGE_API_URL               | Optional           | (Template) Base URL for Alpha Vantage API. NOTE: Code currently expects `ALPHA_VANTAGE_BASE_URL` (see below). |
| ALPHA_VANTAGE_API_KEY               | Optional           | Alpha Vantage API key ("demo" fallback in code).                                                              |
| CRON_UPDATE_TICKERS_HISTORY         | Optional           | Cron expression for ticker history job (default: `0 05 * * *`).                                               |
| LEVEL_REQUIRED_TO_UNLOCK_INVESTMENT | Yes                | Threshold level to unlock investment features.                                                                |
| SUPERADMIN_EMAIL                    | Optional (for CLI) | Email used by superadmin bootstrap script.                                                                    |
| SUPERADMIN_PASSWORD                 | Optional (for CLI) | Password used by superadmin bootstrap script.                                                                 |

Important: The runtime adapter (`AlphaVantageMarketServiceAdapter`) reads `ALPHA_VANTAGE_BASE_URL`, while `.env.example`
defines `ALPHA_VANTAGE_API_URL`. Align these by either renaming the var in your `.env` to `ALPHA_VANTAGE_BASE_URL` or
updating the code/template for consistency.

---

## 🗄️ Database & Migrations

Prisma manages schema evolution.

- Create new migration: `pnpx prisma migrate dev --name <migration_name>`
- Apply existing migrations in CI/Prod: `pnpx prisma migrate deploy`
- Regenerate client after schema changes: `pnpx prisma generate`

---

## 🧪 Running Tests

```bash
pnpm test          # Unit tests (runInBand)
pnpm test:watch    # Watch mode
pnpm test:cov      # Coverage (threshold: global lines >= 80%)
```

Coverage output: `coverage/` (lcov, HTML report, etc.).

---

## 🐛 Troubleshooting

| Issue                               | Hint                                                                                     |
|-------------------------------------|------------------------------------------------------------------------------------------|
| CORS errors                         | Verify `ADMIN_APP_BASE_URL` & `MOBILE_APP_BASE_URL` match requesting origins.            |
| Auth fails                          | Check JWT secrets & refresh token TTL. Clear cookies if mismatch.                        |
| Alpha Vantage returns empty         | Provide a real `ALPHA_VANTAGE_API_KEY`. Confirm env var name (`ALPHA_VANTAGE_BASE_URL`). |
| Migrations not applied in container | Ensure `SKIP_MIGRATIONS=0` (default) and valid `DATABASE_URL`.                           |
| Prisma client errors                | Run `pnpx prisma generate` after schema changes.                                         |

---

## 👤️ Authors

- Maxence BREUILLES ([@MisterAzix](https://github.com/MisterAzix))<br />
- Benoît FAVRIE ([@benoitfvr](https://github.com/benoitfvr))<br />
- Doriane FARAU ([@DFarau](https://github.com/DFarau))<br />
- Charles LAMBRET ([@CharlesLambret](https://github.com/CharlesLambret))<br />
- Antonin CHARPENTIER ([@toutouff](https://github.com/toutouff))