'use client';

import { useState } from 'react';
import {
  CATEGORIES,
  type CategoryId,
  countByCategory,
  filterByCategory,
  type HomeTool,
  sortByCategory,
} from './homeCatalog';
import { ToolCard } from './ToolCard';

type Filter = CategoryId | 'semua';

export function ToolGrid({ tools }: { tools: HomeTool[] }) {
  const [filter, setFilter] = useState<Filter>('semua');

  if (tools.length === 0) {
    return <p className="text-sm text-muted">Belum ada tool. Tool pertama akan segera ditambahkan.</p>;
  }

  const visible = filterByCategory(sortByCategory(tools), filter);

  return (
    <section aria-label="Daftar tool" className="flex flex-col gap-5">
      <div role="group" aria-label="Filter kategori" className="chip-row">
        <button
          type="button"
          className="chip"
          aria-pressed={filter === 'semua'}
          onClick={() => setFilter('semua')}
        >
          Semua
          <span className="chip__count">{tools.length}</span>
        </button>
        {CATEGORIES.map(({ id, label, icon: Icon, color }) => {
          const count = countByCategory(tools, id);
          if (count === 0) return null;
          return (
            <button
              key={id}
              type="button"
              className="chip"
              aria-pressed={filter === id}
              onClick={() => setFilter(id)}
            >
              <Icon className="size-[15px]" style={{ color }} />
              {label}
              <span className="chip__count">{count}</span>
            </button>
          );
        })}
      </div>

      <ul className="tool-grid">
        {visible.map((tool) => (
          <li key={tool.slug}>
            <ToolCard tool={tool} />
          </li>
        ))}
      </ul>
    </section>
  );
}
