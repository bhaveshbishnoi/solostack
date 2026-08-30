export type DataType =
  | 'text'
  | 'number'
  | 'currency'
  | 'date'
  | 'boolean'
  | 'select'
  | 'reference'
  | 'email'
  | 'phone';

export interface ColumnDef {
  key: string;
  name: string;
  dataType: DataType;
  required?: boolean;
  defaultValue?: any;
  options?: string[];
  referenceTable?: string;
  referenceKey?: string;
}

export type TableRow = Record<string, any>;

export interface SheetData {
  name: string;
  columns: ColumnDef[];
  rows: TableRow[];
}

export interface AppConfig {
  businessName: string;
  businessType: string;
  country: string;
  currency: string;
  currencySymbol: string;
  taxPreference: 'inclusive' | 'exclusive';
  defaultTaxRate: number;
  dateFormat: string;
  timezone: string;
  schemaVersion: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkbookMetadata {
  filePath: string;
  fileName: string;
  fileSize: number;
  lastModified: string;
  sheetNames: string[];
}

export interface BackupInfo {
  path: string;
  filename: string;
  timestamp: string;
  sizeBytes: number;
}

export interface DashboardWidgetConfig {
  id: string;
  type: 'kpi' | 'chart' | 'recent_sales' | 'low_stock' | 'top_products' | 'notes';
  title: string;
  x: number;
  y: number;
  w: number;
  h: number;
  config: {
    kpiType?: 'total_sales' | 'today_sales' | 'month_sales' | 'products' | 'low_stock' | 'customers' | 'expenses' | 'outstanding';
    table?: string;
    xAxis?: string;
    metric?: string;
    aggregation?: 'SUM' | 'COUNT' | 'AVG' | 'MIN' | 'MAX';
    chartType?: 'line' | 'bar' | 'area' | 'pie' | 'donut';
    filters?: Array<{ column: string; operator: string; value: any }>;
    notes?: string;
  };
}

export interface SavedView {
  id: string;
  tableName: string;
  name: string;
  visibleColumns?: string[];
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
  searchQuery?: string;
  filters?: Array<{ column: string; operator: string; value: any }>;
}

export interface CustomTableDef {
  tableId: string;
  name: string;
  displayName: string;
  icon: string;
  columns: ColumnDef[];
  pinnedToSidebar: boolean;
}

export type SaveStatus = 'saved' | 'saving' | 'unsaved' | 'error';
