## 19. Glossary

<sub>Istilah-istilah dalam proyek Aemy Finance · 7 Jun 2026</sub>

---

### 🔤 Istilah Umum

| Istilah           | Arti                                                                                           |
| ----------------- | ---------------------------------------------------------------------------------------------- |
| **Base Currency** | Mata uang utama user (dari `profile.currency`). Semua konversi mengacu ke sini. Default: IDR   |
| **Bento-Grid**    | Layout dashboard dengan grid asimetris khas Bento UI — tata letak tidak beraturan yang menarik |
| **Couple Mode**   | Fitur menghubungkan dua akun sebagai pasangan — berbagi data finansial dengan RLS khusus       |
| **Dogfooding**    | Developer menggunakan produknya sendiri — fitur lahir dari kebutuhan nyata, bukan asumsi       |
| **Rolldown**      | Rust-based bundler — default di Vite 8. 10x lebih cepat dari esbuild/webpack                   |

### 🔐 Keamanan & Database

| Istilah              | Arti                                                                                                                        |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| **RLS**              | Row-Level Security — kebijakan akses tingkat baris di PostgreSQL. Setiap user cuma bisa lihat data yang `user_id`-nya cocok |
| **Edge Function**    | Deno function serverless di Supabase — untuk backend logic yang butuh akses eksternal (OCR, email, sync)                    |
| **RPC**              | Remote Procedure Call — fungsi PostgreSQL yang dipanggil via API. Buat query berat/kompleks biar gak di-client              |
| **Signed URL**       | URL akses sementara (biasanya 10 menit) ke private storage — aman tanpa expose bucket                                       |
| **Service Role Key** | Supabase key dengan akses penuh ke database (bypass RLS) — HANYA dipakai di Edge Functions, JANGAN di client                |
| **Bearer Token**     | Access token Supabase yang dikirim di header `Authorization` untuk autentikasi API                                          |
| **Migration**        | File SQL yang mengubah skema database secara versioned — bisa maju (apply) dan mundur (rollback)                            |
| **Policy**           | Aturan RLS: SELECT, INSERT, UPDATE, DELETE — siapa boleh apa                                                                |

### 🖥️ Frontend

| Istilah              | Arti                                                                                                                                    |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| **shadcn-vue**       | Port Vue dari shadcn/ui — komponen tidak di-install via npm, tapi di-copy ke `src/components/ui/`. Full control, no dependency overhead |
| **TanStack Query**   | Library server state management (dulu React Query, sekarang multi-framework). Handle caching, refetch, staleTime, pagination            |
| **Unovis**           | Library chart modular — support Vue, React, Svelte. Bisa gabung bar + line dalam satu chart. Accessible                                 |
| **Composable**       | Function Vue 3 yang membungkus reactive state + logic — pola utama organisasi kode di app ini                                           |
| **StaleTime**        | Konfigurasi TanStack Query — berapa lama data dianggap "segar" sebelum refetch. Contoh: transactions 30s, exchange rates 1h             |
| **Auto-import**      | `unplugin-auto-import` + `unplugin-vue-components` — developer tidak perlu import manual. `ref`, `computed`, komponen tinggal pakai     |
| **Store (No Pinia)** | App ini tidak pake Pinia/Vuex. Server state → TanStack Query. Client state → `ref` + `computed` + module-level ref                      |
| **HugeIcons**        | Icon set dari Iconify — 200k+ icons, tree-shakeable, di-cache PWA                                                                       |
| **CVA**              | Class Variance Authority — library utility buat manage variant component styling. shadcn-vue depend on ini                              |
| **Rolldown**         | Build tool Rust-based yang dipake Vite 8 — ngebut bundling production                                                                   |

### 🗄️ Backend

| Istilah              | Arti                                                                                              |
| -------------------- | ------------------------------------------------------------------------------------------------- |
| **Supabase**         | Backend-as-a-Service: PostgreSQL + Auth + Storage + Edge Functions. Firebase alternative with SQL |
| **PostgreSQL 15**    | Database relational — 11 tabel, 41 migrasi, RLS aktif                                             |
| **Deno 2**           | Runtime JavaScript/TypeScript buat Edge Functions — secure by default, TypeScript native          |
| **Resend**           | Email API — dipakai buat kirim undangan couple mode. DevEx oke, 100 email/hari gratis             |
| **exchangerate.fun** | REST API gratis buat kurs mata uang — support 20+ mata uang Asia                                  |
| **RPC (PostgreSQL)** | Fungsi SQL yang dipanggil via Supabase API — lebih cepat dari query client-side                   |

### 📐 Arsitektur

| Istilah                     | Arti                                                                                              |
| --------------------------- | ------------------------------------------------------------------------------------------------- |
| **Multi-currency Pipeline** | Alur konversi: tx punya currency sendiri → convert ke base currency → render dengan locale sesuai |
| **Single-pass Net Worth**   | Algoritma O(n) — sort transaksi, iterasi per bulan, accumulate running balance                    |
| **Fire-and-forget**         | Async call yang tidak di-await. Contoh: activity log — best effort, gak nunggu return             |
| **Windowed Query**          | Query yang di-batch per periode (bulanan) — bukan fetch semua data sekaligus                      |
| **Bento Layout**            | Tata letak grid dashboard yang tidak simetris — kotak-kotak dengan ukuran berbeda                 |
| **Dogfooding**              | Tim developer pakai produknya sendiri — kalau sakit gigi, ditambal, bukan dikarang                |

### 📦 Infrastruktur

| Istilah                | Arti                                                                                          |
| ---------------------- | --------------------------------------------------------------------------------------------- |
| **Vercel Hobby**       | Hosting frontend — free tier dengan auto-deploy dari GitHub, custom domain, global CDN        |
| **Supabase Free Tier** | 500MB database, 2GB bandwidth, 50,000 monthly active users — gratis                           |
| **Rolldown (Vite 8)**  | Rust-based bundler — build production dalam hitungan detik                                    |
| **PWA**                | Progressive Web App — bisa di-install ke homescreen HP, service worker buat caching           |
| **SW**                 | Service Worker — script yang jalan di background browser. Handle caching, offline, push notif |

---

### 🔗 Quick Reference

| Kode | Kepanjangan                 |
| :--: | --------------------------- |
| RPD  | Rencana Pengembangan Produk |
| RLS  | Row-Level Security          |
| RPC  | Remote Procedure Call       |
| PWA  | Progressive Web App         |
|  SW  | Service Worker              |
| CVA  | Class Variance Authority    |
| JIT  | Just-In-Time (compilation)  |
| FCP  | First Contentful Paint      |
| TTI  | Time To Interactive         |
| LCP  | Largest Contentful Paint    |
| CLS  | Cumulative Layout Shift     |

---

> **Terakhir diperbarui:** 7 Jun 2026
> **Dikelola oleh:** seaavey
> **Repo:** https://github.com/seaavey/finance
> **Live:** https://seaavey.site
>
> _Dokumen ini hidup dan akan terus diperbarui seiring perkembangan produk._
