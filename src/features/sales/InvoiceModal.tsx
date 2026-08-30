import React from 'react';
import { useUIStore } from '../../stores/uiStore';
import { useWorkbookStore } from '../../stores/workbookStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { formatCurrency, formatDate } from '../../lib/utils';
import { X, Printer, CheckCircle2 } from 'lucide-react';

export const InvoiceModal: React.FC = () => {
  const { activeModal, modalData, closeModal } = useUIStore();
  const { appConfig } = useWorkbookStore();
  const { businessAddress, businessPhone, businessEmail, businessGstin } = useSettingsStore();

  const isOpen = activeModal === 'invoice_preview';
  if (!isOpen || !modalData) return null;

  const { saleId, saleRecord, cart, calculations, customerName } = modalData;
  const currencySymbol = appConfig?.currencySymbol || '₹';
  const currency = appConfig?.currency || 'INR';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4 select-none animate-in fade-in">
      <div className="bg-card border border-border rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header with actions */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/30 shrink-0">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            <h2 className="text-sm font-bold text-foreground">Tax Invoice & Receipt</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-primary text-primary-foreground font-semibold rounded-lg shadow-sm hover:bg-primary/90 transition"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print Invoice</span>
            </button>
            <button
              onClick={closeModal}
              className="p-1 text-muted-foreground hover:text-foreground rounded-lg transition"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Invoice Printable Document */}
        <div className="flex-1 overflow-y-auto p-8 bg-card" id="printable-area">
          <div className="space-y-6">
            {/* Business & Invoice Header */}
            <div className="flex items-start justify-between border-b border-border pb-6">
              <div>
                <h1 className="text-xl font-extrabold text-foreground tracking-tight">
                  {appConfig?.businessName || 'Business Name'}
                </h1>
                <p className="text-xs text-muted-foreground mt-1 max-w-xs leading-relaxed">
                  {businessAddress}
                </p>
                <div className="text-xs text-muted-foreground mt-1 space-y-0.5 font-mono">
                  {businessPhone && <div>Phone: {businessPhone}</div>}
                  {businessEmail && <div>Email: {businessEmail}</div>}
                  {businessGstin && <div>GSTIN: {businessGstin}</div>}
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  TAX INVOICE
                </div>
                <div className="text-base font-bold text-foreground font-mono mt-1">
                  #{saleId}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Date: {formatDate(saleRecord?.sale_date || new Date().toISOString())}
                </div>
                <div className="text-xs font-medium text-emerald-500 mt-1">
                  Status: PAID ({saleRecord?.payment_method || 'Cash'})
                </div>
              </div>
            </div>

            {/* Bill To */}
            <div className="text-xs">
              <div className="text-muted-foreground font-semibold uppercase tracking-wider text-[10px] mb-1">
                Billed To
              </div>
              <div className="font-bold text-foreground text-sm">{customerName}</div>
            </div>

            {/* Itemized Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border text-muted-foreground text-[11px]">
                    <th className="py-2.5 font-semibold">Item & SKU</th>
                    <th className="py-2.5 font-semibold text-center">Qty</th>
                    <th className="py-2.5 font-semibold text-right">Unit Price</th>
                    <th className="py-2.5 font-semibold text-right">GST</th>
                    <th className="py-2.5 font-semibold text-right">Line Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {cart.map((item: any, idx: number) => {
                    const lineBase = item.unitPrice * item.quantity;
                    const lineTax = (lineBase * item.gstRate) / 100;
                    const lineTotal = lineBase + lineTax;
                    return (
                      <tr key={idx} className="hover:bg-muted/20">
                        <td className="py-2.5 font-medium text-foreground">
                          <div>{item.name}</div>
                          {item.sku && (
                            <div className="text-[10px] text-muted-foreground font-mono">
                              SKU: {item.sku}
                            </div>
                          )}
                        </td>
                        <td className="py-2.5 text-center font-mono">{item.quantity}</td>
                        <td className="py-2.5 text-right font-mono">
                          {formatCurrency(item.unitPrice, currency, currencySymbol)}
                        </td>
                        <td className="py-2.5 text-right text-muted-foreground font-mono">
                          {item.gstRate}%
                        </td>
                        <td className="py-2.5 text-right font-semibold text-foreground font-mono">
                          {formatCurrency(lineTotal, currency, currencySymbol)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Totals Breakdown */}
            <div className="border-t border-border pt-4 flex justify-end">
              <div className="w-64 space-y-2 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="font-mono">
                    {formatCurrency(calculations.subtotal, currency, currencySymbol)}
                  </span>
                </div>
                {calculations.totalDiscount > 0 && (
                  <div className="flex justify-between text-emerald-500 font-medium">
                    <span>Discount</span>
                    <span className="font-mono">
                      -{formatCurrency(calculations.totalDiscount, currency, currencySymbol)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-muted-foreground">
                  <span>Total GST</span>
                  <span className="font-mono">
                    +{formatCurrency(calculations.totalTax, currency, currencySymbol)}
                  </span>
                </div>
                <div className="border-t border-border pt-2 flex justify-between text-base font-bold text-foreground">
                  <span>Grand Total</span>
                  <span className="text-primary font-mono">
                    {formatCurrency(calculations.grandTotal, currency, currencySymbol)}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer Note */}
            <div className="text-center text-[10px] text-muted-foreground border-t border-border pt-6">
              Thank you for your business! Generated locally with Exdrow.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
