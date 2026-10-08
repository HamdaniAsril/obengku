import Link from 'next/link';
import type { HomeTool } from './homeCatalog';
import { lookFor } from './homeCatalog';
import { ChevronRightLine } from './icons/LineIcons';

export function ToolCard({ tool }: { tool: HomeTool }) {
  const { icon: Icon, color } = lookFor(tool.slug);

  return (
    <Link href={`/tools/${tool.slug}`} className="tool-card">
      <span className="tool-card__top">
        <Icon className="size-6" style={{ color }} />
        <ChevronRightLine className="tool-card__chevron size-4" />
      </span>
      <span className="tool-card__text">
        <h2 className="tool-card__title">{tool.name}</h2>
        <p className="tool-card__desc">{tool.description}</p>
      </span>
    </Link>
  );
}
