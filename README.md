# Stockeyfy - Enterprise Inventory Management SaaS

A secure, production-grade Inventory Management System and SaaS application built with **Next.js 16 (App Router)**, **React 19**, **Auth.js v5**, **Prisma ORM v7**, **Tailwind CSS v4**, and **PostgreSQL**.

---

> [!IMPORTANT]
> **📖 Public User Guide**
> A beginner-friendly guide to using the Stockeyfy website is available at [`/guide`](/guide).
>
> The guide is public and requires no account or login. It covers account access,
> products, inventory, stock receipts, checkout/sales, settings, and common problems.

---

## Key Features

* **Real-Time Analytics Dashboard**: Live KPI metrics (Total Products, Stock Quantity, Units Sold, Units Received, Low Stock Alerts), 30-day interactive velocity charts, top-selling product rankings, and real-time activity feeds.
* **Continuous Inventory Valuation**: Automatic **Weighted Moving Average Cost (MAC)** recalculation on every stock receipt.
* **Immutable Double-Entry Ledger**: Every stock change is tracked as an auditable `InventoryTransaction` with timestamps, reference IDs, and performer attribution.
* **Guarded Negative Stock Prevention**: Strict application and database-level constraints guarantee stock cannot drop below zero.
* **Safe Archival Engine**: Intelligent soft-archiving preserves complete financial and sales history when products with transactions are deleted.
* **Enterprise Security**: NextAuth v5 credentials engine with bcrypt (12 rounds), database-backed rate limiting, email verification, and instant multi-device session revocation via `sessionVersion`.

---

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | Next.js 16 (App Router) & React 19 |
| **Styling** | Tailwind CSS v4 & Lucide React Icons |
| **Database & ORM** | PostgreSQL & Prisma ORM v7 (`@prisma/adapter-pg`) |
| **Authentication** | Auth.js v5 (`next-auth@beta`) & `@auth/prisma-adapter` |
| **Validation** | Zod Schema Validation & React Hook Form |
| **Email & Notifications** | Nodemailer & Sonner Toaster |

---

## Quick Start

### 1. Prerequisites
* Node.js `v20.19.0+`
* PostgreSQL instance (e.g. Neon, Supabase, Local)
* SMTP credentials (e.g. Resend, SendGrid)

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/your-org/inventory-system.git
cd inventory-system

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env

# Run database migrations & generate Prisma client
npm run db:migrate
npm run prisma:generate

# Start development server
npm run dev
```

* Open `http://localhost:3000/guide` to view the **Public User Guide**.
* Open `http://localhost:3000/register` to create your initial user account.

---

## Available Commands

```bash
npm run dev              # Start local development server (Turbopack)
npm run build            # Compile Next.js production build
npm run start            # Start production server
npm run typecheck        # Run TypeScript compiler checks
npm run lint             # Run ESLint rules
npm run test             # Run unit and integration tests
npm run test:e2e         # Run end-to-end API smoke tests
npm run prisma:generate  # Generate Prisma client
npm run prisma:validate  # Validate Prisma schema
npm run db:migrate       # Apply migrations (development)
npm run db:deploy        # Deploy migrations (production/CI)
```

## Vercel production builds

Use the Next.js preset, `npm install` as the install command, and `npm run build`
as the build command. Use a Prisma-supported Node.js release (20.19+, 22.12+,
or 24.x); the build was verified locally on Node.js 24.18.0.

The Prisma client is generated into `app/generated/prisma`, which is intentionally
ignored by Git. Both `postinstall` and `build` run `prisma generate`, so fresh
deployments and cached installations do not depend on locally generated files.
Generation reads the schema and writes TypeScript; it does not query the database.
Do not override the build command with bare `next build`.

Prisma configuration allows generation without `DATABASE_URL`. Database commands
and runtime queries still require it, and configured remote connections retain
certificate verification. Apply migrations separately with `npm run db:deploy`
using the target database's environment; migrations are not part of `next build`.

The version-specific `allowScripts` policy permits Prisma's Node compatibility
check and CLI schema-engine installation. Bcrypt 6 ships native prebuilds for
Windows and Linux, and unrs-resolver obtains its native binding through an optional
platform dependency. Their install scripts are denied; keep optional dependencies
enabled. These packages remain installed and usable. Reassess this policy when
changing their versions or deployment platform.

### Environment variables

Set production values in Vercel's environment settings. No application secret is
required to generate Prisma Client or complete the build. `APP_URL` should be set
during the build so generated metadata, robots.txt, and sitemap.xml use the public
production origin instead of the localhost fallback.

| Variable | When used | Visibility / requirement |
| --- | --- | --- |
| `APP_URL` | Build and runtime | Public origin in metadata; required by runtime email configuration |
| `DATABASE_URL` | Runtime and database CLI commands | Server secret; PostgreSQL URL with verified TLS in production |
| `DATABASE_POOL_MAX` | Runtime | Optional server setting, 1–20; defaults to 5 |
| `AUTH_SECRET` | Runtime | Server secret, at least 32 characters |
| `AUTH_URL` | Runtime | Server configuration; public application origin, required by email configuration validation |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE` | Runtime email delivery | Required server configuration; `SMTP_SECURE` is `true` or `false` |
| `SMTP_USER`, `SMTP_PASSWORD` | Runtime email delivery | Required server secrets |
| `SMTP_FROM_EMAIL`, `SMTP_FROM_NAME` | Runtime email delivery | Required sender configuration |
| `PERFORMANCE_LOGGING` | Runtime | Optional server flag, defaults to disabled |
| `NODE_ENV` | Build and runtime | Managed by Next.js; controls production cookies, TLS validation, and security headers |
| `SMOKE_BASE_URL` | Manual API smoke script only | Optional test target; defaults to local port 3301 |

The application has no `NEXT_PUBLIC_*` variables. Never put database, authentication,
or SMTP secrets in client components or `next.config.ts`'s `env` option. Auth.js also
supports its standard runtime environment settings, including `AUTH_TRUST_HOST`;
Vercel supplies its platform environment automatically.

Protected pages and API handlers resolve authentication and database data at request
time. Static metadata and icons require no database. The Geist font uses
`next/font/google`, so compilation requires access to Google's font endpoints;
the resulting font assets are served locally by Next.js.

---

## License & Support

Refer to the [Public User Guide](/guide) for step-by-step help using the Stockeyfy website.
