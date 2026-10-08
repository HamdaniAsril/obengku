'use client';

import { useRef, useState } from 'react';
import { Alert } from '@/components/Alert';
import { StarStamp } from '@/components/StarStamp';
import { findQuality, formatBytes, parseTargetKb, savedPercent } from '@/lib/compress';
import { extensionFor, outputName, pickFormat, type OutputMime } from './logic';

const ACCEPTED_MIME = ['image/jpeg', 'image/png', 'image/webp'];
const DEFAULT_TARGET_KB = '500';

type FormatChoice = 'auto' | OutputMime;

interface Outcome {
  blob: Blob;
  bytes: number;
  downloadName: string;
  formatLabel: string;
  reached: boolean;
  originalBytes: number;
  note: string | null;
}

function loadImageElement(file: File): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(file);
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Gambar tidak bisa dibaca.'));
    };
    image.src = url;
  });
}

function drawToCanvas(image: HTMLImageElement): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Peramban ini tidak menyediakan kanvas 2D.');
  }
  context.drawImage(image, 0, 0);
  return canvas;
}

function canvasHasAlpha(canvas: HTMLCanvasElement): boolean {
  const context = canvas.getContext('2d');
  if (!context) return false;
  const { data } = context.getImageData(0, 0, canvas.width, canvas.height);
  for (let index = 3; index < data.length; index += 4) {
    if (data[index] < 255) return true;
  }
  return false;
}

function supportsWebpEncoding(): boolean {
  const probe = document.createElement('canvas');
  probe.width = 1;
  probe.height = 1;
  return probe.toDataURL('image/webp').startsWith('data:image/webp');
}

function encodeToBlob(canvas: HTMLCanvasElement, mime: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Gambar gagal dikompresi di peramban ini.'));
      },
      mime,
      quality,
    );
  });
}

export function ImageCompressor() {
  const [fileName, setFileName] = useState<string | null>(null);
  const [targetKb, setTargetKb] = useState(DEFAULT_TARGET_KB);
  const [formatChoice, setFormatChoice] = useState<FormatChoice>('auto');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<File | null>(null);

  const reset = (keepFileInput = false) => {
    setFileName(null);
    setError(null);
    setOutcome(null);
    setBusy(false);
    fileRef.current = null;
    if (!keepFileInput && inputRef.current) inputRef.current.value = '';
  };

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    const looksAccepted =
      ACCEPTED_MIME.includes(file.type) ||
      (file.type === '' && /\.(jpe?g|png|webp)$/i.test(file.name));
    if (!looksAccepted) {
      reset();
      setError('Berkas bukan gambar JPG, PNG, atau WebP.');
      return;
    }
    fileRef.current = file;
    setFileName(file.name);
    setOutcome(null);
    setError(null);
  };

  const handleCompress = async () => {
    const file = fileRef.current;
    if (!file || busy) return;

    const target = parseTargetKb(targetKb);
    if (target === null) {
      setError('Target ukuran harus angka bulat 1–100000 KB.');
      return;
    }

    setBusy(true);
    setError(null);
    setOutcome(null);
    try {
      const image = await loadImageElement(file);
      const canvas = drawToCanvas(image);
      const hasAlpha = canvasHasAlpha(canvas);

      let mime: OutputMime =
        formatChoice === 'auto' ? pickFormat(hasAlpha) : formatChoice;
      const webpFallback = mime === 'image/webp' && !supportsWebpEncoding();
      if (webpFallback) mime = 'image/jpeg';

      const targetBytes = target * 1024;
      const cache = new Map<number, Blob>();
      const result = await findQuality(targetBytes, async (quality) => {
        const blob = await encodeToBlob(canvas, mime, quality);
        cache.set(quality, blob);
        return blob.size;
      });

      const candidate = cache.get(result.quality);
      if (!candidate) {
        throw new Error('Hasil kompresi tidak ditemukan.');
      }

      // Re-encode kadang menghasilkan berkas lebih besar daripada aslinya;
      // bila berkas asli sendiri sudah muat di target, berkas asli yang dipakai.
      const useOriginal = file.size <= targetBytes && file.size <= candidate.size;
      const blob = useOriginal ? file : candidate;
      const bytes = useOriginal ? file.size : candidate.size;

      const notes: string[] = [];
      if (useOriginal) {
        notes.push('Berkas asli sudah memenuhi target — tidak perlu dikompresi.');
      } else if (!result.reached) {
        notes.push(
          `Target tidak tercapai — inilah hasil terkecil yang masih bisa dibuat (kualitas ${Math.round(result.quality * 100)}%).`,
        );
      }
      if (webpFallback) {
        notes.push('Peramban ini tidak mendukung WebP — hasil dikonversi ke JPEG.');
      } else if (hasAlpha && mime === 'image/jpeg') {
        notes.push('Transparansi dihapus karena JPEG tidak mendukung kanal alpha.');
      }

      setOutcome({
        blob,
        bytes,
        downloadName: useOriginal
          ? (fileName ?? 'gambar')
          : outputName(fileName, mime),
        formatLabel: (useOriginal
          ? ((fileName ?? '').split('.').pop() ?? extensionFor(mime))
          : extensionFor(mime)
        ).toUpperCase(),
        reached: result.reached || useOriginal,
        originalBytes: file.size,
        note: notes.length > 0 ? notes.join(' ') : null,
      });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Gambar gagal dikompresi.');
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
        <label htmlFor="berkas-gambar" className="block text-sm font-semibold">
          Berkas gambar
        </label>
        <input
          id="berkas-gambar"
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(event) => handleFile(event.target.files?.[0])}
          className="field block w-full"
        />
        <p className="max-w-prose text-xs text-muted">
          Diproses sepenuhnya di perangkat Anda — berkas tidak pernah dikirim ke server mana pun.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="target-ukuran" className="block text-sm font-semibold">
            Target ukuran (KB)
          </label>
          <input
            id="target-ukuran"
            type="number"
            inputMode="numeric"
            min={1}
            max={100000}
            value={targetKb}
            onChange={(event) => setTargetKb(event.target.value)}
            className="field"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="format-hasil" className="block text-sm font-semibold">
            Format hasil
          </label>
          <select
            id="format-hasil"
            value={formatChoice}
            onChange={(event) => setFormatChoice(event.target.value as FormatChoice)}
            className="field"
          >
            <option value="auto">Otomatis (JPEG atau WebP)</option>
            <option value="image/webp">WebP</option>
            <option value="image/jpeg">JPEG</option>
          </select>
        </div>
      </div>

      {error ? <Alert>{error}</Alert> : null}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleCompress}
          disabled={!fileName || busy}
          className="btn btn-primary"
        >
          {busy ? 'Mengompresi…' : 'Kompresi'}
        </button>
        {fileName ? (
          <button type="button" onClick={() => reset()} className="btn btn-ghost">
            Ganti berkas
          </button>
        ) : null}
      </div>

      {outcome ? (
        <div className="result-card">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-semibold text-muted">Hasil kompresi</p>
            <StarStamp key={`${outcome.bytes}-${outcome.downloadName}`} />
          </div>
          <dl className="ledger mt-2 sm:max-w-md">
            <div>
              <dt>Berkas</dt>
              <dd className="max-w-[16rem] break-all">{fileName}</dd>
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
            <div>
              <dt>Format</dt>
              <dd>{outcome.formatLabel}</dd>
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
