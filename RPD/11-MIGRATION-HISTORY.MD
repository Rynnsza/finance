## 11. Migration History

<sub>41 migrasi · 18 hari · 23 Mei → 9 Jun 2026 · Pace: ~2.3 migrasi/hari</sub>

---

### 📈 Timeline Migrasi

```
Mei 23-24  ■■■■  Init + Todos (4 migrasi)
Mei 25-26  ■■■■■■■  Recurring + Couple Mode (8 migrasi)
Mei 27-29  ■■■■■■  Goals + Budgets Redesign (7 migrasi)
Mei 30-31  ■■■■  Accounts + Bills + Activity Logs (4 migrasi)
Jun 1-2    ■■■■■■  Exchange Rates + Security Fixes (8 migrasi)
Jun 3      ■  Index Optimization (1 migrasi)
Jun 4      ■■  Partner RLS (2 migrasi)
Jun 6-7    ■■■  Goals Partner RLS + Attachments (3 migrasi)
Jun 8-9    ■■■■■■■■  Split + Multiple Budgets + RPC + Performance (6 migrasi)
```

### 🗃️ Daftar Migrasi

|  #  | Migration                                          |  Tgl   |    Kategori    | Deskripsi                                                  |
| :-: | -------------------------------------------------- | :----: | :------------: | ---------------------------------------------------------- |
|  1  | `20260523165600_init`                              | 23 Mei |    🏗️ Init     | Schema awal: profiles, categories, transactions, recurring |
|  2  | `20260524000000_todos`                             | 24 Mei |    🏗️ Init     | Tabel todos (sejak itu di-drop)                            |
|  3  | `20260524000001_todos_due_date`                    | 24 Mei |    🏗️ Init     | Tambah `due_date` ke todos                                 |
|  4  | `20260525000000_recurring_rename`                  | 25 Mei |  🔄 Refactor   | Rename recurring → recurring_transactions                  |
|  5  | `20260525000001_recurring_fix`                     | 25 Mei |     🐛 Fix     | Fix recurring schema                                       |
|  6  | `20260526000000_couple_invitations`                | 26 Mei |    ✨ Fitur    | Tabel couple_invitations                                   |
|  7  | `20260526000001_couple_partner_id`                 | 26 Mei |    ✨ Fitur    | Tambah `partner_id` ke profiles                            |
|  8  | `20260526000002_couple_rls`                        | 26 Mei |    ✨ Fitur    | RLS policies untuk couple mode                             |
|  9  | `20260526000003_fix_profiles_rls`                  | 26 Mei |     🐛 Fix     | Fix RLS profiles                                           |
| 10  | `20260526000004_invitation_profiles_rls`           | 26 Mei |     🐛 Fix     | RLS untuk invitations + profiles                           |
| 11  | `20260526000005_fix_invitation_fk`                 | 26 Mei |     🐛 Fix     | Fix foreign key invitations                                |
| 12  | `20260526000006_accept_invitation_rpc`             | 26 Mei |    ✨ Fitur    | RPC `accept_couple_invitation`                             |
| 13  | `20260527000000_receipt_image`                     | 27 Mei |    ✨ Fitur    | Tambah column untuk receipt image di transactions          |
| 14  | `20260527000001_drop_todos`                        | 27 Mei |   🧹 Cleanup   | Drop tabel todos                                           |
| 15  | `20260527000002_drop_budgets`                      | 27 Mei |   🧹 Cleanup   | Drop budget lama (redesign)                                |
| 16  | `20260527000003_goals`                             | 27 Mei |    ✨ Fitur    | Tabel goals                                                |
| 17  | `20260527000004_goal_images`                       | 27 Mei |    ✨ Fitur    | Upload gambar untuk goals                                  |
| 18  | `20260528000001_index_categories_user_id`          | 28 Mei | ⚡ Performance | Index categories.user_id                                   |
| 19  | `20260528000002_index_goals_user_id`               | 28 Mei | ⚡ Performance | Index goals.user_id                                        |
| 20  | `20260529000000_budgets`                           | 29 Mei |  🔄 Refactor   | Recreate budgets table (versi baru)                        |
| 21  | `20260530000000_accounts`                          | 30 Mei |    ✨ Fitur    | Tabel accounts                                             |
| 22  | `20260530000001_accounts_types`                    | 30 Mei |    ✨ Fitur    | Tambah constraint type ke accounts                         |
| 23  | `20260531000000_bills`                             | 31 Mei |    ✨ Fitur    | Tabel bills                                                |
| 24  | `20260531000001_activity_logs`                     | 31 Mei |    ✨ Fitur    | Tabel activity_logs                                        |
| 25  | `20260601000000_bill_paid_with`                    | 1 Jun  |    ✨ Fitur    | Tambah `paid_with_account_id` ke bills                     |
| 26  | `20260601000001_exchange_rates`                    | 1 Jun  |    ✨ Fitur    | Tabel exchange_rates                                       |
| 27  | `20260602000000_disconnect_partner`                | 2 Jun  |    ✨ Fitur    | RPC `disconnect_partner`                                   |
| 28  | `20260602000001_fix_rls_vulnerabilities`           | 2 Jun  |  🔒 Security   | Security fix RLS                                           |
| 29  | `20260602000002_fix_exchange_rates_rls`            | 2 Jun  |  🔒 Security   | Fix RLS exchange_rates                                     |
| 30  | `20260602000003_fix_receipts_bucket_rls`           | 2 Jun  |  🔒 Security   | Fix RLS storage bucket receipts                            |
| 31  | `20260603000001_optimize_indexes`                  | 3 Jun  | ⚡ Performance | Optimasi index untuk performance                           |
| 32  | `20260604000000_allow_partner_update_transactions` | 4 Jun  |    ✨ Fitur    | RLS: partner bisa update transaksi                         |
| 33  | `20260604000001_allow_partner_delete_transactions` | 4 Jun  |    ✨ Fitur    | RLS: partner bisa delete transaksi                         |
| 34  | `20260606000000_goals_partner_rls`                 | 6 Jun  |    ✨ Fitur    | RLS: partner bisa lihat goals                              |
| 35  | `20260607000000_transaction_attachments`           | 7 Jun  |    ✨ Fitur    | Tambah kolom `image_url` di transactions                   |
| 36  | `20260608000000_split_transactions`                | 8 Jun  |    ✨ Fitur    | Tambah kolom `splits` (jsonb)                              |
| 37  | `20260608000001_multiple_budgets_per_category`     | 8 Jun  |    ✨ Fitur    | Tambah kolom `name` di budgets                             |
| 38  | `20260609000000_dashboard_summary_rpc`             | 9 Jun  | ⚡ Performance | RPC `get_transaction_summary`                              |
| 39  | `20260609000001_category_stats_rpc`                | 9 Jun  | ⚡ Performance | RPC `get_category_stats`                                   |
| 40  | `20260609000002_indexing_optimizations`            | 9 Jun  | ⚡ Performance | Optimasi index transaksi + budget                          |
| 41  | `20260609000003_performance_tuning`                | 9 Jun  | ⚡ Performance | Fine-tuning PostgreSQL parameters                          |

### 📊 Breakdown

| Kategori             | Jumlah | Persentase |
| -------------------- | :----: | :--------: |
| ✨ Fitur Baru        |   17   |    41%     |
| 🐛 Fixes (bug + RLS) |   9    |    22%     |
| ⚡ Performance       |   6    |    15%     |
| 🔄 Refactor          |   2    |     5%     |
| 🔒 Security          |   3    |     7%     |
| 🧹 Cleanup           |   2    |     5%     |
| 🏗️ Init              |   2    |     5%     |

**Pelajaran:** 22% migration adalah fix — menandakan development pace yang cepat dengan trade-off stabilitas. Idealnya post-1.0 rasio fix turun ke <10%.

---
