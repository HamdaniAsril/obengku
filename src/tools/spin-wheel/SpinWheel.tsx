'use client';

import { useEffect, useRef, useState } from 'react';
import { Alert } from '@/components/Alert';
import { StarStamp } from '@/components/StarStamp';
import { arcPath, labelTransform, MAX_OPTIONS, MIN_OPTIONS, nextRotation, pickWinner } from './logic';

const SPIN_MS = 3200;
const SIZE = 280;
const LABEL_RADIUS = 96;
const PALETTE = [
  'var(--marker-o)',
  'var(--marker-b)',
  'var(--marker-g)',
  'var(--marker-p)',
  'var(--marker-y)',
];

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function SpinWheel() {
  const [options, setOptions] = useState<string[]>(['Ya', 'Tidak']);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<number | null>(null);
  const [spins, setSpins] = useState(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, []);

  const addOption = (event: React.FormEvent) => {
    event.preventDefault();
    if (spinning) return;
    const value = draft.trim();
    if (value === '') return;
    if (options.length >= MAX_OPTIONS) {
      setError(`Maksimal ${MAX_OPTIONS} opsi.`);
      return;
    }
    if (options.some((option) => option.toLowerCase() === value.toLowerCase())) {
      setError('Opsi itu sudah ada di daftar.');
      return;
    }
    setOptions([...options, value]);
    setDraft('');
    setError(null);
    setWinner(null);
  };

  const removeOption = (index: number) => {
    if (spinning) return;
    setOptions(options.filter((_, i) => i !== index));
    setError(null);
    setWinner(null);
  };

  const spin = () => {
    if (spinning || options.length < MIN_OPTIONS) return;
    const index = pickWinner(options.length);
    setRotation((current) => nextRotation(current, index, options.length));
    setWinner(null);
    setSpinning(true);

    if (prefersReducedMotion()) {
      setWinner(index);
      setSpins((count) => count + 1);
      setSpinning(false);
      return;
    }
    timerRef.current = window.setTimeout(() => {
      setWinner(index);
      setSpins((count) => count + 1);
      setSpinning(false);
      timerRef.current = null;
    }, SPIN_MS);
  };

  const span = 360 / options.length;
  const labelMax = options.length <= 6 ? 96 : options.length <= 9 ? 74 : 56;
  const atMax = options.length >= MAX_OPTIONS;

  return (
    <div className="space-y-6">
      <div>
        <p className="mb-2 text-sm font-semibold">Opsi saat ini</p>
        <ul className="space-y-2">
          {options.map((option, index) => (
            <li
              key={`${index}-${option}`}
              className="flex items-center justify-between gap-3 rounded-[10px] border border-hairline bg-surface py-1.5 pr-1.5 pl-4"
            >
              <span className="min-w-0 truncate text-sm font-semibold">{option}</span>
              <button
                type="button"
                onClick={() => removeOption(index)}
                disabled={spinning}
                className="btn btn-ghost"
              >
                Hapus
              </button>
            </li>
          ))}
        </ul>
        {options.length < MIN_OPTIONS ? (
          <p className="mt-2 text-sm text-muted">
            Tambahkan minimal {MIN_OPTIONS} opsi untuk memutar.
          </p>
        ) : null}
      </div>

      <form onSubmit={addOption} className="space-y-2">
        <label htmlFor="opsi-baru" className="block text-sm font-semibold">
          Tambah opsi
        </label>
        <div className="flex flex-wrap gap-2">
          <input
            id="opsi-baru"
            className="field"
            value={draft}
            onChange={(event) => {
              setDraft(event.target.value);
              setError(null);
            }}
            disabled={spinning || atMax}
            placeholder="Tulis pilihan…"
            maxLength={40}
          />
          <button
            type="submit"
            className="btn btn-ghost"
            disabled={spinning || draft.trim() === '' || atMax}
          >
            Tambah
          </button>
        </div>
        {atMax ? <p className="text-xs text-muted">Maksimal {MAX_OPTIONS} opsi.</p> : null}
      </form>

      {error ? <Alert>{error}</Alert> : null}

      <div className="relative mx-auto" style={{ width: SIZE, height: SIZE }}>
        <div className="spin-wheel__rotor" style={{ transform: `rotate(${rotation}deg)` }}>
          <svg viewBox="0 0 200 200" className="block h-full w-full" aria-hidden>
            {options.map((option, index) => (
              <path
                key={`${index}-${option}`}
                d={arcPath(100, 100, 96, index * span, (index + 1) * span)}
                style={{ fill: PALETTE[index % PALETTE.length] }}
                strokeWidth={1.07}
              />
            ))}
            <circle
              cx={100}
              cy={100}
              r={96}
              fill="none"
              style={{ stroke: 'var(--line)' }}
              strokeWidth={1.07}
            />
            <circle
              cx={100}
              cy={100}
              r={22}
              style={{ fill: 'var(--surface)', stroke: 'var(--line)' }}
              strokeWidth={1.07}
            />
          </svg>
          {options.map((option, index) => (
            <span
              key={`${index}-${option}`}
              className={`spin-wheel__label${winner === index && !spinning ? ' is-winner' : ''}`}
              style={{
                transform: labelTransform(index, options.length, LABEL_RADIUS),
                maxWidth: labelMax,
              }}
            >
              {option}
            </span>
          ))}
        </div>
        <div className="spin-wheel__pointer" aria-hidden>
          <svg viewBox="0 0 24 20" width={28} height={24}>
            <path
              d="M12 19 L2.5 3 H21.5 Z"
              style={{ fill: 'var(--surface)', stroke: 'var(--line)' }}
              strokeWidth={1.5}
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      <p role="status" className="sr-only">
        {winner !== null && !spinning ? `Hasil putaran: ${options[winner]}` : ''}
      </p>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={spin}
          disabled={spinning || options.length < MIN_OPTIONS}
          className="btn btn-primary"
        >
          {spinning ? 'Memutar…' : winner !== null ? 'Putar lagi' : 'Putar'}
        </button>
      </div>

      {winner !== null && !spinning ? (
        <div className="result-card">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-semibold text-muted">Hasil putaran</p>
            <StarStamp key={spins} />
          </div>
          <p className="font-display text-2xl">{options[winner]}</p>
        </div>
      ) : null}
    </div>
  );
}
