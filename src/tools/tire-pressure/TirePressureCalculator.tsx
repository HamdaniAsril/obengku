'use client';

import { useState } from 'react';
import { StarStamp } from '@/components/StarStamp';
import {
  CAR_TYPE_OPTIONS,
  listRims,
  listTires,
  passengerOptions,
  recommendPressure,
  type CarType,
  type LoadLevel,
} from './logic';

const DEFAULT_CAR_TYPE: CarType = 'sedan';
const VEHICLE = 'mobil' as const;

const LOAD_OPTIONS: { value: LoadLevel; label: string }[] = [
  { value: 'none', label: 'Tidak ada' },
  { value: 'light', label: 'Ringan' },
  { value: 'medium', label: 'Sedang' },
  { value: 'full', label: 'Penuh' },
];

function firstRim(): number {
  return listRims(VEHICLE)[0];
}

function firstTireLabel(rim: number): string {
  return listTires(VEHICLE, rim)[0].label;
}

function passengerLabel(passengers: number): string {
  return passengers === 1 ? '1 (hanya pengemudi)' : String(passengers);
}

export function TirePressureCalculator() {
  const [rim, setRim] = useState<number>(firstRim());
  const [tireLabel, setTireLabel] = useState<string>(firstTireLabel(firstRim()));
  const [passengers, setPassengers] = useState<number>(1);
  const [load, setLoad] = useState<LoadLevel>('none');
  const [carType, setCarType] = useState<CarType>(DEFAULT_CAR_TYPE);

  const rims = listRims(VEHICLE);
  const tires = listTires(VEHICLE, rim);
  const passengersList = passengerOptions(VEHICLE);

  const handleRimChange = (next: number) => {
    setRim(next);
    setTireLabel(firstTireLabel(next));
  };

  const selectedTire = tires.find((tire) => tire.label === tireLabel) ?? tires[0];
  const result = recommendPressure({
    vehicle: VEHICLE,
    size: selectedTire,
    passengers,
    load,
    carType,
  });

  return (
    <div className="space-y-6">
      <div className="space-y-6">
        <fieldset className="space-y-3">
          <legend className="text-sm font-semibold">Jenis mobil</legend>
          <div className="flex flex-wrap gap-2">
            {CAR_TYPE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                aria-pressed={carType === option.value}
                onClick={() => setCarType(option.value)}
                className={`btn ${carType === option.value ? 'btn-primary' : 'btn-ghost'}`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="space-y-3">
          <legend className="text-sm font-semibold">Ukuran velg</legend>
          <div className="flex flex-wrap gap-2">
            {rims.map((item) => (
              <button
                key={item}
                type="button"
                aria-pressed={rim === item}
                onClick={() => handleRimChange(item)}
                className={`btn min-w-20 ${rim === item ? 'btn-primary' : 'btn-ghost'}`}
              >
                Ring {item}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="space-y-3">
          <legend className="text-sm font-semibold">Ukuran ban</legend>
          <div className="flex flex-wrap gap-2">
            {tires.map((tire) => (
              <button
                key={tire.label}
                type="button"
                aria-pressed={tireLabel === tire.label}
                onClick={() => setTireLabel(tire.label)}
                className={`btn ${tireLabel === tire.label ? 'btn-primary' : 'btn-ghost'}`}
              >
                {tire.label}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="jumlah-penumpang" className="block text-sm font-semibold">
              Jumlah penumpang
            </label>
            <select
              id="jumlah-penumpang"
              value={passengers}
              onChange={(event) => setPassengers(Number(event.target.value))}
              className="field"
            >
              {passengersList.map((item) => (
                <option key={item} value={item}>
                  {passengerLabel(item)}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="barang-bawaan" className="block text-sm font-semibold">
              Barang bawaan
            </label>
            <select
              id="barang-bawaan"
              value={load}
              onChange={(event) => setLoad(event.target.value as LoadLevel)}
              className="field"
            >
              {LOAD_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="result-card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-semibold text-muted">Rekomendasi tekanan</p>
          <StarStamp key={`${result.front}-${result.rear}`} />
        </div>
        <dl className="ledger mt-2 sm:max-w-sm">
          <div>
            <dt>Depan</dt>
            <dd className="font-display text-2xl">{result.front} psi</dd>
          </div>
          <div>
            <dt>Belakang</dt>
            <dd className="font-display text-2xl">{result.rear} psi</dd>
          </div>
        </dl>
        {result.notes.length > 0 ? (
          <ul className="mt-4 space-y-1 text-sm text-muted">
            {result.notes.map((note) => (
              <li key={note}>• {note}</li>
            ))}
          </ul>
        ) : null}
      </div>

      <p className="max-w-prose text-sm text-muted">
        Angka ini adalah estimasi dari tabel umum, bukan data dari produsen kendaraan.
        Selalu periksa stiker tekanan angin di kendaraan Anda sebelum mengisi ban.
      </p>
    </div>
  );
}
