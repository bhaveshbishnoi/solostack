import React, { useState } from 'react';
import { useWorkbookStore } from '../../stores/workbookStore';
import { useUIStore } from '../../stores/uiStore';
import { ColumnDef, DataType } from '../../types';
import {
  ArrowLeft,
  Table as TableIcon,
  Plus,
  Trash2,
  CheckCircle2
} from 'lucide-react';

export const CreateTablePage: React.FC = () => {
  const { createCustomTable, saveWorkbook, setActiveSheet } = useWorkbookStore();
  const { addNotification } = useUIStore();

  const [tableName, setTableName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [pinnedToSidebar, setPinnedToSidebar] = useState(true);
  const [columns, setColumns] = useState<ColumnDef[]>([
    { key: 'id', name: 'ID', dataType: 'text', required: true },
    { key: 'name', name: 'Name', dataType: 'text', required: true },
    { key: 'category', name: 'Category', dataType: 'text' },
    { key: 'amount', name: 'Amount', dataType: 'currency' },
    { key: 'date', name: 'Date', dataType: 'date' },
    { key: 'notes', name: 'Notes', dataType: 'text' },
  ]);

  const handleAddColumn = () => {
    const nextIdx = columns.length + 1;
    setColumns([
      ...columns,
      {
        key: `column_${nextIdx}`,
        name: `Column ${nextIdx}`,
        dataType: 'text',
      },
    ]);
  };

  const handleUpdateColumn = (idx: number, updates: Partial<ColumnDef>) => {
    const newCols = [...columns];
    newCols[idx] = { ...newCols[idx], ...updates };
    if (updates.name && !updates.key) {
      newCols[idx].key = updates.name.toLowerCase().replace(/[^a-z0-9_]/g, '_');
    }
    setColumns(newCols);
  };

  const handleRemoveColumn = (idx: number) => {
    if (columns.length <= 1) return;
    setColumns(columns.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tableName.trim()) {
      addNotification('warning', 'Validation Error', 'Table key / name is required');
      return;
    }

    try {
      const sanitizedName = tableName.trim().replace(/[^a-zA-Z0-9_]/g, '_');
      const finalSheetName = sanitizedName.startsWith('_') ? sanitizedName : `_${sanitizedName}`;
      const tableId = `tbl_${Date.now()}`;

      createCustomTable({
        tableId,
        name: finalSheetName,
        displayName: displayName || tableName,
        icon: 'table',
        columns,
        pinnedToSidebar,
      });

      await saveWorkbook();
      addNotification('success', 'Custom Table Created', `Added sheet: ${finalSheetName}`);
      setActiveSheet(finalSheetName);
    } catch (err: any) {
      addNotification('error', 'Creation Failed', err.message || 'Failed to create table');
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-background">
      {/* Header */}
      <div className="h-14 border-b border-border bg-card/60 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveSheet('dashboard')}
            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition"
            title="Back to Dashboard"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2">
            <TableIcon className="h-5 w-5 text-primary" />
            <h1 className="text-base font-bold text-foreground">Create Custom Business Table</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSheet('dashboard')}
            className="px-3.5 py-1.5 text-xs text-muted-foreground hover:text-foreground rounded-xl transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl shadow-sm teal-glow-sm transition"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>Create Table & Sheet</span>
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-2xl mx-auto bg-card border border-border rounded-2xl p-8 shadow-sm space-y-6">
          <div className="border-b border-border pb-4">
            <h2 className="text-sm font-bold text-foreground">Table Details & Attributes</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Custom tables are automatically stored as dedicated sheets in your Excel workbook.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-foreground mb-1">
                  Sheet / Table Key *
                </label>
                <input
                  required
                  type="text"
                  value={tableName}
                  onChange={(e) => {
                    setTableName(e.target.value);
                    if (!displayName) setDisplayName(e.target.value);
                  }}
                  placeholder="e.g. Warranty or Employees"
                  className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">
                  Display Title
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Warranty Claims"
                  className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl text-foreground focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="pinSidebarPage"
                checked={pinnedToSidebar}
                onChange={(e) => setPinnedToSidebar(e.target.checked)}
                className="rounded border-border h-4 w-4"
              />
              <label htmlFor="pinSidebarPage" className="text-xs text-foreground font-medium cursor-pointer select-none">
                Pin as dedicated menu item in sidebar navigation
              </label>
            </div>

            {/* Dynamic Columns */}
            <div className="border border-border rounded-2xl p-4 space-y-3 bg-muted/10">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-foreground text-xs">Column Schema ({columns.length})</span>
                  <p className="text-[11px] text-muted-foreground">Define each data field for this table</p>
                </div>
                <button
                  type="button"
                  onClick={handleAddColumn}
                  className="flex items-center gap-1 text-xs text-primary hover:underline font-semibold"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Column</span>
                </button>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {columns.map((col, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 bg-card p-2.5 rounded-xl border border-border/80 shadow-xs"
                  >
                    <input
                      type="text"
                      value={col.name}
                      onChange={(e) => handleUpdateColumn(idx, { name: e.target.value })}
                      placeholder="Column Name"
                      className="flex-1 px-2.5 py-1.5 bg-muted/30 border border-border rounded-lg text-foreground text-xs"
                    />

                    <select
                      value={col.dataType}
                      onChange={(e) => handleUpdateColumn(idx, { dataType: e.target.value as DataType })}
                      className="px-2.5 py-1.5 bg-muted/30 border border-border rounded-lg text-foreground text-xs"
                    >
                      <option value="text">Text</option>
                      <option value="number">Number</option>
                      <option value="currency">Currency</option>
                      <option value="date">Date</option>
                      <option value="boolean">Boolean</option>
                      <option value="email">Email</option>
                      <option value="phone">Phone</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => handleRemoveColumn(idx)}
                      disabled={columns.length <= 1}
                      className="p-1.5 text-muted-foreground hover:text-destructive rounded-lg transition disabled:opacity-30"
                      title="Remove column"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
              <button
                type="button"
                onClick={() => setActiveSheet('dashboard')}
                className="px-4 py-2 text-xs text-muted-foreground hover:text-foreground rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl shadow-md teal-glow transition"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Create Table & Open</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
