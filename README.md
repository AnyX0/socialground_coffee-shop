# Socialground Coffee Shop

Website statis untuk coffee shop dengan halaman landing, menu interaktif, form pemesanan, ulasan pelanggan, modal login, serta Member Dashboard untuk mengelola poin, wallet, dan pemesanan. Dibangun menggunakan HTML, CSS, dan JavaScript.

## Fitur Utama
- Landing page: bagian Home, About, Menu, Review, dan Book.
- Menu interaktif: kategori, kartu item, dan ringkasan pesanan (quantity & total).
- Form pemesanan/booking: input terstruktur dengan validasi UI.
- Ulasan pelanggan: slider dengan pagination (mendukung Swiper).
- Modal Login: dialog modern dengan animasi dan state pesan.
- Member Dashboard: sidebar, statistik, points, wallet, riwayat transaksi, dan order menu grid.
- Responsif: tata letak adaptif untuk tablet & ponsel.

## Tech Stack
- HTML5, CSS3 (Custom Properties/Variables), JavaScript (Vanilla)
- Google Fonts (Poppins)
- Icon set (Font Awesome, jika digunakan di HTML)
- Swiper.js (opsional untuk slider ulasan)

## Struktur Proyek
```
socialground_coffee-shop/
├─ index.html
├─ dashboard.html
├─ css/
│  ├─ style.css
│  └─ order-elegant.css
├─ js/
│  └─ script.js
└─ image/
```

## Memulai
- Cara cepat: buka [index.html](index.html) langsung di browser modern.
- Opsi server lokal (disarankan untuk fitur tertentu seperti routing/asset caching):
  - Python (jika terpasang):
    ```bash
    python -m http.server 8000
    ```
    Lalu akses `http://localhost:8000`.
  - Node.js http-server (opsional):
    ```bash
    npm i -g http-server
    http-server -p 8080
    ```
    Lalu akses `http://localhost:8080`.
  - VS Code: gunakan ekstensi "Live Server" untuk serve langsung.

## Kustomisasi
- Tema warna & gaya: ubah variabel di [css/style.css](css/style.css) pada blok `:root` (mis. `--main-color`, border, dsb).
- Gambar & aset: taruh di folder [image/](image/); sesuaikan path pada CSS/HTML.
- Script interaksi: modifikasi logika di [js/script.js](js/script.js) (mis. toggle sidebar, select item order, hitung total, modal login).
- Komponen halaman: edit struktur di [index.html](index.html) dan [dashboard.html](dashboard.html).

## Dependensi & CDN
Jika menggunakan pustaka pihak ketiga, pastikan CDN dimuat di HTML:
- Google Fonts Poppins (sudah diimpor di CSS):
  ```css
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@100;300;400;500;600&display=swap');
  ```
- Font Awesome (opsional, untuk ikon `fa-quote-left/right`):
  ```html
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
  ```
- Swiper.js (opsional, untuk review slider):
  ```html
  <link rel="stylesheet" href="https://unpkg.com/swiper@9/swiper-bundle.min.css" />
  <script src="https://unpkg.com/swiper@9/swiper-bundle.min.js"></script>
  ```

## Praktik & Catatan
- Aksesibilitas: gunakan alt text untuk gambar dan label untuk input.
- Kinerja: kompres gambar di [image/](image/), gunakan `background-size: cover` seperlunya.
- SEO dasar: tambahkan meta tags (title, description, og tags) di [index.html](index.html).

## Screenshot
Tambahkan tangkapan layar ke README (opsional):
- Beranda
- Menu & Order Summary
- Modal Login
- Member Dashboard

> Simpan gambar di [image/](image/) dan tautkan di README (mis. `![Home](image/home-screenshot.png)`).

## Roadmap (Opsional)
- Integrasi backend untuk autentikasi & pemesanan nyata.
- Penyimpanan data (API/DB) untuk menu, transaksi, dan poin.
- Deployment ke Netlify/Vercel/GitHub Pages.

## Kontribusi
Kontribusi dipersilakan. Buat branch/PR dengan deskripsi yang jelas.

## Lisensi
Belum ditentukan. Silakan tambahkan lisensi (mis. MIT) sesuai kebutuhan.

## Kredit
- Desain & tema: variabel CSS dan komponen custom.
- Ikon: Font Awesome (jika digunakan).
- Slider: Swiper.js (jika diaktifkan pada halaman Review).
