## 16. Environment Variables

<sub>Required untuk development & deployment · 7 Jun 2026</sub>

---

### 📋 Daftar Environment Variables

| Variable                        | Diperlukan |         Default         |    Dimana    | Deskripsi                                                                         |
| ------------------------------- | :--------: | :---------------------: | :----------: | --------------------------------------------------------------------------------- |
| `VITE_PUBLIC_SUPABASE_URL`      |     ✅     |            —            | `.env.local` | Supabase project URL (didapat dari Supabase dashboard → Settings → API)           |
| `VITE_PUBLIC_SUPABASE_ANON_KEY` |     ✅     |            —            | `.env.local` | Supabase anon/public key (bisa dipublish, aman karena RLS)                        |
| `VITE_PUBLIC_SITE_URL`          |     ✅     | `http://localhost:5173` | `.env.local` | Callback URL untuk Google OAuth — harus match dengan yang didaftarkan di Supabase |

### 🔒 Edge Function Secrets

Environment variables ini TIDAK ada di `.env` — dikelola via Supabase CLI:

```bash
supabase secrets set RESEND_API_KEY=xxx              # Required: send-couple-invite
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=xxx    # Required: sync-rates
```

| Secret                      | Diperlukan | Fungsi                                                           |
| --------------------------- | :--------: | ---------------------------------------------------------------- |
| `RESEND_API_KEY`            |     ✅     | Kirim email undangan pasangan via Resend API                     |
| `SUPABASE_SERVICE_ROLE_KEY` |     ✅     | Akses database dengan role service (bypass RLS) untuk sync-rates |

### 🚀 Setup Local Development

```bash
# 1. Clone repository
git clone https://github.com/seaavey/finance.git
cd finance

# 2. Copy .env.example → .env.local
cp .env .env.local

# 3. Isi .env.local dengan:
#    VITE_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
#    VITE_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
#    VITE_PUBLIC_SITE_URL=http://localhost:5173

# 4. (Opsional) Set Edge Function secrets
supabase secrets set RESEND_API_KEY=re_xxx

# 5. Run
bun install
bun dev
```

### 🔄 Production

Production environment variables di-set di **Vercel Dashboard**:

- Settings → Environment Variables
- Paste nilai yang sama seperti `.env.local`
- Redeploy otomatis setelah diset

---
