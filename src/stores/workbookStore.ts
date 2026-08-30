import { create } from 'zustand';
import { workbookService } from '../services/workbookService';
import { useSettingsStore } from './settingsStore';
import { AppConfig, BackupInfo, BusinessTemplate, ColumnDef, CustomTableDef, SaveStatus, SheetData, TableRow, WorkbookMetadata } from '../types';

interface WorkbookState {
  metadata: WorkbookMetadata | null;
  sheets: Record<string, SheetData>;
  activeSheetName: string;
  saveStatus: SaveStatus;
  lastSaved: string | null;
  backups: BackupInfo[];
  externalChangeDetected: boolean;
  isSaving: boolean;
  appConfig: AppConfig | null;

  // Actions
  createWorkbook: (filePath: string, config: AppConfig) => Promise<void>;
  openWorkbook: (filePathOrFile: string | File) => Promise<void>;
  saveWorkbook: () => Promise<void>;
  createBackup: () => Promise<BackupInfo>;
  restoreBackup: (backupPath: string) => Promise<void>;
  setActiveSheet: (sheetName: string) => void;
  
  // Business Template Loader
  applyBusinessTemplate: (template: BusinessTemplate, customBusinessName?: string) => Promise<void>;
  
  // Row CRUD operations
  addRow: (sheetName: string, row: TableRow) => void;
  updateRow: (sheetName: string, idKey: string, idValue: any, newValues: Partial<TableRow>) => void;
  deleteRow: (sheetName: string, idKey: string, idValue: any) => void;
  
  // Column schema operations
  addColumn: (sheetName: string, column: ColumnDef) => void;
  deleteColumn: (sheetName: string, colKey: string) => void;
  renameColumn: (sheetName: string, colKey: string, newName: string) => void;
  getNextAutoIncrement: (sheetName: string, colKey: string) => string | number;

  // Custom Table creation
  createCustomTable: (tableDef: CustomTableDef) => void;
  
  // App Config operations
  updateAppConfig: (partial: Partial<AppConfig>) => void;

  // External change detection
  dismissExternalChange: () => void;
  reloadWorkbook: () => Promise<void>;
}

export function computeAutoIncrement(rows: TableRow[], colKey: string, fallbackPrefix = 'id'): string | number {
  if (!rows || rows.length === 0) {
    return `${fallbackPrefix}_1`;
  }

  const existingVals = rows.map((r) => r[colKey]).filter((v) => v !== null && v !== undefined && v !== '');
  if (existingVals.length === 0) {
    return `${fallbackPrefix}_1`;
  }

  // Check if purely numeric
  const isAllNumbers = existingVals.every((v) => typeof v === 'number' || (!isNaN(Number(v)) && !isNaN(parseFloat(String(v)))));
  if (isAllNumbers) {
    const maxNum = Math.max(...existingVals.map((v) => Number(v)));
    return maxNum + 1;
  }

  // Check prefix + number pattern (e.g., prod_1, prod_02, SKU-100, item-1)
  let bestPrefix = fallbackPrefix;
  let maxNum = 0;
  let padLen = 0;
  let matchedAny = false;

  for (const val of existingVals) {
    const str = String(val);
    const match = str.match(/^(.*?[_\-\s]?)([0-9]+)$/);
    if (match) {
      matchedAny = true;
      bestPrefix = match[1];
      const numStr = match[2];
      padLen = Math.max(padLen, numStr.length);
      const numVal = parseInt(numStr, 10);
      if (numVal > maxNum) {
        maxNum = numVal;
      }
    }
  }

  if (matchedAny) {
    const nextNum = (maxNum + 1).toString().padStart(padLen, '0');
    return `${bestPrefix}${nextNum}`;
  }

  return `${fallbackPrefix}_${rows.length + 1}`;
}

export const useWorkbookStore = create<WorkbookState>((set, get) => ({
  metadata: null,
  sheets: {},
  activeSheetName: 'dashboard',
  saveStatus: 'saved',
  lastSaved: null,
  backups: [],
  externalChangeDetected: false,
  isSaving: false,
  appConfig: null,

  createWorkbook: async (filePath: string, config: AppConfig) => {
    set({ saveStatus: 'saving', isSaving: true });
    try {
      await workbookService.createWorkbook(filePath, config);
      const { metadata, sheets } = await workbookService.openWorkbook(filePath);
      
      const sheetRecord: Record<string, SheetData> = {};
      sheets.forEach((s) => {
        sheetRecord[s.name] = s;
      });

      set({
        metadata,
        sheets: sheetRecord,
        activeSheetName: 'dashboard',
        saveStatus: 'saved',
        lastSaved: new Date().toLocaleTimeString(),
        isSaving: false,
        appConfig: config,
      });

      // Save workbook path and onboarding status to local settings
      useSettingsStore.getState().setLastWorkbookPath(metadata.filePath);
      useSettingsStore.getState().setHasCompletedOnboarding(true);

      // Auto-load backup list
      try {
        const backups = await workbookService.listBackups(filePath);
        set({ backups });
      } catch {
        // ignore
      }
    } catch (err) {
      set({ saveStatus: 'error', isSaving: false });
      throw err;
    }
  },

  openWorkbook: async (filePathOrFile: string | File) => {
    set({ saveStatus: 'saving', isSaving: true });
    try {
      const { metadata, sheets } = await workbookService.openWorkbook(filePathOrFile);
      const sheetRecord: Record<string, SheetData> = {};
      sheets.forEach((s) => {
        sheetRecord[s.name] = s;
      });

      // Parse _AppConfig if available
      let appConfig: AppConfig | null = null;
      if (sheetRecord['_AppConfig']) {
        const configMap: Record<string, any> = {};
        sheetRecord['_AppConfig'].rows.forEach((r) => {
          if (r.key) configMap[r.key] = r.value;
        });

        appConfig = {
          businessName: configMap['business_name'] || 'My Business',
          businessType: configMap['business_type'] || 'General',
          country: configMap['country'] || 'India',
          currency: configMap['currency'] || 'INR',
          currencySymbol: configMap['currency_symbol'] || '₹',
          taxPreference: configMap['tax_preference'] || 'exclusive',
          defaultTaxRate: Number(configMap['default_tax_rate'] || 18),
          dateFormat: configMap['date_format'] || 'YYYY-MM-DD',
          timezone: configMap['timezone'] || 'UTC',
          schemaVersion: configMap['schema_version'] || '1.0.0',
          createdAt: configMap['created_at'] || new Date().toISOString(),
          updatedAt: configMap['updated_at'] || new Date().toISOString(),
        };
      }

      set({
        metadata,
        sheets: sheetRecord,
        activeSheetName: 'dashboard',
        saveStatus: 'saved',
        lastSaved: new Date().toLocaleTimeString(),
        isSaving: false,
        appConfig,
      });

      // Save workbook path and onboarding status to local settings
      useSettingsStore.getState().setLastWorkbookPath(metadata.filePath);
      useSettingsStore.getState().setHasCompletedOnboarding(true);

      if (typeof filePathOrFile === 'string') {
        const backups = await workbookService.listBackups(filePathOrFile);
        set({ backups });
      }
    } catch (err) {
      set({ saveStatus: 'error', isSaving: false });
      throw err;
    }
  },

  saveWorkbook: async () => {
    const { metadata, sheets, isSaving } = get();
    if (!metadata || isSaving) return;

    set({ saveStatus: 'saving', isSaving: true });
    try {
      const sheetArray = Object.values(sheets);
      const newMeta = await workbookService.saveWorkbook(metadata.filePath, sheetArray);
      set({
        metadata: newMeta,
        saveStatus: 'saved',
        lastSaved: new Date().toLocaleTimeString(),
        isSaving: false,
      });
    } catch (err) {
      set({ saveStatus: 'error', isSaving: false });
      throw err;
    }
  },

  createBackup: async () => {
    const { metadata } = get();
    if (!metadata) throw new Error('No active workbook');
    const backup = await workbookService.createBackup(metadata.filePath);
    set((state) => ({ backups: [backup, ...state.backups] }));
    return backup;
  },

  restoreBackup: async (backupPath: string) => {
    const { metadata } = get();
    if (!metadata) throw new Error('No active workbook');
    await workbookService.restoreBackup(metadata.filePath, backupPath);
    await get().openWorkbook(metadata.filePath);
  },

  setActiveSheet: (sheetName: string) => {
    set({ activeSheetName: sheetName });
  },

  applyBusinessTemplate: async (template: BusinessTemplate, customBusinessName?: string) => {
    const state = get();
    set({ isSaving: true, saveStatus: 'saving' });

    try {
      const updatedSheets = { ...state.sheets };

      // Apply all interconnected sheets from the business template
      template.sheets.forEach((ts) => {
        updatedSheets[ts.name] = {
          name: ts.name,
          columns: [...ts.columns],
          rows: [...ts.rows],
        };
      });

      const nowIso = new Date().toISOString();
      const updatedConfig: AppConfig = {
        ...(state.appConfig || {
          country: 'India',
          taxPreference: 'exclusive',
          dateFormat: 'YYYY-MM-DD',
          timezone: 'UTC',
          schemaVersion: '1.0.0',
          createdAt: nowIso,
          updatedAt: nowIso,
        }),
        businessName: customBusinessName?.trim() || state.appConfig?.businessName || template.title,
        businessType: template.businessType,
        currency: template.currency,
        currencySymbol: template.currencySymbol,
        defaultTaxRate: template.defaultTaxRate,
        updatedAt: nowIso,
      };

      // Also synchronize _AppConfig sheet
      if (updatedSheets['_AppConfig']) {
        const configRows: TableRow[] = [
          { key: 'business_name', value: updatedConfig.businessName },
          { key: 'business_type', value: updatedConfig.businessType },
          { key: 'country', value: updatedConfig.country },
          { key: 'currency', value: updatedConfig.currency },
          { key: 'currency_symbol', value: updatedConfig.currencySymbol },
          { key: 'tax_preference', value: updatedConfig.taxPreference },
          { key: 'default_tax_rate', value: updatedConfig.defaultTaxRate },
          { key: 'date_format', value: updatedConfig.dateFormat },
          { key: 'timezone', value: updatedConfig.timezone },
          { key: 'schema_version', value: updatedConfig.schemaVersion },
          { key: 'created_at', value: updatedConfig.createdAt },
          { key: 'updated_at', value: updatedConfig.updatedAt },
        ];
        updatedSheets['_AppConfig'] = {
          ...updatedSheets['_AppConfig'],
          rows: configRows,
        };
      }

      set({
        sheets: updatedSheets,
        appConfig: updatedConfig,
        activeSheetName: 'dashboard',
        isSaving: false,
      });

      try {
        localStorage.setItem('exdrow_template_configured', 'true');
      } catch {}

      // Save directly to the workbook file if open
      if (state.metadata) {
        await get().saveWorkbook();
      }
    } catch (err) {
      console.error('Failed to apply business template:', err);
      set({ saveStatus: 'error', isSaving: false });
      throw err;
    }
  },

  addRow: (sheetName: string, row: TableRow) => {
    set((state) => {
      const targetSheet = state.sheets[sheetName];
      if (!targetSheet) return state;

      const updatedSheet: SheetData = {
        ...targetSheet,
        rows: [row, ...targetSheet.rows],
      };

      return {
        sheets: {
          ...state.sheets,
          [sheetName]: updatedSheet,
        },
        saveStatus: 'unsaved',
      };
    });
  },

  updateRow: (sheetName: string, idKey: string, idValue: any, newValues: Partial<TableRow>) => {
    set((state) => {
      const targetSheet = state.sheets[sheetName];
      if (!targetSheet) return state;

      const updatedRows = targetSheet.rows.map((row) => {
        if (row[idKey] === idValue) {
          return { ...row, ...newValues };
        }
        return row;
      });

      return {
        sheets: {
          ...state.sheets,
          [sheetName]: {
            ...targetSheet,
            rows: updatedRows,
          },
        },
        saveStatus: 'unsaved',
      };
    });
  },

  deleteRow: (sheetName: string, idKey: string, idValue: any) => {
    set((state) => {
      const targetSheet = state.sheets[sheetName];
      if (!targetSheet) return state;

      const filteredRows = targetSheet.rows.filter((row) => row[idKey] !== idValue);

      return {
        sheets: {
          ...state.sheets,
          [sheetName]: {
            ...targetSheet,
            rows: filteredRows,
          },
        },
        saveStatus: 'unsaved',
      };
    });
  },

  addColumn: (sheetName: string, column: ColumnDef) => {
    set((state) => {
      const targetSheet = state.sheets[sheetName];
      if (!targetSheet) return state;

      if (targetSheet.columns.some((c) => c.key === column.key)) {
        return state;
      }

      const updatedColumns = [...targetSheet.columns, column];
      const defaultVal = column.defaultValue ?? (column.dataType === 'number' || column.dataType === 'currency' ? 0 : '');
      const updatedRows = targetSheet.rows.map((row) => ({
        ...row,
        [column.key]: defaultVal,
      }));

      return {
        sheets: {
          ...state.sheets,
          [sheetName]: {
            ...targetSheet,
            columns: updatedColumns,
            rows: updatedRows,
          },
        },
        saveStatus: 'unsaved',
      };
    });
  },

  deleteColumn: (sheetName: string, colKey: string) => {
    set((state) => {
      const targetSheet = state.sheets[sheetName];
      if (!targetSheet) return state;

      const updatedColumns = targetSheet.columns.filter((c) => c.key !== colKey);
      const updatedRows = targetSheet.rows.map((row) => {
        const copy = { ...row };
        delete copy[colKey];
        return copy;
      });

      return {
        sheets: {
          ...state.sheets,
          [sheetName]: {
            ...targetSheet,
            columns: updatedColumns,
            rows: updatedRows,
          },
        },
        saveStatus: 'unsaved',
      };
    });
  },

  renameColumn: (sheetName: string, colKey: string, newName: string) => {
    set((state) => {
      const targetSheet = state.sheets[sheetName];
      if (!targetSheet) return state;

      const updatedColumns = targetSheet.columns.map((c) =>
        c.key === colKey ? { ...c, name: newName } : c
      );

      return {
        sheets: {
          ...state.sheets,
          [sheetName]: {
            ...targetSheet,
            columns: updatedColumns,
          },
        },
        saveStatus: 'unsaved',
      };
    });
  },

  getNextAutoIncrement: (sheetName: string, colKey: string) => {
    const state = get();
    const targetSheet = state.sheets[sheetName];
    const rows = targetSheet?.rows || [];
    const prefix = colKey.replace(/_id$/i, '').replace(/id$/i, '') || sheetName.replace('_', '').toLowerCase();
    return computeAutoIncrement(rows, colKey, prefix);
  },

  createCustomTable: (tableDef: CustomTableDef) => {
    set((state) => {
      const sheetName = tableDef.name.startsWith('_') ? tableDef.name : `_${tableDef.name}`;
      const newSheet: SheetData = {
        name: sheetName,
        columns: tableDef.columns,
        rows: [],
      };

      // Also record in _CustomTables
      const customTablesSheet = state.sheets['_CustomTables'] || {
        name: '_CustomTables',
        columns: [
          { key: 'table_id', name: 'Table ID', dataType: 'text' },
          { key: 'name', name: 'Name', dataType: 'text' },
          { key: 'display_name', name: 'Display Name', dataType: 'text' },
          { key: 'icon', name: 'Icon', dataType: 'text' },
          { key: 'columns_def_json', name: 'Columns Def JSON', dataType: 'text' },
          { key: 'pinned_to_sidebar', name: 'Pinned to Sidebar', dataType: 'boolean' },
        ],
        rows: [],
      };

      const record: TableRow = {
        table_id: tableDef.tableId,
        name: sheetName,
        display_name: tableDef.displayName,
        icon: tableDef.icon,
        columns_def_json: JSON.stringify(tableDef.columns),
        pinned_to_sidebar: tableDef.pinnedToSidebar,
      };

      return {
        sheets: {
          ...state.sheets,
          [sheetName]: newSheet,
          ['_CustomTables']: {
            ...customTablesSheet,
            rows: [...customTablesSheet.rows, record],
          },
        },
        saveStatus: 'unsaved',
      };
    });
  },

  updateAppConfig: (partial: Partial<AppConfig>) => {
    set((state) => {
      const currentConfig = state.appConfig || {
        businessName: 'My Business',
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

      const updatedConfig: AppConfig = {
        ...currentConfig,
        ...partial,
        updatedAt: new Date().toISOString(),
      };

      // Synchronize changes to _AppConfig sheet if present
      const appConfigSheet = state.sheets['_AppConfig'];
      let updatedSheet = appConfigSheet;
      if (appConfigSheet) {
        const rows = [...appConfigSheet.rows];
        const updateKey = (key: string, val: any) => {
          const idx = rows.findIndex((r) => r.key === key);
          if (idx >= 0) {
            rows[idx] = { ...rows[idx], value: String(val) };
          } else {
            rows.push({ key, value: String(val) });
          }
        };

        if (partial.businessName !== undefined) updateKey('business_name', partial.businessName);
        if (partial.businessType !== undefined) updateKey('business_type', partial.businessType);
        if (partial.currency !== undefined) updateKey('currency', partial.currency);
        if (partial.currencySymbol !== undefined) updateKey('currency_symbol', partial.currencySymbol);
        if (partial.taxPreference !== undefined) updateKey('tax_preference', partial.taxPreference);
        if (partial.defaultTaxRate !== undefined) updateKey('default_tax_rate', partial.defaultTaxRate);
        if (partial.country !== undefined) updateKey('country', partial.country);
        if (partial.dateFormat !== undefined) updateKey('date_format', partial.dateFormat);
        updateKey('updated_at', updatedConfig.updatedAt);

        updatedSheet = {
          ...appConfigSheet,
          rows,
        };
      }

      return {
        appConfig: updatedConfig,
        sheets: updatedSheet ? { ...state.sheets, ['_AppConfig']: updatedSheet } : state.sheets,
        saveStatus: 'unsaved',
      };
    });
  },

  dismissExternalChange: () => {
    set({ externalChangeDetected: false });
  },

  reloadWorkbook: async () => {
    const { metadata } = get();
    if (metadata) {
      await get().openWorkbook(metadata.filePath);
      set({ externalChangeDetected: false });
    }
  },
}));
