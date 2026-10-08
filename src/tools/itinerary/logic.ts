/**
 * Logika murni Itinerary Generator.
 *
 * Semua tanggal dipakai sebagai string "YYYY-MM-DD" (lokal, bukan UTC) dan
 * semua waktu sebagai "HH:MM" 24 jam dari <input type="date">/"time".
 * Tidak ada yang membaca jam sistem di sini — komponen yang menyuntikkan
 * nilai mentah, logic yang menentukan bentuk harinya.
 */

export interface Activity {
  id: string;
  /** "YYYY-MM-DD" — hari tempat aktivitas ini berada. */
  date: string;
  title: string;
  /** "HH:MM" — jam mulai. */
  time: string;
  durationMin: number;
  note: string;
}

export interface Trip {
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  activities: Activity[];
}

export interface TripDay {
  /** Nomor hari mulai dari 1. */
  index: number;
  date: string;
  /** "Rabu, 27 September 2026" */
  label: string;
  /** "27 Sep 2026" */
  shortLabel: string;
}

const WEEKDAYS = [
  'Minggu',
  'Senin',
  'Selasa',
  'Rabu',
  'Kamis',
  'Jumat',
  'Sabtu',
] as const;

const MONTHS = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
] as const;

const MONTHS_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'Mei',
  'Jun',
  'Jul',
  'Agu',
  'Sep',
  'Okt',
  'Nov',
  'Des',
] as const;

/** Batas jumlah hari sekali rencana; mencegah rentang tanggal menghasilkan ribuan hari. */
export const MAX_TRIP_DAYS = 365;

const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;

/** Mem-parse "YYYY-MM-DD" sebagai tanggal lokal; null bila bukan tanggal nyata. */
export function parseDateInput(value: string): Date | null {
  const match = DATE_RE.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);
  // 2026-02-31 digeser otomatis oleh Date ke Maret, jadi harus dicek ulang.
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }
  return date;
}

export function isValidDateString(value: string): boolean {
  return parseDateInput(value) !== null;
}

export function isValidTimeString(value: string): boolean {
  return TIME_RE.test(value);
}

/** Mengubah Date menjadi "YYYY-MM-DD" untuk <input type="date">. */
export function toDateInputValue(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function addDays(date: Date, amount: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount);
}

/** Selisih hari kalender (b - a), tanpa komponen jam. */
export function diffInDays(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / (24 * 60 * 60 * 1000));
}

export function formatDateFull(value: string): string {
  const date = parseDateInput(value);
  if (!date) return '';
  return `${WEEKDAYS[date.getDay()]}, ${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

export function formatDateShort(value: string): string {
  const date = parseDateInput(value);
  if (!date) return '';
  return `${date.getDate()} ${MONTHS_SHORT[date.getMonth()]} ${date.getFullYear()}`;
}

/**
 * Membuat daftar hari otomatis Day 1–N dari tanggal mulai sampai akhir.
 * Mengembalikan [] bila tanggal tidak valid, akhir sebelum mulai, atau
 * rentangnya melebihi MAX_TRIP_DAYS.
 */
export function buildDays(startDate: string, endDate: string): TripDay[] {
  const start = parseDateInput(startDate);
  const end = parseDateInput(endDate);
  if (!start || !end) return [];

  const total = diffInDays(start, end);
  if (total < 0 || total + 1 > MAX_TRIP_DAYS) return [];

  const days: TripDay[] = [];
  for (let i = 0; i <= total; i += 1) {
    const date = addDays(start, i);
    const iso = toDateInputValue(date);
    days.push({
      index: i + 1,
      date: iso,
      label: formatDateFull(iso),
      shortLabel: formatDateShort(iso),
    });
  }
  return days;
}

/** Salinan daftar aktivitas yang terurut menaik berdasarkan jam mulai. */
export function sortActivities(activities: readonly Activity[]): Activity[] {
  return [...activities].sort((a, b) => {
    const at = isValidTimeString(a.time) ? a.time : '99:99';
    const bt = isValidTimeString(b.time) ? b.time : '99:99';
    if (at !== bt) return at < bt ? -1 : 1;
    return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
  });
}

export function activitiesOn(
  activities: readonly Activity[],
  date: string,
): Activity[] {
  return sortActivities(activities.filter((activity) => activity.date === date));
}

/** Aktivitas yang jatuh di luar rentang tanggal trip (bisa terjadi setelah tanggal diubah). */
export function outOfRangeActivities(trip: Trip): Activity[] {
  const days = buildDays(trip.startDate, trip.endDate);
  if (days.length === 0) return [...trip.activities];
  const valid = new Set(days.map((day) => day.date));
  return trip.activities.filter((activity) => !valid.has(activity.date));
}

/** "1 j 30 m" · "45 m" · "2 j" · "0 m" */
export function formatDuration(totalMinutes: number): string {
  const minutes = Math.max(0, Math.round(totalMinutes));
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) return `${rest} m`;
  if (rest === 0) return `${hours} j`;
  return `${hours} j ${rest} m`;
}

/** "09.00" — format jam gaya Indonesia (titik, bukan titik dua). */
export function formatClock(minutesFromMidnight: number): string {
  const normalized = ((minutesFromMidnight % (24 * 60)) + 24 * 60) % (24 * 60);
  const h = Math.floor(normalized / 60);
  const m = normalized % 60;
  return `${String(h).padStart(2, '0')}.${String(m).padStart(2, '0')}`;
}

/**
 * "09.00–10.30" — rentang jam dari jam mulai + durasi.
 * Durasi nol menghasilkan jam mulai saja. Jam melewati tengah malam dibungkus.
 */
export function timeRange(time: string, durationMin: number): string {
  const match = TIME_RE.exec(time);
  if (!match) return time;
  const startMinutes = Number(match[1]) * 60 + Number(match[2]);
  const start = formatClock(startMinutes);
  if (durationMin <= 0) return start;
  return `${start}–${formatClock(startMinutes + Math.round(durationMin))}`;
}

/** "09:00" -> 540; null bila bukan jam valid. */
export function parseTimeToMinutes(time: string): number | null {
  const match = TIME_RE.exec(time);
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
}

export function emptyTrip(): Trip {
  return {
    name: '',
    destination: '',
    startDate: '',
    endDate: '',
    activities: [],
  };
}

export function tripStats(trip: Trip): { days: number; activities: number } {
  return {
    days: buildDays(trip.startDate, trip.endDate).length,
    activities: trip.activities.length,
  };
}

/** Galat validasi trip, dalam Bahasa Indonesia. [] berarti lolos. */
export function validateTrip(trip: Trip): string[] {
  const errors: string[] = [];
  const start = parseDateInput(trip.startDate);
  const end = parseDateInput(trip.endDate);

  if (!trip.startDate || !trip.endDate) {
    errors.push('Isi tanggal mulai dan akhir trip.');
    return errors;
  }
  if (!start || !end) {
    errors.push('Tanggal tidak valid.');
    return errors;
  }
  if (diffInDays(start, end) < 0) {
    errors.push('Tanggal akhir tidak boleh sebelum tanggal mulai.');
  } else if (diffInDays(start, end) + 1 > MAX_TRIP_DAYS) {
    errors.push(`Rentang trip maksimal ${MAX_TRIP_DAYS} hari.`);
  }
  return errors;
}

export interface ActivityDraft {
  date: string;
  title: string;
  time: string;
  durationText: string;
  note: string;
}

/** Galat validasi satu aktivitas. */
export function validateActivity(draft: ActivityDraft): string[] {
  const errors: string[] = [];
  if (!draft.title.trim()) errors.push('Judul aktivitas wajib diisi.');
  if (!isValidDateString(draft.date)) errors.push('Pilih hari aktivitas.');
  if (!isValidTimeString(draft.time)) errors.push('Jam mulai tidak valid.');
  const duration = Number(draft.durationText);
  if (
    draft.durationText.trim() === '' ||
    !Number.isFinite(duration) ||
    !Number.isInteger(duration) ||
    duration < 0
  ) {
    errors.push('Durasi harus bilangan bulat menit ≥ 0.');
  }
  return errors;
}

/** Mengubah draft valid menjadi Activity. Hanya dipanggil setelah validateActivity lolos. */
export function draftToActivity(draft: ActivityDraft, id: string): Activity {
  return {
    id,
    date: draft.date,
    title: draft.title.trim(),
    time: draft.time,
    durationMin: Number(draft.durationText),
    note: draft.note.trim(),
  };
}

export function newActivityDraft(date: string): ActivityDraft {
  return { date, title: '', time: '09:00', durationText: '60', note: '' };
}

export function activityToDraft(activity: Activity): ActivityDraft {
  return {
    date: activity.date,
    title: activity.title,
    time: activity.time,
    durationText: String(activity.durationMin),
    note: activity.note,
  };
}

export function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function serializeTrip(trip: Trip): string {
  return JSON.stringify(trip);
}

/**
 * Mem-parse JSON tersimpan kembali menjadi Trip.
 * Bungkus semua kegagalan — data rusak jangan sampai merusak tool.
 */
export function parseTrip(raw: string | null | undefined): Trip | null {
  if (!raw) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (typeof parsed !== 'object' || parsed === null) return null;
  const value = parsed as Record<string, unknown>;

  const name = typeof value.name === 'string' ? value.name : null;
  const destination = typeof value.destination === 'string' ? value.destination : null;
  const startDate = typeof value.startDate === 'string' ? value.startDate : null;
  const endDate = typeof value.endDate === 'string' ? value.endDate : null;
  if (
    name === null ||
    destination === null ||
    startDate === null ||
    endDate === null
  ) {
    return null;
  }

  const rawActivities = Array.isArray(value.activities) ? value.activities : [];
  const activities: Activity[] = [];
  for (const item of rawActivities) {
    if (typeof item !== 'object' || item === null) continue;
    const a = item as Record<string, unknown>;
    if (
      typeof a.id !== 'string' ||
      typeof a.date !== 'string' ||
      typeof a.title !== 'string' ||
      typeof a.time !== 'string' ||
      typeof a.durationMin !== 'number' ||
      !Number.isFinite(a.durationMin) ||
      typeof a.note !== 'string'
    ) {
      continue;
    }
    activities.push({
      id: a.id,
      date: a.date,
      title: a.title,
      time: a.time,
      durationMin: Math.max(0, Math.round(a.durationMin)),
      note: a.note,
    });
  }

  return { name, destination, startDate, endDate, activities };
}
