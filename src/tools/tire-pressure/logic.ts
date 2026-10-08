export type VehicleType = 'motor' | 'mobil';
export type LoadLevel = 'none' | 'light' | 'medium' | 'full';
export type CarType = 'city' | 'hatchback' | 'sedan' | 'mpv' | 'suv' | 'pickup';

export const VEHICLE_OPTIONS: { value: 'mobil'; label: string }[] = [
  { value: 'mobil', label: 'Mobil' },
];

export interface TireSize {
  label: string;
  rim: number;
  baseFront: number;
  baseRear: number;
}

const TIRES: Record<VehicleType, TireSize[]> = {
  motor: [
    { label: '80/90-14', rim: 14, baseFront: 28, baseRear: 33 },
    { label: '90/80-14', rim: 14, baseFront: 29, baseRear: 34 },
    { label: '90/90-14', rim: 14, baseFront: 28, baseRear: 33 },
    { label: '100/80-14', rim: 14, baseFront: 29, baseRear: 34 },
    { label: '70/90-17', rim: 17, baseFront: 26, baseRear: 30 },
    { label: '80/90-17', rim: 17, baseFront: 27, baseRear: 31 },
    { label: '90/80-17', rim: 17, baseFront: 28, baseRear: 32 },
    { label: '100/80-17', rim: 17, baseFront: 29, baseRear: 33 },
    { label: '110/70-17', rim: 17, baseFront: 30, baseRear: 34 },
    { label: '120/70-17', rim: 17, baseFront: 30, baseRear: 35 },
    { label: '130/70-17', rim: 17, baseFront: 30, baseRear: 36 },
    { label: '140/70-17', rim: 17, baseFront: 31, baseRear: 36 },
  ],
  mobil: [
    { label: '175/70R13', rim: 13, baseFront: 30, baseRear: 30 },
    { label: '175/65R13', rim: 13, baseFront: 30, baseRear: 30 },
    { label: '185/70R13', rim: 13, baseFront: 30, baseRear: 30 },
    { label: '155/80R13', rim: 13, baseFront: 29, baseRear: 29 },
    { label: '185/60R13', rim: 13, baseFront: 30, baseRear: 30 },
    { label: '185/65R14', rim: 14, baseFront: 30, baseRear: 30 },
    { label: '175/65R14', rim: 14, baseFront: 30, baseRear: 30 },
    { label: '195/70R14', rim: 14, baseFront: 32, baseRear: 32 },
    { label: '165/65R14', rim: 14, baseFront: 30, baseRear: 30 },
    { label: '185/70R14', rim: 14, baseFront: 30, baseRear: 30 },
    { label: '205/70R14', rim: 14, baseFront: 32, baseRear: 32 },
    { label: '185/65R15', rim: 15, baseFront: 31, baseRear: 31 },
    { label: '195/60R15', rim: 15, baseFront: 32, baseRear: 32 },
    { label: '195/50R15', rim: 15, baseFront: 32, baseRear: 32 },
    { label: '195/65R15', rim: 15, baseFront: 32, baseRear: 32 },
    { label: '205/65R15', rim: 15, baseFront: 33, baseRear: 33 },
    { label: '215/65R15', rim: 15, baseFront: 33, baseRear: 33 },
    { label: '235/75R15', rim: 15, baseFront: 35, baseRear: 35 },
    { label: '205/55R16', rim: 16, baseFront: 32, baseRear: 32 },
    { label: '215/60R16', rim: 16, baseFront: 33, baseRear: 33 },
    { label: '205/60R16', rim: 16, baseFront: 33, baseRear: 33 },
    { label: '215/65R16', rim: 16, baseFront: 34, baseRear: 34 },
    { label: '195/55R16', rim: 16, baseFront: 32, baseRear: 32 },
    { label: '225/60R16', rim: 16, baseFront: 34, baseRear: 34 },
    { label: '235/70R16', rim: 16, baseFront: 35, baseRear: 35 },
    { label: '265/70R16', rim: 16, baseFront: 36, baseRear: 36 },
    { label: '225/45R17', rim: 17, baseFront: 33, baseRear: 33 },
    { label: '235/65R17', rim: 17, baseFront: 34, baseRear: 34 },
    { label: '215/55R17', rim: 17, baseFront: 33, baseRear: 33 },
    { label: '225/55R17', rim: 17, baseFront: 33, baseRear: 33 },
    { label: '205/50R17', rim: 17, baseFront: 33, baseRear: 33 },
    { label: '245/65R17', rim: 17, baseFront: 35, baseRear: 35 },
    { label: '265/65R17', rim: 17, baseFront: 36, baseRear: 36 },
    { label: '285/70R17', rim: 17, baseFront: 37, baseRear: 37 },
    { label: '225/45R18', rim: 18, baseFront: 33, baseRear: 33 },
    { label: '235/50R18', rim: 18, baseFront: 34, baseRear: 34 },
    { label: '215/45R18', rim: 18, baseFront: 33, baseRear: 33 },
    { label: '225/55R18', rim: 18, baseFront: 34, baseRear: 34 },
    { label: '235/60R18', rim: 18, baseFront: 35, baseRear: 35 },
    { label: '255/55R18', rim: 18, baseFront: 36, baseRear: 36 },
    { label: '265/60R18', rim: 18, baseFront: 36, baseRear: 36 },
    { label: '285/60R18', rim: 18, baseFront: 37, baseRear: 37 },
    { label: '245/45R19', rim: 19, baseFront: 34, baseRear: 34 },
    { label: '255/50R19', rim: 19, baseFront: 35, baseRear: 35 },
    { label: '225/40R19', rim: 19, baseFront: 34, baseRear: 34 },
    { label: '235/55R19', rim: 19, baseFront: 35, baseRear: 35 },
    { label: '255/55R19', rim: 19, baseFront: 36, baseRear: 36 },
    { label: '265/50R19', rim: 19, baseFront: 36, baseRear: 36 },
    { label: '275/55R19', rim: 19, baseFront: 37, baseRear: 37 },
    { label: '285/45R19', rim: 19, baseFront: 37, baseRear: 37 },
    { label: '245/40R20', rim: 20, baseFront: 35, baseRear: 35 },
    { label: '265/50R20', rim: 20, baseFront: 36, baseRear: 36 },
    { label: '235/45R20', rim: 20, baseFront: 35, baseRear: 35 },
    { label: '255/45R20', rim: 20, baseFront: 36, baseRear: 36 },
    { label: '275/45R20', rim: 20, baseFront: 37, baseRear: 37 },
    { label: '275/55R20', rim: 20, baseFront: 37, baseRear: 37 },
    { label: '285/50R20', rim: 20, baseFront: 38, baseRear: 38 },
    { label: '305/50R20', rim: 20, baseFront: 39, baseRear: 39 },
    { label: '275/40R21', rim: 21, baseFront: 36, baseRear: 36 },
    { label: '285/45R21', rim: 21, baseFront: 37, baseRear: 37 },
    { label: '255/40R21', rim: 21, baseFront: 36, baseRear: 36 },
    { label: '265/45R21', rim: 21, baseFront: 37, baseRear: 37 },
    { label: '295/35R21', rim: 21, baseFront: 38, baseRear: 38 },
    { label: '315/35R21', rim: 21, baseFront: 39, baseRear: 39 },
    { label: '285/40R22', rim: 22, baseFront: 37, baseRear: 37 },
    { label: '305/40R22', rim: 22, baseFront: 38, baseRear: 38 },
    { label: '265/35R22', rim: 22, baseFront: 37, baseRear: 37 },
    { label: '275/40R22', rim: 22, baseFront: 37, baseRear: 37 },
    { label: '305/35R22', rim: 22, baseFront: 39, baseRear: 39 },
    { label: '325/35R22', rim: 22, baseFront: 40, baseRear: 40 },
  ],
};

export const CAR_TYPE_OPTIONS: { value: CarType; label: string }[] = [
  { value: 'city', label: 'City car' },
  { value: 'hatchback', label: 'Hatchback' },
  { value: 'sedan', label: 'Sedan' },
  { value: 'mpv', label: 'MPV / keluarga' },
  { value: 'suv', label: 'SUV' },
  { value: 'pickup', label: 'Pikap' },
];

const CAR_TYPE_LABEL: Record<CarType, string> = {
  city: 'City car',
  hatchback: 'Hatchback',
  sedan: 'Sedan',
  mpv: 'MPV / keluarga',
  suv: 'SUV',
  pickup: 'Pikap',
};

const CAR_TYPE_ADJUST: Record<CarType, AxleAdjustment> = {
  city: { front: -2, rear: -2 },
  hatchback: { front: -1, rear: -1 },
  sedan: { front: 0, rear: 0 },
  mpv: { front: 1, rear: 1 },
  suv: { front: 3, rear: 3 },
  pickup: { front: 4, rear: 5 },
};

const NO_ADJUSTMENT: AxleAdjustment = { front: 0, rear: 0 };

const PRESSURE_CAP: Record<VehicleType, number> = {
  motor: 41,
  mobil: 44,
};

const VEHICLE_LABEL: Record<VehicleType, string> = {
  motor: 'motor',
  mobil: 'mobil',
};

interface AxleAdjustment {
  front: number;
  rear: number;
}

const PASSENGER_ADJUST: Record<VehicleType, Record<number, AxleAdjustment>> = {
  motor: {
    1: { front: 0, rear: 0 },
    2: { front: 1, rear: 3 },
  },
  mobil: {
    1: { front: 0, rear: 0 },
    2: { front: 0, rear: 2 },
    3: { front: 1, rear: 3 },
    4: { front: 2, rear: 4 },
    5: { front: 3, rear: 5 },
  },
};

const CARGO_ADJUST: Record<LoadLevel, AxleAdjustment> = {
  none: { front: 0, rear: 0 },
  light: { front: 1, rear: 2 },
  medium: { front: 2, rear: 3 },
  full: { front: 3, rear: 5 },
};

const CARGO_LABEL: Record<LoadLevel, string> = {
  none: 'tidak ada',
  light: 'ringan',
  medium: 'sedang',
  full: 'penuh',
};

function adjustmentNote(psi: number, label: string): string {
  return `${psi > 0 ? '+' : ''}${psi} psi: ${label}`;
}

export function listRims(vehicle: VehicleType): number[] {
  return [...new Set(TIRES[vehicle].map((tire) => tire.rim))].sort((a, b) => a - b);
}

export function listTires(vehicle: VehicleType, rim: number): TireSize[] {
  return TIRES[vehicle].filter((tire) => tire.rim === rim);
}

export function findTire(vehicle: VehicleType, label: string): TireSize | undefined {
  return TIRES[vehicle].find((tire) => tire.label === label);
}

export function passengerOptions(vehicle: VehicleType): number[] {
  return Object.keys(PASSENGER_ADJUST[vehicle])
    .map(Number)
    .sort((a, b) => a - b);
}

export function recommendPressure(input: {
  vehicle: VehicleType;
  size: TireSize;
  passengers: number;
  load: LoadLevel;
  carType?: CarType;
}): { front: number; rear: number; notes: string[] } {
  const { vehicle, size, passengers, load } = input;

  const passengerAdjust = PASSENGER_ADJUST[vehicle][passengers];
  if (!passengerAdjust) {
    throw new Error(
      `Jumlah penumpang ${passengers} tidak valid untuk ${VEHICLE_LABEL[vehicle]}.`,
    );
  }

  const carTypeAdjust =
    vehicle === 'mobil' && input.carType
      ? CAR_TYPE_ADJUST[input.carType]
      : NO_ADJUSTMENT;
  const carTypeLabel =
    vehicle === 'mobil' && input.carType ? CAR_TYPE_LABEL[input.carType] : '';

  const notes: string[] = [];
  const cargoAdjust = CARGO_ADJUST[load];
  const extraPassengers = passengers - 1;

  if (carTypeAdjust.front !== 0) {
    notes.push(adjustmentNote(carTypeAdjust.front, carTypeLabel));
  }
  if (carTypeAdjust.rear !== 0) {
    const carTypeNote = adjustmentNote(carTypeAdjust.rear, carTypeLabel);
    if (!notes.includes(carTypeNote)) {
      notes.push(carTypeNote);
    }
  }
  if (passengerAdjust.front !== 0) {
    notes.push(`+${passengerAdjust.front} psi: ${extraPassengers} penumpang tambahan`);
  }
  if (passengerAdjust.rear !== 0) {
    notes.push(`+${passengerAdjust.rear} psi: ${extraPassengers} penumpang tambahan`);
  }
  if (cargoAdjust.front !== 0) {
    notes.push(`+${cargoAdjust.front} psi: barang ${CARGO_LABEL[load]}`);
  }
  if (cargoAdjust.rear !== 0) {
    notes.push(`+${cargoAdjust.rear} psi: barang ${CARGO_LABEL[load]}`);
  }

  let front =
    size.baseFront + carTypeAdjust.front + passengerAdjust.front + cargoAdjust.front;
  let rear =
    size.baseRear + carTypeAdjust.rear + passengerAdjust.rear + cargoAdjust.rear;

  const cap = PRESSURE_CAP[vehicle];
  const capNote = `Dibatasi ke maksimum ${cap} psi untuk ${VEHICLE_LABEL[vehicle]}.`;
  if (front > cap) {
    front = cap;
    if (!notes.includes(capNote)) {
      notes.push(capNote);
    }
  }
  if (rear > cap) {
    rear = cap;
    if (!notes.includes(capNote)) {
      notes.push(capNote);
    }
  }

  return { front: Math.round(front), rear: Math.round(rear), notes };
}
