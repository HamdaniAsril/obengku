# Obengku

Kumpulan alat bantu kecil untuk pekerjaan sehari-hari. Semua tool berjalan
sepenuhnya di browser — tidak ada data yang dikirim ke server. Setiap tool
adalah komponen React yang berdiri sendiri di dalam satu folder, didaftarkan
sekali di sebuah registry, dan halamannya dibuat otomatis dari registry
tersebut.

## Menjalankan

```bash
npm install
npm run dev
```

Buka http://localhost:3000.

## Perintah

| Perintah | Kegunaan |
| --- | --- |
| `npm run dev` | Menjalankan dev server |
| `npm run build` | Build statis ke folder `out/` |
| `npm run lint` | Menjalankan ESLint |
| `npm run test` | Menjalankan unit test sekali jalan (`vitest run`) |
| `npm run test:watch` | Unit test mode watch (`vitest`) |

## Deploy

Situs berjalan di https://obengku.nekomade.com lewat GitHub Pages. Setiap push ke
`main` menjalankan `.github/workflows/pages.yml`: lint, test, build statis, lalu
deploy. Domain diatur oleh `public/CNAME` dan record CNAME `obengku` →
`hamdaniasril.github.io` di DNS `nekomade.com`.

Karena build-nya statis (`output: "export"`), fitur yang butuh server Next.js —
Route Handler dinamis, `cookies()`/`headers()`, atau route tanpa
`generateStaticParams` — tidak bisa dipakai.

## Menambah tool baru

Setiap tool berdiri sendiri di dalam satu folder dan didaftarkan sekali di
registry.

1. Buat folder `src/tools/<nama-folder>/` (contoh: `src/tools/age-calculator/`).
   Nama folder bebas dan **tidak harus sama** dengan `slug`: import di langkah 6
   memakai nama folder, sedangkan URL `/tools/<slug>` memakai `slug` dari
   `meta.ts`. Pada contoh ini foldernya `age-calculator` tetapi slug-nya
   `kalkulator-umur`.
2. Buat `meta.ts` — identitas tool yang dipakai untuk kartu di home dan judul
   halaman:

   ```ts
   export const meta = {
     slug: 'kalkulator-umur',
     name: 'Kalkulator Umur',
     description: 'Hitung umur lengkap dan hitung mundur ulang tahun berikutnya.',
     category: 'Tanggal',
     icon: '🎂',
   } as const;
   ```

   `slug` menjadi segmen URL `/tools/<slug>`. Wajib ada: `slug`, `name`,
   `description`. Opsional: `category` dan `icon`.
3. Buat komponen UI di folder yang sama. Tambahkan `'use client'` di baris
   pertama **hanya jika** komponen memakai state (`useState`, `useReducer`) atau
   event handler (`onClick`, `onChange`, dan sejenisnya). Komponen yang murni
   merender props tanpa interaktivitas tidak perlu directive tersebut dan bisa
   tetap menjadi Server Component:

   ```tsx
   'use client';

   import { useState } from 'react';

   export function AgeCalculator() {
     const [value, setValue] = useState('');
     return <input value={value} onChange={(event) => setValue(event.target.value)} />;
   }
   ```

4. Opsional: bila ada logika yang bisa diuji, pisahkan ke `logic.ts` sebagai
   fungsi murni — terima semua input sebagai parameter, termasuk tanggal
   "sekarang" (jangan membaca `new Date()` di dalam fungsi murni), lalu tulis
   `logic.test.ts` di sebelahnya. Tool yang tidak punya logika murni boleh
   melewati langkah ini.
5. Buat `index.ts` yang merangkai metadata dan komponen menjadi
   `ToolDefinition`:

   ```ts
   import type { ToolDefinition } from '../types';
   import { meta } from './meta';
   import { AgeCalculator } from './AgeCalculator';

   export const ageCalculatorTool: ToolDefinition = {
     ...meta,
     component: AgeCalculator,
   };

   export default ageCalculatorTool;
   ```

   Sesuaikan nama file komponen (`./AgeCalculator`) dengan komponen yang Anda
   buat. Urutan langkah 3–5 boleh dibolak-balik; yang penting keempat file
   (`meta.ts`, komponen, `index.ts`, dan opsional `logic.ts`) berada di folder
   tool yang sama.

   `ToolDefinition` didefinisikan di `src/tools/types.ts` dan mewajibkan `slug`,
   `name`, `description`, serta `component`; `...meta` sudah memenuhi tiga yang
   pertama. Untuk tool lain, ganti tipe dan nama variabelnya sesuai tool —
   yang penting adalah `default export`-nya, karena itulah yang diimpor
   registry.
6. Daftarkan di `src/tools/registry.ts`. Yang perlu Anda ubah hanya dua hal:
   **tambahkan baris `import`** untuk tool baru, lalu **tambahkan variabelnya ke
   dalam array `tools`**. Jangan menimpa isi array — tool yang sudah terdaftar
   harus tetap ada. `getTool` tidak perlu diubah sama sekali.

   Sebelum:

   ```ts
   import type { ToolDefinition } from './types';
   import ageCalculatorTool from './age-calculator';

   export const tools: ToolDefinition[] = [ageCalculatorTool];
   ```

   Sesudah menambah tool kedua (folder `src/tools/tire-pressure/`):

   ```ts
   import type { ToolDefinition } from './types';
   import ageCalculatorTool from './age-calculator';
   import tirePressureTool from './tire-pressure';

   export const tools: ToolDefinition[] = [ageCalculatorTool, tirePressureTool];
   ```

   Sisa berkasnya, termasuk `getTool`, biarkan apa adanya:

   ```ts
   export function getTool(slug: string): ToolDefinition | undefined {
     return tools.find((tool) => tool.slug === slug);
   }
   ```

7. Verifikasi dengan `npm run lint`, `npm run test`, dan `npm run build`.

Halaman home dan route `/tools/<slug>` otomatis ikut karena keduanya membaca
dari `registry.ts`: home mengambil semua isi `tools` untuk grid kartu,
sedangkan route per tool memakai `getTool(slug)` untuk mencari tool berdasarkan
slug dan `generateStaticParams` untuk membuat halaman tiap tool saat build.

## Struktur folder

```
src/
  app/                      # routing Next.js (App Router)
    page.tsx                # home: grid semua tool
    layout.tsx              # shell halaman
    globals.css             # style global Tailwind
    tools/[slug]/page.tsx   # halaman per tool
  components/               # komponen bersama (AppShell, ToolCard, ToolGrid)
  test/
    smoke.test.ts           # smoke test lintas aplikasi
  tools/
    types.ts                # kontrak ToolDefinition
    registry.ts             # daftar semua tool
    <nama-folder>/          # satu folder per tool (bebas, tidak harus = slug)
      meta.ts
      index.ts
      <Komponen>.tsx
      logic.ts              # opsional: fungsi murni
      logic.test.ts         # opsional: test untuk logic.ts
```

Konfigurasi Vitest ada di `vitest.config.mts`.
