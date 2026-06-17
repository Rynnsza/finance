## 8. Routing & Layout

<sub>File-based routing · 37 routes · Auth guard · Layout system · 7 Jun 2026</sub>

---

### 8.1 Diagram Navigasi

```
                          ┌─────────────────┐
                          │   / (Landing)    │  ← blank layout
                          │  Hero → Login    │
                          └────────┬────────┘
                                   │ login
                                   ▼
                          ┌─────────────────┐
                          │  /auth/login     │  ← blank layout
                          │  Google OAuth    │
                          └────────┬────────┘
                                   │ callback
                                   ▼
                          ┌─────────────────┐
                          │  /auth/callback  │  ← blank layout
                          │  Session handler │
                          └────────┬────────┘
                                   │ redirect
                                   ▼
                    ┌──────────────────────────────┐
                    │      /dashboard              │  ← default layout (sidebar)
                    │  ┌──────┬───────────────────┐│
                    │  │      │ Ringkasan + Chart ││
                    │  │ Sid- │ Budget Progress   ││
                    │  │ ebar │ Recent Transaksi  ││
                    │  │      │ Reminders         ││
                    │  └──────┴───────────────────┘│
                    └──────────────────────────────┘
                              │
              ┌───────────────┼───────────────────┐
              │               │                   │
              ▼               ▼                   ▼
     ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
     │/transactions │ │   /budget    │ │  /accounts   │
     │ /categories  │ │   /bills     │ │  /goals      │
     │ /recurring   │ │ /schedule    │ │  /converter  │
     └──────────────┘ └──────────────┘ └──────────────┘
```

### 8.2 Router Setup (`src/router/index.ts`)

```typescript
// File-based routing via vite-plugin-pages
// Layout assignment via route.meta.layout

const blankLayoutRoutes = [
  '/',
  '/login',
  '/about',
  '/contact',
  '/privacy-policy',
  '/terms-of-service',
  '/auth/login',
  '/auth/callback',
]
```

### 8.2 Auth Guard Flow

```
Request → Route match → Cek route name di blankLayoutRoutes?
  ├── YES → Allow (public page)
  └── NO  → Cek apakah ada access_token di hash / code di query?
       ├── YES → Bypass (OAuth callback sedang diproses)
       └── NO  → Cek apakah user sudah login (session)?
            ├── YES → /auth/login? → redirect ke /dashboard
            │         (biar gak login lagi)
            └── NO  → Redirect ke /auth/login
```

**Detail Guard:**

1. Cek hash `access_token` atau query `code` → bypass (OAuth callback)
2. `/auth/login` → cek session → redirect ke `/dashboard` jika sudah login
3. Public routes → allow
4. Lainnya → cek session → redirect ke `/auth/login` jika tidak ada

### 8.3 Layout System

**`default.vue`** — Layout utama untuk authenticated routes:

```
┌──────────────────────────────────────────────────┐
│  ☰ AppSidebar                     👤 Profile    │
│  ┌───────┐  ┌──────────────────────────────────┐ │
│  │       │  │  Topbar (breadcrumb + actions)    │ │
│  │       │  ├──────────────────────────────────┤ │
│  │ Side  │  │                                  │ │
│  │ Bar   │  │   <slot /> — main content        │ │
│  │       │  │   (full page scroll)             │ │
│  │       │  │                                  │ │
│  │       │  │                                  │ │
│  └───────┘  └──────────────────────────────────┘ │
└──────────────────────────────────────────────────┘
```

**`blank.vue`** — Layout untuk landing, auth, static pages:

```
┌──────────────────────────────────────────────────┐
│                                                  │
│           <slot /> — full page                   │
│           (no sidebar, no topbar)                 │
│                                                  │
└──────────────────────────────────────────────────┘
```

### 8.4 Route Table

| Route                     | Layout  | Page Component                     | Auth | Menu | Deskripsi                   |
| ------------------------- | ------- | ---------------------------------- | :--: | :--: | --------------------------- |
| `/`                       | blank   | `pages/index.vue`                  |  ✗   |  ✗   | Landing page                |
| `/auth/login`             | blank   | `pages/auth/login.vue`             |  ✗   |  ✗   | Login                       |
| `/auth/callback`          | blank   | `pages/auth/callback.vue`          |  ✗   |  ✗   | OAuth callback handler      |
| `/login`                  | blank   | `pages/login.vue`                  |  ✗   |  ✗   | Login (alias)               |
| `/dashboard`              | default | `pages/dashboard.vue`              |  ✓   |  ✓   | Dashboard utama             |
| `/transactions`           | default | `pages/transactions/index.vue`     |  ✓   |  ✓   | Daftar transaksi            |
| `/transactions/new`       | default | `pages/transactions/new.vue`       |  ✓   |  ✗   | Tambah transaksi            |
| `/transactions/[id]/edit` | default | `pages/transactions/[id]/edit.vue` |  ✓   |  ✗   | Edit transaksi              |
| `/categories`             | default | `pages/categories/index.vue`       |  ✓   |  -   | Manajemen kategori          |
| `/categories/new`         | default | `pages/categories/new.vue`         |  ✓   |  ✗   | Tambah kategori             |
| `/categories/[id]/edit`   | default | `pages/categories/[id]/edit.vue`   |  ✓   |  ✗   | Edit kategori               |
| `/budget`                 | default | `pages/budget/index.vue`           |  ✓   |  ✓   | Budget overview             |
| `/budget/new`             | default | `pages/budget/new.vue`             |  ✓   |  ✗   | Tambah budget               |
| `/budget/edit`            | default | `pages/budget/edit.vue`            |  ✓   |  ✗   | Edit budget                 |
| `/budget/detail/[id]`     | default | `pages/budget/detail/[id].vue`     |  ✓   |  ✗   | Detail budget               |
| `/accounts`               | default | `pages/accounts/index.vue`         |  ✓   |  ✓   | Daftar akun                 |
| `/accounts/new`           | default | `pages/accounts/new.vue`           |  ✓   |  ✗   | Tambah akun                 |
| `/accounts/[id]/edit`     | default | `pages/accounts/[id]/edit.vue`     |  ✓   |  ✗   | Edit akun                   |
| `/accounts/[id]`          | default | `pages/accounts/[id]/index.vue`    |  ✓   |  ✗   | Detail akun                 |
| `/bills`                  | default | `pages/bills/index.vue`            |  ✓   |  ✓   | Daftar tagihan              |
| `/bills/new`              | default | `pages/bills/new.vue`              |  ✓   |  ✗   | Tambah tagihan              |
| `/bills/[id]`             | default | `pages/bills/[id]/index.vue`       |  ✓   |  ✗   | Detail tagihan              |
| `/bills/[id]/edit`        | default | `pages/bills/[id]/edit.vue`        |  ✓   |  ✗   | Edit tagihan                |
| `/recurring`              | default | `pages/recurring/index.vue`        |  ✓   |  ✓   | Transaksi berulang          |
| `/recurring/new`          | default | `pages/recurring/new.vue`          |  ✓   |  ✗   | Tambah recurring            |
| `/recurring/[id]/edit`    | default | `pages/recurring/[id]/edit.vue`    |  ✓   |  ✗   | Edit recurring              |
| `/schedule`               | default | `pages/schedule/index.vue`         |  ✓   |  -   | Kalender jadwal + recurring |
| `/goals`                  | default | `pages/goals/index.vue`            |  ✓   |  ✓   | Financial goals             |
| `/goals/new`              | default | `pages/goals/new.vue`              |  ✓   |  ✗   | Tambah goal                 |
| `/goals/[id]`             | default | `pages/goals/[id]/index.vue`       |  ✓   |  ✗   | Detail goal                 |
| `/goals/[id]/edit`        | default | `pages/goals/[id]/edit.vue`        |  ✓   |  ✗   | Edit goal                   |
| `/activities`             | default | `pages/activities/index.vue`       |  ✓   |  -   | Activity log                |
| `/settings`               | default | `pages/settings.vue`               |  ✓   |  ✓   | Pengaturan profil           |
| `/about`                  | blank   | `pages/about.vue`                  |  ✗   |  ✗   | Tentang                     |
| `/contact`                | blank   | `pages/contact.vue`                |  ✗   |  ✗   | Kontak                      |
| `/privacy-policy`         | blank   | `pages/privacy-policy.vue`         |  ✗   |  ✗   | Kebijakan privasi           |
| `/terms-of-service`       | blank   | `pages/terms-of-service.vue`       |  ✗   |  ✗   | Syarat & ketentuan          |

**Total: 37 routes** (20 authenticated default-layout + 8 public blank-layout)

**Menu:** ✓ = Muncul di sidebar · - = Muncul di submenu · ✗ = Tidak di menu (navigasi dari tombol/link)

---
