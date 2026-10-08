import type { ToolDefinition } from './types';
import ageCalculatorTool from './age-calculator';
import tirePressureTool from './tire-pressure';
import csvToExcelTool from './csv-to-xlsx';
import qrMakerTool from './qr-maker';
import imageCompressorTool from './image-compressor';
import pdfCompressorTool from './pdf-compressor';
import coinFlipTool from './coin-flip';
import spinWheelTool from './spin-wheel';
import ratioCalculatorTool from './ratio-calculator';
import itineraryTool from './itinerary';

export const tools: ToolDefinition[] = [
  ageCalculatorTool,
  tirePressureTool,
  csvToExcelTool,
  qrMakerTool,
  imageCompressorTool,
  pdfCompressorTool,
  coinFlipTool,
  spinWheelTool,
  ratioCalculatorTool,
  itineraryTool,
];

export function getTool(slug: string): ToolDefinition | undefined {
  return tools.find((tool) => tool.slug === slug);
}
