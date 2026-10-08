import type { ToolDefinition } from '../types';
import { meta } from './meta';
import { PdfCompressor } from './PdfCompressor';

export const pdfCompressorTool: ToolDefinition = {
  ...meta,
  component: PdfCompressor,
};

export default pdfCompressorTool;
