export type VehicleType = 'motor' | 'mobil';
export type LoadLevel = 'none' | 'light' | 'medium' | 'full';

export interface TireSize {
  label: string;
  rim: number;
  baseFront: number;
  baseRear: number;
}

const TIRES: Record<VehicleType, TireSize[]> = {
  motor: [
    { label: '80/90-14', rim: 14, baseFront: 28, baseRear: 33 },
    { label: '90/90-14', rim: 14, baseFront: 28, baseRear: 33 },
    { label: '100/80-14', rim: 14, baseFront: 29, baseRear: 34 },
    { label: '70/90-17', rim: 17, baseFront: 26, baseRear: 30 },
    { label: '80/90-17', rim: 17, baseFront: 27, baseRear: 31 },
    { label: '90/80-17', rim: 17, baseFront: 28, baseRear: 32 },
    { label: '100/80-17', rim: 17, baseFront: 29, baseRear: 33 },
    { label: '110/70-17', rim: 17, baseFront: 30, baseRear: 34 },
    { label: '120/70-17', rim: 17, baseFront: 30, baseRear: 35 },
  ],
  mobil: [
    { label: '175/70R13', rim: 13, baseFront: 30, baseRear: 30 },
    { label: '185/65R14', rim: 14, baseFront: 30, baseRear: 30 },
    { label: '185/65R15', rim: 15, baseFront: 31, baseRear: 31 },
    { label: '195/60R15', rim: 15, baseFront: 32, baseRear: 32 },
    { label: '205/55R16', rim: 16, baseFront: 32, baseRear: 32 },
    { label: '215/60R16', rim: 16, baseFront: 33, baseRear: 33 },
    { label: '225/45R17', rim: 17, baseFront: 33, baseRear: 33 },
    { label: '235/65R17', rim: 17, baseFront: 34, baseRear: 34 },
  ],
};

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
}): { front: number; rear: number; notes: string[] } {
  const { vehicle, size, passengers, load } = input;

  const passengerAdjust = PASSENGER_ADJUST[vehicle][passengers];
  if (!passengerAdjust) {
    throw new Error(
      `Jumlah penumpang ${passengers} tidak valid untuk ${VEHICLE_LABEL[vehicle]}.`,
    );
  }

  const notes: string[] = [];
  const cargoAdjust = CARGO_ADJUST[load];
  const extraPassengers = passengers - 1;

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

  let front = size.baseFront + passengerAdjust.front + cargoAdjust.front;
  let rear = size.baseRear + passengerAdjust.rear + cargoAdjust.rear;

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
