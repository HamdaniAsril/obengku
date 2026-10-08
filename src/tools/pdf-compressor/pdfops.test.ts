import { describe, expect, it } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import { buildPdfFromJpegs, compressLight } from './pdfops';

// JPEG 1×1 piksel yang valid — cukup untuk memvalidasi embedding.
const TINY_JPEG = Uint8Array.from(
  atob(
    '/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/wAALCAABAAEBAREA/8QAFAABAAAAAAAAAAAAAAAAAAAACf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAD8AKp//2Q==',
  ),
  (char) => char.charCodeAt(0),
);

async function makeSamplePdf(): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.setTitle('Judul Rahasia');
  doc.setAuthor('Penulis Rahasia');
  doc.setSubject('Subjek Rahasia');
  doc.setKeywords(['rahasia']);
  doc.setCreator('Pembuat Rahasia');
  const page = doc.addPage([595, 842]);
  page.drawText('Halo dunia', { x: 50, y: 760, size: 18 });
  return doc.save();
}

describe('compressLight', () => {
  it('menghasilkan PDF valid dengan halaman dan ukuran halaman yang sama', async () => {
    const input = await makeSamplePdf();
    const { bytes, pageCount } = await compressLight(input);
    const restored = await PDFDocument.load(bytes);

    expect(pageCount).toBe(1);
    expect(restored.getPageCount()).toBe(1);
    expect(restored.getPage(0).getSize()).toEqual({ width: 595, height: 842 });
  });

  it('membuang metadata dari berkas hasil', async () => {
    const input = await makeSamplePdf();
    const { bytes } = await compressLight(input);
    // updateMetadata: false agar pemuat tidak menuliskan Creator miliknya
    // sendiri — yang diuji adalah isi Info dari berkas hasil.
    const restored = await PDFDocument.load(bytes, { updateMetadata: false });

    expect(restored.getTitle() ?? '').toBe('');
    expect(restored.getAuthor() ?? '').toBe('');
    expect(restored.getKeywords() ?? '').toEqual('');
    expect(restored.getCreator() ?? '').toBe('');
  });

  it('menghasilkan bytes tidak kosong yang bisa dimuat ulang', async () => {
    const input = await makeSamplePdf();
    const { bytes } = await compressLight(input);
    const restored = await PDFDocument.load(bytes);

    expect(restored.getPageCount()).toBe(1);
    expect(bytes.length).toBeGreaterThan(0);
  });
});

describe('buildPdfFromJpegs', () => {
  it('menyusun satu halaman PDF per gambar dengan ukuran halaman yang diberikan', async () => {
    const output = await buildPdfFromJpegs([
      { data: TINY_JPEG, widthPt: 595, heightPt: 842 },
      { data: TINY_JPEG, widthPt: 420, heightPt: 595 },
    ]);
    const restored = await PDFDocument.load(output);

    expect(restored.getPageCount()).toBe(2);
    expect(restored.getPage(0).getSize()).toEqual({ width: 595, height: 842 });
    expect(restored.getPage(1).getSize()).toEqual({ width: 420, height: 595 });
  });
});
