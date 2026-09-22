import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
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

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <Link
          href="/"
          className="-mx-2 inline-flex min-h-11 items-center gap-1 px-2 text-sm text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
        >
          <span aria-hidden>←</span>
          Kembali
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">{tool.name}</h1>
        <p className="max-w-prose text-neutral-600 dark:text-neutral-400">{tool.description}</p>
      </div>
      <ToolComponent />
    </div>
  );
}
