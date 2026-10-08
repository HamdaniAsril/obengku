import type { ToolDefinition } from '../types';
import { meta } from './meta';
import { ItineraryGenerator } from './ItineraryGenerator';

export const itineraryTool: ToolDefinition = {
  ...meta,
  component: ItineraryGenerator,
};

export default itineraryTool;
