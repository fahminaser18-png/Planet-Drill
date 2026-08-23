# Pendaftaran & Sistem Subscription (Freemium Model)

## Tujuan
Memperbarui sistem langganan Planet Drill menjadi model *Feature-based Freemium* dengan paket durasi baru, menyempurnakan alur pendaftaran dengan integrasi Google Login (tanpa menghilangkan form manual), serta menerapkan manajemen akses (paywall) yang dinamis pada fitur Tryout Unlimited dan Tryout Terjadwal.

## 1. Paket Langganan Baru
Struktur paket langganan diperbarui menjadi:
* **1 Bulan:** Rp 50.000
* **6 Bulan:** Rp 250.000
* **1 Tahun:** Rp 450.000

*Tabel `subscriptions` dan fungsi durasi di database perlu diperbarui untuk mengakomodasi kode paket baru ini.*

## 2. Alur Pendaftaran (User Journey)
Menggunakan pendekatan **Hybrid Freemium**:
* **Landing Page:** Menampilkan tabel harga paket (1, 6, 12 Bulan) dengan tombol "Beli Sekarang" yang mengarah ke registrasi, serta tombol "Daftar Gratis".
* **Autentikasi (Auth):** Menyediakan 2 opsi pendaftaran/login di halaman Auth:
  * **Google OAuth (1-Click):** Jika menggunakan akun Google baru, otomatis dibuatkan akun di sistem.
  * **Manual Form:** Pendaftaran menggunakan formulir (email dan password) tetap dipertahankan.
* **Dasbor (Awal):** Setelah berhasil mendaftar (baik via Google maupun Manual), pengguna langsung diarahkan masuk ke Dasbor dengan peran akun `pendaftar_baru` (Akses Gratis). 
* Pembelian paket atau pembayaran dilakukan sebagai alur *Upgrade* di dalam Dasbor aplikasi.

## 3. Manajemen Hak Akses (Paywall System)
Hak akses dipisahkan secara tegas antara pengguna Gratis dan pengguna Langganan (Pro):

### Pengguna Gratis (Freemium)
* **Tryout Unlimited:** Terkunci (ditandai dengan ikon visual gembok pada daftar/katalog). Jika mencoba diakses, sistem akan memicu *pop-up* atau *modal* penawaran *upgrade* paket.
* **Pembahasan & Analitik:** Hanya dapat melihat skor/nilai akhir dari tryout yang telah dikerjakan. Kunci jawaban dan pembahasan detail per soal terkunci (memicu paywall).
* **Tryout Terjadwal:** Hanya dapat mengerjakan Tryout Terjadwal yang secara eksplisit diatur sebagai "Gratis" oleh Admin.

### Pengguna Langganan (Pro)
* Memiliki akses penuh (100%) ke katalog Tryout Unlimited, seluruh halaman Pembahasan dan Analitik skor, serta semua acara Tryout Terjadwal.

## 4. Fitur Admin: Kontrol Tryout Terjadwal
* **Pembuatan Event:** Di Dasbor Admin, saat membuat atau mengedit Tryout Terjadwal, ditambahkan sebuah *checkbox* atau *toggle*: **"Tersedia untuk Pengguna Gratis"** (akan merepresentasikan kolom `is_free_access` bertipe boolean di tabel database).
* Jika `is_free_access` bernilai *true*, semua level akun bisa mengakses event tersebut.
* Jika `is_free_access` bernilai *false*, pengguna berstatus gratis akan melihat ikon gembok. Jika mereka mencoba masuk/daftar event tersebut, mereka akan langsung diarahkan ke halaman pembayaran/upgrade langganan.
