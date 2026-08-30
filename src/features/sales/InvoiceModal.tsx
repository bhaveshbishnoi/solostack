import React, { useState, useMemo, useEffect } from 'react';
import { useUIStore } from '../../stores/uiStore';
import { useWorkbookStore } from '../../stores/workbookStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { formatCurrency, formatDate, numberToWords } from '../../lib/utils';
import { getBusinessFlowType } from '../../types';
import {
  X,
  Printer,
  CheckCircle2,
  Copy,
  Check,
  FileText,
  Receipt,
  QrCode,
  ShieldCheck
} from 'lucide-react';

export const InvoiceModal: React.FC = () => {
  const { activeModal, modalData, closeModal, addNotification } = useUIStore();
  const { sheets, appConfig } = useWorkbookStore();
  const {
    businessAddress,
    businessPhone,
    businessEmail,
    businessGstin,
    invoiceFooterNote,
    receiptAutoPrint
  } = useSettingsStore();

  const [invoiceLayout, setInvoiceLayout] = useState<'a4' | 'thermal'>('a4');
  const [copied, setCopied] = useState(false);

  const isOpen = activeModal === 'invoice_preview';

  useEffect(() => {
    if (isOpen && receiptAutoPrint) {
      const timer = setTimeout(() => window.print(), 350);
      return () => clearTimeout(timer);
    }
  }, [isOpen, receiptAutoPrint]);

  // Universal Sale Resolution from either passed modalData or workbook sheets
  const invoiceData = useMemo(() => {
    if (!modalData) return null;

    const rawSaleId = modalData.saleId || modalData.saleRecord?.sale_id || modalData.saleRecord?.id || 'INV-001';
    const salesList = sheets['_Sales']?.rows || [];
    const saleRecord =
      modalData.saleRecord ||
      salesList.find((r) => r.sale_id === rawSaleId || r.id === rawSaleId) ||
      {};

    const customersList = sheets['_Customers']?.rows || [];
    const customerRecord = customersList.find(
      (c) =>
        c.customer_id === saleRecord.customer_id ||
        c.name === saleRecord.customer_id ||
        c.name === modalData.customerName
    );

    const customerName =
      modalData.customerName ||
      customerRecord?.name ||
      saleRecord.customer_id ||
      'Valued Customer';
    const customerPhone = customerRecord?.phone || '';
    const customerEmail = customerRecord?.email || '';
    const customerAddress = customerRecord?.address || '';
    const customerGstin = customerRecord?.gstin || '';

    const productsList = sheets['_Products']?.rows || [];

    // Resolve Line Items
    let items: Array<{
      name: string;
      sku: string;
      quantity: number;
      unitPrice: number;
      gstRate: number;
      discount: number;
      lineTotal: number;
    }> = [];

    if (modalData.cart && Array.isArray(modalData.cart) && modalData.cart.length > 0) {
      items = modalData.cart.map((it: any) => {
        const qty = Number(it.quantity || 1);
        const price = Number(it.unitPrice || it.price || 0);
        const gst = Number(it.gstRate ?? it.gst_rate ?? 18);
        const disc = Number(it.discount || 0);
        const base = qty * price;
        const tax = ((base - disc) * gst) / 100;
        return {
          name: it.name || 'Item',
          sku: it.sku || '-',
          quantity: qty,
          unitPrice: price,
          gstRate: gst,
          discount: disc,
          lineTotal: it.lineTotal ?? Math.max(0, base - disc + tax),
        };
      });
    } else {
      const saleItemsList = sheets['_SaleItems']?.rows || [];
      const matchingItems = saleItemsList.filter(
        (si) => String(si.sale_id).trim() === String(rawSaleId).trim()
      );

      if (matchingItems.length > 0) {
        items = matchingItems.map((si) => {
          const prod = productsList.find((p) => p.product_id === si.product_id);
          const qty = Number(si.quantity || 1);
          const price = Number(si.unit_price || si.price || prod?.selling_price || 0);
          const gst = Number(prod?.gst_rate ?? 18);
          const disc = Number(si.discount || 0);
          const tax = Number(si.tax || ((qty * price - disc) * gst) / 100);
          const lineTotal = Number(si.line_total || qty * price - disc + tax);
          return {
            name: prod?.name || si.name || si.product_id || 'Line Item',
            sku: prod?.sku || si.product_id || '-',
            quantity: qty,
            unitPrice: price,
            gstRate: gst,
            discount: disc,
            lineTotal,
          };
        });
      } else {
        // Fallback to single item from sale record
        const total = Number(saleRecord.total || 100);
        const tax = Number(saleRecord.tax || (total * 0.18) / 1.18);
        const subtotal = Number(saleRecord.subtotal || total - tax);
        items = [
          {
            name: saleRecord.description || saleRecord.name || `${appConfig?.businessType || 'Service'} Order`,
            sku: rawSaleId,
            quantity: 1,
            unitPrice: subtotal,
            gstRate: 18,
            discount: Number(saleRecord.discount || 0),
            lineTotal: total,
          },
        ];
      }
    }

    // Resolve Calculations
    let subtotal = 0;
    let totalDiscount = 0;
    let totalTax = 0;
    let grandTotal = 0;

    if (modalData.calculations) {
      subtotal = Number(modalData.calculations.subtotal || 0);
      totalDiscount = Number(modalData.calculations.totalDiscount || 0);
      totalTax = Number(modalData.calculations.totalTax || 0);
      grandTotal = Number(modalData.calculations.grandTotal || 0);
    } else {
      subtotal = Number(saleRecord.subtotal) || items.reduce((acc, it) => acc + it.quantity * it.unitPrice, 0);
      totalDiscount = Number(saleRecord.discount || 0) || items.reduce((acc, it) => acc + (it.discount || 0), 0);
      totalTax = Number(saleRecord.tax || 0) || items.reduce((acc, it) => acc + ((it.quantity * it.unitPrice - it.discount) * it.gstRate) / 100, 0);
      grandTotal = Number(saleRecord.total) || Math.max(0, subtotal - totalDiscount + totalTax);
    }

    const cgst = totalTax / 2;
    const sgst = totalTax / 2;
    const amountWords = numberToWords(grandTotal);

    return {
      saleId: rawSaleId,
      saleRecord,
      customerName,
      customerPhone,
      customerEmail,
      customerAddress,
      customerGstin,
      items,
      subtotal,
      totalDiscount,
      totalTax,
      cgst,
      sgst,
      grandTotal,
      amountWords,
      saleDate: saleRecord.sale_date || saleRecord.created_at || new Date().toISOString(),
      paymentMethod: saleRecord.payment_method || 'Cash',
      status: saleRecord.status || 'PAID',
    };
  }, [modalData, sheets, appConfig]);

  if (!isOpen || !invoiceData) return null;

  const currencySymbol = appConfig?.currencySymbol || '₹';
  const currency = appConfig?.currency || 'INR';
  const flowType = getBusinessFlowType(appConfig?.businessType);

  const getDocTitle = () => {
    switch (flowType) {
      case 'taxi':
        return 'TRIP FARE BILL & PASSENGER RECEIPT';
      case 'hotel':
        return 'GUEST STAY FOLIO & TAX INVOICE';
      case 'school':
        return 'ACADEMIC TUITION & TERM FEE RECEIPT';
      case 'coaching':
        return 'COURSE ENROLLMENT & TUITION RECEIPT';
      case 'payroll':
        return 'MONTHLY SALARY DISBURSEMENT PAYSLIP';
      case 'gym':
        return 'GYM MEMBERSHIP PASS & TAX RECEIPT';
      case 'hospital':
        return 'CLINICAL OPD & DIAGNOSTIC INVOICE';
      case 'restaurant':
        return 'RESTAURANT DINING BILL & TAX INVOICE';
      case 'realestate':
        return 'LEASE RENT & MAINTENANCE RECEIPT';
      case 'garage':
        return 'VEHICLE REPAIR & SPARES TAX INVOICE';
      case 'salon':
        return 'SALON SERVICE & BEAUTY TAX INVOICE';
      case 'wholesale':
        return 'B2B WHOLESALE TAX INVOICE & DISPATCH';
      case 'manufacturing':
        return 'EX-FACTORY COMMERCIAL TAX INVOICE';
      case 'pharmacy':
        return 'PHARMACY DISPENSARY CASH MEMO';
      case 'services':
        return 'PROFESSIONAL SERVICES BILLABLE INVOICE';
      default:
        return 'TAX INVOICE & CASH RECEIPT';
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopySummary = async () => {
    try {
      const summaryText = [
        `=======================================`,
        `${appConfig?.businessName || 'Tax Invoice'}`,
        `${getDocTitle()}`,
        `Invoice #: ${invoiceData.saleId}`,
        `Date: ${formatDate(invoiceData.saleDate)}`,
        `Billed To: ${invoiceData.customerName} ${invoiceData.customerPhone ? `(${invoiceData.customerPhone})` : ''}`,
        `---------------------------------------`,
        ...invoiceData.items.map(
          (it, idx) =>
            `${idx + 1}. ${it.name} | Qty: ${it.quantity} x ${formatCurrency(it.unitPrice, currency, currencySymbol)} = ${formatCurrency(it.lineTotal, currency, currencySymbol)}`
        ),
        `---------------------------------------`,
        `Subtotal: ${formatCurrency(invoiceData.subtotal, currency, currencySymbol)}`,
        invoiceData.totalDiscount > 0
          ? `Discount: -${formatCurrency(invoiceData.totalDiscount, currency, currencySymbol)}`
          : null,
        `Tax (GST): +${formatCurrency(invoiceData.totalTax, currency, currencySymbol)}`,
        `TOTAL DUE / PAID: ${formatCurrency(invoiceData.grandTotal, currency, currencySymbol)}`,
        `Amount in Words: ${invoiceData.amountWords}`,
        `Payment Method: ${invoiceData.paymentMethod} (PAID)`,
        `=======================================`,
        invoiceFooterNote || 'Thank you for your business!',
      ]
        .filter(Boolean)
        .join('\n');

      await navigator.clipboard.writeText(summaryText);
      setCopied(true);
      addNotification('success', 'Copied to Clipboard', 'Invoice summary copied for messaging/email');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      addNotification('info', 'Copy Failed', 'Unable to access clipboard');
    }
  };

  return (
    <>
      {/* Scoped Print Stylesheet */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #invoice-printable, #invoice-printable * {
            visibility: visible !important;
          }
          #invoice-printable {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100vw !important;
            min-height: 100vh !important;
            margin: 0 !important;
            padding: 24px !important;
            background: #ffffff !important;
            color: #000000 !important;
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
            z-index: 999999 !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4 select-none animate-in fade-in">
        <div className="bg-card border border-border rounded-2xl shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden">
          {/* Header with Navigation & Action Controls */}
          <div className="px-6 py-3.5 border-b border-border flex items-center justify-between bg-muted/40 shrink-0 no-print">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-foreground">Tax Invoice & Billing Folio</h2>
                <div className="text-[10px] text-muted-foreground font-mono">
                  #{invoiceData.saleId} • {formatDate(invoiceData.saleDate)}
                </div>
              </div>
            </div>

            {/* Layout Toggle & Action Buttons */}
            <div className="flex items-center gap-2">
              {/* Format Toggle: A4 vs Thermal */}
              <div className="flex items-center bg-background border border-border p-0.5 rounded-xl text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setInvoiceLayout('a4')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition ${
                    invoiceLayout === 'a4'
                      ? 'bg-primary text-primary-foreground font-bold shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  title="Formal A4 Document Layout"
                >
                  <FileText className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Standard A4</span>
                </button>
                <button
                  type="button"
                  onClick={() => setInvoiceLayout('thermal')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition ${
                    invoiceLayout === 'thermal'
                      ? 'bg-primary text-primary-foreground font-bold shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  title="80mm Thermal POS Slip"
                >
                  <Receipt className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">80mm POS</span>
                </button>
              </div>

              {/* Copy Summary */}
              <button
                type="button"
                onClick={handleCopySummary}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-muted hover:bg-muted/80 text-foreground border border-border rounded-xl font-medium transition"
                title="Copy text summary for WhatsApp / Email"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                <span className="hidden sm:inline">{copied ? 'Copied!' : 'Copy'}</span>
              </button>

              {/* Print Button */}
              <button
                type="button"
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-4 py-1.5 text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl shadow-sm teal-glow-sm transition"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Print</span>
              </button>

              {/* Close Button */}
              <button
                type="button"
                onClick={closeModal}
                className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg transition ml-1"
                title="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Printable Container */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-muted/10 flex justify-center">
            {/* Standard A4 Formal Tax Invoice View */}
            {invoiceLayout === 'a4' && (
              <div
                id="invoice-printable"
                className="bg-card text-foreground border border-border rounded-2xl p-6 sm:p-8 shadow-sm max-w-2xl w-full space-y-6"
              >
                {/* Top Section: Business Brand & Document Header */}
                <div className="flex justify-between items-start border-b border-border pb-6">
                  <div className="space-y-1.5 max-w-sm">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground font-extrabold flex items-center justify-center text-sm shadow-xs">
                        {(appConfig?.businessName || 'E')[0].toUpperCase()}
                      </div>
                      <h1 className="text-xl font-black text-foreground tracking-tight">
                        {appConfig?.businessName || 'Business Enterprise'}
                      </h1>
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {businessAddress || 'Commercial Complex, Main Business Hub'}
                    </p>

                    <div className="text-[11px] text-muted-foreground space-y-0.5 font-mono">
                      {businessPhone && <div>Phone: {businessPhone}</div>}
                      {businessEmail && <div>Email: {businessEmail}</div>}
                      {businessGstin && <div className="font-semibold text-foreground">GSTIN / Tax ID: {businessGstin}</div>}
                    </div>
                  </div>

                  <div className="text-right space-y-1.5">
                    <span className="inline-block px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                      {getDocTitle()}
                    </span>

                    <div className="text-lg font-black text-foreground font-mono mt-1">
                      #{invoiceData.saleId}
                    </div>

                    <div className="text-xs text-muted-foreground">
                      Date: <span className="font-medium text-foreground">{formatDate(invoiceData.saleDate)}</span>
                    </div>

                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                      <ShieldCheck className="h-3 w-3" />
                      <span>{invoiceData.status} ({invoiceData.paymentMethod})</span>
                    </div>
                  </div>
                </div>

                {/* Billed To / Client Coordinates */}
                <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-muted/30 border border-border text-xs">
                  <div>
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                      Billed To (Customer / Client)
                    </div>
                    <div className="text-sm font-bold text-foreground">{invoiceData.customerName}</div>
                    {invoiceData.customerPhone && (
                      <div className="text-muted-foreground mt-0.5">Phone: {invoiceData.customerPhone}</div>
                    )}
                    {invoiceData.customerEmail && (
                      <div className="text-muted-foreground">Email: {invoiceData.customerEmail}</div>
                    )}
                  </div>
                  <div>
                    {invoiceData.customerAddress && (
                      <div className="text-muted-foreground leading-relaxed">
                        <span className="font-semibold text-foreground">Address:</span> {invoiceData.customerAddress}
                      </div>
                    )}
                    {invoiceData.customerGstin && (
                      <div className="font-mono text-muted-foreground mt-1">
                        <span className="font-semibold text-foreground">GSTIN:</span> {invoiceData.customerGstin}
                      </div>
                    )}
                    <div className="text-muted-foreground mt-1">
                      <span className="font-semibold text-foreground">Settlement Channel:</span> {invoiceData.paymentMethod}
                    </div>
                  </div>
                </div>

                {/* Itemized Table */}
                <div className="overflow-x-auto border border-border rounded-xl">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-muted/50 border-b border-border text-foreground font-bold text-[11px]">
                      <tr>
                        <th className="py-2.5 px-3 border-r border-border w-10 text-center">#</th>
                        <th className="py-2.5 px-3 border-r border-border">Description & Specification</th>
                        <th className="py-2.5 px-3 border-r border-border text-center w-16">Qty</th>
                        <th className="py-2.5 px-3 border-r border-border text-right w-24">Rate</th>
                        <th className="py-2.5 px-3 border-r border-border text-right w-20">GST %</th>
                        <th className="py-2.5 px-3 text-right w-28">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border font-medium">
                      {invoiceData.items.map((item, idx) => (
                        <tr key={idx} className="hover:bg-muted/20">
                          <td className="py-2.5 px-3 text-center text-muted-foreground font-mono border-r border-border">
                            {idx + 1}
                          </td>
                          <td className="py-2.5 px-3 border-r border-border">
                            <div className="font-bold text-foreground">{item.name}</div>
                            {item.sku && item.sku !== '-' && (
                              <div className="text-[10px] text-muted-foreground font-mono">
                                SKU / Code: {item.sku}
                              </div>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-center font-mono border-r border-border font-bold">
                            {item.quantity}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono border-r border-border">
                            {formatCurrency(item.unitPrice, currency, currencySymbol)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-muted-foreground border-r border-border">
                            {item.gstRate}%
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-foreground">
                            {formatCurrency(item.lineTotal, currency, currencySymbol)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Financial Totals & Split */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                  {/* Left Column: Amount in Words & Stamp */}
                  <div className="space-y-3">
                    <div className="p-3 rounded-xl bg-muted/25 border border-border text-xs">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        Invoice Total in Words
                      </div>
                      <div className="font-semibold text-foreground italic mt-0.5">
                        {invoiceData.amountWords}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-xl border border-border/80 bg-card">
                      <QrCode className="h-10 w-10 text-primary shrink-0" />
                      <div className="text-[11px] text-muted-foreground">
                        <div className="font-bold text-foreground">Digital Verification</div>
                        <div>Scan to verify transaction on Excel Ledger</div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Calculations Breakdown */}
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-muted-foreground py-1">
                      <span>Taxable Value (Subtotal)</span>
                      <span className="font-mono font-semibold text-foreground">
                        {formatCurrency(invoiceData.subtotal, currency, currencySymbol)}
                      </span>
                    </div>

                    {invoiceData.totalDiscount > 0 && (
                      <div className="flex justify-between text-emerald-500 py-1">
                        <span>Trade Discount</span>
                        <span className="font-mono font-semibold">
                          -{formatCurrency(invoiceData.totalDiscount, currency, currencySymbol)}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between text-muted-foreground py-1">
                      <span>CGST Split (Central Tax)</span>
                      <span className="font-mono">
                        +{formatCurrency(invoiceData.cgst, currency, currencySymbol)}
                      </span>
                    </div>

                    <div className="flex justify-between text-muted-foreground py-1">
                      <span>SGST Split (State Tax)</span>
                      <span className="font-mono">
                        +{formatCurrency(invoiceData.sgst, currency, currencySymbol)}
                      </span>
                    </div>

                    <div className="border-t-2 border-primary/40 pt-2 flex justify-between items-center text-sm font-bold text-foreground">
                      <span>Total Due / Paid</span>
                      <span className="text-primary font-mono font-black text-lg">
                        {formatCurrency(invoiceData.grandTotal, currency, currencySymbol)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Signatory & Legal Footer */}
                <div className="pt-6 border-t border-border flex justify-between items-end text-[11px] text-muted-foreground">
                  <div className="space-y-1 max-w-sm">
                    <div className="font-semibold text-foreground">Terms & Conditions:</div>
                    <div className="italic">
                      {invoiceFooterNote || 'Goods/Services once acknowledged are subject to standard enterprise terms.'}
                    </div>
                    <div className="text-[10px]">
                      This is a computer-generated tax invoice verified by exdrow.
                    </div>
                  </div>

                  <div className="text-center space-y-1 shrink-0">
                    <div className="h-10 w-28 mx-auto border-b border-muted-foreground/40 flex items-center justify-center">
                      <span className="text-[10px] font-mono text-emerald-500 font-bold tracking-widest border border-emerald-500/30 px-2 py-0.5 rounded">
                        ✓ VERIFIED
                      </span>
                    </div>
                    <div className="font-bold text-foreground text-xs">Authorised Signatory</div>
                    <div className="text-[10px] text-muted-foreground">{appConfig?.businessName}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Thermal 80mm POS Slip View */}
            {invoiceLayout === 'thermal' && (
              <div
                id="invoice-printable"
                className="bg-card text-foreground border border-border rounded-xl p-6 shadow-sm max-w-xs w-full font-mono text-xs space-y-4"
              >
                <div className="text-center space-y-1 border-b border-dashed border-border pb-4">
                  <div className="font-black text-base uppercase tracking-wider">{appConfig?.businessName}</div>
                  <div className="text-[11px] text-muted-foreground">{businessAddress}</div>
                  {businessPhone && <div className="text-[10px]">Tel: {businessPhone}</div>}
                  {businessGstin && <div className="text-[10px]">GSTIN: {businessGstin}</div>}
                  <div className="pt-2 font-bold text-[11px] uppercase tracking-widest text-primary">
                    *** {getDocTitle()} ***
                  </div>
                </div>

                <div className="space-y-1 text-[11px] border-b border-dashed border-border pb-3">
                  <div className="flex justify-between">
                    <span>Receipt #:</span>
                    <span className="font-bold">{invoiceData.saleId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Date:</span>
                    <span>{formatDate(invoiceData.saleDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Customer:</span>
                    <span className="font-bold truncate max-w-[140px]">{invoiceData.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Payment:</span>
                    <span>{invoiceData.paymentMethod}</span>
                  </div>
                </div>

                {/* Items list */}
                <div className="space-y-2 border-b border-dashed border-border pb-3 text-[11px]">
                  {invoiceData.items.map((it, idx) => (
                    <div key={idx} className="space-y-0.5">
                      <div className="font-bold">{it.name}</div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>{it.quantity} x {formatCurrency(it.unitPrice, currency, currencySymbol)}</span>
                        <span className="font-bold text-foreground">{formatCurrency(it.lineTotal, currency, currencySymbol)}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Thermal Totals */}
                <div className="space-y-1 text-[11px] border-b border-dashed border-border pb-3">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(invoiceData.subtotal, currency, currencySymbol)}</span>
                  </div>
                  {invoiceData.totalDiscount > 0 && (
                    <div className="flex justify-between text-emerald-500">
                      <span>Discount:</span>
                      <span>-{formatCurrency(invoiceData.totalDiscount, currency, currencySymbol)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Tax (GST):</span>
                    <span>+{formatCurrency(invoiceData.totalTax, currency, currencySymbol)}</span>
                  </div>
                  <div className="flex justify-between font-black text-sm pt-1 border-t border-border">
                    <span>TOTAL:</span>
                    <span>{formatCurrency(invoiceData.grandTotal, currency, currencySymbol)}</span>
                  </div>
                </div>

                {/* Barcode & Footer */}
                <div className="text-center space-y-2 pt-2">
                  <div className="font-mono tracking-widest text-[9px] bg-muted/60 p-2 rounded">
                    ||| | |||| | ||| |||| | || ||| ||
                    <div className="mt-0.5">{invoiceData.saleId}</div>
                  </div>
                  <div className="text-[10px] text-muted-foreground italic">
                    {invoiceFooterNote || 'Thank you for your visit!'}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
