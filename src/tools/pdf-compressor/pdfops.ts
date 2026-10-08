import { PDFDict, PDFDocument } from 'pdf-lib';

export interface CompressLightResult {
  bytes: Uint8Array;
  pageCount: number;
}

/**
 * Mode "Kompres Pro": rapikan ulang berkas tanpa menyentuh isi halaman —
 * objek disusun ulang oleh pdf-lib dan dict Info dikosongkan. Teks tetap bisa
 * dicari dan diseleksi. Penghematan bergantung pada isi berkas; bila hasilnya
 * tidak mengecil, pemanggil wajib melaporkannya apa adanya.
 */
export async function compressLight(input: Uint8Array): Promise<CompressLightResult> {
  // updateMetadata: false — supaya pdf-lib tidak menuliskan ulang Creator
  // dan Producer miliknya sendiri setelah Info dikosongkan.
  const doc = await PDFDocument.load(input, { updateMetadata: false });
  const info = doc.context.trailerInfo.Info;
  if (info) {
    const dict = doc.context.lookup(info);
    if (dict instanceof PDFDict) {
      for (const key of dict.keys()) dict.delete(key);
    }
  }
  const pageCount = doc.getPageCount();
  const bytes = await doc.save({ useObjectStreams: true });
  return { bytes, pageCount };
}

export interface PdfPageImage {
  data: Uint8Array;
  widthPt: number;
  heightPt: number;
}

export interface RenderedPage {
  canvas: HTMLCanvasElement;
  widthPt: number;
  heightPt: number;
}

export async function buildPdfFromJpegs(pages: PdfPageImage[]): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  for (const page of pages) {
    const image = await doc.embedJpg(page.data);
    const sheet = doc.addPage([page.widthPt, page.heightPt]);
    sheet.drawImage(image, { x: 0, y: 0, width: page.widthPt, height: page.heightPt });
  }
  return doc.save({ useObjectStreams: true });
}

/**
 * Mode "Kompres 18 Pro Max 1TB": render tiap halaman ke canvas stasioner.
 * Hasilnya berupa gambar — teks tidak lagi bisa dicari atau diseleksi.
 */
export async function renderPages(input: Uint8Array, scale = 2): Promise<RenderedPage[]> {
  const pdfjs = await import('pdfjs-dist');
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
  ).toString();

  // pdf.js mengalihkan kepemilikan buffer yang diberikan kepadanya.
  const loadingTask = pdfjs.getDocument({ data: input.slice() });
  const pdf = await loadingTask.promise;
  const pages: RenderedPage[] = [];

  try {
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const base = page.getViewport({ scale: 1 });
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement('canvas');
      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);
      if (!canvas.getContext('2d')) {
        throw new Error('Peramban ini tidak menyediakan kanvas 2D.');
      }
      await page.render({ canvas, viewport }).promise;
      pages.push({ canvas, widthPt: base.width, heightPt: base.height });
      page.cleanup();
    }
  } finally {
    await loadingTask.destroy();
  }

  return pages;
}

/** Susun ulang halaman-halaman terrender sebagai PDF JPEG pada kualitas `quality`. */
export async function encodePdf(
  pages: RenderedPage[],
  quality: number,
): Promise<Uint8Array> {
  const images: PdfPageImage[] = [];
  for (const page of pages) {
    const blob = await new Promise<Blob | null>((resolve) =>
      page.canvas.toBlob(resolve, 'image/jpeg', quality),
    );
    if (!blob) {
      throw new Error('Halaman gagal dikonversi ke JPEG di peramban ini.');
    }
    images.push({
      data: new Uint8Array(await blob.arrayBuffer()),
      widthPt: page.widthPt,
      heightPt: page.heightPt,
    });
  }
  return buildPdfFromJpegs(images);
}
