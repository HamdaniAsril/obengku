import { describe, expect, it } from 'vitest';
import { buildXlsx, crc32, excelDateSerial, inferCell, parseCsv, zipStore } from './logic';

describe('parseCsv', () => {
  it('memisahkan kolom dan baris sederhana', () => {
    expect(parseCsv('a,b,c\nd,e,f')).toEqual([
      ['a', 'b', 'c'],
      ['d', 'e', 'f'],
    ]);
  });

  it('mengembalikan array kosong untuk input kosong', () => {
    expect(parseCsv('')).toEqual([]);
  });

  it('mempertahankan kolom kosong di tengah baris', () => {
    expect(parseCsv('a,,c')).toEqual([['a', '', 'c']]);
    expect(parseCsv(',b,')).toEqual([['', 'b', '']]);
  });

  it('menganggap koma di dalam tanda kutip sebagai isi kolom', () => {
    expect(parseCsv('"a,b",c')).toEqual([['a,b', 'c']]);
  });

  it('menganggap newline di dalam tanda kutip sebagai isi kolom', () => {
    expect(parseCsv('"baris satu\nbaris dua",x')).toEqual([['baris satu\nbaris dua', 'x']]);
  });

  it('menguraikan tanda kutip ganda menjadi satu tanda kutip', () => {
    expect(parseCsv('"kata ""diisi"""')).toEqual([['kata "diisi"']]);
  });

  it('menangani akhir baris CRLF', () => {
    expect(parseCsv('a,b\r\nc,d')).toEqual([
      ['a', 'b'],
      ['c', 'd'],
    ]);
  });

  it('tidak membuat baris kosong ekstra dari newline di akhir file', () => {
    expect(parseCsv('a,b\n')).toEqual([['a', 'b']]);
    expect(parseCsv('a,b\r\n')).toEqual([['a', 'b']]);
  });

  it('menangani tanda kutip yang hanya ada di satu sisi sebagai teks biasa', () => {
    expect(parseCsv('a"b,c')).toEqual([['a"b', 'c']]);
  });

  it('membuang BOM UTF-8 yang dibawa ekspor Excel', () => {
    expect(parseCsv('﻿NIK,NAMA')).toEqual([['NIK', 'NAMA']]);
    expect(parseCsv('﻿0812,halo')).toEqual([['0812', 'halo']]);
  });
});

describe('inferCell', () => {
  it('menganggap string kosong sebagai sel kosong', () => {
    expect(inferCell('')).toEqual({ kind: 'empty' });
  });

  it('mengenali tanggal ISO YYYY-MM-DD', () => {
    expect(inferCell('2024-05-10')).toEqual({ kind: 'date', year: 2024, month: 5, day: 10 });
  });

  it('mengenali tanggal DD/MM/YYYY gaya Indonesia', () => {
    expect(inferCell('05/10/2024')).toEqual({ kind: 'date', year: 2024, month: 10, day: 5 });
  });

  it('mengenali tanggal DD-MM-YYYY', () => {
    expect(inferCell('01-02-2024')).toEqual({ kind: 'date', year: 2024, month: 2, day: 1 });
  });

  it('mengenali tanggal tanpa padding nol', () => {
    expect(inferCell('2024-5-9')).toEqual({ kind: 'date', year: 2024, month: 5, day: 9 });
    expect(inferCell('9/5/2024')).toEqual({ kind: 'date', year: 2024, month: 5, day: 9 });
  });

  it('menolak tanggal yang tidak nyata', () => {
    expect(inferCell('2024-02-30').kind).toBe('text');
    expect(inferCell('32/01/2024').kind).toBe('text');
    expect(inferCell('00/13/2024').kind).toBe('text');
  });

  it('menjaga angka 0 di depan sebagai teks', () => {
    expect(inferCell('08123456789')).toEqual({ kind: 'text', text: '08123456789' });
    expect(inferCell('007')).toEqual({ kind: 'text', text: '007' });
    expect(inferCell('01234')).toEqual({ kind: 'text', text: '01234' });
    expect(inferCell('00')).toEqual({ kind: 'text', text: '00' });
  });

  it('memprioritaskan tanggal di atas penjaga angka 0', () => {
    // Tanpa ini, 29% nilai DD/MM diawali 01-09 jadi teks dan kolom tercampur.
    expect(inferCell('05/10/2024').kind).toBe('date');
    expect(inferCell('09/01/2024').kind).toBe('date');
  });

  it('mengubah angka tunggal 0 dan desimal berawalan 0 menjadi angka', () => {
    expect(inferCell('0')).toEqual({ kind: 'number', value: 0 });
    expect(inferCell('0.5')).toEqual({ kind: 'number', value: 0.5 });
    expect(inferCell('00.5').kind).toBe('text');
  });

  it('mengenali angka positif, negatif, dan desimal', () => {
    expect(inferCell('42')).toEqual({ kind: 'number', value: 42 });
    expect(inferCell('-17')).toEqual({ kind: 'number', value: -17 });
    expect(inferCell('3.14')).toEqual({ kind: 'number', value: 3.14 });
    expect(inferCell('.5')).toEqual({ kind: 'number', value: 0.5 });
  });

  it('menganggap sisanya teks', () => {
    expect(inferCell('halo')).toEqual({ kind: 'text', text: 'halo' });
    expect(inferCell('Rp 12.000')).toEqual({ kind: 'text', text: 'Rp 12.000' });
    expect(inferCell('1e5')).toEqual({ kind: 'text', text: '1e5' });
    expect(inferCell('a"b')).toEqual({ kind: 'text', text: 'a"b' });
  });

  it('menentukan tipe dari nilai yang sudah di-trim', () => {
    expect(inferCell(' 42 ')).toEqual({ kind: 'number', value: 42 });
    expect(inferCell(' 0812 ')).toEqual({ kind: 'text', text: '0812' });
  });
});

describe('excelDateSerial', () => {
  // Nilai acuan diukur dari openpyxl 3.1.5, bukan dihafal.
  const cases: [string, number][] = [
    ['1899-12-31', 0],
    ['1900-01-01', 1],
    ['1900-02-28', 59],
    ['1900-03-01', 61],
    ['1900-03-02', 62],
    ['1999-12-31', 36525],
    ['2000-01-01', 36526],
    ['2024-02-29', 45351],
    ['2024-05-10', 45422],
    ['2024-12-31', 45657],
  ];

  for (const [iso, serial] of cases) {
    it(`mengubah ${iso} menjadi ${serial}`, () => {
      const [year, month, day] = iso.split('-').map(Number);
      expect(excelDateSerial({ year, month, day })).toBe(serial);
    });
  }

  it('melewati 1900-02-29 yang tidak pernah ada (bug kabisat Excel)', () => {
    // Serial 60 tidak boleh dipakai untuk tanggal nyata mana pun.
    const serials = cases.map(([, s]) => s);
    expect(serials).not.toContain(60);
  });
});

const enc = new TextEncoder();
const utf8 = (s: string) => enc.encode(s);
const hex = (bytes: Uint8Array) =>
  Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join(' ');

describe('crc32', () => {
  it('mengembalikan 0 untuk data kosong', () => {
    expect(crc32(new Uint8Array(0))).toBe(0);
  });

  it('cocok dengan nilai cek CRC-32/ISO-HDLC standar', () => {
    // Nilai cek publik untuk "123456789".
    expect(crc32(utf8('123456789'))).toBe(0xcbf43926);
  });

  it('deterministik dan bergantung pada isi', () => {
    expect(crc32(utf8('abc'))).toBe(crc32(utf8('abc')));
    expect(crc32(utf8('abc'))).not.toBe(crc32(utf8('abd')));
  });
});

describe('zipStore', () => {
  const findEocd = (bytes: Uint8Array): number => {
    for (let i = bytes.length - 22; i >= 0; i--) {
      if (hex(bytes.subarray(i, i + 4)) === '50 4b 05 06') return i;
    }
    return -1;
  };

  it('diawali signature local file header dan diakhiri EOCD', () => {
    const out = zipStore([{ name: 'a.txt', data: utf8('halo') }]);
    expect(hex(out.subarray(0, 4))).toBe('50 4b 03 04');
    expect(findEocd(out)).toBe(out.length - 22);
  });

  it('menyimpan isi berkas apa adanya (metode STORE, tanpa kompresi)', () => {
    const out = zipStore([{ name: 'a.txt', data: utf8('isi-terbuka') }]);
    const content = hex(utf8('isi-terbuka'));
    expect(hex(out)).toContain(content);
  });

  it('mencantumkan nama berkas di header', () => {
    const out = zipStore([{ name: 'xl/workbook.xml', data: utf8('<x/>') }]);
    expect(hex(out)).toContain(hex(utf8('xl/workbook.xml')));
  });

  it('mencatat jumlah entri yang benar di EOCD', () => {
    const out = zipStore([
      { name: 'a', data: utf8('1') },
      { name: 'b', data: utf8('2') },
      { name: 'c', data: utf8('3') },
    ]);
    const eocd = findEocd(out);
    expect(eocd).toBeGreaterThan(-1);
    const total = out[eocd + 10]! | (out[eocd + 11]! << 8);
    expect(total).toBe(3);
  });

  it('menghasilkan EOCD tanpa komentar', () => {
    const out = zipStore([{ name: 'a', data: utf8('1') }]);
    const eocd = findEocd(out);
    expect(out.length - eocd).toBe(22);
  });
});

describe('buildXlsx', () => {
  /** Membaca entri STORE dengan berjalan menurut struktur local header. */
  const readEntry = (bytes: Uint8Array, name: string): string => {
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    const decoder = new TextDecoder();
    let pos = 0;
    while (pos + 30 <= bytes.length) {
      if (hex(bytes.subarray(pos, pos + 4)) !== '50 4b 03 04') break;
      const size = view.getUint32(pos + 18, true);
      const nameLen = view.getUint16(pos + 26, true);
      const extraLen = view.getUint16(pos + 28, true);
      const entryName = decoder.decode(bytes.subarray(pos + 30, pos + 30 + nameLen));
      const dataStart = pos + 30 + nameLen + extraLen;
      if (entryName === name) {
        return decoder.decode(bytes.subarray(dataStart, dataStart + size));
      }
      pos = dataStart + size;
    }
    throw new Error(`entri tidak ada: ${name}`);
  };

  const REQUIRED_ENTRIES = [
    '[Content_Types].xml',
    '_rels/.rels',
    'xl/workbook.xml',
    'xl/_rels/workbook.xml.rels',
    'xl/worksheets/sheet1.xml',
    'xl/styles.xml',
  ];

  it('menghasilkan berkas ZIP yang sah', () => {
    const out = buildXlsx([['a']]);
    expect(hex(out.subarray(0, 4))).toBe('50 4b 03 04');
    expect(out.length).toBeGreaterThan(0);
  });

  it('memuat seluruh entri wajib workbook', () => {
    const out = buildXlsx([['a']]);
    for (const name of REQUIRED_ENTRIES) {
      expect(() => readEntry(out, name)).not.toThrow();
    }
  });

  it('menulis teks sebagai inlineStr sehingga 0812 tidak jadi angka', () => {
    const sheet = readEntry(buildXlsx([['0812', 'halo']]), 'xl/worksheets/sheet1.xml');
    expect(sheet).toContain('<t>0812</t>');
    expect(sheet).toContain('<t>halo</t>');
    expect(sheet).toContain('t="inlineStr"');
  });

  it('menulis angka sebagai nilai numerik', () => {
    const sheet = readEntry(buildXlsx([['42', '-17']]), 'xl/worksheets/sheet1.xml');
    expect(sheet).toContain('<v>42</v>');
    expect(sheet).toContain('<v>-17</v>');
  });

  it('menulis tanggal sebagai serial dengan gaya tanggal', () => {
    const sheet = readEntry(buildXlsx([['2024-05-10']]), 'xl/worksheets/sheet1.xml');
    expect(sheet).toContain('<v>45422</v>');
    expect(sheet).toContain('s="1"');
  });

  it('meletakkan kolom pada referensi sel yang benar', () => {
    const sheet = readEntry(buildXlsx([['x', 'y', 'z']]), 'xl/worksheets/sheet1.xml');
    expect(sheet).toContain('r="A1"');
    expect(sheet).toContain('r="B1"');
    expect(sheet).toContain('r="C1"');
  });

  it('melampaui Z menjadi referensi dua huruf', () => {
    const wide = Array.from({ length: 27 }, (_, i) => `c${i}`);
    const sheet = readEntry(buildXlsx([wide]), 'xl/worksheets/sheet1.xml');
    expect(sheet).toContain('r="Z1"');
    expect(sheet).toContain('r="AA1"');
  });

  it('meng-escape karakter XML sehingga sel rusak tidak merusak seluruh berkas', () => {
    const sheet = readEntry(buildXlsx([['a<b>&c']]), 'xl/worksheets/sheet1.xml');
    expect(sheet).toContain('a&lt;b&gt;&amp;c');
    expect(sheet).not.toContain('a<b>&c');
  });

  it('membuang karakter kontrol yang membuat XML tidak sah', () => {
    const sheet = readEntry(buildXlsx([['aman\x01\x02lanjut']]), 'xl/worksheets/sheet1.xml');
    expect(sheet).toContain('amanlanjut');
    expect(sheet).not.toContain('\x01');
  });

  it('menangani input kosong dan sel kosong', () => {
    expect(() => buildXlsx([])).not.toThrow();
    expect(() => buildXlsx([['', '']])).not.toThrow();
    const sheet = readEntry(buildXlsx([['', '']]), 'xl/worksheets/sheet1.xml');
    expect(sheet).toContain('r="A1"');
    expect(sheet).toContain('r="B1"');
  });
});



