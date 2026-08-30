import React, { useState, useEffect, useMemo } from 'react';
import { useWorkbookStore } from '../../stores/workbookStore';
import { useUIStore } from '../../stores/uiStore';
import { TableRow } from '../../types';
import {
  ArrowLeft,
  Save,
  Plus,
  CheckCircle2,
  Check,
  X
} from 'lucide-react';

export const RecordFormPage: React.FC = () => {
  const { sheets, addRow, updateRow, saveWorkbook, getNextAutoIncrement, appConfig, setActiveSheet } = useWorkbookStore();
  const { targetRecord, setTargetRecord, addNotification } = useUIStore();

  const sheetName = targetRecord?.sheetName || '_Products';
  const mode = targetRecord?.mode || 'add';
  const currentSheet = sheets[sheetName];

  const currencySymbol = appConfig?.currencySymbol || '₹';

  // Detect primary ID column
  const primaryIdKey = useMemo(() => {
    if (!currentSheet?.columns.length) return 'id';
    const firstCol = currentSheet.columns[0].key;
    if (firstCol.endsWith('_id') || firstCol === 'id') return firstCol;
    return currentSheet.columns[0].key;
  }, [currentSheet]);

  // Form values state
  const [formData, setFormData] = useState<TableRow>({});

  // Initialize form
  useEffect(() => {
    if (!currentSheet) return;

    if (mode === 'edit' && targetRecord?.row) {
      setFormData({ ...targetRecord.row });
    } else {
      // Add mode: auto-increment ID and set smart defaults
      const initial: TableRow = {};
      const nextId = getNextAutoIncrement(sheetName, primaryIdKey);

      currentSheet.columns.forEach((col) => {
        if (col.key === primaryIdKey) {
          initial[col.key] = nextId;
        } else if (col.key === 'sku') {
          initial[col.key] = getNextAutoIncrement(sheetName, 'sku');
        } else if (col.key.includes('date') || col.key.includes('created') || col.key.includes('updated')) {
          initial[col.key] = new Date().toISOString().split('T')[0];
        } else if (col.key === 'status') {
          initial[col.key] = 'active';
        } else if (col.dataType === 'number' || col.dataType === 'currency') {
          initial[col.key] = col.defaultValue ?? 0;
        } else if (col.dataType === 'boolean') {
          initial[col.key] = col.defaultValue ?? true;
        } else {
          initial[col.key] = col.defaultValue ?? '';
        }
      });

      setFormData(initial);
    }
  }, [sheetName, mode, currentSheet, primaryIdKey, targetRecord, getNextAutoIncrement]);

  if (!currentSheet) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3">
        <div className="text-muted-foreground text-sm">Sheet "{sheetName}" not found.</div>
        <button
          onClick={() => setActiveSheet('dashboard')}
          className="px-4 py-2 text-xs bg-primary text-primary-foreground rounded-lg"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const handleChange = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (andAddAnother = false) => {
    try {
      const nowIso = new Date().toISOString();
      const payload: TableRow = { ...formData };

      if (payload['updated_at']) {
        payload['updated_at'] = nowIso;
      }

      if (mode === 'edit') {
        const idVal = payload[primaryIdKey];
        updateRow(sheetName, primaryIdKey, idVal, payload);
        addNotification('success', 'Record Updated', `Saved changes to ${idVal}`);
      } else {
        if (!payload['created_at']) {
          payload['created_at'] = nowIso;
        }
        addRow(sheetName, payload);

        // If this was a product, ensure inventory row exists
        if (sheetName === '_Products') {
          const invSheet = sheets['_Inventory'];
          const prodId = payload['product_id'];
          const existingInv = invSheet?.rows.find((i) => i.product_id === prodId);
          if (!existingInv) {
            addRow('_Inventory', {
              inventory_id: `inv_${Date.now()}`,
              product_id: prodId,
              quantity: 10,
              minimum_stock: payload['minimum_stock'] || 5,
              updated_at: nowIso,
            });
          }
        }

        addNotification('success', 'Record Created', `Added new row to ${sheetName.replace('_', '')}`);
      }

      await saveWorkbook();

      if (andAddAnother) {
        // Reset with new incremented ID
        const nextId = getNextAutoIncrement(sheetName, primaryIdKey);
        const resetData: TableRow = { ...formData, [primaryIdKey]: nextId };
        if (resetData['sku']) {
          resetData['sku'] = getNextAutoIncrement(sheetName, 'sku');
        }
        setFormData(resetData);
      } else {
        // Return to table
        setActiveSheet(sheetName);
        setTargetRecord(null);
      }
    } catch (err: any) {
      addNotification('error', 'Save Failed', err.message || 'Could not save record');
    }
  };

  const handleBack = () => {
    setActiveSheet(sheetName);
    setTargetRecord(null);
  };

  const sheetTitle = sheetName.replace('_', '');

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-background">
      {/* Page Header */}
      <div className="h-14 border-b border-border bg-card/60 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition"
            title={`Back to ${sheetTitle} Table`}
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-base font-bold text-foreground capitalize">
              {mode === 'edit' ? `Edit ${sheetTitle} Record` : `Add New ${sheetTitle}`}
            </h1>
            <div className="text-[10px] text-muted-foreground">
              Table: <span className="font-mono">{sheetName}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleBack}
            className="px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground rounded-lg transition"
          >
            Cancel
          </button>
          {mode === 'add' && (
            <button
              onClick={() => handleSave(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-muted/60 hover:bg-muted text-foreground border border-border rounded-xl transition font-medium"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Save & Add Another</span>
            </button>
          )}
          <button
            onClick={() => handleSave(false)}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl shadow-sm teal-glow-sm transition"
          >
            <Save className="h-3.5 w-3.5" />
            <span>Save Record</span>
          </button>
        </div>
      </div>

      {/* Form Body */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-2xl mx-auto bg-card border border-border rounded-2xl p-8 shadow-sm space-y-6">
          <div className="border-b border-border pb-4">
            <h2 className="text-sm font-bold text-foreground">Record Attributes</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Fill in all relevant properties. Fields are stored directly in your Excel sheet.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            {currentSheet.columns.map((col) => {
              const isIdCol = col.key === primaryIdKey;
              const val = formData[col.key] ?? '';

              return (
                <div
                  key={col.key}
                  className={
                    col.key.includes('description') || col.key.includes('address') || col.key.includes('notes')
                      ? 'md:col-span-2'
                      : ''
                  }
                >
                  <label className="block font-semibold text-foreground mb-1 flex items-center justify-between">
                    <span>
                      {col.name} {col.required && <span className="text-destructive">*</span>}
                    </span>
                    <span className="text-[10px] font-mono text-muted-foreground uppercase">
                      {col.dataType}
                    </span>
                  </label>

                  {/* ID field */}
                  {isIdCol ? (
                    <div className="relative">
                      <input
                        disabled={mode === 'edit'}
                        type="text"
                        value={val}
                        onChange={(e) => handleChange(col.key, e.target.value)}
                        className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl text-foreground font-mono focus:outline-none focus:border-primary"
                      />
                      {mode === 'add' && (
                        <span className="absolute right-3 top-2.5 text-[10px] text-primary font-bold">
                          Auto-Increment
                        </span>
                      )}
                    </div>
                  ) : col.dataType === 'boolean' ? (
                    /* Boolean toggle */
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleChange(col.key, !val)}
                        className={`px-3 py-1.5 rounded-xl border font-bold text-xs flex items-center gap-1.5 transition ${
                          val
                            ? 'bg-primary/15 border-primary text-primary teal-glow-sm'
                            : 'border-border text-muted-foreground bg-muted/20'
                        }`}
                      >
                        {val ? (
                          <>
                            <Check className="h-3.5 w-3.5" />
                            <span>Active / Enabled</span>
                          </>
                        ) : (
                          <>
                            <X className="h-3.5 w-3.5" />
                            <span>Inactive / Disabled</span>
                          </>
                        )}
                      </button>
                    </div>
                  ) : col.dataType === 'currency' || col.key.includes('price') || col.key.includes('amount') || col.key.includes('total') ? (
                    /* Currency input */
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-xs text-muted-foreground font-bold">
                        {currencySymbol}
                      </span>
                      <input
                        type="number"
                        step="any"
                        value={val}
                        onChange={(e) => handleChange(col.key, Number(e.target.value))}
                        className="w-full pl-8 pr-3 py-2 bg-muted/30 border border-border rounded-xl text-foreground font-mono focus:outline-none focus:border-primary"
                      />
                    </div>
                  ) : col.dataType === 'number' || col.key.includes('stock') || col.key.includes('quantity') || col.key.includes('rate') ? (
                    /* Numeric input */
                    <input
                      type="number"
                      step="any"
                      value={val}
                      onChange={(e) => handleChange(col.key, Number(e.target.value))}
                      className="w-full px-3 py-2 bg-muted/30 border border-border rounded-xl text-foreground font-mono focus:outline-none focus:border-primary"
                    />
                  ) : col.dataType === 'date' || col.key.includes('date') ? (
                    /* Date input */
                    <input
                      type="date"
                      value={String(val).split('T')[0]}
                      onChange={(e) => handleChange(col.key, e.target.value)}
                      className="w-full px-3 py-2 bg-muted/30 border border-border rounded-xl text-foreground focus:outline-none focus:border-primary"
                    />
                  ) : col.key === 'category_id' && sheets['_Categories'] ? (
                    /* Category dropdown */
                    <select
                      value={val}
                      onChange={(e) => handleChange(col.key, e.target.value)}
                      className="w-full px-3 py-2 bg-muted/30 border border-border rounded-xl text-foreground focus:outline-none focus:border-primary"
                    >
                      <option value="">Select Category</option>
                      {sheets['_Categories'].rows.map((cat) => (
                        <option key={cat.category_id} value={cat.category_id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    /* Default text input */
                    <input
                      type="text"
                      value={val}
                      onChange={(e) => handleChange(col.key, e.target.value)}
                      placeholder={`Enter ${col.name.toLowerCase()}...`}
                      className="w-full px-3 py-2 bg-muted/30 border border-border rounded-xl text-foreground focus:outline-none focus:border-primary"
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Bottom Actions */}
          <div className="border-t border-border pt-5 flex items-center justify-end gap-3">
            <button
              onClick={handleBack}
              className="px-4 py-2 text-xs text-muted-foreground hover:text-foreground rounded-xl transition"
            >
              Cancel
            </button>
            <button
              onClick={() => handleSave(false)}
              className="flex items-center gap-2 px-6 py-2.5 text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl shadow-md teal-glow transition"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>{mode === 'edit' ? 'Save Changes' : 'Create Record'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
