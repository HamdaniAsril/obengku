'use client';

import {
  Fragment,
  useMemo,
  useState,
  type Dispatch,
  type SetStateAction,
} from 'react';
import { Alert } from '@/components/Alert';
import { StarStamp } from '@/components/StarStamp';
import {
  formatNumber,
  MODE_LABEL,
  parseNumber,
  scaleRatio,
  solveProportion2,
  solveProportion3,
  type RatioMode,
  type SolveOutcome,
} from './logic';

type View =
  | { kind: 'hint'; text: string }
  | { kind: 'error'; text: string }
  | { kind: 'result'; headline: string; ledger?: [string, string][]; stampKey: string };

const MODES = Object.keys(MODE_LABEL) as RatioMode[];

const INVALID_TEXT = 'Masukkan angka yang valid — desimal pakai titik atau koma.';

function outcomeToView(outcome: SolveOutcome, mode: RatioMode): View {
  const solve3 = mode === 'solve3';
  switch (outcome.status) {
    case 'empty':
      return { kind: 'hint', text: 'Isi nilai untuk melihat hasil.' };
    case 'need-one':
      return {
        kind: 'hint',
        text: solve3
          ? 'Isi minimal empat nilai, kosongkan maksimal dua.'
          : 'Isi tiga nilai, kosongkan satu untuk mencari yang hilang.',
      };
    case 'complete':
      return {
        kind: 'hint',
        text: solve3
          ? 'Semua nilai sudah terisi — kosongkan satu atau dua untuk mencari yang hilang.'
          : 'Semua nilai sudah terisi — kosongkan satu untuk mencari yang hilang.',
      };
    case 'zero':
      return { kind: 'error', text: 'Pembagian nol — pembagi tidak boleh 0.' };
    case 'undetermined':
      return {
        kind: 'error',
        text: 'Dua kolom yang dikosongkan saling tergantung — kosongkan pasangan kolom lain.',
      };
    case 'solved-pair':
      return {
        kind: 'result',
        headline: outcome.results
          .map((result) => `${result.missing} = ${formatNumber(result.value)}`)
          .join(' · '),
        stampKey: outcome.results
          .map((result) => `${result.missing}-${result.value}`)
          .join(','),
      };
    default:
      return {
        kind: 'result',
        headline: `${outcome.missing} = ${formatNumber(outcome.value)}`,
        stampKey: `${outcome.missing}-${outcome.value}`,
      };
  }
}

export function RatioCalculator() {
  const [mode, setMode] = useState<RatioMode>('solve2');
  const [s2, setS2] = useState(['', '', '', '']);
  const [s3, setS3] = useState(['', '', '', '', '', '']);
  const [sc2, setSc2] = useState(['', '', '']);
  const [sc3, setSc3] = useState(['', '', '', '']);

  const view = useMemo<View>(() => {
    const raws = mode === 'solve2' ? s2 : mode === 'solve3' ? s3 : mode === 'scale2' ? sc2 : sc3;
    const invalid = raws.some((raw) => raw.trim() !== '' && parseNumber(raw) === null);
    if (invalid) return { kind: 'error', text: INVALID_TEXT };
    const parsed = raws.map((raw) => (raw.trim() === '' ? null : parseNumber(raw)));

    if (mode === 'solve2') {
      return outcomeToView(
        solveProportion2(parsed[0], parsed[1], parsed[2], parsed[3]),
        mode,
      );
    }
    if (mode === 'solve3') {
      return outcomeToView(
        solveProportion3(parsed.slice(0, 3), parsed.slice(3, 6)),
        mode,
      );
    }

    // Scale: semua wajib terisi.
    if (parsed.some((value) => value === null)) {
      const allEmpty = raws.every((raw) => raw.trim() === '');
      return allEmpty
        ? { kind: 'hint', text: 'Isi nilai untuk melihat hasil.' }
        : { kind: 'hint', text: 'Isi semua nilai.' };
    }
    const numbers = parsed as number[];
    const k = numbers[numbers.length - 1];
    const before = numbers.slice(0, -1);
    const after = scaleRatio(before, k);
    return {
      kind: 'result',
      headline: after.map(formatNumber).join(' : '),
      ledger: [
        ['Sebelum', before.map(formatNumber).join(' : ')],
        ['Faktor k', formatNumber(k)],
      ],
      stampKey: `${after.join(',')}`,
    };
  }, [mode, s2, s3, sc2, sc3]);

  const active: [string[], Dispatch<SetStateAction<string[]>>] =
    mode === 'solve2'
      ? [s2, setS2]
      : mode === 'solve3'
        ? [s3, setS3]
        : mode === 'scale2'
          ? [sc2, setSc2]
          : [sc3, setSc3];

  const labels =
    mode === 'solve2'
      ? ['A', 'B', 'C', 'D']
      : mode === 'solve3'
        ? ['A', 'B', 'C', 'D', 'E', 'F']
        : mode === 'scale2'
          ? ['A', 'B', 'k']
          : ['A', 'B', 'C', 'k'];

  const helper =
    mode === 'solve3'
      ? 'Isi minimal empat nilai — satu atau dua kolom kosong akan dihitung otomatis.'
      : mode === 'solve2'
        ? 'Isi tiga nilai, kosongkan satu — nilai kosong yang akan dicari.'
        : 'Kalikan tiap bagian rasio dengan faktor k.';

  // Tanda di antara kolom: A : B = C : D  /  A : B : C = D : E : F  /  A : B × k
  const separators: (string | null)[] =
    mode === 'solve2'
      ? [null, ':', '=', ':']
      : mode === 'solve3'
        ? [null, ':', ':', '=', ':', ':']
        : mode === 'scale2'
          ? [null, ':', '×']
          : [null, ':', ':', '×'];

  const [values, setValues] = active;

  return (
    <div className="space-y-6">
      <fieldset>
        <legend className="text-sm font-semibold">Mode hitung</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {MODES.map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={mode === value}
              onClick={() => setMode(value)}
              className={`btn ${mode === value ? 'btn-primary' : 'btn-ghost'}`}
            >
              {MODE_LABEL[value]}
            </button>
          ))}
        </div>
      </fieldset>

      <div>
        <p className="max-w-prose text-sm text-muted">{helper}</p>
        <div className="mt-3 flex flex-wrap items-end gap-2">
          {labels.map((label, index) => (
            <Fragment key={`${mode}-${label}`}>
              {index > 0 ? (
                <span
                  aria-hidden
                  className="mb-2 text-lg font-semibold text-muted select-none"
                >
                  {separators[index]}
                </span>
              ) : null}
              <div className="w-20 sm:w-24">
                <label htmlFor={`${mode}-${label}`} className="block text-sm font-semibold">
                  {label}
                </label>
                <input
                  id={`${mode}-${label}`}
                  className="field"
                  inputMode="decimal"
                  autoComplete="off"
                  placeholder="0"
                  value={values[index]}
                  onChange={(event) => {
                    const next = [...values];
                    next[index] = event.target.value;
                    setValues(next);
                  }}
                />
              </div>
            </Fragment>
          ))}
        </div>
      </div>

      {view.kind === 'error' ? <Alert>{view.text}</Alert> : null}
      {view.kind === 'hint' ? (
        <p className="max-w-prose text-sm text-muted">{view.text}</p>
      ) : null}

      {view.kind === 'result' ? (
        <div className="result-card">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-semibold text-muted">Hasil</p>
            <StarStamp key={view.stampKey} />
          </div>
          <p className="font-display text-2xl">{view.headline}</p>
          {view.ledger ? (
            <dl className="ledger">
              {view.ledger.map(([term, value]) => (
                <div key={term}>
                  <dt>{term}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
