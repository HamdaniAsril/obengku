import type { ToolDefinition } from './types';

export const tools: ToolDefinition[] = [];

export function getTool(slug: string): ToolDefinition | undefined {
  return tools.find((tool) => tool.slug === slug);
}
