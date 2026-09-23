/**
 * Parser CSV sesuai RFC 4180 (delimiter koma, tanda kutip ganda).
 *
 * Kutip hanya diartikan sebagai pembuka kolom terkuotasi bila muncul di
 * posisi kolom pertama; di posisi lain ia teks biasa (`a"b` -> `a"b`).
 * Newline di dalam kutipan tetap bagian isi kolom.
 */
export function parseCsv(input: string): string[][] {
  // Ekspor "CSV UTF-8" dari Excel selalu diawali BOM; tanpa dibuang, sel
  // pertama akan menjadi "\uFEFFNIK" alih-alih "NIK".
  const text = input.charCodeAt(0) === 0xfeff ? input.slice(1) : input;
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;
  let atFieldStart = true;
  let i = 0;

  const endField = () => {
    row.push(field);
    field = '';
    atFieldStart = true;
  };
  const endRow = () => {
    endField();
    rows.push(row);
    row = [];
  };

  while (i < text.length) {
    const char = text[i];

    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i += 1;
        continue;
      }
      field += char;
      i += 1;
      continue;
    }

    if (char === '"' && atFieldStart) {
      inQuotes = true;
      atFieldStart = false;
      i += 1;
      continue;
    }

    if (char === ',') {
      endField();
      i += 1;
      continue;
    }

    if (char === '\n' || char === '\r') {
      i += char === '\r' && text[i + 1] === '\n' ? 2 : 1;
      endRow();
      continue;
    }

    field += char;
    atFieldStart = false;
    i += 1;
  }

  // Baris terakhir tanpa newline di akhir, atau kolom yang masih terbuka.
  if (inQuotes || field !== '' || row.length > 0 || !atFieldStart) {
    endRow();
  }

  return rows;
}

export type CellValue =
  | { kind: 'empty' }
  | { kind: 'text'; text: string }
  | { kind: 'number'; value: number }
  | { kind: 'date'; year: number; month: number; day: number };

const ISO_DATE = /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/;
const LOCAL_DATE = /^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/;
const NUMBER = /^-?(?:\d+(?:\.\d+)?|\.\d+)$/;
/** Angka berawalan 0 lalu digit: 0812, 007, 01234 — wajib tetap teks. */
const LEADING_ZERO = /^0\d/;

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function parseDate(value: string): { year: number; month: number; day: number } | null {
  const iso = ISO_DATE.exec(value);
  if (iso) {
    return buildDate(Number(iso[1]), Number(iso[2]), Number(iso[3]));
  }
  const local = LOCAL_DATE.exec(value);
  if (local) {
    // Gaya Indonesia: DD-MM-YYYY / DD/MM/YYYY.
    return buildDate(Number(local[3]), Number(local[2]), Number(local[1]));
  }
  return null;
}

function buildDate(year: number, month: number, day: number) {
  if (month < 1 || month > 12) return null;
  if (day < 1 || day > daysInMonth(year, month)) return null;
  return { year, month, day };
}

/**
 * Menentukan tipe sel Excel dari teks CSV mentah.
 *
 * Urutan prioritas:
 * 1. kosong
 * 2. tanggal  — dicek lebih dulu supaya kolom tanggal tidak tercampur
 *              (jika penjaga angka-0 menang, DD/MM yang diawali 01-09
 *               sebagian jadi teks dan sebagian tanggal)
 * 3. angka 0 di depan -> teks, agar 0812/007/01234 tidak kehilangan nol
 * 4. angka
 * 5. teks
 *
 * Tipe ditentukan dari nilai yang sudah di-trim; nilai teks ikut disimpan
 * dalam bentuk trim supaya kolom tidak tercampur hanya karena spasi.
 */
export function inferCell(raw: string): CellValue {
  const value = raw.trim();
  if (value === '') return { kind: 'empty' };

  const date = parseDate(value);
  if (date) return { kind: 'date', ...date };

  if (LEADING_ZERO.test(value)) return { kind: 'text', text: value };

  if (NUMBER.test(value)) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return { kind: 'number', value: parsed };
  }

  return { kind: 'text', text: value };
}

/**
 * Serial tanggal Excel (sistem 1900).
 *
 * Diukur terhadap openpyxl 3.1.5: 1900-02-28 = 59, 1900-03-01 = 61 —
 * Excel melewatkan serial 60 karena menganggap tahun 1900 kabisat.
 * Karena itu 1900-03-01 dan seterusnya diberi koreksi +1.
 */
const EXCEL_EPOCH_UTC = Date.UTC(1899, 11, 31);
const LEAP_BUG_START_UTC = Date.UTC(1900, 2, 1);
const MS_PER_DAY = 86_400_000;

export function excelDateSerial(date: { year: number; month: number; day: number }): number {
  const timestamp = Date.UTC(date.year, date.month - 1, date.day);
  const days = Math.round((timestamp - EXCEL_EPOCH_UTC) / MS_PER_DAY);
  return days + (timestamp >= LEAP_BUG_START_UTC ? 1 : 0);
}

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let value = n;
    for (let k = 0; k < 8; k += 1) {
      value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
    }
    table[n] = value >>> 0;
  }
  return table;
})();

/** CRC-32/ISO-HDLC — checksum wajib tiap entri ZIP. */
export function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i += 1) {
    crc = CRC_TABLE[(crc ^ bytes[i]!) & 0xff]! ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

export interface ZipEntry {
  name: string;
  data: Uint8Array;
}

const DOS_TIME = 0;
/** 1980-01-01: year sejak 1980 = 0, bulan 1, hari 1. */
const DOS_DATE = (1 << 5) | 1;
const UTF8 = new TextEncoder();

/**
 * Menulis arsip ZIP dengan metode STORE (tanpa kompresi).
 *
 * Pilihan sadar: STORE membuat isi entri bisa ditekan byte-per-byte, sehingga
 * unit test dan `unzip -t` bisa memeriksa isi tanpa perlu dekompresor,
 * dan formatnya tetap sah untuk Excel/openpyxl.
 */
export function zipStore(entries: ZipEntry[]): Uint8Array<ArrayBuffer> {
  const locals: Uint8Array[] = [];
  const centrals: Uint8Array[] = [];
  let offset = 0;

  for (const entry of entries) {
    const name = UTF8.encode(entry.name);
    const crc = crc32(entry.data);
    const size = entry.data.length;

    const local = new Uint8Array(30 + name.length + size);
    const localView = new DataView(local.buffer);
    localView.setUint32(0, 0x04034b50, true);
    localView.setUint16(4, 20, true);
    localView.setUint16(6, 0, true);
    localView.setUint16(8, 0, true);
    localView.setUint16(10, DOS_TIME, true);
    localView.setUint16(12, DOS_DATE, true);
    localView.setUint32(14, crc, true);
    localView.setUint32(18, size, true);
    localView.setUint32(22, size, true);
    localView.setUint16(26, name.length, true);
    localView.setUint16(28, 0, true);
    local.set(name, 30);
    local.set(entry.data, 30 + name.length);

    const central = new Uint8Array(46 + name.length);
    const centralView = new DataView(central.buffer);
    centralView.setUint32(0, 0x02014b50, true);
    centralView.setUint16(4, 20, true);
    centralView.setUint16(6, 20, true);
    centralView.setUint16(8, 0, true);
    centralView.setUint16(10, 0, true);
    centralView.setUint16(12, DOS_TIME, true);
    centralView.setUint16(14, DOS_DATE, true);
    centralView.setUint32(16, crc, true);
    centralView.setUint32(20, size, true);
    centralView.setUint32(24, size, true);
    centralView.setUint16(28, name.length, true);
    centralView.setUint16(30, 0, true);
    centralView.setUint16(32, 0, true);
    centralView.setUint16(34, 0, true);
    centralView.setUint16(36, 0, true);
    centralView.setUint32(38, 0, true);
    centralView.setUint32(42, offset, true);
    central.set(name, 46);

    locals.push(local);
    centrals.push(central);
    offset += local.length;
  }

  const centralSize = centrals.reduce((total, entry) => total + entry.length, 0);
  const centralOffset = offset;

  const eocd = new Uint8Array(22);
  const eocdView = new DataView(eocd.buffer);
  eocdView.setUint32(0, 0x06054b50, true);
  eocdView.setUint16(4, 0, true);
  eocdView.setUint16(6, 0, true);
  eocdView.setUint16(8, entries.length, true);
  eocdView.setUint16(10, entries.length, true);
  eocdView.setUint32(12, centralSize, true);
  eocdView.setUint32(16, centralOffset, true);
  eocdView.setUint16(20, 0, true);

  const out = new Uint8Array(offset + centralSize + eocd.length);
  let position = 0;
  for (const local of locals) {
    out.set(local, position);
    position += local.length;
  }
  for (const central of centrals) {
    out.set(central, position);
    position += central.length;
  }
  out.set(eocd, position);
  return out;
}

const XML_DECL = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';
const NS_MAIN = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main';
const NS_PKG_REL = 'http://schemas.openxmlformats.org/package/2006/relationships';
const NS_OFFICE_REL = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships';
const NS_CONTENT_TYPES = 'http://schemas.openxmlformats.org/package/2006/content-types';

/** Karakter yang sah menurut XML 1.0 selain tab, LF, dan CR. */
const INVALID_XML_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g;

function escapeXml(value: string): string {
  return value
    .replace(INVALID_XML_CHARS, '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/** 0 -> A, 25 -> Z, 26 -> AA. */
function columnName(index: number): string {
  let position = index + 1;
  let name = '';
  while (position > 0) {
    const remainder = (position - 1) % 26;
    name = String.fromCharCode(65 + remainder) + name;
    position = Math.floor((position - 1) / 26);
  }
  return name;
}

function cellXml(ref: string, cell: CellValue): string {
  switch (cell.kind) {
    case 'number':
      return `<c r="${ref}"><v>${cell.value}</v></c>`;
    case 'date':
      return `<c r="${ref}" s="1"><v>${excelDateSerial(cell)}</v></c>`;
    case 'text':
      return `<c r="${ref}" t="inlineStr"><is><t>${escapeXml(cell.text)}</t></is></c>`;
    default:
      return `<c r="${ref}"/>`;
  }
}

function sheetXml(rows: string[][]): string {
  const body = rows
    .map((row, rowIndex) => {
      const number = rowIndex + 1;
      const cells = row
        .map((raw, columnIndex) => cellXml(`${columnName(columnIndex)}${number}`, inferCell(raw)))
        .join('');
      return `<row r="${number}">${cells}</row>`;
    })
    .join('');
  return `${XML_DECL}<worksheet xmlns="${NS_MAIN}"><sheetData>${body}</sheetData></worksheet>`;
}

const CONTENT_TYPES_XML = `${XML_DECL}<Types xmlns="${NS_CONTENT_TYPES}"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>`;

const ROOT_RELS_XML = `${XML_DECL}<Relationships xmlns="${NS_PKG_REL}"><Relationship Id="rId1" Type="${NS_OFFICE_REL}/officeDocument" Target="xl/workbook.xml"/></Relationships>`;

const WORKBOOK_XML = `${XML_DECL}<workbook xmlns="${NS_MAIN}" xmlns:r="${NS_OFFICE_REL}"><sheets><sheet name="Sheet1" sheetId="1" r:id="rId1"/></sheets></workbook>`;

const WORKBOOK_RELS_XML = `${XML_DECL}<Relationships xmlns="${NS_PKG_REL}"><Relationship Id="rId1" Type="${NS_OFFICE_REL}/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="${NS_OFFICE_REL}/styles" Target="styles.xml"/></Relationships>`;

const STYLES_XML = `${XML_DECL}<styleSheet xmlns="${NS_MAIN}"><numFmts count="1"><numFmt numFmtId="164" formatCode="dd/mm/yyyy"/></numFmts><fonts count="1"><font><sz val="11"/><name val="Calibri"/><family val="2"/></font></fonts><fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="164" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>`;

/** Merakit berkas .xlsx dari baris CSV mentah. */
export function buildXlsx(rows: string[][]): Uint8Array<ArrayBuffer> {
  const xml = (value: string) => UTF8.encode(value);
  return zipStore([
    { name: '[Content_Types].xml', data: xml(CONTENT_TYPES_XML) },
    { name: '_rels/.rels', data: xml(ROOT_RELS_XML) },
    { name: 'xl/workbook.xml', data: xml(WORKBOOK_XML) },
    { name: 'xl/_rels/workbook.xml.rels', data: xml(WORKBOOK_RELS_XML) },
    { name: 'xl/styles.xml', data: xml(STYLES_XML) },
    { name: 'xl/worksheets/sheet1.xml', data: xml(sheetXml(rows)) },
  ]);
}







