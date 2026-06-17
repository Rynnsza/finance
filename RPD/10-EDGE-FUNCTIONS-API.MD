## 10. Edge Functions API

<sub>4 Deno Edge Functions · Supabase · 7 Jun 2026</sub>

---

### 10.0 Arsitektur Edge Functions

```
┌────────────────────────────────────────────────────────────┐
│                   Edge Functions (Deno 2)                   │
│                                                              │
│  ┌──────────────────┐  ┌──────────────────┐                 │
│  │   ocr-receipt    │  │   sync-rates     │                 │
│  │  POST (private)  │  │  Scheduled (cron) │                 │
│  └────────┬─────────┘  └────────┬─────────┘                 │
│           │                     │                            │
│           ▼                     ▼                            │
│  ┌──────────────────┐  ┌──────────────────┐                 │
│  │ send-couple-invite│  │   og-image       │                 │
│  │  POST (private)  │  │  GET (public)    │                 │
│  └────────┬─────────┘  └──────────────────┘                 │
│           │                                                   │
│           ▼                                                   │
│  Resend API (email)  ← External                              │
└────────────────────────────────────────────────────────────┘
```

### 10.1 `ocr-receipt`

**Endpoint:** `POST /functions/v1/ocr-receipt`
**Runtime:** Deno
**Auth:** Bearer token (Supabase session)

**Request:**

```json
{
  "imageUrl": "https://project.supabase.co/storage/v1/object/signed/receipts/..."
}
```

**Response (Success):**

```json
{
  "status": "ok",
  "data": {
    "type": "expense",
    "amount": 150000,
    "currency": "IDR",
    "category": "Makanan",
    "description": "Makan siang di Solaria",
    "date": "2026-01-15",
    "items": [
      { "name": "Nasi Goreng", "quantity": 1, "price": 50000 },
      { "name": "Es Teh", "quantity": 2, "price": 15000 }
    ],
    "merchant": "Solaria"
  }
}
```

**Response (Error):**

```json
{
  "status": "error",
  "data": null,
  "error": "Could not extract receipt data from the image"
}
```

**Implementation Notes:**

- Menerima signed URL (10 menit expiry) dari private bucket `receipts`
- Menggunakan AI chat API untuk ekstrak data struk
- Image sudah di-compress client-side (max 1920px, JPEG 0.7)

### 10.2 `sync-rates`

**Endpoint:** Scheduled (via cron)
**Runtime:** Deno
**Auth:** Service role key

**Fungsi:**

- Fetch rates dari `https://api.exchangerate.fun/latest?base=IDR`
- Upsert ke tabel `exchange_rates` (batch)
- Update kolom `updated_at`

**Rate Schedule:** Belum ada cron scheduler — untuk sementara panggil manual via dashboard atau external cron (e.g. cron-job.org free tier)

### 10.3 `send-couple-invite`

**Endpoint:** `POST /functions/v1/send-couple-invite`
**Runtime:** Deno
**Auth:** Bearer token (user session)

**Request:**

```json
{
  "sender_id": "uuid",
  "recipient_email": "partner@email.com"
}
```

**Fungsi:**

- Kirim email via Resend API
- Template email berisi nama pengirim + link undangan

### 10.4 `og-image`

**Endpoint:** `GET /functions/v1/og-image`
**Runtime:** Deno
**Auth:** None (public)

**Fungsi:**

- Generate dynamic Open Graph image untuk sharing
- Render SVG → PNG via Deno

---
