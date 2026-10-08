export type CoinSide = 'kepala' | 'ekor';

export const SIDE_LABEL: Record<CoinSide, string> = {
  kepala: 'Kepala',
  ekor: 'Ekor',
};

/** Lempar koin; suntikkan `random` sendiri agar bisa diuji deterministik. */
export function flipCoin(random: () => number = Math.random): CoinSide {
  return random() < 0.5 ? 'kepala' : 'ekor';
}
