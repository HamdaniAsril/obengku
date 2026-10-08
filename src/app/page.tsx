import { ToolGrid } from '@/components/ToolGrid';
import { BanLine, ShieldCheckLine, UserRoundXLine } from '@/components/icons/LineIcons';
import { tools } from '@/tools/registry';

const TRUST = [
  { icon: ShieldCheckLine, color: '#16A34A', text: 'Diproses di perangkatmu' },
  { icon: UserRoundXLine, color: '#3B82F6', text: 'Tanpa login' },
  { icon: BanLine, color: '#EF4444', text: 'Tanpa iklan' },
];

export default function HomePage() {
  // Hanya data serializable yang dikirim ke ToolGrid (Client Component).
  const items = tools.map(({ slug, name, description }) => ({ slug, name, description }));

  return (
    <div className="flex flex-col gap-12">
      <section className="flex flex-col gap-4">
        <h1 className="home-title">Kumpulan Tools Harian</h1>
        <p className="max-w-[560px] text-[17px] leading-[1.55] text-muted">
          Alat bantu kecil untuk pekerjaan sehari-hari. Pilih salah satu untuk mulai.
        </p>
        <ul className="trust-row">
          {TRUST.map(({ icon: Icon, color, text }) => (
            <li key={text}>
              <Icon className="size-4" style={{ color }} />
              {text}
            </li>
          ))}
        </ul>
      </section>
      <ToolGrid tools={items} />
    </div>
  );
}
