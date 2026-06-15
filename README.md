# Queue Management Bengkel Motor

Sistem antrean bengkel motor dengan **Cloudflare Pages**, **D1**, dan notifikasi **WhatsApp (Fonnte)**.

## Arsitektur

- **Frontend**: HTML/CSS/JS statis (Kiosk Pelanggan + Dashboard Admin)
- **Backend**: Cloudflare Pages Functions (`/functions/api/`)
- **Database**: Cloudflare D1 (SQLite)
- **WhatsApp**: Fonnte API + webhook untuk balasan `YA`


## API Endpoints

| Method | Path | Auth | Deskripsi |
|--------|------|------|-----------|
| POST | `/api/queues` | — | Daftar antrean baru (kiosk) |
| GET | `/api/queues` | Admin | List antrean aktif |
| PATCH | `/api/queues/:id` | Admin | Update status |
| POST | `/api/queues/:id/bill-items` | Admin | Tambah item tagihan |
| POST | `/api/queues/:id/payment` | Admin | Proses pembayaran |
| POST | `/api/queues/:id/notify` | Admin | Kirim notifikasi WA manual |
| POST | `/api/auth/login` | — | Login admin |
| POST | `/api/webhook/fonnte` | — | Webhook balasan pelanggan |

## Alur WhatsApp

1. **Daftar antrean** → kirim nomor antrean
2. **Status "Sedang Diproses"** → motor mulai dikerjakan
3. **Tambah biaya tambahan** → rincian + minta balas `YA`
4. **Pelanggan balas YA** → webhook menyetujui biaya
5. **Status "Selesai Pengerjaan"** → tagihan akhir
6. **Pembayaran lunas** → konfirmasi selesai
