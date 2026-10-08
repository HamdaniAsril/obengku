import type { ToolDefinition } from '../types';
import { meta } from './meta';
import { ImageCompressor } from './ImageCompressor';

export const imageCompressorTool: ToolDefinition = {
  ...meta,
  component: ImageCompressor,
};

export default imageCompressorTool;
