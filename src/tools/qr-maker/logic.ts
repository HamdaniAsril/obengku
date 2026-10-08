/**
 * Encoder QR Code Model 2 (ISO/IEC 18004) — implementasi mandiri, tanpa dependensi.
 *
 * Mode: byte (UTF-8). Level ECC: L/M/Q/H. Versi 1-40 dipilih otomatis.
 * Mask dipilih otomatis via skor penalti, atau bisa dipaksa untuk pengujian.
 *
 * Modul direpresentasikan Uint8Array per baris berisi 0 (terang) / 1 (gelap).
 */

export type EccLevel = 'L' | 'M' | 'Q' | 'H';

export interface QrMatrix {
  version: number;
  size: number;
  mask: number;
  ecl: EccLevel;
  /** Baris matrix 0/1; modules[y][x], (0,0) di kiri-atas. */
  modules: Uint8Array[];
}

/* ---------- Konstanta standar (ISO 18004) ---------- */

/** ECC codeword per blok: baris [L, M, Q, H], kolom indeks 0 = versi 1. */
export const ECC_CODEWORDS_PER_BLOCK: number[][] = [
  [7, 10, 15, 20, 26, 18, 20, 24, 30, 18, 20, 24, 26, 30, 22, 24, 28, 30, 28, 28, 28, 28, 30, 30, 26, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
  [10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26, 26, 26, 26, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28],
  [13, 22, 18, 26, 18, 24, 18, 22, 20, 24, 28, 26, 24, 20, 30, 24, 28, 28, 26, 30, 28, 30, 30, 30, 30, 30, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
  [17, 28, 22, 16, 22, 28, 26, 26, 24, 28, 24, 28, 22, 24, 24, 30, 28, 28, 26, 28, 30, 24, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
];

/** Jumlah blok ECC: baris [L, M, Q, H], kolom indeks 0 = versi 1. */
export const NUM_ECC_BLOCKS: number[][] = [
  [1, 1, 1, 1, 1, 2, 2, 2, 2, 4, 4, 4, 4, 4, 6, 6, 6, 6, 7, 8, 8, 9, 9, 10, 12, 12, 12, 13, 14, 15, 16, 17, 18, 19, 19, 20, 21, 22, 24, 25],
  [1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16, 17, 17, 18, 20, 21, 23, 25, 26, 28, 29, 31, 33, 35, 37, 38, 40, 43, 45, 47, 49],
  [1, 1, 2, 2, 4, 4, 6, 6, 8, 8, 8, 10, 12, 16, 12, 17, 16, 18, 21, 20, 23, 23, 25, 27, 29, 34, 34, 35, 38, 40, 43, 45, 48, 51, 53, 56, 59, 62, 65, 68],
  [1, 1, 2, 4, 4, 4, 5, 6, 8, 8, 11, 11, 16, 16, 18, 16, 19, 21, 25, 25, 25, 34, 30, 32, 35, 37, 40, 42, 45, 48, 51, 54, 57, 60, 63, 66, 70, 74, 77, 81],
];

const ECL_INDEX: Record<EccLevel, number> = { L: 0, M: 1, Q: 2, H: 3 };

export function eccFormatBits(ecl: EccLevel): number {
  return { L: 1, M: 0, Q: 3, H: 2 }[ecl];
}

/** Modul data tersedia (termasuk bit sisa; belum dibagi 8). */
export function numRawDataModules(ver: number): number {
  let result = (16 * ver + 128) * ver + 64;
  if (ver >= 2) {
    const numAlign = Math.floor(ver / 7) + 2;
    result -= (25 * numAlign - 10) * numAlign - 55;
    if (ver >= 7) result -= 36;
  }
  return result;
}

/** Total codeword (data + ECC). */
export function totalCodewords(ver: number): number {
  return Math.floor(numRawDataModules(ver) / 8);
}

/** Codeword data (tanpa ECC) untuk versi & level ECC tertentu. */
export function numDataCodewords(ver: number, ecl: EccLevel): number {
  const i = ECL_INDEX[ecl];
  return totalCodewords(ver) - ECC_CODEWORDS_PER_BLOCK[i][ver - 1] * NUM_ECC_BLOCKS[i][ver - 1];
}

/** Posisi pusat alignment pattern untuk versi (dua sumbu memakai daftar sama). */
export function alignPatternPositions(ver: number): number[] {
  if (ver === 1) return [];
  const size = ver * 4 + 17;
  const numAlign = Math.floor(ver / 7) + 2;
  const step = ver === 32 ? 26 : Math.ceil((ver * 4 + 4) / (numAlign * 2 - 2)) * 2;
  const result = new Array<number>(numAlign);
  result[0] = 6;
  for (let i = result.length - 1, pos = size - 7; i >= 1; i--, pos -= step) {
    result[i] = pos;
  }
  return result;
}

/* ---------- Reed-Solomon di GF(2^8), polinomial primitif 0x11D ---------- */

const RS_ALOG: number[] = [];
const RS_LOG: number[] = new Array(256).fill(0);
{
  let v = 1;
  for (let i = 0; i < 255; i++) {
    RS_ALOG[i] = v;
    RS_LOG[v] = i;
    v = (v << 1) ^ (v & 0x80 ? 0x11d : 0);
    v &= 0xff;
  }
}

function rsMul(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return RS_ALOG[(RS_LOG[a] + RS_LOG[b]) % 255];
}

/**
 * Koefisien polinomial generator RS untuk derajat 1..30
 * (derajat ECC maksimum per blok pada versi 1-40 adalah 30).
 * Disimpan dari pangkat tertinggi ke terendah, tanpa suku terdepan (selalu 1).
 */
const RS_DIVISORS: number[][] = (() => {
  const table: number[][] = [[]];
  for (let degree = 1; degree <= 30; degree++) {
    const row = new Array<number>(degree).fill(0);
    row[degree - 1] = 1; // monomial x^0
    let root = 1;
    for (let i = 0; i < degree; i++) {
      for (let j = 0; j < degree; j++) {
        row[j] = rsMul(row[j], root);
        if (j + 1 < degree) row[j] ^= row[j + 1];
      }
      root = rsMul(root, 2);
    }
    table.push(row);
  }
  return table;
})();

/** Sisa pembagian polinomial RS: menghasilkan codeword ECC. */
function rsRemainder(data: number[], degree: number): number[] {
  const divisor = RS_DIVISORS[degree];
  const result = new Array<number>(degree).fill(0);
  for (const b of data) {
    const factor = b ^ result[0];
    result.copyWithin(0, 1);
    result[degree - 1] = 0;
    for (let i = 0; i < degree; i++) {
      result[i] ^= rsMul(divisor[i], factor);
    }
  }
  return result;
}

/* ---------- Penyusunan payload ---------- */

/** Bit hitung panjang mode byte menurut versi. */
function byteModeCountBits(ver: number): number {
  return ver <= 9 ? 8 : 16;
}

/**
 * Menyusun codeword data: mode (0100) + panjang + data + terminator
 * + pad byte ke tampilan penuh kapasitas data versi/ecc.
 * Melempar Error bila payload tidak muat.
 */
export function encodePayload(bytes: Uint8Array, ver: number, ecl: EccLevel): Uint8Array {
  const capacity = numDataCodewords(ver, ecl) * 8;
  const used = 4 + byteModeCountBits(ver) + bytes.length * 8;
  if (used > capacity) {
    throw new Error(
      `Payload tidak muat: perlu ${used} bit, tersedia ${capacity} bit pada versi ${ver} ECC ${ecl}`
    );
  }

  const bits: number[] = [];
  const push = (value: number, n: number) => {
    for (let i = n - 1; i >= 0; i--) bits.push((value >>> i) & 1);
  };
  push(0b0100, 4); // mode byte
  push(bytes.length, byteModeCountBits(ver));
  for (const b of bytes) push(b, 8);
  push(0, Math.min(4, capacity - bits.length)); // terminator
  push(0, (8 - (bits.length % 8)) % 8); // selaraskan ke byte
  for (let pad = 0xec; bits.length < capacity; pad ^= 0xec ^ 0x11) {
    push(pad, 8);
  }

  const out = new Uint8Array(bits.length / 8);
  for (let i = 0; i < out.length; i++) {
    let b = 0;
    for (let j = 0; j < 8; j++) b = (b << 1) | bits[i * 8 + j];
    out[i] = b;
  }
  return out;
}

/* ---------- Pola fungsi ---------- */

interface FunctionPatterns {
  modules: Uint8Array[];
  isFunction: boolean[][];
}

/** Menggambar seluruh modul fungsi (timing, finder, alignment, format, versi). */
export function buildFunctionPatterns(ver: number, ecl: EccLevel): FunctionPatterns {
  const size = ver * 4 + 17;
  const modules: Uint8Array[] = Array.from({ length: size }, () => new Uint8Array(size));
  const isFunction: boolean[][] = Array.from({ length: size }, () => new Array(size).fill(false));

  const set = (x: number, y: number, dark: boolean) => {
    modules[y][x] = dark ? 1 : 0;
    isFunction[y][x] = true;
  };

  // Timing pattern
  for (let i = 0; i < size; i++) {
    set(6, i, i % 2 === 0);
    set(i, 6, i % 2 === 0);
  }

  // Finder pattern + separator (9x9, pusat di (3,3) dst.)
  const drawFinder = (cx: number, cy: number) => {
    for (let dy = -4; dy <= 4; dy++) {
      for (let dx = -4; dx <= 4; dx++) {
        const dist = Math.max(Math.abs(dx), Math.abs(dy));
        const x = cx + dx;
        const y = cy + dy;
        if (0 <= x && x < size && 0 <= y && y < size) set(x, y, dist !== 2 && dist !== 4);
      }
    }
  };
  drawFinder(3, 3);
  drawFinder(size - 4, 3);
  drawFinder(3, size - 4);

  // Alignment pattern
  const align = alignPatternPositions(ver);
  const numAlign = align.length;
  for (let i = 0; i < numAlign; i++) {
    for (let j = 0; j < numAlign; j++) {
      const skip =
        (i === 0 && j === 0) || (i === 0 && j === numAlign - 1) || (i === numAlign - 1 && j === 0);
      if (skip) continue;
      const cx = align[i];
      const cy = align[j];
      for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
          set(cx + dx, cy + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
        }
      }
    }
  }

  // Format info (mask dummy 0; ditimpa saat mask final dipilih)
  drawFormatBits(modules, isFunction, size, ecl, 0);

  // Versi info (hanya v >= 7)
  if (ver >= 7) {
    let rem = ver;
    for (let i = 0; i < 12; i++) rem = (rem << 1) ^ (rem >>> 11 ? 0x1f25 : 0);
    const bits = (ver << 12) | (rem & 0xfff);
    for (let i = 0; i < 18; i++) {
      const bit = ((bits >>> i) & 1) === 1;
      const a = size - 11 + (i % 3);
      const b = Math.floor(i / 3);
      set(a, b, bit);
      set(b, a, bit);
    }
  }

  return { modules, isFunction };
}

/** Menggambar dua salinan format info + dark module. */
function drawFormatBits(
  modules: Uint8Array[],
  isFunction: boolean[][],
  size: number,
  ecl: EccLevel,
  mask: number
): void {
  const data = (eccFormatBits(ecl) << 3) | mask;
  let rem = data;
  for (let i = 0; i < 10; i++) rem = (rem << 1) ^ (rem >>> 9 ? 0x537 : 0);
  const bits = ((data << 10) | (rem & 0x3ff)) ^ 0x5412;

  const bit = (i: number) => (bits >>> i) & 1;

  for (let i = 0; i <= 5; i++) setF(8, i, bit(i) === 1);
  setF(8, 7, bit(6) === 1);
  setF(8, 8, bit(7) === 1);
  setF(7, 8, bit(8) === 1);
  for (let i = 9; i < 15; i++) setF(14 - i, 8, bit(i) === 1);

  for (let i = 0; i < 8; i++) setF(size - 1 - i, 8, bit(i) === 1);
  for (let i = 8; i < 15; i++) setF(8, size - 15 + i, bit(i) === 1);
  setF(8, size - 8, true); // dark module

  function setF(x: number, y: number, dark: boolean) {
    modules[y][x] = dark ? 1 : 0;
    isFunction[y][x] = true;
  }
}

/* ---------- ECC + interleave ---------- */

/** Menambahkan ECC per blok lalu meng-interleave seluruh codeword. */
function addEccAndInterleave(data: Uint8Array, ver: number, ecl: EccLevel): number[] {
  const i = ECL_INDEX[ecl];
  const blockEccLen = ECC_CODEWORDS_PER_BLOCK[i][ver - 1];
  const numBlocks = NUM_ECC_BLOCKS[i][ver - 1];
  const rawCodewords = totalCodewords(ver);
  const numShort = numBlocks - (rawCodewords % numBlocks);
  const shortBlockLen = Math.floor(rawCodewords / numBlocks);

  // Blok berisi: data + 1 byte spacer (blok pendek) + ECC
  const blocks: number[][] = [];
  for (let b = 0, k = 0; b < numBlocks; b++) {
    const dataLen = shortBlockLen - blockEccLen + (b < numShort ? 0 : 1);
    const dat = Array.from(data.slice(k, k + dataLen));
    k += dataLen;
    const block = [...dat, ...new Array(shortBlockLen + 1 - dataLen - blockEccLen).fill(0)];
    const ecc = rsRemainder(dat, blockEccLen);
    blocks.push(block.concat(ecc));
  }

  const result: number[] = [];
  for (let idx = 0; idx < shortBlockLen + 1; idx++) {
    for (let b = 0; b < numBlocks; b++) {
      // Lewati spacer pada blok pendek
      if (idx !== shortBlockLen - blockEccLen || b >= numShort) {
        result.push(blocks[b][idx]);
      }
    }
  }
  return result;
}

/* ---------- Penempatan data & mask ---------- */

/** Menempatkan codeword ke area data dengan pola zigzag standar. */
function drawCodewords(
  modules: Uint8Array[],
  isFunction: boolean[][],
  size: number,
  data: number[]
): void {
  const totalBits = data.length * 8;
  let i = 0;
  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5;
    const upward = ((right + 1) & 2) === 0;
    for (let vert = 0; vert < size; vert++) {
      const y = upward ? size - 1 - vert : vert;
      for (let j = 0; j < 2; j++) {
        const x = right - j;
        if (!isFunction[y][x] && i < totalBits) {
          modules[y][x] = (data[i >>> 3] >>> (7 - (i & 7))) & 1;
          i++;
        }
      }
    }
  }
}

/** Rumus mask: true berarti bit dibalik. */
function maskInverts(mask: number, x: number, y: number): boolean {
  switch (mask) {
    case 0:
      return (x + y) % 2 === 0;
    case 1:
      return y % 2 === 0;
    case 2:
      return x % 3 === 0;
    case 3:
      return (x + y) % 3 === 0;
    case 4:
      return (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0;
    case 5:
      return (x * y) % 2 + (x * y) % 3 === 0;
    case 6:
      return ((x * y) % 2 + (x * y) % 3) % 2 === 0;
    default:
      return ((x + y) % 2 + (x * y) % 3) % 2 === 0;
  }
}

/** XOR modul data dengan mask (memodifikasi di tempat; dua kali panggil = urung). */
function applyMaskInPlace(modules: Uint8Array[], isFunction: boolean[][], mask: number): void {
  const size = modules.length;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (!isFunction[y][x] && maskInverts(mask, x, y)) {
        modules[y][x] ^= 1;
      }
    }
  }
}

/* ---------- Skor penalti pemilihan mask ---------- */

const PENALTY_N1 = 3;
const PENALTY_N2 = 3;
const PENALTY_N3 = 40;
const PENALTY_N4 = 10;

function penaltyScore(modules: Uint8Array[]): number {
  const size = modules.length;
  let result = 0;

  // Barisan panjang + pola mirip finder (horizontal & vertikal)
  for (let axis = 0; axis < 2; axis++) {
    const outer = axis === 0 ? size : size;
    for (let i = 0; i < outer; i++) {
      let runColor = false;
      let runLen = 0;
      const runHistory = new Array(7).fill(0);
      for (let j = 0; j < size; j++) {
        const color = axis === 0 ? modules[i][j] === 1 : modules[j][i] === 1;
        if (color === runColor) {
          runLen++;
          if (runLen === 5) result += PENALTY_N1;
          else if (runLen > 5) result += 1;
        } else {
          addRunHistory(runLen, runHistory, size);
          if (!runColor) result += countFinderPatterns(runHistory) * PENALTY_N3;
          runColor = color;
          runLen = 1;
        }
      }
      result += terminateAndCount(runColor, runLen, runHistory, size) * PENALTY_N3;
    }
  }

  // Blok 2x2 satu warna
  for (let y = 0; y < size - 1; y++) {
    for (let x = 0; x < size - 1; x++) {
      const color = modules[y][x];
      if (
        color === modules[y][x + 1] &&
        color === modules[y + 1][x] &&
        color === modules[y + 1][x + 1]
      ) {
        result += PENALTY_N2;
      }
    }
  }

  // Keseimbangan gelap/terang
  let dark = 0;
  for (const row of modules) {
    for (const c of row) dark += c;
  }
  const total = size * size;
  const k = Math.ceil(Math.abs(dark * 20 - total * 10) / total) - 1;
  result += Math.max(0, k) * PENALTY_N4;

  return result;
}

function addRunHistory(runLen: number, history: number[], size: number): void {
  if (history[0] === 0) runLen += size;
  history.copyWithin(1, 0, 6);
  history[0] = runLen;
}

function terminateAndCount(
  runColor: boolean,
  runLen: number,
  history: number[],
  size: number
): number {
  if (runColor) {
    addRunHistory(runLen, history, size);
    runLen = 0;
  }
  runLen += size;
  addRunHistory(runLen, history, size);
  return countFinderPatterns(history);
}

function countFinderPatterns(history: number[]): number {
  const n = history[1];
  const core =
    n > 0 && history[2] === n && history[3] === n * 3 && history[4] === n && history[5] === n;
  return (
    (core && history[0] >= n * 4 && history[6] >= n ? 1 : 0) +
    (core && history[6] >= n * 4 && history[0] >= n ? 1 : 0)
  );
}

/* ---------- Perakit matrix ---------- */

/**
 * Merakit matrix QR lengkap dari payload byte mentah.
 * Mask otomatis, atau dipaksa lewat parameter `forcedMask` (0-7).
 */
export function buildQrMatrix(
  bytes: Uint8Array,
  ver: number,
  ecl: EccLevel,
  forcedMask?: number
): QrMatrix {
  const size = ver * 4 + 17;
  const { modules, isFunction } = buildFunctionPatterns(ver, ecl);

  const dataCodewords = encodePayload(bytes, ver, ecl);
  const allCodewords = addEccAndInterleave(dataCodewords, ver, ecl);
  drawCodewords(modules, isFunction, size, allCodewords);

  let mask: number;
  if (forcedMask !== undefined) {
    mask = forcedMask;
  } else {
    let minPenalty = Infinity;
    mask = 0;
    for (let i = 0; i < 8; i++) {
      applyMaskInPlace(modules, isFunction, i);
      drawFormatBits(modules, isFunction, size, ecl, i);
      const penalty = penaltyScore(modules);
      if (penalty < minPenalty) {
        mask = i;
        minPenalty = penalty;
      }
      applyMaskInPlace(modules, isFunction, i); // urungkan
    }
  }

  applyMaskInPlace(modules, isFunction, mask);
  drawFormatBits(modules, isFunction, size, ecl, mask);

  return { version: ver, size, mask, ecl, modules };
}

/** Menyandikan teks (UTF-8) ke matrix QR pada level ECC tertentu. */
export function encodeQr(text: string, ecl: EccLevel = 'M', forcedMask?: number): QrMatrix {
  const bytes = new TextEncoder().encode(text);
  let version = 0;
  for (let v = 1; v <= 40; v++) {
    if (4 + byteModeCountBits(v) + bytes.length * 8 <= numDataCodewords(v, ecl) * 8) {
      version = v;
      break;
    }
  }
  if (version === 0) {
    throw new Error(
      `Teks terlalu panjang untuk QR code (maksimum ${numDataCodewords(40, ecl) - 3} byte pada ECC ${ecl})`
    );
  }
  return buildQrMatrix(bytes, version, ecl, forcedMask);
}
