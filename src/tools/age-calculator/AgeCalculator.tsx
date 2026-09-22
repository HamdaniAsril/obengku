'use client';

import { useMemo, useState } from 'react';
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
        <label htmlFor="tanggal-lahir" className="block text-sm font-medium">
          Tanggal lahir
        </label>
        <input
          id="tanggal-lahir"
          type="date"
          value={birthValue}
          max={toDateInputValue(today)}
          onChange={(event) => setBirthValue(event.target.value)}
          className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
        />
      </div>

      {error ? (
        <p
          role="alert"
          className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200"
        >
          {error}
        </p>
      ) : null}

      {result ? (
        <div className="space-y-4">
          <div className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
            <p className="text-sm text-neutral-500">Umur</p>
            <p className="mt-1 text-2xl font-semibold">
              {result.years} tahun {result.months} bulan {result.days} hari
            </p>
          </div>

          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              { label: 'Total bulan', value: result.totalMonths.toLocaleString('id-ID') },
              { label: 'Total minggu', value: result.totalWeeks.toLocaleString('id-ID') },
              { label: 'Total hari', value: result.totalDays.toLocaleString('id-ID') },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"
              >
                <dt className="text-sm text-neutral-500">{item.label}</dt>
                <dd className="mt-1 text-lg font-medium">{item.value}</dd>
              </div>
            ))}
          </dl>

          <div className="rounded-xl border border-neutral-200 bg-white p-5 text-sm dark:border-neutral-800 dark:bg-neutral-900">
            <p>
              Lahir pada hari <strong>{result.weekdayBorn}</strong>.
            </p>
            <p className="mt-1">
              Ulang tahun berikutnya <strong>{formatDate(result.nextBirthday)}</strong>, dalam{' '}
              <strong>{result.daysToNextBirthday}</strong> hari.
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
