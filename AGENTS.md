# Aemy Finance — Agent Guide

## Commands

| Command                                    | What it does                                         |
| ------------------------------------------ | ---------------------------------------------------- |
| `bun dev`                                  | Start Vite dev server (port 5173)                    |
| `bun build`                                | Type-check first, then production build via Rolldown |
| `bun build-only`                           | Build without `vue-tsc` type check                   |
| `bun type-check`                           | `vue-tsc --build` (reads tsconfig.json references)   |
| `bun lint`                                 | Runs `oxlint --fix` then `eslint --fix` sequentially |
| `bun format`                               | `prettier --write src/`                              |
| `bun test`                                 | Run all tests (Bun's built-in test runner)           |
| `bun test --preload ./src/lib/supabase.ts` | Single test file                                     |

No `npm run` — Bun is the package manager.

## Testing

- Uses **Bun's test runner** (`bun:test`), not Vitest. No `vitest.config.*`.
- Services mock `@/lib/supabase` via `mock.module()` (Bun API).
- Composables test with mock Supabase client.
- No explicit test script in `package.json` — `bun test` works directly.

## Architecture

- **Vue 3** + Composition API + `<script setup>` + **TypeScript 6**.
- **File-based routing** via `vite-plugin-pages` from `src/pages/`.
- **Layout system**: `blank` layout for public pages (landing, auth, static), `default` layout for authenticated pages (sidebar + topbar). Set via `route.meta.layout` in `src/router/index.ts`.
- **Auto-imports** (unplugin-auto-import): Vue APIs, vue-router, composables in `src/composables/`, `src/lib/`. No manual imports needed.
- **Auto-registered components** (unplugin-vue-components): all `.vue` files in `src/components/` (including `src/components/ui/` for shadcn-vue). No manual `app.component()` calls needed.
- **Nuxt compatibility layer**: `NuxtLink`, `NuxtLinkLocale`, `AppIcon`, `ClientOnly` globally registered in `src/main.ts`.
- **Services** (`src/services/`): raw Supabase queries using `query-wrapper.ts` helpers. **Composables** (`src/composables/`): TanStack Vue Query wrappers + activity logging + toasts. Composables **must** consume services, never call `useSupabase()` directly.
- **Result type**: `Result<T>` from `@/types/result` — `{ data: T; error: null } | { data: null; error: AppError }`.
- **Supabase client**: singleton via `useSupabase()` in `src/lib/supabase.ts`. Has startup env validation — throws if `VITE_PUBLIC_SUPABASE_URL` or `VITE_PUBLIC_SUPABASE_ANON_KEY` are missing.

## Utility Libraries

| File | Purpose |
|------|---------|
| `src/lib/query-wrapper.ts` | `querySingle<T>`, `queryList<T>`, `mutationWithReturn<T>`, `mutationVoid`, `queryWithCount<T>` — eliminates ~45 duplicate error-handling blocks |
| `src/lib/rpc.ts` | Wraps `supabase.rpc()` calls with `Result<T>` pattern |
| `src/lib/storage-util.ts` | `uploadImage()`, `deleteImage()` — shared image upload/delete across buckets |
| `src/lib/budget-util.ts` | `calculateSpendingByCategory()`, `calculateRollover()`, `calculateProgress()` — pure functions, no I/O, testable |
| `src/constants/index.ts` | `FILTER_ALL`, `TRANSFER_CATEGORY_NAMES`, `DEFAULT_CURRENCY`, `STALE_TIMES`, `QUERY_KEYS` — centralised magic strings

## Conventions

- **Default locale**: Indonesian (`id`), with English (`en`) as fallback. Add translation keys to both `src/locales/id.json` and `src/locales/en.json`.
- **Vue Query defaults**: `staleTime: 30000`, `refetchOnWindowFocus: false`.
- **Composables pattern**: `useSupabase()` → TanStack Query (`useQuery`) → CRUD functions → `queryClient.invalidateQueries()` → `useActivityLog().log()` → `useToast()`.
- **Component style**: shadcn-vue with **Reka UI** (not Radix), `reka-vega` style. Icons via **HugeIcons** (`@iconify/vue` as `<AppIcon>`).
- **Tailwind v4** (`@import 'tailwindcss'`), not v3. Use `@theme inline` for CSS variables. Dark mode via `.dark` class.
- **Fonts**: DM Sans (body), JetBrains Mono (headings).
- **Formatting**: Prettier with `semi: false`, `singleQuote: true`, `printWidth: 100`.
- **Commit**: Conventional Commits (`feat:`, `fix:`, `chore:`, etc.).
- **PR gate**: `bun format && bun lint && bun type-check && bun build`.

## Setup & Deployment

- **Environment**: `cp .env .env.local` (`.env` has working defaults for the live Supabase project).
- **Supabase Edge Function secrets** are set via `supabase secrets set`, **never** in `.env`.
- **Docker**: Multi-stage build (Bun → Vite build → nginx), serves on port 3000. Use `docker compose up`.
- **Vercel**: SPA fallback via rewrites, strict CSP headers in `vercel.json`.
- **PWA**: Service worker with runtime caching for Iconify, exchangerate.fun, Unsplash, Supabase APIs.
- **OAuth callback**: Handled at `/auth/callback` — route guard skips auth check if URL hash contains `access_token` or query contains `code`.

## tsconfig quirks

- `noUncheckedIndexedAccess: true` — array/object access may return `undefined`.
- Path alias: `@/` → `src/`.
- Separate tsconfig for Node (vite config, eslint) vs. DOM (app code).
- Generated `src/auto-imports.d.ts` and `src/components.d.ts` included in tsconfig.
