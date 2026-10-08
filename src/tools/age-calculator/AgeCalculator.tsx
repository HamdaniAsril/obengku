'use client';

import { useMemo, useState } from 'react';
import { Alert } from '@/components/Alert';
import { StarStamp } from '@/components/StarStamp';
import { calculateAge, parseDateInput, toDateInputValue } from './logic';

export function AgeCalculator() {
  const [birthValue, setBirthValue] = useState('1990-05-10');
  const [today] = useState(() => new Date());

  const { result, error } = useMemo(() => {
    if (!birthValue) {
      return { result: null, error: 'Masukkan tanggal lahir terlebih dahulu.' };
    }
    const birthDate = parseDateInput(birthValue);
    if (!birthDate) {
      return { result: null, error: 'Format tanggal tidak dikenali.' };
    }
    if (birthDate.getFullYear() < 1900) {
      return { result: null, error: 'Tahun lahir minimal 1900.' };
    }
    if (birthDate.getTime() > today.getTime()) {
      return { result: null, error: 'Tanggal lahir tidak boleh di masa depan.' };
    }
    try {
      return { result: calculateAge(birthDate, today), error: null };
    } catch (err) {
      return {
        result: null,
        error: err instanceof Error ? err.message : 'Terjadi kesalahan.',
      };
    }
  }, [birthValue, today]);

  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);

  return (
    <div className="space-y-6">
      <div className="max-w-xs space-y-2">
        <label htmlFor="tanggal-lahir" className="block text-sm font-semibold">
          Tanggal lahir
        </label>
        <input
          id="tanggal-lahir"
          type="date"
          value={birthValue}
          max={toDateInputValue(today)}
          onChange={(event) => setBirthValue(event.target.value)}
          className="field"
        />
      </div>

      {error ? <Alert>{error}</Alert> : null}

      {result ? (
        <div className="space-y-5">
          <div className="result-card">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-semibold text-muted">Umur</p>
              <StarStamp
                key={`${result.years}-${result.months}-${result.days}`}
              />
            </div>
            <p className="mt-1 font-display text-[1.7rem] leading-[1.25] tracking-[-0.03em] tabular-nums md:text-[2.1rem]">
              {result.years} tahun {result.months} bulan {result.days} hari
            </p>
          </div>

          <dl className="ledger max-w-md">
            {[
              { label: 'Total bulan', value: result.totalMonths.toLocaleString('id-ID') },
              { label: 'Total minggu', value: result.totalWeeks.toLocaleString('id-ID') },
              { label: 'Total hari', value: result.totalDays.toLocaleString('id-ID') },
            ].map((item) => (
              <div key={item.label}>
                <dt>{item.label}</dt>
                <dd>{item.value}</dd>
              </div>
            ))}
          </dl>

          <div className="max-w-prose space-y-1 text-[15px]">
            <p>
              Lahir pada hari <strong>{result.weekdayBorn}</strong>.
            </p>
            <p>
              Ulang tahun berikutnya <strong>{formatDate(result.nextBirthday)}</strong>, dalam{' '}
              <strong>{result.daysToNextBirthday}</strong> hari.
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
