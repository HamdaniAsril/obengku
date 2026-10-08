'use client';

import { useEffect, useRef, useState } from 'react';
import { StarStamp } from '@/components/StarStamp';
import { flipCoin, SIDE_LABEL, type CoinSide } from './logic';

const SPIN_MS = 1100;
const TURNS = 6;

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function CoinFlip() {
  const [side, setSide] = useState<CoinSide | null>(null);
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [flips, setFlips] = useState(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, []);

  const handleFlip = () => {
    if (spinning) return;
    const result = flipCoin();
    // Wajah depan (Kepala) selesai pada kelipatan 360°, wajah belakang (Ekor) pada 180°.
    const target = result === 'kepala' ? 0 : 180;
    setRotation((current) => current - (current % 360) + TURNS * 360 + target);
    setSide(null);
    setSpinning(true);

    if (prefersReducedMotion()) {
      setSide(result);
      setFlips((count) => count + 1);
      setSpinning(false);
      return;
    }
    timerRef.current = window.setTimeout(() => {
      setSide(result);
      setFlips((count) => count + 1);
      setSpinning(false);
      timerRef.current = null;
    }, SPIN_MS);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-center">
        <div className="coin-stage">
          <div className="coin" style={{ transform: `rotateX(${rotation}deg)` }} aria-hidden>
            <div className="coin-face">Kepala</div>
            <div className="coin-face coin-face--back">Ekor</div>
          </div>
        </div>
      </div>

      <p role="status" className="sr-only">
        {side && !spinning ? `Hasil lemparan: ${SIDE_LABEL[side]}` : ''}
      </p>

      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={handleFlip} disabled={spinning} className="btn btn-primary">
          {spinning ? 'Melempar…' : side ? 'Lempar lagi' : 'Lempar'}
        </button>
      </div>

      {side && !spinning ? (
        <div className="result-card">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-semibold text-muted">Hasil lemparan</p>
            <StarStamp key={flips} />
          </div>
          <p className="font-display text-2xl">{SIDE_LABEL[side]}</p>
        </div>
      ) : null}
    </div>
  );
}
