import type { ToolDefinition } from '../types';
import { meta } from './meta';
import { AgeCalculator } from './AgeCalculator';

export const ageCalculatorTool: ToolDefinition = {
  ...meta,
  component: AgeCalculator,
};

export default ageCalculatorTool;
