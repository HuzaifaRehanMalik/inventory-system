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

---

## License & Support

Refer to the [Public User Guide](/guide) for step-by-step help using the Stockeyfy website.
