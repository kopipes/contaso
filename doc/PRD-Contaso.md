# PRD: Contaso

**Status:** Draft v1
**Owner:** —
**Terakhir diperbarui:** 16 Agustus 2026

---

## 1. Ringkasan

Contaso adalah dashboard internal untuk mengelola chat (Messenger & Instagram DM) dan
komentar dari seluruh akun Facebook & Instagram tim dalam satu tempat, dengan data
diambil dari [Repliz API](https://docs.repliz.com). Tujuannya: tim tidak perlu bolak-balik
buka Meta Business Suite / Instagram / Facebook satu per satu untuk memantau dan membalas
interaksi yang masuk dari banyak akun sekaligus.

## 2. Latar belakang & masalah

Tim mengelola beberapa akun Facebook & Instagram sekaligus. Saat ini, memantau chat dan
komentar dari semua akun berarti cek satu per satu di masing-masing platform/akun secara
manual — lambat, mudah kelewatan (terutama komentar/DM yang butuh respons cepat), dan
tidak ada satu tempat untuk melihat "keadaan terkini" semua akun sekaligus.

## 3. Tujuan produk

1. Satu dashboard untuk melihat status semua akun terhubung dalam sekali pandang.
2. Balas chat dan komentar dari semua akun tanpa pindah aplikasi.
3. Tim bisa fokus hanya ke akun yang relevan (akun lain di-nonaktifkan tampilannya) tanpa
   kehilangan datanya.
4. Ada jejak audit siapa membalas apa, karena dikerjakan oleh beberapa orang.

### Bukan tujuan (out of scope untuk v1)

- Membuat/menjadwalkan post baru (Schedule/Content API Repliz tidak dipakai di v1).
- Automation rules (auto-reply, auto-delete spam) — Repliz sudah punya fitur ini secara
  native, v1 app ini tidak menduplikasinya.
- Analitik mendalam (grafik tren, laporan periodik) — v1 hanya angka ringkasan real-time.
- Platform selain Facebook & Instagram (Threads/TikTok/YouTube/LinkedIn ada di Repliz tapi
  tidak masuk scope v1).
- Notifikasi push/email real-time.

## 4. Target pengguna

| Peran | Kebutuhan |
|---|---|
| **Admin** | Kelola akun mana yang tampil, kelola anggota tim, lihat semua chat & komentar |
| **Agent** | Baca & balas chat/komentar dari akun yang ditampilkan, tidak bisa ubah pengaturan akun |

## 5. Alur pengguna utama

1. **Login** → email & password (akun dibuat manual oleh admin).
2. **Dashboard** → grid akun terhubung, tiap kartu menampilkan nama, platform, status
   koneksi, dan toggle on/off. Hanya akun yang "on" yang jadi fokus utama tampilan.
3. **Klik akun** → halaman detail: angka ringkasan (followers, komentar pending, total
   komentar, total chat) + dua tab:
   - **Komentar**: daftar komentar berstatus *pending*, tiap item bisa langsung dibalas
     (otomatis jadi *resolved* di Repliz setelah dibalas).
   - **Chat**: daftar percakapan, klik satu → lihat riwayat pesan → kirim balasan.
4. Data dashboard & daftar komentar/chat refresh otomatis secara berkala (polling), tidak
   perlu reload manual.

## 6. Requirement fungsional

### 6.1 Autentikasi & tim
- Login email/password.
- Dua role: `ADMIN`, `AGENT`.
- Admin dapat menonaktifkan/mengelola user (v1: lewat Prisma Studio; UI invite user masuk
  *nice-to-have*, lihat §10).

### 6.2 Manajemen akun
- Tarik daftar akun dari Repliz (`GET /public/account`), sinkron otomatis saat dashboard
  dibuka.
- Setiap akun punya toggle **tampil/sembunyikan** di dashboard, tersimpan lokal (tidak
  memengaruhi status koneksi di Repliz).
- Menampilkan status *terhubung/terputus* per akun.

### 6.3 Dashboard
- Grid kartu akun: foto profil, nama, platform, username, status koneksi, toggle on/off.
- Akun "off" tetap ada di list (dikelompokkan terpisah, redup) — tidak hilang datanya,
  cuma tidak difokuskan.

### 6.4 Detail akun — Statistik
- Ambil dari `GET /public/account/{id}/statistic`: followers, total komentar, komentar
  pending, total chat.

### 6.5 Detail akun — Komentar
- List komentar status `pending` (`GET /public/queue?accountId&status=pending`).
- Balas komentar → `POST /public/queue/{id}` (otomatis resolved di sisi Repliz).
- Setiap balasan dicatat di `ReplyLog` lokal (siapa, kapan, akun mana, isi pesan).

### 6.6 Detail akun — Chat
- List percakapan per akun (`GET /public/chat`).
- Buka satu percakapan → riwayat pesan (`GET /public/chat/message`), otomatis mark-as-read.
- Kirim balasan (`POST /public/chat/{id}/message`), dicatat juga ke `ReplyLog`.
- **Catatan:** fitur ini butuh tier **Gold+** di Repliz.

### 6.7 Audit trail
- Semua balasan (chat & komentar) yang dikirim lewat app ini tercatat: user, waktu, akun,
  jenis (chat/komentar), isi pesan.

## 7. Requirement non-fungsional

| Aspek | Target |
|---|---|
| **Performa** | Dashboard & detail akun termuat < 1 detik pada koneksi normal (SSR + polling ringan, bukan full page reload) |
| **Keandalan** | Kegagalan panggilan ke Repliz (down/rate-limit) tidak membuat halaman lain ikut error — ditangani per-komponen dengan pesan error + retry |
| **Keamanan** | Kredensial Repliz (Client ID/Secret) hanya ada di server, tidak pernah terkirim ke browser; semua route API mengecek sesi login |
| **Portabilitas data** | Database lokal default SQLite (1 file, tanpa setup server), bisa dipindah ke Postgres/MySQL tanpa ubah kode aplikasi, hanya ubah provider Prisma + connection string |
| **Skalabilitas** | Cukup untuk penggunaan tim internal (bukan trafik publik); SQLite cocok untuk 1 server, pindah ke Postgres jika perlu multi-server |
| **Aksesibilitas** | Fokus keyboard terlihat jelas, responsif hingga ukuran mobile, menghormati preferensi *reduced motion* |

## 8. Model data (ringkas)

App ini **tidak menyimpan ulang** data chat/komentar (tetap live dari Repliz). Yang
disimpan lokal hanya:

- `User` — tim (nama, email, password hash, role)
- `TrackedAccount` — status tampil/sembunyi & urutan per akun Repliz
- `ReplyLog` — audit balasan (siapa, akun, jenis, isi, waktu)

## 9. Ketergantungan & batasan eksternal

- **Tier Repliz Gold+** wajib untuk fitur Chat (DM). Comment API tersedia mulai tier
  Standard+.
- **Rate limit** Repliz API — app harus menangani respons `429` dengan pesan yang jelas
  (bukan crash).
- Path/parameter endpoint Chat API perlu diverifikasi ulang terhadap dokumentasi resmi
  Repliz saat implementasi (detail persis tidak sepenuhnya publik saat PRD ini ditulis).

## 10. Nice-to-have (kandidat v2)

- Halaman invite/kelola anggota tim tanpa perlu akses langsung ke database.
- Notifikasi (browser push atau email) untuk komentar/chat baru.
- Filter & pencarian di dalam queue komentar/chat.
- Grafik tren (komentar/chat masuk per hari, waktu respons rata-rata).
- Dukungan platform tambahan (Threads, TikTok, dst) mengikuti yang didukung Repliz.
- Template balasan cepat (canned responses).

## 11. Metrik keberhasilan

- Waktu rata-rata dari komentar/chat masuk sampai dibalas (lewat data `ReplyLog` vs
  `createdAt` dari Repliz) — target: menurun dibanding proses manual sebelumnya.
- % komentar pending yang terpantau lewat dashboard (bukan ketinggalan/tidak terlihat).
- Adopsi: berapa % interaksi tim dibalas lewat app ini vs langsung di Meta/IG asli.

## 12. Risiko & asumsi

| Risiko | Mitigasi |
|---|---|
| Tier Repliz belum Gold+ saat butuh fitur Chat | Comment tetap jalan penuh; Chat di-disable/beri pesan jelas sampai tier di-upgrade |
| Endpoint Chat API Repliz berbeda dari asumsi di PRD ini | Isolasi semua panggilan API di satu modul (`lib/repliz.ts`) agar perbaikan cukup di satu tempat |
| SQLite jadi bottleneck jika tim/akun bertambah banyak | Skema sudah portable ke Postgres/MySQL tanpa perubahan kode |
| Data sensitif (isi chat pelanggan) tersimpan di log lokal | `ReplyLog` hanya simpan isi balasan yang dikirim tim, bukan pesan masuk dari pelanggan |
