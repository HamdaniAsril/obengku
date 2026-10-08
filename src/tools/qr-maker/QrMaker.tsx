'use client';

import { useMemo, useRef, useState } from 'react';
import { StarStamp } from '@/components/StarStamp';
import { encodeQr, type EccLevel } from './logic';
import { contrastRatio, renderSvg, type ModuleStyle } from './render';

const ECC_OPTIONS: { value: EccLevel; label: string; hint: string }[] = [
  { value: 'L', label: 'L', hint: '7%' },
  { value: 'M', label: 'M', hint: '15%' },
  { value: 'Q', label: 'Q', hint: '25%' },
  { value: 'H', label: 'H', hint: '30%' },
];

const STYLE_OPTIONS: { value: ModuleStyle; label: string }[] = [
  { value: 'kotak', label: 'Kotak' },
  { value: 'bulat', label: 'Bulat' },
  { value: 'halus', label: 'Halus' },
];

const INK = '#16181d';
const PAPER = '#ffffff';

export function QrMaker() {
  const [text, setText] = useState('https://obengku.nekomade.com');
  const [ecl, setEcl] = useState<EccLevel>('M');
  const [style, setStyle] = useState<ModuleStyle>('kotak');
  const [fg, setFg] = useState(INK);
  const [bg, setBg] = useState(PAPER);
  const [logoHref, setLogoHref] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Logo di tengah memakai ECC H agar tetap mudah dipindai.
  const activeEcl: EccLevel = logoHref ? 'H' : ecl;

  const { qr, error } = useMemo(() => {
    if (text.length === 0) return { qr: encodeQr('', activeEcl), error: null };
    try {
      return { qr: encodeQr(text, activeEcl), error: null };
    } catch (e) {
      return { qr: null, error: e instanceof Error ? e.message : String(e) };
    }
  }, [text, activeEcl]);

  const renderQr = (width?: number) =>
    qr
      ? renderSvg(qr, {
          fg,
          bg,
          style,
          logoHref: logoHref ?? undefined,
          logoSize: 0.22,
          width,
        })
      : '';

  const svg = renderQr();

  const contrast = contrastRatio(fg, bg);
  const lowContrast = contrast < 3;

  const onLogoPicked = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setLogoHref(typeof reader.result === 'string' ? reader.result : null);
    reader.readAsDataURL(file);
  };

  const download = (blob: Blob, name: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    link.click();
    URL.revokeObjectURL(url);
  };

  const downloadSvg = () => {
    if (!svg) return;
    download(new Blob([svg], { type: 'image/svg+xml' }), 'qr-code.svg');
  };

  const downloadPng = () => {
    if (!qr) return;
    // Image perlu dimensi px eksplisit agar SVG terdekode dengan ukuran benar.
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 1024;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, 1024, 1024);
      ctx.drawImage(img, 0, 0, 1024, 1024);
      canvas.toBlob((blob) => {
        if (blob) download(blob, 'qr-code.png');
      }, 'image/png');
    };
    img.src =
      'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(renderQr(1024));
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto]">
      <div className="space-y-5">
        <div className="space-y-2">
          <label htmlFor="isi-qr" className="block text-sm font-semibold">
            Isi QR code
          </label>
          <textarea
            id="isi-qr"
            className="field min-h-24 resize-y"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Tautan, teks, atau apa pun…"
            rows={3}
          />
        </div>

        <fieldset className="space-y-2">
          <legend className="block text-sm font-semibold">Perbaikan error</legend>
          <div className="flex flex-wrap gap-2">
            {ECC_OPTIONS.map((option) => {
              const active = !logoHref && ecl === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={active}
                  disabled={Boolean(logoHref)}
                  onClick={() => setEcl(option.value)}
                  className={`btn ${active ? 'btn-primary' : 'btn-ghost'}`}
                  title={`Tahan ${option.hint} kerusakan data`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
          {logoHref ? (
            <p className="text-xs text-muted">Logo aktif — ECC otomatis naik ke H (30%).</p>
          ) : null}
        </fieldset>

        <fieldset className="space-y-2">
          <legend className="block text-sm font-semibold">Bentuk modul</legend>
          <div className="flex flex-wrap gap-2">
            {STYLE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                aria-pressed={style === option.value}
                onClick={() => setStyle(option.value)}
                className={`btn ${style === option.value ? 'btn-primary' : 'btn-ghost'}`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="warna-modul" className="block text-sm font-semibold">
              Warna modul
            </label>
            <input
              id="warna-modul"
              type="color"
              className="field h-11 cursor-pointer p-1"
              value={fg}
              onChange={(e) => setFg(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="warna-latar" className="block text-sm font-semibold">
              Warna latar
            </label>
            <input
              id="warna-latar"
              type="color"
              className="field h-11 cursor-pointer p-1"
              value={bg}
              onChange={(e) => setBg(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <span className="block text-sm font-semibold">Logo tengah (opsional)</span>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="field cursor-pointer text-xs"
            onChange={(e) => onLogoPicked(e.target.files?.[0])}
          />
          {logoHref ? (
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                setLogoHref(null);
                if (fileRef.current) fileRef.current.value = '';
              }}
            >
              Hapus logo
            </button>
          ) : null}
        </div>
      </div>

      <div className="space-y-4 lg:w-80">
        {error ? (
          <div>
            <p className="text-sm font-semibold">Teks terlalu panjang</p>
            <p className="mt-1 text-sm text-muted">{error}</p>
          </div>
        ) : qr ? (
          <div className="result-card">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-semibold text-muted">Pratinjau</p>
              <StarStamp />
            </div>
            <div
              className="mx-auto mt-3 w-full max-w-64 overflow-hidden rounded-[10px] border border-hairline bg-surface"
              role="img"
              aria-label={`Pratinjau QR code versi ${qr.version}`}
              dangerouslySetInnerHTML={{ __html: svg }}
            />
            <p className="mt-3 text-xs text-muted tabular-nums">
              Versi {qr.version} ({qr.size}×{qr.size} modul) · ECC {activeEcl} ·{' '}
              {text.length.toLocaleString('id-ID')} karakter
            </p>
          </div>
        ) : null}

        {lowContrast && !error ? (
          <p className="text-xs font-semibold text-accent">
            Kontras warna rendah ({contrast.toFixed(1)}:1) — QR mungkin sulit dipindai.
          </p>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn btn-primary" onClick={downloadPng} disabled={!qr}>
            Unduh PNG
          </button>
          <button type="button" className="btn btn-ghost" onClick={downloadSvg} disabled={!qr}>
            Unduh SVG
          </button>
        </div>
      </div>
    </div>
  );
}
