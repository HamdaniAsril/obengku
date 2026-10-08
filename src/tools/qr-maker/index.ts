import type { ToolDefinition } from '../types';
import { meta } from './meta';
import { QrMaker } from './QrMaker';

export const qrMakerTool: ToolDefinition = {
  ...meta,
  component: QrMaker,
};

export default qrMakerTool;
