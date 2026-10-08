export interface FindQualityOptions {
  /** Kualitas terendah yang boleh dicoba (default 0.3). */
  min?: number;
  /** Kualitas tertinggi yang dicoba lebih dulu (default 0.95). */
  max?: number;
  /** Jumlah probe binary search setelah probe kualitas penuh (default 8). */
  maxIterations?: number;
}

export interface FindQualityResult {
  quality: number;
  bytes: number;
  reached: boolean;
  iterations: number;
}

const DEFAULT_MIN = 0.3;
const DEFAULT_MAX = 0.95;
const DEFAULT_ITERATIONS = 8;

export const MIN_TARGET_KB = 1;
export const MAX_TARGET_KB = 100_000;

/**
 * Cari kualitas tertinggi yang menghasilkan `encode(quality) <= targetBytes`.
 *
 * `encode` diasumsikan monoton tidak naik terhadap kualitas (kualitas lebih
 * rendah menghasilkan berkas lebih kecil). Probe pertama memakai kualitas
 * penuh; bila sudah muat, tidak ada pencarian lagi. Bila tidak ada satu pun
 * kualitas yang muat, hasil terendah dipakai dengan `reached: false`.
 */
export async function findQuality(
  targetBytes: number,
  encode: (quality: number) => Promise<number>,
  options: FindQualityOptions = {},
): Promise<FindQualityResult> {
  const min = options.min ?? DEFAULT_MIN;
  const max = options.max ?? DEFAULT_MAX;
  const maxIterations = options.maxIterations ?? DEFAULT_ITERATIONS;

  let iterations = 0;
  const probe = async (quality: number) => {
    iterations += 1;
    return encode(quality);
  };

  const fullBytes = await probe(max);
  if (fullBytes <= targetBytes) {
    return { quality: max, bytes: fullBytes, reached: true, iterations };
  }

  let lo = min;
  let hi = max;
  let best: { quality: number; bytes: number } | null = null;

  for (let i = 0; i < maxIterations; i += 1) {
    const quality = (lo + hi) / 2;
    const bytes = await probe(quality);
    if (bytes <= targetBytes) {
      best = { quality, bytes };
      lo = quality;
    } else {
      hi = quality;
    }
  }

  if (best) {
    return { quality: best.quality, bytes: best.bytes, reached: true, iterations };
  }

  const floorBytes = await probe(min);
  if (floorBytes <= targetBytes) {
    return { quality: min, bytes: floorBytes, reached: true, iterations };
  }
  return { quality: min, bytes: floorBytes, reached: false, iterations };
}

/** Baca input "Target ukuran (KB)" menjadi bilangan KB; `null` bila tak sah. */
export function parseTargetKb(raw: string): number | null {
  const text = raw.trim();
  if (!/^\d+$/.test(text)) return null;
  const value = Number(text);
  if (value < MIN_TARGET_KB || value > MAX_TARGET_KB) return null;
  return value;
}

/** Format ukuran berkas gaya Indonesia: "0 B", "1,5 KB", "2,4 MB". */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${Math.round(bytes)} B`;
  const text = (divisor: number) => {
    const fixed = (bytes / divisor).toFixed(1).replace('.', ',');
    return fixed.endsWith(',0') ? fixed.slice(0, -2) : fixed;
  };
  if (bytes < 1024 * 1024) return `${text(1024)} KB`;
  return `${text(1024 * 1024)} MB`;
}

/** Persen penghematan dari `before` ke `after`; negatif bila hasil membesar. */
export function savedPercent(before: number, after: number): number {
  if (before <= 0) return 0;
  return Math.round(((before - after) / before) * 1000) / 10;
}
