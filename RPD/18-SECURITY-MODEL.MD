## 18. Security Model

<sub>Google OAuth · RLS · Data protection · 7 Jun 2026</sub>

---

### 18.1 Prinsip Keamanan

1. **Zero trust** — Setiap request diverifikasi, bahkan dari client sendiri
2. **Defense in depth** — RLS di DB + Bearer token di API + validasi input
3. **Least privilege** — Service role key hanya dipakai di Edge Functions (sync-rates), bukan di client
4. **No data selling** — Zero-revenue = zero incentive buat jual data

### 18.2 Authentication

| Aspek             | Detail                                                                |
| ----------------- | --------------------------------------------------------------------- |
| **Method**        | Google OAuth via Supabase Auth                                        |
| **Provider**      | Google only (untuk sekarang — bisa ditambah)                          |
| **Session**       | HTTP-only cookie + access token (auto-refresh via supabase-js)        |
| **Redirect Flow** | Login → Google consent → `/auth/callback` → session → `/dashboard`    |
| **Logout**        | `signOut()` → clear session → redirect ke landing page + activity log |
| **Rate Limit**    | Supabase Auth built-in rate limiting                                  |

### 18.3 Authorization

| Layer              | Mekanisme                                                                                    |
| ------------------ | -------------------------------------------------------------------------------------------- |
| **Database**       | Row-Level Security (RLS) — ~40 policies di 11 tabel                                          |
| **Storage**        | Private bucket (`receipts`) via signed URL; Public bucket (`goal-images`) dengan RLS         |
| **Edge Functions** | Bearer token auth (`Authorization: Bearer <supabase_session>`) — kecuali `og-image` (public) |
| **Couple Mode**    | RLS diperluas — partner bisa SELECT/UPDATE/DELETE (tergantung tabel)                         |

### 18.4 Data Protection

| Aspek              | Implementasi                                                               |
| ------------------ | -------------------------------------------------------------------------- |
| **In transit**     | HTTPS everywhere — Vercel (TLS 1.3) + Supabase                             |
| **At rest**        | Supabase handles encryption (AES-256)                                      |
| **User isolation** | Semua data di-scope oleh `user_id` — RLS memastikan tidak ada akses silang |
| **Partner access** | Eksplisit via `partner_id` — hanya tabel tertentu yang di-share            |
| **File access**    | Signed URL dengan expiry (10 menit) untuk private bucket                   |

### 18.5 Threat Model

| Threat                | Dampak                 | Mitigasi                                 | Severity  |
| --------------------- | ---------------------- | ---------------------------------------- | :-------: |
| SQL injection         | Data leak              | Supabase uses parameterized queries      |  🟢 Low   |
| XSS via input         | Session hijack         | Vue auto-escapes template output         |  🟢 Low   |
| CSRF                  | Unauthorized action    | Same-origin policy, OAuth state param    |  🟢 Low   |
| RLS bypass            | Read other user's data | Tidak mungkin — RLS enforced server-side |  🟢 Low   |
| Stolen access token   | Full account access    | HTTP-only cookie, short expiry + refresh | 🟡 Medium |
| Edge Function abuse   | API cost / spam        | Rate limiter (belum ada — rencana)       | 🟡 Medium |
| Service role key leak | Full DB access         | Key hanya di Edge Function secrets       |  🔴 High  |

### 18.6 Security History

|    Date    | Incident                                                          | Resolusi                                                  |
| :--------: | ----------------------------------------------------------------- | --------------------------------------------------------- |
| 2 Jun 2026 | RLS vulnerability di storage bucket receipts — bucket public read | Migration `20260602000003` — ubah ke private + signed URL |
| 2 Jun 2026 | `exchange_rates` bisa di-WRITE oleh siapa saja                    | Migration `20260602000002` — RLS read-only                |
| 2 Jun 2026 | Receipt bucket bisa di-list semua file                            | Tambah policy storage.list                                |
| 4 Jun 2026 | Partner tidak bisa UPDATE transaksi pasangan                      | Migration `20260604000000` — tambah couple UPDATE policy  |
| 4 Jun 2026 | Partner tidak bisa DELETE transaksi pasangan                      | Migration `20260604000001` — tambah couple DELETE policy  |

### 18.7 Input Validation

| Layer              |   Status   | Detail                                                      |
| ------------------ | :--------: | ----------------------------------------------------------- |
| **Frontend**       | ⚠️ Parsial | TypeScript tipe data, belum validasi runtime                |
| **Database**       |  ✅ Full   | `CHECK` constraints, `NOT NULL`, foreign keys, `ENUM` types |
| **Edge Functions** |  ✅ Full   | Validasi input di Deno (JSON schema check)                  |

### 18.8 Best Practices yang Belum Diterapkan

| Praktik                                 | Rencana                                                   |
| --------------------------------------- | --------------------------------------------------------- |
| Rate limiting di API endpoints          | Supabase built-in atau custom di Edge Function middleware |
| CSP Headers                             | Setup Content-Security-Policy di Vercel `vercel.json`     |
| Audit log for auth events               | Supabase Auth hooks → log ke activity_logs                |
| Session invalidation on password change | N/A (Google OAuth only — no password)                     |
| 2FA / MFA                               | Supabase Auth supports MFA — future enhancement           |
| Security.txt                            | Setup `/.well-known/security.txt`                         |

---
