## 12. Fitur & Implementasi Detail

<sub>9 fitur utama · detail pipeline, algoritma, strategi · 7 Jun 2026</sub>

---

### 12.1 Dashboard Bento-Grid

**File:** `pages/dashboard.vue`
**Komponen:** `DashboardSummary.vue` · charts/ · `BillDashboardWidget.vue`

**Layout bento-grid asimetris:**

```
┌───────────────┬────────────────┬──────────────┐
│  Total        │  Monthly       │  Period      │
│  Balance 💰   │  Summary 📊    │  Filter      │
├───────┬───────┴────────────────┴──────────────┤
│       │                                       │
│ Donut │  Barchart Income vs Expense            │
│ Chart │  (6 bulan)                             │
│ (kate-│                                       │
│ gori) │                                       │
├───────┴───────────────────┬───────────────────┤
│                           │                   │
│  Net Worth Area Chart     │  Budget Progress  │
│  (6 bulan historical)     │  (top 4 budgets)  │
│                           │                   │
├───────────────────────────┴───────────────────┤
│  Reminders (tagihan H-7)                      │
│  Recent Transactions (5 terbaru)              │
│  Quick Actions (Tambah transaksi, dll)        │
└───────────────────────────────────────────────┘
```

**Data Flow:**

1. Mount → parallel fetch: `getTransactionSummary`, `getCategoryStats`, `getConvertedBalances`, `fetchNetWorthHistory`, `bills`, `budgetWithProgress`
2. Period change (1d/7d/30d/all) → refetch summary + category stats
3. Auto-refresh saat navigasi kembali (staleTime 30s untuk transaksi)

### 12.2 Multi-Mata Uang

**Pipeline:**

```
User set profile.currency = 'IDR'  ← base currency
        │
        ▼
Setiap transaksi: punya field currency sendiri (default: base)
        │
        ▼
Setiap akun: punya currency sendiri (bisa berbeda dengan base)
        │
        ▼
Rendering:
  useCurrency().formatCurrency(amount, currency) → Rp 1.000.000 / $1,000.00
  useCurrency().convertTo(amount, from, to)      → Konversi value
  useAccounts().getConvertedBalances()            → Semua saldo dalam base
  useNetWorth()                                   → Net worth dalam base
```

**Rate Sources:**

1. **Primary:** `exchange_rates` table (di-sync dari Edge Function `sync-rates`)
2. **Fallback:** Fetch langsung dari `exchangerate.fun` (client-side, cached module-level)

**Currencies Supported:** IDR, MYR, SGD, THB, PHP, VND, MMK, KHR, LAK, BND, JPY, KRW, CNY, TWD, HKD, INR, BDT, PKR, LKR, NPR — 20 mata uang Asia.

**Edge Cases:**

- Rate expired (>1 jam) → fallback ke API langsung
- Rate untuk pair tidak langsung (USD→JPY tanpa base IDR) → convert via IDR
- Amount 0 atau null → tampilkan "Rp 0"
- Currency tidak dikenal → fallback ke IDR

### 12.3 Couple Mode

**Flow Undangan:**

```
User A → Input email User B
  → Insert ke couple_invitations (status: pending)
    → Panggil Edge Function send-couple-invite (fire-and-forget)
      → Resend kirim email ke User B (berisi link + token)

User B → Login/Register → Dashboard
  → Notifikasi "Kamu punya undangan dari User A"
  → Lihat detail → Klik Accept
    → RPC accept_couple_invitation(invitationId)
      → Update profiles.partner_id untuk kedua user
        → RLS partner policies otomatis aktif
          → Data bersama!
```

**Flow Disconnect:**

```
User A → Settings → Disconnect Partner → Konfirmasi
  → RPC disconnect_partner()
    → Hapus partner_id dari profile User A dan User B
      → RLS partner policies non-aktif
        → Masing-masing lihat data sendiri lagi
```

**Shared Data:**
| Tabel | Level Akses |
|-------|-------------|
| `transactions` | Read + Write (partner bisa add/edit/delete) |
| `accounts` | Read-only |
| `categories` | Read-only |
| `goals` | Read-only |
| `budgets` | ❌ Not shared |
| `bills` | ❌ Not shared |
| `activity_logs` | ❌ Not shared |

### 12.4 OCR Receipt Scanning

**File:** `src/composables/useReceipts.ts` · `supabase/functions/ocr-receipt/`

**Pipeline:**

```
User pilih gambar (camera / gallery)
  │
  ▼
validateFile() — cek format (jpg/png/webp) + ukuran (<5MB)
  │
  ▼
compressImage() — canvas: max 1920px, JPEG quality 0.7
  │
  ▼
uploadToStorage() — Supabase private bucket 'receipts'
  │ generate UUID filename → upload blob
  ▼
createSignedUrl() — 10 menit expiry untuk akses private bucket
  │
  ▼
callScanEndpoint() — POST /functions/v1/ocr-receipt { imageUrl }
  │ Edge Function: fetch image → AI chat API → parse receipt data
  ▼
Return ReceiptData → Auto-fill form transaksi:
  • amount, currency, date, description
  • category (AI tebak dari item name)
  • merchant name
```

**Error Handling Matrix:**
| Kondisi | Response | UX |
|---------|----------|-----|
| Format tidak valid (gif, pdf) | Toast error "Format tidak didukung" | User pilih file lain |
| Ukuran >5MB | Toast error "Ukuran maksimal 5MB" | User pilih file lebih kecil |
| Upload gagal | Toast error + log | Retry button |
| AI scan gagal (struk buram) | Toast error "Tidak bisa membaca struk" | User bisa input manual |
| Network error | Toast error "Koneksi terputus" | Coba lagi nanti |

### 12.5 Net Worth Calculation

**File:** `src/composables/useNetWorth.ts`

**Algorithm (single-pass, O(n)):**

```
1. Fetch semua accounts: [{id, type, currency, initial_balance}]
2. Fetch semua transactions N bulan terakhir: [{account_id, type, amount, date}]
3. Sort transactions ascending by date
4. Inisialisasi runningBalance per account

5. For each month boundary (bulan M):
   a. Apply semua transactions dari bulan M ke runningBalance
   b. Separate:
      - Asset accounts: bank, e-wallet, cash, investment → total_assets
      - Liability accounts: utang, kartu kredit → total_debts
   c. Convert to base currency (pakai exchange_rates)
   d. netWorth = total_assets - total_debts
   e. Push ke result: { label, assets, debts, netWorth }

6. Return array NetWorthData[]
```

**Performance Concern:** O(months × accounts + transactions) — untuk 6 bulan ~1000 transaksi OK. Untuk 12+ bulan dengan ribuan transaksi, perlu batching.

**Future Optimization:** Windowed query — fetch per bulan dengan range, bukan semua data sekaligus.

### 12.6 PWA Setup

**File:** `vite.config.ts` (VitePWA plugin) · `src/App.vue`

**Service Worker Strategy:**
| Resource | Strategy | Reasoning |
|----------|----------|-----------|
| Iconify icons | StaleWhileRevalidate | Ikon jarang berubah, tapi tetap cek update |
| Supabase API | NetworkFirst | Data harus latest, fallback ke cache saat offline |
| App shell | CacheFirst (precache) | HTML/CSS/JS should load instantly |

**Offline Handling:**

- `useOnline()` dari `@vueuse/core`
- Saat offline → banner merah "Kamu sedang offline — menampilkan data cache"
- Saat online kembali → banner hilang otomatis
- **Belum:** Queue transaksi offline untuk sync saat online

**Manifest:**

- Name: Aemy Finance
- Theme: #0f0f0f (dark) / #ffffff (light)
- Display: standalone
- Icons: 192x192, 512x512 (including maskable)

### 12.7 Dark Mode

**File:** `src/styles/globals.css` · `src/composables/nuxt-compat.ts` (useColorMode)

**Implementation:** CSS variables + class `dark` di `<html>`.

```css
:root {
  --bg: #ffffff;
  --text: #000000;
  --card: #ffffff;
  --muted: #f5f5f5;
  --border: #e5e5e5;
}
.dark {
  --bg: #0f0f0f;
  --text: #ededed;
  --card: #1a1a1a;
  --muted: #262626;
  --border: #333333;
}
```

**Flow:**

1. User toggle dark mode (sidebar or settings page)
2. Set `localStorage` value
3. Add/remove class `dark` di `<html>`
4. All CSS variables react → instant theme switch
5. Chart components auto-adjust via CSS var

### 12.8 Optimasi Query & Performance (RPC)

**File:** `supabase/migrations/20260609000000_dashboard_summary_rpc.sql` · `...category_stats_rpc.sql` · `...performance_tuning.sql`

Untuk menangani volume transaksi yang besar dan konversi mata uang yang kompleks:

**`get_transaction_summary` (Dashboard):**

- Sebelum: Frontend fetch semua transaksi → loop konversi manual → hitung total → **lambat**
- Sesudah: Satu query di PostgreSQL → konversi mata uang di level DB → return 3 angka → **< 10ms**

**`get_category_stats` (Budget & Donut Chart):**

- Sebelum: Fetch semua transaksi di suatu range → group by category di JS
- Sesudah: `GROUP BY category_id` di DB → return `[{ category_id, total, count }]` → **< 20ms**

**Indexing Strategy:**
| Index Type | Digunakan di | Query yang diuntungkan |
|-----------|-------------|----------------------|
| B-tree `(user_id, date DESC)` | transactions | Dashboard: 5 transaksi terbaru |
| B-tree `(user_id, type)` | transactions | Filter expense/income |
| B-tree `(category_id)` | transactions | Budget progress |
| B-tree `(account_id)` | transactions | Account balance |
| B-tree `(user_id, active)` | recurring | Filter recurring aktif |
| B-tree `(user_id)` | categories, goals | Join queries |

### 12.9 Konverter Mata Uang

**File:** `pages/converter/index.vue` · `src/composables/useCurrency.ts`

**Fitur:**

- Real-time conversion: input amount → pilih source → pilih target → lihat hasil
- Quick Conversion buttons: 1, 10, 50, 100, 1000, 10000
- Swap button: tukar source ↔ target
- Auto-format dengan `Intl.NumberFormat` (IDR tanpa desimal, USD 2 desimal)
- Rate info: "1 IDR = X USD" + last updated timestamp

**Rate freshness indicator:**

- Hijau: < 30 menit
- Kuning: 30-60 menit
- Merah: > 60 menit (perlu refresh)

### 12.10 Account Transfer

**Model:** Linked Transactions (Double-Entry).

**Mekanisme:**
1. User memilih "Transfer" di form transaksi.
2. Form mengumpulkan: `from_account_id`, `to_account_id`, `amount`, `date`, dan `description`.
3. Sistem membuat **dua** record di tabel `transactions`:
   - **Record 1:** `type: 'expense'`, `account_id: from_account_id`, `amount: amount`.
   - **Record 2:** `type: 'income'`, `account_id: to_account_id`, `amount: amount` (atau `to_amount` jika konversi kurs).
4. Kedua record diberikan `transfer_id` (UUID) yang sama.
5. Kategori diset otomatis ke kategori sistem "Transfer".

**Sinkronisasi:**
- **Hapus:** Jika salah satu transaksi dengan `transfer_id` dihapus, pasangannya otomatis ikut terhapus.
- **Edit:** Perubahan pada satu sisi transfer akan merefleksikan perubahan pada sisi lainnya untuk menjaga konsistensi saldo.

---
