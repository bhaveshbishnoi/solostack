import React, { useState, useMemo } from 'react';
import { useWorkbookStore } from '../../../stores/workbookStore';
import { formatCurrency } from '../../../lib/utils';
import {
  Wrench,
  CheckCircle2,
  Plus,
  Trash2
} from 'lucide-react';

interface GarageConsoleProps {
  appConfig: any;
  currency: string;
  currencySymbol: string;
  submitting: boolean;
  onComplete: (data: any) => Promise<void>;
}

export const GarageConsole: React.FC<GarageConsoleProps> = ({
  currency,
  currencySymbol,
  submitting,
  onComplete,
}) => {
  const { sheets } = useWorkbookStore();

  const productRows = sheets['_Products']?.rows || [];
  const customerRows = sheets['_Customers']?.rows || [];

  const [customerName, setCustomerName] = useState(customerRows[0]?.name || 'Manish Talwar');
  const [customerPhone, setCustomerPhone] = useState(customerRows[0]?.phone || '+91 98110 55667');
  const [vehicleModel, setVehicleModel] = useState('Hyundai Creta SX');
  const [plateNumber, setPlateNumber] = useState('DL-03-CC-9812');
  const [odometerKm, setOdometerKm] = useState('42,500');

  // Selected Services & Spares
  const [selectedItems, setSelectedItems] = useState<{ id: string; name: string; price: number; qty: number }[]>([
    {
      id: productRows[0]?.product_id || 'p1',
      name: productRows[0]?.name || 'Comprehensive Periodic Car Service Package',
      price: Number(productRows[0]?.selling_price || 3499),
      qty: 1,
    },
  ]);

  const [laborCharge, setLaborCharge] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(200);
  const [paymentMethod, setPaymentMethod] = useState('UPI / Card');

  const handleAddItem = (prod: any) => {
    setSelectedItems((prev) => {
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

  const handleRemoveItem = (id: string) => {
    setSelectedItems((prev) => prev.filter((item) => item.id !== id));
  };

  const subtotal = useMemo(() => {
    const itemsTotal = selectedItems.reduce((acc, item) => acc + item.price * item.qty, 0);
    return itemsTotal + laborCharge;
  }, [selectedItems, laborCharge]);

  const taxable = Math.max(0, subtotal - discountAmount);
  const taxAmount = (taxable * 18) / 100; // 18% auto repair GST
  const grandTotal = Math.round(taxable + taxAmount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await onComplete({
      customerName,
      passengerPhone: customerPhone,
      pickupLocation: `${vehicleModel} (${plateNumber})`,
      guestIdProof: `${odometerKm} km`,
      subtotal,
      tax: taxAmount,
      total: grandTotal,
      paymentMethod,
      vehicleModel,
      plateNumber,
      selectedItems,
    });
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 max-w-4xl mx-auto w-full space-y-6 bg-background">
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-border/70 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
              <Wrench className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Workshop Job Card & Repair Invoice</h2>
              <p className="text-xs text-muted-foreground">Vehicle check-in, labor service, spare parts & delivery bill</p>
            </div>
          </div>
          <span className="px-3 py-1 bg-orange-500/10 text-orange-500 text-xs font-bold rounded-full">
            Garage Edition
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          {/* Owner & Vehicle Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-foreground mb-1">Vehicle Owner Name *</label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Manish Talwar"
                className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl text-foreground font-medium focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block font-semibold text-foreground mb-1">Owner Contact Phone</label>
              <input
                type="text"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="+91 98110 55667"
                className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl text-foreground font-medium focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-foreground mb-1">Vehicle Make & Model</label>
              <input
                type="text"
                value={vehicleModel}
                onChange={(e) => setVehicleModel(e.target.value)}
                placeholder="e.g. Hyundai Creta SX"
                className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl text-foreground font-medium focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block font-semibold text-foreground mb-1">Registration Plate #</label>
              <input
                type="text"
                value={plateNumber}
                onChange={(e) => setPlateNumber(e.target.value)}
                placeholder="e.g. DL-03-CC-9812"
                className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl text-foreground font-mono font-bold focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block font-semibold text-foreground mb-1">Odometer (km)</label>
              <input
                type="text"
                value={odometerKm}
                onChange={(e) => setOdometerKm(e.target.value)}
                placeholder="e.g. 42,500"
                className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl text-foreground font-medium focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* Service Packages & Parts Selector */}
          <div className="space-y-2 border border-border rounded-xl p-4 bg-muted/10">
            <div className="flex items-center justify-between">
              <span className="font-bold text-foreground text-xs">Add Service Packages / Spare Parts</span>
              <span className="text-[10px] text-muted-foreground">Select from catalog</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {productRows.map((p) => (
                <button
                  key={p.product_id}
                  type="button"
                  onClick={() => handleAddItem(p)}
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

            {/* Selected Items Table */}
            <div className="mt-3 space-y-1.5">
              {selectedItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-card border border-border/70 text-xs"
                >
                  <span className="font-semibold text-foreground">{item.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-foreground">
                      {formatCurrency(item.price * item.qty, currency, currencySymbol)}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
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
              <span className="text-muted-foreground">Additional Mechanic Labor:</span>
              <input
                type="number"
                value={laborCharge}
                onChange={(e) => setLaborCharge(Math.max(0, Number(e.target.value)))}
                className="w-24 px-2 py-1 bg-background border border-border rounded text-right font-mono font-bold text-foreground"
              />
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground">Workshop Discount:</span>
              <input
                type="number"
                value={discountAmount}
                onChange={(e) => setDiscountAmount(Math.max(0, Number(e.target.value)))}
                className="w-24 px-2 py-1 bg-background border border-border rounded text-right font-mono font-bold text-foreground"
              />
            </div>

            <div className="flex justify-between text-xs text-muted-foreground">
              <span>GST (18% Auto Service):</span>
              <span className="font-mono font-bold text-foreground">
                {formatCurrency(taxAmount, currency, currencySymbol)}
              </span>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-border/60 text-sm font-bold">
              <span className="text-foreground">Total Invoice Amount:</span>
              <span className="font-mono text-base font-extrabold text-primary">
                {formatCurrency(grandTotal, currency, currencySymbol)}
              </span>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-foreground mb-1">Settlement Method</label>
            <div className="grid grid-cols-3 gap-2">
              {['UPI / Card', 'Cash', 'Bank NEFT'].map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPaymentMethod(method)}
                  className={`py-2 text-center rounded-xl border text-xs font-bold transition ${
                    paymentMethod === method
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-muted/40 border-border text-foreground hover:bg-muted'
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || selectedItems.length === 0}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs shadow-md teal-glow transition disabled:opacity-50 cursor-pointer"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>Issue Repair Invoice & Deliver Vehicle ({formatCurrency(grandTotal, currency, currencySymbol)})</span>
          </button>
        </form>
      </div>
    </div>
  );
};
