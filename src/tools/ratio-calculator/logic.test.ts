import { describe, expect, it } from 'vitest';
import {
  formatNumber,
  parseNumber,
  scaleRatio,
  solveProportion2,
  solveProportion3,
} from './logic';

describe('parseNumber', () => {
  it('menerima titik desimal', () => {
    expect(parseNumber('2.5')).toBe(2.5);
  });

  it('menerima koma desimal', () => {
    expect(parseNumber('2,5')).toBe(2.5);
  });

  it('membuang spasi di sekeliling', () => {
    expect(parseNumber('  7  ')).toBe(7);
  });

  it('string kosong menjadi null', () => {
    expect(parseNumber('')).toBeNull();
    expect(parseNumber('   ')).toBeNull();
  });

  it('teks bukan angka menjadi null', () => {
    expect(parseNumber('abc')).toBeNull();
    expect(parseNumber('12a')).toBeNull();
    expect(parseNumber('.')).toBeNull();
    expect(parseNumber('1.2.3')).toBeNull();
  });

  it('menerima bilangan negatif', () => {
    expect(parseNumber('-4')).toBe(-4);
    expect(parseNumber('-0,5')).toBe(-0.5);
  });
});

describe('formatNumber', () => {
  it('memakai koma gaya Indonesia, maksimal 6 desimal', () => {
    expect(formatNumber(1 / 3)).toBe('0,333333');
  });

  it('membuang nol di belakang', () => {
    expect(formatNumber(7.5)).toBe('7,5');
    expect(formatNumber(8)).toBe('8');
  });

  it('membulatkan desimal ke-7', () => {
    expect(formatNumber(-1 / 6)).toBe('-0,166667');
  });

  it('memisah ribuan gaya Indonesia', () => {
    expect(formatNumber(1000000)).toBe('1.000.000');
  });
});

describe('solveProportion2', () => {
  it('semua field kosong → empty', () => {
    expect(solveProportion2(null, null, null, null).status).toBe('empty');
  });

  it('lebih dari satu field kosong → need-one', () => {
    expect(solveProportion2(2, 3, null, null).status).toBe('need-one');
  });

  it('semua field terisi → complete', () => {
    expect(solveProportion2(2, 3, 4, 6).status).toBe('complete');
  });

  it('mencari D: D = B·C/A', () => {
    const result = solveProportion2(2, 3, 4, null);
    expect(result).toEqual({ status: 'solved', missing: 'D', value: 6 });
  });

  it('mencari A: A = B·C/D', () => {
    const result = solveProportion2(null, 3, 4, 6);
    expect(result).toEqual({ status: 'solved', missing: 'A', value: 2 });
  });

  it('mencari B: B = A·D/C', () => {
    const result = solveProportion2(2, null, 4, 6);
    expect(result).toEqual({ status: 'solved', missing: 'B', value: 3 });
  });

  it('mencari C: C = A·D/B', () => {
    const result = solveProportion2(2, 3, null, 6);
    expect(result).toEqual({ status: 'solved', missing: 'C', value: 4 });
  });

  it('pembagian nol saat mencari D (A = 0) → zero', () => {
    expect(solveProportion2(0, 3, 4, null).status).toBe('zero');
  });

  it('pembagian nol saat mencari A (D = 0) → zero', () => {
    expect(solveProportion2(null, 3, 4, 0).status).toBe('zero');
  });
});

describe('solveProportion3', () => {
  const base = { left: [2, 3, 4], right: [4, 6, 8] };

  it('semua kosong → empty', () => {
    expect(
      solveProportion3([null, null, null], [null, null, null]).status,
    ).toBe('empty');
  });

  it('tiga nilai atau kurang → need-one', () => {
    expect(
      solveProportion3([2, null, null], [null, 6, 8]).status,
    ).toBe('need-one');
  });

  it('semua terisi → complete', () => {
    expect(solveProportion3(base.left, base.right).status).toBe('complete');
  });

  it('mencari A dari pasangan B:E', () => {
    const result = solveProportion3([null, 3, 4], [4, 6, 8]);
    expect(result).toEqual({ status: 'solved', missing: 'A', value: 2 });
  });

  it('mencari B dari pasangan A:D', () => {
    const result = solveProportion3([2, null, 4], [4, 6, 8]);
    expect(result).toEqual({ status: 'solved', missing: 'B', value: 3 });
  });

  it('mencari C dari pasangan A:D', () => {
    const result = solveProportion3([2, 3, null], [4, 6, 8]);
    expect(result).toEqual({ status: 'solved', missing: 'C', value: 4 });
  });

  it('mencari D lewat pasangan B:E', () => {
    const result = solveProportion3([2, 3, 4], [null, 6, 8]);
    expect(result).toEqual({ status: 'solved', missing: 'D', value: 4 });
  });

  it('mencari E', () => {
    const result = solveProportion3([2, 3, 4], [4, null, 8]);
    expect(result).toEqual({ status: 'solved', missing: 'E', value: 6 });
  });

  it('mencari F', () => {
    const result = solveProportion3([2, 3, 4], [4, 6, null]);
    expect(result).toEqual({ status: 'solved', missing: 'F', value: 8 });
  });

  it('pasangan lengkap dengan penyebut nol → zero', () => {
    expect(solveProportion3([0, 3, 4], [5, 6, 8]).status).toBe('complete');
    expect(solveProportion3([2, 3, 4], [0, null, 8]).status).toBe('zero');
  });

  it('rasio nol, mencari sisi kanan → zero', () => {
    expect(solveProportion3([0, 3, 4], [5, null, 8]).status).toBe('zero');
  });

  it('rasio nol, mencari sisi kiri → 0', () => {
    const result = solveProportion3([0, null, 4], [5, 6, 8]);
    expect(result).toEqual({ status: 'solved', missing: 'B', value: 0 });
  });
});

describe('solveProportion3 — dua kolom kosong', () => {
  it('D dan E kosong → keduanya terhitung', () => {
    const result = solveProportion3([2, 3, 4], [null, null, 8]);
    expect(result).toEqual({
      status: 'solved-pair',
      results: [
        { missing: 'D', value: 4 },
        { missing: 'E', value: 6 },
      ],
    });
  });

  it('A dan F kosong → keduanya terhitung', () => {
    const result = solveProportion3([null, 3, 4], [4, 6, null]);
    expect(result).toEqual({
      status: 'solved-pair',
      results: [
        { missing: 'A', value: 2 },
        { missing: 'F', value: 8 },
      ],
    });
  });

  it('A dan B kosong → keduanya terhitung', () => {
    const result = solveProportion3([null, null, 4], [6, 9, 12]);
    expect(result).toEqual({
      status: 'solved-pair',
      results: [
        { missing: 'A', value: 2 },
        { missing: 'B', value: 3 },
      ],
    });
  });

  it('pasangan diagonal A dan D → undetermined', () => {
    expect(solveProportion3([null, 3, 4], [null, 6, 8]).status).toBe(
      'undetermined',
    );
  });

  it('pasangan diagonal B dan E → undetermined', () => {
    expect(solveProportion3([2, null, 4], [4, null, 8]).status).toBe(
      'undetermined',
    );
  });

  it('pasangan diagonal C dan F → undetermined', () => {
    expect(solveProportion3([2, 3, null], [4, 6, null]).status).toBe(
      'undetermined',
    );
  });

  it('pembagian nol saat menutup rasio → zero', () => {
    expect(solveProportion3([2, 0, null], [null, 4, 8]).status).toBe('zero');
  });
});

describe('scaleRatio', () => {
  it('mengalikan tiap bagian dengan k', () => {
    expect(scaleRatio([3, 4], 2.5)).toEqual([7.5, 10]);
  });

  it('mendukung tiga bagian', () => {
    expect(scaleRatio([1, 2, 3], 3)).toEqual([3, 6, 9]);
  });

  it('k nol menghasilkan nol semua', () => {
    expect(scaleRatio([5, 7], 0)).toEqual([0, 0]);
  });

  it('mendukung k negatif', () => {
    expect(scaleRatio([3, 4], -2)).toEqual([-6, -8]);
  });
});
