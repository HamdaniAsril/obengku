import { describe, expect, it } from 'vitest';
import {
  findTire,
  listRims,
  listTires,
  passengerOptions,
  recommendPressure,
  type TireSize,
} from './logic';

describe('listRims', () => {
  it('mengembalikan ring motor yang unik dan terurut', () => {
    expect(listRims('motor')).toEqual([14, 17]);
  });

  it('mengembalikan ring mobil yang unik dan terurut', () => {
    expect(listRims('mobil')).toEqual([13, 14, 15, 16, 17]);
  });
});

describe('listTires', () => {
  it('mengembalikan 6 ukuran ban motor untuk ring 17', () => {
    expect(listTires('motor', 17)).toHaveLength(6);
  });

  it('mengembalikan 1 ukuran ban mobil untuk ring 13', () => {
    expect(listTires('mobil', 13)).toHaveLength(1);
  });
});

describe('findTire', () => {
  it('menemukan ban mobil berdasarkan label', () => {
    expect(findTire('mobil', '205/55R16')).toEqual({
      label: '205/55R16',
      rim: 16,
      baseFront: 32,
      baseRear: 32,
    });
  });

  it('mengembalikan undefined bila label tidak ada di jenis kendaraan itu', () => {
    expect(findTire('motor', '205/55R16')).toBeUndefined();
  });
});

describe('passengerOptions', () => {
  it('motor hanya menawarkan 1 sampai 2 penumpang', () => {
    expect(passengerOptions('motor')).toEqual([1, 2]);
  });

  it('mobil menawarkan 1 sampai 5 penumpang', () => {
    expect(passengerOptions('mobil')).toEqual([1, 2, 3, 4, 5]);
  });
});

describe('recommendPressure', () => {
  it('mengembalikan tekanan dasar motor tanpa penyesuaian', () => {
    const size = findTire('motor', '90/90-14');
    expect(size).toBeDefined();
    const result = recommendPressure({
      vehicle: 'motor',
      size: size!,
      passengers: 1,
      load: 'none',
    });
    expect(result.front).toBe(28);
    expect(result.rear).toBe(33);
    expect(result.notes).toEqual([]);
  });

  it('mengembalikan tekanan dasar mobil tanpa penyesuaian', () => {
    const size = findTire('mobil', '185/65R14');
    expect(size).toBeDefined();
    const result = recommendPressure({
      vehicle: 'mobil',
      size: size!,
      passengers: 1,
      load: 'none',
    });
    expect(result.front).toBe(30);
    expect(result.rear).toBe(30);
    expect(result.notes).toEqual([]);
  });

  it('menambahkan penumpang dan barang pada motor', () => {
    const size = findTire('motor', '90/90-14');
    expect(size).toBeDefined();
    const result = recommendPressure({
      vehicle: 'motor',
      size: size!,
      passengers: 2,
      load: 'medium',
    });
    expect(result.front).toBe(31);
    expect(result.rear).toBe(39);
  });

  it('membatasi tekanan belakang motor ke maksimum dan mencatatnya', () => {
    const size = findTire('motor', '120/70-17');
    expect(size).toBeDefined();
    const result = recommendPressure({
      vehicle: 'motor',
      size: size!,
      passengers: 2,
      load: 'full',
    });
    expect(result.front).toBe(34);
    expect(result.rear).toBe(41);
    expect(result.notes.some((note) => note.includes('maksimum 41 psi'))).toBe(true);
  });

  it('menambahkan penumpang dan barang ringan pada mobil', () => {
    const size = findTire('mobil', '205/55R16');
    expect(size).toBeDefined();
    const result = recommendPressure({
      vehicle: 'mobil',
      size: size!,
      passengers: 3,
      load: 'light',
    });
    expect(result.front).toBe(34);
    expect(result.rear).toBe(37);
  });

  it('membiarkan tekanan mobil tepat di batas maksimum tanpa catatan', () => {
    const size = findTire('mobil', '235/65R17');
    expect(size).toBeDefined();
    const result = recommendPressure({
      vehicle: 'mobil',
      size: size!,
      passengers: 5,
      load: 'full',
    });
    expect(result.front).toBe(40);
    expect(result.rear).toBe(44);
    expect(result.notes.some((note) => note.includes('maksimum'))).toBe(false);
  });

  it('menambahkan satu penumpang tambahan pada motor tanpa barang', () => {
    const size = findTire('motor', '90/90-14');
    expect(size).toBeDefined();
    const result = recommendPressure({
      vehicle: 'motor',
      size: size!,
      passengers: 2,
      load: 'none',
    });
    expect(result.front).toBe(29);
    expect(result.rear).toBe(36);
  });

  it('melempar error untuk jumlah penumpang yang tidak valid pada motor', () => {
    const size = findTire('motor', '90/90-14');
    expect(size).toBeDefined();
    expect(() =>
      recommendPressure({
        vehicle: 'motor',
        size: size!,
        passengers: 3,
        load: 'none',
      }),
    ).toThrow('Jumlah penumpang 3 tidak valid untuk motor.');
  });
});

describe('recommendPressure — batas tekanan maksimum', () => {
  const synthetic: TireSize = {
    label: 'synthetic',
    rim: 17,
    baseFront: 50,
    baseRear: 50,
  };

  it('membatasi tekanan depan dan belakang motor ke 41 psi', () => {
    const result = recommendPressure({
      vehicle: 'motor',
      size: synthetic,
      passengers: 1,
      load: 'none',
    });
    expect(result.front).toBe(41);
    expect(result.rear).toBe(41);
    expect(result.notes).toEqual([
      'Dibatasi ke maksimum 41 psi untuk motor.',
    ]);
  });

  it('membatasi tekanan depan dan belakang mobil ke 44 psi', () => {
    const result = recommendPressure({
      vehicle: 'mobil',
      size: synthetic,
      passengers: 1,
      load: 'none',
    });
    expect(result.front).toBe(44);
    expect(result.rear).toBe(44);
    expect(result.notes).toEqual([
      'Dibatasi ke maksimum 44 psi untuk mobil.',
    ]);
  });

  it('hanya mencatat batas maksimum sekali walau kedua poros dibatasi', () => {
    const result = recommendPressure({
      vehicle: 'mobil',
      size: synthetic,
      passengers: 5,
      load: 'full',
    });
    expect(result.front).toBe(44);
    expect(result.rear).toBe(44);
    expect(result.notes.filter((note) => note.includes('maksimum'))).toEqual([
      'Dibatasi ke maksimum 44 psi untuk mobil.',
    ]);
  });
});
