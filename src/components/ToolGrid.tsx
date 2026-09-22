import type { ToolDefinition } from '@/tools/types';
import { ToolCard } from './ToolCard';

export function ToolGrid({ tools }: { tools: ToolDefinition[] }) {
  if (tools.length === 0) {
    return (
      <p className="text-sm text-neutral-600 dark:text-neutral-400">
        Belum ada tool. Tool pertama akan segera ditambahkan.
      </p>
    );
  }

  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {tools.map((tool) => (
        <li key={tool.slug}>
          <ToolCard tool={tool} />
        </li>
      ))}
    </ul>
  );
}
