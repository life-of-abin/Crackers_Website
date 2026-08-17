# 🎆 Crackers E-Commerce (`Crackers_Website`)

A modern, high-performance E-Commerce platform built for fireworks and crackers sales using **Next.js 16 (App Router)**, **React 19**, **TypeScript**, **Prisma ORM**, and **Tailwind CSS**.

---

## 🛠️ Softwares & Technologies Used

### **Core Stack**
- **Framework:** [Next.js 16.3.0](https://nextjs.org/) (App Router, Server Actions, API Routes)
- **UI Library:** [React 19.2.8](https://react.dev/) & React DOM 19.2.8
- **Language:** [TypeScript 5](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) & PostCSS (`@tailwindcss/postcss`)

### **Database & ORM**
- **ORM:** [Prisma 7.9.1](https://www.prisma.io/)
- **Database Adapters:** `@prisma/adapter-pg`, PostgreSQL driver (`pg` ^8.23.0), SQLite for local development (`dev.db`)
- **Database Schema:** `prisma/schema.prisma`
- **Seeding:** `prisma/seed.ts`

### **Utilities & Tools**
- **PDF Generation:** [jsPDF](https://github.com/parallax/jsPDF) (for invoice & receipt downloads)
- **Environment Management:** `dotenv`
- **Linting & Code Quality:** ESLint 9 (`eslint-config-next`)
- **Execution Helper:** `tsx` (for running TypeScript scripts directly)

### **Deployment & Hosting**
- **Deployment Platform:** [Netlify](https://www.netlify.com/) (configured via `netlify.toml`)
- **Build Optimization:** Node option `--max-old-space-size=4096` enabled for memory management during builds.

---

## 📁 File System & Directory Structure

```
cracker-ecommerce/
├── 📁 .agents/            # AI Agent skill definitions and configurations
├── 📁 .claude/            # Claude Desktop agent skill integrations
├── 📁 .windsurf/          # Windsurf IDE agent rules and skills
├── 📁 app/                # Next.js App Router root (Pages, Layouts, APIs)
│   ├── 📁 about/          # About Us page
│   ├── 📁 account/        # User Account management
│   ├── 📁 admin/          # Admin Dashboard & Inventory controls
│   ├── 📁 api/            # Serverless API routes (settings, checkout, orders, etc.)
│   ├── 📁 cart/           # Shopping Cart view
│   ├── 📁 category/       # Category filtering & product lists
│   ├── 📁 checkout/       # Checkout workflow
│   ├── 📁 components/     # Reusable UI components (ProductCard, Navbar, Footer, etc.)
│   ├── 📁 contact/        # Contact Us page
│   ├── 📁 faq/            # Frequently Asked Questions
│   ├── 📁 inventory/      # Stock and inventory tracking
│   ├── 📁 lib/            # Shared utilities, Prisma client instance, helper functions
│   ├── 📁 login/          # Authentication & Login view
│   ├── 📁 order-confirmation/ # Post-checkout order status & confirmation
│   ├── 📁 orders/         # Customer order history
│   ├── 📁 products/       # Single product details view
│   ├── 📁 register/       # User registration
│   ├── 📁 shipping/       # Shipping info & policies
│   ├── 📁 track-order/    # Live order tracking page
│   ├── 📄 layout.tsx      # Root Layout wrapper
│   ├── 📄 page.tsx        # Homepage Entrypoint
│   └── 📄 globals.css     # Global styles & Tailwind imports
├── 📁 prisma/             # Database ORM directory
│   ├── 📄 schema.prisma   # Data models (User, Product, Category, Order, Setting, etc.)
│   ├── 📄 seed.ts         # Database seed script for initial product catalog
│   └── 📄 dev.db          # Local SQLite development database
├── 📁 public/             # Static assets (Images, icons, banners, branding)
├── 📁 scripts/            # Database migration & utility scripts
│   ├── 📄 alter-db-schema.ts   # DB schema modifier helper
│   ├── 📄 inspect-db.ts        # Database inspector utility
│   ├── 📄 migrate-categories.ts# Category migration script
│   ├── 📄 sync-db-schema.js    # Schema synchronization helper
│   ├── 📄 test-settings.js     # Settings API verification script
│   └── 📄 update-atom-bomb.ts  # Special product update utility script
├── 📄 .env                # Environment variables (Database URLs, Secret keys)
├── 📄 .gitignore          # Version control ignore definitions
├── 📄 AGENTS.md           # Instructions and rules for AI Coding Agents
├── 📄 CLAUDE.md           # Claude project rules reference
├── 📄 netlify.toml        # Netlify deployment configuration & build commands
├── 📄 next.config.ts      # Next.js configuration
├── 📄 package.json        # NPM dependencies, scripts, and project metadata
├── 📄 postcss.config.mjs  # PostCSS plugin settings for Tailwind CSS
├── 📄 prisma.config.ts    # Prisma CLI & Client configuration
├── 📄 skills-lock.json    # Agent skills locking manifest
└── 📄 tsconfig.json       # TypeScript compiler configuration
```

---

## 🚀 Getting Started

### **1. Prerequisites**
Ensure you have Node.js (v18+ recommended) and `npm` installed.

### **2. Installation**
Install project dependencies:
```bash
npm install
```

### **3. Database Setup & Prisma Generation**
Generate the Prisma client:
```bash
npx prisma generate
```

*(Optional) Seed local database:*
```bash
npx tsx prisma/seed.ts
```

### **4. Start Development Server**
Launch local dev server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📦 Scripts Overview

| Command | Action |
| :--- | :--- |
| `npm run dev` | Runs the Next.js development server |
| `npm run build` | Builds the production bundle |
| `npm run start` | Starts production server |
| `npm run lint` | Runs ESLint checks |
| `npm run postinstall` | Automatically generates Prisma client on dependency install |
| `npx tsx scripts/<script-name>.ts` | Executes custom admin database maintenance scripts |

---

## ☁️ Deployment

This project is configured for deployment on **Netlify** via `netlify.toml`:
- **Build Command:** `npx prisma generate && npm run build`
- **Node Options:** `--max-old-space-size=4096`

