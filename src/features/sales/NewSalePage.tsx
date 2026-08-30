import React, { useState, useMemo } from 'react';
import { useWorkbookStore } from '../../stores/workbookStore';
import { useUIStore } from '../../stores/uiStore';
import { formatCurrency, formatDate } from '../../lib/utils';
import {
  ArrowLeft,
  ShoppingCart,
  Trash2,
  CheckCircle2,
  Printer,
  Search,
  Plus,
  Receipt,
  RotateCcw
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

export const NewSalePage: React.FC = () => {
  const { sheets, addRow, updateRow, saveWorkbook, appConfig, setActiveSheet } = useWorkbookStore();
  const { addNotification } = useUIStore();

  const currencySymbol = appConfig?.currencySymbol || '₹';
  const currency = appConfig?.currency || 'INR';

  const customerRows = sheets['_Customers']?.rows || [];
  const productRows = sheets['_Products']?.rows || [];
  const inventoryRows = sheets['_Inventory']?.rows || [];
  const categoryRows = sheets['_Categories']?.rows || [];

  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('walk_in');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('Cash');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Completed order receipt state
  const [completedOrder, setCompletedOrder] = useState<any | null>(null);

  // Available stock lookup
  const stockMap = useMemo(() => {
    const map: Record<string, number> = {};
    inventoryRows.forEach((inv) => {
      map[inv.product_id] = Number(inv.quantity || 0);
    });
    return map;
  }, [inventoryRows]);

  // Filtered products
  const filteredProducts = useMemo(() => {
    return productRows.filter((p) => {
      const matchesCategory = selectedCategory === 'all' || p.category_id === selectedCategory;
      const matchesSearch =
        !searchQuery.trim() ||
        String(p.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(p.sku || '').toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [productRows, selectedCategory, searchQuery]);

  const handleAddToCart = (productId: string) => {
    const prod = productRows.find((p) => p.product_id === productId);
    if (!prod) return;

    const available = stockMap[productId] ?? 0;
    const existing = cart.find((item) => item.productId === productId);

    if (existing) {
      setCart(
        cart.map((item) =>
          item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item
        )
      );
    } else {
      if (available <= 0) {
        addNotification('warning', 'Low Stock Warning', `Product currently has 0 physical stock in inventory`);
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
      addNotification('warning', 'Empty Cart', 'Please add at least one product');
      return;
    }

    setSubmitting(true);
    try {
      const saleId = `sale_${Date.now()}`;
      const nowIso = new Date().toISOString();
      const saleDate = nowIso.split('T')[0];

      // 1. Record Sale in _Sales
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

      // 2. Record items in _SaleItems and update _Inventory
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

        // Reduce inventory stock
        const invRow = inventoryRows.find((i) => i.product_id === item.productId);
        if (invRow) {
          const newQty = Number(invRow.quantity || 0) - item.quantity;
          updateRow('_Inventory', 'inventory_id', invRow.inventory_id, {
            quantity: newQty,
            updated_at: nowIso,
          });
        }

        // Record stock audit trail
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

      await saveWorkbook();

      const customerObj = customerRows.find((c) => c.customer_id === selectedCustomerId);
      setCompletedOrder({
        saleId,
        saleRecord,
        cart: [...cart],
        calculations,
        customerName: customerObj?.name || 'Walk-in Customer',
      });

      addNotification('success', 'Sale Completed! 🎉', `Recorded order ${saleId} and reduced stock`);
    } catch (err: any) {
      addNotification('error', 'Sale Failed', err.message || 'Transaction could not be completed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartFreshSale = () => {
    setCompletedOrder(null);
    setCart([]);
    setNotes('');
  };

  // If order completed, show printable in-page invoice receipt!
  if (completedOrder) {
    return (
      <div className="flex-1 flex flex-col h-full overflow-y-auto p-8 bg-background">
        <div className="max-w-3xl mx-auto w-full space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Sale Completed Successfully</h1>
                <p className="text-xs text-muted-foreground">Order ID #{completedOrder.saleId}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3 py-2 text-xs bg-muted hover:bg-muted/80 text-foreground border border-border rounded-xl transition font-medium"
              >
                <Printer className="h-4 w-4" />
                <span>Print Invoice</span>
              </button>
              <button
                onClick={handleStartFreshSale}
                className="flex items-center gap-1.5 px-4 py-2 text-xs bg-primary text-primary-foreground font-semibold rounded-xl shadow-sm hover:bg-primary/90 transition"
              >
                <Plus className="h-4 w-4" />
                <span>New Sale</span>
              </button>
              <button
                onClick={() => setActiveSheet('_Sales')}
                className="flex items-center gap-1.5 px-3 py-2 text-xs bg-muted hover:bg-muted/80 text-foreground border border-border rounded-xl transition"
              >
                <span>View Sales History</span>
              </button>
            </div>
          </div>

          {/* Printable Invoice Sheet */}
          <div className="bg-card border border-border rounded-2xl p-8 shadow-md space-y-6" id="printable-area">
            <div className="flex justify-between border-b border-border pb-6">
              <div>
                <h2 className="text-2xl font-extrabold text-foreground tracking-tight">
                  {appConfig?.businessName || 'Business Name'}
                </h2>
                <div className="text-xs text-muted-foreground mt-1">
                  Tax Invoice • {appConfig?.businessType}
                </div>
              </div>
              <div className="text-right text-xs">
                <div className="font-bold text-foreground font-mono text-sm">#{completedOrder.saleId}</div>
                <div className="text-muted-foreground mt-1">Date: {formatDate(completedOrder.saleRecord.sale_date)}</div>
                <div className="text-emerald-500 font-semibold mt-1">PAID ({completedOrder.saleRecord.payment_method})</div>
              </div>
            </div>

            <div className="text-xs">
              <div className="text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">Customer</div>
              <div className="font-bold text-foreground text-sm mt-0.5">{completedOrder.customerName}</div>
            </div>

            {/* Items Table */}
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border text-muted-foreground text-[11px]">
                  <th className="py-2.5 font-semibold">Item</th>
                  <th className="py-2.5 font-semibold text-center">Qty</th>
                  <th className="py-2.5 font-semibold text-right">Price</th>
                  <th className="py-2.5 font-semibold text-right">Tax</th>
                  <th className="py-2.5 font-semibold text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {completedOrder.cart.map((item: any, idx: number) => {
                  const lineBase = item.unitPrice * item.quantity;
                  const lineTax = (lineBase * item.gstRate) / 100;
                  const lineTotal = lineBase + lineTax;
                  return (
                    <tr key={idx}>
                      <td className="py-2.5 font-medium text-foreground">
                        <div>{item.name}</div>
                        {item.sku && <div className="text-[10px] text-muted-foreground font-mono">SKU: {item.sku}</div>}
                      </td>
                      <td className="py-2.5 text-center font-mono">{item.quantity}</td>
                      <td className="py-2.5 text-right font-mono">{formatCurrency(item.unitPrice, currency, currencySymbol)}</td>
                      <td className="py-2.5 text-right text-muted-foreground font-mono">{item.gstRate}%</td>
                      <td className="py-2.5 text-right font-bold text-foreground font-mono">
                        {formatCurrency(lineTotal, currency, currencySymbol)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Totals */}
            <div className="border-t border-border pt-4 flex justify-end">
              <div className="w-64 space-y-2 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="font-mono">{formatCurrency(completedOrder.calculations.subtotal, currency, currencySymbol)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Total Tax</span>
                  <span className="font-mono">+{formatCurrency(completedOrder.calculations.totalTax, currency, currencySymbol)}</span>
                </div>
                <div className="border-t border-border pt-2 flex justify-between text-base font-bold text-foreground">
                  <span>Grand Total</span>
                  <span className="text-primary font-mono">{formatCurrency(completedOrder.calculations.grandTotal, currency, currencySymbol)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-background">
      {/* Top Header */}
      <div className="h-14 border-b border-border bg-card/60 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveSheet('dashboard')}
            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition"
            title="Back to Dashboard"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-emerald-500" />
            <h1 className="text-base font-bold text-foreground">Point of Sale (POS) & Checkout</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSheet('_Sales')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-muted/60 hover:bg-muted text-foreground border border-border rounded-lg transition"
          >
            <Receipt className="h-3.5 w-3.5" />
            <span>Sales History</span>
          </button>
        </div>
      </div>

      {/* Main POS Split Workspace */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* Left: Product Catalog (6 cols) */}
        <div className="lg:col-span-6 border-r border-border flex flex-col overflow-hidden bg-muted/10 p-5 space-y-4">
          {/* Search and Category Filters */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search products by name or SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-background border border-border rounded-xl text-foreground focus:outline-none focus:border-primary placeholder:text-muted-foreground shadow-sm"
              />
            </div>

            {/* Category pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition shrink-0 ${
                  selectedCategory === 'all'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted/70 text-muted-foreground hover:text-foreground'
                }`}
              >
                All Products ({productRows.length})
              </button>
              {categoryRows.map((cat) => (
                <button
                  key={cat.category_id}
                  onClick={() => setSelectedCategory(cat.category_id)}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition shrink-0 ${
                    selectedCategory === cat.category_id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted/70 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1 overflow-y-auto pr-1">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-16 text-xs text-muted-foreground">
                No products found matching your search.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredProducts.map((prod) => {
                  const stock = stockMap[prod.product_id] ?? 0;
                  const isLow = stock <= Number(prod.minimum_stock || 0);

                  return (
                    <div
                      key={prod.product_id}
                      onClick={() => handleAddToCart(prod.product_id)}
                      className="p-3 bg-card border border-border rounded-xl hover:border-primary/60 hover:shadow-md cursor-pointer transition flex flex-col justify-between group select-none"
                    >
                      <div>
                        <div className="text-xs font-bold text-foreground group-hover:text-primary transition truncate">
                          {prod.name}
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-0.5 flex items-center justify-between font-mono">
                          <span>{prod.sku || 'No SKU'}</span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                              isLow ? 'bg-amber-500/20 text-amber-500' : 'bg-emerald-500/20 text-emerald-500'
                            }`}
                          >
                            {stock} left
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 mt-2 border-t border-border/60">
                        <span className="text-xs font-extrabold text-foreground font-mono">
                          {formatCurrency(prod.selling_price, currency, currencySymbol)}
                        </span>
                        <span className="text-[11px] font-bold text-primary group-hover:underline flex items-center gap-0.5">
                          <Plus className="h-3 w-3" />
                          <span>Add</span>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right: Cart & Billing (6 cols) */}
        <div className="lg:col-span-6 flex flex-col overflow-hidden p-6 space-y-4">
          {/* Customer & Payment method */}
          <div className="grid grid-cols-2 gap-3 shrink-0">
            <div>
              <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                Select Customer
              </label>
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-muted/40 border border-border rounded-xl text-foreground focus:outline-none focus:border-primary"
              >
                <option value="walk_in">👤 Walk-in Retail Customer</option>
                {customerRows.map((c) => (
                  <option key={c.customer_id} value={c.customer_id}>
                    {c.name} {c.phone ? `(${c.phone})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                Payment Mode
              </label>
              <select
                value={selectedPaymentMethod}
                onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-muted/40 border border-border rounded-xl text-foreground focus:outline-none focus:border-primary"
              >
                <option value="Cash">💵 Cash</option>
                <option value="UPI">📱 UPI / QR</option>
                <option value="Credit Card">💳 Credit Card</option>
                <option value="Debit Card">💳 Debit Card</option>
                <option value="Net Banking">🏦 Net Banking</option>
                <option value="Credit / Pay Later">⏳ Credit / Pay Later</option>
              </select>
            </div>
          </div>

          {/* Cart items list */}
          <div className="flex-1 overflow-y-auto border border-border rounded-2xl p-3 space-y-2.5 bg-card">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-muted-foreground text-xs space-y-2">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                  <ShoppingCart className="h-6 w-6 text-muted-foreground/50" />
                </div>
                <div className="font-semibold text-foreground">Cart is currently empty</div>
                <div className="text-[11px]">Click products on the left catalog to add them to this order.</div>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.productId}
                  className="p-3 bg-muted/30 border border-border/70 rounded-xl text-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-foreground">{item.name}</div>
                      <div className="text-[10px] text-muted-foreground font-mono">
                        SKU: {item.sku || '-'} | GST: {item.gstRate}%
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveItem(item.productId)}
                      className="text-muted-foreground hover:text-destructive p-1 rounded transition"
                      title="Remove item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Quantity, Unit Price, Discount */}
                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/40">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-muted-foreground">Qty:</span>
                      <button
                        onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                        className="h-6 w-6 rounded bg-muted hover:bg-muted/80 flex items-center justify-center font-bold"
                      >
                        -
                      </button>
                      <span className="w-7 text-center font-bold text-foreground">{item.quantity}</span>
                      <button
                        onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                        className="h-6 w-6 rounded bg-muted hover:bg-muted/80 flex items-center justify-center font-bold"
                      >
                        +
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <div>
                        <label className="text-[9px] text-muted-foreground block">Price</label>
                        <input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) => handleUpdatePrice(item.productId, Number(e.target.value))}
                          className="w-16 px-1.5 py-0.5 text-right font-mono text-xs bg-background border border-border rounded"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] text-muted-foreground block">Disc</label>
                        <input
                          type="number"
                          value={item.discount}
                          onChange={(e) => handleUpdateDiscount(item.productId, Number(e.target.value))}
                          className="w-14 px-1.5 py-0.5 text-right font-mono text-xs bg-background border border-border rounded text-emerald-500"
                        />
                      </div>
                      <div className="text-right w-20">
                        <label className="text-[9px] text-muted-foreground block">Total</label>
                        <div className="font-bold text-foreground font-mono">
                          {formatCurrency(
                            (item.unitPrice * item.quantity - item.discount) * (1 + item.gstRate / 100),
                            currency,
                            currencySymbol
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Notes input */}
          <div className="shrink-0">
            <input
              type="text"
              placeholder="Order notes or instructions..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-muted/30 border border-border rounded-xl text-foreground focus:outline-none focus:border-primary"
            />
          </div>

          {/* Summary Box */}
          <div className="bg-card border border-border rounded-2xl p-4 space-y-2 text-xs shrink-0 shadow-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span className="font-mono">{formatCurrency(calculations.subtotal, currency, currencySymbol)}</span>
            </div>
            {calculations.totalDiscount > 0 && (
              <div className="flex justify-between text-emerald-500 font-medium">
                <span>Discount</span>
                <span className="font-mono">-{formatCurrency(calculations.totalDiscount, currency, currencySymbol)}</span>
              </div>
            )}
            <div className="flex justify-between text-muted-foreground">
              <span>Calculated Tax (GST)</span>
              <span className="font-mono">+{formatCurrency(calculations.totalTax, currency, currencySymbol)}</span>
            </div>
            <div className="border-t border-border pt-2 flex justify-between text-base font-extrabold text-foreground">
              <span>Grand Total</span>
              <span className="text-primary font-mono text-lg">
                {formatCurrency(calculations.grandTotal, currency, currencySymbol)}
              </span>
            </div>
          </div>

          {/* Complete sale action */}
          <div className="flex items-center justify-end gap-3 shrink-0">
            <button
              onClick={() => setCart([])}
              disabled={cart.length === 0}
              className="flex items-center gap-1 px-4 py-2.5 text-xs text-muted-foreground hover:text-foreground rounded-xl transition"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Clear</span>
            </button>
            <button
              onClick={handleCompleteSale}
              disabled={submitting || cart.length === 0}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-6 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition disabled:opacity-50"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Complete Sale ({formatCurrency(calculations.grandTotal, currency, currencySymbol)})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
