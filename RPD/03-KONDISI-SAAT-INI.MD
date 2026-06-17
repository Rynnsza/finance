## 3. Kondisi Saat Ini

<sub>Status proyek · 7 Jun 2026 · Aktif dikembangkan</sub>

---

### 📊 Ringkasan

| Aspek       | Detail                                                                                |
| ----------- | ------------------------------------------------------------------------------------- |
| **Status**  | 🟢 **Production** — aktif di [seaavey.site](https://seaavey.site)                     |
| **Versi**   | v1.0 (pre-release) — fitur inti ~90% selesai                                          |
| **Fase**    | Stabilisasi & polish → menuju AI & Insight                                            |
| **Lisensi** | MIT — open source di [github.com/seaavey/finance](https://github.com/seaavey/finance) |
| **Tim**     | 1 developer (seaavey) — dogfooding                                                    |

---

### 🛠️ Tech Stack

#### Frontend

| Teknologi           | Versi         | Keterangan                                                 |
| ------------------- | ------------- | ---------------------------------------------------------- |
| Vue                 | 3.5           | Composition API + `<script setup>` — framework utama       |
| Vite                | 8             | Build tool dengan Rolldown                                 |
| TypeScript          | 6             | Type safety penuh                                          |
| Tailwind CSS        | v4            | Utility-first styling via `@tailwindcss/vite` plugin       |
| shadcn-vue          | 136+ komponen | UI primitives (button, card, dialog, select, table, chart) |
| TanStack Vue Query  | terbaru       | Server state management, staleTime 30s default             |
| vue-router          | 5             | File-based routing via `vite-plugin-pages`                 |
| vue-i18n            | terbaru       | ID default, EN fallback                                    |
| Unovis              | terbaru       | Chart visualization (donut, bar, area)                     |
| Iconify (HugeIcons) | terbaru       | Icon set lengkap                                           |
| @unhead/vue         | terbaru       | SEO / meta tags                                            |
| Vite PWA            | terbaru       | Service worker + runtime caching                           |

#### Backend & Infrastructure

| Teknologi           | Keterangan                                                            |
| ------------------- | --------------------------------------------------------------------- |
| **Supabase**        | PostgreSQL 15 + Auth (Google OAuth) + Storage + Edge Functions        |
| **Database**        | 11 tabel, 41 migrasi SQL, RLS di semua tabel                          |
| **Edge Functions**  | 4 fungsi Deno (OCR receipt, sync-rates, send-couple-invite, OG image) |
| **Hosting**         | Vercel (frontend) + Supabase Cloud (backend)                          |
| **Package Manager** | bun — install & run cepat                                             |

---

### 📁 Struktur Proyek

```
src/
├── components/       # Auto-imported — 136+ UI + custom components
│   ├── ui/           # shadcn-vue primitives
│   ├── charts/       # Unovis chart wrappers (3 komponen)
│   └── landing/      # Landing page sections
├── composables/      # 18 domain composables
├── layouts/          # default.vue (sidebar) + blank.vue
├── lib/              # supabase.ts client, utils.ts
├── pages/            # 37 route — file-based
├── plugins/          # i18n config
├── locales/          # id.json, en.json
├── services/         # Service layer (API calls)
├── types/            # TypeScript types
└── styles/           # globals.css (Tailwind v4, CSS variables, dark mode)

supabase/
├── functions/        # 4 Deno Edge Functions
└── migrations/       # 41 timestamped SQL migrations

scripts/              # Utility scripts
```

---

### ✅ Fitur Selesai

#### Landing Page & Auth

- [x] **Landing page** — Hero, Features, Pricing, FAQ, Contact, Testimonials, CTA
- [x] **Google OAuth** — Login/logout via Supabase Auth
- [x] **Auth callback** — Session handling, redirect ke dashboard

#### Dashboard

- [x] **Ringkasan keuangan** — Balance, income, expense, period filter (1d/7d/30d/all)
- [x] **Chart** — Expense donut, monthly bar, net worth area chart
- [x] **Recent transactions** — 5 transaksi terakhir
- [x] **Quick stats** — Rata-rata pengeluaran harian, sisa budget

#### Transaksi

- [x] **CRUD transaksi** — Create, read, update, delete dengan form lengkap
- [x] **Filter** — By date range, category, type, account, search term
- [x] **Search** — Full-text search di deskripsi & notes
- [x] **Bulk edit** — Multi-select → edit kategori, pindah akun, delete massal
- [x] **Split transactions** — 1 transaksi ke multiple kategori
- [x] **Attachments** — Upload receipt/invoice (ke Supabase Storage)
- [x] **Multi-currency** — Tiap transaksi pilih currency sendiri (auto-convert ke base)

#### Kategori

- [x] **CRUD kategori** — Name, icon (HugeIcons), color picker, type (income/expense)
- [x] **Seed default** — 20+ kategori default Indonesia (Makanan, Transport, Gojek, Pulsa, dll)

#### Budget

- [x] **CRUD budget** — Per kategori, per bulan (dengan name optional)
- [x] **Multiple budgets** — Satu kategori bisa punya >1 budget
- [x] **Rollover** — Sisa budget bulan lalu diakumulasi
- [x] **Budget alerts** — Toast warning ≥80%, error ≥100% (session-level dedup)
- [x] **Progress bar** — Visual sisa budget + persentase

#### Akun / Balance

- [x] **CRUD akun** — Rekening bank, e-wallet, cash, dengan saldo manual
- [x] **Balance history** — Track perubahan saldo dari waktu ke waktu
- [x] **Net worth** — Total aset - total utang, dalam chart area

#### Recurring

- [x] **CRUD recurring** — Transaksi otomatis dengan interval (daily/weekly/monthly/yearly)
- [x] **Auto-create** — Cron-based (atau trigger) buat transaksi dari recurring di `next_date`
- [x] **Calendar view** — Kalender preview kapan recurring akan aktif (`src/pages/schedule/`)

#### Tagihan & Hutang (Bills)

- [x] **CRUD bills** — Tagihan berulang dengan due date
- [x] **Mark as paid** — Tandai tagihan sudah dibayar
- [x] **Status tracking** — Paid / unpaid overview

#### Goals / Tabungan

- [x] **CRUD goals** — Target menabung dengan nama, target amount, deadline
- [x] **Progress tracking** — Progress bar, tambah dana secara manual
- [x] **Image support** — Upload foto goal (mobil impian, rumah, dll)

#### Currency

- [x] **Currency converter** — Kalkulator konversi real-time antar mata uang
- [x] **Exchange rates** — Auto-sync dari exchangerate.fun via Edge Function
- [x] **Multi-currency per tx** — Setiap transaksi ingat kurs & nominal original

#### OCR Receipt

- [x] **Scan receipt** — Foto struk → AI extract total, tanggal, kategori via Edge Function
- [x] **Camera capture** — Camera UI + file upload (gallery)

#### Fitur Lainnya

- [x] **Dark mode** — Toggle light/dark, persist preferences
- [x] **i18n** — Indonesia (default), English (fallback)
- [x] **PWA** — Service worker + runtime caching + offline banner
- [x] **Activity log** — Log semua mutasi penting (create/update/delete)
- [x] **Couple mode (parsial)** — Partner link via invitation email, shared RLS, profil bersama

---

### 🟡 Fitur Parsial

| Fitur           | Kurangnya                                                             |
| --------------- | --------------------------------------------------------------------- |
| **Couple Mode** | Belum ada shared wallet / joint account, approval flow, shared budget |
| **PWA Offline** | Offline banner udah ada tapi belum bisa input transaksi tanpa sinyal  |
| **Export**      | Belum ada export PDF laporan bulanan, baru CSV via useExport          |
| **OCR Receipt** | Baru scan per receipt, belum batch scan, belum gallery receipt        |

---

### 🔜 Next Up (Short-term)

Urutan prioritas pengerjaan berikutnya:

1. **Tag system** — Tagging transaksi untuk grouping non-kategori
2. **Data import (CSV)** — Import transaksi dari CSV / external sources
3. **Export PDF (laporan)** — Laporan income/expense/budget per bulan
4. **Account transfer** — Pindah uang antar akun
5. **Recurring end-date & skip** — Tanggal berhenti + skip weekend/holiday
6. **Duplicate transaction detect** — Cegah double entry
7. **Dashboard quick stats** — Kartu ringkasan di atas dashboard

---

### 🧠 Dikenal & Belum Selesai

| Area                    | Kondisi                                                                 |
| ----------------------- | ----------------------------------------------------------------------- |
| **Testing**             | ❌ Belum ada test infrastructure sama sekali                            |
| **Type coverage**       | ⚠️ ~80% — masih ada `any` di beberapa tempat (RPC response)             |
| **Error handling**      | ⚠️ Toast error udah jalan, tapi belum ada error boundary component      |
| **Loading states**      | ⚠️ Skeleton di dashboard utama, tapi halaman lain masih spinner doang   |
| **Accessibility**       | ⚠️ Contrast ratio OK, keyboard nav sebagian, belum screen reader tested |
| **API documentation**   | ❌ Belum ada dokumentasi untuk REST API                                 |
| **Mobile optimization** | ⚠️ Responsive berfungsi, tapi belum optimal di HP < 360px               |
| **Performance**         | ⚠️ RPC udah optimize query besar, tapi first load masih berat           |

---

### 📈 Metrik Proyek

| Metrik                      | Angka                           |
| --------------------------- | ------------------------------- |
| **Database tables**         | 11                              |
| **Database indexes**        | 8+ (termasuk composite indexes) |
| **RLS policies**            | ~40 (3-5 per tabel)             |
| **SQL migrations**          | 41                              |
| **Composables**             | 18 file                         |
| **Pages / Routes**          | 37                              |
| **UI Components**           | 136+ shadcn-vue + 20+ custom    |
| **Edge Functions**          | 4 (Deno)                        |
| **Production dependencies** | 17 packages                     |
| **Dev dependencies**        | 16 packages                     |
| **Estimated frontend LOC**  | ~18,000+                        |
| **Edge Functions LOC**      | ~400+                           |
| **GitHub stars**            | 0 (baru)                        |
| **Active users**            | 1 (developer)                   |

---

### 🗺️ Evolusi Proyek

| Fase            | Waktu        | Highlight                                              |
| --------------- | ------------ | ------------------------------------------------------ |
| 🏁 **Init**     | Mei 2026     | Setup Vue + Vite + Supabase, landing page, auth        |
| 🚀 **MVP**      | Mei-Jun 2026 | Transactions, categories, budgets, dashboard           |
| 📈 **Growth**   | Jun 2026     | Recurring, bills, goals, net worth, couple mode, split |
| 🎯 **Sekarang** | **Jun 2026** | Stabilisasi, polish, roadmap, RPD docs                 |
| 🔮 **Next**     | Jul+ 2026    | Tag, CSV, PDF, insights AI, cashflow projection        |

---
