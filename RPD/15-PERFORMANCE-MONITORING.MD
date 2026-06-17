## 15. Performance & Monitoring

<sub>Database query performance · Client metrics · Monitoring · 7 Jun 2026</sub>

---

### 15.1 Target Performa

| Metrik                         | Target | Saat Ini |    Prioritas     |
| ------------------------------ | :----: | :------: | :--------------: |
| Lighthouse Performance Score   |  >90   |  ~85-95  |        🟡        |
| First Contentful Paint (FCP)   | <1.5s  |  ~1.2s   |        ✅        |
| Time to Interactive (TTI)      | <2.5s  |  ~2.0s   |        ✅        |
| Largest Contentful Paint (LCP) | <2.5s  |  ~1.8s   |        ✅        |
| Cumulative Layout Shift (CLS)  |  <0.1  |  ~0.05   |        ✅        |
| JS Bundle Size (production)    | <200KB |  ~180KB  |        ✅        |
| CSS Bundle Size                | <50KB  |  ~35KB   |        ✅        |
| API Response (dashboard)       | <100ms | ~20-50ms |        ✅        |
| Search Query (ILIKE)           | <50ms  | 50-200ms | 🟠 Belum optimal |

### 15.2 Database Query Performance

| Query                                     |   Frekuensi    |            Index             | Est. Time |          Status           |
| ----------------------------------------- | :------------: | :--------------------------: | :-------: | :-----------------------: |
| Dashboard: transactions by date           | Setiap render  | `idx_transactions_user_date` |   <10ms   |            ✅             |
| Filter: transactions by type              |     Filter     | `idx_transactions_user_type` |   <10ms   |            ✅             |
| Search: description ILIKE                 |  User search   |      ❌ None (seq scan)      | 50-200ms  |     🟠 Belum optimal      |
| Budget: SUM spending per kategori         | Dashboard load |           Partial            | 20-100ms  |            ✅             |
| Net worth: account balance                | Dashboard load |           Partial            | 50-500ms  |      🟠 Bisa lambat       |
| Activity logs page                        | Activity page  |           ❌ None            |  10-50ms  |            ✅             |
| Summary RPC (`get_transaction_summary`)   | Dashboard load |             Full             |   <10ms   | ✅ Optimasi terbaru (RPC) |
| Category stats RPC (`get_category_stats`) |  Chart render  |             Full             |   <20ms   | ✅ Optimasi terbaru (RPC) |

### 15.3 Optimasi yang Sudah Dilakukan

**Database:**

- ✅ Indexes: 8+ index covering queries utama
- ✅ RPC Functions: `get_transaction_summary` + `get_category_stats` — query berat pindah ke DB
- ✅ Composite indexes untuk query multi-kolom
- ✅ PostgreSQL query tuning (migration `20260609000003`)

**Frontend:**

- ✅ TanStack Query staleTime + caching — minim re-fetch
- ✅ Auto-imports (tree-shaken saat build)
- ✅ Lazy-loading routes via Vite
- ✅ Image compression (receipt: max 1920px, JPEG 0.7)
- ✅ PWA precache untuk app shell

**Build:**

- ✅ Rolldown (Rust-based, 10x faster build)
- ✅ Tree-shaking via Vite
- ✅ No runtime validation (types only during build)

### 15.4 Belum Optimal (Next Action)

| Area                   | Issue                                                                      | Rencana                                              |
| ---------------------- | -------------------------------------------------------------------------- | ---------------------------------------------------- |
| **Transaction search** | `ILIKE '%term%'` tidak pake index → sequential scan untuk ribuan transaksi | Tambah `pg_trgm` index + GIST untuk full-text search |
| **Activity log query** | Tidak ada index untuk `user_id + created_at`                               | Tambah index                                         |
| **Bundle splitting**   | Satu chunk besar di pages                                                  | Code splitting per route (sudah partial)             |
| **Image optimization** | Receipt gambar di-load tanpa resize                                        | Server-side resize di Edge Function                  |
| **Prefetch**           | Dashboard lambat di cold start                                             | Prefetch data landing page saat auth                 |

### 15.5 Monitoring & Observability

#### Saat Ini (Belum Ada)

```
Monitoring        → ❌
Error Tracking    → ❌
Logging           → ❌
Analytics         → ❌ (Vercel analytics built-in, belum diaktifkan)
```

#### Rencana Setup

| Tool                            | Tujuan                                  |        Biaya         |                    Prioritas                     |
| ------------------------------- | --------------------------------------- | :------------------: | :----------------------------------------------: |
| **[Sentry](https://sentry.io)** | Error tracking + performance monitoring | Free (5k events/bln) | 🔴 High — tanpa ini buta dengan error production |
| **Supabase Query Performance**  | Built-in dashboard di Supabase          |         Free         |                    🟡 Medium                     |
| **Vercel Analytics**            | Frontend traffic + speed insights       |     Free (Hobby)     |                      🟢 Low                      |
| **PostgreSQL log analysis**     | Slow query detection                    |         Free         |                    🟡 Medium                     |

#### Target Monitoring Metrics

Setelah monitoring aktif, target:

| Metrik                |         Target         |
| --------------------- | :--------------------: |
| Error rate            | < 0.1% of all requests |
| API success rate      |        > 99.5%         |
| P50 API latency (RPC) |         < 50ms         |
| P95 API latency (RPC) |        < 200ms         |
| Client-side errors    |      0 unhandled       |

---
