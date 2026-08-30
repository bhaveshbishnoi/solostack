import React from 'react';
import { useWorkbookStore } from '../../stores/workbookStore';
import { useUIStore } from '../../stores/uiStore';
import { formatCurrency, formatDate } from '../../lib/utils';
import {
  ArrowLeft,
  Edit2,
  Trash2
} from 'lucide-react';

export const RecordDetailPage: React.FC = () => {
  const { sheets, deleteRow, saveWorkbook, appConfig, setActiveSheet } = useWorkbookStore();
  const { targetRecord, setTargetRecord, addNotification } = useUIStore();

  const sheetName = targetRecord?.sheetName || '_Products';
  const currentSheet = sheets[sheetName];
  const row = targetRecord?.row || {};

  const currencySymbol = appConfig?.currencySymbol || '₹';
  const currency = appConfig?.currency || 'INR';

  const primaryIdKey = currentSheet?.columns[0]?.key || 'id';
  const idVal = row[primaryIdKey] || targetRecord?.rowId || 'Record';

  const handleEdit = () => {
    setTargetRecord({
      sheetName,
      rowId: idVal,
      row,
      mode: 'edit',
    });
    setActiveSheet('record_form');
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete record ${idVal}?`)) {
      deleteRow(sheetName, primaryIdKey, idVal);
      await saveWorkbook();
      addNotification('info', 'Record Deleted', `Removed ${idVal} from ${sheetName}`);
      setActiveSheet(sheetName);
      setTargetRecord(null);
    }
  };

  const handleBack = () => {
    setActiveSheet(sheetName);
    setTargetRecord(null);
  };

  if (!currentSheet) {
    return null;
  }

  const sheetTitle = sheetName.replace('_', '');

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-background">
      {/* Top Header */}
      <div className="h-14 border-b border-border bg-card/60 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition"
            title={`Back to ${sheetTitle}`}
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-base font-bold text-foreground font-mono">
              {row['name'] ? `${row['name']} (${idVal})` : `${sheetTitle} Detail: ${idVal}`}
            </h1>
            <div className="text-[10px] text-muted-foreground">
              Table: <span className="font-mono">{sheetName}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleEdit}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-primary text-primary-foreground font-semibold rounded-xl shadow-sm hover:bg-primary/90 transition"
          >
            <Edit2 className="h-3.5 w-3.5" />
            <span>Edit Record</span>
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-destructive text-destructive-foreground font-semibold rounded-xl shadow-sm hover:bg-destructive/90 transition"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Detail Content */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-2xl mx-auto bg-card border border-border rounded-2xl p-8 shadow-sm space-y-6">
          <div className="border-b border-border pb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-foreground">Record Information</h2>
              <p className="text-xs text-muted-foreground">Complete attribute data for this entry</p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-lg bg-muted text-muted-foreground font-mono">
              {currentSheet.columns.length} attributes
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {currentSheet.columns.map((col) => {
              const val = row[col.key];

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
                  <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-500 font-bold">
                    YES
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[10px] bg-muted text-muted-foreground">
                    NO
                  </span>
                );
              }

              return (
                <div
                  key={col.key}
                  className={`p-3.5 bg-muted/20 border border-border/70 rounded-xl space-y-1 ${
                    col.key.includes('description') || col.key.includes('address') || col.key.includes('notes')
                      ? 'md:col-span-2'
                      : ''
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span className="font-semibold">{col.name}</span>
                    <span className="font-mono text-[10px] opacity-60 uppercase">{col.dataType}</span>
                  </div>
                  <div className="text-sm font-bold text-foreground break-words font-mono">
                    {displayVal}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
