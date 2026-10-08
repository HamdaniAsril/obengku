import { describe, expect, it, vi } from 'vitest';
import { flipCoin } from './logic';

describe('flipCoin', () => {
  it('mengembalikan Kepala untuk nilai acak di bawah 0.5', () => {
    expect(flipCoin(() => 0)).toBe('kepala');
    expect(flipCoin(() => 0.4999)).toBe('kepala');
  });

  it('mengembalikan Ekor untuk nilai acak 0.5 ke atas', () => {
    expect(flipCoin(() => 0.5)).toBe('ekor');
    expect(flipCoin(() => 0.9999)).toBe('ekor');
  });

  it('memakai Math.random bila tidak ada pembangkit yang disuntikkan', () => {
    const spy = vi.spyOn(Math, 'random').mockReturnValue(0.9);
    try {
      expect(flipCoin()).toBe('ekor');
      expect(spy).toHaveBeenCalled();
    } finally {
      spy.mockRestore();
    }
  });
});
