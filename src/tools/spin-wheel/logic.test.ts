import { describe, expect, it } from 'vitest';
import {
  arcPath,
  labelTransform,
  nextRotation,
  pickWinner,
  polarToCartesian,
  segmentCenter,
  winnerFromRotation,
} from './logic';

describe('pickWinner', () => {
  it('mengembalikan indeks segmen sesuai hasil acak', () => {
    expect(pickWinner(4, () => 0)).toBe(0);
    expect(pickWinner(4, () => 0.24)).toBe(0);
    expect(pickWinner(4, () => 0.25)).toBe(1);
    expect(pickWinner(4, () => 0.99)).toBe(3);
  });

  it('tetap di dalam rentang walau acak mengembalikan 1', () => {
    expect(pickWinner(4, () => 1)).toBe(3);
  });
});

describe('segmentCenter', () => {
  it('menghitung sudut pusat segmen dari atas searah jarum jam', () => {
    expect(segmentCenter(0, 4)).toBe(45);
    expect(segmentCenter(1, 4)).toBe(135);
    expect(segmentCenter(3, 4)).toBe(315);
  });
});

describe('winnerFromRotation', () => {
  it('menghitung segmen yang berada di bawah penunjuk', () => {
    expect(winnerFromRotation(315, 4)).toBe(0);
    expect(winnerFromRotation(225, 4)).toBe(1);
    expect(winnerFromRotation(135, 4)).toBe(2);
    expect(winnerFromRotation(45, 4)).toBe(3);
  });

  it('abaikan putaran penuh tambahan', () => {
    expect(winnerFromRotation(5 * 360 + 315, 4)).toBe(0);
  });
});

describe('nextRotation', () => {
  it('selalu mendaratkan segmen pemenang di bawah penunjuk', () => {
    const count = 5;
    for (let index = 0; index < count; index += 1) {
      for (const current of [0, 359, 720, 1234]) {
        for (const roll of [0, 0.5, 0.99]) {
          const next = nextRotation(current, index, count, () => roll);
          expect(winnerFromRotation(next, count)).toBe(index);
          expect(next).toBeGreaterThan(current);
        }
      }
    }
  });

  it('menambahkan beberapa putaran penuh agar roda benar-benar berputar', () => {
    const next = nextRotation(0, 0, 4, () => 0.5, 5);
    expect(next).toBeGreaterThanOrEqual(5 * 360);
  });

  it('berfungsi untuk jumlah segmen ganjil maupun besar', () => {
    for (const count of [2, 3, 7, 12]) {
      for (let index = 0; index < count; index += 1) {
        const next = nextRotation(0, index, count, () => 0.5);
        expect(winnerFromRotation(next, count)).toBe(index);
      }
    }
  });
});

describe('polarToCartesian', () => {
  it('menempatkan sudut 0 di atas dan bergerak searah jarum jam', () => {
    expect(polarToCartesian(100, 100, 50, 0)).toEqual({ x: 100, y: 50 });
    expect(polarToCartesian(100, 100, 50, 90)).toEqual({ x: 150, y: 100 });
    expect(polarToCartesian(100, 100, 50, 180)).toEqual({ x: 100, y: 150 });
    expect(polarToCartesian(100, 100, 50, 270)).toEqual({ x: 50, y: 100 });
  });
});

describe('arcPath', () => {
  it('menggambar busur searah jarum jam lengkap dengan tutupnya', () => {
    expect(arcPath(100, 100, 50, 0, 90)).toBe(
      'M100 100 L100 50 A50 50 0 0 1 150 100 Z',
    );
  });

  it('menggambar separuh lingkaran untuk dua segmen', () => {
    expect(arcPath(100, 100, 96, 0, 180)).toBe(
      'M100 100 L100 4 A96 96 0 0 1 100 196 Z',
    );
  });
});

describe('labelTransform', () => {
  it('menempatkan label di pusat segmen dan menegakkannya kembali', () => {
    expect(labelTransform(1, 4, 60)).toBe(
      'translate(-50%, -50%) rotate(135deg) translateY(-60px) rotate(-135deg)',
    );
    expect(labelTransform(0, 4, 60)).toBe(
      'translate(-50%, -50%) rotate(45deg) translateY(-60px) rotate(-45deg)',
    );
  });
});
