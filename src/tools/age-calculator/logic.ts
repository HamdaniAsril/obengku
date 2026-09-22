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
