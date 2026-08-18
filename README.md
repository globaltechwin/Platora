# Plotora — Real Estate Plot Management System

A web-based real-estate/plot management system built with Next.js, TypeScript, Tailwind CSS, and Prisma ORM backed by MySQL/TiDB.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **ORM:** Prisma 7 with MariaDB driver adapter
- **Database:** MySQL / TiDB Cloud
- **Charts:** Recharts
- **Icons:** Lucide React

## Features

### Core Modules
- **Sites** — Create, edit, delete sites with plot count tracking
- **Payment Plans** — Full Payment and Installment plans with percentage-based installment templates
- **Plots** — Bulk plot creation, status management, site-wise filtering
- **Customers** — Full customer profiles with lead tracking
- **Agents** — Agent management with commission rates

### Bookings
- 4-step booking wizard (Select Plot → Customer → Payment Plan → Confirm)
- Real-time plot availability checking
- Automatic booking number generation (`BK{YYYY}XXXX`)
- Installment schedule auto-creation from payment plan templates
- Booking cancellation with plot status restoration

### Payments / Collections
- Record payments against bookings (Cash, UPI, Bank Transfer, Cheque)
- Auto-generated receipt numbers (`RCT{YYYY}XXXX`)
- Payment status workflow (Pending → Approved / Rejected)

### Reports
- **Outstanding Report** — Pending/overdue installments with overdue day calculation
- **Collection Report** — Payment receipts with site/agent/mode filters and summary stats
- **Inventory Report** — Plot inventory with status distribution and value calculation
- **Agent Performance** — Booking count, value, commission, and pending commission per agent

### Dashboard
- Live summary cards (sites, plots by status)
- Donut chart for plot status distribution
- Recent bookings table
- Total/pending collection metrics
- Site and date filtering

## Getting Started

### Prerequisites
- Node.js 18+
- MySQL or TiDB Cloud account

### Setup

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials

# Push schema to database
npx prisma db push --config prisma/prisma.config.ts

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Login
- Username: `demosite`
- Password: `demosite`

## Environment Variables

```env
DATABASE_URL="mysql://user:password@host:port/dbname?sslaccept=strict"
```

## Database Schema

9 tables managed by Prisma:

| Table | Description |
|-------|-------------|
| Site | Real estate sites/projects |
| Plot | Individual plots within sites |
| Customer | Buyer profiles |
| Agent | Sales agents with commission rates |
| Booking | Plot bookings linking customer, plot, agent |
| PaymentPlan | Full Payment / Installment templates |
| PlanInstallment | Installment breakdown per plan |
| Payment | Payment receipts against bookings |
| InstallmentSchedule | Per-booking installment tracking |

## API Routes

| Endpoint | Methods | Description |
|----------|---------|-------------|
| `/api/sites` | GET, POST | Sites CRUD |
| `/api/sites/[id]` | GET, PUT, DELETE | Single site |
| `/api/plots` | GET, POST | Plots (bulk create) |
| `/api/plots/[id]` | GET, PUT, DELETE | Single plot |
| `/api/customers` | GET, POST | Customers CRUD |
| `/api/customers/[id]` | GET, PUT, DELETE | Single customer |
| `/api/agents` | GET, POST | Agents CRUD |
| `/api/agents/[id]` | GET, PUT, DELETE | Single agent |
| `/api/bookings` | GET, POST | Bookings (with validation) |
| `/api/bookings/[id]` | GET, PUT, DELETE | Single booking / cancellation |
| `/api/payment-plans` | GET, POST | Payment plans CRUD |
| `/api/payment-plans/[id]` | GET, PUT, DELETE | Single plan |
| `/api/payments` | GET, POST | Payment receipts |
| `/api/payments/[id]` | GET, PUT, DELETE | Single receipt |
| `/api/dashboard` | GET | Dashboard summary data |
| `/api/reports/outstanding` | GET | Outstanding installments |
| `/api/reports/inventory` | GET | Plot inventory |
| `/api/reports/agent-performance` | GET | Agent performance |

## Scripts

```bash
npm run dev      # Development server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # ESLint
```

## License

Private — Global Techwin Projects
