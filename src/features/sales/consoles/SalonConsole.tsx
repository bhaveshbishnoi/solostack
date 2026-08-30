import React, { useState, useMemo } from 'react';
import { useWorkbookStore } from '../../../stores/workbookStore';
import { formatCurrency } from '../../../lib/utils';
import {
  Sparkles,
  CheckCircle2,
  Plus,
  Trash2
} from 'lucide-react';

interface SalonConsoleProps {
  appConfig: any;
  currency: string;
  currencySymbol: string;
  submitting: boolean;
  onComplete: (data: any) => Promise<void>;
}

export const SalonConsole: React.FC<SalonConsoleProps> = ({
  currency,
  currencySymbol,
  submitting,
  onComplete,
}) => {
  const { sheets } = useWorkbookStore();

  const productRows = sheets['_Products']?.rows || [];
  const customerRows = sheets['_Customers']?.rows || [];

  const [clientName, setClientName] = useState(customerRows[0]?.name || 'Meenakshi Sundaram');
  const [clientPhone, setClientPhone] = useState(customerRows[0]?.phone || '+91 98221 44551');
  const [stylistName, setStylistName] = useState('Senior Stylist Tanya');

  const [selectedTreatments, setSelectedTreatments] = useState<{ id: string; name: string; price: number; qty: number }[]>([
    {
      id: productRows[0]?.product_id || 'p1',
      name: productRows[0]?.name || 'Bridal Makeup & Hair Styling Package',
      price: Number(productRows[0]?.selling_price || 6500),
      qty: 1,
    },
  ]);

  const [membershipDiscount, setMembershipDiscount] = useState(10);
  const [paymentMethod, setPaymentMethod] = useState('UPI / Card');

  const handleAddTreatment = (prod: any) => {
    setSelectedTreatments((prev) => {
      const existing = prev.find((item) => item.id === prod.product_id);
      if (existing) {
        return prev.map((item) => (item.id === prod.product_id ? { ...item, qty: item.qty + 1 } : item));
      }
      return [
        ...prev,
        {
          id: prod.product_id,
          name: prod.name,
          price: Number(prod.selling_price || 0),
          qty: 1,
        },
      ];
    });
  };

  const handleRemoveTreatment = (id: string) => {
    setSelectedTreatments((prev) => prev.filter((item) => item.id !== id));
  };

  const subtotal = useMemo(() => {
    return selectedTreatments.reduce((acc, item) => acc + item.price * item.qty, 0);
  }, [selectedTreatments]);

  const discountAmount = (subtotal * membershipDiscount) / 100;
  const taxable = Math.max(0, subtotal - discountAmount);
  const taxAmount = (taxable * 18) / 100; // 18% salon & spa service GST
  const grandTotal = Math.round(taxable + taxAmount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await onComplete({
      customerName: clientName,
      passengerPhone: clientPhone,
      pickupLocation: stylistName,
      guestIdProof: 'Salon & Spa Appointment',
      subtotal,
      tax: taxAmount,
      total: grandTotal,
      paymentMethod,
      stylistName,
      selectedTreatments,
    });
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 max-w-4xl mx-auto w-full space-y-6 bg-background">
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-border/70 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-pink-500/10 text-pink-500 flex items-center justify-center">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Salon Appointment & Styling Billing</h2>
              <p className="text-xs text-muted-foreground">Stylist sessions, beauty spa treatments & cosmetic invoices</p>
            </div>
          </div>
          <span className="px-3 py-1 bg-pink-500/10 text-pink-500 text-xs font-bold rounded-full">
            Salon Edition
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          {/* Client & Stylist */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-foreground mb-1">Client Name *</label>
              <input
                type="text"
                required
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="e.g. Meenakshi Sundaram"
                className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl text-foreground font-medium focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block font-semibold text-foreground mb-1">WhatsApp / Mobile</label>
              <input
                type="text"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                placeholder="+91 98221 44551"
                className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl text-foreground font-medium focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block font-semibold text-foreground mb-1">Assigned Master Stylist</label>
              <input
                type="text"
                value={stylistName}
                onChange={(e) => setStylistName(e.target.value)}
                placeholder="e.g. Tanya / Rahul"
                className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl text-foreground font-medium focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* Treatment & Beauty Services Catalog */}
          <div className="space-y-2 border border-border rounded-xl p-4 bg-muted/10">
            <div className="flex items-center justify-between">
              <span className="font-bold text-foreground text-xs">Select Treatments / Beauty Services</span>
              <span className="text-[10px] text-muted-foreground">Click to add to session bill</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {productRows.map((p) => (
                <button
                  key={p.product_id}
                  type="button"
                  onClick={() => handleAddTreatment(p)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-card border border-border hover:border-primary/50 text-foreground rounded-xl text-xs transition"
                >
                  <Plus className="h-3 w-3 text-primary" />
                  <span>{p.name}</span>
                  <span className="font-mono text-primary font-bold">
                    ({formatCurrency(p.selling_price || 0, currency, currencySymbol)})
                  </span>
                </button>
              ))}
            </div>

            {/* Selected Treatments Table */}
            <div className="mt-3 space-y-1.5">
              {selectedTreatments.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-card border border-border/70 text-xs"
                >
                  <span className="font-semibold text-foreground">{item.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-foreground">
                      {formatCurrency(item.price * item.qty, currency, currencySymbol)}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTreatment(item.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing & Invoice Totals */}
          <div className="p-4 bg-muted/20 border border-border rounded-xl space-y-2.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground">Membership Club Concession (%):</span>
              <input
                type="number"
                min="0"
                max="100"
                value={membershipDiscount}
                onChange={(e) => setMembershipDiscount(Math.max(0, Number(e.target.value)))}
                className="w-20 px-2 py-1 bg-background border border-border rounded text-right font-mono font-bold text-foreground"
              />
            </div>

            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Salon GST (18%):</span>
              <span className="font-mono font-bold text-foreground">
                {formatCurrency(taxAmount, currency, currencySymbol)}
              </span>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-border/60 text-sm font-bold">
              <span className="text-foreground">Total Payable:</span>
              <span className="font-mono text-base font-extrabold text-primary">
                {formatCurrency(grandTotal, currency, currencySymbol)}
              </span>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-foreground mb-1">Payment Method</label>
            <div className="grid grid-cols-3 gap-2">
              {['UPI / Card', 'Cash', 'Gift Card'].map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setPaymentMethod(mode)}
                  className={`py-2 text-center rounded-xl border text-xs font-bold transition ${
                    paymentMethod === mode
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-muted/40 border-border text-foreground hover:bg-muted'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || selectedTreatments.length === 0}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs shadow-md teal-glow transition disabled:opacity-50 cursor-pointer"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>Complete Session & Print Invoice ({formatCurrency(grandTotal, currency, currencySymbol)})</span>
          </button>
        </form>
      </div>
    </div>
  );
};
