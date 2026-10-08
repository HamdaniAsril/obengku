import type { ToolDefinition } from '../types';
import { meta } from './meta';
import { CoinFlip } from './CoinFlip';

export const coinFlipTool: ToolDefinition = {
  ...meta,
  component: CoinFlip,
};

export default coinFlipTool;
