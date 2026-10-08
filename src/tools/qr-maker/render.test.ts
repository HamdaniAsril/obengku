import { describe, expect, it } from 'vitest';
import { encodeQr } from './logic';
import {
  contrastRatio,
  dataModulePath,
  eyePaths,
  functionModulePath,
  hexToRgb,
  isLightColor,
  renderSvg,
} from './render';

describe('hexToRgb', () => {
  it('mengurai hex 6 digit', () => {
    expect(hexToRgb('#16181d')).toEqual({ r: 0x16, g: 0x18, b: 0x1d });
    expect(hexToRgb('#ffffff')).toEqual({ r: 255, g: 255, b: 255 });
  });

  it('menerima hex 3 digit', () => {
    expect(hexToRgb('#abc')).toEqual({ r: 0xaa, g: 0xbb, b: 0xcc });
  });

  it('melempar error untuk input tidak valid', () => {
    expect(() => hexToRgb('xyz')).toThrow();
    expect(() => hexToRgb('#12345')).toThrow();
  });
});

describe('contrastRatio', () => {
  it('hitam vs putih = 21', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 1);
  });

  it('warna sama = 1', () => {
    expect(contrastRatio('#a9c3f5', '#a9c3f5')).toBe(1);
  });

  it('urutan argumen tidak mempengaruhi hasil', () => {
    expect(contrastRatio('#f4715b', '#faf3e4')).toBeCloseTo(contrastRatio('#faf3e4', '#f4715b'), 8);
  });
});

describe('isLightColor', () => {
  it('putih terang, hitam gelap', () => {
    expect(isLightColor('#ffffff')).toBe(true);
    expect(isLightColor('#16181d')).toBe(false);
  });
});

describe('path modul', () => {
  const qr = encodeQr('Path', 'M', 0); // mask dipaksa agar deterministik
  const size = qr.size;
  const inEyeBox = (x: number, y: number): boolean =>
    (x < 7 && y < 7) || (x < 7 && y >= size - 7) || (x >= size - 7 && y < 7);

  it('functionModulePath tidak menyentuh area tiga mata finder', () => {
    const d = functionModulePath(qr, 'kotak');
    expect(d).toMatch(/^M/);
    for (const m of d.matchAll(/M(\d+(?:\.\d+)?),(\d+(?:\.\d+)?)/g)) {
      expect(inEyeBox(Number(m[1]), Number(m[2]))).toBe(false);
    }
  });

  it('functionModulePath (timing/format/alignment) memakai bentuk sesuai gaya', () => {
    const kotak = functionModulePath(qr, 'kotak');
    expect(kotak).toMatch(/h1v1h-1z/);

    const bulat = functionModulePath(qr, 'bulat');
    expect(bulat).toMatch(/a0.5,0.5 0 1 0/);
    expect(bulat).not.toMatch(/h1v1h-1z/);

    const halus = functionModulePath(qr, 'halus');
    expect(halus).toMatch(/h0.44/);
    expect(halus).not.toMatch(/h1v1h-1z/);
  });

  it('dataModulePath memakai bentuk sesuai gaya', () => {
    // kotak: rect path per modul data
    const kotak = dataModulePath(qr, 'kotak');
    expect(kotak).toMatch(/h1v1h-1z/);
    // bulat: lingkaran
    const bulat = dataModulePath(qr, 'bulat');
    expect(bulat).toMatch(/a0.5,0.5 0 1 0/);
    // halus: rect sudut membulat
    const halus = dataModulePath(qr, 'halus');
    expect(halus).toMatch(/h0.44/);
  });

  it('fungsi non-mata + data menutup semua modul gelap di luar kotak mata', () => {
    const funcCount = (functionModulePath(qr, 'kotak').match(/M/g) || []).length;
    const dataCount = (dataModulePath(qr, 'kotak').match(/M/g) || []).length;
    let darkOutside = 0;
    let darkInside = 0;
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        if (qr.modules[y][x] !== 1) continue;
        if (inEyeBox(x, y)) darkInside++;
        else darkOutside++;
      }
    }
    expect(funcCount + dataCount).toBe(darkOutside);
    // tiap mata: ring 7x7 (24 modul) + pupil 3x3 (9 modul)
    expect(darkInside).toBe(3 * (24 + 9));
  });
});

describe('eyePaths — mata mengikuti gaya modul', () => {
  const qr = encodeQr('Mata', 'M', 0);

  it('gaya kotak: ring persegi stroke 1 + pupil kotak penuh', () => {
    const { ring, pupil } = eyePaths(qr, 'kotak');
    expect(ring).toMatch(/h6v6h-6z/);
    expect(pupil).toMatch(/h3v3h-3z/);
  });

  it('gaya bulat: ring lingkaran r3 + pupil lingkaran r1.5', () => {
    const { ring, pupil } = eyePaths(qr, 'bulat');
    expect(ring).toMatch(/a3,3 0 1 0/);
    expect(pupil).toMatch(/a1.5,1.5 0 1 0/);
  });

  it('gaya halus: ring sudut membulat rx2 + pupil rx0.9', () => {
    const { ring, pupil } = eyePaths(qr, 'halus');
    expect(ring).toMatch(/a2,2 0 0 1/);
    expect(pupil).toMatch(/a0.9,0.9 0 0 1/);
  });

  it('tepat tiga mata: kiri-atas, kanan-atas, kiri-bawah', () => {
    for (const style of ['kotak', 'bulat', 'halus'] as const) {
      const { ring, pupil } = eyePaths(qr, style);
      expect((ring.match(/M/g) || []).length).toBe(3);
      expect((pupil.match(/M/g) || []).length).toBe(3);
    }
  });
});

describe('renderSvg', () => {
  const qr = encodeQr('SVG', 'M');

  it('menghasilkan SVG lengkap dengan quiet zone 4 modul', () => {
    const svg = renderSvg(qr, { fg: '#16181d', bg: '#ffffff', style: 'kotak', margin: 4 });
    expect(svg).toContain('<svg');
    expect(svg).toContain('</svg>');
    const dim = qr.size + 8;
    expect(svg).toContain(`viewBox="0 0 ${dim} ${dim}"`);
    expect(svg).toContain(`fill="#16181d"`);
    expect(svg).toContain(`fill="#ffffff"`);
  });

  it('opsi width menghasilkan dimensi px (untuk unduhan PNG)', () => {
    const svg = renderSvg(qr, { fg: '#16181d', bg: '#ffffff', style: 'kotak', margin: 4, width: 1024 });
    expect(svg).toContain('width="1024" height="1024"');
  });

  it('tanpa width/height tetap — SVG responsif agar tidak terpotong', () => {
    const svg = renderSvg(qr, { fg: '#16181d', bg: '#ffffff', style: 'kotak', margin: 4 });
    expect(svg).not.toMatch(/<svg[^>]*width="\d+"/);
    // viewBox tetap ada sebagai dasar skala
    expect(svg).toMatch(/viewBox="0 0 \d+ \d+"/);
  });

  it('logo disematkan di tengah dengan lubang putih', () => {
    const qr = encodeQr('logo', 'H');
    const svg = renderSvg(qr, {
      fg: '#16181d',
      bg: '#ffffff',
      style: 'kotak',
      margin: 4,
      logoHref: 'data:image/png;base64,XXXX',
      logoSize: 0.22,
    });
    expect(svg).toContain('<image');
    expect(svg).toContain('data:image/png;base64,XXXX');
  });

  it('gaya bulat/halus tidak menyisakan satu pun modul kotak di SVG', () => {
    for (const style of ['bulat', 'halus'] as const) {
      const svg = renderSvg(qr, { fg: '#16181d', bg: '#ffffff', style, margin: 4 });
      expect(svg).not.toMatch(/h1v1h-1z/);
      expect(svg).not.toMatch(/h6v6h-6z/);
      expect(svg).not.toMatch(/h3v3h-3z/);
    }
    const kotak = renderSvg(qr, { fg: '#16181d', bg: '#ffffff', style: 'kotak', margin: 4 });
    expect(kotak).toMatch(/h1v1h-1z/);
    expect(kotak).toMatch(/h6v6h-6z/);
    expect(kotak).toMatch(/h3v3h-3z/);
  });
});
