import React, { useState, useEffect, useMemo } from 'react';
import { useWorkbookStore } from '../../stores/workbookStore';
import { useUIStore } from '../../stores/uiStore';
import { TableRow, getBusinessFlowType } from '../../types';
import { getBusinessTerminology } from '../../lib/businessTerminology';
import { formatCurrency } from '../../lib/utils';
import {
  ArrowLeft,
  Save,
  Plus,
  CheckCircle2,
  Check,
  X,
  ChevronDown,
  ChevronRight,
  Copy,
  Wand2,
  RotateCcw
} from 'lucide-react';

export const RecordFormPage: React.FC = () => {
  const { sheets, addRow, updateRow, saveWorkbook, getNextAutoIncrement, appConfig, setActiveSheet } = useWorkbookStore();
  const { targetRecord, setTargetRecord, addNotification } = useUIStore();

  const sheetName = targetRecord?.sheetName || '_Products';
  const mode = targetRecord?.mode || 'add';
  const currentSheet = sheets[sheetName];

  const currentFlow = getBusinessFlowType(appConfig?.businessType);
  const businessMeta = useMemo(() => {
    return getBusinessTerminology(currentFlow, sheetName);
  }, [currentFlow, sheetName]);

  const [showTechnicalId, setShowTechnicalId] = useState(false);
  const [refSearch, setRefSearch] = useState<Record<string, string>>({});

  const currencySymbol = appConfig?.currencySymbol || '₹';
  const currency = appConfig?.currency || 'INR';

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
    setFormData((prev) => {
      const updated = { ...prev, [key]: value };
      // Smart Auto-compute line_total or total when quantity, price, discount change
      if (key === 'quantity' || key === 'unit_price' || key === 'price' || key === 'discount' || key === 'tax') {
        const qty = Number(key === 'quantity' ? value : updated['quantity'] ?? 1);
        const prc = Number(key === 'unit_price' || key === 'price' ? value : updated['unit_price'] ?? updated['price'] ?? 0);
        const disc = Number(key === 'discount' ? value : updated['discount'] ?? 0);
        const tx = Number(key === 'tax' ? value : updated['tax'] ?? 0);

        const calculated = Math.max(0, (qty * prc) - disc + tx);
        if ('line_total' in updated) {
          updated['line_total'] = calculated;
        } else if ('total' in updated && !('subtotal' in updated)) {
          updated['total'] = calculated;
        }
      }
      return updated;
    });
  };

  const handleBack = () => {
    setActiveSheet(sheetName);
    setTargetRecord(null);
  };

  const handleCloneRecord = async () => {
    try {
      const nextId = getNextAutoIncrement(sheetName, primaryIdKey);
      const cloneData: TableRow = { ...formData, [primaryIdKey]: nextId };
      if (cloneData['sku']) cloneData['sku'] = getNextAutoIncrement(sheetName, 'sku');
      if (cloneData['name']) cloneData['name'] = `${cloneData['name']} (Copy)`;
      addRow(sheetName, cloneData);
      await saveWorkbook();
      addNotification('success', 'Record Cloned', `Created duplicate with ID ${nextId}`);
      setTargetRecord({ sheetName, rowId: nextId, row: cloneData, mode: 'edit' });
    } catch (err: any) {
      addNotification('error', 'Clone Failed', err.message || 'Could not clone record');
    }
  };

  const handleAutofillDefaults = () => {
    const filled: TableRow = { ...formData };
    currentSheet.columns.forEach((c) => {
      if (c.key === primaryIdKey) return;
      if (!filled[c.key] || String(filled[c.key]).trim() === '') {
        if (c.dataType === 'date') filled[c.key] = new Date().toISOString().split('T')[0];
        else if (c.dataType === 'currency' || c.dataType === 'number') filled[c.key] = c.defaultValue ?? 100;
        else if (c.dataType === 'boolean') filled[c.key] = true;
        else if (c.key === 'status') filled[c.key] = 'active';
        else if (c.defaultValue) filled[c.key] = c.defaultValue;
      }
    });
    setFormData(filled);
    addNotification('info', 'Autofilled Defaults', 'Populated standard defaults for empty fields');
  };

  const handleResetForm = () => {
    if (window.confirm('Reset all fields back to initial empty state?')) {
      const resetData: TableRow = {};
      currentSheet.columns.forEach((c) => {
        if (c.key === primaryIdKey) {
          resetData[c.key] = formData[c.key];
        } else {
          resetData[c.key] = c.defaultValue ?? '';
        }
      });
      setFormData(resetData);
    }
  };

  const handleSave = async (andAddAnother = false) => {
    try {
      // Validate required fields
      const missingRequired = currentSheet.columns
        .filter((c) => c.required && c.key !== primaryIdKey && (!formData[c.key] || String(formData[c.key]).trim() === ''))
        .map((c) => businessMeta.columnDisplayNames[c.key] || c.name || c.key);

      if (missingRequired.length > 0) {
        addNotification('warning', 'Missing Required Fields', `Please provide values for: ${missingRequired.join(', ')}`);
        return;
      }

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

  // Keyboard shortcuts: Cmd+Enter to save, Esc to cancel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        if (e.shiftKey && mode === 'add') {
          handleSave(true);
        } else {
          handleSave(false);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleBack();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [formData, mode, currentSheet]);

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
            <h1 className="text-base font-bold text-foreground">
              {mode === 'edit' ? businessMeta.editRecordTitle : businessMeta.addRecordTitle}
            </h1>
            <div className="text-[10px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
              <span>Section: {businessMeta.sheetDisplayName}</span>
              <span>•</span>
              <span className="font-mono">{sheetName}</span>
              <span>•</span>
              <span className="text-primary font-medium">⌘+Enter to save</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {mode === 'edit' && (
            <button
              onClick={handleCloneRecord}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-muted/50 hover:bg-muted text-foreground border border-border rounded-xl transition font-medium"
              title="Duplicate this record with a new ID"
            >
              <Copy className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Clone Record</span>
            </button>
          )}

          {mode === 'add' && (
            <button
              onClick={handleAutofillDefaults}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-muted/50 hover:bg-muted text-foreground border border-border rounded-xl transition font-medium"
              title="Fill empty fields with standard defaults"
            >
              <Wand2 className="h-3.5 w-3.5 text-amber-500" />
              <span className="hidden sm:inline">Autofill Defaults</span>
            </button>
          )}

          <button
            onClick={handleResetForm}
            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl border border-border transition"
            title="Reset fields to empty"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>

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
            <span>{mode === 'edit' ? 'Save Changes' : businessMeta.addRecordTitle}</span>
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
            {currentSheet.columns
              .filter((col) => col.key !== primaryIdKey)
              .map((col) => {
                const val = formData[col.key] ?? '';
                const fieldLabel = businessMeta.columnDisplayNames[col.key] || col.name || col.key;

                return (
                  <div
                    key={col.key}
                    className={
                      col.key.includes('description') || col.key.includes('address') || col.key.includes('notes')
                        ? 'md:col-span-2'
                        : ''
                    }
                  >
                    <label className="block font-bold text-foreground mb-1 flex items-center justify-between">
                      <span>
                        {fieldLabel} {col.required && <span className="text-destructive">*</span>}
                      </span>
                      <span className="text-[10px] font-mono text-muted-foreground uppercase">
                        {col.dataType}
                      </span>
                    </label>

                    {col.dataType === 'boolean' ? (
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
                      <div>
                        <div className="relative">
                          <span className="absolute left-3 top-2 text-xs text-muted-foreground font-bold">
                            {currencySymbol}
                          </span>
                          <input
                            type="number"
                            step="any"
                            value={val}
                            onChange={(e) => handleChange(col.key, Number(e.target.value))}
                            className="w-full pl-8 pr-3 py-2 bg-muted/30 border border-border rounded-xl text-foreground font-mono focus:outline-none focus:border-primary font-bold"
                            placeholder="0.00"
                          />
                        </div>
                        {col.key === 'selling_price' && Number(val) > 0 && Number(formData['purchase_price']) > 0 && (
                          <div className="text-[10px] text-emerald-500 font-semibold mt-1 flex items-center justify-between">
                            <span>Margin: {formatCurrency(Number(val) - Number(formData['purchase_price']), currency, currencySymbol)}</span>
                            <span>{(((Number(val) - Number(formData['purchase_price'])) / Number(val)) * 100).toFixed(1)}% profit</span>
                          </div>
                        )}
                      </div>
                    ) : col.key === 'status' ? (
                      /* Status input with quick-pick chips */
                      <div className="space-y-1.5">
                        <input
                          type="text"
                          value={val}
                          onChange={(e) => handleChange(col.key, e.target.value)}
                          placeholder="e.g. active, pending..."
                          className="w-full px-3 py-2 bg-muted/30 border border-border rounded-xl text-foreground focus:outline-none focus:border-primary font-medium"
                        />
                        <div className="flex flex-wrap gap-1">
                          {['active', 'inactive', 'available', 'occupied', 'pending', 'completed'].map((statusOpt) => (
                            <button
                              key={statusOpt}
                              type="button"
                              onClick={() => handleChange(col.key, statusOpt)}
                              className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition ${
                                String(val).toLowerCase() === statusOpt
                                  ? 'bg-primary/20 border-primary text-primary'
                                  : 'bg-muted/40 border-border text-muted-foreground hover:text-foreground'
                              }`}
                            >
                              {statusOpt}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : col.dataType === 'number' || col.key.includes('stock') || col.key.includes('quantity') || col.key.includes('rate') ? (
                      /* Numeric input */
                      <input
                        type="number"
                        step="any"
                        value={val}
                        onChange={(e) => handleChange(col.key, Number(e.target.value))}
                        className="w-full px-3 py-2 bg-muted/30 border border-border rounded-xl text-foreground font-mono focus:outline-none focus:border-primary font-bold"
                        placeholder="0"
                      />
                    ) : col.dataType === 'date' || col.key.includes('date') ? (
                      /* Date input */
                      <input
                        type="date"
                        value={String(val).split('T')[0]}
                        onChange={(e) => handleChange(col.key, e.target.value)}
                        className="w-full px-3 py-2 bg-muted/30 border border-border rounded-xl text-foreground focus:outline-none focus:border-primary"
                      />
                    ) : (col.referenceTable && sheets[col.referenceTable]) ? (
                      /* Connected Foreign Key Table Dropdown with Quick Search */
                      <div className="space-y-1.5">
                        {sheets[col.referenceTable]?.rows.length > 3 && (
                          <input
                            type="text"
                            value={refSearch[col.key] || ''}
                            onChange={(e) => setRefSearch((prev) => ({ ...prev, [col.key]: e.target.value }))}
                            placeholder={`Filter ${sheets[col.referenceTable]?.displayName || col.referenceTable}...`}
                            className="w-full px-2.5 py-1 text-xs bg-muted/40 border border-border rounded-lg text-foreground focus:outline-none focus:border-primary placeholder:text-muted-foreground/60 font-medium"
                          />
                        )}
                        <select
                          value={val}
                          onChange={(e) => handleChange(col.key, e.target.value)}
                          className="w-full px-3 py-2 bg-muted/30 border border-border rounded-xl text-foreground focus:outline-none focus:border-primary font-medium"
                        >
                          <option value="">-- Select from {sheets[col.referenceTable]?.displayName || col.referenceTable} --</option>
                          {sheets[col.referenceTable]?.rows
                            .filter((refRow) => {
                              const q = (refSearch[col.key] || '').toLowerCase().trim();
                              if (!q) return true;
                              return Object.values(refRow).some((v) => String(v).toLowerCase().includes(q));
                            })
                            .map((refRow, rIdx) => {
                              const primaryKey = Object.keys(refRow)[0] || 'id';
                              const displayVal = refRow.name || refRow.title || refRow.sku || refRow[primaryKey] || `Record #${rIdx + 1}`;
                              const optValue = refRow[primaryKey] ?? displayVal;
                              return (
                                <option key={rIdx} value={optValue}>
                                  {displayVal} {optValue !== displayVal ? `(${optValue})` : ''}
                                </option>
                              );
                            })}
                        </select>
                      </div>
                    ) : col.key === 'category_id' && sheets['_Categories'] ? (
                      /* Category dropdown with quick-pick chips */
                      <div className="space-y-1.5">
                        <select
                          value={val}
                          onChange={(e) => handleChange(col.key, e.target.value)}
                          className="w-full px-3 py-2 bg-muted/30 border border-border rounded-xl text-foreground focus:outline-none focus:border-primary"
                        >
                          <option value="">Select Category</option>
                          {sheets['_Categories'].rows.map((cat) => (
                            <option key={cat.category_id} value={cat.name || cat.category_id}>
                              {cat.name}
                            </option>
                          ))}
                        </select>
                        {sheets['_Categories'].rows.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {sheets['_Categories'].rows.slice(0, 6).map((cat) => (
                              <button
                                key={cat.category_id}
                                type="button"
                                onClick={() => handleChange(col.key, cat.name || cat.category_id)}
                                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition ${
                                  val === cat.name || val === cat.category_id
                                    ? 'bg-primary/20 border-primary text-primary'
                                    : 'bg-muted/40 border-border text-muted-foreground hover:text-foreground'
                                }`}
                              >
                                {cat.name}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : col.key === 'customer_id' && sheets['_Customers'] ? (
                      /* Customer dropdown */
                      <select
                        value={val}
                        onChange={(e) => handleChange(col.key, e.target.value)}
                        className="w-full px-3 py-2 bg-muted/30 border border-border rounded-xl text-foreground focus:outline-none focus:border-primary font-medium"
                      >
                        <option value="">Select Customer / Client</option>
                        {sheets['_Customers'].rows.map((c, cIdx) => (
                          <option key={cIdx} value={c.name || c.customer_id}>
                            {c.name} {c.phone ? `(${c.phone})` : ''}
                          </option>
                        ))}
                      </select>
                    ) : col.key === 'product_id' && sheets['_Products'] ? (
                      /* Product dropdown */
                      <select
                        value={val}
                        onChange={(e) => handleChange(col.key, e.target.value)}
                        className="w-full px-3 py-2 bg-muted/30 border border-border rounded-xl text-foreground focus:outline-none focus:border-primary font-medium"
                      >
                        <option value="">Select Product / Item</option>
                        {sheets['_Products'].rows.map((p, pIdx) => (
                          <option key={pIdx} value={p.product_id || p.name}>
                            {p.name} {p.sku ? `[${p.sku}]` : ''}
                          </option>
                        ))}
                      </select>
                    ) : col.key === 'supplier_id' && sheets['_Suppliers'] ? (
                      /* Supplier dropdown */
                      <select
                        value={val}
                        onChange={(e) => handleChange(col.key, e.target.value)}
                        className="w-full px-3 py-2 bg-muted/30 border border-border rounded-xl text-foreground focus:outline-none focus:border-primary font-medium"
                      >
                        <option value="">Select Supplier / Partner</option>
                        {sheets['_Suppliers'].rows.map((s, sIdx) => (
                          <option key={sIdx} value={s.name || s.supplier_id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      /* Default text input */
                      <input
                        type="text"
                        value={val}
                        onChange={(e) => handleChange(col.key, e.target.value)}
                        placeholder={`Enter ${fieldLabel.toLowerCase()}...`}
                        className="w-full px-3 py-2 bg-muted/30 border border-border rounded-xl text-foreground focus:outline-none focus:border-primary"
                      />
                    )}
                  </div>
                );
              })}
          </div>

          {/* Collapsible Technical ID Reference */}
          <div className="pt-2 border-t border-border/50">
            <button
              type="button"
              onClick={() => setShowTechnicalId(!showTechnicalId)}
              className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition font-medium"
            >
              {showTechnicalId ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
              <span>Technical Database Identifier ({primaryIdKey}: <span className="font-mono text-primary font-bold">{formData[primaryIdKey] || 'Auto-incremented'}</span>)</span>
            </button>

            {showTechnicalId && (
              <div className="mt-2.5 p-3 bg-muted/20 border border-border rounded-xl text-xs space-y-1.5">
                <div className="flex justify-between items-center text-[11px] text-muted-foreground">
                  <span>System Primary ID Key: {primaryIdKey}</span>
                  <span className="text-primary font-bold">{mode === 'edit' ? 'Locked ID' : 'Auto-Increment'}</span>
                </div>
                <input
                  disabled={mode === 'edit'}
                  type="text"
                  value={formData[primaryIdKey] ?? ''}
                  onChange={(e) => handleChange(primaryIdKey, e.target.value)}
                  className="w-full px-3 py-1.5 bg-muted/40 border border-border rounded-lg text-foreground font-mono text-xs focus:outline-none focus:border-primary"
                />
              </div>
            )}
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
