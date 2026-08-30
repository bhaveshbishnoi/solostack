import React, { useState } from 'react';
import { useWorkbookStore } from '../../stores/workbookStore';
import { useUIStore } from '../../stores/uiStore';
import { ColumnDef, DataType } from '../../types';
import { IconPicker } from '../../components/common/IconPicker';
import { X, Table as TableIcon, Plus, Trash2, Link2 } from 'lucide-react';

export const CreateTableModal: React.FC = () => {
  const { activeModal, closeModal, addNotification } = useUIStore();
  const { createCustomTable, saveWorkbook, sheets } = useWorkbookStore();

  const isOpen = activeModal === 'create_table';

  const [tableName, setTableName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('table');
  const [pinnedToSidebar, setPinnedToSidebar] = useState(true);
  const [columns, setColumns] = useState<ColumnDef[]>([
    { key: 'id', name: 'ID', dataType: 'text', required: true },
    { key: 'name', name: 'Name', dataType: 'text', required: true },
    { key: 'notes', name: 'Notes', dataType: 'text' },
  ]);

  const existingSheetKeys = Object.keys(sheets).filter((s) => !s.startsWith('_App') && !s.startsWith('_Dashboard'));

  if (!isOpen) return null;

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
      addNotification('warning', 'Validation Error', 'Table name is required');
      return;
    }

    try {
      const sanitizedName = tableName.trim().replace(/[^a-zA-Z0-9_]/g, '_');
      const tableId = `tbl_${Date.now()}`;

      createCustomTable({
        tableId,
        name: sanitizedName,
        displayName: displayName || tableName,
        icon: selectedIcon || 'table',
        columns,
        pinnedToSidebar,
      });

      await saveWorkbook();
      addNotification('success', 'Custom Table Created', `Added sheet: ${sanitizedName}`);
      closeModal();
    } catch (err: any) {
      addNotification('error', 'Error', err.message || 'Failed to create table');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4 select-none animate-in fade-in">
      <div className="bg-card border border-border rounded-2xl shadow-2xl max-w-xl w-full p-6 space-y-4 max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between border-b border-border pb-3 shrink-0">
          <div className="flex items-center gap-2">
            <TableIcon className="h-5 w-5 text-primary" />
            <h3 className="text-base font-bold text-foreground">Create Custom Table</h3>
          </div>
          <button onClick={closeModal} className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden space-y-3.5 text-xs">
          <div className="grid grid-cols-2 gap-3 shrink-0">
            <div>
              <label className="block font-medium text-foreground mb-1">Sheet / Table Key *</label>
              <input
                required
                type="text"
                value={tableName}
                onChange={(e) => {
                  setTableName(e.target.value);
                  if (!displayName) setDisplayName(e.target.value);
                }}
                placeholder="e.g. Warranty"
                className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block font-medium text-foreground mb-1">Display Title</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. Warranty Records"
                className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* Table Icon Selector */}
          <div className="shrink-0">
            <IconPicker selectedIcon={selectedIcon} onSelectIcon={setSelectedIcon} />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <input
              type="checkbox"
              id="pinSidebar"
              checked={pinnedToSidebar}
              onChange={(e) => setPinnedToSidebar(e.target.checked)}
              className="rounded border-border"
            />
            <label htmlFor="pinSidebar" className="text-muted-foreground cursor-pointer select-none">
              Pin as dedicated menu item in sidebar navigation (drag & drop to reorder)
            </label>
          </div>

          {/* Columns Editor */}
          <div className="flex-1 flex flex-col overflow-hidden border border-border rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between shrink-0">
              <span className="font-semibold text-foreground uppercase tracking-wider text-[10px]">
                Define Columns ({columns.length})
              </span>
              <button
                type="button"
                onClick={handleAddColumn}
                className="flex items-center gap-1 text-[11px] text-primary hover:underline font-semibold"
              >
                <Plus className="h-3 w-3" />
                <span>Add Column</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {columns.map((col, idx) => (
                <div key={idx} className="space-y-1.5 bg-muted/30 p-2 rounded-lg border border-border/60">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={col.name}
                      onChange={(e) => handleUpdateColumn(idx, { name: e.target.value })}
                      placeholder="Column Name"
                      className="flex-1 px-2.5 py-1 bg-background border border-border rounded text-foreground text-xs font-medium"
                    />
                    <select
                      value={col.dataType}
                      onChange={(e) => handleUpdateColumn(idx, { dataType: e.target.value as DataType })}
                      className="px-2.5 py-1 bg-background border border-border rounded text-foreground text-xs font-medium"
                    >
                      <option value="text">Text</option>
                      <option value="number">Number</option>
                      <option value="currency">Currency</option>
                      <option value="date">Date</option>
                      <option value="boolean">Boolean</option>
                      <option value="email">Email</option>
                      <option value="phone">Phone</option>
                      <option value="reference">🔗 Link to Table</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => handleRemoveColumn(idx)}
                      className="p-1 text-muted-foreground hover:text-destructive rounded"
                      title="Remove column"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {col.dataType === 'reference' && (
                    <div className="flex items-center gap-2 pl-1 pt-1 text-[11px] text-muted-foreground">
                      <Link2 className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span>Connects to:</span>
                      <select
                        value={col.referenceTable || existingSheetKeys[0] || '_Products'}
                        onChange={(e) => handleUpdateColumn(idx, { referenceTable: e.target.value })}
                        className="px-2 py-0.5 bg-background border border-border rounded text-foreground text-xs"
                      >
                        {existingSheetKeys.map((sh) => (
                          <option key={sh} value={sh}>
                            {sheets[sh]?.displayName || sh}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border shrink-0">
            <button
              type="button"
              onClick={closeModal}
              className="px-3 py-1.5 text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-primary text-primary-foreground font-semibold rounded-lg shadow-sm hover:bg-primary/90 transition"
            >
              Create Table & Sheet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
