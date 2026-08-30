import React, { useState, useMemo } from 'react';
import { useWorkbookStore } from '../../stores/workbookStore';
import { useUIStore } from '../../stores/uiStore';
import { formatCurrency } from '../../lib/utils';
import {
  X,
  ShoppingCart,
  Trash2,
  CheckCircle2,
} from 'lucide-react';

interface CartItem {
  productId: string;
  name: string;
  sku: string;
  unitPrice: number;
  quantity: number;
  discount: number;
  gstRate: number;
  availableStock: number;
}

export const NewSaleModal: React.FC = () => {
  const { activeModal, closeModal, openModal, addNotification } = useUIStore();
  const { sheets, addRow, updateRow, saveWorkbook, appConfig } = useWorkbookStore();

  const isOpen = activeModal === 'new_sale';
  const currencySymbol = appConfig?.currencySymbol || '₹';
  const currency = appConfig?.currency || 'INR';

  const customerRows = sheets['_Customers']?.rows || [];
  const productRows = sheets['_Products']?.rows || [];
  const inventoryRows = sheets['_Inventory']?.rows || [];

  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('walk_in');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('Cash');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Available stock map
  const stockMap = useMemo(() => {
    const map: Record<string, number> = {};
    inventoryRows.forEach((inv) => {
      map[inv.product_id] = Number(inv.quantity || 0);
    });
    return map;
  }, [inventoryRows]);

  if (!isOpen) return null;

  const handleAddToCart = (productId: string) => {
    const prod = productRows.find((p) => p.product_id === productId);
    if (!prod) return;

    const available = stockMap[productId] ?? 0;
    const existing = cart.find((item) => item.productId === productId);

    if (existing) {
      if (existing.quantity + 1 > available) {
        addNotification('warning', 'Low Stock Warning', `Only ${available} units available in inventory`);
      }
      setCart(
        cart.map((item) =>
          item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item
        )
      );
    } else {
      if (available <= 0) {
        addNotification('warning', 'Zero Stock Warning', `Product has 0 current stock in inventory`);
      }
      setCart([
        ...cart,
        {
          productId: prod.product_id,
          name: prod.name,
          sku: prod.sku || '',
          unitPrice: Number(prod.selling_price || 0),
          quantity: 1,
          discount: 0,
          gstRate: Number(prod.gst_rate || appConfig?.defaultTaxRate || 18),
          availableStock: available,
        },
      ]);
    }
  };

  const handleUpdateQuantity = (productId: string, qty: number) => {
    if (qty <= 0) {
      setCart(cart.filter((item) => item.productId !== productId));
    } else {
      setCart(
        cart.map((item) =>
          item.productId === productId ? { ...item, quantity: qty } : item
        )
      );
    }
  };

  const handleUpdatePrice = (productId: string, price: number) => {
    setCart(
      cart.map((item) =>
        item.productId === productId ? { ...item, unitPrice: price } : item
      )
    );
  };

  const handleUpdateDiscount = (productId: string, discount: number) => {
    setCart(
      cart.map((item) =>
        item.productId === productId ? { ...item, discount } : item
      )
    );
  };

  const handleRemoveItem = (productId: string) => {
    setCart(cart.filter((item) => item.productId !== productId));
  };

  // Calculations
  const calculations = useMemo(() => {
    let subtotal = 0;
    let totalDiscount = 0;
    let totalTax = 0;

    cart.forEach((item) => {
      const lineBase = item.unitPrice * item.quantity;
      const lineDiscount = Math.min(item.discount, lineBase);
      const taxableAmount = lineBase - lineDiscount;
      const lineTax = (taxableAmount * item.gstRate) / 100;

      subtotal += lineBase;
      totalDiscount += lineDiscount;
      totalTax += lineTax;
    });

    const grandTotal = subtotal - totalDiscount + totalTax;

    return {
      subtotal,
      totalDiscount,
      totalTax,
      grandTotal,
    };
  }, [cart]);

  const handleCompleteSale = async () => {
    if (cart.length === 0) {
      addNotification('warning', 'Empty Order', 'Please add at least one product to the sale');
      return;
    }

    setSubmitting(true);
    try {
      const saleId = `sale_${Date.now()}`;
      const nowIso = new Date().toISOString();
      const saleDate = nowIso.split('T')[0];

      // 1. Record in _Sales
      const saleRecord = {
        sale_id: saleId,
        customer_id: selectedCustomerId === 'walk_in' ? '' : selectedCustomerId,
        sale_date: saleDate,
        subtotal: calculations.subtotal,
        discount: calculations.totalDiscount,
        tax: calculations.totalTax,
        total: calculations.grandTotal,
        payment_method: selectedPaymentMethod,
        status: 'completed',
        notes,
        created_at: nowIso,
      };
      addRow('_Sales', saleRecord);

      // 2. Record items in _SaleItems & update _Inventory
      for (const item of cart) {
        const saleItemId = `item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        const lineBase = item.unitPrice * item.quantity;
        const lineDiscount = Math.min(item.discount, lineBase);
        const taxable = lineBase - lineDiscount;
        const lineTax = (taxable * item.gstRate) / 100;
        const lineTotal = taxable + lineTax;

        addRow('_SaleItems', {
          sale_item_id: saleItemId,
          sale_id: saleId,
          product_id: item.productId,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          discount: item.discount,
          tax: lineTax,
          line_total: lineTotal,
        });

        // Reduce inventory
        const invRow = inventoryRows.find((i) => i.product_id === item.productId);
        if (invRow) {
          const newQty = Number(invRow.quantity || 0) - item.quantity;
          updateRow('_Inventory', 'inventory_id', invRow.inventory_id, {
            quantity: newQty,
            updated_at: nowIso,
          });
        }

        // Record stock movement
        addRow('_StockMovements', {
          movement_id: `mov_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          product_id: item.productId,
          type: 'SALE',
          quantity: -item.quantity,
          reference_id: saleId,
          notes: `Sold via POS Order ${saleId}`,
          created_at: nowIso,
        });
      }

      // Auto-save workbook
      await saveWorkbook();

      addNotification('success', 'Sale Completed', `Order ${saleId} recorded and inventory updated`);
      closeModal();

      // Open Invoice preview
      openModal('invoice_preview', {
        saleId,
        saleRecord,
        cart,
        calculations,
        customerName:
          customerRows.find((c) => c.customer_id === selectedCustomerId)?.name || 'Walk-in Customer',
      });
    } catch (err: any) {
      addNotification('error', 'Sale Failed', err.message || 'Transaction could not be completed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4 select-none animate-in fade-in">
      <div className="bg-card border border-border rounded-2xl shadow-2xl max-w-4xl w-full h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/30 shrink-0">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-emerald-500" />
            <h2 className="text-base font-bold text-foreground">New Point of Sale (POS) Transaction</h2>
          </div>
          <button
            onClick={closeModal}
            className="p-1 text-muted-foreground hover:text-foreground rounded-lg transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body: Split View (Products Catalog on left, Cart on right) */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
          {/* Left: Product Selector (5 cols) */}
          <div className="md:col-span-5 border-r border-border flex flex-col overflow-hidden bg-muted/10 p-4 space-y-3">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Select Products
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {productRows.length === 0 ? (
                <div className="text-center py-12 text-xs text-muted-foreground">
                  No products found. Please add products first.
                </div>
              ) : (
                productRows.map((prod) => {
                  const stock = stockMap[prod.product_id] ?? 0;
                  const isLow = stock <= Number(prod.minimum_stock || 0);

                  return (
                    <div
                      key={prod.product_id}
                      onClick={() => handleAddToCart(prod.product_id)}
                      className="p-3 bg-card border border-border rounded-xl hover:border-primary/50 hover:shadow-sm cursor-pointer transition flex items-center justify-between group"
                    >
                      <div className="truncate pr-2">
                        <div className="text-xs font-semibold text-foreground group-hover:text-primary transition truncate">
                          {prod.name}
                        </div>
                        <div className="text-[10px] text-muted-foreground flex items-center gap-2 mt-0.5">
                          <span>SKU: {prod.sku || '-'}</span>
                          <span
                            className={`px-1.5 py-0.2 rounded font-bold ${
                              isLow ? 'bg-amber-500/20 text-amber-500' : 'bg-emerald-500/20 text-emerald-500'
                            }`}
                          >
                            {stock} in stock
                          </span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-xs font-bold text-foreground">
                          {formatCurrency(prod.selling_price, currency, currencySymbol)}
                        </div>
                        <span className="text-[10px] text-primary group-hover:underline">
                          + Add
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right: Cart & Billing (7 cols) */}
          <div className="md:col-span-7 flex flex-col overflow-hidden p-5 space-y-4">
            {/* Customer & Payment Method Selector */}
            <div className="grid grid-cols-2 gap-3 shrink-0">
              <div>
                <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                  Customer
                </label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none focus:border-primary"
                >
                  <option value="walk_in">Walk-in Customer</option>
                  {customerRows.map((c) => (
                    <option key={c.customer_id} value={c.customer_id}>
                      {c.name} ({c.phone || 'No phone'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                  Payment Method
                </label>
                <select
                  value={selectedPaymentMethod}
                  onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none focus:border-primary"
                >
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI / QR Code</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Debit Card">Debit Card</option>
                  <option value="Net Banking">Net Banking</option>
                  <option value="Credit / Pay Later">Credit / Pay Later</option>
                </select>
              </div>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto border border-border rounded-xl p-2 space-y-2">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-muted-foreground text-xs">
                  <ShoppingCart className="h-8 w-8 text-muted-foreground/40 mb-2" />
                  <span>Cart is empty. Click any product on the left to add it.</span>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.productId}
                    className="flex items-center justify-between p-2.5 bg-muted/30 border border-border/80 rounded-lg text-xs gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-foreground truncate">{item.name}</div>
                      <div className="text-[10px] text-muted-foreground">
                        Rate: {item.gstRate}% GST | Available: {item.availableStock}
                      </div>
                    </div>

                    {/* Quantity Selector */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                        className="h-6 w-6 rounded bg-muted hover:bg-muted/80 flex items-center justify-center text-foreground font-bold"
                      >
                        -
                      </button>
                      <span className="w-8 text-center font-semibold text-foreground">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                        className="h-6 w-6 rounded bg-muted hover:bg-muted/80 flex items-center justify-center text-foreground font-bold"
                      >
                        +
                      </button>
                    </div>

                    {/* Price, Discount & Line Total */}
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <label className="text-[9px] text-muted-foreground block">Price</label>
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={item.unitPrice}
                          onChange={(e) => handleUpdatePrice(item.productId, Number(e.target.value))}
                          className="w-16 px-1 py-0.5 text-right font-mono text-xs bg-background border border-border rounded"
                        />
                      </div>
                      <div className="text-right">
                        <label className="text-[9px] text-muted-foreground block">Disc</label>
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={item.discount}
                          onChange={(e) => handleUpdateDiscount(item.productId, Number(e.target.value))}
                          className="w-14 px-1 py-0.5 text-right font-mono text-xs bg-background border border-border rounded text-emerald-500"
                        />
                      </div>
                      <div className="w-20 text-right">
                        <label className="text-[9px] text-muted-foreground block">Total</label>
                        <div className="font-bold text-foreground font-mono">
                          {formatCurrency((item.unitPrice * item.quantity - item.discount) * (1 + item.gstRate / 100), currency, currencySymbol)}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRemoveItem(item.productId)}
                      className="text-muted-foreground hover:text-destructive p-1 rounded transition"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Order Notes */}
            <div>
              <input
                type="text"
                placeholder="Optional order notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-muted/40 border border-border rounded-lg text-foreground focus:outline-none focus:border-primary"
              />
            </div>

            {/* Calculations Summary */}
            <div className="bg-muted/40 border border-border rounded-xl p-3 space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>{formatCurrency(calculations.subtotal, currency, currencySymbol)}</span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Discount</span>
                <span className="text-emerald-500 font-medium">
                  -{formatCurrency(calculations.totalDiscount, currency, currencySymbol)}
                </span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Estimated Tax (GST)</span>
                <span>+{formatCurrency(calculations.totalTax, currency, currencySymbol)}</span>
              </div>
              <div className="border-t border-border pt-1.5 flex items-center justify-between text-sm font-bold text-foreground">
                <span>Grand Total</span>
                <span className="text-primary text-base">
                  {formatCurrency(calculations.grandTotal, currency, currencySymbol)}
                </span>
              </div>
            </div>

            {/* Complete Sale CTA */}
            <div className="flex items-center justify-end gap-3 shrink-0">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-xs text-muted-foreground hover:text-foreground rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCompleteSale}
                disabled={submitting || cart.length === 0}
                className="flex items-center gap-2 px-6 py-2.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition disabled:opacity-50"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Complete Sale ({formatCurrency(calculations.grandTotal, currency, currencySymbol)})</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
