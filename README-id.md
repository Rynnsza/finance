# Aemy Finance ✦

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Bun](https://img.shields.io/badge/Runtime-Bun-black?logo=bun)](https://bun.sh)
[![Vue](https://img.shields.io/badge/Frontend-Vue_3-4FC08D?logo=vue.js&logoColor=white)](https://vuejs.org)
[![Tailwind CSS v4](https://img.shields.io/badge/Styles-Tailwind_v4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Backend-Supabase-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com)

**Manajemen Keuangan Pribadi & Bersama — Modern & Terstruktur.**

Aemy Finance adalah aplikasi manajemen keuangan modern dengan performa tinggi yang dirancang untuk memberikan kejelasan dan kendali penuh atas finansial Anda. Dibangun dengan prinsip "Privasi Utama", aplikasi ini menawarkan dukungan multi-mata uang, otomasi bertenaga AI, dan fitur kolaborasi tanpa hambatan — semuanya gratis tanpa iklan atau pelacakan.

🌐 **Demo Live:** [seaavey.site](https://seaavey.site)

---

## ✨ Fitur Utama

| Fitur                    | Deskripsi Teknis                                                                                                       |
| :----------------------- | :--------------------------------------------------------------------------------------------------------------------- |
| 💰 **Dashboard Bento**   | Dashboard interaktif dengan pelacakan saldo real-time dan visualisasi data menggunakan Unovis.                         |
| 💳 **Multi-Mata Uang**   | Dukungan asli untuk 150+ mata uang dengan sinkronisasi kurs otomatis setiap hari via Edge Functions.                   |
| 📋 **Anggaran Cerdas**   | Perencanaan anggaran bulanan fleksibel dengan pelacakan per kategori, dukungan rollover, dan indikator progres visual. |
| 👫 **Mode Pasangan**     | Mode keuangan bersama yang aman dan berbasis undangan menggunakan Supabase Auth dan kebijakan RLS khusus.              |
| 📸 **AI OCR Scanner**    | Entri transaksi otomatis melalui pemindaian struk berbasis GPT-4o mini (mendukung bahasa Indonesia & Inggris).         |
| ✂️ **Transaksi Split**   | Pelacakan pengeluaran mendetail yang memungkinkan satu transaksi didistribusikan ke berbagai kategori.                 |
| 🔁 **Mesin Berulang**    | Pembuatan transaksi otomatis untuk langganan dan gaji dengan logika interval yang fleksibel.                           |
| 📎 **Lampiran**          | Penyimpanan struk/nota di tingkat transaksi menggunakan Supabase Storage dengan URL bertanda tangan yang aman.         |
| 🎯 **Target Finansial**  | Pelacakan tujuan keuangan dengan milestone progres dan gambar kustom.                                                  |
| 🔒 **Keamanan Berlapis** | Google OAuth 2.0 dan Row-Level Security (RLS) Postgres yang ketat memastikan data Anda tetap dalam kendali Anda.       |

---

## 🛠️ Tech Stack Modern

### Arsitektur Frontend

- **Framework:** [Vue 3](https://vuejs.org/) (Composition API, `<script setup>`)
- **Build Tool:** [Vite 8](https://vitejs.dev/) dengan optimasi Rolldown.
- **Bahasa:** [TypeScript 6](https://www.typescriptlang.org/) untuk keamanan tipe data yang kuat.
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) dengan komponen [shadcn-vue](https://www.shadcn-vue.com/).
- **State & Data:** [TanStack Vue Query v5](https://tanstack.com/query/latest/docs/framework/vue/overview) untuk manajemen state server.
- **Visualisasi:** [Unovis](https://unovis.dev/) untuk grafik modular dan aksesibel.
- **PWA:** Siap offline dengan `vite-plugin-pwa`.

### Backend & Infrastruktur

- **Platform:** [Supabase](https://supabase.com/) (PostgreSQL, Auth, Storage, Edge Functions).
- **Runtime:** [Deno](https://deno.land/) untuk serverless Edge Functions.
- **Integrasi AI:** [GPT-4o mini](https://openai.com/index/gpt-4o-mini/) untuk pemrosesan OCR yang cerdas.
- **Deployment:** [Vercel](https://vercel.com/) untuk hosting frontend di edge.

---

## 🚀 Alur Pengembangan

### Prasyarat

- [Bun](https://bun.sh) (direkomendasikan v1.1+)
- [Supabase CLI](https://supabase.com/docs/guides/cli) (untuk pengembangan database lokal)

### Mulai Cepat

```bash
# 1. Clone repositori
git clone https://github.com/seaavey/finance.git
cd finance

# 2. Instal dependensi yang teroptimasi
bun install

# 3. Setup variabel lingkungan
cp .env.example .env.local

# 4. Jalankan lingkungan pengembangan
bun dev
```

### Perintah Build & Pemeliharaan

| Perintah             | Kegunaan                                                             |
| :------------------- | :------------------------------------------------------------------- |
| `bun build`          | Build produksi disertai pengecekan tipe data.                        |
| `bun type-check`     | Menjalankan `vue-tsc` untuk analisis statis mendalam.                |
| `bun lint`           | Linting multi-tahap dengan `oxlint` (cepat) dan `eslint` (mendalam). |
| `bun format`         | Menstandarisasi gaya kode dengan `prettier`.                         |
| `bun audit:security` | Pemindaian keamanan otomatis untuk dependensi dan rahasia.           |

---

## 🗄️ Arsitektur Database

Aemy Finance menggunakan skema relasional PostgreSQL dengan **11 tabel inti**, yang dilindungi oleh **Row-Level Security (RLS)** yang ketat.

- `profiles`: Pengaturan profil, preferensi mata uang, dan tautan pasangan.
- `transactions`: Ledger utama untuk semua pergerakan finansial (mendukung split).
- `accounts`: Pengelolaan aset (Tunai, Bank, E-Wallet, Investasi, Liabilitas).
- `categories`: Taksonomi kustom untuk pendapatan dan pengeluaran.
- `budgets`: Batas pengeluaran bulanan berdasarkan kategori.
- `bills` & `recurring_transactions`: Mesin penjadwalan untuk pembayaran masa depan.
- `exchange_rates`: Cache dinamis untuk konversi multi-mata uang.

---

## 🤝 Kontribusi

Kami menerima kontribusi! Silakan lihat [CONTRIBUTING.md](CONTRIBUTING.md) untuk panduan tentang cara memulai.

---

## 📄 Lisensi

Didistribusikan di bawah **MIT License**. Lihat `LICENSE` untuk informasi lebih lanjut.

Copyright © 2026 — [seaavey](https://github.com/seaavey) & [Koxi](https://github.com/koci79)

---

Dibuat dengan ❤️ untuk masa depan finansial yang lebih baik.
