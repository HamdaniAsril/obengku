import type { ComponentType } from 'react';

export interface ToolDefinition {
  /** Identitas unik, dipakai sebagai segmen URL: /tools/<slug> */
  slug: string;
  /** Nama tampil di kartu dan judul halaman */
  name: string;
  /** Deskripsi singkat satu baris */
  description: string;
  /** Kategori opsional untuk pengelompokan nanti */
  category?: string;
  /** Ikon SVG full-color untuk kartu (bukan emoji) */
  icon?: ComponentType<{ className?: string }>;
  /** Komponen React yang merender UI tool */
  component: ComponentType;
}
