# Stockeyfy Authentication

A production-oriented authentication foundation for an inventory management
system. This repository intentionally contains authentication and account
security only—there are no inventory, reporting, AI, or dashboard business
features.

## Stack

- Next.js 16.2 App Router and React 19
- TypeScript and Tailwind CSS 4
- Auth.js 5 (`next-auth@beta`) with Credentials and Prisma adapters
- Prisma ORM 7 and PostgreSQL
- React Hook Form and Zod
- bcrypt, Nodemailer, Sonner, and Lucide React

The installed project is on Next.js 16, so route interception uses `proxy.ts`
(the Next.js 16 replacement for `middleware.ts`).

## Included flows

- Registration with strong password validation, duplicate prevention, bcrypt
  hashing, default `USER` role, and email verification
- Credentials sign-in with verified-email enforcement, remember-me sessions,
  loading/error states, and safe callback redirects
- Encrypted HTTP-only Auth.js JWT sessions with database-backed session-version
  revocation
- Forgot/reset password with generic anti-enumeration responses, hashed
  single-use tokens, expiry, and password-change notifications
- Email verification and generic resend behavior with expiring, hashed tokens
- Authenticated profile updates, email re-verification, password changes, and
  account/verification status
- Protected `/dashboard`, `/profile`, `/settings`, and `/change-password`
  routes; authenticated users are redirected away from auth pages
- Database-backed rate limiting for public authentication actions
- Same-origin enforcement for custom JSON mutations and Auth.js CSRF protection
  for native Auth.js endpoints
- Responsive, accessible, dark-mode-first UI and HTML email templates

## Brand system

Stockeyfy uses a dark navy foundation with blue interaction states:

- Primary: `#2563EB`
- Background: `#0F172A`
- Secondary background: `#1E293B`
- Accent: `#60A5FA`
- Text: `#F8FAFC`
- Borders: `#334155`

## Local setup

### 1. Prerequisites

- Node.js 20.19 or newer
- A Neon Postgres project
- An SMTP account that supports authenticated sending

### 2. Install packages

```bash
npm install
```

### 3. Configure the environment

Copy `.env.example` to `.env` and replace every example value:

```powershell
Copy-Item .env.example .env
```

Generate the Auth.js encryption secret:

```bash
npx auth secret
```

If the command writes to `.env.local`, either keep it there or copy
`AUTH_SECRET` into `.env`. `AUTH_SECRET` must be at least 32 random characters.

Required variables:

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Pooled Neon Postgres URL with `sslmode=verify-full` |
| `DATABASE_POOL_MAX` | Per-instance PostgreSQL pool cap (defaults to 5) |
| `PERFORMANCE_LOGGING` | Opts in to verbose query/request timing logs (`false` by default) |
| `AUTH_SECRET` | Auth.js token encryption secret |
| `AUTH_URL` | Canonical application origin |
| `APP_URL` | Origin used in transactional email links |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_SECURE` | SMTP connection |
| `SMTP_USER` / `SMTP_PASSWORD` | SMTP credentials |
| `SMTP_FROM_EMAIL` / `SMTP_FROM_NAME` | Sender identity |

For local SMTP on port 587, `SMTP_SECURE=false` is typical. For implicit TLS on
port 465, use `SMTP_SECURE=true`.

In the Neon Console, open your project, select **Connect**, enable the pooled
connection option, and copy the resulting URL into `DATABASE_URL`. The host in
that URL contains `-pooler` and ends in `.neon.tech`. Keep this value private;
the repository already ignores `.env` files. Use `sslmode=verify-full` and keep
`channel_binding=require` so the driver verifies both the server certificate
and the authenticated TLS channel. Keep the application and Neon database in
the same region for low request latency.

### 4. Apply the database migration

For a development database:

```bash
npm run db:migrate
npm run prisma:generate
```

For production or CI:

```bash
npm run db:deploy
npm run prisma:generate
```

The checked-in migration creates the Auth.js models, user security fields,
password-reset tokens, verification tokens, indexes, constraints, and
database-backed authentication rate-limit state.

### 5. Run the application

```bash
npm run dev
```

Open `http://localhost:3000/register`.

## Commands

```bash
npm run dev
npm run lint
npm run typecheck
npm run prisma:validate
npm run prisma:generate
npm run build
npm run db:migrate
npm run db:deploy
```

## API surface

Custom JSON endpoints return either:

```json
{
  "success": true,
  "message": "Human-readable result",
  "data": {}
}
```

or:

```json
{
  "success": false,
  "error": {
    "code": "STABLE_ERROR_CODE",
    "message": "Safe user-facing message",
    "fieldErrors": {}
  }
}
```

Authentication endpoints:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `POST /api/auth/verify-email`
- `POST /api/auth/resend-verification`
- `POST /api/auth/change-password`
- `GET|PATCH /api/auth/profile`
- Auth.js standard endpoints under `/api/auth/*`, including session and CSRF

## Production checklist

- Serve only over HTTPS and use HTTPS values for `AUTH_URL` and `APP_URL`.
- Store secrets in the deployment platform’s encrypted secret manager; never
  commit `.env`.
- Run `npm run db:deploy` during deployment and `npm run prisma:generate`
  before `npm run build`.
- Configure SMTP SPF, DKIM, and DMARC, and monitor delivery failures.
- Ensure the reverse proxy overwrites trusted `X-Forwarded-For`,
  `X-Forwarded-Host`, and `X-Forwarded-Proto` headers.
- Schedule deletion of expired `VerificationToken`, `PasswordResetToken`,
  `Session`, and `AuthRateLimit` rows according to your retention policy.
- Monitor server error event IDs without logging passwords, raw tokens, or
  authentication cookies.
- Back up PostgreSQL and test restore and password-recovery flows before launch.

## Session design

Auth.js Credentials requires JWT sessions. The session cookie is encrypted,
HTTP-only, SameSite=Lax, and Secure in production. An unchecked remember-me
option creates a browser-session cookie with a 24-hour logical limit; checked
sessions persist for up to 30 days. Protected server access also verifies the
current user status, email verification, expiry, and `sessionVersion` against
PostgreSQL. Password or email changes increment that version, invalidating
previous sessions even if an old encrypted cookie still exists.
