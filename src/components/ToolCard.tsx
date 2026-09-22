import Link from 'next/link';
import type { ToolDefinition } from '@/tools/types';

export function ToolCard({ tool }: { tool: ToolDefinition }) {
  return (
    <Link
      href={`/tools/${tool.slug}`}
      className="group rounded-xl border border-neutral-200 bg-white p-5 transition hover:border-neutral-400 hover:shadow-sm dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-600"
    >
      {tool.icon ? (
        <span aria-hidden className="text-2xl">
          {tool.icon}
        </span>
      ) : null}
      <h2 className="mt-3 font-medium group-hover:underline">{tool.name}</h2>
      <p className="mt-1 text-sm text-neutral-500">{tool.description}</p>
    </Link>
  );
}
