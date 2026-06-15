# Queue Management Bengkel Motor

Sistem antrean bengkel motor dengan **Cloudflare Pages**, **D1**, dan notifikasi **WhatsApp (Fonnte)**.

## Arsitektur

- **Frontend**: HTML/CSS/JS statis (Kiosk Pelanggan + Dashboard Admin)
- **Backend**: Cloudflare Pages Functions (`/functions/api/`)
- **Database**: Cloudflare D1 (SQLite)
- **WhatsApp**: Fonnte API + webhook untuk balasan `YA`

## Setup Lokal

### 1. Install dependensi

```bash
npm install
```

### 2. Buat database D1 lokal & jalankan migrasi

```bash
npx wrangler d1 create bengkel-queue
```

Salin `database_id` dari output ke `wrangler.toml`, lalu:

```bash
npm run db:migrate:local
```

### 3. Konfigurasi environment

Salin `.dev.vars.example` ke `.dev.vars` dan isi:

```
FONNTE_TOKEN=token_dari_dashboard_fonnte
ADMIN_USERNAME=admin
ADMIN_PASSWORD=password_anda
```

### 4. Jalankan dev server

```bash
npm run dev
```

Buka `http://localhost:8788/` (otomatis ke landing page)

## Deploy ke Cloudflare Pages

### 1. Buat project Pages

```bash
npx wrangler pages project create bengkel-management
```

### 2. Buat D1 database (production)

```bash
npx wrangler d1 create bengkel-queue
```

Update `database_id` di `wrangler.toml`, lalu:

```bash
npm run db:migrate:remote
```

### 3. Set secrets

```bash
npx wrangler pages secret put FONNTE_TOKEN --project-name bengkel-management
npx wrangler pages secret put ADMIN_USERNAME --project-name bengkel-management
npx wrangler pages secret put ADMIN_PASSWORD --project-name bengkel-management
```

### 4. Deploy

```bash
npm run deploy
```

Deploy mengirim folder `public/` sebagai root situs (bukan seluruh repo). Setelah deploy, buka:

```
https://<your-domain>/
```

Itu akan otomatis mengarah ke `/Landingpage/landing.html`.

### 5. Bind D1 ke Pages project

Di Cloudflare Dashboard → Pages → project → Settings → Functions → D1 bindings:
- Variable name: `DB`
- D1 database: `bengkel-queue`

### 6. Konfigurasi webhook Fonnte

Di dashboard Fonnte (Device → Edit → Webhook), set URL:

```
https://<your-pages-domain>/api/webhook/fonnte
```

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
