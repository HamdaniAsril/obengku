import { describe, expect, it } from 'vitest';
import { tools } from '@/tools/registry';
import { CATEGORIES, countByCategory, filterByCategory, lookFor, sortByCategory } from './homeCatalog';

const items = tools.map(({ slug, name, description }) => ({ slug, name, description }));

describe('homeCatalog', () => {
  it('setiap tool terdaftar punya kategori beranda', () => {
    for (const tool of items) {
      expect(lookFor(tool.slug).category, tool.slug).toBeDefined();
    }
  });

  it('jumlah per kategori menjumlah ke total tool', () => {
    const total = CATEGORIES.reduce((sum, category) => sum + countByCategory(items, category.id), 0);
    expect(total).toBe(items.length);
  });

  it('"semua" mengembalikan seluruh tool', () => {
    expect(filterByCategory(items, 'semua')).toHaveLength(items.length);
  });

  it('filter hanya mengembalikan tool dari kategori itu', () => {
    const file = filterByCategory(items, 'file').map((tool) => tool.slug);
    expect(file).toEqual(['konverter-csv-ke-excel', 'pembuat-qr-code', 'kompresi-gambar', 'kompresi-pdf']);
  });

  it('mengurutkan per kategori dan menaruh tool tanpa kategori di akhir', () => {
    const extra = { slug: 'tool-baru', name: 'Tool Baru', description: '-' };
    const sorted = sortByCategory([extra, ...items]).map((tool) => tool.slug);
    expect(sorted[0]).toBe('konverter-csv-ke-excel');
    expect(sorted.at(-2)).toBe('itinerary');
    expect(sorted.at(-1)).toBe('tool-baru');
  });

  it('tool tanpa entri memakai ikon cadangan', () => {
    expect(lookFor('tool-baru').category).toBeUndefined();
  });
});
