import React, { useState, useMemo } from 'react';
import { useWorkbookStore } from '../../stores/workbookStore';
import { useUIStore } from '../../stores/uiStore';
import { formatCurrency, formatDate } from '../../lib/utils';
import {
  Printer,
  Download,
  CheckSquare,
  Square,
  Sigma
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { sheets, appConfig } = useWorkbookStore();
  const { addNotification } = useUIStore();

  const availableSheets = useMemo(() => {
    return Object.keys(sheets).filter((s) => !s.startsWith('_App') && !s.startsWith('_Dashboard'));
  }, [sheets]);

  const [selectedSheet, setSelectedSheet] = useState<string>('_Sales');
  const targetSheet = sheets[selectedSheet];
  const columns = targetSheet?.columns || [];

  const [selectedColKeys, setSelectedColKeys] = useState<string[]>([]);
  const [filterQuery, setFilterQuery] = useState('');

  // Default select all columns when sheet changes
  React.useEffect(() => {
    if (targetSheet) {
      setSelectedColKeys(targetSheet.columns.map((c) => c.key));
    }
  }, [selectedSheet, targetSheet]);

  const currencySymbol = appConfig?.currencySymbol || '₹';
  const currency = appConfig?.currency || 'INR';

  const displayedColumns = useMemo(() => {
    return columns.filter((c) => selectedColKeys.includes(c.key));
  }, [columns, selectedColKeys]);

  const filteredRows = useMemo(() => {
    if (!targetSheet) return [];
    let rows = targetSheet.rows;
    if (filterQuery.trim()) {
      const q = filterQuery.toLowerCase();
      rows = rows.filter((r) =>
        Object.values(r).some((val) => String(val ?? '').toLowerCase().includes(q))
      );
    }
    return rows;
  }, [targetSheet, filterQuery]);

  // Totals for numeric columns
  const numericTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    displayedColumns.forEach((col) => {
      if (col.key.includes('total') || col.key.includes('subtotal') || col.key.includes('amount') || col.key.includes('price') || col.key.includes('quantity') || col.key.includes('tax')) {
        totals[col.key] = filteredRows.reduce((acc, r) => acc + Number(r[col.key] || 0), 0);
      }
    });
    return totals;
  }, [displayedColumns, filteredRows]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = displayedColumns.map((c) => c.name).join(',');
    const rows = filteredRows.map((r) =>
      displayedColumns.map((c) => `"${String(r[c.key] ?? '').replace(/"/g, '""')}"`).join(',')
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${selectedSheet.replace('_', '')}_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addNotification('success', 'Report Exported', `Saved CSV with ${filteredRows.length} rows`);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Business Reports & Statement Builder</h1>
          <p className="text-xs text-muted-foreground">
            Generate printable statements and custom data summaries directly from your workbook
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-muted hover:bg-muted/80 text-foreground border border-border rounded-lg transition font-medium"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Print Report</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-sm teal-glow-sm transition font-bold"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Configuration Controls Bar */}
      <div className="bg-card border border-border rounded-2xl p-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div>
          <label className="block font-medium text-foreground mb-1">Select Dataset</label>
          <select
            value={selectedSheet}
            onChange={(e) => setSelectedSheet(e.target.value)}
            className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none focus:border-primary"
          >
            {availableSheets.map((s) => (
              <option key={s} value={s}>
                {s.replace('_', '')}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-medium text-foreground mb-1">Filter Records</label>
          <input
            type="text"
            placeholder="Search keywords..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none focus:border-primary"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="font-semibold text-foreground">Columns to Include ({displayedColumns.length}/{columns.length})</label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedColKeys(columns.map((c) => c.key))}
                className="text-[10px] text-primary hover:underline font-bold"
              >
                Select All
              </button>
              <span className="text-muted-foreground">•</span>
              <button
                type="button"
                onClick={() => setSelectedColKeys(columns.slice(0, 3).map((c) => c.key))}
                className="text-[10px] text-muted-foreground hover:text-foreground"
              >
                Reset
              </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-2 bg-muted/20 border border-border rounded-xl">
            {columns.map((col) => {
              const isSelected = selectedColKeys.includes(col.key);
              return (
                <button
                  key={col.key}
                  type="button"
                  onClick={() => {
                    if (isSelected) {
                      if (selectedColKeys.length <= 1) return;
                      setSelectedColKeys(selectedColKeys.filter((k) => k !== col.key));
                    } else {
                      setSelectedColKeys([...selectedColKeys, col.key]);
                    }
                  }}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1.5 transition ${
                    isSelected
                      ? 'bg-primary text-primary-foreground shadow-xs'
                      : 'bg-muted/80 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {isSelected ? <CheckSquare className="h-3 w-3" /> : <Square className="h-3 w-3" />}
                  <span>{col.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Printable Report Canvas */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6" id="printable-area">
        {/* Report Header */}
        <div className="flex items-start justify-between border-b border-border pb-4">
          <div>
            <h2 className="text-lg font-bold text-foreground capitalize">
              {selectedSheet.replace('_', '')} Report
            </h2>
            <div className="text-xs text-muted-foreground mt-0.5">
              Generated on {formatDate(new Date().toISOString())} • {filteredRows.length} records • {displayedColumns.length} columns
            </div>
          </div>
          <div className="text-right text-xs">
            <span className="font-bold text-foreground text-sm">{appConfig?.businessName}</span>
            <div className="text-muted-foreground">{appConfig?.businessType}</div>
          </div>
        </div>

        {/* Tabular Grid */}
        <div className="overflow-x-auto border border-border rounded-xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-muted/50 border-b border-border text-foreground font-bold">
              <tr>
                <th className="py-2.5 px-3 border-r border-border font-mono text-center text-[10px] w-12">#</th>
                {displayedColumns.map((col) => {
                  const isNum =
                    col.key.includes('total') ||
                    col.key.includes('subtotal') ||
                    col.key.includes('amount') ||
                    col.key.includes('price') ||
                    col.key.includes('quantity');
                  return (
                    <th key={col.key} className={`py-2.5 px-3.5 border-r border-border text-[11px] ${isNum ? 'text-right' : ''}`}>
                      {col.name}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={displayedColumns.length + 1} className="py-8 text-center text-muted-foreground">
                    No records found matching filters.
                  </td>
                </tr>
              ) : (
                filteredRows.map((row, idx) => (
                  <tr key={idx} className="even:bg-muted/10 odd:bg-card hover:bg-primary/5 transition">
                    <td className="py-2 px-3 text-center text-muted-foreground/70 font-mono text-[10px] border-r border-border/60">
                      {idx + 1}
                    </td>
                    {displayedColumns.map((col) => {
                      const val = row[col.key];
                      const isNum =
                        col.key.includes('total') ||
                        col.key.includes('subtotal') ||
                        col.key.includes('amount') ||
                        col.key.includes('price');

                      let displayVal = val ?? '-';
                      if (isNum) {
                        displayVal = formatCurrency(val, currency, currencySymbol);
                      } else if (col.key.includes('date')) {
                        displayVal = formatDate(val);
                      }

                      return (
                        <td
                          key={col.key}
                          className={`py-2 px-3.5 text-foreground border-r border-border/60 ${
                            isNum || col.key.includes('quantity') ? 'font-mono text-right font-medium' : ''
                          }`}
                        >
                          {displayVal}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>

            {/* Summary Totals Row */}
            {filteredRows.length > 0 && Object.keys(numericTotals).length > 0 && (
              <tfoot>
                <tr className="border-t-2 border-border font-bold bg-muted/40 text-xs">
                  <td className="py-2.5 px-3 text-center text-primary font-mono border-r border-border">
                    <Sigma className="h-3.5 w-3.5 mx-auto text-primary" />
                  </td>
                  {displayedColumns.map((col, idx) => {
                    const totalVal = numericTotals[col.key];
                    const isFirst = idx === 0;

                    if (totalVal !== undefined) {
                      return (
                        <td key={col.key} className="py-2.5 px-3.5 text-primary font-mono font-extrabold text-right border-r border-border">
                          {col.key.includes('quantity')
                            ? totalVal
                            : formatCurrency(totalVal, currency, currencySymbol)}
                        </td>
                      );
                    }
                    return (
                      <td key={col.key} className={`py-2.5 px-3.5 border-r border-border ${isFirst ? 'font-bold' : ''}`}>
                        {isFirst ? `Total (${filteredRows.length})` : ''}
                      </td>
                    );
                  })}
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
};
