import ExcelJS from 'exceljs';
import { AppConfig, BackupInfo, ColumnDef, SheetData, TableRow, WorkbookMetadata } from '../types';

export interface IWorkbookService {
  isTauri(): boolean;
  createWorkbook(filePath: string, config: AppConfig): Promise<WorkbookMetadata>;
  openWorkbook(filePathOrFile: string | File): Promise<{ metadata: WorkbookMetadata; sheets: SheetData[] }>;
  saveWorkbook(filePath: string, sheets: SheetData[]): Promise<WorkbookMetadata>;
  createBackup(filePath: string): Promise<BackupInfo>;
  listBackups(filePath: string): Promise<BackupInfo[]>;
  restoreBackup(filePath: string, backupPath: string): Promise<WorkbookMetadata>;
  checkExternalChanges(filePath: string, knownLastModified: string): Promise<boolean>;
}

class TauriWorkbookService implements IWorkbookService {
  private async getTauri() {
    // Dynamic import to avoid runtime failure in non-tauri environments
    const { invoke } = await import('@tauri-apps/api/core');
    return { invoke };
  }

  isTauri(): boolean {
    return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
  }

  async createWorkbook(filePath: string, config: AppConfig): Promise<WorkbookMetadata> {
    const { invoke } = await this.getTauri();
    const res = await invoke<any>('workbook_create', {
      req: {
        file_path: filePath,
        config: {
          business_name: config.businessName,
          business_type: config.businessType,
          country: config.country,
          currency: config.currency,
          currency_symbol: config.currencySymbol,
          tax_preference: config.taxPreference,
          default_tax_rate: config.defaultTaxRate,
          date_format: config.dateFormat,
          timezone: config.timezone,
          schema_version: config.schemaVersion,
          created_at: config.createdAt,
          updated_at: config.updatedAt,
        },
      },
    });
    return {
      filePath: res.file_path,
      fileName: res.file_name,
      fileSize: res.file_size,
      lastModified: res.last_modified,
      sheetNames: res.sheet_names,
    };
  }

  async openWorkbook(filePath: string | File): Promise<{ metadata: WorkbookMetadata; sheets: SheetData[] }> {
    if (typeof filePath !== 'string') {
      throw new Error('Tauri requires a string file path');
    }
    const { invoke } = await this.getTauri();
    const [meta, rawSheets] = await invoke<[any, any[]]>('workbook_open', { filePath });

    const metadata: WorkbookMetadata = {
      filePath: meta.file_path,
      fileName: meta.file_name,
      fileSize: meta.file_size,
      lastModified: meta.last_modified,
      sheetNames: meta.sheet_names,
    };

    const sheets: SheetData[] = rawSheets.map((s) => ({
      name: s.name,
      columns: s.columns.map((c: any) => ({
        key: c.key,
        name: c.name,
        dataType: c.data_type,
        required: c.required,
        defaultValue: c.default_value,
        options: c.options,
        referenceTable: c.reference_table,
        referenceKey: c.reference_key,
      })),
      rows: s.rows,
    }));

    return { metadata, sheets };
  }

  async saveWorkbook(filePath: string, sheets: SheetData[]): Promise<WorkbookMetadata> {
    const { invoke } = await this.getTauri();
    const mappedSheets = sheets.map((s) => ({
      name: s.name,
      columns: s.columns.map((c) => ({
        key: c.key,
        name: c.name,
        data_type: c.dataType,
        required: c.required ?? false,
        default_value: c.defaultValue ?? null,
        options: c.options ?? null,
        reference_table: c.referenceTable ?? null,
        reference_key: c.referenceKey ?? null,
      })),
      rows: s.rows,
    }));

    const res = await invoke<any>('workbook_save', {
      req: {
        file_path: filePath,
        sheets: mappedSheets,
      },
    });

    return {
      filePath: res.file_path,
      fileName: res.file_name,
      fileSize: res.file_size,
      lastModified: res.last_modified,
      sheetNames: res.sheet_names,
    };
  }

  async createBackup(filePath: string): Promise<BackupInfo> {
    const { invoke } = await this.getTauri();
    const res = await invoke<any>('workbook_backup', { filePath });
    return {
      path: res.path,
      filename: res.filename,
      timestamp: res.timestamp,
      sizeBytes: res.size_bytes,
    };
  }

  async listBackups(filePath: string): Promise<BackupInfo[]> {
    const { invoke } = await this.getTauri();
    const res = await invoke<any[]>('workbook_list_backups', { filePath });
    return res.map((b) => ({
      path: b.path,
      filename: b.filename,
      timestamp: b.timestamp,
      sizeBytes: b.size_bytes,
    }));
  }

  async restoreBackup(filePath: string, backupPath: string): Promise<WorkbookMetadata> {
    const { invoke } = await this.getTauri();
    const res = await invoke<any>('workbook_restore', { filePath, backupPath });
    return {
      filePath: res.file_path,
      fileName: res.file_name,
      fileSize: res.file_size,
      lastModified: res.last_modified,
      sheetNames: res.sheet_names,
    };
  }

  async checkExternalChanges(filePath: string, knownLastModified: string): Promise<boolean> {
    const { invoke } = await this.getTauri();
    return await invoke<boolean>('workbook_check_modified', {
      filePath,
      knownLastModified,
    });
  }
}

class BrowserWorkbookService implements IWorkbookService {
  private virtualStorage = new Map<string, ArrayBuffer>();
  private backupsList: BackupInfo[] = [];

  isTauri(): boolean {
    return false;
  }

  async createWorkbook(filePath: string, config: AppConfig): Promise<WorkbookMetadata> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Exdrow Business OS';
    workbook.created = new Date();
    workbook.modified = new Date();

    // 1. _AppConfig
    const configSheet = workbook.addWorksheet('_AppConfig');
    configSheet.columns = [
      { header: 'key', key: 'key', width: 25 },
      { header: 'value', key: 'value', width: 35 },
    ];
    configSheet.addRows([
      { key: 'business_name', value: config.businessName },
      { key: 'business_type', value: config.businessType },
      { key: 'country', value: config.country },
      { key: 'currency', value: config.currency },
      { key: 'currency_symbol', value: config.currencySymbol },
      { key: 'tax_preference', value: config.taxPreference },
      { key: 'default_tax_rate', value: config.defaultTaxRate },
      { key: 'date_format', value: config.dateFormat },
      { key: 'timezone', value: config.timezone },
      { key: 'schema_version', value: '1.0.0' },
      { key: 'created_at', value: config.createdAt },
      { key: 'updated_at', value: config.updatedAt },
    ]);

    // Standard business sheets
    const sheetsMap: Record<string, string[]> = {
      _Categories: ['category_id', 'name', 'description', 'status', 'created_at', 'updated_at'],
      _Products: ['product_id', 'sku', 'name', 'category_id', 'purchase_price', 'selling_price', 'gst_rate', 'unit', 'minimum_stock', 'status', 'created_at', 'updated_at'],
      _Inventory: ['inventory_id', 'product_id', 'quantity', 'minimum_stock', 'updated_at'],
      _StockMovements: ['movement_id', 'product_id', 'type', 'quantity', 'reference_id', 'notes', 'created_at'],
      _Customers: ['customer_id', 'name', 'phone', 'email', 'address', 'gstin', 'created_at', 'updated_at'],
      _Suppliers: ['supplier_id', 'name', 'phone', 'email', 'address', 'gstin', 'notes', 'created_at'],
      _Sales: ['sale_id', 'customer_id', 'sale_date', 'subtotal', 'discount', 'tax', 'total', 'payment_method', 'status', 'created_at'],
      _SaleItems: ['sale_item_id', 'sale_id', 'product_id', 'quantity', 'unit_price', 'discount', 'tax', 'line_total'],
      _GST: ['gst_id', 'name', 'rate', 'cgst_rate', 'sgst_rate', 'igst_rate', 'status'],
      _Expenses: ['expense_id', 'date', 'category', 'description', 'amount', 'gst', 'payment_method', 'notes'],
      _DashboardConfig: ['widget_id', 'type', 'title', 'x', 'y', 'w', 'h', 'config_json'],
      _SavedViews: ['view_id', 'table_name', 'view_name', 'columns_json', 'filter_json', 'sort_json'],
      _CustomTables: ['table_id', 'name', 'display_name', 'icon', 'columns_def_json', 'pinned_to_sidebar'],
    };

    for (const [sheetName, headers] of Object.entries(sheetsMap)) {
      const ws = workbook.addWorksheet(sheetName);
      ws.columns = headers.map((h) => ({ header: h, key: h, width: 20 }));
    }

    // Default GST slabs
    const gstSheet = workbook.getWorksheet('_GST');
    if (gstSheet) {
      gstSheet.addRows([
        { gst_id: 'gst_0', name: 'GST 0%', rate: 0, cgst_rate: 0, sgst_rate: 0, igst_rate: 0, status: 'active' },
        { gst_id: 'gst_5', name: 'GST 5%', rate: 5, cgst_rate: 2.5, sgst_rate: 2.5, igst_rate: 5, status: 'active' },
        { gst_id: 'gst_12', name: 'GST 12%', rate: 12, cgst_rate: 6, sgst_rate: 6, igst_rate: 12, status: 'active' },
        { gst_id: 'gst_18', name: 'GST 18%', rate: 18, cgst_rate: 9, sgst_rate: 9, igst_rate: 18, status: 'active' },
        { gst_id: 'gst_28', name: 'GST 28%', rate: 28, cgst_rate: 14, sgst_rate: 14, igst_rate: 28, status: 'active' },
      ]);
    }

    const buffer = await workbook.xlsx.writeBuffer();
    this.virtualStorage.set(filePath, buffer);

    try {
      localStorage.setItem(`exdrow_file_${filePath}`, JSON.stringify(Array.from(new Uint8Array(buffer))));
    } catch {
      // Ignore if localStorage quota exceeded
    }

    const sheetNames = workbook.worksheets.map((ws) => ws.name);
    return {
      filePath,
      fileName: filePath.split('/').pop() || 'business.xlsx',
      fileSize: buffer.byteLength,
      lastModified: new Date().toISOString(),
      sheetNames,
    };
  }

  async openWorkbook(filePathOrFile: string | File): Promise<{ metadata: WorkbookMetadata; sheets: SheetData[] }> {
    const workbook = new ExcelJS.Workbook();
    let buffer: ArrayBuffer;
    let fileName = 'business.xlsx';
    let filePath = typeof filePathOrFile === 'string' ? filePathOrFile : filePathOrFile.name;

    if (filePathOrFile instanceof File) {
      fileName = filePathOrFile.name;
      buffer = await filePathOrFile.arrayBuffer();
      this.virtualStorage.set(filePath, buffer);
    } else {
      fileName = filePath.split('/').pop() || 'business.xlsx';
      if (this.virtualStorage.has(filePath)) {
        buffer = this.virtualStorage.get(filePath)!;
      } else {
        const stored = localStorage.getItem(`exdrow_file_${filePath}`);
        if (stored) {
          const arr = new Uint8Array(JSON.parse(stored));
          buffer = arr.buffer;
          this.virtualStorage.set(filePath, buffer);
        } else {
          // If not yet saved, create a default sample
          return this.createSampleAndOpen(filePath);
        }
      }
    }

    await workbook.xlsx.load(buffer);

    const sheets: SheetData[] = [];
    workbook.eachSheet((ws) => {
      const columns: ColumnDef[] = [];
      const rows: TableRow[] = [];

      const headerRow = ws.getRow(1);
      const colKeys: string[] = [];

      headerRow.eachCell((cell, colNumber) => {
        const key = String(cell.value || `col_${colNumber}`).trim();
        if (key) {
          colKeys.push(key);
          columns.push({
            key,
            name: key,
            dataType: 'text',
          });
        }
      });

      for (let r = 2; r <= ws.rowCount; r++) {
        const row = ws.getRow(r);
        const rowData: TableRow = {};
        let hasData = false;

        colKeys.forEach((key, idx) => {
          const cell = row.getCell(idx + 1);
          let val = cell.value;
          // Clean exceljs rich text or object values
          if (val && typeof val === 'object' && 'result' in val) {
            val = (val as any).result;
          } else if (val && typeof val === 'object' && 'text' in val) {
            val = (val as any).text;
          }
          if (val !== null && val !== undefined && val !== '') {
            hasData = true;
          }
          rowData[key] = val ?? null;
        });

        if (hasData) {
          rows.push(rowData);
        }
      }

      sheets.push({
        name: ws.name,
        columns,
        rows,
      });
    });

    const metadata: WorkbookMetadata = {
      filePath,
      fileName,
      fileSize: buffer.byteLength,
      lastModified: new Date().toISOString(),
      sheetNames: workbook.worksheets.map((ws) => ws.name),
    };

    return { metadata, sheets };
  }

  private async createSampleAndOpen(filePath: string) {
    const config: AppConfig = {
      businessName: 'My Local Business',
      businessType: 'Retail Store',
      country: 'India',
      currency: 'INR',
      currencySymbol: '₹',
      taxPreference: 'exclusive',
      defaultTaxRate: 18,
      dateFormat: 'YYYY-MM-DD',
      timezone: 'UTC',
      schemaVersion: '1.0.0',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await this.createWorkbook(filePath, config);
    return this.openWorkbook(filePath);
  }

  async saveWorkbook(filePath: string, sheets: SheetData[]): Promise<WorkbookMetadata> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Exdrow Business OS';
    workbook.modified = new Date();

    for (const sheet of sheets) {
      const ws = workbook.addWorksheet(sheet.name);
      ws.columns = sheet.columns.map((c) => ({
        header: c.key,
        key: c.key,
        width: Math.max(c.name.length + 5, 16),
      }));

      // Header row styling
      const headerRow = ws.getRow(1);
      headerRow.font = { bold: true, color: { argb: 'FF1E293B' } };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF1F5F9' },
      };

      for (const row of sheet.rows) {
        ws.addRow(row);
      }
    }

    const buffer = await workbook.xlsx.writeBuffer();
    this.virtualStorage.set(filePath, buffer);

    try {
      localStorage.setItem(`exdrow_file_${filePath}`, JSON.stringify(Array.from(new Uint8Array(buffer))));
    } catch {
      // ignore quota
    }

    return {
      filePath,
      fileName: filePath.split('/').pop() || 'business.xlsx',
      fileSize: buffer.byteLength,
      lastModified: new Date().toISOString(),
      sheetNames: sheets.map((s) => s.name),
    };
  }

  async createBackup(filePath: string): Promise<BackupInfo> {
    const buffer = this.virtualStorage.get(filePath);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${filePath.split('/').pop()?.replace('.xlsx', '')}.backup-${timestamp}.xlsx`;
    const backupPath = `/backups/${filename}`;

    if (buffer) {
      this.virtualStorage.set(backupPath, buffer);
    }

    const backupInfo: BackupInfo = {
      path: backupPath,
      filename,
      timestamp: new Date().toISOString(),
      sizeBytes: buffer ? buffer.byteLength : 0,
    };
    this.backupsList.unshift(backupInfo);
    return backupInfo;
  }

  async listBackups(_filePath: string): Promise<BackupInfo[]> {
    return this.backupsList;
  }

  async restoreBackup(filePath: string, backupPath: string): Promise<WorkbookMetadata> {
    const buffer = this.virtualStorage.get(backupPath);
    if (!buffer) {
      throw new Error('Backup data not found in virtual storage');
    }
    this.virtualStorage.set(filePath, buffer);
    return {
      filePath,
      fileName: filePath.split('/').pop() || 'business.xlsx',
      fileSize: buffer.byteLength,
      lastModified: new Date().toISOString(),
      sheetNames: [],
    };
  }

  async checkExternalChanges(_filePath: string, _knownLastModified: string): Promise<boolean> {
    return false;
  }
}

// Export singleton dispatcher that detects Tauri vs Browser environment
const isTauriEnv = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
export const workbookService: IWorkbookService = isTauriEnv
  ? new TauriWorkbookService()
  : new BrowserWorkbookService();
