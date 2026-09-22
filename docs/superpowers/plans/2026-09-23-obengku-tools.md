# Obengku — Halaman Kumpulan Tools Harian: Implementation Plan

> **Untuk worker:** kerjakan task satu per satu, jangan lompat. Jalankan perintah
> verifikasi di setiap task sebelum lanjut.

Spec acuan: `docs/superpowers/specs/2026-09-23-obengku-tools-design.md`

**Goal:** Halaman web modular berisi kumpulan tools harian. Kerangka Next.js +
TypeScript + Tailwind, registry tool, home bergrid, route `/tools/[slug]`, dan
satu tool contoh "Kalkulator Umur" dengan unit test.

**Arsitektur:** Semua tool statis dan client-side. `src/tools/registry.ts` adalah
satu-satunya tempat mendaftarkan tool. Tiap tool berada di folder sendiri dan
mengekspor `ToolDefinition` default melalui `index.ts`.

**Tech stack:** Next.js 16 (App Router), TypeScript 5, Tailwind CSS 4
(`@tailwindcss/postcss`), React 19, Vitest 3, ESLint (`eslint-config-next`).

## Aturan Umum

- Semua teks UI Bahasa Indonesia.
- Semua komponen tool yang memakai state/handler wajib `'use client'`.
- Jangan tambah dependensi di luar yang tercantum.
- Setiap task harus berakhir dengan kondisi build/check hijau.

---

## Task 1 — Bootstrap proyek Next.js

**Files:**
- Create: seluruh scaffold proyek (`package.json`, `tsconfig.json`, `next.config.ts`,
  `postcss.config.mjs`, `src/app/**`, `public/**`, `.gitignore`, `eslint.config.mjs`)

**Langkah:**

1. Jalankan scaffold di direktori repo (folder sudah ada, ada `.git` + `docs/`):

```bash
npx --yes create-next-app@latest . \
  --ts --tailwind --eslint --app --src-dir --import-alias "@/*" \
  --use-npm --empty --disable-git --yes
```

2. Hapus scaffold default yang tidak dipakai, lalu buat ulang file app inti di task
   berikutnya (biarkan `create-next-app --empty` menghasilkan `src/app/page.tsx` dan
   `src/app/layout.tsx` minimal — akan diganti pada Task 3 & 4).

3. Perbaiki `package.json` bagian `scripts` agar berisi:

```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint",
  "test": "vitest run",
  "test:watch": "vitest"
}
```

4. Verifikasi:

```bash
npm run build
```

Expected: build sukses, muncul daftar route (minimal `/`).

---

## Task 2 — Setup Vitest

**Files:**
- Create: `vitest.config.ts`
- Modify: `package.json` (devDependencies)
- Create: `src/test/smoke.test.ts`

**Langkah:**

1. Jalankan:

```bash
npm install -D vitest jsdom
```

2. Buat `vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

3. Buat `src/test/smoke.test.ts`:

```ts
import { describe, expect, it } from 'vitest';

describe('smoke', () => {
  it('menjalankan vitest', () => {
    expect(1 + 1).toBe(2);
  });
});
```

4. Verifikasi:

```bash
npm run test
```

Expected: 1 test lulus.

---

## Task 3 — Kontrak tool & registry

**Files:**
- Create: `src/tools/types.ts`
- Create: `src/tools/registry.ts`

**Langkah:**

1. `src/tools/types.ts`:

```ts
import type { ComponentType } from 'react';

export interface ToolDefinition {
  /** Identitas unik, dipakai sebagai segmen URL: /tools/<slug> */
  slug: string;
  /** Nama tampil di kartu dan judul halaman */
  name: string;
  /** Deskripsi singkat satu baris */
  description: string;
  /** Kategori opsional untuk pengelompokan nanti */
  category?: string;
  /** Emoji atau teks ikon untuk kartu */
  icon?: string;
  /** Komponen React yang merender UI tool */
  component: ComponentType;
}
```

2. `src/tools/registry.ts` (kondisi awal masih kosong, diisi pada Task 7):

```ts
import type { ToolDefinition } from './types';

export const tools: ToolDefinition[] = [];

export function getTool(slug: string): ToolDefinition | undefined {
  return tools.find((tool) => tool.slug === slug);
}
```

3. Verifikasi:

```bash
npx tsc --noEmit
```

Expected: tidak ada error.

---

## Task 4 — App shell, layout, dan global styles

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/app/layout.tsx`
- Create: `src/components/AppShell.tsx`

**Langkah:**

1. `src/app/globals.css`:

```css
@import 'tailwindcss';

@theme {
  --font-sans: var(--font-inter), ui-sans-serif, system-ui, sans-serif;
}

:root {
  color-scheme: light dark;
}
```

2. `src/app/layout.tsx`:

```tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AppShell } from '@/components/AppShell';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Obengku — Kumpulan Tools Harian',
  description: 'Kumpulan alat bantu kecil untuk pekerjaan sehari-hari.',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" className={inter.variable}>
      <body className="bg-neutral-50 text-neutral-900 antialiased dark:bg-neutral-950 dark:text-neutral-100">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
```

3. `src/components/AppShell.tsx`:

```tsx
import Link from 'next/link';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b border-neutral-200 dark:border-neutral-800">
        <div className="mx-auto w-full max-w-5xl px-4 py-4">
          <Link href="/" className="font-semibold tracking-tight">
            Obengku
          </Link>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">{children}</main>
      <footer className="border-t border-neutral-200 dark:border-neutral-800">
        <div className="mx-auto w-full max-w-5xl px-4 py-4 text-sm text-neutral-500">
          Dibuat untuk dipakai sendiri.
        </div>
      </footer>
    </div>
  );
}
```

4. Verifikasi:

```bash
npm run lint && npm run build
```

Expected: keduanya sukses.

---

## Task 5 — Komponen kartu & grid tool

**Files:**
- Create: `src/components/ToolCard.tsx`
- Create: `src/components/ToolGrid.tsx`

**Langkah:**

1. `src/components/ToolCard.tsx`:

```tsx
import Link from 'next/link';
import type { ToolDefinition } from '@/tools/types';

export function ToolCard({ tool }: { tool: ToolDefinition }) {
  return (
    <Link
      href={`/tools/${tool.slug}`}
      className="group rounded-xl border border-neutral-200 bg-white p-5 transition hover:border-neutral-400 hover:shadow-sm dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-600"
    >
      {tool.icon ? (
        <span aria-hidden className="text-2xl">
          {tool.icon}
        </span>
      ) : null}
      <h2 className="mt-3 font-medium group-hover:underline">{tool.name}</h2>
      <p className="mt-1 text-sm text-neutral-500">{tool.description}</p>
    </Link>
  );
}
```

2. `src/components/ToolGrid.tsx`:

```tsx
import type { ToolDefinition } from '@/tools/types';
import { ToolCard } from './ToolCard';

export function ToolGrid({ tools }: { tools: ToolDefinition[] }) {
  if (tools.length === 0) {
    return (
      <p className="text-sm text-neutral-500">
        Belum ada tool. Tool pertama akan segera ditambahkan.
      </p>
    );
  }

  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {tools.map((tool) => (
        <li key={tool.slug}>
          <ToolCard tool={tool} />
        </li>
      ))}
    </ul>
  );
}
```

3. Verifikasi:

```bash
npx tsc --noEmit && npm run lint
```

Expected: tidak ada error.

---

## Task 6 — Home page

**Files:**
- Modify: `src/app/page.tsx`

**Langkah:**

1. Timpa `src/app/page.tsx`:

```tsx
import { ToolGrid } from '@/components/ToolGrid';
import { tools } from '@/tools/registry';

export default function HomePage() {
  return (
    <div className="space-y-8">
      <section className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Kumpulan Tools Harian</h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          Alat bantu kecil untuk pekerjaan sehari-hari. Pilih salah satu untuk mulai.
        </p>
      </section>
      <ToolGrid tools={tools} />
    </div>
  );
}
```

2. Verifikasi:

```bash
npm run build
```

Expected: build sukses. Halaman `/` menampilkan empty state karena registry masih kosong.

---

## Task 7 — Tool: Kalkulator Umur

**Files:**
- Create: `src/tools/age-calculator/logic.ts`
- Create: `src/tools/age-calculator/logic.test.ts`
- Create: `src/tools/age-calculator/meta.ts`
- Create: `src/tools/age-calculator/AgeCalculator.tsx`
- Create: `src/tools/age-calculator/index.ts`
- Modify: `src/tools/registry.ts`

**Langkah:**

1. `src/tools/age-calculator/logic.ts`:

```ts
export interface AgeResult {
  years: number;
  months: number;
  days: number;
  totalMonths: number;
  totalWeeks: number;
  totalDays: number;
  nextBirthday: Date;
  daysToNextBirthday: number;
  weekdayBorn: string;
}

const WEEKDAYS_ID = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Membuang komponen jam agar perbandingan tanggal murni berbasis hari. */
export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** Jumlah hari dalam bulan (monthIndex 0-11), memperhitungkan tahun kabisat. */
export function daysInMonth(year: number, monthIndex: number): number {
  return new Date(year, monthIndex + 1, 0).getDate();
}

/** Selisih hari kalender antara dua tanggal (b - a), dihitung dari tengah malam. */
export function diffInDays(a: Date, b: Date): number {
  return Math.round((startOfDay(b).getTime() - startOfDay(a).getTime()) / MS_PER_DAY);
}

/**
 * Menambahkan n bulan pada tanggal, dengan pembatasan akhir bulan
 * (31 Jan + 1 bulan = 28/29 Feb, bukan 2/3 Mar).
 */
export function addMonths(date: Date, n: number): Date {
  const year = date.getFullYear();
  const month = date.getMonth() + n;
  const targetYear = year + Math.floor(month / 12);
  const targetMonth = ((month % 12) + 12) % 12;
  const day = Math.min(date.getDate(), daysInMonth(targetYear, targetMonth));
  return new Date(targetYear, targetMonth, day);
}

/**
 * Menghitung umur bertingkat (tahun/bulan/hari) berbasis kalender.
 *
 * Algoritma berbasis jangkar: cari jumlah bulan penuh terbesar sehingga
 * `addMonths(from, bulan) <= to`, lalu sisa hari dihitung dari jangkar itu.
 * Ini menangani bulan pendek dengan benar (mis. 31 Jan → 1 Mar = 1 bulan 1 hari)
 * tanpa bergantung pada asumsi 30 hari.
 */
export function diffYMD(from: Date, to: Date) {
  const totalMonths =
    (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth());

  let months = totalMonths;
  let anchor = addMonths(from, months);
  if (anchor.getTime() > to.getTime()) {
    months -= 1;
    anchor = addMonths(from, months);
  }

  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  const days = diffInDays(anchor, to);

  return { years, months: remainingMonths, days };
}

function nextBirthdayAfter(birthDate: Date, now: Date): Date {
  const today = startOfDay(now);
  let candidate = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
  // 29 Februari pada tahun non-kabisat akan bergeser ke 1 Maret, itu diterima.
  if (candidate.getTime() < today.getTime()) {
    candidate = new Date(today.getFullYear() + 1, birthDate.getMonth(), birthDate.getDate());
  }
  return candidate;
}

export function calculateAge(birthDate: Date, now: Date): AgeResult {
  const birth = startOfDay(birthDate);
  const today = startOfDay(now);

  if (Number.isNaN(birth.getTime())) {
    throw new Error('Tanggal lahir tidak valid.');
  }
  if (birth.getTime() > today.getTime()) {
    throw new Error('Tanggal lahir tidak boleh di masa depan.');
  }

  const { years, months, days } = diffYMD(birth, today);
  const totalDays = diffInDays(birth, today);
  const totalMonths = years * 12 + months;
  const nextBirthday = nextBirthdayAfter(birth, today);

  return {
    years,
    months,
    days,
    totalMonths,
    totalWeeks: Math.floor(totalDays / 7),
    totalDays,
    nextBirthday,
    daysToNextBirthday: diffInDays(today, nextBirthday),
    weekdayBorn: WEEKDAYS_ID[birth.getDay()],
  };
}

/** Mengubah Date menjadi "YYYY-MM-DD" untuk pemakaian pada <input type="date">. */
export function toDateInputValue(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Mem-parse "YYYY-MM-DD" sebagai tanggal lokal (bukan UTC). */
export function parseDateInput(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const [, y, m, d] = match;
  return new Date(Number(y), Number(m) - 1, Number(d));
}
```

2. `src/tools/age-calculator/logic.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import {
  addMonths,
  calculateAge,
  daysInMonth,
  diffInDays,
  diffYMD,
  parseDateInput,
  toDateInputValue,
} from './logic';

const d = (s: string) => new Date(`${s}T00:00:00`);

describe('calculateAge', () => {
  it('menghitung umur ketika ulang tahun sudah lewat tahun ini', () => {
    const result = calculateAge(d('1990-05-10'), d('2024-06-15'));
    expect(result.years).toBe(34);
    expect(result.months).toBe(1);
    expect(result.days).toBe(5);
  });

  it('menghitung umur ketika ulang tahun belum lewat tahun ini', () => {
    const result = calculateAge(d('1990-05-10'), d('2024-03-01'));
    expect(result.years).toBe(33);
    expect(result.months).toBe(9);
    expect(result.days).toBe(20);
  });

  it('mengembalikan nol pada hari kelahiran', () => {
    const result = calculateAge(d('2000-01-01'), d('2000-01-01'));
    expect(result.years).toBe(0);
    expect(result.months).toBe(0);
    expect(result.days).toBe(0);
    expect(result.daysToNextBirthday).toBe(0);
  });

  it('menangani ulang tahun 29 Februari pada tahun non-kabisat', () => {
    const result = calculateAge(d('2000-02-29'), d('2023-03-01'));
    expect(result.years).toBe(23);
    expect(result.months).toBe(0);
    expect(result.days).toBe(1);
  });

  it('menghitung total hari dan minggu', () => {
    const result = calculateAge(d('2024-01-01'), d('2024-01-15'));
    expect(result.totalDays).toBe(14);
    expect(result.totalWeeks).toBe(2);
    expect(result.totalMonths).toBe(0);
  });

  it('menghitung hari menuju ulang tahun berikutnya', () => {
    const result = calculateAge(d('1990-01-10'), d('2024-01-01'));
    expect(result.daysToNextBirthday).toBe(9);
  });

  it('menghitung total bulan lintas tahun', () => {
    const result = calculateAge(d('2020-01-15'), d('2024-03-15'));
    expect(result.totalMonths).toBe(50);
  });

  it('melempar error untuk tanggal di masa depan', () => {
    expect(() => calculateAge(d('2030-01-01'), d('2024-01-01'))).toThrow(
      'Tanggal lahir tidak boleh di masa depan.',
    );
  });

  it('melempar error untuk tanggal tidak valid', () => {
    expect(() => calculateAge(new Date('bukan tanggal'), d('2024-01-01'))).toThrow(
      'Tanggal lahir tidak valid.',
    );
  });

  it('mengembalikan nama hari lahir dalam Bahasa Indonesia', () => {
    // 1990-05-10 adalah hari Kamis
    expect(calculateAge(d('1990-05-10'), d('2024-01-01')).weekdayBorn).toBe('Kamis');
  });
});

describe('helpers', () => {
  it('daysInMonth menangani Februari kabisat', () => {
    expect(daysInMonth(2024, 1)).toBe(29);
    expect(daysInMonth(2023, 1)).toBe(28);
    expect(daysInMonth(2024, 0)).toBe(31);
  });

  it('diffInDays menghitung selisih hari kalender', () => {
    expect(diffInDays(d('2024-01-01'), d('2024-01-10'))).toBe(9);
  });

  it('diffYMD meminjam hari dari bulan sebelumnya', () => {
    expect(diffYMD(d('2024-01-31'), d('2024-03-01'))).toEqual({
      years: 0,
      months: 1,
      days: 1,
    });
  });

  it('diffYMD membatasi akhir bulan saat tanggal akhir lebih kecil', () => {
    expect(diffYMD(d('2024-01-31'), d('2024-02-29'))).toEqual({
      years: 0,
      months: 1,
      days: 0,
    });
  });

  it('addMonths membatasi ke akhir bulan', () => {
    expect(toDateInputValue(addMonths(d('2024-01-31'), 1))).toBe('2024-02-29');
    expect(toDateInputValue(addMonths(d('2024-03-31'), -1))).toBe('2024-02-29');
    expect(toDateInputValue(addMonths(d('2024-12-15'), 1))).toBe('2025-01-15');
  });

  it('parseDateInput dan toDateInputValue bolak-balik konsisten', () => {
    const parsed = parseDateInput('1990-05-10');
    expect(parsed).not.toBeNull();
    expect(toDateInputValue(parsed as Date)).toBe('1990-05-10');
  });

  it('parseDateInput mengembalikan null untuk input tidak valid', () => {
    expect(parseDateInput('10-05-1990')).toBeNull();
    expect(parseDateInput('')).toBeNull();
  });
});
```

3. `src/tools/age-calculator/meta.ts`:

```ts
export const meta = {
  slug: 'kalkulator-umur',
  name: 'Kalkulator Umur',
  description: 'Hitung umur lengkap dan hitung mundur ulang tahun berikutnya.',
  category: 'Tanggal',
  icon: '🎂',
} as const;
```

4. `src/tools/age-calculator/AgeCalculator.tsx`:

```tsx
'use client';

import { useMemo, useState } from 'react';
import { calculateAge, parseDateInput, toDateInputValue } from './logic';

export function AgeCalculator() {
  const [birthValue, setBirthValue] = useState('1990-05-10');

  const { result, error } = useMemo(() => {
    if (!birthValue) {
      return { result: null, error: 'Masukkan tanggal lahir terlebih dahulu.' };
    }
    const birthDate = parseDateInput(birthValue);
    if (!birthDate) {
      return { result: null, error: 'Format tanggal tidak dikenali.' };
    }
    if (birthDate.getFullYear() < 1900) {
      return { result: null, error: 'Tahun lahir minimal 1900.' };
    }
    if (birthDate.getTime() > Date.now()) {
      return { result: null, error: 'Tanggal lahir tidak boleh di masa depan.' };
    }
    try {
      return { result: calculateAge(birthDate, new Date()), error: null };
    } catch (err) {
      return {
        result: null,
        error: err instanceof Error ? err.message : 'Terjadi kesalahan.',
      };
    }
  }, [birthValue]);

  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);

  return (
    <div className="space-y-6">
      <div className="max-w-xs space-y-2">
        <label htmlFor="tanggal-lahir" className="block text-sm font-medium">
          Tanggal lahir
        </label>
        <input
          id="tanggal-lahir"
          type="date"
          value={birthValue}
          max={toDateInputValue(new Date())}
          onChange={(event) => setBirthValue(event.target.value)}
          className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
        />
      </div>

      {error ? (
        <p
          role="alert"
          className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200"
        >
          {error}
        </p>
      ) : null}

      {result ? (
        <div className="space-y-4">
          <div className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
            <p className="text-sm text-neutral-500">Umur</p>
            <p className="mt-1 text-2xl font-semibold">
              {result.years} tahun {result.months} bulan {result.days} hari
            </p>
          </div>

          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              { label: 'Total bulan', value: result.totalMonths.toLocaleString('id-ID') },
              { label: 'Total minggu', value: result.totalWeeks.toLocaleString('id-ID') },
              { label: 'Total hari', value: result.totalDays.toLocaleString('id-ID') },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"
              >
                <dt className="text-sm text-neutral-500">{item.label}</dt>
                <dd className="mt-1 text-lg font-medium">{item.value}</dd>
              </div>
            ))}
          </dl>

          <div className="rounded-xl border border-neutral-200 bg-white p-5 text-sm dark:border-neutral-800 dark:bg-neutral-900">
            <p>
              Lahir pada hari <strong>{result.weekdayBorn}</strong>.
            </p>
            <p className="mt-1">
              Ulang tahun berikutnya <strong>{formatDate(result.nextBirthday)}</strong>, dalam{' '}
              <strong>{result.daysToNextBirthday}</strong> hari.
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
```

5. `src/tools/age-calculator/index.ts`:

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

6. `src/tools/registry.ts` — tambahkan entri:

```ts
import type { ToolDefinition } from './types';
import ageCalculatorTool from './age-calculator';

export const tools: ToolDefinition[] = [ageCalculatorTool];

export function getTool(slug: string): ToolDefinition | undefined {
  return tools.find((tool) => tool.slug === slug);
}
```

7. Verifikasi:

```bash
npm run test && npx tsc --noEmit && npm run lint
```

Expected: semua test lulus, tidak ada error tipe, lint bersih.

Catatan: jika ada test yang gagal, periksa dulu apakah ekspektasi angka yang salah
atau logika `diffYMD`. Konsultasikan ke user sebelum mengubah ekspektasi test.

---

## Task 8 — Halaman route per tool

**Files:**
- Create: `src/app/tools/[slug]/page.tsx`
- Modify: `src/tools/registry.ts` (tidak berubah, hanya sebagai referensi)

**Langkah:**

1. `src/app/tools/[slug]/page.tsx`:

```tsx
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getTool, tools } from '@/tools/registry';

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return tools.map((tool) => ({ slug: tool.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const tool = getTool(slug);
  if (!tool) return { title: 'Tool tidak ditemukan — Obengku' };
  return { title: `${tool.name} — Obengku`, description: tool.description };
}

export default async function ToolPage({ params }: PageProps) {
  const { slug } = await params;
  const tool = getTool(slug);
  if (!tool) notFound();

  const ToolComponent = tool.component;

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <Link
          href="/"
          className="inline-block text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
        >
          ← Kembali
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">{tool.name}</h1>
        <p className="text-neutral-600 dark:text-neutral-400">{tool.description}</p>
      </div>
      <ToolComponent />
    </div>
  );
}
```

2. Verifikasi:

```bash
npm run build
```

Expected: build sukses dan output route menampilkan `/tools/[slug]` sebagai
prerendered static (SSG) dengan slug `kalkulator-umur`.

---

## Task 9 — README

**Files:**
- Create: `README.md`

**Langkah:**

1. Tulis `README.md` berisi:
   - Judul `Obengku` dan deskripsi satu paragraf.
   - Cara menjalankan: `npm install`, `npm run dev`, buka `http://localhost:3000`.
   - Daftar perintah: `npm run dev`, `npm run build`, `npm run start`,
     `npm run lint`, `npm run test`, `npm run test:watch`.
   - **Cara menambah tool baru** (4 langkah):
     1. Buat folder `src/tools/<slug>/`.
     2. Buat `meta.ts` (slug, name, description, icon opsional), komponen
        `'use client'`, dan `logic.ts` bila ada logika murni.
     3. Buat `index.ts` yang mengekspor `ToolDefinition` sebagai default.
     4. Tambahkan import + entri pada array `tools` di `src/tools/registry.ts`.
     5. (Opsional) Tulis `logic.test.ts` dan jalankan `npm run test`.
   - Cara menambah tool: contoh potongan kode `index.ts` dan baris registry.
   - Struktur folder singkat.
   - Catatan bahwa semua tool berjalan di browser (tidak ada data yang dikirim ke server).

2. Verifikasi:

```bash
npm run lint && npm run test && npm run build
```

Expected: ketiganya sukses.

---

## Task 10 — Verifikasi akhir

**Langkah:**

1. Jalankan semua check:

```bash
npm run lint && npm run test && npm run build
```

2. Jalankan dev server dan cek manual:

```bash
npm run dev
```

Cek di browser:
- `/` menampilkan kartu "Kalkulator Umur".
- Klik kartu → `/tools/kalkulator-umur` terbuka, ada tombol "← Kembali".
- Isi tanggal lahir → umur, total bulan/minggu/hari, hari lahir, dan hitung mundur
  ulang tahun muncul.
- Uji input invalid (tanggal masa depan via devtools) → muncul pesan Bahasa Indonesia.
- `/tools/tidak-ada` menampilkan halaman 404 bawaan Next.js.

3. Hentikan dev server (Ctrl+C) dan laporkan hasil.

## Kriteria Selesai

- `npm run lint`, `npm run test`, `npm run build` hijau.
- Home bergrid responsif dengan satu kartu tool.
- Route `/tools/kalkulator-umur` berfungsi dan statis saat build.
- README menjelaskan cara menambah tool.
- Tidak ada dependensi di luar yang tercantum di plan ini.
