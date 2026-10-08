import { describe, expect, it } from 'vitest';
import {
  ECC_CODEWORDS_PER_BLOCK,
  NUM_ECC_BLOCKS,
  alignPatternPositions,
  buildFunctionPatterns,
  encodePayload,
  encodeQr,
  numDataCodewords,
  numRawDataModules,
  totalCodewords,
  type EccLevel,
  type QrMatrix,
} from './logic';

/* ---------- Tabel kapasitas standar ---------- */

describe('tabel kapasitas', () => {
  it('numRawDataModules sesuai standar', () => {
    expect(numRawDataModules(1)).toBe(208);
    expect(numRawDataModules(2)).toBe(359);
    expect(numRawDataModules(7)).toBe(1568);
    expect(numRawDataModules(40)).toBe(29648);
  });

  it('numDataCodewords: v1-M=16, v2-M=28, v10-M=216, v1-H=9, v1-L=19, v1-Q=13', () => {
    expect(numDataCodewords(1, 'M')).toBe(16);
    expect(numDataCodewords(2, 'M')).toBe(28);
    expect(numDataCodewords(10, 'M')).toBe(216);
    expect(numDataCodewords(1, 'H')).toBe(9);
    expect(numDataCodewords(1, 'L')).toBe(19);
    expect(numDataCodewords(1, 'Q')).toBe(13);
  });

  it('totalCodewords: v1=26, v2=44, v40=3706', () => {
    expect(totalCodewords(1)).toBe(26);
    expect(totalCodewords(2)).toBe(44);
    expect(totalCodewords(40)).toBe(3706);
  });

  it('posisi alignment: v1 kosong, v2=[6,18], v7=[6,22,38]', () => {
    expect(alignPatternPositions(1)).toEqual([]);
    expect(alignPatternPositions(2)).toEqual([6, 18]);
    expect(alignPatternPositions(7)).toEqual([6, 22, 38]);
  });
});

/* ---------- Susunan payload ---------- */

describe('encodePayload', () => {
  const enc = new TextEncoder();

  it('header byte mode + count 8 bit + data + terminator + pad', () => {
    // 'Obengku' = 7 byte; v1-M = 16 data codeword
    const out = encodePayload(enc.encode('Obengku'), 1, 'M');
    expect(out.length).toBe(16);
    // mode 0100 di 4 bit pertama, 4 bit pertama count (7 -> 0000)
    expect(out[0]).toBe(0b0100_0000);
    // 4 bit terakhir count + 4 bit pertama data ('O' = 0x4F)
    expect(out[1]).toBe((7 << 4) | (0x4f >>> 4));
    // 'u' = 0x75, 4 bit terakhir 0101 + terminator 0000
    expect(out[8]).toBe(0x50);
    // pad pola EC/11 dimulai setelah 2 header + 7 data
    expect(out[9]).toBe(0xec);
    expect(out[10]).toBe(0x11);
    expect(out[11]).toBe(0xec);
  });

  it('count 16 bit untuk versi >= 10', () => {
    const out = encodePayload(enc.encode('x'.repeat(213)), 10, 'M');
    expect(out.length).toBe(216);
    expect(out[0]).toBe(0b0100_0000);
    // count 213 = 0x00D5 menempati bit 4..19:
    // out[1] = bit 8..15 = 0x0D, out[2] = sisa count + 4 bit pertama 'x' (0x78)
    expect(out[1]).toBe(0x0d);
    expect(out[2]).toBe((0x5 << 4) | (0x78 >>> 4));
  });

  it('melempar error bila payload tidak muat pada versi', () => {
    expect(() => encodePayload(new Uint8Array(20), 1, 'M')).toThrow(/muat|panjang/i);
  });
});

/* ---------- Pola fungsi ---------- */

describe('buildFunctionPatterns', () => {
  it('finder kiri-atas v1: ring gelap, dalam terang, pusat gelap, separator terang', () => {
    const { modules } = buildFunctionPatterns(1, 'M');
    expect(modules.length).toBe(21);
    expect(modules[0][0]).toBe(1);
    expect(modules[1][1]).toBe(0);
    expect(modules[3][3]).toBe(1);
    expect(modules[7][0]).toBe(0);
    expect(modules[0][7]).toBe(0);
  });

  it('timing baris 6 berselang-seling mulai gelap', () => {
    const { modules } = buildFunctionPatterns(1, 'M');
    for (let i = 8; i < 13; i++) expect(modules[6][i]).toBe(i % 2 === 0 ? 1 : 0);
  });

  it('dark module selalu gelap di (baris size-8, kolom 8)', () => {
    for (const v of [1, 5, 10]) {
      const { modules } = buildFunctionPatterns(v, 'M');
      expect(modules[v * 4 + 17 - 8][8]).toBe(1);
    }
  });

  it('alignment v2: pusat gelap, ring terang, luar gelap', () => {
    const { modules } = buildFunctionPatterns(2, 'M');
    expect(modules[18][18]).toBe(1);
    expect(modules[18][17]).toBe(0);
    expect(modules[18][16]).toBe(1);
    expect(modules[16][16]).toBe(1);
    expect(modules[20][20]).toBe(1);
  });

  it('versi >= 7 menggambar blok versi info di kanan-atas', () => {
    const { modules } = buildFunctionPatterns(7, 'M');
    let anyDark = false;
    for (let y = 0; y < 6; y++) {
      for (let x = 34; x < 37; x++) if (modules[y][x] === 1) anyDark = true;
    }
    expect(anyDark).toBe(true);
  });
});

/* ---------- Format info ---------- */

/** Baca 15 bit format dari salinan pertama. */
function readFormatBits(modules: Uint8Array[]): number {
  const bit: number[] = [];
  for (let i = 0; i < 6; i++) bit[i] = modules[i][8];
  bit[6] = modules[7][8];
  bit[7] = modules[8][8];
  bit[8] = modules[8][7];
  for (let i = 9; i < 15; i++) bit[i] = modules[8][14 - i];
  let out = 0;
  for (let i = 0; i < 15; i++) out |= bit[i] << i;
  return out;
}

describe('format info', () => {
  it('ECC M + mask 0 menghasilkan vektor standar 0x5412', () => {
    const qr = encodeQr('A', 'M', 0);
    expect(readFormatBits(qr.modules)).toBe(0x5412);
  });

  it('format konsisten dengan BCH, level ECC, dan mask terpilih', () => {
    const eclBits: Record<EccLevel, number> = { L: 1, M: 0, Q: 3, H: 2 };
    for (const ecl of ['L', 'M', 'Q', 'H'] as const) {
      const qr = encodeQr('Obengku', ecl);
      const raw = readFormatBits(qr.modules) ^ 0x5412;
      const data = raw >>> 10;
      expect(data >>> 3).toBe(eclBits[ecl]);
      expect(data & 7).toBe(qr.mask);
      // BCH(15,5) valid: hitung ulang remainder
      let rem = data;
      for (let i = 0; i < 10; i++) rem = (rem << 1) ^ (rem >>> 9 ? 0x537 : 0);
      expect(rem & 0x3ff).toBe(raw & 0x3ff);
    }
  });
});

/* ---------- Pemilihan versi & determinisme ---------- */

describe('encodeQr', () => {
  it('memilih versi terkecil yang muat', () => {
    expect(encodeQr('x'.repeat(14), 'M').version).toBe(1);
    expect(encodeQr('x'.repeat(15), 'M').version).toBe(2);
    expect(encodeQr('x'.repeat(7), 'H').version).toBe(1);
    expect(encodeQr('x'.repeat(8), 'H').version).toBe(2);
    expect(encodeQr('x'.repeat(271), 'L').version).toBe(10);
    expect(encodeQr('x'.repeat(2953), 'L').version).toBe(40);
  });

  it('teks terlalu panjang melempar error', () => {
    expect(() => encodeQr('x'.repeat(2954), 'L')).toThrow(/panjang/i);
  });

  it('deterministik untuk input sama', () => {
    const a = encodeQr('Obengku', 'M');
    const b = encodeQr('Obengku', 'M');
    expect(a.mask).toBe(b.mask);
    expect(a.version).toBe(b.version);
    expect(a.modules).toEqual(b.modules);
  });

  it('ukuran matrix = versi*4+17', () => {
    expect(encodeQr('A', 'M').size).toBe(21);
    expect(encodeQr('x'.repeat(271), 'L').size).toBe(57);
  });
});

/* ---------- Round-trip: dekoder independen ---------- */

/** GF(2^8) independen via tabel log/antilog. */
const ALOG: number[] = [];
const LOG: number[] = new Array(256).fill(0);
{
  let v = 1;
  for (let i = 0; i < 255; i++) {
    ALOG[i] = v;
    LOG[v] = i;
    v = (v << 1) ^ (v & 0x80 ? 0x11d : 0);
    v &= 0xff;
  }
}
const gmul = (a: number, b: number): number =>
  a === 0 || b === 0 ? 0 : ALOG[(LOG[a] + LOG[b]) % 255];

function isFunctionAt(version: number, size: number, y: number, x: number): boolean {
  if ((y < 9 && x < 9) || (y < 9 && x >= size - 8) || (y >= size - 8 && x < 9)) return true;
  if (y === 6 || x === 6) return true;
  if ((x === 8 && y < 9) || (y === 8 && x < 9)) return true;
  if ((y === 8 && x >= size - 8) || (x === 8 && y >= size - 8)) return true;
  const align = alignPatternPositions(version);
  const last = align.length - 1;
  for (let i = 0; i < align.length; i++) {
    for (let j = 0; j < align.length; j++) {
      const skip =
        (i === 0 && j === 0) || (i === 0 && j === last) || (i === last && j === 0);
      if (skip) continue;
      if (Math.abs(align[i] - x) <= 2 && Math.abs(align[j] - y) <= 2) return true;
    }
  }
  if (version >= 7 && ((y < 6 && x >= size - 11) || (y >= size - 11 && x < 6))) return true;
  return false;
}

function maskInverts(mask: number, y: number, x: number): number {
  switch (mask) {
    case 0:
      return (x + y) % 2 === 0 ? 1 : 0;
    case 1:
      return y % 2 === 0 ? 1 : 0;
    case 2:
      return x % 3 === 0 ? 1 : 0;
    case 3:
      return (x + y) % 3 === 0 ? 1 : 0;
    case 4:
      return (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0 ? 1 : 0;
    case 5:
      return (x * y) % 2 + (x * y) % 3 === 0 ? 1 : 0;
    case 6:
      return ((x * y) % 2 + (x * y) % 3) % 2 === 0 ? 1 : 0;
    default:
      return ((x + y) % 2 + (x * y) % 3) % 2 === 0 ? 1 : 0;
  }
}

/** Dekode penuh: unmask -> zigzag -> de-interleave -> syndrome -> payload. */
function decodeQr(qr: QrMatrix): string {
  const { modules, version, mask, ecl } = qr;
  const size = modules.length;
  const nWords = totalCodewords(version);

  // Baca bit data (unmask) sesuai urutan zigzag standar
  const bits: number[] = [];
  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5;
    const upward = ((right + 1) & 2) === 0;
    for (let vert = 0; vert < size; vert++) {
      const y = upward ? size - 1 - vert : vert;
      for (let j = 0; j < 2; j++) {
        const x = right - j;
        if (isFunctionAt(version, size, y, x)) continue;
        bits.push(modules[y][x] ^ maskInverts(mask, y, x));
      }
    }
  }
  const bytes: number[] = [];
  for (let i = 0; i < nWords; i++) {
    let b = 0;
    for (let j = 0; j < 8; j++) b = (b << 1) | bits[i * 8 + j];
    bytes.push(b);
  }

  // De-interleave blok (tabel: kolom indeks 0 = versi 1)
  const eclIdx = { L: 0, M: 1, Q: 2, H: 3 }[ecl];
  const blockEccLen = ECC_CODEWORDS_PER_BLOCK[eclIdx][version - 1];
  const numBlocks = NUM_ECC_BLOCKS[eclIdx][version - 1];
  const numShort = numBlocks - (nWords % numBlocks);
  const shortLen = Math.floor(nWords / numBlocks);
  const blocks: number[][] = Array.from({ length: numBlocks }, () => []);
  let k = 0;
  for (let i = 0; i < shortLen + 1; i++) {
    for (let j = 0; j < numBlocks; j++) {
      if (i !== shortLen - blockEccLen || j >= numShort) blocks[j].push(bytes[k++]);
    }
  }

  // Syndrome Reed-Solomon tiap blok harus nol
  for (const block of blocks) {
    const n = block.length;
    for (let j = 0; j < blockEccLen; j++) {
      let s = 0;
      for (let i = 0; i < n; i++) s ^= gmul(block[i], ALOG[(j * (n - 1 - i)) % 255]);
      if (s !== 0) throw new Error(`sindrom RS tidak nol (j=${j})`);
    }
  }

  // Gabung data & parse header byte mode
  const data: number[] = [];
  for (const block of blocks) data.push(...block.slice(0, block.length - blockEccLen));
  const flat: number[] = [];
  for (const b of data) for (let i = 7; i >= 0; i--) flat.push((b >>> i) & 1);
  const readBits = (n: number, at: number): number => {
    let v = 0;
    for (let i = 0; i < n; i++) v = (v << 1) | flat[at + i];
    return v;
  };
  let at = 0;
  const mode = readBits(4, at);
  at += 4;
  if (mode !== 4) throw new Error('bukan byte mode: ' + mode);
  const len = readBits(version < 10 ? 8 : 16, at);
  at += version < 10 ? 8 : 16;
  const payload: number[] = [];
  for (let i = 0; i < len; i++) payload.push(readBits(8, at + i * 8));
  return new TextDecoder().decode(new Uint8Array(payload));
}

describe('round-trip decode', () => {
  it('teks pendek, ECC M', () => {
    expect(decodeQr(encodeQr('Obengku', 'M'))).toBe('Obengku');
  });

  it('teks kosong', () => {
    expect(decodeQr(encodeQr('', 'M'))).toBe('');
  });

  it('URL panjang, ECC Q', () => {
    const url = 'https://obengku.asn-hamdaniasril.workers.dev/tools/pembuat-qr-code';
    expect(decodeQr(encodeQr(url, 'Q'))).toBe(url);
  });

  it('unicode (UTF-8 multi-byte), ECC H', () => {
    const text = 'Kopi ☕ émoji 🎉 ñ';
    expect(decodeQr(encodeQr(text, 'H'))).toBe(text);
  });

  it('190 karakter: v10, 5 blok tak rata + count 16 bit', () => {
    const text = 'x'.repeat(190);
    const qr = encodeQr(text, 'M');
    expect(qr.version).toBe(10);
    expect(decodeQr(qr)).toBe(text);
  });

  it('180 karakter: v9, 5 blok tak rata (count 8 bit)', () => {
    const text = 'x'.repeat(180);
    const qr = encodeQr(text, 'M');
    expect(qr.version).toBe(9);
    expect(decodeQr(qr)).toBe(text);
  });

  it('300 karakter: v13, 9 blok', () => {
    const text = 'y'.repeat(300);
    const qr = encodeQr(text, 'M');
    expect(qr.version).toBe(13);
    expect(decodeQr(qr)).toBe(text);
  });

  it('mask dipaksa tetap terdekode', () => {
    for (const mask of [0, 3, 7]) {
      expect(decodeQr(encodeQr('mask test', 'M', mask))).toBe('mask test');
    }
  });

  it('semua level ECC', () => {
    for (const ecl of ['L', 'M', 'Q', 'H'] as const) {
      expect(decodeQr(encodeQr('level ' + ecl, ecl))).toBe('level ' + ecl);
    }
  });
});
