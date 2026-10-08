export type RatioMode = 'solve2' | 'solve3' | 'scale2' | 'scale3';

export const MODE_LABEL: Record<RatioMode, string> = {
  solve2: 'A:B = C:D',
  solve3: 'A:B:C = D:E:F',
  scale2: 'Scale A:B (×)',
  scale3: 'Scale A:B:C (×)',
};

export type SolveOutcome =
  | { status: 'empty' | 'need-one' | 'complete' | 'zero' | 'undetermined' }
  | { status: 'solved'; missing: string; value: number }
  | { status: 'solved-pair'; results: { missing: string; value: number }[] };

/** Terima "0,5" atau "0.5"; null bila kosong atau bukan angka. */
export function parseNumber(raw: string): number | null {
  const trimmed = raw.trim();
  if (trimmed === '') return null;
  const normalized = trimmed.replace(',', '.');
  if (!/^-?(\d+\.?\d*|\.\d+)$/.test(normalized)) return null;
  const value = Number(normalized);
  return Number.isFinite(value) ? value : null;
}

/** Gaya Indonesia: koma desimal, maksimal 6 desimal, nol belakang dibuang. */
const numberFormatter = new Intl.NumberFormat('id-ID', {
  maximumFractionDigits: 6,
});

export function formatNumber(value: number): string {
  return numberFormatter.format(value);
}

const LABELS_2 = ['A', 'B', 'C', 'D'] as const;
const LABELS_3 = ['A', 'B', 'C', 'D', 'E', 'F'] as const;

/** A:B = C:D — tepat satu field null (yang dicari), 0/2+ null = status. */
export function solveProportion2(
  a: number | null,
  b: number | null,
  c: number | null,
  d: number | null,
): SolveOutcome {
  const values = [a, b, c, d];
  const filled = values.filter((value) => value !== null).length;
  if (filled === 0) return { status: 'empty' };
  if (filled === 4) return { status: 'complete' };
  if (filled < 3) return { status: 'need-one' };

  const index = values.findIndex((value) => value === null);
  const [A, B, C, D] = values as [number, number, number, number];
  let value: number;
  switch (index) {
    case 0:
      if (D === 0) return { status: 'zero' };
      value = (B * C) / D;
      break;
    case 1:
      if (C === 0) return { status: 'zero' };
      value = (A * D) / C;
      break;
    case 2:
      if (B === 0) return { status: 'zero' };
      value = (A * D) / B;
      break;
    default:
      if (A === 0) return { status: 'zero' };
      value = (B * C) / A;
  }
  if (!Number.isFinite(value)) return { status: 'zero' };
  return { status: 'solved', missing: LABELS_2[index], value };
}

/**
 * A:B:C = D:E:F — rasio k diambil dari pasangan A:D yang paling awal
 * lengkap (left[i] dan right[i] keduanya terisi).
 * Dua slot kosong dihitung lewat penutupan rasio; bila tidak dapat
 * ditentukan (mis. A & D — pasangan diagonal), hasilnya 'undetermined'.
 */
export function solveProportion3(
  left: (number | null)[],
  right: (number | null)[],
): SolveOutcome {
  const values = [...left, ...right];
  const filled = values.filter((value) => value !== null).length;
  if (filled === 0) return { status: 'empty' };
  if (filled === 6) return { status: 'complete' };
  if (filled < 4) return { status: 'need-one' };

  const missingIndices = values
    .map((value, index) => (value === null ? index : -1))
    .filter((index) => index >= 0);

  if (filled === 5) {
    const missingIndex = missingIndices[0];
    let pair = -1;
    for (let i = 0; i < 3; i++) {
      if (left[i] !== null && right[i] !== null) {
        pair = i;
        break;
      }
    }
    if (pair === -1) return { status: 'zero' };
    const divisor = right[pair] as number;
    if (divisor === 0) return { status: 'zero' };
    const ratio = (left[pair] as number) / divisor;

    let value: number;
    if (missingIndex < 3) {
      value = (right[missingIndex] as number) * ratio;
    } else {
      if (ratio === 0) return { status: 'zero' };
      value = (left[missingIndex - 3] as number) / ratio;
    }
    if (!Number.isFinite(value)) return { status: 'zero' };
    return { status: 'solved', missing: LABELS_3[missingIndex], value };
  }

  return solve3Pair(left, right, missingIndices);
}

/** Tutup rasio untuk dua slot kosong: r1 = A/B = D/E, r2 = B/C = E/F. */
function solve3Pair(
  left: (number | null)[],
  right: (number | null)[],
  missingIndices: number[],
): SolveOutcome {
  const L = [...left];
  const R = [...right];
  let r1: number | null = null;
  let r2: number | null = null;

  const allFilled = () =>
    L.every((value) => value !== null) && R.every((value) => value !== null);

  for (let pass = 0; pass < 6 && !allFilled(); pass++) {
    let changed = false;

    if (r1 === null) {
      if (L[0] !== null && L[1] !== null) {
        if (L[1] === 0) return { status: 'zero' };
        r1 = L[0] / L[1];
        changed = true;
      } else if (R[0] !== null && R[1] !== null) {
        if (R[1] === 0) return { status: 'zero' };
        r1 = R[0] / R[1];
        changed = true;
      }
    }
    if (r2 === null) {
      if (L[1] !== null && L[2] !== null) {
        if (L[2] === 0) return { status: 'zero' };
        r2 = L[1] / L[2];
        changed = true;
      } else if (R[1] !== null && R[2] !== null) {
        if (R[2] === 0) return { status: 'zero' };
        r2 = R[1] / R[2];
        changed = true;
      }
    }

    if (r1 !== null) {
      if (L[0] === null && L[1] !== null) {
        L[0] = L[1] * r1;
        changed = true;
      }
      if (L[1] === null && L[0] !== null) {
        if (r1 === 0) return { status: 'zero' };
        L[1] = L[0] / r1;
        changed = true;
      }
      if (R[0] === null && R[1] !== null) {
        R[0] = R[1] * r1;
        changed = true;
      }
      if (R[1] === null && R[0] !== null) {
        if (r1 === 0) return { status: 'zero' };
        R[1] = R[0] / r1;
        changed = true;
      }
    }
    if (r2 !== null) {
      if (L[1] === null && L[2] !== null) {
        L[1] = L[2] * r2;
        changed = true;
      }
      if (L[2] === null && L[1] !== null) {
        if (r2 === 0) return { status: 'zero' };
        L[2] = L[1] / r2;
        changed = true;
      }
      if (R[1] === null && R[2] !== null) {
        R[1] = R[2] * r2;
        changed = true;
      }
      if (R[2] === null && R[1] !== null) {
        if (r2 === 0) return { status: 'zero' };
        R[2] = R[1] / r2;
        changed = true;
      }
    }

    if (!changed) break;
  }

  if (!allFilled()) return { status: 'undetermined' };
  const all = [...L, ...R] as number[];
  return {
    status: 'solved-pair',
    results: missingIndices.map((index) => ({
      missing: LABELS_3[index],
      value: all[index],
    })),
  };
}

/** Skala rasio: tiap bagian dikalikan faktor k. */
export function scaleRatio(values: number[], k: number): number[] {
  return values.map((value) => value * k);
}
