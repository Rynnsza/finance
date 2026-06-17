# Aemy Finance ✦

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Bun](https://img.shields.io/badge/Runtime-Bun-black?logo=bun)](https://bun.sh)
[![Vue](https://img.shields.io/badge/Frontend-Vue_3-4FC08D?logo=vue.js&logoColor=white)](https://vuejs.org)
[![Tailwind CSS v4](https://img.shields.io/badge/Styles-Tailwind_v4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Backend-Supabase-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com)

**Personal & Shared Finance Management — Refined.**

Aemy Finance is a modern, high-performance personal finance application designed for clarity and control. Built with a "Privacy First" mindset, it offers multi-currency support, AI-powered automation, and seamless collaborative tools — all without ads or tracking.

🌐 **Live Demo:** [seaavey.site](https://seaavey.site)

---

## ✨ Core Features

| Feature                    | Technical Description                                                                                          |
| :------------------------- | :------------------------------------------------------------------------------------------------------------- |
| 💰 **Bento Dashboard**     | High-performance dashboard with real-time balance tracking and Unovis-powered data visualization.              |
| 💳 **Multi-Currency**      | Native support for 150+ currencies with automated daily rate synchronization via Edge Functions.               |
| 📋 **Smart Budgets**       | Flexible monthly budget planning with per-category tracking, rollover support, and visual progress indicators. |
| 👫 **Couple Mode**         | Secure, invite-only shared finance mode using Supabase Auth and dedicated RLS policies.                        |
| 📸 **AI OCR Scanner**      | Automated transaction entry via GPT-4o mini powered receipt scanning (Indonesian & English support).           |
| ✂️ **Split Transactions**  | Detailed expense tracking allowing single transactions to be distributed across multiple categories.           |
| 🔄 **Account Transfer**   | Seamlessly move balances between internal accounts with automated linked transaction records.                   |
| 🔁 **Recurring Engine**    | Automated transaction generation for subscriptions and salary with flexible interval logic.                    |
| 📎 **Attachments**         | Transaction-level receipt storage using Supabase Storage with secure signed URLs.                              |
| 🎯 **Goal Tracking**       | Visual financial targets with progress milestones and custom imagery.                                          |
| 🔒 **Bank-Grade Security** | Google OAuth 2.0 and strict Postgres Row-Level Security (RLS) ensure your data never leaves your control.      |

---

## 🛠️ Modern Tech Stack

### Frontend Architecture

- **Framework:** [Vue 3](https://vuejs.org/) (Composition API, `<script setup>`)
- **Build Tool:** [Vite 8](https://vitejs.dev/) with Rolldown optimization.
- **Language:** [TypeScript 6](https://www.typescriptlang.org/) for robust type safety.
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) with [shadcn-vue](https://www.shadcn-vue.com/) components.
- **State & Data:** [TanStack Vue Query v5](https://tanstack.com/query/latest/docs/framework/vue/overview) for server state management.
- **Visualization:** [Unovis](https://unovis.dev/) for modular, accessible charts.
- **PWA:** Offline-ready with `vite-plugin-pwa`.

### Backend & Infrastructure

- **Platform:** [Supabase](https://supabase.com/) (PostgreSQL, Auth, Storage, Edge Functions).
- **Runtime:** [Deno](https://deno.land/) for serverless Edge Functions.
- **AI Integration:** [GPT-4o mini](https://openai.com/index/gpt-4o-mini/) for intelligent OCR processing.
- **Deployment:** [Vercel](https://vercel.com/) for frontend edge hosting.

---

## 🚀 Development Workflow

### Prerequisites

- [Bun](https://bun.sh) (v1.1+ recommended)
- [Supabase CLI](https://supabase.com/docs/guides/cli) (for local database development)

### Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/seaavey/finance.git
cd finance

# 2. Install optimized dependencies
bun install

# 3. Setup environment variables
cp .env.example .env.local

# 4. Launch development environment
bun dev
```

### Build & Maintenance Commands

| Command              | Purpose                                                       |
| :------------------- | :------------------------------------------------------------ |
| `bun build`          | Production-ready type-check and build.                        |
| `bun type-check`     | Run `vue-tsc` for deep static analysis.                       |
| `bun lint`           | Multi-stage linting with `oxlint` (fast) and `eslint` (deep). |
| `bun format`         | Standardize code style with `prettier`.                       |
| `bun audit:security` | Automated security scanning for dependencies and secrets.     |

---

## 🗄️ Database Architecture

Aemy Finance utilizes a relational PostgreSQL schema with **11 core tables**, protected by strict **Row-Level Security (RLS)**.

- `profiles`: Core user settings, currency preferences, and partner linking.
- `transactions`: The ledger of all financial movements (supports splitting).
- `accounts`: Managed assets (Cash, Bank, E-Wallet, Investments, Liabilities).
- `categories`: Customizable taxonomy for income and expenses.
- `budgets`: Time-scoped spending limits per category.
- `bills` & `recurring_transactions`: Scheduling engine for future payments.
- `exchange_rates`: Dynamic cache for multi-currency conversion.

---

## 🤝 Contributing

We welcome contributions! Please see our [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on how to get started.

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

Copyright © 2026 — [seaavey](https://github.com/seaavey) & [Koxi](https://github.com/koci79)

---

Built with ❤️ for a better financial future.
