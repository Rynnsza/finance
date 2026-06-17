## 17. Deploy & CI/CD

<sub>Vercel (frontend) + Supabase Cloud (backend) · 7 Jun 2026</sub>

---

### 17.1 Arsitektur Deployment

```
┌───────────────────────────────────────────────────────────┐
│                       GitHub                              │
│  repo: seaavey/finance                                    │
│  branch: main (~)                                         │
└──────────┬───────────────────────┬───────────────────────┘
           │ push                 │ manual
           ▼                      ▼
┌──────────────────┐   ┌──────────────────┐
│   Vercel (FE)    │   │  Supabase (BE)   │
│   Auto-deploy    │   │  Manual deploy   │
│   seaavey.site   │   │  project ref     │
├──────────────────┤   ├──────────────────┤
│ Vue 3 + Vite     │   │ PostgreSQL 15    │
│ Service Worker   │   │ Auth (OAuth)     │
│ Runtime Cache    │   │ Storage          │
└──────────────────┘   │ Edge Functions   │
                       └──────────────────┘
                               │
                               ▼
                      ┌──────────────────┐
                      │    Resend API    │
                      │  (Email undangan)│
                      └──────────────────┘
```

### 17.2 Production

| Layanan            | Detail                                         |          URL          |       Tier        |
| ------------------ | ---------------------------------------------- | :-------------------: | :---------------: |
| **Frontend**       | Vercel — auto-deploy dari GitHub (main branch) | https://seaavey.site  |   Hobby (Free)    |
| **Backend DB**     | Supabase Cloud — PostgreSQL + Auth + Storage   |  project.supabase.co  |       Free        |
| **Edge Functions** | Supabase — Deno 2                              |    functions/v1/\*    |       Free        |
| **Email**          | Resend — kirim undangan couple                 | API via Edge Function |  Free (100/day)   |
| **Domain**         | seaavey.site (Vercel custom domain)            |           —           | Free (Vercel DNS) |

### 17.3 Deployment Flow

#### Frontend (Automatic)

```bash
# Otomatis: setiap push ke main branch
git push origin main
# → Vercel detects change → build → deploy
# → ~2 menit dari push ke live
```

#### Frontend (Manual)

```bash
# Build & preview lokal
bun build
bun preview
```

#### Backend (Manual)

```bash
# Deploy specific function
supabase functions deploy ocr-receipt
supabase functions deploy sync-rates
supabase functions deploy send-couple-invite
supabase functions deploy og-image

# Deploy ALL functions
supabase functions deploy --project-ref <ref>

# Push database migrations
supabase db push

# Set secrets
supabase secrets set RESEND_API_KEY=xxx
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=xxx
```

### 17.4 Local Development

```bash
# Prerequisites
bun            # JavaScript runtime & package manager
supabase CLI   # Supabase local development (wajib untuk edge functions)

# Start
git clone https://github.com/seaavey/finance.git
cd finance
bun install
cp .env .env.local        # Isi environment variables
supabase start            # Local PostgreSQL + Edge Functions (butuh Docker)
bun dev                   # Vite dev server → http://localhost:5173
```

### 17.5 Scripts

```bash
# Development
bun dev              # Dev server (port 5173) with HMR
bun dev --host       # Dev server accessible via network (for mobile testing)

# Production Build
bun build            # Type-check + production build (Rolldown)
bun build-only       # Build tanpa type-check (skip vue-tsc)
bun preview          # Preview production build

# Quality
bun type-check       # vue-tsc type checking
bun lint             # oxlint + eslint --fix
bun format           # Prettier formatting on src/
```

### 17.6 CI/CD Pipeline (Future)

Saat ini belum ada CI pipeline. Rencana:

| Pipeline   | Trigger    | Aksi                             |                 Status                  |
| ---------- | ---------- | -------------------------------- | :-------------------------------------: |
| **lint**   | Push PR    | `bun lint` + `bun type-check`    |              ❌ Belum ada               |
| **test**   | Push main  | `bun test` → Vitest + Playwright | ❌ Belum ada (tapi test juga belum ada) |
| **deploy** | Merge main | Vercel auto-deploy               |                ✅ Aktif                 |

### 17.7 Rollback Strategy

- **Frontend:** Vercel dashboard → Deployments → ⋮ → Rollback to previous
- **Backend (migration):** `supabase db diff --from-timestamp <before>` → generate rollback SQL
- **Edge Functions:** `supabase functions deploy ocr-receipt --ref <previous-version>` (tidak supported secara native — deploy ulang kode sebelumnya)

---
