import type { ToolDefinition } from '../types';
import { meta } from './meta';
import { SpinWheel } from './SpinWheel';

export const spinWheelTool: ToolDefinition = {
  ...meta,
  component: SpinWheel,
};

export default spinWheelTool;
