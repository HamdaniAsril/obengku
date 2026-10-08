export const MIN_OPTIONS = 2;
export const MAX_OPTIONS = 12;

/** Indeks segmen pemenang; hasil acak dijaga tetap di dalam rentang. */
export function pickWinner(count: number, random: () => number = Math.random): number {
  if (count <= 0) return 0;
  return Math.min(count - 1, Math.max(0, Math.floor(random() * count)));
}

/** Sudut pusat segmen `index`, diukur dari atas searah jarum jam. */
export function segmentCenter(index: number, count: number): number {
  return (index + 0.5) * (360 / count);
}

/**
 * Segmen mana yang berada di bawah penunjuk (di atas) untuk rotasi tertentu.
 * Rotasi searah jarum jam; penunjuk tetap di sudut 0.
 */
export function winnerFromRotation(rotation: number, count: number): number {
  const span = 360 / count;
  const angleAtTop = (((360 - (rotation % 360)) % 360) + 360) % 360;
  return Math.min(count - 1, Math.floor(angleAtTop / span));
}

/**
 * Rotasi berikutnya agar `index` berhenti di bawah penunjuk, dengan
 * acakan kecil di dalam segmen supaya pendaratan tidak selalu identik.
 * Hasil selalu lebih besar dari `currentRotation` agar putaran maju terus.
 */
export function nextRotation(
  currentRotation: number,
  index: number,
  count: number,
  random: () => number = Math.random,
  turns = 5,
): number {
  const span = 360 / count;
  const jitter = (random() - 0.5) * span * 0.6;
  const finalAngle = segmentCenter(index, count) + jitter;
  const targetEnd = (((360 - (finalAngle % 360)) % 360) + 360) % 360;
  const base = currentRotation - (currentRotation % 360);
  return base + targetEnd + turns * 360;
}

/** Koordinat SVG: sudut 0 di atas, searah jarum jam, dibulatkan 2 desimal. */
export function polarToCartesian(
  cx: number,
  cy: number,
  r: number,
  angleDeg: number,
): { x: number; y: number } {
  const rad = (angleDeg * Math.PI) / 180;
  const round = (value: number) => Math.round(value * 100) / 100;
  return {
    x: round(cx + r * Math.sin(rad)),
    y: round(cy - r * Math.cos(rad)),
  };
}

/** Path SVG satu segmen roda: jari-jari `r`, dari `startAngle` ke `endAngle`. */
export function arcPath(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number,
): string {
  const start = polarToCartesian(cx, cy, r, startAngle);
  const end = polarToCartesian(cx, cy, r, endAngle);
  return `M${cx} ${cy} L${start.x} ${start.y} A${r} ${r} 0 0 1 ${end.x} ${end.y} Z`;
}

/** Posisi label HTML di dalam roda yang ikut berputar. */
export function labelTransform(index: number, count: number, radiusPx: number): string {
  const center = segmentCenter(index, count);
  return `translate(-50%, -50%) rotate(${center}deg) translateY(-${radiusPx}px) rotate(${-center}deg)`;
}
