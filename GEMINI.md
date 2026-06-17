# Project Standards: Aemy Finance (finance-vite)

This document serves as the foundational mandate and instructional context for all AI agent interactions within the Aemy Finance project. It defines the project's purpose, technical architecture, development workflows, and mandatory coding standards.

---

## 1. Project Overview

**Aemy Finance** is a modern, high-performance personal and shared finance application. It is designed with a "Privacy First" mindset, focusing on clarity, control, and performance.

### Tech Stack

- **Runtime**: [Bun](https://bun.sh)
- **Frontend Framework**: [Vue 3](https://vuejs.org) (Composition API with `<script setup>`)
- **Build Tool**: [Vite](https://vitejs.dev)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com) + Vanilla CSS
- **Backend-as-a-Service**: [Supabase](https://supabase.com) (PostgreSQL 15, Auth, Storage, RPC)
- **State Management**: TanStack Vue Query for server state; Vue reactive/ref for local state.
- **Localization**: `vue-i18n` (Supports English and Indonesian).

### Core Architecture

- **Service Layer**: Business logic and database interactions are isolated in `src/services/`.
- **Composable Layer**: Reactive state management and UI logic reside in `src/composables/`.
- **Global Components**: Critical UI building blocks are registered globally in `src/main.ts`.
- **Database Model**: Strict Row-Level Security (RLS) ensures user and partner data isolation.

---

## 2. Reusable Architecture Standards

To maintain high maintainability and consistency, use the following standardized building blocks.

### 2.1 Core Reusable Components (Globally Registered)

| Component         | Purpose                                     | Usage Example                                                   |
| :---------------- | :------------------------------------------ | :-------------------------------------------------------------- |
| `BaseCard`        | Standard "Bento Box" card layout            | `<BaseCard title="..." subtitle="..."> ... </BaseCard>`         |
| `PageHeader`      | Page titles and primary action buttons      | `<PageHeader title="..." button-text="..." @action="..." />`    |
| `BaseDialog`      | Consistent modal window wrapper             | `<BaseDialog v-model:open="..." title="..."> ... </BaseDialog>` |
| `StatCard`        | Numeric summary cards with color variants   | `<StatCard label="..." :value="..." variant="success" />`       |
| `CurrencyInput`   | Self-formatting numeric input (IDR/USD/etc) | `<CurrencyInput v-model="..." :currency="..." />`               |
| `DateRangePicker` | Complex date range filtering with labels    | `<DateRangePicker v-model="..." />`                             |
| `StatusBadge`     | Labeled badges (`success`, `danger`, etc)   | `<StatusBadge type="success">Active</StatusBadge>`              |
| `ListItemAction`  | Standard Edit/Delete button group           | `<ListItemAction @edit="..." @delete="..." />`                  |
| `EmptyState`      | Friendly display for empty data lists       | `<EmptyState title="..." icon="..." @action="..." />`           |
| `AppIcon`         | Global wrapper for Iconify icons            | `<AppIcon name="hugeicons:..." />`                              |

### 2.2 Principles

1. **Global First**: Always check `src/main.ts` before importing components. Standard UI elements are available globally.
2. **Logic Centralization**: Complex formatting (currency, dates) MUST be encapsulated in reusable components/composables, never repeated in page templates.
3. **DRY Styles**: Avoid repeating long Tailwind class strings for cards or inputs; use `BaseCard` or existing UI components.

---

## 3. Development Workflows

### Build & Run Commands

- `bun run dev`: Start the local development server.
- `bun run build`: Full production build with type checking.
- `bun run type-check`: Run `vue-tsc` to verify TypeScript integrity.
- `bun run lint`: Run Oxlint and ESLint with auto-fix.
- `bun run format`: Format code using Prettier.

### Git Conventions

- **Feature Work**: Branch from `main`.
- **Commit Messages**: Use conventional commits (`feat:`, `fix:`, `chore:`, `refactor:`).
- **Auto-Edit Protocol**: In Auto-Edit mode, do not stage/commit unless explicitly instructed ("gass commit").

---

## 4. Database & Backend (Supabase)

- **Migrations**: Found in `supabase/migrations/`. Use unique timestamps.
- **Idempotency**: All migrations should use `IF NOT EXISTS` or checks to ensure they can run multiple times without failure.
- **RLS**: Every new table MUST have Row-Level Security enabled with policies for `select`, `insert`, `update`, and `delete` tied to `auth.uid()`.
- **RPC**: Use database functions (stored procedures) for heavy aggregations or cross-table statistics.

---

## 5. Instructional Context for AI Agents

- **Documentation**: Consult the `RPD/` directory for detailed product requirement documents.
- **Locales**: Always update both `src/locales/en.json` and `src/locales/id.json` when adding UI text.
- **Architecture Integrity**: Before proposing a fix, identify if it violates the "Reusable Architecture" mentioned in Section 2. Always prefer extending an existing component over creating a new manual pattern.
