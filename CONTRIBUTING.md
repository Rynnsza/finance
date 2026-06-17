# Contributing to Aemy Finance

Thank you for considering contributing to **Aemy Finance** — a modern, open-source personal and shared finance management app.

This document outlines the development workflow, coding standards, and conventions we follow. Please read it before submitting any contributions.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Project Structure](#project-structure)
- [Coding Standards](#coding-standards)
- [Commit Convention](#commit-convention)
- [Pull Request Process](#pull-request-process)
- [Reporting Issues](#reporting-issues)

---

## Code of Conduct

This project is governed by the [MIT License](LICENSE). We expect all contributors to be respectful, constructive, and collaborative. Harassment or toxic behavior of any kind will not be tolerated.

---

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** `^20.19.0 || >=22.12.0`
- **bun** — JavaScript runtime & package manager ([install guide](https://bun.sh/docs/installation))
- **Supabase CLI** — for local database ([install guide](https://supabase.com/docs/guides/local-development/cli/getting-started))
- **Git**

---

## Getting Started

### 1. Fork & Clone

```bash
git clone https://github.com/seaavey/finance.git
cd finance
```

### 2. Install Dependencies

```bash
bun install
```

### 3. Environment Setup

```bash
cp .env .env.local
```

The `.env` file contains the Supabase URL and anon key tied to the live project. For local development, run the Supabase stack:

```bash
supabase start
```

This spins up a local PostgreSQL database, auth, and storage services.

### 4. Start Dev Server

```bash
bun dev
```

The app is now running at [http://localhost:5173](http://localhost:5173).

---

## Development Workflow

### Branch Strategy

- **`main`** — production-ready code. Direct pushes are discouraged.
- **Feature branches** — create from `main` using a descriptive name:

```bash
git checkout -b feat/add-savings-goal
git checkout -b fix/transaction-edit-bug
```

We recommend using prefixes like `feat/`, `fix/`, `chore/`, `refactor/`, `docs/`.

### Commands

| Command          | Description                              |
| ---------------- | ---------------------------------------- |
| `bun dev`        | Start Vite dev server (port 5173)        |
| `bun build`      | Type-check + production build (Rolldown) |
| `bun build-only` | Build without type-checking              |
| `bun preview`    | Preview production build                 |
| `bun type-check` | Run `vue-tsc` type checking              |
| `bun lint`       | Run oxlint + eslint with auto-fix        |
| `bun format`     | Format all files in `src/` with Prettier |

Always run `bun lint` and `bun format` before committing:

```bash
bun format && bun lint
```

---

## Project Structure

```
src/
├── components/         # Auto-imported UI & domain components
│   ├── ui/             # shadcn-vue primitives (136+ components)
│   ├── charts/         # Unovis chart wrappers
│   └── landing/        # Landing page sections
├── composables/        # Domain logic — one file per entity
│   ├── useAuth.ts      # Authentication state & helpers
│   ├── useTransactions.ts
│   ├── useCategories.ts
│   ├── ...             # 17 composables total
├── layouts/            # default.vue (sidebar auth) & blank.vue (landing)
├── lib/                # Supabase client, cn() utility, OG helpers
├── pages/              # File-based routes (35 pages)
├── router/             # Route guard & layout assignment logic
├── plugins/            # i18n configuration
├── locales/            # id.json (default), en.json (fallback)
└── styles/             # globals.css (Tailwind v4, CSS variables, dark mode)

supabase/
├── functions/          # Deno Edge Functions
└── migrations/         # 31 timestamped SQL migrations
```

---

## Coding Standards

### General

- **Language:** TypeScript everywhere — avoid `any`.
- **Vue:** Composition API with `<script setup>` syntax.
- **Imports:** All Vue APIs, vue-router, and composables in `src/composables/` are auto-imported. No manual imports needed.
- **Components** in `src/components/` are auto-registered. No manual registration required.

### Formatting

- Uses **Prettier** (see config in root). Run `bun format` before committing.

### Linting

- Uses **oxlint** and **eslint**. Run `bun lint` before committing.
- No unresolved lint warnings in new code.

### TypeScript

- Strict mode enabled. Run `bun type-check` to verify.
- Prefer explicit return types on functions.

### Styling

- Use **Tailwind CSS v4** utility classes. Avoid custom CSS unless necessary.
- CSS custom properties are defined in `src/styles/globals.css`.
- Respect the existing dark mode variables.

### Composables Pattern

Each domain entity composable follows a consistent pattern:

1. Create a Supabase client via `useSupabase()`.
2. Use **TanStack Query** (`useQuery`) with descriptive query keys (e.g. `['transactions', userId, filters, page]`).
3. Export CRUD functions that call Supabase, then `queryClient.invalidateQueries()`.
4. Log mutations via `useActivityLog().log()`.
5. Show toasts via `useToast()` — success on success, error on error.
6. Return `computed` values derived from query data.

### i18n

- Default locale is **Indonesian (`id`)** with English (`en`) as fallback.
- Add new translation keys to both `src/locales/id.json` and `src/locales/en.json`.

### Supabase Edge Functions

- Written in **Deno**.
- Deploy via `supabase functions deploy`.
- Auth via `Authorization: Bearer <session_token>` header.
- Include CORS headers in every function.

### Environment Variables

| Variable                        | Description          |
| ------------------------------- | -------------------- |
| `VITE_PUBLIC_SUPABASE_URL`      | Supabase project URL |
| `VITE_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key    |
| `VITE_PUBLIC_SITE_URL`          | OAuth callback URL   |

Edge Function secrets are set via `supabase secrets set`, **not** in `.env`.

---

## Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]
```

**Types:**

| Type       | Usage                                   |
| ---------- | --------------------------------------- |
| `feat`     | A new feature                           |
| `fix`      | A bug fix                               |
| `perf`     | Performance improvement                 |
| `refactor` | Code change that neither fixes nor adds |
| `style`    | Formatting, missing semicolons, etc.    |
| `docs`     | Documentation only changes              |
| `chore`    | Build process, dependencies, tooling    |
| `ci`       | CI/CD configuration                     |

**Examples:**

```
feat(dashboard): add net worth line chart
fix(transactions): handle empty category filter
perf(queries): parallelize dashboard data fetching
docs(readme): add couple mode setup guide
```

---

## Pull Request Process

1. **Create a feature branch** from `main` with a descriptive name.
2. **Make your changes** following the coding standards above.
3. **Run checks locally:**
   ```bash
   bun format && bun lint && bun type-check && bun build
   ```
4. **Write a clear PR title** using conventional commit format (e.g. `feat: add budget rollover`).
5. **Describe your changes** in the PR body — what changed, why, and how to test it.
6. **Keep PRs focused** — one feature or fix per PR. Large PRs are harder to review.
7. **Wait for review** — at least one maintainer should review before merging.

### What We Look For in Reviews

- Correctness — does the code do what it claims?
- Consistency — does it follow existing patterns (composables, auto-imports, etc.)?
- Security — are RLS policies respected? Are user inputs sanitized?
- Performance — unnecessary queries? Missing cache invalidation?
- No regression — existing functionality should be preserved.

---

## Reporting Issues

Found a bug or have a feature request? [Open an issue](https://github.com/seaavey/finance/issues).

When reporting a bug, include:

- A clear, descriptive title
- Steps to reproduce
- Expected vs. actual behavior
- Screenshots (if applicable)
- Browser / device / environment details

---

## Questions?

If you have questions about the codebase or contributing, feel free to open a [Discussion](https://github.com/seaavey/finance/discussions) or reach out to the maintainers.

---

> Built with ❤️ using Vue 3, Tailwind CSS, Supabase, and many other awesome open-source technologies.
