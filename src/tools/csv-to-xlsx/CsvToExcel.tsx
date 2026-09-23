'use client';

import { useMemo, useRef, useState } from 'react';
import { buildXlsx, inferCell, parseCsv, type CellValue } from './logic';

const PREVIEW_ROWS = 5;
const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

const TYPE_LABEL: Record<CellValue['kind'], string> = {
  empty: 'kosong',
  text: 'teks',
  number: 'angka',
  date: 'tanggal',
};

const ROW_NUMBER_CLASS =
  'px-3 py-2 text-xs font-normal tabular-nums text-neutral-600 dark:text-neutral-400';
const CELL_CLASS = 'px-3 py-2 align-top';

function displayCell(raw: string) {
  const cell = inferCell(raw);
  if (cell.kind === 'empty') return { text: '—', label: TYPE_LABEL.empty };
  if (cell.kind === 'number') return { text: String(cell.value), label: TYPE_LABEL.number };
  if (cell.kind === 'date') {
    const day = String(cell.day).padStart(2, '0');
    const month = String(cell.month).padStart(2, '0');
    return { text: `${day}/${month}/${cell.year}`, label: TYPE_LABEL.date };
  }
  return { text: cell.text, label: TYPE_LABEL.text };
}

function outputName(source: string | null): string {
  if (!source) return 'hasil.xlsx';
  return /\.csv$/i.test(source) ? `${source.slice(0, -4)}.xlsx` : `${source}.xlsx`;
}

export function CsvToExcel() {
  const [fileName, setFileName] = useState<string | null>(null);
  const [csvText, setCsvText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const rows = useMemo(() => (csvText ? parseCsv(csvText) : []), [csvText]);
  const preview = useMemo(() => rows.slice(0, PREVIEW_ROWS), [rows]);
  const columnCount = useMemo(
    () => rows.reduce((max, row) => Math.max(max, row.length), 0),
    [rows],
  );

  const reset = () => {
    setFileName(null);
    setCsvText('');
    setError(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    try {
      const text = await file.text();
      if (text.trim() === '') {
        reset();
        setError('Berkas kosong — tidak ada isi yang bisa dikonversi.');
        return;
      }
      if (parseCsv(text).length === 0) {
        reset();
        setError('Tidak ada baris yang bisa dibaca dari berkas ini.');
        return;
      }
      setCsvText(text);
      setFileName(file.name);
      setError(null);
    } catch {
      reset();
      setError('Berkas tidak bisa dibaca. Pastikan itu berkas CSV teks biasa.');
    }
  };

  const handleDownload = () => {
    if (rows.length === 0) return;
    const blob = new Blob([buildXlsx(rows)], { type: XLSX_MIME });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = outputName(fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="berkas-csv" className="block text-sm font-medium">
          Berkas CSV
        </label>
        <input
          id="berkas-csv"
          ref={inputRef}
          type="file"
          accept=".csv,text/csv,text/plain"
          onChange={(event) => handleFile(event.target.files?.[0])}
          className="block w-full min-h-11 text-sm file:min-h-11 file:cursor-pointer file:rounded-lg file:border file:border-neutral-300 file:bg-white file:px-4 file:py-2 file:text-sm file:font-medium dark:file:border-neutral-700 dark:file:bg-neutral-900"
        />
        <p className="text-xs text-neutral-600 dark:text-neutral-400">
          Diproses sepenuhnya di perangkat Anda — berkas tidak pernah dikirim ke server mana pun.
        </p>
      </div>

      {error ? (
        <p
          role="alert"
          className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200"
        >
          {error}
        </p>
      ) : null}

      {fileName ? (
        <div className="space-y-5">
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
              <dt className="text-sm text-neutral-600 dark:text-neutral-400">Berkas</dt>
              <dd className="mt-1 break-all text-sm font-medium">{fileName}</dd>
            </div>
            <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
              <dt className="text-sm text-neutral-600 dark:text-neutral-400">Baris</dt>
              <dd className="mt-1 text-lg font-medium tabular-nums">
                {rows.length.toLocaleString('id-ID')}
              </dd>
            </div>
            <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
              <dt className="text-sm text-neutral-600 dark:text-neutral-400">Kolom</dt>
              <dd className="mt-1 text-lg font-medium tabular-nums">
                {columnCount.toLocaleString('id-ID')}
              </dd>
            </div>
          </dl>

          <div className="space-y-2">
            <p className="text-sm font-medium">
              Pratinjau {Math.min(PREVIEW_ROWS, rows.length)} baris pertama
            </p>
            <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
              <table className="w-full text-left text-sm">
                <tbody>
                  {preview.map((row, rowIndex) => {
                    const divider = rowIndex === 0 ? '' : 'border-t border-neutral-200 dark:border-neutral-800';
                    return (
                      <tr key={rowIndex}>
                        <th scope="row" className={`${ROW_NUMBER_CLASS} ${divider}`}>
                          {rowIndex + 1}
                        </th>
                        {Array.from({ length: columnCount }, (_, columnIndex) => {
                          const { text, label } = displayCell(row[columnIndex] ?? '');
                          return (
                            <td key={columnIndex} className={`${CELL_CLASS} ${divider}`}>
                              <span className="block break-words">{text}</span>
                              <span className="block text-xs text-neutral-600 dark:text-neutral-400">
                                {label}
                              </span>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">
              Label di bawah tiap nilai adalah tipe sel yang akan ditulis ke Excel. Kolom
              berawalan angka nol ditandai <strong>teks</strong> agar nol di depan tidak hilang.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleDownload}
              disabled={rows.length === 0}
              className="min-h-11 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Unduh {outputName(fileName)}
            </button>
            <button
              type="button"
              onClick={reset}
              className="min-h-11 rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-medium hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:bg-neutral-800"
            >
              Ganti berkas
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
