import { describe, expect, it } from 'vitest';
import {
  CAR_TYPE_OPTIONS,
  findTire,
  listRims,
  listTires,
  passengerOptions,
  recommendPressure,
  VEHICLE_OPTIONS,
  type CarType,
  type TireSize,
} from './logic';

describe('VEHICLE_OPTIONS', () => {
  it('hanya menyediakan pilihan mobil', () => {
    expect(VEHICLE_OPTIONS).toEqual([{ value: 'mobil', label: 'Mobil' }]);
  });
});

describe('CAR_TYPE_OPTIONS', () => {
  it('mendaftar jenis mobil sesuai urutan dan label', () => {
    expect(CAR_TYPE_OPTIONS).toEqual([
      { value: 'city', label: 'City car' },
      { value: 'hatchback', label: 'Hatchback' },
      { value: 'sedan', label: 'Sedan' },
      { value: 'mpv', label: 'MPV / keluarga' },
      { value: 'suv', label: 'SUV' },
      { value: 'pickup', label: 'Pikap' },
    ]);
  });
});

describe('listRims', () => {
  it('mengembalikan ring motor yang unik dan terurut', () => {
    expect(listRims('motor')).toEqual([14, 17]);
  });

  it('mengembalikan ring mobil yang unik dan terurut', () => {
    expect(listRims('mobil')).toEqual([13, 14, 15, 16, 17, 18, 19, 20, 21, 22]);
  });
});

describe('listTires', () => {
  it('mengembalikan 8 ukuran ban motor untuk ring 17', () => {
    expect(listTires('motor', 17)).toHaveLength(8);
  });

  it.each([
    [13, 5],
    [14, 6],
    [15, 7],
    [16, 8],
    [17, 8],
    [18, 8],
    [19, 8],
    [20, 8],
    [21, 6],
    [22, 6],
  ])('menyediakan ukuran mobil penumpang dan SUV/pikap untuk Ring %i', (rim, count) => {
    expect(listTires('mobil', rim as number)).toHaveLength(count as number);
  });

  it('menyediakan 12 ukuran ban motor secara keseluruhan', () => {
    const total = listRims('motor').reduce(
      (sum, rim) => sum + listTires('motor', rim).length,
      0,
    );
    expect(total).toBe(12);
  });

  it('menyediakan setidaknya 70 ukuran ban mobil secara keseluruhan', () => {
    const total = listRims('mobil').reduce(
      (sum, rim) => sum + listTires('mobil', rim).length,
      0,
    );
    expect(total).toBeGreaterThanOrEqual(70);
  });

  it.each([
    [18, '225/45R18'],
    [19, '245/45R19'],
    [20, '265/50R20'],
    [21, '285/45R21'],
    [22, '285/40R22'],
  ])('menyediakan ukuran %s inci (%s)', (rim, label) => {
    expect(listTires('mobil', rim as number).some((tire) => tire.label === label)).toBe(true);
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

  it('menemukan ban mobil baru 195/50R15', () => {
    expect(findTire('mobil', '195/50R15')).toEqual({
      label: '195/50R15',
      rim: 15,
      baseFront: 32,
      baseRear: 32,
    });
  });

  it('menemukan ban motor baru 140/70-17', () => {
    expect(findTire('motor', '140/70-17')).toEqual({
      label: '140/70-17',
      rim: 17,
      baseFront: 31,
      baseRear: 36,
    });
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

describe('recommendPressure dengan jenis mobil', () => {
  const cityCar: { carType: CarType; label: string; front: number; rear: number }[] = [
    { carType: 'city', label: 'City car', front: 28, rear: 28 },
    { carType: 'hatchback', label: 'Hatchback', front: 29, rear: 29 },
    { carType: 'sedan', label: 'Sedan', front: 30, rear: 30 },
    { carType: 'mpv', label: 'MPV / keluarga', front: 31, rear: 31 },
    { carType: 'suv', label: 'SUV', front: 33, rear: 33 },
    { carType: 'pickup', label: 'Pikap', front: 34, rear: 35 },
  ];

  it.each(cityCar)(
    'menyesuaikan tekanan mobil 185/65R14 untuk $label',
    ({ carType, front, rear }) => {
      const size = findTire('mobil', '185/65R14');
      expect(size).toBeDefined();
      const result = recommendPressure({
        vehicle: 'mobil',
        size: size!,
        passengers: 1,
        load: 'none',
        carType,
      });
      expect(result.front).toBe(front);
      expect(result.rear).toBe(rear);
    },
  );

  it('mencatat penyesuaian positif dengan tanda plus dan label', () => {
    const size = findTire('mobil', '185/65R14');
    const result = recommendPressure({
      vehicle: 'mobil',
      size: size!,
      passengers: 1,
      load: 'none',
      carType: 'suv',
    });
    expect(result.notes).toEqual(['+3 psi: SUV']);
  });

  it('mencatat penyesuaian negatif tanpa tanda plus ganda', () => {
    const size = findTire('mobil', '185/65R14');
    const result = recommendPressure({
      vehicle: 'mobil',
      size: size!,
      passengers: 1,
      load: 'none',
      carType: 'city',
    });
    expect(result.notes).toEqual(['-2 psi: City car']);
  });

  it('mencatat kedua poros saat penyesuaian jenis mobil berbeda', () => {
    const size = findTire('mobil', '185/65R14');
    const result = recommendPressure({
      vehicle: 'mobil',
      size: size!,
      passengers: 1,
      load: 'none',
      carType: 'pickup',
    });
    expect(result.notes).toEqual(['+4 psi: Pikap', '+5 psi: Pikap']);
  });

  it('menggabungkan penyesuaian jenis mobil dengan penumpang dan barang', () => {
    const size = findTire('mobil', '205/55R16');
    expect(size).toBeDefined();
    const result = recommendPressure({
      vehicle: 'mobil',
      size: size!,
      passengers: 3,
      load: 'medium',
      carType: 'suv',
    });
    expect(result.front).toBe(38);
    expect(result.rear).toBe(41);
    expect(result.notes).toEqual([
      '+3 psi: SUV',
      '+1 psi: 2 penumpang tambahan',
      '+3 psi: 2 penumpang tambahan',
      '+2 psi: barang sedang',
      '+3 psi: barang sedang',
    ]);
  });

  it('mengabaikan jenis mobil untuk motor', () => {
    const size = findTire('motor', '90/90-14');
    expect(size).toBeDefined();
    const tanpa = recommendPressure({
      vehicle: 'motor',
      size: size!,
      passengers: 2,
      load: 'medium',
    });
    const dengan = recommendPressure({
      vehicle: 'motor',
      size: size!,
      passengers: 2,
      load: 'medium',
      carType: 'suv',
    });
    expect(dengan).toEqual(tanpa);
    expect(dengan.notes).toEqual(tanpa.notes);
  });

  it('memperlakukan jenis mobil yang tidak diisi sebagai tanpa penyesuaian', () => {
    const size = findTire('mobil', '185/65R14');
    expect(size).toBeDefined();
    const tanpa = recommendPressure({
      vehicle: 'mobil',
      size: size!,
      passengers: 1,
      load: 'none',
    });
    expect(tanpa.front).toBe(30);
    expect(tanpa.rear).toBe(30);
    expect(tanpa.notes).toEqual([]);
  });

  it('tetap membatasi tekanan setelah penyesuaian jenis mobil positif', () => {
    const size = findTire('mobil', '235/65R17');
    expect(size).toBeDefined();
    const result = recommendPressure({
      vehicle: 'mobil',
      size: size!,
      passengers: 5,
      load: 'full',
      carType: 'pickup',
    });
    expect(result.front).toBe(44);
    expect(result.rear).toBe(44);
    expect(result.notes).toContain('Dibatasi ke maksimum 44 psi untuk mobil.');
  });

  it('mengizinkan penyesuaian negatif turun di bawah tekanan dasar', () => {
    const size = findTire('mobil', '185/65R14');
    expect(size).toBeDefined();
    const result = recommendPressure({
      vehicle: 'mobil',
      size: size!,
      passengers: 1,
      load: 'none',
      carType: 'city',
    });
    expect(result.front).toBe(28);
    expect(result.rear).toBe(28);
  });
});
