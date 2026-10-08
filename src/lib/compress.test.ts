import { describe, expect, it } from 'vitest';
import { findQuality, formatBytes, parseTargetKb, savedPercent } from './compress';

describe('findQuality', () => {
  it('mengembalikan kualitas tertinggi yang masih muat di target', async () => {
    const encode = async (quality: number) => Math.round(quality * 10_000);
    const result = await findQuality(5_000, encode);

    expect(result.reached).toBe(true);
    expect(result.bytes).toBeLessThanOrEqual(5_000);
    expect(Math.abs(result.quality - 0.5)).toBeLessThan(0.02);
  });

  it('memakai kualitas penuh saat hasil penuh pun sudah di bawah target', async () => {
    const result = await findQuality(10_000, async () => 100);

    expect(result).toMatchObject({ reached: true, quality: 0.95, iterations: 1 });
    expect(result.bytes).toBe(100);
  });

  it('melaporkan target tidak tercapai saat kualitas terendah pun melebihi target', async () => {
    const result = await findQuality(5_000, async () => 6_000);

    expect(result.reached).toBe(false);
    expect(result.quality).toBe(0.3);
    expect(result.bytes).toBe(6_000);
  });

  it('membatasi jumlah encode yang dipanggil', async () => {
    let calls = 0;
    const encode = async (quality: number) => {
      calls += 1;
      return Math.round(quality * 10_000);
    };

    await findQuality(5_000, encode);

    expect(calls).toBeLessThanOrEqual(10);
  });

  it('menghormati batas kualitas kustom', async () => {
    const result = await findQuality(5_000, async () => 6_000, { min: 0.5 });

    expect(result.reached).toBe(false);
    expect(result.quality).toBe(0.5);
  });
});

describe('parseTargetKb', () => {
  it('membaca angka bulat positif', () => {
    expect(parseTargetKb('500')).toBe(500);
    expect(parseTargetKb(' 500 ')).toBe(500);
    expect(parseTargetKb('1')).toBe(1);
  });

  it('menolak kosong, nol, pecahan, dan bukan angka', () => {
    expect(parseTargetKb('')).toBeNull();
    expect(parseTargetKb('   ')).toBeNull();
    expect(parseTargetKb('0')).toBeNull();
    expect(parseTargetKb('50.5')).toBeNull();
    expect(parseTargetKb('1e5')).toBeNull();
    expect(parseTargetKb('-100')).toBeNull();
    expect(parseTargetKb('duaratus')).toBeNull();
  });

  it('menolak nilai di luar rentang 1–100000 KB', () => {
    expect(parseTargetKb('100000')).toBe(100000);
    expect(parseTargetKb('100001')).toBeNull();
  });
});

describe('formatBytes', () => {
  it('menulis satuan B, KB, dan MB dengan koma desimal', () => {
    expect(formatBytes(0)).toBe('0 B');
    expect(formatBytes(999)).toBe('999 B');
    expect(formatBytes(1024)).toBe('1 KB');
    expect(formatBytes(1536)).toBe('1,5 KB');
    expect(formatBytes(1048576)).toBe('1 MB');
    expect(formatBytes(1572864)).toBe('1,5 MB');
    expect(formatBytes(2_500_000)).toBe('2,4 MB');
  });
});

describe('savedPercent', () => {
  it('menghitung penghematan dalam persen satu desimal', () => {
    expect(savedPercent(2000, 500)).toBe(75);
    expect(savedPercent(1000, 750)).toBe(25);
    expect(savedPercent(1000, 999)).toBe(0.1);
  });

  it('menghasilkan persen negatif bila hasil lebih besar dari awal', () => {
    expect(savedPercent(1000, 1200)).toBe(-20);
  });

  it('aman bila ukuran awal nol', () => {
    expect(savedPercent(0, 100)).toBe(0);
  });
});
