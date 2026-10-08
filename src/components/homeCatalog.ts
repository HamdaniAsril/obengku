import type { ComponentType, CSSProperties } from 'react';
import {
  CakeLine,
  CalculatorLine,
  ChartPieLine,
  CoinsLine,
  DicesLine,
  DivideLine,
  FileSpreadsheetLine,
  FileTextLine,
  FolderLine,
  GaugeLine,
  ImageLine,
  MapLine,
  PlaneLine,
  QrCodeLine,
  WrenchLine,
} from './icons/LineIcons';

type LineIcon = ComponentType<{ className?: string; style?: CSSProperties }>;

export type CategoryId = 'file' | 'hitung' | 'hiburan' | 'perjalanan';

export interface HomeCategory {
  id: CategoryId;
  label: string;
  icon: LineIcon;
  color: string;
}

/** Urutan di sini menentukan urutan chip dan urutan kartu di beranda. */
export const CATEGORIES: HomeCategory[] = [
  { id: 'file', label: 'File & Dokumen', icon: FolderLine, color: '#3B82F6' },
  { id: 'hitung', label: 'Hitung & Ukur', icon: CalculatorLine, color: '#F97316' },
  { id: 'hiburan', label: 'Hiburan & Keputusan', icon: DicesLine, color: '#EC4899' },
  { id: 'perjalanan', label: 'Perjalanan', icon: PlaneLine, color: '#6366F1' },
];

interface ToolLook {
  category: CategoryId;
  icon: LineIcon;
  color: string;
}

/** Tampilan kartu per slug. Tool baru tanpa entri tetap tampil di "Semua". */
const TOOL_LOOK: Record<string, ToolLook> = {
  'konverter-csv-ke-excel': { category: 'file', icon: FileSpreadsheetLine, color: '#16A34A' },
  'pembuat-qr-code': { category: 'file', icon: QrCodeLine, color: '#7C3AED' },
  'kompresi-gambar': { category: 'file', icon: ImageLine, color: '#EC4899' },
  'kompresi-pdf': { category: 'file', icon: FileTextLine, color: '#EF4444' },
  'kalkulator-umur': { category: 'hitung', icon: CakeLine, color: '#F97316' },
  'kalkulator-tekanan-ban': { category: 'hitung', icon: GaugeLine, color: '#3B82F6' },
  'kalkulator-rasio': { category: 'hitung', icon: DivideLine, color: '#0D9488' },
  'lempar-koin': { category: 'hiburan', icon: CoinsLine, color: '#CA8A04' },
  'spin-wheel': { category: 'hiburan', icon: ChartPieLine, color: '#0EA5E9' },
  itinerary: { category: 'perjalanan', icon: MapLine, color: '#6366F1' },
};

const FALLBACK_LOOK = { icon: WrenchLine, color: '#5F6672' };

export function lookFor(slug: string): { category?: CategoryId; icon: LineIcon; color: string } {
  return TOOL_LOOK[slug] ?? FALLBACK_LOOK;
}

export interface HomeTool {
  slug: string;
  name: string;
  description: string;
}

/** Urutkan sesuai urutan kategori; tool tanpa kategori di akhir. Urutan registry dipertahankan di dalam kategori. */
export function sortByCategory<T extends HomeTool>(tools: T[]): T[] {
  const rank = (tool: T) => {
    const category = TOOL_LOOK[tool.slug]?.category;
    const index = CATEGORIES.findIndex((item) => item.id === category);
    return index === -1 ? CATEGORIES.length : index;
  };
  return tools
    .map((tool, index) => ({ tool, index }))
    .sort((a, b) => rank(a.tool) - rank(b.tool) || a.index - b.index)
    .map(({ tool }) => tool);
}

export function filterByCategory<T extends HomeTool>(tools: T[], category: CategoryId | 'semua'): T[] {
  if (category === 'semua') return tools;
  return tools.filter((tool) => TOOL_LOOK[tool.slug]?.category === category);
}

export function countByCategory(tools: HomeTool[], category: CategoryId): number {
  return filterByCategory(tools, category).length;
}
