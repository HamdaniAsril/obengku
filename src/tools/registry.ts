import type { ToolDefinition } from './types';
import ageCalculatorTool from './age-calculator';

export const tools: ToolDefinition[] = [ageCalculatorTool];

export function getTool(slug: string): ToolDefinition | undefined {
  return tools.find((tool) => tool.slug === slug);
}
