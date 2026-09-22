import { ToolGrid } from '@/components/ToolGrid';
import { tools } from '@/tools/registry';

export default function HomePage() {
  return (
    <div className="space-y-8">
      <section className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Kumpulan Tools Harian</h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          Alat bantu kecil untuk pekerjaan sehari-hari. Pilih salah satu untuk mulai.
        </p>
      </section>
      <ToolGrid tools={tools} />
    </div>
  );
}
