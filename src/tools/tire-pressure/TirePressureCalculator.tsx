'use client';

import { useMemo, useState } from 'react';
import {
  CAR_TYPE_OPTIONS,
  findTire,
  listRims,
  listTires,
  passengerOptions,
  recommendPressure,
  type CarType,
  type LoadLevel,
  type VehicleType,
} from './logic';

const DEFAULT_VEHICLE: VehicleType = 'motor';
const DEFAULT_CAR_TYPE: CarType = 'sedan';

const LOAD_OPTIONS: { value: LoadLevel; label: string }[] = [
  { value: 'none', label: 'Tidak ada' },
  { value: 'light', label: 'Ringan' },
  { value: 'medium', label: 'Sedang' },
  { value: 'full', label: 'Penuh' },
];

function firstRim(vehicle: VehicleType): number {
  return listRims(vehicle)[0];
}

function firstTireLabel(vehicle: VehicleType, rim: number): string {
  return listTires(vehicle, rim)[0].label;
}

function passengerLabel(passengers: number): string {
  return passengers === 1 ? '1 (hanya pengemudi)' : String(passengers);
}

export function TirePressureCalculator() {
  const [vehicle, setVehicle] = useState<VehicleType>(DEFAULT_VEHICLE);
  const [rim, setRim] = useState<number>(firstRim(DEFAULT_VEHICLE));
  const [tireLabel, setTireLabel] = useState<string>(
    firstTireLabel(DEFAULT_VEHICLE, firstRim(DEFAULT_VEHICLE)),
  );
  const [passengers, setPassengers] = useState<number>(1);
  const [load, setLoad] = useState<LoadLevel>('none');
  const [carType, setCarType] = useState<CarType>(DEFAULT_CAR_TYPE);

  const rims = listRims(vehicle);
  const tires = listTires(vehicle, rim);
  const passengersList = passengerOptions(vehicle);

  const handleVehicleChange = (next: VehicleType) => {
    const nextRim = firstRim(next);
    setVehicle(next);
    setRim(nextRim);
    setTireLabel(firstTireLabel(next, nextRim));
    setPassengers(passengerOptions(next)[0]);
    setCarType(DEFAULT_CAR_TYPE);
  };

  const handleRimChange = (next: number) => {
    setRim(next);
    setTireLabel(firstTireLabel(vehicle, next));
  };

  const { result, error } = useMemo(() => {
    const size = findTire(vehicle, tireLabel);
    if (!size) {
      return { result: null, error: 'Ukuran ban tidak dikenali.' };
    }
    try {
      return {
        result: recommendPressure({
          vehicle,
          size,
          passengers,
          load,
          ...(vehicle === 'mobil' ? { carType } : {}),
        }),
        error: null,
      };
    } catch (err) {
      return {
        result: null,
        error: err instanceof Error ? err.message : 'Terjadi kesalahan.',
      };
    }
  }, [vehicle, tireLabel, passengers, load, carType]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="jenis-kendaraan" className="block text-sm font-medium">
            Jenis kendaraan
          </label>
          <select
            id="jenis-kendaraan"
            value={vehicle}
            onChange={(event) => handleVehicleChange(event.target.value as VehicleType)}
            className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
          >
            <option value="motor">Motor</option>
            <option value="mobil">Mobil</option>
          </select>
        </div>

        {vehicle === 'mobil' ? (
          <div className="space-y-2">
            <label htmlFor="jenis-mobil" className="block text-sm font-medium">
              Jenis mobil
            </label>
            <select
              id="jenis-mobil"
              value={carType}
              onChange={(event) => setCarType(event.target.value as CarType)}
              className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
            >
              {CAR_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        <div className="space-y-2">
          <label htmlFor="ukuran-velg" className="block text-sm font-medium">
            Ukuran velg
          </label>
          <select
            id="ukuran-velg"
            value={rim}
            onChange={(event) => handleRimChange(Number(event.target.value))}
            className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
          >
            {rims.map((item) => (
              <option key={item} value={item}>
                Ring {item}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="ukuran-ban" className="block text-sm font-medium">
            Ukuran ban
          </label>
          <select
            id="ukuran-ban"
            value={tireLabel}
            onChange={(event) => setTireLabel(event.target.value)}
            className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
          >
            {tires.map((tire) => (
              <option key={tire.label} value={tire.label}>
                {tire.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="jumlah-penumpang" className="block text-sm font-medium">
            Jumlah penumpang
          </label>
          <select
            id="jumlah-penumpang"
            value={passengers}
            onChange={(event) => setPassengers(Number(event.target.value))}
            className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
          >
            {passengersList.map((item) => (
              <option key={item} value={item}>
                {passengerLabel(item)}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="barang-bawaan" className="block text-sm font-medium">
            Barang bawaan
          </label>
          <select
            id="barang-bawaan"
            value={load}
            onChange={(event) => setLoad(event.target.value as LoadLevel)}
            className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
          >
            {LOAD_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
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
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
              <dt className="text-sm text-neutral-500">Depan</dt>
              <dd className="mt-1 text-2xl font-semibold">{result.front} psi</dd>
            </div>
            <div className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
              <dt className="text-sm text-neutral-500">Belakang</dt>
              <dd className="mt-1 text-2xl font-semibold">{result.rear} psi</dd>
            </div>
          </dl>
        </div>
      ) : null}

      <p className="text-sm text-neutral-500">
        Angka ini adalah estimasi dari tabel umum, bukan data dari produsen kendaraan.
        Selalu periksa stiker tekanan angin di kendaraan Anda sebelum mengisi ban.
      </p>
    </div>
  );
}
