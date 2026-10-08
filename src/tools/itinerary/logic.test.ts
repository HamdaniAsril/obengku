import { describe, expect, it } from 'vitest';
import {
  activitiesOn,
  activityToDraft,
  addDays,
  buildDays,
  diffInDays,
  draftToActivity,
  emptyTrip,
  formatClock,
  formatDateFull,
  formatDateShort,
  formatDuration,
  isValidDateString,
  newActivityDraft,
  outOfRangeActivities,
  parseDateInput,
  parseTimeToMinutes,
  parseTrip,
  serializeTrip,
  sortActivities,
  timeRange,
  toDateInputValue,
  tripStats,
  validateActivity,
  validateTrip,
  type Activity,
  type Trip,
} from './logic';

const activity = (over: Partial<Activity> = {}): Activity => ({
  id: 'a1',
  date: '2026-09-26',
  title: 'Aktivitas',
  time: '09:00',
  durationMin: 60,
  note: '',
  ...over,
});

const trip = (over: Partial<Trip> = {}): Trip => ({
  ...emptyTrip(),
  name: 'Liburan',
  destination: 'Bali',
  startDate: '2026-09-26',
  endDate: '2026-09-28',
  ...over,
});

describe('parseDateInput / isValidDateString', () => {
  it('menerima tanggal valid', () => {
    expect(parseDateInput('2026-09-26')).toEqual(new Date(2026, 8, 26));
    expect(isValidDateString('2026-02-28')).toBe(true);
  });

  it('menolak tanggal yang tidak nyata', () => {
    expect(parseDateInput('2026-02-31')).toBeNull();
    expect(isValidDateString('2026-13-01')).toBe(false);
    expect(isValidDateString('26-09-2026')).toBe(false);
    expect(isValidDateString('')).toBe(false);
  });

  it('menolak tahun kabisat yang salah', () => {
    expect(isValidDateString('2026-02-29')).toBe(false);
    expect(isValidDateString('2024-02-29')).toBe(true);
  });

  it('membulatkan kembali ke input tanggal', () => {
    expect(toDateInputValue(new Date(2026, 0, 5))).toBe('2026-01-05');
    expect(toDateInputValue(new Date(2026, 11, 31))).toBe('2026-12-31');
  });
});

describe('addDays / diffInDays', () => {
  it('melewati akhir bulan dan tahun', () => {
    expect(addDays(new Date(2026, 11, 30), 3)).toEqual(new Date(2027, 0, 2));
    expect(addDays(new Date(2026, 1, 27), 2)).toEqual(new Date(2026, 2, 1));
  });

  it('menghitung selisih hari kalender', () => {
    expect(diffInDays(new Date(2026, 8, 26), new Date(2026, 8, 28))).toBe(2);
    expect(diffInDays(new Date(2026, 8, 28), new Date(2026, 8, 26))).toBe(-2);
  });
});

describe('formatDateFull / formatDateShort', () => {
  it('memformat tanggal dalam Bahasa Indonesia', () => {
    expect(formatDateFull('2026-09-26')).toBe('Sabtu, 26 September 2026');
    expect(formatDateShort('2026-09-26')).toBe('26 Sep 2026');
  });

  it('mengembalikan string kosong untuk tanggal tidak valid', () => {
    expect(formatDateFull('bukan-tanggal')).toBe('');
    expect(formatDateShort('')).toBe('');
  });
});

describe('buildDays', () => {
  it('membuat Day 1–N dari rentang tanggal', () => {
    const days = buildDays('2026-09-26', '2026-09-28');
    expect(days).toHaveLength(3);
    expect(days[0]).toEqual({
      index: 1,
      date: '2026-09-26',
      label: 'Sabtu, 26 September 2026',
      shortLabel: '26 Sep 2026',
    });
    expect(days[2].index).toBe(3);
    expect(days[2].date).toBe('2026-09-28');
  });

  it('menghasilkan satu hari bila mulai = akhir', () => {
    const days = buildDays('2026-09-26', '2026-09-26');
    expect(days).toHaveLength(1);
    expect(days[0].index).toBe(1);
  });

  it('melewati batas bulan', () => {
    const days = buildDays('2026-12-30', '2027-01-02');
    expect(days.map((d) => d.date)).toEqual([
      '2026-12-30',
      '2026-12-31',
      '2027-01-01',
      '2027-01-02',
    ]);
  });

  it('mengembalikan [] untuk tanggal tidak valid', () => {
    expect(buildDays('2026-02-31', '2026-03-05')).toEqual([]);
    expect(buildDays('', '2026-03-05')).toEqual([]);
    expect(buildDays('2026-03-05', '2026-03-01')).toEqual([]);
  });

  it('membatasi rentang maksimal 365 hari', () => {
    expect(buildDays('2026-01-01', '2026-12-31')).toHaveLength(365);
    expect(buildDays('2026-01-01', '2027-01-01')).toEqual([]);
  });
});

describe('sortActivities / activitiesOn', () => {
  it('mengurutkan berdasarkan jam mulai', () => {
    const list = [
      activity({ id: 'c', time: '14:00' }),
      activity({ id: 'a', time: '08:30' }),
      activity({ id: 'b', time: '11:00' }),
    ];
    expect(sortActivities(list).map((a) => a.id)).toEqual(['a', 'b', 'c']);
  });

  it('jam tidak valid diletakkan di akhir', () => {
    const list = [activity({ id: 'x', time: 'bukan' }), activity({ id: 'y', time: '01:00' })];
    expect(sortActivities(list).map((a) => a.id)).toEqual(['y', 'x']);
  });

  it('tidak mengubah urutan input (murni)', () => {
    const list = [activity({ id: 'b', time: '14:00' }), activity({ id: 'a', time: '08:30' })];
    sortActivities(list);
    expect(list.map((a) => a.id)).toEqual(['b', 'a']);
  });

  it('menyaring per hari dengan urutan benar', () => {
    const list = [
      activity({ id: '1', date: '2026-09-26', time: '10:00' }),
      activity({ id: '2', date: '2026-09-27', time: '08:00' }),
      activity({ id: '3', date: '2026-09-26', time: '07:00' }),
    ];
    expect(activitiesOn(list, '2026-09-26').map((a) => a.id)).toEqual(['3', '1']);
    expect(activitiesOn(list, '2026-09-30')).toEqual([]);
  });
});

describe('outOfRangeActivities', () => {
  it('menemukan aktivitas di luar rentang', () => {
    const t = trip({
      startDate: '2026-09-26',
      endDate: '2026-09-27',
      activities: [
        activity({ id: 'in', date: '2026-09-26' }),
        activity({ id: 'out', date: '2026-09-30' }),
      ],
    });
    expect(outOfRangeActivities(t).map((a) => a.id)).toEqual(['out']);
  });

  it('mengembalikan semua aktivitas bila rentang tidak valid', () => {
    const t = trip({
      startDate: '',
      endDate: '',
      activities: [activity({ id: 'x' })],
    });
    expect(outOfRangeActivities(t).map((a) => a.id)).toEqual(['x']);
  });
});

describe('formatDuration', () => {
  it('memformat menit ke jam + menit', () => {
    expect(formatDuration(0)).toBe('0 m');
    expect(formatDuration(45)).toBe('45 m');
    expect(formatDuration(60)).toBe('1 j');
    expect(formatDuration(90)).toBe('1 j 30 m');
    expect(formatDuration(150)).toBe('2 j 30 m');
  });

  it('mengabaikan nilai negatif', () => {
    expect(formatDuration(-10)).toBe('0 m');
  });
});

describe('formatClock / timeRange / parseTimeToMinutes', () => {
  it('memformat jam gaya Indonesia', () => {
    expect(formatClock(0)).toBe('00.00');
    expect(formatClock(9 * 60)).toBe('09.00');
    expect(formatClock(23 * 60 + 5)).toBe('23.05');
  });

  it('menghitung rentang sampai jam selesai', () => {
    expect(timeRange('09:00', 90)).toBe('09.00–10.30');
    expect(timeRange('08:15', 45)).toBe('08.15–09.00');
    expect(timeRange('09:00', 0)).toBe('09.00');
  });

  it('membungkus lewat tengah malam', () => {
    expect(timeRange('23:00', 120)).toBe('23.00–01.00');
  });

  it('mengembalikan input bila jam tidak valid', () => {
    expect(timeRange('25:00', 30)).toBe('25:00');
  });

  it('mengubah jam menjadi menit', () => {
    expect(parseTimeToMinutes('09:00')).toBe(540);
    expect(parseTimeToMinutes('23:59')).toBe(1439);
    expect(parseTimeToMinutes('9:00')).toBeNull();
    expect(parseTimeToMinutes('')).toBeNull();
  });
});

describe('validateTrip', () => {
  it('menerima trip lengkap', () => {
    expect(validateTrip(trip())).toEqual([]);
  });

  it('menuntut kedua tanggal', () => {
    expect(validateTrip(trip({ startDate: '', endDate: '' }))).toEqual([
      'Isi tanggal mulai dan akhir trip.',
    ]);
  });

  it('menolak akhir sebelum mulai', () => {
    expect(validateTrip(trip({ startDate: '2026-09-28', endDate: '2026-09-26' }))).toEqual([
      'Tanggal akhir tidak boleh sebelum tanggal mulai.',
    ]);
  });

  it('menolak tanggal tidak nyata', () => {
    expect(validateTrip(trip({ startDate: '2026-02-31' }))).toEqual(['Tanggal tidak valid.']);
  });

  it('menolak rentang lebih dari 365 hari', () => {
    const errors = validateTrip(trip({ startDate: '2026-01-01', endDate: '2027-01-02' }));
    expect(errors[0]).toContain('maksimal 365 hari');
  });
});

describe('validateActivity / draftToActivity', () => {
  it('menerima draft lengkap', () => {
    const draft = { ...newActivityDraft('2026-09-26'), title: 'Sarapan' };
    expect(validateActivity(draft)).toEqual([]);
  });

  it('menuntut judul', () => {
    const errors = validateActivity({ ...newActivityDraft('2026-09-26'), title: '   ' });
    expect(errors).toContain('Judul aktivitas wajib diisi.');
  });

  it('menolak jam dan durasi tidak valid', () => {
    const base = { ...newActivityDraft('2026-09-26'), title: 'Makan' };
    expect(validateActivity({ ...base, time: '99:99' })).toContain('Jam mulai tidak valid.');
    expect(validateActivity({ ...base, durationText: '-5' })).toContain(
      'Durasi harus bilangan bulat menit ≥ 0.',
    );
    expect(validateActivity({ ...base, durationText: '1.5' })).toContain(
      'Durasi harus bilangan bulat menit ≥ 0.',
    );
    expect(validateActivity({ ...base, durationText: '' })).toContain(
      'Durasi harus bilangan bulat menit ≥ 0.',
    );
  });

  it('menuntut hari yang valid', () => {
    const errors = validateActivity({ ...newActivityDraft(''), title: 'Makan' });
    expect(errors).toContain('Pilih hari aktivitas.');
  });

  it('mengubah draft menjadi aktivitas dengan id dan nilai bersih', () => {
    const draft = {
      date: '2026-09-26',
      title: '  Sunset  ',
      time: '17:30',
      durationText: '90',
      note: '  Pantai Kuta  ',
    };
    expect(draftToActivity(draft, 'id-9')).toEqual({
      id: 'id-9',
      date: '2026-09-26',
      title: 'Sunset',
      time: '17:30',
      durationMin: 90,
      note: 'Pantai Kuta',
    });
  });

  it('round-trip draft <-> aktivitas', () => {
    const original = activity({ durationMin: 45, note: 'Bawa kamera' });
    const draft = activityToDraft(original);
    expect(draftToActivity(draft, original.id)).toEqual(original);
  });

  it('draft baru memakai hari pilihan dan jam 09:00', () => {
    expect(newActivityDraft('2026-09-27')).toEqual({
      date: '2026-09-27',
      title: '',
      time: '09:00',
      durationText: '60',
      note: '',
    });
  });
});

describe('tripStats', () => {
  it('menghitung hari dan aktivitas', () => {
    expect(
      tripStats(trip({ activities: [activity(), activity({ id: 'b' })] })),
    ).toEqual({ days: 3, activities: 2 });
  });

  it('nol hari bila tanggal kosong', () => {
    expect(tripStats(trip({ startDate: '', endDate: '' })).days).toBe(0);
  });
});

describe('serializeTrip / parseTrip', () => {
  it('round-trip trip penuh', () => {
    const original = trip({ activities: [activity({ note: 'Bawa kamera', durationMin: 120 })] });
    expect(parseTrip(serializeTrip(original))).toEqual(original);
  });

  it('menolak JSON rusak dan tipe yang salah', () => {
    expect(parseTrip('bukan json {')).toBeNull();
    expect(parseTrip('null')).toBeNull();
    expect(parseTrip('"teks"')).toBeNull();
    expect(parseTrip(null)).toBeNull();
    expect(parseTrip(undefined)).toBeNull();
    expect(parseTrip('{"name":"x"}')).toBeNull();
  });

  it('membuang aktivitas yang bentuknya rusak dan membulatkan durasi', () => {
    const raw = JSON.stringify({
      name: 'Trip',
      destination: '',
      startDate: '2026-09-26',
      endDate: '2026-09-27',
      activities: [
        { id: 'ok', date: '2026-09-26', title: 'A', time: '09:00', durationMin: 61.4, note: '' },
        { id: 'bad', date: '2026-09-26', title: 'B', time: '09:00', durationMin: '60', note: '' },
        'bukan-objek',
        null,
      ],
    });
    const parsed = parseTrip(raw);
    expect(parsed?.activities).toEqual([
      { id: 'ok', date: '2026-09-26', title: 'A', time: '09:00', durationMin: 61, note: '' },
    ]);
  });

  it('mengembalikan [] untuk aktivitas yang hilang', () => {
    const parsed = parseTrip(
      JSON.stringify({ name: '', destination: '', startDate: '', endDate: '' }),
    );
    expect(parsed?.activities).toEqual([]);
  });
});
