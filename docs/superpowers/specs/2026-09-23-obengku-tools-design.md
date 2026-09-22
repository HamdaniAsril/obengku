# Obengku — Halaman Kumpulan Tools Harian (Design Spec)

Tanggal: 2026-09-23
Status: Disetujui (menunggu review spec)

## Tujuan

Membangun satu halaman web modular berisi kumpulan tools harian. Kerangka dibuat
sekarang dengan satu tool contoh (**Kalkulator Umur**). Tool baru ditambahkan
kemudian setiap kali ada ide, tanpa perlu mengubah struktur aplikasi.

## Keputusan yang Disetujui

| Aspek | Keputusan |
|---|---|
| Stack | Next.js (App Router) + TypeScript + Tailwind CSS |
| Pola tool | Folder per tool + registry terpusat |
| Navigasi | Grid kartu di home, tiap tool punya route sendiri `/tools/[slug]` |
| Isi awal | Kerangka lengkap + 1 tool contoh: Kalkulator Umur |
| Bahasa UI | Bahasa Indonesia |
| Data | 100% client-side, tanpa API/DB |
| Test | Vitest untuk logic murni tiap tool |

## Struktur Proyek

```
src/
  app/
    layout.tsx              # shell: header, footer, font, metadata
    page.tsx                # home: grid kartu semua tool
    globals.css
    tools/[slug]/page.tsx   # halaman per tool
  components/
    AppShell.tsx
    ToolCard.tsx
    ToolGrid.tsx
  tools/
    types.ts                # interface ToolDefinition
    registry.ts             # satu tempat daftar semua tool
    age-calculator/
      meta.ts               # slug, nama, deskripsi, ikon
      AgeCalculator.tsx     # komponen UI
      logic.ts              # calculateAge (pure function)
      index.ts              # gabung meta + component
      logic.test.ts         # unit test
README.md                   # cara menjalankan + cara menambah tool
```

## Kontrak

```ts
// src/tools/types.ts
export interface ToolDefinition {
  slug: string;
  name: string;
  description: string;
  category?: string;
  icon?: string;
  component: ComponentType;
}
```

`registry.ts` mengekspor `tools: ToolDefinition[]` dan helper `getTool(slug)`.

## Alur Data

```
registry.ts → Home (ToolGrid → ToolCard) → /tools/[slug] (lookup slug → render component)
```

- `app/tools/[slug]/page.tsx` memakai `generateStaticParams()` dari registry sehingga
  tiap tool menjadi halaman statis saat build.
- Slug tidak dikenal → `notFound()` → halaman 404 bawaan Next.js.
- Tiap tool menyimpan state-nya sendiri via `useState`. Tidak ada state global.
- Input user tidak pernah keluar browser.

## Error Handling

- `logic.ts` tiap tool bersifat pure dan defensif.
- Input tidak valid pada Kalkulator Umur (tanggal kosong, format salah, tahun
  < 1900, tanggal di masa depan) → pesan inline Bahasa Indonesia, bukan crash.
- Belum ada `error.tsx` per-route; ditambahkan saat ada tool yang berpotensi gagal.
- Tidak ada `try/catch` global.

## Kalkulator Umur

Input: satu field tanggal lahir (`<input type="date">`).

Output bila valid:
- Umur lengkap: `X tahun Y bulan Z hari`
- Total satuan lain: total bulan, total minggu, total hari
- Hari ulang tahun berikutnya dan berapa hari lagi
- Nama hari lahir (mis. "Rabu")

```ts
// src/tools/age-calculator/logic.ts
export interface AgeResult {
  years: number;
  months: number;
  days: number;
  totalMonths: number;
  totalWeeks: number;
  totalDays: number;
  nextBirthday: Date;
  daysToNextBirthday: number;
  weekdayBorn: string; // nama hari Bahasa Indonesia
}

export function calculateAge(birthDate: Date, now: Date): AgeResult
```

- `now` disuntikkan sebagai parameter agar deterministik dan mudah dites.
- Perhitungan berbasis kalender (borrow hari/bulan), bukan asumsi 30 hari.
- Perhitungan mundur tanggal → tanpa dependensi eksternal.

## Tampilan

- **Home:** header judul + subjudul singkat, grid kartu responsif (1 → 2 → 3 kolom).
  Kartu memuat ikon, nama, deskripsi, link ke `/tools/<slug>`. Ada empty state
  ("Belum ada tool") untuk jaga-jaga.
- **Halaman tool:** tombol "← Kembali", judul, deskripsi, lalu area kerja tool.
  Konsisten untuk semua tool.
- **Style:** Tailwind, netral & bersih, dukungan light/dark via `prefers-color-scheme`,
  satu warna aksen, kartu border + hover halus. Tanpa UI library tambahan.
- Font: `next/font` (Inter).

## Cara Menambah Tool Baru

1. Buat folder `src/tools/<slug>/` berisi `meta.ts`, komponen, `logic.ts` (opsional),
   dan `index.ts`.
2. Tambahkan import + satu entri di `src/tools/registry.ts`.
3. (Opsional) Tambahkan `logic.test.ts` bila ada logika murni.

## Verifikasi

Perintah yang harus hijau:
- `npm run lint`
- `npm run build`
- `npm run test`

## Di Luar Cakupan

- Autentikasi, database, API backend.
- i18n multi-bahasa (UI hanya Bahasa Indonesia).
- E2E test.
- Deployment/CI (dilakukan terpisah).
