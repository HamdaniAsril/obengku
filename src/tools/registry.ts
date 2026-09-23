import type { ToolDefinition } from './types';
import ageCalculatorTool from './age-calculator';
import tirePressureTool from './tire-pressure';
import csvToExcelTool from './csv-to-xlsx';

export const tools: ToolDefinition[] = [ageCalculatorTool, tirePressureTool, csvToExcelTool];

export function getTool(slug: string): ToolDefinition | undefined {
  return tools.find((tool) => tool.slug === slug);
}
