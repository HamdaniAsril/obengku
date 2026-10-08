import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { lookFor } from '@/components/homeCatalog';
import { getTool, tools } from '@/tools/registry';

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return tools.map((tool) => ({ slug: tool.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const tool = getTool(slug);
  if (!tool) return { title: 'Tool tidak ditemukan — Obengku' };
  return { title: `${tool.name} — Obengku`, description: tool.description };
}

export default async function ToolPage({ params }: PageProps) {
  const { slug } = await params;
  const tool = getTool(slug);
  if (!tool) notFound();

  const ToolComponent = tool.component;
  const { icon: Icon, color } = lookFor(tool.slug);

  return (
    <div className="flex flex-col gap-8">
      <div className="no-print tool-head">
        <Link href="/" className="back-link self-start">
          <svg viewBox="0 0 16 16" width="14" height="14" fill="none" aria-hidden>
            <path
              d="M13 8H4M7.5 4.5 4 8l3.5 3.5"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Semua tool
        </Link>
        <h1 className="tool-head__title">
          <Icon className="size-7 flex-none" style={{ color }} />
          {tool.name}
        </h1>
        <p className="tool-head__desc">{tool.description}</p>
      </div>

      <ToolComponent />
    </div>
  );
}
