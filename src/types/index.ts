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
  displayName?: string;
  icon?: string;
  columns: ColumnDef[];
  rows: TableRow[];
}

export type BusinessFlowType =
  | 'retail'
  | 'wholesale'
  | 'pharmacy'
  | 'services'
  | 'manufacturing'
  | 'taxi'
  | 'hotel'
  | 'school'
  | 'coaching'
  | 'payroll'
  | 'gym'
  | 'hospital'
  | 'restaurant'
  | 'realestate'
  | 'garage'
  | 'salon';

export function getBusinessFlowType(businessType?: string): BusinessFlowType {
  const bt = (businessType || '').toLowerCase();
  if (bt.includes('taxi') || bt.includes('cab') || bt.includes('ride') || bt.includes('driver')) return 'taxi';
  if (bt.includes('hotel') || bt.includes('resort') || bt.includes('lodge') || bt.includes('motel') || bt.includes('hospitality')) return 'hotel';
  if (bt.includes('school') || bt.includes('academy') || bt.includes('k12') || bt.includes('education')) return 'school';
  if (bt.includes('coach') || bt.includes('tuition') || bt.includes('institute') || bt.includes('classes')) return 'coaching';
  if (bt.includes('payroll') || bt.includes('salary') || bt.includes('hr') || bt.includes('staff pay')) return 'payroll';
  if (bt.includes('gym') || bt.includes('fitness') || bt.includes('workout') || bt.includes('crossfit')) return 'gym';
  if (bt.includes('hospital') || bt.includes('clinic') || bt.includes('doctor') || bt.includes('nursing') || bt.includes('opd')) return 'hospital';
  if (bt.includes('restaurant') || bt.includes('cafe') || bt.includes('dining') || bt.includes('kitchen') || bt.includes('food') || bt.includes('bar')) return 'restaurant';
  if (bt.includes('realestate') || bt.includes('real estate') || bt.includes('rental') || bt.includes('property') || bt.includes('tenant') || bt.includes('flat') || bt.includes('lease')) return 'realestate';
  if (bt.includes('garage') || bt.includes('mechanic') || bt.includes('auto') || bt.includes('workshop') || bt.includes('car repair')) return 'garage';
  if (bt.includes('salon') || bt.includes('spa') || bt.includes('beauty') || bt.includes('parlour') || bt.includes('barber')) return 'salon';
  if (bt.includes('wholesale') || bt.includes('distribution') || bt.includes('b2b')) return 'wholesale';
  if (bt.includes('pharmacy') || bt.includes('medical') || bt.includes('chemist')) return 'pharmacy';
  if (bt.includes('service') || bt.includes('consult') || bt.includes('agency') || bt.includes('freelance')) return 'services';
  if (bt.includes('manufactur') || bt.includes('assembly') || bt.includes('factory') || bt.includes('production')) return 'manufacturing';
  return 'retail';
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

export interface TableRelationship {
  sourceSheet: string;
  sourceKey: string;
  targetSheet: string;
  targetKey: string;
  relationship: string;
}

export interface BusinessTemplate {
  id: BusinessFlowType;
  businessType: string;
  title: string;
  tagline: string;
  description: string;
  iconName: string;
  currencySymbol: string;
  currency: string;
  defaultTaxRate: number;
  relationships: TableRelationship[];
  sheets: SheetData[];
}
