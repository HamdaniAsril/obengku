'use client';

import { type FormEvent, useEffect, useMemo, useState } from 'react';
import { Alert } from '@/components/Alert';
import {
  activitiesOn,
  activityToDraft,
  buildDays,
  draftToActivity,
  emptyTrip,
  formatDuration,
  formatDateFull,
  formatDateShort,
  newActivityDraft,
  newId,
  outOfRangeActivities,
  parseTrip,
  serializeTrip,
  timeRange,
  tripStats,
  validateActivity,
  validateTrip,
  type ActivityDraft,
  type Trip,
} from './logic';

const STORAGE_KEY = 'obengku:itinerary:v1';

type Tab = 'edit' | 'preview';

type DraftState = ActivityDraft & { editingId: string | null };

const EMPTY_HINT =
  'Isi tanggal mulai dan akhir trip — daftar Day 1–N dibuat otomatis dari rentang itu.';

export function ItineraryGenerator() {
  const [trip, setTrip] = useState<Trip>(emptyTrip);
  const [tab, setTab] = useState<Tab>('edit');
  const [draft, setDraft] = useState<DraftState | null>(null);
  const [draftErrors, setDraftErrors] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  // Muat tersimpanan setelah render pertama — HTML statis dari server dan
  // render klien pertama harus sama dulu, baru data lama dipasang.
  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      let saved: Trip | null = null;
      try {
        saved = parseTrip(localStorage.getItem(STORAGE_KEY));
      } catch {
        /* mode privat / storage diblokir: jalan tanpa penyimpanan */
      }
      if (saved) setTrip(saved);
      setReady(true);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, serializeTrip(trip));
    } catch {
      /* kuota penuh: perubahan tetap hidup di memori */
    }
  }, [trip, ready]);

  const days = useMemo(
    () => buildDays(trip.startDate, trip.endDate),
    [trip.startDate, trip.endDate],
  );
  const tripErrors = useMemo(
    () => (trip.startDate && trip.endDate ? validateTrip(trip) : []),
    [trip],
  );
  const outside = useMemo(() => outOfRangeActivities(trip), [trip]);
  const stats = tripStats(trip);

  const setField = (patch: Partial<Trip>) =>
    setTrip((previous) => ({ ...previous, ...patch }));

  const openAdd = (date: string) => {
    setDraftErrors([]);
    setDraft({ ...newActivityDraft(date), editingId: null });
  };

  const openEdit = (activityId: string) => {
    const activity = trip.activities.find((item) => item.id === activityId);
    if (!activity) return;
    setDraftErrors([]);
    setDraft({ ...activityToDraft(activity), editingId: activity.id });
  };

  const cancelDraft = () => {
    setDraft(null);
    setDraftErrors([]);
  };

  const saveDraft = (event: FormEvent) => {
    event.preventDefault();
    if (!draft) return;
    const errors = validateActivity(draft);
    if (errors.length > 0) {
      setDraftErrors(errors);
      return;
    }
    const editingId = draft.editingId;
    const activity = draftToActivity(draft, editingId ?? newId());
    setTrip((previous) => ({
      ...previous,
      activities: editingId
        ? previous.activities.map((item) => (item.id === editingId ? activity : item))
        : [...previous.activities, activity],
    }));
    cancelDraft();
  };

  const removeActivity = (activityId: string) => {
    setTrip((previous) => ({
      ...previous,
      activities: previous.activities.filter((item) => item.id !== activityId),
    }));
    if (draft?.editingId === activityId) cancelDraft();
  };

  const dropOutside = () => {
    const keep = new Set(outside.map((item) => item.id));
    setTrip((previous) => ({
      ...previous,
      activities: previous.activities.filter((item) => keep.has(item.id)),
    }));
  };

  const resetTrip = () => {
    if (!window.confirm('Kosongkan seluruh itinerary?')) return;
    setTrip(emptyTrip());
    cancelDraft();
  };

  const dayOptions =
    draft && days.some((day) => day.date === draft.date)
      ? days
      : draft
        ? [
            ...days,
            {
              index: days.length + 1,
              date: draft.date,
              label: formatDateFull(draft.date) || draft.date,
              shortLabel: '',
            },
          ]
        : [];

  const draftForm = draft ? (
    <form onSubmit={saveDraft} className="itinerary-form" aria-label="Form aktivitas">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="it-title" className="block text-sm font-semibold">
            Judul aktivitas
          </label>
          <input
            id="it-title"
            className="field"
            value={draft.title}
            placeholder="Mis. Check-in hotel"
            onChange={(event) => setDraft({ ...draft, title: event.target.value })}
          />
        </div>

        <div>
          <label htmlFor="it-day" className="block text-sm font-semibold">
            Hari
          </label>
          <select
            id="it-day"
            className="field"
            value={draft.date}
            onChange={(event) => setDraft({ ...draft, date: event.target.value })}
          >
            {dayOptions.map((day) => (
              <option key={day.date} value={day.date}>
                Day {day.index} — {day.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="it-time" className="block text-sm font-semibold">
            Jam mulai
          </label>
          <input
            id="it-time"
            type="time"
            className="field"
            value={draft.time}
            onChange={(event) => setDraft({ ...draft, time: event.target.value })}
          />
        </div>

        <div>
          <label htmlFor="it-duration" className="block text-sm font-semibold">
            Durasi (menit)
          </label>
          <input
            id="it-duration"
            type="number"
            min={0}
            step={1}
            inputMode="numeric"
            className="field"
            value={draft.durationText}
            onChange={(event) => setDraft({ ...draft, durationText: event.target.value })}
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="it-note" className="block text-sm font-semibold">
            Catatan
          </label>
          <textarea
            id="it-note"
            className="field"
            rows={2}
            placeholder="Opsional — mis. alamat, tiket, bawaan"
            value={draft.note}
            onChange={(event) => setDraft({ ...draft, note: event.target.value })}
          />
        </div>
      </div>

      {draftErrors.length > 0 ? <Alert>{draftErrors.join(' ')}</Alert> : null}

      <div className="flex flex-wrap gap-2">
        <button type="submit" className="btn btn-primary">
          {draft.editingId ? 'Simpan perubahan' : 'Tambah aktivitas'}
        </button>
        <button type="button" className="btn btn-ghost" onClick={cancelDraft}>
          Batal
        </button>
      </div>
    </form>
  ) : null;

  return (
    <div className="space-y-6">
      <div className="no-print flex flex-wrap gap-2" role="group" aria-label="Tampilan">
        <button
          type="button"
          className={`btn ${tab === 'edit' ? 'btn-primary' : 'btn-ghost'}`}
          aria-pressed={tab === 'edit'}
          onClick={() => setTab('edit')}
        >
          Edit
        </button>
        <button
          type="button"
          className={`btn ${tab === 'preview' ? 'btn-primary' : 'btn-ghost'}`}
          aria-pressed={tab === 'preview'}
          onClick={() => setTab('preview')}
        >
          Pratinjau
        </button>
      </div>

      {tab === 'edit' ? (
        <div className="no-print space-y-6">
          <section className="result-card space-y-4" aria-labelledby="it-trip-heading">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 id="it-trip-heading" className="font-display text-xl">
                Info trip
              </h2>
              <button type="button" className="btn btn-ghost" onClick={resetTrip}>
                Trip baru
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="it-name" className="block text-sm font-semibold">
                  Nama trip
                </label>
                <input
                  id="it-name"
                  className="field"
                  placeholder="Mis. Liburan Bali"
                  value={trip.name}
                  onChange={(event) => setField({ name: event.target.value })}
                />
              </div>
              <div>
                <label htmlFor="it-destination" className="block text-sm font-semibold">
                  Destinasi
                </label>
                <input
                  id="it-destination"
                  className="field"
                  placeholder="Mis. Ubud, Seminyak"
                  value={trip.destination}
                  onChange={(event) => setField({ destination: event.target.value })}
                />
              </div>
              <div>
                <label htmlFor="it-start" className="block text-sm font-semibold">
                  Tanggal mulai
                </label>
                <input
                  id="it-start"
                  type="date"
                  className="field"
                  value={trip.startDate}
                  onChange={(event) => setField({ startDate: event.target.value })}
                />
              </div>
              <div>
                <label htmlFor="it-end" className="block text-sm font-semibold">
                  Tanggal akhir
                </label>
                <input
                  id="it-end"
                  type="date"
                  className="field"
                  value={trip.endDate}
                  onChange={(event) => setField({ endDate: event.target.value })}
                />
              </div>
            </div>

            {tripErrors.length > 0 ? <Alert>{tripErrors.join(' ')}</Alert> : null}
            <p className="text-sm text-muted">
              {days.length > 0
                ? `${stats.days} hari · ${stats.activities} aktivitas tersimpan di perangkat ini.`
                : EMPTY_HINT}
            </p>
          </section>

          {outside.length > 0 && days.length > 0 ? (
            <div className="space-y-2">
              <Alert>
                {outside.length} aktivitas berada di luar rentang tanggal — pindahkan
                tanggalnya atau hapus.
              </Alert>
              <button type="button" className="btn btn-ghost" onClick={dropOutside}>
                Hapus aktivitas di luar rentang
              </button>
            </div>
          ) : null}

          {days.length === 0 ? null : (
            <div className="space-y-5">
              {days.map((day) => {
                const list = activitiesOn(trip.activities, day.date);
                const showForm = draft !== null && draft.date === day.date;
                return (
                  <section key={day.date} className="result-card">
                    <header className="flex flex-wrap items-baseline justify-between gap-2">
                      <h3 className="font-display text-lg">
                        Day {day.index}
                        <span className="text-muted"> — {day.label}</span>
                      </h3>
                      <p className="text-sm text-muted tabular-nums">
                        {list.length} aktivitas
                      </p>
                    </header>

                    {list.length > 0 ? (
                      <ul className="mt-2">
                        {list.map((activity) => (
                          <li
                            key={activity.id}
                            className="flex flex-wrap items-start gap-x-4 gap-y-2 border-t border-hairline py-3 first:border-t-0 first:pt-0"
                          >
                            <div className="w-28 shrink-0">
                              <p className="text-sm font-semibold tabular-nums">
                                {timeRange(activity.time, activity.durationMin)}
                              </p>
                              <p className="text-xs text-muted">
                                {formatDuration(activity.durationMin)}
                              </p>
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold">{activity.title}</p>
                              {activity.note ? (
                                <p className="whitespace-pre-wrap text-sm text-muted">
                                  {activity.note}
                                </p>
                              ) : null}
                            </div>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                className="btn btn-ghost"
                                onClick={() => openEdit(activity.id)}
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                className="btn btn-ghost"
                                onClick={() => removeActivity(activity.id)}
                              >
                                Hapus
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-2 text-sm text-muted">Belum ada aktivitas.</p>
                    )}

                    {showForm ? (
                      <div className="mt-3 border-t border-hairline pt-3">{draftForm}</div>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-ghost mt-3"
                        onClick={() => openAdd(day.date)}
                      >
                        Tambah aktivitas
                      </button>
                    )}
                  </section>
                );
              })}

              {draft && !days.some((day) => day.date === draft.date) ? (
                <section className="result-card">
                  <header className="font-display text-lg">Aktivitas di luar rentang</header>
                  <div className="mt-3">{draftForm}</div>
                </section>
              ) : null}
            </div>
          )}
        </div>
      ) : null}

      <div className="space-y-4">
        {tab === 'preview' ? (
          <div className="no-print flex flex-wrap gap-2">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => window.print()}
            >
              Cetak / Simpan PDF
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setTab('edit')}
            >
              Kembali mengedit
            </button>
          </div>
        ) : null}

        {tab === 'preview' && tripErrors.length > 0 ? (
          <div className="no-print">
            <Alert>{tripErrors.join(' ')}</Alert>
          </div>
        ) : null}

        {/* Selalu dirender walau tab Edit — perintah cetak dari tab mana pun
            tetap menghasilkan itinerary, bukan halaman kosong. */}
        <article
          className={`print-area result-card space-y-5${tab === 'edit' ? ' hidden' : ''}`}
        >
          <header className="border-b border-hairline pb-4">
            <p className="text-sm font-semibold text-muted">Itinerary</p>
            <h2 className="font-display text-3xl leading-tight">
              {trip.name.trim() || 'Trip tanpa nama'}
            </h2>
            {trip.destination.trim() ? (
              <p className="mt-1 text-muted">{trip.destination}</p>
            ) : null}
            <p className="mt-2 text-sm tabular-nums text-muted">
              {days.length > 0
                ? `${formatDateShort(days[0].date)} — ${formatDateShort(days[days.length - 1].date)} · ${stats.days} hari · ${stats.activities} aktivitas`
                : 'Tanggal trip belum diisi.'}
            </p>
          </header>

          {days.length === 0 ? (
            <p className="text-sm text-muted">{EMPTY_HINT}</p>
          ) : (
            days.map((day) => {
              const list = activitiesOn(trip.activities, day.date);
              return (
                <section key={day.date} className="break-inside-avoid">
                  <h3 className="font-display text-lg">
                    Day {day.index}
                    <span className="text-muted"> — {day.label}</span>
                  </h3>
                  {list.length === 0 ? (
                    <p className="mt-1 text-sm text-muted">Belum ada aktivitas.</p>
                  ) : (
                    <ul className="mt-1">
                      {list.map((activity) => (
                        <li
                          key={activity.id}
                          className="flex gap-x-4 border-t border-hairline py-2 first:border-t-0"
                        >
                          <span className="w-28 shrink-0 text-sm font-semibold tabular-nums">
                            {timeRange(activity.time, activity.durationMin)}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold">{activity.title}</p>
                            {activity.note ? (
                              <p className="whitespace-pre-wrap text-sm text-muted">
                                {activity.note}
                              </p>
                            ) : null}
                          </div>
                          <span className="shrink-0 text-sm text-muted tabular-nums">
                            {formatDuration(activity.durationMin)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              );
            })
          )}
        </article>
      </div>
    </div>
  );
}
