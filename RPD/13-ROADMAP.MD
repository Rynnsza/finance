## 13. Roadmap

### ✅ 13.0 Baru Selesai

| Item                               | Tanggal   | Detail                                                                |
| ---------------------------------- | --------- | --------------------------------------------------------------------- |
| Recurring auto-create transactions | 5 Jun '26 | Otomatis buat transaksi dari recurring di `next_date`                 |
| Budget rollover                    | 5 Jun '26 | Sisa budget bulan lalu diakumulasi ke bulan ini                       |
| Transaction attachments            | 4 Jun '26 | Upload receipt/invoice ke transaksi                                   |
| Split transactions                 | 5 Jun '26 | Split satu transaksi ke multiple kategori                             |
| Multiple budgets/kategori          | 6 Jun '26 | Mendukung beberapa budget untuk kategori yang sama                    |
| Performance Engine (RPC)           | 5 Jun '26 | Optimasi query besar menggunakan database RPC                         |
| Currency Converter                 | 5 Jun '26 | Kalkulator konversi mata uang real-time                               |
| Account transfer                   | 7 Jun '26 | Pindah uang antar akun (rekening → cash → e-wallet)                   |
| Subscription manager               | 8 Jun '26 | Track semua langganan (Netflix, Spotify, dll) + reminder perpanjangan |

### 13.1 Short-term (1-2 bulan)

| Item                            | Prioritas | Estimasi | Detail                                                          |
| ------------------------------- | --------- | -------- | --------------------------------------------------------------- |
| Tag system                      | 🟢 Rendah | 4 hari   | Tagging transaksi untuk grouping non-kategori                   |
| Data import (CSV)               | 🟡 Sedang | 4 hari   | Import transaksi dari CSV / external sources                    |
| Export PDF (laporan)            | 🟡 Sedang | 1 minggu | Laporan income/expense/budget per bulan dalam PDF               |
| Multi-select transaction delete | 🟡 Sedang | 2 hari   | Hapus transaksi massal dengan konfirmasi                        |
| Budget carry-over config        | 🟢 Rendah | 2 hari   | Opsi enable/disable rollover per budget                         |
| Dashboard quick stats           | 🟢 Rendah | 2 hari   | Kartu ringkasan di atas dashboard (saldo, avg daily spend, dll) |
| Duplicate transaction detect    | 🟢 Rendah | 2 hari   | Cegah/sorot transaksi duplikat saat input                       |
| Recurring end-date              | 🟡 Sedang | 1 hari   | Tanggal berhenti otomatis untuk recurring                       |
| Weekend/holiday skip recurring  | 🟢 Rendah | 1 hari   | Lewati recurring di akhir pekan / hari libur                    |

### 13.2 Medium-term (3-6 bulan)

| Item                             | Prioritas | Estimasi  | Detail                                                                 |
| -------------------------------- | --------- | --------- | ---------------------------------------------------------------------- |
| Recurring transaction templates  | 🟢 Rendah | 4 hari    | Template dengan skip holiday/weekend                                   |
| Shared wallet (couple)           | 🟡 Sedang | 1 minggu  | Dompet bersama pasangan dengan approval flow                           |
| Dashboard widgets (customizable) | 🟢 Rendah | 1 minggu  | Drag & drop widget dashboard sesuai preferensi                         |
| Email report (weekly/monthly)    | 🟢 Rendah | 4 hari    | Auto-kirim laporan ke email tiap minggu/bulan                          |
| Recurring budget (yearly)        | 🟢 Rendah | 3 hari    | Budget untuk pengeluaran tahunan (pajak, asuransi, dll)                |
| Spending insights (AI)           | 🟡 Sedang | 2 minggu  | Analisis pola pengeluaran, kategori paling boros, rekomendasi          |
| Investment portfolio tracking    | 🟢 Rendah | 2 minggu  | Track harga saham/reksadana/kripto otomatis                            |
| Webhook API                      | 🟢 Rendah | 1 minggu  | REST API untuk integrasi pihak ketiga                                  |
| Mobile app (Tauri/Capacitor)     | 🟢 Rendah | 2-3 bulan | Native mobile app experience                                           |
| Cashflow projection              | 🟡 Sedang | 1 minggu  | Proyeksi arus kas 30/60/90 hari ke depan berdasarkan recurring + saldo |
| Financial health score           | 🟡 Sedang | 4 hari    | Skor kesehatan finansial berdasarkan aturan 50/30/20, rasio utang, dll |
| Budget vs actual chart           | 🟡 Sedang | 4 hari    | Grafik perbandingan anggaran vs realisasi per kategori                 |
| Payday / income scheduler        | 🟢 Rendah | 3 hari    | Jadwal pemasukan rutin, prediksi saldo hingga payday berikutnya        |
| Onboarding wizard                | 🟡 Sedang | 1 minggu  | Tur interaktif untuk first-time user + setup awal                      |
| Table view (spreadsheet-style)   | 🟢 Rendah | 4 hari    | View transaksi kaya spreadsheet dengan inline edit                     |
| Bookmark transactions            | 🟢 Rendah | 2 hari    | Tandai transaksi penting untuk mudah ditemukan kembali                 |
| Advanced filters preset          | 🟢 Rendah | 3 hari    | Simpan filter transaksi sebagai preset (contoh: "makanan bulan ini")   |
| Budget freeze month              | 🟢 Rendah | 2 hari    | Bekukan budget bulan tertentu (untuk mudik/ liburan)                   |
| Chart export (PNG)               | 🟢 Rendah | 2 hari    | Download chart sebagai gambar untuk dibagikan                          |
| Calendar heatmap                 | 🟢 Rendah | 3 hari    | Heatmap pengeluaran harian di kalender (seperti GitHub contribution)   |
| Merchant/venue tracking          | 🟢 Rendah | 4 hari    | Track pengeluaran per merchant (Indomaret, Starbucks, dll)             |
| Recurring overview timeline      | 🟢 Rendah | 3 hari    | Timeline visual semua recurring yang aktif & akan datang               |
| Quick-add from notification      | 🟢 Rendah | 3 hari    | Input transaksi langsung dari notifikasi tanpa buka app                |
| Categories budget-free           | 🟡 Sedang | 2 hari    | Kategori tanpa budget — bedakan kategori terkelola vs tidak            |
| Spending freeze mode             | 🟢 Rendah | 2 hari    | Mode "hemat" — blokir/tandai pengeluaran non-esensial                  |
| Multiple receipt per transaction | 🟢 Rendah | 3 hari    | Upload lebih dari 1 foto receipt/invoice per transaksi                 |
| Dark mode schedule               | 🟢 Rendah | 1 hari    | Jadwal otomatis dark/light mode berdasarkan waktu                      |
| Currency localization per tx     | 🟢 Rendah | 3 hari    | Tiap transaksi inget kurs original-nya, tampil di base + original      |

### 13.3 Long-term (6+ bulan)

| Item                               | Prioritas | Estimasi | Detail                                                                    |
| ---------------------------------- | --------- | -------- | ------------------------------------------------------------------------- |
| Multi-tenancy (Company)            | 🔴 Tinggi | 1 bulan  | Fitur untuk mengelola keuangan bisnis kecil                               |
| Bank Sync (Open Bank)              | 🔴 Tinggi | 1 bulan  | Sinkronisasi otomatis dengan mutasi bank (ASPI)                           |
| AI categorization (auto-learn)     | 🟡 Sedang | 2 minggu | Model belajar dari kategori transaksi sebelumnya, auto-suggest            |
| Spending anomaly detection         | 🟡 Sedang | 2 minggu | Deteksi transaksi mencurigakan / di luar kebiasaan                        |
| Bill splitting (group)             | 🟢 Rendah | 2 minggu | Split bill dengan teman, track who owes whom                              |
| Tax report preparation             | 🟡 Sedang | 2 minggu | Generate laporan siap pajak (PPh, dll)                                    |
| Financial goal projections         | 🟢 Rendah | 2 minggu | Proyeksi keuangan berdasarkan tren dan goals                              |
| Color theme system                 | 🟢 Rendah | 1 minggu | Multiple theme kustom (tidak cuma dark/light)                             |
| Envelope budgeting                 | 🟡 Sedang | 1 minggu | Metode budgeting amplop digital                                           |
| Refund/pending tracking            | 🟢 Rendah | 4 hari   | Track transaksi pending / refund yang belum masuk                         |
| API for external tools (YNAB sync) | 🟢 Rendah | 2 minggu | Import/export dari YNAB, Money Lover, spreadsheet                         |
| Receipts photo gallery             | 🟢 Rendah | 1 minggu | Galeri semua foto receipt dalam satu tampilan                             |
| Watchlist harga barang             | 🟢 Rendah | 1 minggu | Track harga barang rutin (sembako, BBM) untuk lihat inflasi pribadi       |
| Public API docs & playground       | 🟢 Rendah | 1 minggu | Dokumentasi API interaktif untuk developer eksternal                      |
| Push notifications (mobile)        | 🔴 Tinggi | 2 minggu | Notifikasi budget, tagihan, goals ke mobile                               |
| PWA offline-first                  | 🟡 Sedang | 2 minggu | Mode offline penuh untuk PWA (cache semua data)                           |
| Mortgage / home loan calculator    | 🟡 Sedang | 1 minggu | Hitung KPR, simulasi tenor, bunga, angsuran per bulan                     |
| Emergency fund tracker             | 🔴 Tinggi | 4 hari   | Hitung & track dana darurat (target 3-6 bulan biaya hidup)                |
| Budget sharing (group/event)       | 🟢 Rendah | 1 minggu | Budget patungan untuk acara (liburan, pesta, proyek)                      |
| Gamification & achievements        | 🟢 Rendah | 2 minggu | Badge, streak, level untuk memotivasi kebiasaan menabung & catat          |
| Recurring skip editor (drag)       | 🟢 Rendah | 3 hari   | Drag untuk skip tanggal tertentu di recurring (kalender interaktif)       |
| AI-powered budget suggestions      | 🟡 Sedang | 1 minggu | AI rekomendasi nominal budget per kategori dari histori                   |
| Savings challenge                  | 🟢 Rendah | 1 minggu | Tantangan nabung (52-week challenge, no-spend month, dll)                 |
| Multi-device sync                  | 🟡 Sedang | 2 minggu | Sinkronisasi real-time antar perangkat tanpa login ulang                  |
| Round-up savings                   | 🟡 Sedang | 1 minggu | Bulatkan transaksi ke atas, selisihnya otomatis ke savings goal           |
| Invoice / bill generator           | 🟢 Rendah | 1 minggu | Generate invoice untuk tagihan ke orang lain / klien freelance            |
| Spending diary / narration         | 🟢 Rendah | 4 hari   | AI generate cerita harian "Kamu hari ini habis Rp X, mostly untuk..."     |
| Family account                     | 🔴 Tinggi | 3 minggu | Multi-user dalam 1 rumah tangga (orang tua + anak) dengan role control    |
| Budget rollover (configurable %)   | 🟢 Rendah | 2 hari   | Opsi rollover cuma sekian % dari sisa budget                              |
| Sinking funds                      | 🟡 Sedang | 1 minggu | Dana cadangan untuk pengeluaran besar terencana (liburan, servis mobil)   |
| Scheduled report (PDF auto-email)  | 🟢 Rendah | 4 hari   | Auto-generate + kirim PDF laporan tiap periode via cron + email           |
| AI cash flow advice                | 🟡 Sedang | 1 minggu | Saran actionable "Saldo kamu menipis — coba kurangi jajan" dll            |
| Asset depreciation tracker         | 🟢 Rendah | 4 hari   | Hitung penyusutan aset (motor, laptop, HP) dari waktu ke waktu            |
| Income tax estimator               | 🟡 Sedang | 1 minggu | Estimasi PPh tahunan dari penghasilan & pengeluaran                       |
| Budget vs actual notification      | 🟡 Sedang | 2 hari   | Notifikasi harian "Kamu udah habiskan 60% budget makan di minggu 1"       |
| Financial events calendar          | 🟢 Rendah | 1 minggu | Kalender finansial penuh (tagihan, payday, recurring, goals jatuh tempo)  |
| Shopping list with price tracker   | 🟢 Rendah | 1 minggu | Daftar belanja + perbandingan harga antar toko/waktu                      |
| Spending by weather                | 🟢 Rendah | 4 hari   | Korelasi pengeluaran dengan cuaca — apakah hujan bikin lebih boros?       |
| AI chatbot assistant               | 🟡 Sedang | 2 minggu | "Berapa budget makanku bulan ini?" / "Total bayar kartu kredit?" via chat |
| Shared promos / coupons            | 🟢 Rendah | 3 hari   | Track promo / diskon yang lagi aktif plus reminder sebelum expired        |
| Data anonymization & export        | 🟢 Rendah | 2 hari   | Export data anonim untuk riset / sharing tanpa privasi bocor              |
| Transaction sound feedback         | 🟢 Rendah | 1 hari   | Efek suara tiap input transaksi (opsional, satisfying)                    |
| Net worth target                   | 🟢 Rendah | 3 hari   | Target kekayaan bersih di tanggal tertentu (misal: 1M di akhir tahun)     |
| Tarik tunai / ATM fee tracker      | 🟢 Rendah | 2 hari   | Track biaya admin ATM & tarik tunai, rekomendasi ATM gratis               |
| Financial minimalism mode          | 🟢 Rendah | 3 hari   | Mode tampilan ultra-sederhana — fokus cuma sama cashflow dasar            |
| Smart alerts (anomalous spending)  | 🟡 Sedang | 1 minggu | Deteksi & notifikasi otomatis: "Pengeluaran Gojek naik 300% bulan ini"    |
| Google Sheets / Notion sync        | 🟢 Rendah | 1 minggu | Sinkronisasi otomatis transaksi ke Google Sheets / Notion database        |
| Receipt OCR batch scan             | 🟢 Rendah | 4 hari   | Scan banyak receipt sekaligus (foto 5-10 struk → masuk semua)             |
| Category budget optimizer          | 🟢 Rendah | 2 hari   | AI bantu atur ulang budget biar pas 100% tanpa over/under                 |
| Daily spending limit               | 🟡 Sedang | 3 hari   | Batas pengeluaran harian otomatis (dihitung dari sisa budget)             |
| Investment / crypto price alert    | 🟢 Rendah | 4 hari   | Notifikasi harga saham/kripto di level tertentu                           |
| Tax deductible tracking            | 🟢 Rendah | 4 hari   | Tandai transaksi yang bisa jadi pengurang pajak                           |
| Multi-language (more locales)      | 🟢 Rendah | 2 minggu | Tambah dukungan bahasa (JP, CN, KR, AR, etc)                              |
| Data retention & cleanup           | 🟢 Rendah | 3 hari   | Auto-hapus / arsip data lama (konfigurasi: 1 tahun, 3 tahun, dll)         |
| Investment dividend tracking       | 🟢 Rendah | 1 minggu | Track dividend saham/reksadana, jadwal ex-date & payment date             |
| Goal cascade                       | 🟢 Rendah | 3 hari   | Satu goal besar pecah jadi sub-goals dengan timeline masing-masing        |
| Financial personality quiz         | 🟢 Rendah | 4 hari   | Quiz untuk nentuin tipe finansial (safety, growth, balanced, dll)         |
| Paycheck allocation                | 🟡 Sedang | 4 hari   | Begitu gajian, otomatis alokasi ke kategori (50/30/20, dsb)               |
| Smart split by percentage          | 🟢 Rendah | 1 hari   | Fitur split untuk nominal yang belum pasti (% dulu, nominal nanti)        |
| Spending by hour / time analysis   | 🟢 Rendah | 3 hari   | Analisis jam berapa pengeluaran terbanyak? (impulse buying?)              |
| Shared subscription split          | 🟡 Sedang | 4 hari   | Biaya langganan yang dipakai bareng (Netflix 4 orang) auto-split          |
| Credit card due date reminder      | 🟡 Sedang | 2 hari   | Track tanggal tagihan kartu kredit + notifikasi H-5                       |
| Bill negotiation coach             | 🟢 Rendah | 1 minggu | AI coach buat negosiasi tagihan (asuransi, internet, dll)                 |

---
