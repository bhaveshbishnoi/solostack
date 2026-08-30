import React, { useState } from 'react';
import { useWorkbookStore } from '../../../stores/workbookStore';
import { formatCurrency } from '../../../lib/utils';
import {
  Home,
  CheckCircle2,
  DollarSign
} from 'lucide-react';

interface RealEstateConsoleProps {
  appConfig: any;
  currency: string;
  currencySymbol: string;
  submitting: boolean;
  onComplete: (data: any) => Promise<void>;
}

export const RealEstateConsole: React.FC<RealEstateConsoleProps> = ({
  currency,
  currencySymbol,
  submitting,
  onComplete,
}) => {
  const { sheets } = useWorkbookStore();

  const productRows = sheets['_Products']?.rows || [];
  const customerRows = sheets['_Customers']?.rows || [];

  const [selectedTenant, setSelectedTenant] = useState(customerRows[0]?.name || 'Naveen Chaudhary');
  const [tenantPhone, setTenantPhone] = useState(customerRows[0]?.phone || '+91 98118 33442');
  const [selectedUnit, setSelectedUnit] = useState(customerRows[0]?.address || 'Flat 402, Palm Heights Residency');
  const [unitType, setUnitType] = useState(productRows[0]?.name || '2 BHK Semi-Furnished Residential Apartment');
  const [baseRent, setBaseRent] = useState(Number(productRows[0]?.selling_price || 32000));
  const [maintenanceFee, setMaintenanceFee] = useState(Number(productRows[0]?.purchase_price || 3500));
  const [rentMonth, setRentMonth] = useState(new Date().toISOString().split('T')[0]);
  const [concession, setConcession] = useState(0);
  const [taxPercent, setTaxPercent] = useState(0); // 0% for residential, 18% for commercial
  const [paymentMethod, setPaymentMethod] = useState('Bank Transfer (NEFT)');
  const [notes, setNotes] = useState('Rent received in full for current month');

  const subtotal = baseRent + maintenanceFee;
  const taxable = Math.max(0, subtotal - concession);
  const taxAmount = (taxable * taxPercent) / 100;
  const totalAmount = Math.round(taxable + taxAmount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await onComplete({
      customerName: selectedTenant,
      passengerPhone: tenantPhone,
      pickupLocation: selectedUnit,
      guestIdProof: unitType,
      subtotal,
      tax: taxAmount,
      total: totalAmount,
      paymentMethod,
      rentMonth,
      maintenanceFee,
      notes,
    });
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 max-w-4xl mx-auto w-full space-y-6 bg-background">
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-border/70 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <Home className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Collect Monthly Rent & Issue Receipt</h2>
              <p className="text-xs text-muted-foreground">Property leasing, tenancy maintenance, and rent ledger</p>
            </div>
          </div>
          <span className="px-3 py-1 bg-blue-500/10 text-blue-500 text-xs font-bold rounded-full">
            Property Edition
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          {/* Tenant & Leased Property Unit */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-foreground mb-1">Tenant Name *</label>
              <input
                type="text"
                required
                value={selectedTenant}
                onChange={(e) => setSelectedTenant(e.target.value)}
                placeholder="e.g. Naveen Chaudhary"
                className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl text-foreground font-medium focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block font-semibold text-foreground mb-1">Tenant Mobile / WhatsApp</label>
              <input
                type="text"
                value={tenantPhone}
                onChange={(e) => setTenantPhone(e.target.value)}
                placeholder="+91 98118 33442"
                className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl text-foreground font-medium focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-foreground mb-1">Leased Unit / Flat #</label>
              <input
                type="text"
                value={selectedUnit}
                onChange={(e) => setSelectedUnit(e.target.value)}
                placeholder="e.g. Flat 402, Palm Heights"
                className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl text-foreground font-medium focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block font-semibold text-foreground mb-1">Property Classification</label>
              <select
                value={unitType}
                onChange={(e) => {
                  setUnitType(e.target.value);
                  const matched = productRows.find((p) => p.name === e.target.value);
                  if (matched) {
                    setBaseRent(Number(matched.selling_price || 32000));
                    setMaintenanceFee(Number(matched.purchase_price || 3500));
                  }
                }}
                className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl text-foreground font-medium focus:outline-none focus:border-primary"
              >
                {productRows.map((p) => (
                  <option key={p.product_id} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Financial Breakdown */}
          <div className="p-4 bg-muted/20 border border-border rounded-xl space-y-3">
            <h3 className="font-bold text-foreground text-xs flex items-center gap-1.5">
              <DollarSign className="h-4 w-4 text-primary" />
              <span>Rental Charges Breakdown</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-muted-foreground text-[11px] mb-1">Base Monthly Rent</label>
                <div className="relative">
                  <span className="absolute left-2.5 top-2 text-muted-foreground">{currencySymbol}</span>
                  <input
                    type="number"
                    value={baseRent}
                    onChange={(e) => setBaseRent(Number(e.target.value))}
                    className="w-full pl-6 pr-2 py-1.5 bg-background border border-border rounded-lg text-foreground font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-muted-foreground text-[11px] mb-1">Society Maintenance</label>
                <div className="relative">
                  <span className="absolute left-2.5 top-2 text-muted-foreground">{currencySymbol}</span>
                  <input
                    type="number"
                    value={maintenanceFee}
                    onChange={(e) => setMaintenanceFee(Number(e.target.value))}
                    className="w-full pl-6 pr-2 py-1.5 bg-background border border-border rounded-lg text-foreground font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-muted-foreground text-[11px] mb-1">Advance Concession</label>
                <div className="relative">
                  <span className="absolute left-2.5 top-2 text-muted-foreground">{currencySymbol}</span>
                  <input
                    type="number"
                    value={concession}
                    onChange={(e) => setConcession(Number(e.target.value))}
                    className="w-full pl-6 pr-2 py-1.5 bg-background border border-border rounded-lg text-foreground font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-muted-foreground text-[11px] mb-1">Commercial GST %</label>
                <select
                  value={taxPercent}
                  onChange={(e) => setTaxPercent(Number(e.target.value))}
                  className="w-full px-2 py-1.5 bg-background border border-border rounded-lg text-foreground font-bold"
                >
                  <option value={0}>0% (Residential)</option>
                  <option value={18}>18% (Commercial IT/Office)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-border/60 text-xs">
              <span className="font-semibold text-muted-foreground">Total Rent Collected:</span>
              <span className="font-mono text-base font-extrabold text-primary">
                {formatCurrency(totalAmount, currency, currencySymbol)}
              </span>
            </div>
          </div>

          {/* Payment Method & Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-foreground mb-1">Settlement Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl text-foreground font-medium focus:outline-none focus:border-primary"
              >
                <option value="Bank Transfer (NEFT)">Bank Transfer (NEFT / RTGS)</option>
                <option value="UPI / QR">UPI / QR (PhonePe, GPay)</option>
                <option value="Cheque">Account Payee Cheque</option>
                <option value="Cash">Cash Receipt</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-foreground mb-1">Receipt Month Date</label>
              <input
                type="date"
                value={rentMonth}
                onChange={(e) => setRentMonth(e.target.value)}
                className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl text-foreground focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-foreground mb-1">Receipt Remarks / Notes</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Rent received in full"
              className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl text-foreground focus:outline-none focus:border-primary"
            />
          </div>

          <button
            type="submit"
            disabled={submitting || totalAmount <= 0}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs shadow-md teal-glow transition disabled:opacity-50 cursor-pointer"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>Generate & Record Rent Receipt ({formatCurrency(totalAmount, currency, currencySymbol)})</span>
          </button>
        </form>
      </div>
    </div>
  );
};
