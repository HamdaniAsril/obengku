import type { ToolDefinition } from '../types';
import { meta } from './meta';
import { RatioCalculator } from './RatioCalculator';

export const ratioCalculatorTool: ToolDefinition = {
  ...meta,
  component: RatioCalculator,
};

export default ratioCalculatorTool;
