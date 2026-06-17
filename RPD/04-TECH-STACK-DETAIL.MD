## 4. Tech Stack Detail

<sub>Alasan pemilihan tiap teknologi · 7 Jun 2026</sub>

---

### 🧠 Filosofi Pemilihan Tech Stack

**Prinsip utama:** _Minimal dependencies, maksimal fungsionalitas._ Setiap library harus punya alasan kuat — tidak ada "kepake 1 fungsi aja" atau "siapa tau berguna nanti."

| Prinsip                     | Penerapan                                                                     |
| --------------------------- | ----------------------------------------------------------------------------- |
| ⚡ **Performance-first**    | Vite 8 (Rolldown) + TanStack Query (caching) + RPC (query database)           |
| 🪶 **Bundle kecil**         | tree-shakeable, shadcn-vue (copy-paste, no import overhead)                   |
| 🔋 **Developer experience** | TypeScript 6, auto-import, auto-register components, bun                      |
| 🛡️ **Security**             | Supabase RLS, Google OAuth, service role key terbatas di Edge Functions       |
| 🌏 **Local relevance**      | Indonesia-first: Excel/Rupiah culture, mobile-first untuk penetrasi HP tinggi |

---

### 🌐 Frontend Production

| Paket                      | Versi     | Fungsi                       | Kenapa Dipilih                                                       |
| -------------------------- | --------- | ---------------------------- | -------------------------------------------------------------------- |
| `vue`                      | ^3.5.32   | Framework UI reaktif         | Composition API + `<script setup>` paling intuitif; weightnya ringan |
| `vue-router`               | ^5.0.4    | Routing SPA                  | Standar de facto untuk Vue; file-based via plugin                    |
| `vue-i18n`                 | ^11.4.4   | Internasionalisasi (ID + EN) | Standar Vue i18n; lightweight                                        |
| `@tanstack/vue-query`      | ^5.100.14 | Server state management      | Auto-cache, dedup, staleTime; gantiin store pattern                  |
| `@unhead/vue`              | ^3.1.1    | SEO / meta tags dinamis      | Reactive head management; Nuxt Head alternatif                       |
| `@unovis/vue`              | ^1.6.5    | Chart visualisasi            | Uniknya gabung bar + line + area dalam 1 chart type; accessible      |
| `@supabase/supabase-js`    | ^2.106.2  | Supabase client SDK          | Satu-satunya cara connect ke Supabase                                |
| `tailwindcss`              | ^4.3.0    | Utility-first CSS framework  | Dev speed gila; bundle kecil via JIT; v4 pake CSS-first config       |
| `@tailwindcss/vite`        | ^4.3.0    | Tailwind v4 Vite plugin      | Integrasi langsung tanpa PostCSS                                     |
| `tailwind-merge`           | ^3.6.0    | Utility class merger         | Biar gak bentrok class kustom + Tailwind                             |
| `tw-animate-css`           | ^1.4.0    | Animasi Tailwind             | Animasi ringan tanpa library JS                                      |
| `class-variance-authority` | ^0.7.1    | Variant-based styling        | shadcn-vue depend on ini                                             |
| `shadcn-vue`               | ^2.7.3    | UI component library         | Copy-paste → full control; gak perlu import overhead                 |
| `@iconify/vue`             | ^5.0.1    | Icon set (HugeIcons)         | 200k+ icons; tree-shakeable; PWA cache                               |
| `sortablejs-vue3`          | ^1.3.0    | Drag-and-drop                | Untuk future drag-drop dashboard widgets                             |
| `vite-plugin-pwa`          | ^1.3.0    | PWA service worker           | Workbox integration; one-config                                      |
| `vite-plugin-pages`        | ^0.33.3   | File-based routing           | Auto-generate routes dari `src/pages/`                               |

### 🛠️ Frontend Development

| Paket                     | Versi   | Fungsi                   | Kenapa                                      |
| ------------------------- | ------- | ------------------------ | ------------------------------------------- |
| `vite`                    | ^8.0.8  | Build tool (Rolldown)    | Rust-based bundler: 10x faster than webpack |
| `typescript`              | ~6.0.0  | Type checking            | Type safety tanpa runtime overhead          |
| `vue-tsc`                 | ^3.2.6  | Vue SFC type checker     | Type-check `.vue` files                     |
| `oxlint`                  | ~1.60.0 | Rust-based linter        | 50-100x lebih cepat dari ESLint             |
| `eslint`                  | ^10.2.1 | Linter                   | Fallback untuk rules yang belum di oxlint   |
| `prettier`                | 3.8.3   | Formatter                | Zero-config; integrasi editor               |
| `unplugin-auto-import`    | ^21.0.0 | Auto-import Vue APIs     | Gak perlu `import { ref } from 'vue'`       |
| `unplugin-vue-components` | ^32.1.0 | Auto-register components | Gak perlu `import Component from './...'`   |
| `@vitejs/plugin-vue`      | ^6.0.6  | Vue SFC compiler         | Wajib buat compile `.vue` files             |

### 🗄️ Backend & Infrastructure

| Layanan                     | Detail        | Fungsi                       | Kenapa                                                 |
| --------------------------- | ------------- | ---------------------------- | ------------------------------------------------------ |
| **Supabase PostgreSQL**     | 15.8          | Database utama               | Serverless Postgres; free tier generous; RLS built-in  |
| **Supabase Auth**           | Built-in      | Google OAuth, session        | No custom auth; gantiin Firebase Auth                  |
| **Supabase Storage**        | S3-compatible | Upload receipt + goal images | Satu ekosistem sama database                           |
| **Supabase Edge Functions** | Deno 2        | 4 serverless functions       | TypeScript di server; deploy via CLI                   |
| **Resend**                  | API v1        | Email undangan pasangan      | Developer experience oke; IDX domain; 100/day free     |
| **exchangerate.fun**        | REST API      | Kurs mata uang asing         | Gratis, support 20+ mata uang Asia                     |
| **Vercel**                  | Platform      | Hosting frontend             | Auto-deploy dari GitHub; global CDN; hobby plan gratis |

### ❌ Yang Sengaja Gak Dipake (dan Kenapa)

| Teknologi                 | Alasan Skip                                                   |
| ------------------------- | ------------------------------------------------------------- |
| **Pinia / Vuex**          | TanStack Query udah handle server state; client state minimal |
| **Axios**                 | `supabase-js` built-in; fetch API cukup untuk fallback        |
| **Sass / Less**           | Tailwind v4 pake CSS variables + nesting native               |
| **Chart.js / ApexCharts** | Unovis lebih modern, accessible, tree-shakeable               |
| **Vuetify / PrimeVue**    | Bundle gede; shadcn-vue lebih ringan + full control           |
| **Nuxt**                  | Overkill untuk SPA sederhana; Vite + vue-router cukup         |
| **tRPC**                  | Supabase RPC udah cover kebutuhan stored procedure            |
| **Zustand / Jotai**       | `ref` + computed cukup untuk semua client state               |

---
