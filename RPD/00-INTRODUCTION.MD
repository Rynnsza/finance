# Rencana Pengembangan Produk — Aemy Finance ✦

> **Dokumen:** RPD (Rencana Pengembangan Produk)
> **Project:** Aemy Finance — aplikasi manajemen keuangan pribadi & bersama
> **Repo:** https://github.com/seaavey/finance (Open Source — MIT License)
> **Live:** https://seaavey.site
> **Status:** Aktif dikembangkan — pre-1.0
> **Tech Stack:** Vue 3 + Supabase + Vite + Tailwind CSS + TanStack Query

---

## 📖 Tentang Dokumen Ini

RPD ini adalah dokumen hidup (_living document_) yang merekam seluruh arah pengembangan Aemy Finance. Mulai dari visi, target pengguna, arsitektur teknis, database schema, API reference, roadmap, hingga tech debt yang diketahui.

Setiap keputusan besar dicatat di sini supaya tidak hilang ingatan — siapa yang buat, kenapa, dan apa konsekuensinya.

## 🗂️ Daftar Isi Singkat

| #   | Dokumen                       | Isi                                                  |
| --- | ----------------------------- | ---------------------------------------------------- |
| 00  | **DAFTAR-ISI**                | Indeks seluruh dokumen RPD                           |
| 01  | **VISI-MISI**                 | Visi, misi, prinsip produk, filosofi, target persona |
| 02  | **TARGET-PENGGUNA-PERSONA**   | Persona detail per segmen pengguna                   |
| 03  | **KONDISI-SAAT-INI**          | Kondisi proyek saat ini, apa yang sudah & belum      |
| 04  | **TECH-STACK-DETAIL**         | Alasan pemilihan tiap teknologi                      |
| 05  | **ARSITEKTUR-FRONTEND**       | Struktur komponen, routing, auto-import, layout      |
| 06  | **DATABASE-SCHEMA**           | Schema Supabase, RLS, hubungan tabel                 |
| 07  | **COMPOSABLE-API-REFERENCE**  | API reference semua composables                      |
| 08  | **ROUTING-LAYOUT**            | Routing structure, auth guard, layout system         |
| 09  | **ROW-LEVEL-SECURITY-RLS**    | Kebijakan RLS per tabel                              |
| 10  | **EDGE-FUNCTIONS-API**        | Deno Edge Functions & API endpoints                  |
| 11  | **MIGRATION-HISTORY**         | Riwayat migrasi database                             |
| 12  | **FITUR-IMPLEMENTASI-DETAIL** | Detail implementasi per fitur                        |
| 13  | **ROADMAP**                   | Rencana fitur short/mid/long-term                    |
| 14  | **TECH-DEBT-KNOWN-ISSUES**    | Utang teknis & masalah yang diketahui                |
| 15  | **PERFORMANCE-MONITORING**    | Metrik performa & strategi optimasi                  |
| 16  | **ENVIRONMENT-VARIABLES**     | Semua env var dan fungsinya                          |
| 17  | **DEPLOY-CICD**               | Pipeline & strategi deployment                       |
| 18  | **SECURITY-MODEL**            | Model keamanan & autentikasi                         |
| 19  | **GLOSSARY**                  | Istilah-istilah dalam proyek                         |

## 🚀 Status Proyek

| Aspek                    | Status                                                                      |
| ------------------------ | --------------------------------------------------------------------------- |
| Landing page             | ✅ Selesai (Hero, Features, Pricing, FAQ, Contact, Testimonials)            |
| Auth (Google OAuth)      | ✅ Selesai                                                                  |
| Dashboard                | ✅ Selesai (summary, charts, recent transactions)                           |
| Transactions CRUD        | ✅ Selesai (filter, search, bulk edit, split)                               |
| Categories CRUD          | ✅ Selesai                                                                  |
| Budgets                  | ✅ Selesai (multiple budgets, rollover, alerts)                             |
| Accounts / Balance       | ✅ Selesai (multi-account with balance)                                     |
| Recurring Transactions   | ✅ Selesai (auto-create, calendar)                                          |
| Split Transactions       | ✅ Selesai                                                                  |
| Transaction Attachments  | ✅ Selesai (receipt upload)                                                 |
| Currency Converter       | ✅ Selesai                                                                  |
| Bills / Debt Tracker     | ✅ Selesai                                                                  |
| Savings Goals            | ✅ Selesai                                                                  |
| Net Worth Chart          | ✅ Selesai                                                                  |
| OCR Receipt Scanning     | ✅ Selesai (via Edge Function)                                              |
| Couple Mode              | 🟡 Parsial (partner link, shared RLS — belum shared wallet)                 |
| PWA / Offline Banner     | 🟡 Parsial (Service Worker aktif, offline banner ada — belum offline-first) |
| i18n (ID/EN)             | ✅ Selesai                                                                  |
| Dark Mode                | ✅ Selesai                                                                  |
| Performance Engine (RPC) | ✅ Selesai                                                                  |

**Total fitur inti:** ~90% selesai untuk versi 1.0

## 🎯 Arah Pengembangan

**Fase sekarang** — Stabilisasi & polish:

- Tambah fitur yang kurang (tag, CSV import, PDF export)
- Improve UX (search lebih cepet, filter lebih pintar)
- Couple mode lengkap (shared wallet)

**Fase berikutnya** — AI & Insight:

- Spending insights, anomaly detection, auto-categorization
- Cashflow projection, financial health score
- AI chatbot assistant

**Fase akhir** — Scale & Ecosystem:

- Mobile app (Tauri/Capacitor)
- Multi-tenancy, family account
- Bank sync, Open API

Lihat [13-ROADMAP](./13-ROADMAP.MD) untuk detail lengkap timeline-nya.

## 💡 Cara Berkontribusi ke RPD

Dokumen ini di-maintain oleh **seaavey**. Setiap perubahan besar harus:

1. Update dokumen terkait di folder `RPD/`
2. Update `00-DAFTAR-ISI.MD` jika ada dokumen baru
3. Commit dengan pesan yang jelas

---
