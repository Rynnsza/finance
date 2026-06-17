## 9. Row-Level Security (RLS)

<sub>~40 policies · 11 tabel · Couple-aware · 7 Jun 2026</sub>

---

### 9.1 Filosofi RLS

> **Prinsip:** Data user adalah data user. Kalaupun pasangan bisa lihat, itu karena eksplisit diizinkan.

- Setiap tabel user-scoped punya **minimum 4 policies** (SELECT, INSERT, UPDATE, DELETE)
- Couple mode menambahkan **1-2 policy tambahan** untuk akses pasangan
- Policy ditulis per tabel, bukan per query — consistent enforcement tanpa bisa dilewati
- Tidak ada bypass RLS di client (`supabase-js` always respect RLS)

### 9.1 Policy Pattern

Semua tabel user-scoped mengikuti pola:

```sql
-- SELECT: user can only see own rows
CREATE POLICY "Users can view own X"
  ON public.X FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT: auto-set user_id from auth context
CREATE POLICY "Users can insert own X"
  ON public.X FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: only own rows
CREATE POLICY "Users can update own X"
  ON public.X FOR UPDATE
  USING (auth.uid() = user_id);

-- DELETE: only own rows
CREATE POLICY "Users can delete own X"
  ON public.X FOR DELETE
  USING (auth.uid() = user_id);
```

### 9.2 Couple Mode RLS (Special)

Saat couple mode aktif, RLS diperluas untuk mengizinkan akses pasangan:

```sql
-- Policy: user dapat melihat data milik pasangan juga
CREATE POLICY "couple_select"
  ON public.transactions FOR SELECT
  USING (
    auth.uid() = user_id
    OR auth.uid() IN (
      SELECT partner_id FROM profiles WHERE id = user_id
    )
  );
```

Ini diterapkan di tabel: `transactions`, `accounts`, `categories` (read-only untuk partner).

### 9.3 Tabel dengan RLS

| Tabel                    | Policies                   | Couple? | Detail Policy                                                                                                 |
| ------------------------ | -------------------------- | :-----: | ------------------------------------------------------------------------------------------------------------- |
| `profiles`               | 3 (select, update, insert) |    ✗    | SELECT: bisa lihat profile partner via `partner_id` lookup; UPDATE: hanya field tertentu; INSERT: via trigger |
| `categories`             | 5 (4 CRUD + 1 couple)      |    ✓    | Couple: partner bisa SELECT kategori pasangan (read-only)                                                     |
| `transactions`           | 6 (4 CRUD + 2 couple)      |    ✓    | Couple: partner bisa SELECT + UPDATE + DELETE transaksi pasangan                                              |
| `accounts`               | 5 (4 CRUD + 1 couple)      |    ✓    | Couple: partner bisa SELECT akun pasangan (read-only)                                                         |
| `budgets`                | 4 (CRUD)                   |    ✗    | —                                                                                                             |
| `bills`                  | 4 (CRUD)                   |    ✗    | —                                                                                                             |
| `recurring_transactions` | 4 (CRUD)                   |    ✗    | —                                                                                                             |
| `goals`                  | 5 (4 CRUD + 1 couple)      |    ✓    | Couple: partner bisa SELECT goals pasangan (migration #34)                                                    |
| `activity_logs`          | 4 (CRUD)                   |    ✗    | —                                                                                                             |
| `couple_invitations`     | 6                          |   N/A   | Rules: sender bisa CRUD, recipient bisa SELECT + UPDATE (accept/reject), unique per email+sender              |

### 9.4 Keamanan RLS: Yang Pernah Bocor & Diperbaiki

| Migration        | Issue                                        | Fix                          |
| ---------------- | -------------------------------------------- | ---------------------------- |
| `20260602000001` | RLS vulnerability di storage bucket receipts | Tambah policy bucket         |
| `20260602000002` | `exchange_rates` bisa di-write siapa saja    | Tambah RLS read-only         |
| `20260602000003` | Receipt bucket public read                   | Ubah ke private + signed URL |
| `20260604000000` | Partner gak bisa UPDATE transaksi            | Tambah couple UPDATE policy  |
| `20260604000001` | Partner gak bisa DELETE transaksi            | Tambah couple DELETE policy  |
| `20260606000000` | Partner gak bisa lihat goals                 | Tambah couple SELECT policy  |

### 9.5 Storage Bucket RLS

| Bucket           | Type    | Policy                                                                                                           |
| ---------------- | ------- | ---------------------------------------------------------------------------------------------------------------- |
| `receipts`       | Private | SELECT: hanya user yang upload (via signed URL 10 menit, generated by Edge Function); INSERT: user authenticated |
| `goal-images`    | Public  | SELECT: public read; INSERT/DELETE: hanya authenticated user & file owner                                        |
| `profile-images` | Public  | (Belum dipakai — future: upload avatar kustom)                                                                   |

---

---
