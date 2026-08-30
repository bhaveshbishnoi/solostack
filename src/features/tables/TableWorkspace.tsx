import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useWorkbookStore } from '../../stores/workbookStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { useUIStore } from '../../stores/uiStore';
import { ColumnDef, DataType, TableRow } from '../../types';
import { formatCurrency, formatDate } from '../../lib/utils';
import {
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Plus,
  Trash2,
  Copy,
  Download,
  EyeOff,
  Columns,
  Edit2,
  Edit3,
  FileText,
  MoreVertical,
  X,
  Check,
  RotateCcw,
  SlidersHorizontal,
  CheckSquare,
  Square,
  Sigma
} from 'lucide-react';

interface TableWorkspaceProps {
  sheetName: string;
}

// Smart default visible columns to prevent cluttered tables
const RECOMMENDED_VISIBLE_COLUMNS: Record<string, string[]> = {
  _Products: ['product_id', 'sku', 'name', 'selling_price', 'minimum_stock', 'status'],
  _Categories: ['category_id', 'name', 'description', 'status'],
  _Inventory: ['inventory_id', 'product_id', 'quantity', 'minimum_stock', 'updated_at'],
  _Customers: ['customer_id', 'name', 'phone', 'email', 'gstin'],
  _Suppliers: ['supplier_id', 'name', 'phone', 'email', 'gstin'],
  _Sales: ['sale_id', 'customer_id', 'sale_date', 'total', 'payment_method', 'status'],
  _SaleItems: ['sale_item_id', 'sale_id', 'product_id', 'quantity', 'unit_price', 'line_total'],
  _Expenses: ['expense_id', 'date', 'category', 'description', 'amount', 'payment_method'],
  _StockMovements: ['movement_id', 'product_id', 'type', 'quantity', 'reference_id', 'created_at'],
  _GST: ['gst_rate_id', 'name', 'rate', 'is_default'],
};

export const TableWorkspace: React.FC<TableWorkspaceProps> = ({ sheetName }) => {
  const {
    sheets,
    addRow,
    updateRow,
    deleteRow,
    addColumn,
    deleteColumn,
    renameColumn,
    getNextAutoIncrement,
    appConfig,
    setActiveSheet,
  } = useWorkbookStore();

  const { tableDensity, setTableDensity, sheetHiddenColumns, setSheetHiddenColumns } = useSettingsStore();
  const { addNotification, setTargetRecord } = useUIStore();

  const currentSheet = sheets[sheetName];
  const [searchQuery, setSearchQuery] = useState('');
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Column manager modal state
  const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);
  const [columnSearchFilter, setColumnSearchFilter] = useState('');

  // New Column creation modal state
  const [isAddColumnOpen, setIsAddColumnOpen] = useState(false);
  const [newColName, setNewColName] = useState('');
  const [newColType, setNewColType] = useState<DataType>('text');
  const [newColDefault, setNewColDefault] = useState('');

  // Column header menu state
  const [activeColMenu, setActiveColMenu] = useState<string | null>(null);
  const [renamingColKey, setRenamingColKey] = useState<string | null>(null);
  const [renamedColName, setRenamedColName] = useState('');

  // Inline editing state
  const [editingCell, setEditingCell] = useState<{ rowIdx: number; colKey: string } | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const editInputRef = useRef<HTMLInputElement>(null);

  // Initialize hidden columns from settings or recommended defaults
  const hiddenColumns = useMemo(() => {
    if (!currentSheet) return [];
    if (sheetHiddenColumns[sheetName]) {
      return sheetHiddenColumns[sheetName];
    }
    const recommended = RECOMMENDED_VISIBLE_COLUMNS[sheetName];
    if (recommended) {
      return currentSheet.columns.map((c) => c.key).filter((k) => !recommended.includes(k));
    }
    // For custom tables with more than 6 columns, keep first 6
    if (currentSheet.columns.length > 6) {
      return currentSheet.columns.slice(6).map((c) => c.key);
    }
    return [];
  }, [currentSheet, sheetName, sheetHiddenColumns]);

  // Primary ID key detection
  const primaryIdKey = useMemo(() => {
    if (!currentSheet?.columns.length) return 'id';
    const firstCol = currentSheet.columns[0].key;
    if (firstCol.endsWith('_id') || firstCol === 'id') return firstCol;
    return currentSheet.columns[0].key;
  }, [currentSheet]);

  const currencySymbol = appConfig?.currencySymbol || '₹';
  const currency = appConfig?.currency || 'INR';

  // Visible columns
  const visibleColumns = useMemo(() => {
    if (!currentSheet) return [];
    const list = currentSheet.columns.filter((c) => !hiddenColumns.includes(c.key));
    return list.length > 0 ? list : currentSheet.columns.slice(0, 1);
  }, [currentSheet, hiddenColumns]);

  // Filtered and Sorted Rows
  const processedRows = useMemo(() => {
    if (!currentSheet) return [];
    let rows = [...currentSheet.rows];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      rows = rows.filter((r) =>
        Object.values(r).some((val) =>
          String(val ?? '').toLowerCase().includes(q)
        )
      );
    }

    // Sort
    if (sortColumn) {
      rows.sort((a, b) => {
        const valA = a[sortColumn];
        const valB = b[sortColumn];

        if (valA === valB) return 0;
        if (valA === null || valA === undefined) return 1;
        if (valB === null || valB === undefined) return -1;

        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortDirection === 'asc' ? valA - valB : valB - valA;
        }

        const strA = String(valA).toLowerCase();
        const strB = String(valB).toLowerCase();
        return sortDirection === 'asc' ? strA.localeCompare(strB) : strB.localeCompare(strA);
      });
    }

    return rows;
  }, [currentSheet, searchQuery, sortColumn, sortDirection]);

  // Automatic column sums for numeric/currency columns
  const columnTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    visibleColumns.forEach((col) => {
      const isNum =
        col.dataType === 'number' ||
        col.dataType === 'currency' ||
        col.key.includes('price') ||
        col.key.includes('amount') ||
        col.key.includes('total') ||
        col.key.includes('quantity') ||
        col.key.includes('stock');

      if (isNum) {
        totals[col.key] = processedRows.reduce((acc, row) => acc + Number(row[col.key] || 0), 0);
      }
    });
    return totals;
  }, [visibleColumns, processedRows]);

  // Focus inline editor on open
  useEffect(() => {
    if (editingCell && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingCell]);

  if (!currentSheet) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="text-muted-foreground text-sm">Sheet "{sheetName}" not found in this workbook.</div>
      </div>
    );
  }

  const handleSort = (colKey: string) => {
    if (sortColumn === colKey) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else {
        setSortColumn(null);
      }
    } else {
      setSortColumn(colKey);
      setSortDirection('asc');
    }
  };

  const handleStartEdit = (rowIdx: number, colKey: string, currentValue: any) => {
    setEditingCell({ rowIdx, colKey });
    setEditValue(currentValue !== null && currentValue !== undefined ? String(currentValue) : '');
  };

  const handleCommitEdit = (row: TableRow, nextCell?: { rowIdx: number; colKey: string }) => {
    if (!editingCell) return;
    const { colKey } = editingCell;
    const colDef = currentSheet.columns.find((c) => c.key === colKey);

    let parsedVal: any = editValue;
    if (colDef?.dataType === 'number' || colDef?.dataType === 'currency') {
      parsedVal = editValue.trim() === '' ? 0 : Number(editValue);
      if (isNaN(parsedVal)) parsedVal = 0;
    } else if (colDef?.dataType === 'boolean') {
      parsedVal = editValue.toLowerCase() === 'true' || editValue === '1' || editValue === 'yes';
    }

    const idVal = row[primaryIdKey];
    updateRow(sheetName, primaryIdKey, idVal, { [colKey]: parsedVal });

    if (nextCell) {
      setEditingCell(nextCell);
      const nextRow = processedRows[nextCell.rowIdx];
      const nextVal = nextRow ? nextRow[nextCell.colKey] : '';
      setEditValue(nextVal !== null && nextVal !== undefined ? String(nextVal) : '');
    } else {
      setEditingCell(null);
    }
  };

  // Direct Inline Add Row with Auto-Increment
  const handleAddRowInline = () => {
    const nextId = getNextAutoIncrement(sheetName, primaryIdKey);
    const newRow: TableRow = {};

    currentSheet.columns.forEach((c) => {
      if (c.key === primaryIdKey) {
        newRow[c.key] = nextId;
      } else if (c.key === 'sku') {
        newRow[c.key] = getNextAutoIncrement(sheetName, 'sku');
      } else if (c.key.includes('date') || c.key.includes('created') || c.key.includes('updated')) {
        newRow[c.key] = new Date().toISOString().split('T')[0];
      } else if (c.key === 'status') {
        newRow[c.key] = 'active';
      } else if (c.dataType === 'number' || c.dataType === 'currency') {
        newRow[c.key] = 0;
      } else {
        newRow[c.key] = '';
      }
    });

    addRow(sheetName, newRow);
    addNotification('success', 'Row Added', `Auto-incremented ID: ${nextId}`);

    const targetCol = visibleColumns.length > 1 ? visibleColumns[1].key : visibleColumns[0].key;
    setEditingCell({ rowIdx: 0, colKey: targetCol });
    setEditValue('');
  };

  const handleDuplicateRow = (row: TableRow) => {
    const dup = { ...row };
    const nextId = getNextAutoIncrement(sheetName, primaryIdKey);
    dup[primaryIdKey] = nextId;

    if (dup['sku']) {
      dup['sku'] = getNextAutoIncrement(sheetName, 'sku');
    }

    addRow(sheetName, dup);
    addNotification('success', 'Row Duplicated', `Created record with auto-increment ID ${nextId}`);
  };

  const handleDeleteRow = (row: TableRow) => {
    const idVal = row[primaryIdKey];
    if (window.confirm(`Are you sure you want to delete row "${idVal}"?`)) {
      deleteRow(sheetName, primaryIdKey, idVal);
      addNotification('info', 'Row Deleted', `Removed ${idVal} from ${sheetName}`);
    }
  };

  // Column visibility management
  const handleToggleColumn = (colKey: string) => {
    const isHidden = hiddenColumns.includes(colKey);
    const newHidden = isHidden
      ? hiddenColumns.filter((k) => k !== colKey)
      : [...hiddenColumns, colKey];
    setSheetHiddenColumns(sheetName, newHidden);
  };

  const handleShowAllColumns = () => {
    setSheetHiddenColumns(sheetName, []);
    addNotification('info', 'Columns Shown', 'All columns are now visible');
  };

  const handleResetRecommended = () => {
    const recommended = RECOMMENDED_VISIBLE_COLUMNS[sheetName];
    if (recommended) {
      const hidden = currentSheet.columns.map((c) => c.key).filter((k) => !recommended.includes(k));
      setSheetHiddenColumns(sheetName, hidden);
    } else {
      setSheetHiddenColumns(sheetName, currentSheet.columns.slice(6).map((c) => c.key));
    }
    addNotification('info', 'Columns Reset', 'Restored recommended columns');
  };

  const handleHideColumnDirectly = (colKey: string) => {
    if (visibleColumns.length <= 1) {
      addNotification('warning', 'Cannot Hide', 'At least one column must remain visible');
      return;
    }
    const newHidden = [...hiddenColumns, colKey];
    setSheetHiddenColumns(sheetName, newHidden);
    setActiveColMenu(null);
    addNotification('info', 'Column Hidden', `Hidden column "${colKey}". You can restore it from Columns.`);
  };

  // Add New Column
  const handleCreateColumn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColName.trim()) return;

    const sanitizedKey = newColName.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');
    const newCol: ColumnDef = {
      key: sanitizedKey,
      name: newColName.trim(),
      dataType: newColType,
      defaultValue: newColDefault || (newColType === 'number' || newColType === 'currency' ? 0 : ''),
    };

    addColumn(sheetName, newCol);
    addNotification('success', 'Column Added', `Added column "${newCol.name}" (${newColType}) to ${sheetName}`);
    setIsAddColumnOpen(false);
    setNewColName('');
    setNewColDefault('');
  };

  const handleRenameColumnSubmit = (colKey: string) => {
    if (!renamedColName.trim()) {
      setRenamingColKey(null);
      return;
    }
    renameColumn(sheetName, colKey, renamedColName.trim());
    addNotification('success', 'Column Renamed', `Column renamed to "${renamedColName}"`);
    setRenamingColKey(null);
    setActiveColMenu(null);
  };

  const handleDeleteColumnConfirm = (colKey: string) => {
    if (window.confirm(`Are you sure you want to remove column "${colKey}" from this sheet?`)) {
      deleteColumn(sheetName, colKey);
      addNotification('info', 'Column Removed', `Deleted column ${colKey}`);
      setActiveColMenu(null);
    }
  };

  const handleExportCSV = () => {
    const headers = visibleColumns.map((c) => c.name).join(',');
    const rows = processedRows.map((r) =>
      visibleColumns.map((c) => `"${String(r[c.key] ?? '').replace(/"/g, '""')}"`).join(',')
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${sheetName.replace('_', '')}_export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addNotification('success', 'Export Complete', `Exported ${processedRows.length} rows to CSV`);
  };

  // Density classes for spreadsheet feel
  const rowHeightClass =
    tableDensity === 'compact' ? 'py-1.5 px-3 text-[11px]' : tableDensity === 'comfortable' ? 'py-3.5 px-4 text-xs' : 'py-2 px-3.5 text-xs';

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-background">
      {/* Table Toolbar */}
      <div className="h-14 border-b border-border bg-card/60 backdrop-blur-md px-6 flex items-center justify-between gap-4 shrink-0 select-none">
        <div className="flex items-center gap-3">
          <h2 className="text-base font-extrabold text-foreground capitalize tracking-tight">
            {sheetName.replace('_', '')}
          </h2>
          <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-mono font-medium">
            {processedRows.length} rows
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-mono font-semibold">
            {visibleColumns.length}/{currentSheet.columns.length} cols
          </span>
        </div>

        {/* Center: Search */}
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder={`Search ${processedRows.length} records in ${sheetName.replace('_', '')}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-muted/40 border border-border rounded-xl text-foreground focus:outline-none focus:border-primary placeholder:text-muted-foreground shadow-2xs"
            />
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Prominent Column Customization Button */}
          <button
            onClick={() => setIsColumnModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 rounded-xl transition font-bold teal-glow-sm"
            title="Configure which columns are visible on this page"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>Columns ({visibleColumns.length}/{currentSheet.columns.length})</span>
          </button>

          {/* Add Column Button */}
          <button
            onClick={() => setIsAddColumnOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-muted/60 hover:bg-muted text-foreground border border-border rounded-xl transition font-medium"
            title="Create new column attribute in this sheet"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Column</span>
          </button>

          {/* Density Toggle Button */}
          <div className="flex items-center bg-muted/50 p-0.5 rounded-xl border border-border text-[10px] font-semibold">
            <button
              onClick={() => setTableDensity('compact')}
              className={`px-2 py-1 rounded-lg transition ${
                tableDensity === 'compact' ? 'bg-primary text-primary-foreground font-bold shadow-xs' : 'text-muted-foreground hover:text-foreground'
              }`}
              title="Compact density"
            >
              Compact
            </button>
            <button
              onClick={() => setTableDensity('normal')}
              className={`px-2 py-1 rounded-lg transition ${
                tableDensity === 'normal' ? 'bg-primary text-primary-foreground font-bold shadow-xs' : 'text-muted-foreground hover:text-foreground'
              }`}
              title="Standard density"
            >
              Normal
            </button>
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-muted/60 hover:bg-muted text-foreground border border-border rounded-xl transition"
            title="Export current view to CSV"
          >
            <Download className="h-3.5 w-3.5 text-muted-foreground" />
            <span>Export</span>
          </button>

          {/* Primary Add Row Page Button */}
          <button
            onClick={() => {
              setTargetRecord({ sheetName, mode: 'add' });
              setActiveSheet('record_form');
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl shadow-sm teal-glow-sm transition"
            title="Open dedicated full page to create new record"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Record</span>
          </button>
        </div>
      </div>

      {/* Spreadsheet Canvas */}
      <div className="flex-1 overflow-auto bg-card">
        <table className="w-full border-collapse text-left text-xs">
          {/* Sticky Table Header */}
          <thead className="sticky top-0 bg-muted/60 dark:bg-card border-b border-border z-10 select-none shadow-xs backdrop-blur-md">
            <tr>
              <th className="w-12 px-3 py-2.5 font-mono text-[10px] text-muted-foreground border-r border-border/70 text-center">
                #
              </th>
              {visibleColumns.map((col) => {
                const isSorted = sortColumn === col.key;
                const isMenuOpen = activeColMenu === col.key;
                const isRenaming = renamingColKey === col.key;

                return (
                  <th
                    key={col.key}
                    className="px-3.5 py-2.5 font-bold text-foreground text-[11px] border-r border-border/70 group relative hover:bg-primary/5 transition"
                  >
                    <div className="flex items-center justify-between gap-1.5">
                      {isRenaming ? (
                        <div className="flex items-center gap-1">
                          <input
                            autoFocus
                            type="text"
                            value={renamedColName}
                            onChange={(e) => setRenamedColName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleRenameColumnSubmit(col.key);
                              if (e.key === 'Escape') setRenamingColKey(null);
                            }}
                            className="px-1 py-0.5 text-xs bg-background border border-primary rounded text-foreground outline-none"
                          />
                          <button
                            onClick={() => handleRenameColumnSubmit(col.key)}
                            className="text-primary hover:opacity-80 p-0.5"
                          >
                            <Check className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        <div
                          onClick={() => handleSort(col.key)}
                          className="flex items-center gap-1.5 cursor-pointer flex-1 truncate"
                        >
                          <span className="truncate">{col.name}</span>
                          <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-muted text-muted-foreground uppercase">
                            {col.dataType}
                          </span>
                          {isSorted ? (
                            sortDirection === 'asc' ? (
                              <ArrowUp className="h-3 w-3 text-primary shrink-0" />
                            ) : (
                              <ArrowDown className="h-3 w-3 text-primary shrink-0" />
                            )
                          ) : (
                            <ArrowUpDown className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition shrink-0" />
                          )}
                        </div>
                      )}

                      {/* Header Menu Action Dropdown */}
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveColMenu(isMenuOpen ? null : col.key);
                          }}
                          className="p-1 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition rounded"
                        >
                          <MoreVertical className="h-3 w-3" />
                        </button>

                        {isMenuOpen && (
                          <div className="absolute right-0 mt-1 w-44 bg-card border border-border rounded-xl shadow-2xl py-1.5 z-50 animate-in fade-in space-y-0.5">
                            <button
                              onClick={() => handleHideColumnDirectly(col.key)}
                              className="w-full px-3 py-1.5 text-left text-xs text-foreground hover:bg-muted flex items-center gap-2"
                            >
                              <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />
                              <span>Hide Column</span>
                            </button>
                            <button
                              onClick={() => {
                                setRenamingColKey(col.key);
                                setRenamedColName(col.name);
                                setActiveColMenu(null);
                              }}
                              className="w-full px-3 py-1.5 text-left text-xs text-foreground hover:bg-muted flex items-center gap-2"
                            >
                              <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
                              <span>Rename Column</span>
                            </button>
                            <button
                              onClick={() => handleDeleteColumnConfirm(col.key)}
                              className="w-full px-3 py-1.5 text-left text-xs text-destructive hover:bg-destructive/10 flex items-center gap-2"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              <span>Delete Column</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </th>
                );
              })}

              <th className="w-36 min-w-[144px] px-3 py-2.5 font-bold text-muted-foreground text-center text-[11px]">
                Actions
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-border/60">
            {processedRows.map((row, rIdx) => (
              <tr
                key={row[primaryIdKey] || rIdx}
                className="even:bg-muted/15 odd:bg-card hover:bg-primary/5 transition group"
              >
                {/* Row Number */}
                <td className="w-12 px-3 py-2 text-center text-muted-foreground/70 font-mono text-[10px] border-r border-border/60">
                  {rIdx + 1}
                </td>

                {/* Visible Data Cells */}
                {visibleColumns.map((col, cIdx) => {
                  const val = row[col.key];
                  const isEditing = editingCell?.rowIdx === rIdx && editingCell?.colKey === col.key;
                  const isNumberOrCurrency =
                    col.dataType === 'number' ||
                    col.dataType === 'currency' ||
                    col.key.includes('price') ||
                    col.key.includes('amount') ||
                    col.key.includes('total') ||
                    col.key.includes('quantity');

                  let displayVal: React.ReactNode = val ?? '-';
                  if (
                    col.key.includes('price') ||
                    col.key.includes('amount') ||
                    col.key.includes('total') ||
                    col.key.includes('subtotal') ||
                    col.key.includes('tax')
                  ) {
                    displayVal = formatCurrency(val, currency, currencySymbol);
                  } else if (col.key.includes('date')) {
                    displayVal = formatDate(val);
                  } else if (typeof val === 'boolean') {
                    displayVal = val ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] bg-primary/10 text-primary font-bold border border-primary/20">
                        <Check className="h-2.5 w-2.5" />
                        <span>Active</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] bg-muted/60 text-muted-foreground font-medium border border-border">
                        <X className="h-2.5 w-2.5" />
                        <span>Inactive</span>
                      </span>
                    );
                  } else if (col.key === 'status') {
                    displayVal = (
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          val === 'active' || val === 'completed'
                            ? 'bg-primary/15 text-primary'
                            : 'bg-amber-500/15 text-amber-500'
                        }`}
                      >
                        {String(val)}
                      </span>
                    );
                  }

                  return (
                    <td
                      key={col.key}
                      onClick={() => handleStartEdit(rIdx, col.key, val)}
                      className={`${rowHeightClass} text-foreground truncate max-w-xs cursor-text border-r border-border/60 relative group/cell hover:bg-muted/40 ${
                        isNumberOrCurrency ? 'font-mono text-right' : ''
                      }`}
                      title="Click to edit cell"
                    >
                      {isEditing ? (
                        <div className="flex items-center gap-1">
                          <input
                            ref={editInputRef}
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleCommitEdit(row);
                              } else if (e.key === 'Tab') {
                                e.preventDefault();
                                const nextCIdx = (cIdx + 1) % visibleColumns.length;
                                const nextRIdx = nextCIdx === 0 ? Math.min(rIdx + 1, processedRows.length - 1) : rIdx;
                                handleCommitEdit(row, { rowIdx: nextRIdx, colKey: visibleColumns[nextCIdx].key });
                              } else if (e.key === 'Escape') {
                                setEditingCell(null);
                              }
                            }}
                            onBlur={() => handleCommitEdit(row)}
                            className="w-full px-2 py-1 text-xs bg-background border-2 border-primary rounded-lg outline-none shadow-md text-foreground font-semibold"
                          />
                        </div>
                      ) : (
                        <div className={`flex items-center ${isNumberOrCurrency ? 'justify-end' : 'justify-between'} gap-1.5`}>
                          <span className="truncate">{displayVal}</span>
                          <Edit2 className="h-3 w-3 text-muted-foreground opacity-0 group-hover/cell:opacity-60 transition shrink-0" />
                        </div>
                      )}
                    </td>
                  );
                })}

                {/* Row Action Buttons */}
                <td className="w-36 min-w-[144px] px-3 py-1.5 text-center border-border/60">
                  <div className="inline-flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        setTargetRecord({ sheetName, rowId: row[primaryIdKey], row, mode: 'view' });
                        setActiveSheet('record_detail');
                      }}
                      className="p-1.5 text-blue-500 bg-blue-500/10 hover:bg-blue-500 hover:text-white border border-blue-500/25 rounded-lg transition shadow-2xs inline-flex items-center justify-center"
                      title="View Record (Full Page)"
                    >
                      <FileText className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        setTargetRecord({ sheetName, rowId: row[primaryIdKey], row, mode: 'edit' });
                        setActiveSheet('record_form');
                      }}
                      className="p-1.5 text-primary bg-primary/10 hover:bg-primary hover:text-primary-foreground border border-primary/25 rounded-lg transition shadow-2xs inline-flex items-center justify-center"
                      title="Edit Record (Full Page)"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDuplicateRow(row)}
                      className="p-1.5 text-amber-500 bg-amber-500/10 hover:bg-amber-500 hover:text-white border border-amber-500/25 rounded-lg transition shadow-2xs inline-flex items-center justify-center"
                      title="Duplicate Record"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteRow(row)}
                      className="p-1.5 text-destructive bg-destructive/10 hover:bg-destructive hover:text-white border border-destructive/25 rounded-lg transition shadow-2xs inline-flex items-center justify-center"
                      title="Delete Record"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {/* Quick Add Row Button (Spreadsheet-like bottom row) */}
            <tr
              onClick={handleAddRowInline}
              className="hover:bg-primary/5 cursor-pointer border-t border-dashed border-primary/30 transition group"
            >
              <td className="px-3 py-2.5 text-center text-primary font-bold border-r border-border/60">
                <Plus className="h-4 w-4 mx-auto group-hover:scale-125 transition" />
              </td>
              <td
                colSpan={visibleColumns.length + 1}
                className="px-3.5 py-2.5 text-xs font-bold text-primary transition"
              >
                Insert new row (Auto-increments ID: <span className="font-mono">{getNextAutoIncrement(sheetName, primaryIdKey)}</span>)
              </td>
            </tr>
          </tbody>

          {/* Excel-Grade Summary Footer Row */}
          {processedRows.length > 0 && (
            <tfoot className="sticky bottom-0 bg-card border-t-2 border-border z-10 font-bold text-xs shadow-md">
              <tr className="bg-muted/40">
                <td className="w-12 px-3 py-2 text-center text-primary font-mono text-[10px] border-r border-border/70">
                  <Sigma className="h-3.5 w-3.5 mx-auto text-primary" />
                </td>
                {visibleColumns.map((col, idx) => {
                  const hasTotal = columnTotals[col.key] !== undefined;
                  const isFirst = idx === 0;

                  return (
                    <td
                      key={col.key}
                      className={`px-3.5 py-2 border-r border-border/70 text-foreground font-mono ${
                        hasTotal ? 'text-right font-extrabold text-primary' : isFirst ? 'font-bold' : ''
                      }`}
                    >
                      {hasTotal
                        ? col.dataType === 'currency' || col.key.includes('price') || col.key.includes('amount') || col.key.includes('total')
                          ? formatCurrency(columnTotals[col.key], currency, currencySymbol)
                          : `${columnTotals[col.key]}`
                        : isFirst
                        ? `Total (${processedRows.length})`
                        : ''}
                    </td>
                  );
                })}
                <td className="w-24 px-3 py-2"></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* Column Configuration Modal */}
      {isColumnModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4 select-none animate-in fade-in">
          <div className="bg-card border border-border rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-5 w-5 text-primary" />
                <div>
                  <h3 className="text-sm font-bold text-foreground">Configure Columns</h3>
                  <p className="text-[11px] text-muted-foreground">Select which columns to show for {sheetName.replace('_', '')}</p>
                </div>
              </div>
              <button
                onClick={() => setIsColumnModalOpen(false)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-lg"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Quick Actions & Column Search */}
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={handleShowAllColumns}
                  className="px-2.5 py-1 bg-muted/60 hover:bg-muted text-foreground rounded-lg border border-border transition text-[11px] font-semibold"
                >
                  Show All ({currentSheet.columns.length})
                </button>
                <button
                  type="button"
                  onClick={handleResetRecommended}
                  className="px-2.5 py-1 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg border border-primary/20 transition text-[11px] font-semibold"
                >
                  <RotateCcw className="h-3 w-3 inline mr-1" />
                  Recommended
                </button>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Filter columns..."
                  value={columnSearchFilter}
                  onChange={(e) => setColumnSearchFilter(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-muted/30 border border-border rounded-xl text-foreground focus:outline-none focus:border-primary text-xs"
                />
              </div>

              {/* Column list with checkboxes */}
              <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1 divide-y divide-border/40">
                {currentSheet.columns
                  .filter((c) =>
                    !columnSearchFilter.trim() ||
                    c.name.toLowerCase().includes(columnSearchFilter.toLowerCase()) ||
                    c.key.toLowerCase().includes(columnSearchFilter.toLowerCase())
                  )
                  .map((col) => {
                    const isVisible = !hiddenColumns.includes(col.key);

                    return (
                      <div
                        key={col.key}
                        onClick={() => handleToggleColumn(col.key)}
                        className="flex items-center justify-between p-2 rounded-xl hover:bg-muted/50 cursor-pointer transition select-none pt-2"
                      >
                        <div className="flex items-center gap-2.5">
                          {isVisible ? (
                            <CheckSquare className="h-4 w-4 text-primary" />
                          ) : (
                            <Square className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span className={`text-xs ${isVisible ? 'font-bold text-foreground' : 'text-muted-foreground'}`}>
                            {col.name}
                          </span>
                        </div>

                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground uppercase">
                          {col.dataType}
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>

            <div className="pt-3 border-t border-border flex justify-end">
              <button
                onClick={() => setIsColumnModalOpen(false)}
                className="px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-xl shadow-md teal-glow transition"
              >
                Done ({visibleColumns.length} Visible)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Create New Column (Cell Attribute) */}
      {isAddColumnOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4 select-none animate-in fade-in">
          <div className="bg-card border border-border rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Columns className="h-5 w-5 text-primary" />
                <h3 className="text-base font-bold text-foreground">Add New Column</h3>
              </div>
              <button
                onClick={() => setIsAddColumnOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateColumn} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-foreground mb-1">Column / Header Name *</label>
                <input
                  autoFocus
                  required
                  type="text"
                  value={newColName}
                  onChange={(e) => setNewColName(e.target.value)}
                  placeholder="e.g. Warranty Period, Barcode, Serial Number"
                  className="w-full px-3 py-2 bg-muted/50 border border-border rounded-xl text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">Data Type</label>
                <select
                  value={newColType}
                  onChange={(e) => setNewColType(e.target.value as DataType)}
                  className="w-full px-3 py-2 bg-muted/50 border border-border rounded-xl text-foreground focus:outline-none focus:border-primary"
                >
                  <option value="text">Text (General string)</option>
                  <option value="number">Number (Integer / Decimal)</option>
                  <option value="currency">Currency (Amount with currency symbol)</option>
                  <option value="date">Date (YYYY-MM-DD)</option>
                  <option value="boolean">Boolean (Yes / No toggle)</option>
                  <option value="email">Email</option>
                  <option value="phone">Phone</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">Default Cell Value (Optional)</label>
                <input
                  type="text"
                  value={newColDefault}
                  onChange={(e) => setNewColDefault(e.target.value)}
                  placeholder="Initial value for existing rows"
                  className="w-full px-3 py-2 bg-muted/50 border border-border rounded-xl text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsAddColumnOpen(false)}
                  className="px-3.5 py-1.5 text-muted-foreground hover:text-foreground rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-primary text-primary-foreground font-bold rounded-xl shadow-sm teal-glow-sm hover:bg-primary/90 transition"
                >
                  Add Column
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
