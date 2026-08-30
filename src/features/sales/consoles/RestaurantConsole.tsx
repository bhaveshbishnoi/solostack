import React, { useState, useMemo } from 'react';
import { useWorkbookStore } from '../../../stores/workbookStore';
import { formatCurrency } from '../../../lib/utils';
import {
  Utensils,
  Plus,
  Trash2,
  CheckCircle2,
  Coffee,
  Receipt,
  Search
} from 'lucide-react';

interface RestaurantConsoleProps {
  appConfig: any;
  currency: string;
  currencySymbol: string;
  submitting: boolean;
  onComplete: (data: any) => Promise<void>;
}

interface OrderItem {
  dishId: string;
  name: string;
  category: string;
  price: number;
  qty: number;
}

export const RestaurantConsole: React.FC<RestaurantConsoleProps> = ({
  appConfig,
  currency,
  currencySymbol,
  submitting,
  onComplete,
}) => {
  const { sheets } = useWorkbookStore();

  const productRows = sheets['_Products']?.rows || [];

  const [tableNumber, setTableNumber] = useState('Table #04 (AC Hall)');
  const [guestName, setGuestName] = useState('Dine-in Guest');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('UPI / QR');
  const [dietaryNotes, setDietaryNotes] = useState('');

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = new Set<string>();
    productRows.forEach((p) => {
      if (p.category_id) cats.add(p.category_id);
    });
    return Array.from(cats);
  }, [productRows]);

  const filteredDishes = useMemo(() => {
    return productRows.filter((p) => {
      const matchCat = selectedCategory === 'all' || p.category_id === selectedCategory;
      const matchSearch =
        !searchQuery.trim() ||
        p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [productRows, selectedCategory, searchQuery]);

  const handleAddDish = (dish: any) => {
    setOrderItems((prev) => {
      const existing = prev.find((item) => item.dishId === dish.product_id);
      if (existing) {
        return prev.map((item) =>
          item.dishId === dish.product_id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [
        ...prev,
        {
          dishId: dish.product_id,
          name: dish.name,
          category: dish.category_id || 'Dishes',
          price: Number(dish.selling_price || 0),
          qty: 1,
        },
      ];
    });
  };

  const handleUpdateQty = (dishId: string, delta: number) => {
    setOrderItems((prev) =>
      prev
        .map((item) => (item.dishId === dishId ? { ...item, qty: item.qty + delta } : item))
        .filter((item) => item.qty > 0)
    );
  };

  const subtotal = useMemo(() => {
    return orderItems.reduce((acc, item) => acc + item.price * item.qty, 0);
  }, [orderItems]);

  const discountAmount = useMemo(() => {
    return (subtotal * discountPercent) / 100;
  }, [subtotal, discountPercent]);

  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxAmount = (taxableAmount * 5) / 100; // 5% restaurant GST
  const grandTotal = Math.round(taxableAmount + taxAmount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (orderItems.length === 0) return;

    await onComplete({
      customerName: `${guestName} (${tableNumber})`,
      passengerPhone: '',
      pickupLocation: tableNumber,
      subtotal,
      tax: taxAmount,
      total: grandTotal,
      paymentMethod,
      orderItems,
      dietaryNotes,
    });
  };

  return (
    <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden bg-background">
      {/* Left: Menu Dish Catalog (7 cols) */}
      <div className="lg:col-span-7 border-r border-border flex flex-col overflow-hidden p-6 space-y-4">
        {/* Header & Search */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <Utensils className="h-5 w-5 text-amber-500" />
              <span>Restaurant Menu & KOT Orders</span>
            </h2>
            <p className="text-xs text-muted-foreground">{appConfig?.businessName || 'Restaurant'} • Select dishes to add to table ticket</p>
          </div>

          <div className="relative w-64">
            <Search className="h-3.5 w-3.5 absolute left-3 top-2.5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dishes or drinks..."
              className="w-full pl-9 pr-3 py-1.5 bg-muted/40 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 shrink-0">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold transition shrink-0 ${
              selectedCategory === 'all'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'bg-muted/50 text-muted-foreground hover:text-foreground'
            }`}
          >
            All Dishes ({productRows.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition shrink-0 ${
                selectedCategory === cat
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'bg-muted/50 text-muted-foreground hover:text-foreground'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Dish Cards Grid */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-3 pr-1">
          {filteredDishes.map((dish) => (
            <div
              key={dish.product_id}
              onClick={() => handleAddDish(dish)}
              className="bg-card border border-border hover:border-primary/50 hover:bg-muted/20 rounded-2xl p-4 cursor-pointer transition shadow-xs flex flex-col justify-between group"
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
                    {dish.sku || 'DISH'}
                  </span>
                  <span className="text-[11px] text-amber-500 font-semibold">{dish.category_id}</span>
                </div>
                <div className="text-sm font-bold text-foreground group-hover:text-primary transition line-clamp-2">
                  {dish.name}
                </div>
                <div className="text-[11px] text-muted-foreground">Unit: {dish.unit || 'portion'}</div>
              </div>

              <div className="flex items-center justify-between pt-3 mt-2 border-t border-border/50">
                <div className="text-sm font-extrabold text-foreground font-mono">
                  {formatCurrency(dish.selling_price || 0, currency, currencySymbol)}
                </div>
                <button
                  type="button"
                  className="p-1.5 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right: Table KOT Ticket & Billing (5 cols) */}
      <div className="lg:col-span-5 flex flex-col overflow-hidden bg-muted/15 p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2 font-bold text-sm text-foreground">
            <Receipt className="h-4 w-4 text-primary" />
            <span>Active KOT Ticket</span>
          </div>
          <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-500 font-bold">
            5% Food GST
          </span>
        </div>

        {/* Table & Guest Selection */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block font-semibold text-foreground mb-1">Table / Area #</label>
            <input
              type="text"
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              placeholder="e.g. Table #04 (AC)"
              className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground font-medium focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="block font-semibold text-foreground mb-1">Guest / Contact</label>
            <input
              type="text"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="Guest Name"
              className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground font-medium focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        {/* Items List in Ticket */}
        <div className="flex-1 overflow-y-auto space-y-2 border border-border rounded-2xl p-3 bg-background/50">
          {orderItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-muted-foreground space-y-2">
              <Coffee className="h-8 w-8 text-muted-foreground/40" />
              <div className="text-xs">No dishes added to ticket yet. Click any item on the left to add.</div>
            </div>
          ) : (
            orderItems.map((item) => (
              <div
                key={item.dishId}
                className="flex items-center justify-between p-2.5 rounded-xl bg-card border border-border/80 text-xs"
              >
                <div className="flex-1 pr-2">
                  <div className="font-bold text-foreground">{item.name}</div>
                  <div className="text-[10px] text-muted-foreground font-mono">
                    {formatCurrency(item.price, currency, currencySymbol)} × {item.qty} ={' '}
                    {formatCurrency(item.price * item.qty, currency, currencySymbol)}
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleUpdateQty(item.dishId, -1)}
                    className="h-6 w-6 rounded-lg bg-muted flex items-center justify-center text-foreground hover:bg-muted/80 font-bold"
                  >
                    -
                  </button>
                  <span className="font-mono font-bold w-5 text-center">{item.qty}</span>
                  <button
                    type="button"
                    onClick={() => handleUpdateQty(item.dishId, 1)}
                    className="h-6 w-6 rounded-lg bg-muted flex items-center justify-center text-foreground hover:bg-muted/80 font-bold"
                  >
                    +
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateQty(item.dishId, -item.qty)}
                    className="p-1 text-muted-foreground hover:text-destructive ml-1"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Bill Summary */}
        <div className="bg-card border border-border rounded-2xl p-4 space-y-2 text-xs">
          <div className="flex justify-between text-muted-foreground">
            <span>Food Subtotal</span>
            <span className="font-mono font-bold text-foreground">
              {formatCurrency(subtotal, currency, currencySymbol)}
            </span>
          </div>

          <div className="flex items-center justify-between text-muted-foreground">
            <span>Concession / Discount (%)</span>
            <input
              type="number"
              min="0"
              max="100"
              value={discountPercent}
              onChange={(e) => setDiscountPercent(Math.max(0, Number(e.target.value)))}
              className="w-16 px-2 py-0.5 bg-muted/40 border border-border rounded text-right font-mono text-foreground"
            />
          </div>

          <div className="flex justify-between text-muted-foreground">
            <span>Restaurant GST (5%)</span>
            <span className="font-mono font-bold text-foreground">
              {formatCurrency(taxAmount, currency, currencySymbol)}
            </span>
          </div>

          <div className="flex justify-between text-sm font-extrabold text-foreground pt-2 border-t border-border">
            <span>Total Payable</span>
            <span className="font-mono text-primary text-base">
              {formatCurrency(grandTotal, currency, currencySymbol)}
            </span>
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-muted-foreground mb-1">Kitchen / Dietary Notes</label>
          <input
            type="text"
            value={dietaryNotes}
            onChange={(e) => setDietaryNotes(e.target.value)}
            placeholder="e.g. Less spicy, Jain preparation..."
            className="w-full px-3 py-1.5 bg-muted/40 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:border-primary"
          />
        </div>

        {/* Settlement Mode & Checkout */}
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2 text-xs">
            {['UPI / QR', 'Cash', 'Credit Card'].map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setPaymentMethod(mode)}
                className={`py-2 px-1 rounded-xl border text-center font-bold text-[11px] transition ${
                  paymentMethod === mode
                    ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                    : 'bg-card border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || orderItems.length === 0}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs shadow-md teal-glow transition disabled:opacity-50 cursor-pointer"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>Settle & Print Food Bill ({formatCurrency(grandTotal, currency, currencySymbol)})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
