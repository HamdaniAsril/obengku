export type OutputMime = 'image/jpeg' | 'image/webp';

/** Gambar bertransparansi direbut WebP (JPEG tidak punya kanal alpha). */
export function pickFormat(hasAlpha: boolean): OutputMime {
  return hasAlpha ? 'image/webp' : 'image/jpeg';
}

export function extensionFor(mime: OutputMime): string {
  return mime === 'image/webp' ? 'webp' : 'jpg';
}

export function outputName(source: string | null, mime: OutputMime): string {
  const base = (source ?? '').replace(/\.(jpe?g|png|webp)$/i, '').trim();
  const name = base === '' ? 'gambar' : base;
  return `${name}-kompresi.${extensionFor(mime)}`;
}
