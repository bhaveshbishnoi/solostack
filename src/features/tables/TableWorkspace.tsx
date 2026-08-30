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
  Eye,
  Columns,
  Edit2,
  Edit3,
  FileText,
  MoreVertical,
  X,
  Check,
} from 'lucide-react';

interface TableWorkspaceProps {
  sheetName: string;
}

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

  const { tableDensity } = useSettingsStore();
  const { addNotification, setTargetRecord } = useUIStore();

  const currentSheet = sheets[sheetName];
  const [searchQuery, setSearchQuery] = useState('');
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [hiddenColumns, setHiddenColumns] = useState<string[]>([]);
  const [showColumnPicker, setShowColumnPicker] = useState(false);

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
    return currentSheet.columns.filter((c) => !hiddenColumns.includes(c.key));
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

    // Auto-focus the second column for immediate typing
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

  // Add New Column (Cell/Column Schema)
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

  const pyClass = tableDensity === 'compact' ? 'py-1.5' : tableDensity === 'comfortable' ? 'py-3.5' : 'py-2.5';

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-background">
      {/* Table Toolbar */}
      <div className="h-14 border-b border-border bg-card/60 px-6 flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <h2 className="text-base font-bold text-foreground capitalize">
            {sheetName.replace('_', '')}
          </h2>
          <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-mono">
            {processedRows.length} rows
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-mono">
            {currentSheet.columns.length} columns
          </span>
        </div>

        {/* Center: Search */}
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder={`Search in ${sheetName.replace('_', '')}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none focus:border-primary placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Add Column Button */}
          <button
            onClick={() => setIsAddColumnOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs bg-muted/60 hover:bg-muted text-foreground border border-border rounded-lg transition font-medium"
            title="Create new column/field in this sheet"
          >
            <Columns className="h-3.5 w-3.5 text-indigo-400" />
            <span>+ New Column</span>
          </button>

          {/* Column Visibility toggle popover */}
          <div className="relative">
            <button
              onClick={() => setShowColumnPicker(!showColumnPicker)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs bg-muted/60 hover:bg-muted text-foreground border border-border rounded-lg transition"
              title="Configure visible columns"
            >
              <Eye className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Columns</span>
            </button>

            {showColumnPicker && (
              <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-xl shadow-xl p-3 z-50 space-y-2 animate-in fade-in">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Toggle Columns
                </div>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {currentSheet.columns.map((c) => {
                    const isVisible = !hiddenColumns.includes(c.key);
                    return (
                      <label key={c.key} className="flex items-center gap-2 text-xs text-foreground cursor-pointer hover:bg-muted/50 p-1 rounded">
                        <input
                          type="checkbox"
                          checked={isVisible}
                          onChange={() => {
                            if (isVisible) {
                              setHiddenColumns([...hiddenColumns, c.key]);
                            } else {
                              setHiddenColumns(hiddenColumns.filter((k) => k !== c.key));
                            }
                          }}
                          className="rounded border-border"
                        />
                        <span className="truncate">{c.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs bg-muted/60 hover:bg-muted text-foreground border border-border rounded-lg transition"
            title="Export view to CSV"
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
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg shadow-sm transition"
            title="Open dedicated full page to create new record"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>+ Add Record (Page)</span>
          </button>

          {/* Quick Inline Add Row Button */}
          <button
            onClick={handleAddRowInline}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs bg-muted/60 hover:bg-muted text-foreground border border-border rounded-lg transition font-medium"
            title="Insert row directly inline with auto-increment ID"
          >
            <span>+ Quick Row</span>
          </button>
        </div>
      </div>

      {/* Table Canvas */}
      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse text-left text-xs">
          <thead className="sticky top-0 bg-card border-b border-border z-10 select-none shadow-sm">
            <tr>
              <th className="w-12 px-4 py-3 font-semibold text-muted-foreground/80 text-[11px]">#</th>
              {visibleColumns.map((col) => {
                const isSorted = sortColumn === col.key;
                const isMenuOpen = activeColMenu === col.key;
                const isRenaming = renamingColKey === col.key;

                return (
                  <th
                    key={col.key}
                    className="px-4 py-3 font-semibold text-foreground text-[11px] group relative hover:bg-muted/40 transition"
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
                            className="text-emerald-500 hover:text-emerald-400 p-0.5"
                          >
                            <Check className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        <div
                          onClick={() => handleSort(col.key)}
                          className="flex items-center gap-1.5 cursor-pointer flex-1"
                        >
                          <span className="truncate">{col.name}</span>
                          <span className="text-[9px] font-mono px-1 rounded bg-muted/60 text-muted-foreground">
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

                      {/* Column Header Action Dropdown */}
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
                          <div className="absolute right-0 mt-1 w-36 bg-card border border-border rounded-xl shadow-2xl py-1 z-50 animate-in fade-in">
                            <button
                              onClick={() => {
                                setRenamingColKey(col.key);
                                setRenamedColName(col.name);
                                setActiveColMenu(null);
                              }}
                              className="w-full px-3 py-1.5 text-left text-xs text-foreground hover:bg-muted flex items-center gap-2"
                            >
                              <Edit2 className="h-3 w-3 text-muted-foreground" />
                              <span>Rename Column</span>
                            </button>
                            <button
                              onClick={() => handleDeleteColumnConfirm(col.key)}
                              className="w-full px-3 py-1.5 text-left text-xs text-destructive hover:bg-destructive/10 flex items-center gap-2"
                            >
                              <Trash2 className="h-3 w-3" />
                              <span>Delete Column</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </th>
                );
              })}

              {/* Plus Column Button as Table Header Header Cell */}
              <th className="w-10 px-2 py-3 text-center">
                <button
                  onClick={() => setIsAddColumnOpen(true)}
                  className="h-6 w-6 rounded bg-muted/60 hover:bg-muted hover:text-primary flex items-center justify-center text-muted-foreground transition mx-auto"
                  title="Create new column (cell attribute)"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </th>

              <th className="w-20 px-4 py-3 font-semibold text-muted-foreground/80 text-right text-[11px]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {processedRows.map((row, rIdx) => (
              <tr key={row[primaryIdKey] || rIdx} className="hover:bg-muted/30 transition group">
                <td className={`px-4 ${pyClass} text-muted-foreground/70 font-mono text-[11px]`}>
                  {rIdx + 1}
                </td>
                {visibleColumns.map((col, cIdx) => {
                  const val = row[col.key];
                  const isEditing = editingCell?.rowIdx === rIdx && editingCell?.colKey === col.key;

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
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-500 font-bold">
                        YES
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-muted text-muted-foreground">
                        NO
                      </span>
                    );
                  }

                  return (
                    <td
                      key={col.key}
                      onClick={() => handleStartEdit(rIdx, col.key, val)}
                      className={`px-4 ${pyClass} text-foreground truncate max-w-xs cursor-text relative group/cell hover:bg-muted/50`}
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
                            className="w-full px-2 py-1 text-xs bg-background border-2 border-primary rounded-md outline-none shadow-md text-foreground font-medium"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <span className="truncate">{displayVal}</span>
                          <Edit2 className="h-3 w-3 text-muted-foreground opacity-0 group-hover/cell:opacity-60 transition ml-1 shrink-0" />
                        </div>
                      )}
                    </td>
                  );
                })}

                {/* Empty cell for the "+" column alignment */}
                <td className="w-10"></td>

                {/* Row Action Buttons */}
                <td className={`px-4 ${pyClass} text-right space-x-1`}>
                  <button
                    onClick={() => {
                      setTargetRecord({ sheetName, rowId: row[primaryIdKey], row, mode: 'view' });
                      setActiveSheet('record_detail');
                    }}
                    className="p-1 text-muted-foreground hover:text-primary opacity-0 group-hover:opacity-100 transition rounded"
                    title="View Full Record Details (Page)"
                  >
                    <FileText className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      setTargetRecord({ sheetName, rowId: row[primaryIdKey], row, mode: 'edit' });
                      setActiveSheet('record_form');
                    }}
                    className="p-1 text-muted-foreground hover:text-primary opacity-0 group-hover:opacity-100 transition rounded"
                    title="Edit Record (Page)"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDuplicateRow(row)}
                    className="p-1 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition rounded"
                    title="Duplicate Row (with Auto-Increment ID)"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteRow(row)}
                    className="p-1 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition rounded"
                    title="Delete Row"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </td>
              </tr>
            ))}

            {/* Quick Add Row Button (Spreadsheet-like bottom row) */}
            <tr
              onClick={handleAddRowInline}
              className="hover:bg-primary/5 cursor-pointer border-t border-dashed border-border/80 transition group"
            >
              <td className="px-4 py-3 text-center text-primary font-bold">
                <Plus className="h-4 w-4 mx-auto group-hover:scale-125 transition" />
              </td>
              <td
                colSpan={visibleColumns.length + 2}
                className="px-4 py-3 text-xs font-semibold text-primary/80 group-hover:text-primary transition"
              >
                + Click to insert new row (Auto-increments ID: <span className="font-mono">{getNextAutoIncrement(sheetName, primaryIdKey)}</span>)
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Modal: Create New Column (Cell Attribute) */}
      {isAddColumnOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4 select-none animate-in fade-in">
          <div className="bg-card border border-border rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Columns className="h-5 w-5 text-indigo-500" />
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
                <label className="block font-medium text-foreground mb-1">Column / Header Name *</label>
                <input
                  autoFocus
                  required
                  type="text"
                  value={newColName}
                  onChange={(e) => setNewColName(e.target.value)}
                  placeholder="e.g. Warranty Period, Barcode, Serial Number"
                  className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block font-medium text-foreground mb-1">Data Type</label>
                <select
                  value={newColType}
                  onChange={(e) => setNewColType(e.target.value as DataType)}
                  className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none focus:border-primary"
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
                <label className="block font-medium text-foreground mb-1">Default Cell Value (Optional)</label>
                <input
                  type="text"
                  value={newColDefault}
                  onChange={(e) => setNewColDefault(e.target.value)}
                  placeholder="Initial value for existing rows"
                  className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsAddColumnOpen(false)}
                  className="px-3 py-1.5 text-muted-foreground hover:text-foreground rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-primary text-primary-foreground font-semibold rounded-lg shadow-sm hover:bg-primary/90 transition"
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
