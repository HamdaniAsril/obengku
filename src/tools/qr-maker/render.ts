/**
 * Helper render QR ke SVG — murni string, tanpa DOM, agar mudah diuji.
 *
 * Seluruh modul gelap mengikuti gaya bentuk pilihan pengguna: tiga mata
 * finder dirender sebagai ring + pupil, sisa modul fungsi (timing/format/
 * alignment/versi) dan modul data memakai bentuk per modul yang sama.
 */

import type { QrMatrix } from './logic';

export type ModuleStyle = 'kotak' | 'bulat' | 'halus';

export interface RenderOptions {
  /** Warna modul gelap (hex). */
  fg: string;
  /** Warna latar (hex). */
  bg: string;
  /** Bentuk modul data. */
  style: ModuleStyle;
  /** Quiet zone dalam modul (standar 4). */
  margin?: number;
  /** Logo opsional di tengah (data URL). */
  logoHref?: string;
  /** Rasio sisi logo terhadap sisi QR (maks 0.25). */
  logoSize?: number;
  /** Lebar/tinggi px pada root SVG; tanpa opsi ini SVG responsif (mengikuti kontainer). */
  width?: number;
}

export interface Rgb {
  r: number;
  g: number;
  b: number;
}

/** Peta modul fungsi untuk versi matrix ini. */
function buildFunctionMap(qr: QrMatrix): boolean[][] {
  const { size, version } = qr;
  const map: boolean[][] = Array.from({ length: size }, () => new Array(size).fill(false));
  const mark = (x: number, y: number) => {
    if (0 <= x && x < size && 0 <= y && y < size) map[y][x] = true;
  };

  // Finder + separator + format info (area 9x9 di tiga pojok)
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      mark(i, j);
      mark(size - 1 - i, j);
      mark(i, size - 1 - j);
    }
  }
  // Timing pattern
  for (let i = 0; i < size; i++) {
    mark(i, 6);
    mark(6, i);
  }
  // Alignment pattern (kecuali tiga pojok yang menimpa finder)
  if (version >= 2) {
    const pos = alignmentCenters(version);
    const n = pos.length;
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if ((i === 0 && j === 0) || (i === 0 && j === n - 1) || (i === n - 1 && j === 0)) continue;
        for (let dy = -2; dy <= 2; dy++) {
          for (let dx = -2; dx <= 2; dx++) {
            mark(pos[j] + dx, pos[i] + dy);
          }
        }
      }
    }
  }
  // Versi info (v >= 7)
  if (version >= 7) {
    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < 3; j++) {
        mark(size - 11 + j, i);
        mark(i, size - 11 + j);
      }
    }
  }
  return map;
}

function alignmentCenters(version: number): number[] {
  if (version === 1) return [];
  const size = version * 4 + 17;
  const numAlign = Math.floor(version / 7) + 2;
  const step = version === 32 ? 26 : Math.ceil((version * 4 + 4) / (numAlign * 2 - 2)) * 2;
  const result = new Array<number>(numAlign);
  result[0] = 6;
  for (let i = result.length - 1, pos = size - 7; i >= 1; i--, pos -= step) {
    result[i] = pos;
  }
  return result;
}

function modulePathFor(style: ModuleStyle, x: number, y: number): string {
  if (style === 'kotak') return `M${x},${y}h1v1h-1z`;
  if (style === 'bulat') return `M${x + 0.5},${y}a0.5,0.5 0 1 0 0.001,0z`;
  return `M${x + 0.28},${y}h0.44a0.28,0.28 0 0 1 0.28,0.28v0.44a0.28,0.28 0 0 1 -0.28,0.28h-0.44a0.28,0.28 0 0 1 -0.28,-0.28v-0.44a0.28,0.28 0 0 1 0.28,-0.28z`;
}

/** True bila modul berada di dalam salah satu kotak mata finder 7×7. */
function inEyeBox(size: number, x: number, y: number): boolean {
  return (x < 7 && y < 7) || (x >= size - 7 && y < 7) || (x < 7 && y >= size - 7);
}

/**
 * Path ring (stroke) dan pupil (isi) untuk tiga mata finder, mengikuti gaya.
 * Kotak: ring 6×6 stroke 1 + pupil 3×3. Bulat: lingkaran r3 stroke 1 +
 * pupil r1.5. Halus: ring membulat rx2 + pupil rx0.9.
 */
export function eyePaths(
  qr: QrMatrix,
  style: ModuleStyle
): { ring: string; pupil: string } {
  const size = qr.size;
  const corners: Array<[number, number]> = [
    [0, 0],
    [size - 7, 0],
    [0, size - 7],
  ];
  const ring: string[] = [];
  const pupil: string[] = [];

  for (const [bx, by] of corners) {
    if (style === 'kotak') {
      ring.push(`M${bx + 0.5},${by + 0.5}h6v6h-6z`);
      pupil.push(`M${bx + 2},${by + 2}h3v3h-3z`);
    } else if (style === 'bulat') {
      const cx = bx + 3.5;
      const cy = by + 3.5;
      ring.push(`M${cx - 3},${cy}a3,3 0 1 0 6,0a3,3 0 1 0 -6,0`);
      pupil.push(`M${cx - 1.5},${cy}a1.5,1.5 0 1 0 3,0a1.5,1.5 0 1 0 -3,0`);
    } else {
      // halus — rounded rect 6×6 rx2 (stroke) + 3×3 rx0.9 (isi)
      ring.push(
        `M${bx + 2.5},${by + 0.5}h2a2,2 0 0 1 2,2v2a2,2 0 0 1 -2,2h-2a2,2 0 0 1 -2,-2v-2a2,2 0 0 1 2,-2z`
      );
      pupil.push(
        `M${bx + 2.9},${by + 2}h1.2a0.9,0.9 0 0 1 0.9,0.9v1.2a0.9,0.9 0 0 1 -0.9,0.9h-1.2a0.9,0.9 0 0 1 -0.9,-0.9v-1.2a0.9,0.9 0 0 1 0.9,-0.9z`
      );
    }
  }

  return { ring: ring.join(''), pupil: pupil.join('') };
}

/** Path seluruh modul fungsi gelap di luar kotak mata, sesuai gaya modul. */
export function functionModulePath(qr: QrMatrix, style: ModuleStyle): string {
  const func = buildFunctionMap(qr);
  const parts: string[] = [];
  for (let y = 0; y < qr.size; y++) {
    for (let x = 0; x < qr.size; x++) {
      if (func[y][x] && qr.modules[y][x] === 1 && !inEyeBox(qr.size, x, y)) {
        parts.push(modulePathFor(style, x, y));
      }
    }
  }
  return parts.join('');
}

export interface LogoHole {
  min: number;
  max: number;
}

/** Area tengah yang ditutup logo (modul data di bawahnya tidak digambar). */
export function logoHole(qr: QrMatrix, logoSize: number): LogoHole | null {
  if (logoSize <= 0) return null;
  const hole = Math.floor(qr.size * logoSize);
  const min = Math.floor((qr.size - hole) / 2);
  const max = Math.ceil((qr.size + hole) / 2) - 1;
  return { min, max };
}

/** Path seluruh modul data gelap sesuai gaya, opsional tanpa area logo. */
export function dataModulePath(qr: QrMatrix, style: ModuleStyle, hole?: LogoHole | null): string {
  const func = buildFunctionMap(qr);
  const parts: string[] = [];
  for (let y = 0; y < qr.size; y++) {
    for (let x = 0; x < qr.size; x++) {
      if (func[y][x] || qr.modules[y][x] !== 1) continue;
      if (hole && y >= hole.min && y <= hole.max && x >= hole.min && x <= hole.max) continue;
      parts.push(modulePathFor(style, x, y));
    }
  }
  return parts.join('');
}

/* ---------- Warna ---------- */

export function hexToRgb(hex: string): Rgb {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) throw new Error(`Warna hex tidak valid: ${hex}`);
  const h = m[1];
  if (h.length === 3) {
    return {
      r: parseInt(h[0] + h[0], 16),
      g: parseInt(h[1] + h[1], 16),
      b: parseInt(h[2] + h[2], 16),
    };
  }
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

function srgbChannelToLinear(c: number): number {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

function relativeLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  return (
    0.2126 * srgbChannelToLinear(r) +
    0.7152 * srgbChannelToLinear(g) +
    0.0722 * srgbChannelToLinear(b)
  );
}

/** Rasio kontras WCAG (1-21). */
export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const [hi, lo] = la >= lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

/** True bila warna terang (luminansi > 0.5). */
export function isLightColor(hex: string): boolean {
  return relativeLuminance(hex) > 0.5;
}

/* ---------- SVG penuh ---------- */

/** Render SVG string penuh dengan quiet zone. */
export function renderSvg(qr: QrMatrix, opts: RenderOptions): string {
  const margin = opts.margin ?? 4;
  const dim = qr.size + margin * 2;

  const logoOn = Boolean(opts.logoHref);
  const logoSize = Math.min(opts.logoSize ?? 0.22, 0.25);
  const hole = logoOn ? logoHole(qr, logoSize) : null;
  const dataPath = dataModulePath(qr, opts.style, hole);
  const eyes = eyePaths(qr, opts.style);

  // Kotak perlu crispEdges agar tidak ada celah antarmodul; bentuk membulat
  // justru harus anti-aliased agar halus.
  const crisp = opts.style === 'kotak' ? ' shape-rendering="crispEdges"' : '';

  const logoSvg = logoOn
    ? (() => {
        const side = qr.size * logoSize;
        const pos = (qr.size - side) / 2;
        return `<rect x="${pos - 0.5}" y="${pos - 0.5}" width="${side + 1}" height="${side + 1}" rx="1.5" fill="${escapeXml(opts.bg)}"/><image href="${escapeXml(opts.logoHref as string)}" x="${pos}" y="${pos}" width="${side}" height="${side}" preserveAspectRatio="xMidYMid slice"/>`;
      })()
    : '';

  const sizeAttr =
    opts.width != null ? ` width="${opts.width}" height="${opts.width}"` : '';

  return (
    `<svg xmlns="http://www.w3.org/2000/svg"${sizeAttr} viewBox="0 0 ${dim} ${dim}">` +
    `<rect width="${dim}" height="${dim}" fill="${escapeXml(opts.bg)}"/>` +
    `<g transform="translate(${margin},${margin})">` +
    `<path d="${functionModulePath(qr, opts.style)}" fill="${escapeXml(opts.fg)}"${crisp}/>` +
    `<path d="${dataPath}" fill="${escapeXml(opts.fg)}"${crisp}/>` +
    `<path d="${eyes.ring}" fill="none" stroke="${escapeXml(opts.fg)}" stroke-width="1"${crisp}/>` +
    `<path d="${eyes.pupil}" fill="${escapeXml(opts.fg)}"${crisp}/>` +
    logoSvg +
    `</g></svg>`
  );
}

function escapeXml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[c] as string
  );
}
