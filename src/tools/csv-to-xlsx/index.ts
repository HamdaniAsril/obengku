import type { ToolDefinition } from '../types';
import { meta } from './meta';
import { CsvToExcel } from './CsvToExcel';

export const csvToExcelTool: ToolDefinition = {
  ...meta,
  component: CsvToExcel,
};

export default csvToExcelTool;
