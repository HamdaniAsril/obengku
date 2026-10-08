export type PdfMode = 'pro' | 'max';

export const MODE_LABEL: Record<PdfMode, string> = {
  pro: 'Kompres Pro',
  max: 'Kompres 18 Pro Max 1TB',
};

export function outputName(source: string | null): string {
  const base = (source ?? '').replace(/\.pdf$/i, '').trim();
  const name = base === '' ? 'dokumen' : base;
  return `${name}-kompresi.pdf`;
}
