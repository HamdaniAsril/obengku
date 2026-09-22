import type { ToolDefinition } from '../types';
import { meta } from './meta';
import { TirePressureCalculator } from './TirePressureCalculator';

export const tirePressureTool: ToolDefinition = {
  ...meta,
  component: TirePressureCalculator,
};

export default tirePressureTool;
