'use client';

import { useMemo, useRef, useState } from 'react';
import { Alert } from '@/components/Alert';
import { StarStamp } from '@/components/StarStamp';
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
  'px-3 py-2 text-xs font-normal tabular-nums text-muted';
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
        <label htmlFor="berkas-csv" className="block text-sm font-semibold">
          Berkas CSV
        </label>
        <input
          id="berkas-csv"
          ref={inputRef}
          type="file"
          accept=".csv,text/csv,text/plain"
          onChange={(event) => handleFile(event.target.files?.[0])}
          className="field block w-full"
        />
        <p className="max-w-prose text-xs text-muted">
          Diproses sepenuhnya di perangkat Anda — berkas tidak pernah dikirim ke server mana pun.
        </p>
      </div>

      {error ? <Alert>{error}</Alert> : null}

      {fileName ? (
        <div className="space-y-5">
          <div className="result-card">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-semibold text-muted">Berkas siap dikonversi</p>
              <StarStamp key={fileName} />
            </div>
            <dl className="ledger mt-2 sm:max-w-md">
              <div>
                <dt>Berkas</dt>
                <dd className="max-w-[16rem] break-all">{fileName}</dd>
              </div>
              <div>
                <dt>Baris</dt>
                <dd>{rows.length.toLocaleString('id-ID')}</dd>
              </div>
              <div>
                <dt>Kolom</dt>
                <dd>{columnCount.toLocaleString('id-ID')}</dd>
              </div>
            </dl>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold">
              Pratinjau {Math.min(PREVIEW_ROWS, rows.length)} baris pertama
            </p>
            <div className="overflow-x-auto rounded-card border border-hairline bg-surface">
              <table className="w-full text-left text-sm">
                <tbody>
                  {preview.map((row, rowIndex) => {
                    const divider = rowIndex === 0 ? '' : 'border-t border-hairline';
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
                              <span className="block text-xs text-muted">{label}</span>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="max-w-prose text-xs text-muted">
              Label di bawah tiap nilai adalah tipe sel yang akan ditulis ke Excel. Kolom
              berawalan angka nol ditandai <strong>teks</strong> agar nol di depan tidak hilang.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleDownload}
              disabled={rows.length === 0}
              className="btn btn-primary"
            >
              Unduh {outputName(fileName)}
            </button>
            <button type="button" onClick={reset} className="btn btn-ghost">
              Ganti berkas
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
