## 6. Database Schema

<sub>PostgreSQL 15 di Supabase · 12 tabel · 44 migrasi · 8 Jun 2026</sub>

---

### 📐 Entity Relationship (Mental Model)

```
profiles (1) ──── (1) profiles       # Couple pair
profiles (1) ──── (*) categories      # Owned categories
profiles (1) ──── (*) accounts        # Owned accounts
profiles (1) ──── (*) transactions    # Owned transactions
profiles (1) ──── (*) budgets         # Owned budgets
profiles (1) ──── (*) bills           # Owned bills
profiles (1) ──── (*) recurring       # Owned recurring
profiles (1) ──── (*) subscriptions   # Owned subscriptions
profiles (1) ──── (*) goals           # Owned goals
profiles (1) ──── (*) activity_logs   # Owned audit trail

categories (1) ──── (*) transactions   # Each transaction has a category
accounts   (1) ──── (*) transactions   # Each transaction can be tied to an account
```

couple_invitations — standalone table (temporary invitation records)
exchange_rates — standalone table (rates cache, no user ownership)

### 6.1 Tabel: `profiles`

| Kolom          | Tipe          | Default | Constraint                            | Deskripsi                 |
| -------------- | ------------- | ------- | ------------------------------------- | ------------------------- |
| `id`           | `uuid`        | —       | PK → auth.users(id) ON DELETE CASCADE | User ID                   |
| `display_name` | `text`        | —       | —                                     | Nama tampilan             |
| `currency`     | `text`        | `'IDR'` | —                                     | Base currency             |
| `avatar_url`   | `text`        | —       | —                                     | Foto profil dari Google   |
| `partner_id`   | `uuid`        | —       | → profiles(id)                        | ID pasangan (couple mode) |
| `created_at`   | `timestamptz` | `now()` | —                                     | Waktu dibuat              |
| `updated_at`   | `timestamptz` | `now()` | —                                     | Waktu diupdate            |

**Trigger:** `on_auth_user_created` — auto-create profile saat user signup via Google OAuth.

### 6.2 Tabel: `categories`

| Kolom        | Tipe          | Default             | Constraint                              | Deskripsi         |
| ------------ | ------------- | ------------------- | --------------------------------------- | ----------------- |
| `id`         | `uuid`        | `gen_random_uuid()` | PK                                      | —                 |
| `user_id`    | `uuid`        | —                   | → auth.users(id) ON DELETE CASCADE      | Pemilik           |
| `name`       | `text`        | —                   | NOT NULL                                | Nama kategori     |
| `icon`       | `text`        | —                   | —                                       | Iconify icon name |
| `color`      | `text`        | `'#6366f1'`         | —                                       | Warna hex         |
| `type`       | `text`        | —                   | `CHECK (type IN ('income', 'expense'))` | Tipe              |
| `created_at` | `timestamptz` | `now()`             | —                                       | —                 |

**Default Categories:**

| Income       | Expense      |
| ------------ | ------------ |
| Gaji 💰      | Makanan 🍽️   |
| Freelance 💻 | Transport 🚗 |
| Investasi 📈 | Belanja 🛍️   |
| Lainnya 📌   | Tagihan 📄   |
|              | Hiburan 🎮   |
|              | Kesehatan 💊 |
|              | Lainnya 📌   |

### 6.3 Tabel: `transactions`

| Kolom         | Tipe          | Default             | Constraint                              | Deskripsi                   |
| ------------- | ------------- | ------------------- | --------------------------------------- | --------------------------- |
| `id`          | `uuid`        | `gen_random_uuid()` | PK                                      | —                           |
| `user_id`     | `uuid`        | —                   | → auth.users(id) ON DELETE CASCADE      | Pemilik                     |
| `category_id` | `uuid`        | —                   | → categories(id) ON DELETE SET NULL     | Kategori                    |
| `account_id`  | `uuid`        | —                   | → accounts(id) ON DELETE SET NULL       | Akun (opsional)             |
| `type`        | `text`        | —                   | `CHECK (type IN ('income', 'expense'))` | Tipe                        |
| `amount`      | `numeric`     | `0`                 | NOT NULL                                | Jumlah                      |
| `currency`    | `text`        | `'IDR'`             | —                                       | Mata uang                   |
| `description` | `text`        | —                   | —                                       | Deskripsi/catatan           |
| `date`        | `date`        | `current_date`      | NOT NULL                                | Tanggal transaksi           |
| `image_url`   | `text`        | —                   | —                                       | URL lampiran (receipt)      |
| `transfer_id` | `uuid`        | —                   | —                                       | ID untuk transfer terhubung |
| `metadata`    | `jsonb`       | `'{}'`              | —                                       | Data tambahan/audit         |
| `splits`      | `jsonb`       | `'[]'`              | —                                       | Split ke multiple kategori  |
| `created_at`  | `timestamptz` | `now()`             | —                                       | —                           |
| `updated_at`  | `timestamptz` | `now()`             | —                                       | —                           |

**Indexes:**

| Index Name                     | Columns                | Type   | Untuk Query                                    |
| ------------------------------ | ---------------------- | ------ | ---------------------------------------------- |
| `idx_transactions_user_date`   | `(user_id, date DESC)` | B-tree | Dashboard: "transaksi saya, diurutkan tanggal" |
| `idx_transactions_user_type`   | `(user_id, type)`      | B-tree | Filter: "transaksi expense saja"               |
| `idx_transactions_category_id` | `(category_id)`        | B-tree | Budget: "jumlah spending per kategori"         |
| `idx_transactions_account_id`  | `(account_id)`         | B-tree | Balance: "saldo akun ini"                      |
| `idx_transactions_transfer_id` | `(transfer_id)`        | B-tree | "Cari pasangan transfer"                       |

| Plus indexes from migration `20260603000001` (composite + partial)

### 6.4 Tabel: `accounts`

| Kolom             | Tipe          | Default             | Constraint                                                                | Deskripsi         |
| ----------------- | ------------- | ------------------- | ------------------------------------------------------------------------- | ----------------- |
| `id`              | `uuid`        | `gen_random_uuid()` | PK                                                                        | —                 |
| `user_id`         | `uuid`        | —                   | → auth.users(id) ON DELETE CASCADE                                        | Pemilik           |
| `name`            | `text`        | —                   | NOT NULL                                                                  | Nama akun         |
| `type`            | `text`        | —                   | `CHECK (type IN ('bank', 'e-wallet', 'cash', 'investment', 'liability'))` | Jenis akun        |
| `currency`        | `text`        | `'IDR'`             | —                                                                         | Mata uang akun    |
| `color`           | `text`        | —                   | —                                                                         | Warna tampilan    |
| `icon`            | `text`        | —                   | —                                                                         | Iconify icon name |
| `initial_balance` | `numeric`     | `0`                 | —                                                                         | Saldo awal        |
| `created_at`      | `timestamptz` | `now()`             | —                                                                         | —                 |
| `updated_at`      | `timestamptz` | `now()`             | —                                                                         | —                 |

**Account Types:** `bank`, `e-wallet`, `cash`, `investment`, `liability`

### 6.5 Tabel: `budgets`

| Kolom         | Tipe          | Default             | Constraint                         | Deskripsi      |
| ------------- | ------------- | ------------------- | ---------------------------------- | -------------- |
| `id`          | `uuid`        | `gen_random_uuid()` | PK                                 | —              |
| `user_id`     | `uuid`        | —                   | → auth.users(id) ON DELETE CASCADE | Pemilik        |
| `category_id` | `uuid`        | —                   | → categories(id) ON DELETE CASCADE | Kategori       |
| `name`        | `text`        | —                   | —                                  | Nama budget    |
| `month`       | `text`        | —                   | NOT NULL (format: `YYYY-MM`)       | Periode budget |
| `amount`      | `numeric`     | —                   | NOT NULL                           | Alokasi budget |
| `created_at`  | `timestamptz` | `now()`             | —                                  | —              |
| `updated_at`  | `timestamptz` | `now()`             | —                                  | —              |

### 6.6 Tabel: `bills`

| Kolom                  | Tipe          | Default             | Constraint                                            | Deskripsi           |
| ---------------------- | ------------- | ------------------- | ----------------------------------------------------- | ------------------- |
| `id`                   | `uuid`        | `gen_random_uuid()` | PK                                                    | —                   |
| `user_id`              | `uuid`        | —                   | → auth.users(id) ON DELETE CASCADE                    | Pemilik             |
| `title`                | `text`        | —                   | NOT NULL                                              | Nama tagihan        |
| `amount`               | `numeric`     | —                   | NOT NULL                                              | Jumlah              |
| `due_date`             | `date`        | —                   | NOT NULL                                              | Tanggal jatuh tempo |
| `is_paid`              | `boolean`     | `false`             | —                                                     | Status bayar        |
| `paid_with_account_id` | `uuid`        | —                   | → accounts(id) ON DELETE SET NULL                     | Akun pembayaran     |
| `recurrence`           | `text`        | `'none'`            | `CHECK (recurrence IN ('none', 'weekly', 'monthly'))` | Frekuensi ulang     |
| `created_at`           | `timestamptz` | `now()`             | —                                                     | —                   |
| `updated_at`           | `timestamptz` | `now()`             | —                                                     | —                   |

### 6.7 Tabel: `recurring_transactions`

| Kolom         | Tipe          | Default             | Constraint                                                      | Deskripsi          |
| ------------- | ------------- | ------------------- | --------------------------------------------------------------- | ------------------ |
| `id`          | `uuid`        | `gen_random_uuid()` | PK                                                              | —                  |
| `user_id`     | `uuid`        | —                   | → auth.users(id) ON DELETE CASCADE                              | Pemilik            |
| `type`        | `text`        | —                   | `CHECK (type IN ('income', 'expense'))`                         | Tipe               |
| `amount`      | `numeric`     | `0`                 | NOT NULL                                                        | Jumlah             |
| `currency`    | `text`        | `'IDR'`             | —                                                               | Mata uang          |
| `category_id` | `uuid`        | —                   | → categories(id) ON DELETE SET NULL                             | Kategori           |
| `description` | `text`        | —                   | —                                                               | Deskripsi          |
| `frequency`   | `text`        | —                   | `CHECK (frequency IN ('daily', 'weekly', 'monthly', 'yearly'))` | Frekuensi          |
| `next_date`   | `date`        | —                   | NOT NULL                                                        | Tanggal berikutnya |
| `active`      | `boolean`     | `true`              | —                                                               | Status aktif       |
| `created_at`  | `timestamptz` | `now()`             | —                                                               | —                  |
| `updated_at`  | `timestamptz` | `now()`             | —                                                               | —                  |

**Index:** `idx_recurring_user_active` ON `(user_id, active)`

### 6.8 Tabel: `subscriptions`

| Kolom               | Tipe          | Default             | Constraint                                                 | Deskripsi              |
| ------------------- | ------------- | ------------------- | ---------------------------------------------------------- | ---------------------- |
| `id`                | `uuid`        | `gen_random_uuid()` | PK                                                         | —                      |
| `user_id`           | `uuid`        | —                   | → auth.users(id) ON DELETE CASCADE                         | Pemilik                |
| `name`              | `text`        | —                   | NOT NULL                                                   | Nama layanan           |
| `amount`            | `numeric`     | —                   | NOT NULL                                                   | Biaya                  |
| `currency`          | `text`        | `'IDR'`             | —                                                          | Mata uang              |
| `billing_cycle`     | `text`        | —                   | `CHECK (billing_cycle IN ('weekly', 'monthly', 'yearly'))` | Siklus tagihan         |
| `next_billing_date` | `date`        | —                   | NOT NULL                                                   | Tanggal tagihan berikt |
| `category_id`       | `uuid`        | —                   | → categories(id) ON DELETE SET NULL                        | Kategori               |
| `account_id`        | `uuid`        | —                   | → accounts(id) ON DELETE SET NULL                          | Akun pembayaran        |
| `active`            | `boolean`     | `true`              | —                                                          | Status aktif           |
| `reminder_days`     | `integer`     | `1`                 | —                                                          | H-x pengingat          |
| `created_at`        | `timestamptz` | `now()`             | —                                                          | —                      |
| `updated_at`        | `timestamptz` | `now()`             | —                                                          | —                      |

**Index:** `idx_subscriptions_user_id` ON `(user_id)`

### 6.9 Tabel: `goals`

| Kolom            | Tipe          | Default             | Constraint                         | Deskripsi           |
| ---------------- | ------------- | ------------------- | ---------------------------------- | ------------------- |
| `id`             | `uuid`        | `gen_random_uuid()` | PK                                 | —                   |
| `user_id`        | `uuid`        | —                   | → auth.users(id) ON DELETE CASCADE | Pemilik             |
| `name`           | `text`        | —                   | NOT NULL                           | Nama target         |
| `target_amount`  | `numeric`     | —                   | NOT NULL                           | Target nominal      |
| `current_amount` | `numeric`     | `0`                 | —                                  | Dana terkumpul      |
| `deadline`       | `date`        | —                   | —                                  | Deadline (opsional) |
| `icon`           | `text`        | —                   | —                                  | Icon                |
| `color`          | `text`        | `'#6366f1'`         | —                                  | Warna               |
| `image_url`      | `text`        | —                   | —                                  | URL gambar target   |
| `created_at`     | `timestamptz` | `now()`             | —                                  | —                   |
| `updated_at`     | `timestamptz` | `now()`             | —                                  | —                   |

**Index:** `idx_goals_user_id` ON `(user_id)`

### 6.10 Tabel: `activity_logs`

| Kolom         | Tipe          | Default             | Constraint                         | Deskripsi                                                |
| ------------- | ------------- | ------------------- | ---------------------------------- | -------------------------------------------------------- |
| `id`          | `uuid`        | `gen_random_uuid()` | PK                                 | —                                                        |
| `user_id`     | `uuid`        | —                   | → auth.users(id) ON DELETE CASCADE | Pelaku                                                   |
| `entity_type` | `text`        | —                   | NOT NULL                           | Tipe entitas (`transaction`, `category`, `budget`, dll.) |
| `entity_id`   | `uuid`        | —                   | —                                  | ID entitas terkait                                       |
| `action`      | `text`        | —                   | NOT NULL                           | Aksi (`created`, `updated`, `deleted`, `login`, dll.)    |
| `metadata`    | `jsonb`       | `'{}'`              | —                                  | Data tambahan                                            |
| `created_at`  | `timestamptz` | `now()`             | —                                  | —                                                        |

### 6.11 Tabel: `couple_invitations`

| Kolom             | Tipe          | Default             | Constraint                                                           | Deskripsi      |
| ----------------- | ------------- | ------------------- | -------------------------------------------------------------------- | -------------- |
| `id`              | `uuid`        | `gen_random_uuid()` | PK                                                                   | —              |
| `sender_id`       | `uuid`        | —                   | → auth.users(id) ON DELETE CASCADE                                   | Pengirim       |
| `recipient_email` | `text`        | —                   | NOT NULL                                                             | Email penerima |
| `status`          | `text`        | `'pending'`         | `CHECK (status IN ('pending', 'accepted', 'rejected', 'cancelled'))` | Status         |
| `token`           | `text`        | `gen_random_uuid()` | —                                                                    | Unique token   |
| `created_at`      | `timestamptz` | `now()`             | —                                                                    | —              |
| `updated_at`      | `timestamptz` | `now()`             | —                                                                    | —              |

### 6.12 Tabel: `exchange_rates`

| Kolom             | Tipe          | Default | Constraint | Deskripsi                            |
| ----------------- | ------------- | ------- | ---------- | ------------------------------------ |
| `target_currency` | `text`        | —       | PK         | Kode mata uang (USD, SGD, MYR, dll.) |
| `rate`            | `numeric`     | —       | NOT NULL   | 1 IDR = X target                     |
| `updated_at`      | `timestamptz` | `now()` | —          | —                                    |

### 6.13 Storage Buckets

| Bucket        | Visibility | Fungsi                          | RLS                                          |
| ------------- | ---------- | ------------------------------- | -------------------------------------------- |
| `receipts`    | Private    | Upload gambar receipt untuk OCR | ✅ Signed URL 10 menit                       |
| `goal-images` | Public     | Upload gambar target goal       | ✅ Row-level (user hanya bisa hapus sendiri) |

### 6.14 Stored Procedures (RPC)

| Nama                      | Parameter                                                      | Return  | Deskripsi                                              |
| ------------------------- | -------------------------------------------------------------- | ------- | ------------------------------------------------------ |
| `get_transaction_summary` | `p_user_id`, `p_start_date`, `p_end_date`, `p_target_currency` | `TABLE` | Ringkasan income/expense dengan konversi mata uang     |
| `get_category_stats`      | `p_user_id`, `p_start_date`, `p_end_date`                      | `TABLE` | Statistik (jumlah & total) per kategori                |
| `accept_invitation`       | `p_invitation_id`                                              | `void`  | Menghubungkan user dengan partner berdasarkan undangan |
| `disconnect_partner`      | —                                                              | `void`  | Memutus hubungan partner dan membersihkan `partner_id` |

---
