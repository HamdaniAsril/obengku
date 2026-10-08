import { describe, expect, it } from 'vitest';
import { extensionFor, outputName, pickFormat } from './logic';

describe('pickFormat', () => {
  it('memilih WebP untuk gambar bertransparansi', () => {
    expect(pickFormat(true)).toBe('image/webp');
  });

  it('memilih JPEG untuk gambar tanpa transparansi', () => {
    expect(pickFormat(false)).toBe('image/jpeg');
  });
});

describe('extensionFor', () => {
  it('memetakan MIME ke ekstensi berkas', () => {
    expect(extensionFor('image/webp')).toBe('webp');
    expect(extensionFor('image/jpeg')).toBe('jpg');
  });
});

describe('outputName', () => {
  it('menukar ekstensi sumber dengan ekstensi hasil', () => {
    expect(outputName('foto.png', 'image/webp')).toBe('foto-kompresi.webp');
    expect(outputName('foto.jpeg', 'image/jpeg')).toBe('foto-kompresi.jpg');
    expect(outputName('foto.JPG', 'image/jpeg')).toBe('foto-kompresi.jpg');
    expect(outputName('foto.png', 'image/jpeg')).toBe('foto-kompresi.jpg');
  });

  it('menempelkan ekstensi bila sumber tanpa ekstensi gambar', () => {
    expect(outputName('foto', 'image/webp')).toBe('foto-kompresi.webp');
  });

  it('memberi nama bawaan bila sumber kosong', () => {
    expect(outputName(null, 'image/jpeg')).toBe('gambar-kompresi.jpg');
    expect(outputName('', 'image/webp')).toBe('gambar-kompresi.webp');
  });
});
