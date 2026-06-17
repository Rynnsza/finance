## 14. Tech Debt & Known Issues

<sub>Prioritas 🔴 🟡 🟢 · Terus diperbarui · 7 Jun 2026</sub>

---

### 📊 Summary

|      Level       | Jumlah | Estimasi Effort Total |
| :--------------: | :----: | :-------------------: |
|     🔴 High      |   3    |       ~1 minggu       |
|    🟡 Medium     |   5    |      ~1-2 minggu      |
|      🟢 Low      |   5    |       ~1 minggu       |
| ✨ Sudah dibayar |   3    |           —           |

### 🔴 High Priority

|    ID     | Issue                        | Detail                                                                                                                                                          |                      Impact                       | Proposed Fix                                               | Effort |
| :-------: | ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-----------------------------------------------: | ---------------------------------------------------------- | :----: |
| **TD-01** | **No test infrastructure**   | Zero unit tests, zero E2E tests. Every deploy is a leap of faith.                                                                                               |          🚨 Risk regression tiap deploy           | Setup Vitest + Vue Test Utils + Playwright                 | 5 hari |
| **TD-02** | **No error boundary**        | Tidak ada global error handler / error boundary component. Kalau ada runtime error di 1 widget → seluruh halaman white-screen.                                  |        🚨 UI bisa white-screen tanpa pesan        | Vue `errorCaptured` + global handler + fallback UI         | 1 hari |
| **TD-03** | **Nuxt compatibility shims** | `nuxt-compat.ts` (mocks useI18n, useColorMode), `ClientOnly.vue`, `NuxtLinkLocale`, `NuxtLink` — semua ini adalah sisa migrasi Nuxt→Vue yang belum dibersihkan. | 🟡 Dead code, bisa membingungkan kontributor baru | Bersihkan gradual setelah semua dependensi ke shim dihapus | 2 hari |

### 🟡 Medium Priority

|    ID     | Issue                             | Detail                                                                                                                          |                                Impact                                 | Proposed Fix                                      | Effort |
| :-------: | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------: | ------------------------------------------------- | :----: |
| **TD-04** | **`as any` type assertions**      | ~15 tempat masih pake `as any` (navigator.standalone, JSON.parse, RPC response, dll).                                           |            🟡 Type safety berkurang, bisa masking real bug            | Intersection types + type guards + Zod validation | 2 hari |
| **TD-05** | **Hardcoded staleTimes**          | Setiap composable define `staleTime` sendiri-sendiri sebagai angka hardcoded (30s, 5m, 1m, dll).                                |                🟢 Inkonsisten, susah di-tuning global                 | Centralized config object `STALE_TIMES`           | 1 hari |
| **TD-06** | **No pagination budget history**  | Budget hanya menampilkan bulan aktif — tidak ada cara lihat histori budget bulan lalu.                                          |                🟡 Tidak bisa tracking perubahan budget                | Budget history table + monthly snapshot           | 2 hari |
| **TD-07** | **Fire-and-forget activity logs** | `activity.log()` pake fire-and-forget dengan try/catch — jika log gagal, tidak ada retry. Potensi loss data audit.              | 🟡 Bisa loss data log penting (belum kritis karena hanya audit trail) | Queue + batch insert + retry logic                | 1 hari |
| **TD-08** | **No input validation**           | Tidak ada validasi frontend untuk amount negative, date di masa depan, deskripsi kosong, dll. Hanya mengandalkan constraint DB. |  🟡 Data integrity risiko, UX jelek (error dari DB bukan dari form)   | Zod schema + form validation di semua form        | 2 hari |

### 🟢 Low Priority

|    ID     | Issue                          | Detail                                                                           |                       Impact                       | Proposed Fix                                      |  Effort  |
| :-------: | ------------------------------ | -------------------------------------------------------------------------------- | :------------------------------------------------: | ------------------------------------------------- | :------: |
| **TD-09** | **No rate limiting pada API**  | Edge Functions (`ocr-receipt`) tanpa rate limiter — bisa di-spam.                |   🟢 Abuse risk (tapi hanya authenticated user)    | Rate limiting di Edge Function (per user/min)     |  1 hari  |
| **TD-10** | **Console.warn di production** | `console.warn` di `usePartner.ts`.                                               |             🟢 Kotor, bisa bocor info              | Remove atau ganti logging service                 | 15 menit |
| **TD-11** | **Hardcoded API URL**          | `exchangerate.fun` hardcoded di `useCurrency.ts`.                                |           🟢 Vendor lock-in, susah ganti           | Environment variable `VITE_EXCHANGE_RATE_API_URL` | 30 menit |
| **TD-12** | **No pagination di net worth** | `fetchNetWorthHistory` fetch SEMUA transactions dalam N bulan → bisa O(n) besar. | 🟢 Bisa lambat untuk heavy user (ribuan transaksi) | Windowed query per bulan                          |  1 hari  |
| **TD-13** | **CSS class inconsistencies**  | Campuran Tailwind utility classes + custom CSS di beberapa tempat.               |               🟢 Maintenance burden                | CSS audit + standarisasi                          |  2 hari  |

### ✅ Sudah Dibayar (Fixed Tech Debt)

| Item                                         |  Fix Date  | Fix                                                                      |
| -------------------------------------------- | :--------: | ------------------------------------------------------------------------ |
| ~~RLS vulnerability di storage bucket~~      | 2 Jun 2026 | Migration `20260602000003` — receipts bucket di-private-kan + signed URL |
| ~~`exchange_rates` bisa di-write siapa aja~~ | 2 Jun 2026 | Migration `20260602000002` — RLS read-only                               |
| ~~No query optimization~~                    | 3 Jun 2026 | Migration `20260603000001` — indexes composite                           |

### 📈 Debt Trend

```
Mei 23:   🏗️ Init — debt rendah (0 migration fixes)
Mei 24-26: ✨ Features — debt mulai menumpuk
Jun 1-2:  🔥 🔥 🔥 3 security issues found + fixed
Jun 7:    📋 Debt ini didokumentasikan — first step to fix
Target:   ↓ Turunkan 🔴 ke 0 dalam 2 minggu
```

---
