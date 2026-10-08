---
name: Obengku
description: Kumpulan tools harian — halaman putih bersih dengan ikon garis kecil berwarna.
colors:
  paper: "#ffffff"
  surface: "#ffffff"
  panel: "#fafafb"
  ink: "#0a0a0b"
  ink-muted: "#5f6672"
  ink-faint: "#9aa0aa"
  hairline: "#ececef"
  line: "#d4d6db"
  focus: "#2563eb"
  danger: "#dc2626"
  success: "#15803d"
  success-bg: "#edfaf1"
typography:
  display:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "2.25rem → 3rem (md)"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "-0.03em"
  tool-title:
    fontFamily: "Inter"
    fontSize: "1.875rem → 2.25rem (md)"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-0.025em"
  card-title:
    fontFamily: "Inter"
    fontSize: "15px"
    fontWeight: 600
    lineHeight: 1.3
  body:
    fontFamily: "Inter"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.55
  small:
    fontFamily: "Inter"
    fontSize: "13–13.5px"
    fontWeight: 400
    lineHeight: 1.5
rounded:
  card: "14px"
  control: "10px"
  pill: "999px"
spacing:
  base: "4px"
  card-gap: "12px"
  card-padding: "20px"
  section-gap: "48px"
---

# Design System: Obengku

## Overview

**Creative North Star: "Clean White"**

Halaman putih polos, garis tipis, dan ikon garis kecil berwarna. Warna hanya muncul
pada ikon — permukaan, kartu, dan kontrol tetap putih. Pengguna datang untuk satu
tugas, jadi tidak ada hero bergambar, gradien, atau dekorasi: judul, satu baris
keunggulan, filter kategori, lalu grid tool.

Sistem ini selalu terang (light-only). Desain sumber ada di `obengku.pen`
(frame **03 Beranda — Clean White**).

## Colors

- **Putih** (`#ffffff`): latar halaman, kartu, field, tombol sekunder.
- **Tinta** (`#0a0a0b`): judul, teks utama, tombol utama, chip aktif, logo.
- **Tinta redup** (`#5f6672`): deskripsi, keterangan, footer.
- **Tinta samar** (`#9aa0aa`): angka jumlah di chip, placeholder. Bukan untuk teks yang harus dibaca.
- **Hairline** (`#ececef`): garis kartu, header, footer, kartu hasil.
- **Line** (`#d4d6db`): garis kontrol interaktif (field, tombol sekunder, chip saat hover).
- **Fokus** (`#2563eb`): cincin `:focus-visible` 3px.
- **Status:** galat merah (`#dc2626` ikon, teks `#7f1d1d` di atas `#fef2f2`); selesai hijau (`#15803d` di atas `#edfaf1`).

### Warna ikon

Setiap tool dan kategori punya satu warna ikon, didefinisikan di
`src/components/homeCatalog.ts`. Warna dipakai **hanya** pada stroke ikon, tidak
pernah sebagai latar kartu atau kotak ikon.

| Kategori | Warna |
| --- | --- |
| File & Dokumen | `#3B82F6` |
| Hitung & Ukur | `#F97316` |
| Hiburan & Keputusan | `#EC4899` |
| Perjalanan | `#6366F1` |

### Named Rules

**The Icon-Only Color Rule.** Warna saturasi hanya hidup di ikon garis. Kartu,
chip, dan kontrol tetap putih atau tinta. Pengecualian fungsional: irisan Spin
Wheel, koin, dan status (galat/selesai).

**The No-Box Icon Rule.** Ikon tool tampil polos tanpa kotak atau latar berwarna.
Satu-satunya ikon berkotak adalah logo (kunci pas putih di kotak tinta 28px).

## Typography

Satu keluarga: **Inter** (via `next/font/google`), bobot 400/500/600. Hierarki
dari ukuran dan bobot 600, tanpa font display terpisah. Kelas `font-display` yang
masih dipakai komponen tool kini hanya berarti Inter 600 dengan tracking -0.02em
untuk angka/hasil.

- **Display** — H1 beranda: 36px → 48px (md), 600, `-0.03em`.
- **Tool title** — H1 halaman tool: 30px → 36px (md), 600, `-0.025em`, ikon tool 28px di kiri.
- **Card title** — 15px, 600.
- **Body** — 16–17px, 400, tinta redup untuk deskripsi, lebar maks ~560–600px.
- **Small** — 13–13.5px untuk deskripsi kartu, chip, footer, catatan.

## Layout

- Kontainer konten 1040px, padding samping 20px.
- **Header** 64px: logo + "Obengku" di kiri, "N tool · gratis · tanpa akun" di kanan (disembunyikan <480px). Garis bawah hairline.
- **Footer** 64px: kredit di kiri, gembok hijau + "Tidak ada data yang dikirim ke server." di kanan. Garis atas hairline.
- **Beranda:** judul → subjudul → baris keunggulan (3 ikon kecil berwarna) → chip filter kategori → grid tool.
- **Grid tool:** 1 kolom <640px, 2 kolom ≥640px, 3 kolom ≥1024px, jarak 12px, tinggi kartu min 180px.
- **Halaman tool:** tautan "Semua tool" → judul dengan ikon → deskripsi → komponen tool, jarak antarbagian 32px.

## Elevation & Depth

Datar. Tidak ada bayangan saat diam. Satu bayangan halus hanya saat kartu di-hover
(`0 6px 18px -10px rgb(20 24 40 / 0.18)`) bersama garis yang sedikit menggelap.

## Shapes

- Kartu dan kartu hasil: 14px, garis 1px hairline.
- Field, tombol, kotak pratinjau: 10px, garis 1px `line`.
- Chip filter dan badge status: pil 999px.
- Satu ketebalan garis: **1px**. Tidak ada outline tebal.

## Components

### Tool Card
Putih, garis hairline, radius 14px, padding 20px. Baris atas: ikon tool 24px
berwarna (kiri) dan chevron abu-abu 16px (kanan, bergeser 2px saat hover). Di
bawahnya judul 15px/600 dan deskripsi 13.5px tinta redup.

### Category Chip
Pil 36px (44px di mobile), garis hairline, ikon kategori 15px berwarna, label,
lalu jumlah dalam tinta samar. Aktif (`aria-pressed="true"`): latar tinta, teks
dan ikon putih. Di <640px chip menjadi satu baris yang bisa digeser horizontal.

### Buttons
- **Primary:** latar tinta, teks putih, radius 10px, min-height 44px, 14px/600.
- **Ghost / secondary:** putih, garis `line`, teks tinta; hover latar `#f7f7f8`.
- Disabled: opacity 0.5.

### Fields
Putih, garis 1px `line`, radius 10px, min-height 44px, teks 16px. Hover
menggelapkan garis; fokus mengganti garis ke biru dengan cincin 3px.

### Result Card
Putih, garis hairline, radius 14px, padding 20px. Label kecil di atas, angka hasil
dalam Inter 600, badge "Selesai" hijau dengan ikon centang di kanan.

### Alert
Latar `#fef2f2`, garis `#fecaca`, teks `#7f1d1d`, ikon lingkaran-seru merah.

## Do's and Don'ts

### Do
- Pakai ikon garis (stroke 2, gaya Lucide) dengan satu warna per tool/kategori.
- Jaga permukaan tetap putih; pisahkan area dengan garis hairline atau ruang kosong.
- Pakai garis 1px di semua permukaan dan kontrol.
- Pertahankan target sentuh ≥44px di mobile dan cincin fokus yang terlihat.

### Don't
- Jangan beri ikon kotak atau latar berwarna.
- Jangan pakai blok warna, gradien, pola latar, atau outline tebal.
- Jangan tambah bayangan saat diam.
- Jangan pakai font kedua.
