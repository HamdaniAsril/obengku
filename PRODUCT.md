# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Pemilik data / umum: sesekali membutuhkan **satu** tool spesifik — mengonversi berkas, menghitung, mengecek — dan tidak mau mendaftar di situs mana pun. Situasinya pekerjaan harian yang terputus: satu kebutuhan kecil diselesaikan dalam hitungan detik, lalu tab ditutup. Bukan pengguna yang menjelajah atau kembali rutin.

## Product Purpose

Kumpulan alat bantu kecil untuk pekerjaan sehari-hari. Sukses berarti pengguna menyelesaikan satu tugas spesifik tanpa hambatan, tanpa akun, tanpa menunggu, lalu pergi. Produk tidak menyimpan apa pun tentang penggunanya karena memang tidak menerima apa pun.

## Positioning

Tiga mekanisme yang tidak bisa dengan jujur ditiru situs konverter/kalkulator sejenis:

1. **Tidak ada yang dikirim ke server** — berkas dibaca dan diproses sepenuhnya di perangkat.
2. **Tanpa iklan dan tanpa login** — tidak ada dinding registrasi, tidak ada jeda iklan.
3. **Sengaja kecil dan spesifik** — bukan platform raksasa; tiap tool mengerjakan satu hal dengan benar.

## Operating Context

Pengguna datang karena satu tugas, bukan untuk menjelajah. Satu rute berisi satu tool. Karena tidak ada backend, pengalaman tidak pernah bergantung pada ketersediaan server produk — hanya pada peramban dan perangkatnya sendiri.

## Capabilities and Constraints

- Sepuluh tool aktif: **Kalkulator Umur**, **Kalkulator Tekanan Ban**, **Konverter CSV ke Excel**, **Pembuat QR Code**, **Kompresi Gambar**, **Kompresi PDF**, **Lempar Koin**, **Spin Wheel**, **Kalkulator Rasio**, **Itinerary Generator**.
- **100% client-side**: tanpa API, tanpa basis data, tanpa kunci, tanpa variabel `env`.
- Encoder QR ditulis sendiri (ISO 18004, tanpa dependensi); hasilnya diverifikasi silang dengan library dekoder independen (jsQR) di luar runtime produksi.
- Dependensi runtime baru hanya untuk Kompresi PDF: **pdf-lib** (mode Kompres Pro) dan **pdfjs-dist** (mode Kompres 18 Pro Max 1TB), keduanya dimuat lewat dynamic import hanya saat halaman tool-nya dibuka. Kompresi Gambar murni canvas API peramban, tanpa dependensi.
- Seluruh teks antarmuka dalam **Bahasa Indonesia**.
- Struktur **folder-per-tool** + registry bertipe; `slug` boleh berbeda dari nama folder.
- Menambahkan tool = folder baru + satu entri registry.
- Logika tiap tool dipisahkan dari komponennya dan diuji unit (Vitest).

## Brand Commitments

- Nama: **Obengku**.
- Kredit: **© 2026 Obengku | Hamdani Asril**.
- Bahasa Indonesia untuk seluruh UI.
- 100% client-side.
- Struktur folder-per-tool + registry.

Tidak ada logo, tipografi, atau palet yang pernah dikunci pengguna. Perubahan visual tidak menyentuh komitmen di atas.

## Evidence on Hand

- Sepuluh tool berjalan, **300 unit test** lulus, gate lint/typecheck/build hijau.
- Keluaran Konverter CSV→XLSX diverifikasi silang dengan **openpyxl 3.1.5**, `unzip -t`, dan `xmllint`.
- Encoder QR diverifikasi round-trip (dekode independen di test) dan silang dengan **jsQR 1.4.0** (dev-only, di luar dependensi runtime): 39/39 kasus bergaya (kotak/bulat/halus × teks pendek/panjang/emoji/URL × warna normal-terbalik × logo) tetap terpindai setelah gaya mata finder mengikuti bentuk modul.
- Terdeploy: `https://obengku.nekomade.com` (GitHub Pages, dibangun otomatis oleh GitHub Actions setiap push ke `main`).
- Tidak ada: tangkapan layar historis, riset pengguna, logo, aset merek, testimoni, atau metrik penggunaan. Pekerjaan desain tidak boleh mengarang salah satunya.

## Product Principles

1. Satu tool, satu tugas — selesai dalam hitungan detik.
2. Tidak ada yang meninggalkan perangkat.
3. Kecil dan spesifik mengalahkan luas dan setengah jadi.
4. Akurasi diuji, bukan dijanjikan.
5. Struktur harus membuat penambahan tool baru terasa rutin, bukan proyek.

## Accessibility & Inclusion

Tidak ada kebutuhan aksesibilitas spesifik yang dinyatakan pengguna. Praktik implementasi proyek memakai **WCAG AA** sebagai pagar (kontras terukur, target sentuh ≥44 px, navigasi papan ketik, `prefers-reduced-motion`) — dicatat sebagai fakta praktik, bukan permintaan pengguna.
