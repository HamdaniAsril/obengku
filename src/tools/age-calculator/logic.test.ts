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
