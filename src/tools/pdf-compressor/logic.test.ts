import { describe, expect, it } from 'vitest';
import { outputName } from './logic';

describe('outputName', () => {
  it('menambahkan akhiran kompresi dan menormalkan ekstensi', () => {
    expect(outputName('laporan.pdf')).toBe('laporan-kompresi.pdf');
    expect(outputName('laporan.PDF')).toBe('laporan-kompresi.pdf');
    expect(outputName('laporan')).toBe('laporan-kompresi.pdf');
  });

  it('memberi nama bawaan bila sumber kosong', () => {
    expect(outputName(null)).toBe('dokumen-kompresi.pdf');
    expect(outputName('')).toBe('dokumen-kompresi.pdf');
  });
});
