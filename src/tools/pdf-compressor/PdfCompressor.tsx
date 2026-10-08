'use client';

import { useRef, useState } from 'react';
import { Alert } from '@/components/Alert';
import { StarStamp } from '@/components/StarStamp';
import { findQuality, formatBytes, parseTargetKb, savedPercent } from '@/lib/compress';
import { MODE_LABEL, outputName, type PdfMode } from './logic';

const DEFAULT_TARGET_KB = '500';

interface Outcome {
  blob: Blob;
  bytes: number;
  downloadName: string;
  originalBytes: number;
  pageCount: number;
  mode: PdfMode;
  note: string | null;
}

function friendlyError(caught: unknown): string {
  const message = caught instanceof Error ? caught.message : '';
  if (/password|encrypt/i.test(message)) {
    return 'PDF terproteksi password — buka kunci berkasnya dulu sebelum dikompresi.';
  }
  if (/not a valid pdf|invalid pdf/i.test(message)) {
    return 'Berkas ini tidak bisa dibaca sebagai PDF.';
  }
  return 'PDF gagal diproses — pastikan berkasnya PDF yang tidak rusak.';
}

function toPdfBlob(bytes: Uint8Array): Blob {
  // Salinan eksplisit: Blob menerima hanya ArrayBuffer yang bukan SharedArrayBuffer.
  return new Blob([bytes.slice()], { type: 'application/pdf' });
}

export function PdfCompressor() {
  const [fileName, setFileName] = useState<string | null>(null);
  const [mode, setMode] = useState<PdfMode>('pro');
  const [targetKb, setTargetKb] = useState(DEFAULT_TARGET_KB);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<File | null>(null);

  const reset = () => {
    setFileName(null);
    setError(null);
    setOutcome(null);
    setBusy(false);
    fileRef.current = null;
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    const looksLikePdf =
      file.type === 'application/pdf' || /\.pdf$/i.test(file.name);
    if (!looksLikePdf) {
      reset();
      setError('Berkas bukan PDF.');
      return;
    }
    fileRef.current = file;
    setFileName(file.name);
    setOutcome(null);
    setError(null);
  };

  const switchMode = (next: PdfMode) => {
    if (next === mode) return;
    setMode(next);
    setOutcome(null);
    setError(null);
  };

  const handleCompress = async () => {
    const file = fileRef.current;
    if (!file || busy) return;

    let targetBytes = 0;
    if (mode === 'max') {
      const target = parseTargetKb(targetKb);
      if (target === null) {
        setError('Target ukuran harus angka bulat 1–100000 KB.');
        return;
      }
      targetBytes = target * 1024;
    }

    setBusy(true);
    setError(null);
    setOutcome(null);
    try {
      const input = new Uint8Array(await file.arrayBuffer());

      if (mode === 'pro') {
        const { compressLight } = await import('./pdfops');
        const { bytes, pageCount } = await compressLight(input);
        const useOriginal = bytes.length >= file.size;
        setOutcome({
          blob: useOriginal ? file : toPdfBlob(bytes),
          bytes: useOriginal ? file.size : bytes.length,
          downloadName: useOriginal ? (fileName ?? 'dokumen.pdf') : outputName(fileName),
          originalBytes: file.size,
          pageCount,
          mode,
          note: useOriginal
            ? 'Berkas ini tidak bisa dikecilkan lebih lanjut tanpa mengubah isinya — tidak ada bagian yang dipangkas.'
            : `${pageCount} halaman — teks tetap bisa dicari dan diseleksi.`,
        });
      } else {
        const { renderPages, encodePdf } = await import('./pdfops');
        const pages = await renderPages(input);
        try {
          const cache = new Map<number, Uint8Array>();
          const result = await findQuality(targetBytes, async (quality) => {
            const bytes = await encodePdf(pages, quality);
            cache.set(quality, bytes);
            return bytes.length;
          });
          const candidate = cache.get(result.quality);
          if (!candidate) {
            throw new Error('Hasil kompresi tidak ditemukan.');
          }

          const useOriginal = file.size <= targetBytes && file.size <= candidate.length;
          const notes: string[] = [
            `${pages.length} halaman — tiap halaman dirender ulang menjadi gambar, teks tidak lagi bisa dicari atau diseleksi.`,
          ];
          if (useOriginal) {
            notes.unshift('Berkas asli sudah memenuhi target — tidak perlu dikompresi.');
          } else if (!result.reached) {
            notes.unshift(
              'Target tidak tercapai — inilah hasil terkecil yang masih bisa dibuat.',
            );
          }

          setOutcome({
            blob: useOriginal ? file : toPdfBlob(candidate),
            bytes: useOriginal ? file.size : candidate.length,
            downloadName: useOriginal ? (fileName ?? 'dokumen.pdf') : outputName(fileName),
            originalBytes: file.size,
            pageCount: pages.length,
            mode,
            note: notes.join(' '),
          });
        } finally {
          for (const page of pages) {
            page.canvas.width = 0;
            page.canvas.height = 0;
          }
        }
      }
    } catch (caught) {
      setError(friendlyError(caught));
    } finally {
      setBusy(false);
    }
  };

  const handleDownload = () => {
    if (!outcome) return;
    const url = URL.createObjectURL(outcome.blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = outcome.downloadName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="berkas-pdf" className="block text-sm font-semibold">
          Berkas PDF
        </label>
        <input
          id="berkas-pdf"
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          onChange={(event) => handleFile(event.target.files?.[0])}
          className="field block w-full"
        />
        <p className="max-w-prose text-xs text-muted">
          Diproses sepenuhnya di perangkat Anda — berkas tidak pernah dikirim ke server mana pun.
        </p>
      </div>

      <fieldset className="space-y-2">
        <legend className="text-sm font-semibold">Mode kompresi</legend>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(MODE_LABEL) as PdfMode[]).map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={mode === value}
              onClick={() => switchMode(value)}
              className={`btn ${mode === value ? 'btn-primary' : 'btn-ghost'}`}
            >
              {MODE_LABEL[value]}
            </button>
          ))}
        </div>
        <p className="max-w-prose text-sm text-muted">
          {mode === 'pro'
            ? 'Kompres Pro menyusun ulang berkas tanpa mengubah isi halaman — teks tetap bisa dicari, dan penghematannya biasanya kecil.'
            : 'Peringatan: tiap halaman dirender ulang menjadi gambar — teks di hasil tidak lagi bisa dicari, diseleksi, atau disalin.'}
        </p>
      </fieldset>

      {mode === 'max' ? (
        <div className="space-y-2">
          <label htmlFor="target-ukuran-pdf" className="block text-sm font-semibold">
            Target ukuran (KB)
          </label>
          <input
            id="target-ukuran-pdf"
            type="number"
            inputMode="numeric"
            min={1}
            max={100000}
            value={targetKb}
            onChange={(event) => setTargetKb(event.target.value)}
            className="field sm:max-w-xs"
          />
        </div>
      ) : null}

      {error ? <Alert>{error}</Alert> : null}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleCompress}
          disabled={!fileName || busy}
          className="btn btn-primary"
        >
          {busy ? 'Memproses…' : 'Kompresi'}
        </button>
        {fileName ? (
          <button type="button" onClick={reset} className="btn btn-ghost">
            Ganti berkas
          </button>
        ) : null}
      </div>

      {outcome ? (
        <div className="result-card">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-semibold text-muted">Hasil kompresi</p>
            <StarStamp key={`${outcome.bytes}-${outcome.mode}`} />
          </div>
          <dl className="ledger mt-2 sm:max-w-md">
            <div>
              <dt>Berkas</dt>
              <dd className="max-w-[16rem] break-all">{fileName}</dd>
            </div>
            <div>
              <dt>Mode</dt>
              <dd>{MODE_LABEL[outcome.mode]}</dd>
            </div>
            <div>
              <dt>Halaman</dt>
              <dd>{outcome.pageCount}</dd>
            </div>
            <div>
              <dt>Ukuran asli</dt>
              <dd>{formatBytes(outcome.originalBytes)}</dd>
            </div>
            <div>
              <dt>Ukuran hasil</dt>
              <dd>{formatBytes(outcome.bytes)}</dd>
            </div>
            <div>
              <dt>Penghematan</dt>
              <dd>
                {String(savedPercent(outcome.originalBytes, outcome.bytes)).replace('.', ',')}%
              </dd>
            </div>
          </dl>
          {outcome.note ? (
            <p className="mt-4 max-w-prose text-sm text-muted">{outcome.note}</p>
          ) : null}
          <div className="mt-5 flex flex-wrap gap-3">
            <button type="button" onClick={handleDownload} className="btn btn-primary">
              Unduh {outcome.downloadName}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
