import type { ToolDefinition } from './types';
import ageCalculatorTool from './age-calculator';
import tirePressureTool from './tire-pressure';

export const tools: ToolDefinition[] = [ageCalculatorTool, tirePressureTool];

export function getTool(slug: string): ToolDefinition | undefined {
  return tools.find((tool) => tool.slug === slug);
}
