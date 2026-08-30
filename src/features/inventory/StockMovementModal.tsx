import React, { useState } from 'react';
import { useWorkbookStore } from '../../stores/workbookStore';
import { useUIStore } from '../../stores/uiStore';
import { X, Boxes, ArrowDownLeft, ArrowUpRight, SlidersHorizontal } from 'lucide-react';

export const StockMovementModal: React.FC = () => {
  const { activeModal, closeModal, addNotification } = useUIStore();
  const { sheets, addRow, updateRow, saveWorkbook } = useWorkbookStore();

  const isOpen = activeModal === 'stock_movement';
  const productRows = sheets['_Products']?.rows || [];
  const inventoryRows = sheets['_Inventory']?.rows || [];

  const [productId, setProductId] = useState(productRows[0]?.product_id || '');
  const [movementType, setMovementType] = useState<'IN' | 'OUT' | 'ADJUSTMENT'>('IN');
  const [quantity, setQuantity] = useState<number>(1);
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const currentInv = inventoryRows.find((i) => i.product_id === productId);
  const currentQty = Number(currentInv?.quantity || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId) {
      addNotification('warning', 'Validation Error', 'Please select a product');
      return;
    }
    if (quantity <= 0 && movementType !== 'ADJUSTMENT') {
      addNotification('warning', 'Validation Error', 'Quantity must be positive');
      return;
    }

    try {
      const nowIso = new Date().toISOString();
      let newQty = currentQty;
      let delta = quantity;

      if (movementType === 'IN') {
        newQty += quantity;
        delta = quantity;
      } else if (movementType === 'OUT') {
        if (quantity > currentQty) {
          addNotification('warning', 'Low Stock', 'Quantity exceeds current stock');
        }
        newQty = Math.max(0, currentQty - quantity);
        delta = -quantity;
      } else {
        // Adjustment: direct new quantity
        delta = quantity - currentQty;
        newQty = quantity;
      }

      // Update or create inventory row
      if (currentInv) {
        updateRow('_Inventory', 'inventory_id', currentInv.inventory_id, {
          quantity: newQty,
          updated_at: nowIso,
        });
      } else {
        addRow('_Inventory', {
          inventory_id: `inv_${Date.now()}`,
          product_id: productId,
          quantity: newQty,
          minimum_stock: 5,
          updated_at: nowIso,
        });
      }

      // Record in _StockMovements
      addRow('_StockMovements', {
        movement_id: `mov_${Date.now()}`,
        product_id: productId,
        type: movementType,
        quantity: delta,
        reference_id: 'MANUAL_ADJUSTMENT',
        notes: notes || `Manual stock ${movementType.toLowerCase()}`,
        created_at: nowIso,
      });

      await saveWorkbook();
      addNotification('success', 'Inventory Updated', `Stock updated to ${newQty} units`);
      closeModal();
    } catch (err: any) {
      addNotification('error', 'Error', err.message || 'Failed to update stock');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4 select-none animate-in fade-in">
      <div className="bg-card border border-border rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <Boxes className="h-5 w-5 text-indigo-500" />
            <h3 className="text-base font-bold text-foreground">Stock Movement & Adjustment</h3>
          </div>
          <button onClick={closeModal} className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-foreground mb-1">Select Product</label>
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none focus:border-primary"
            >
              {productRows.map((p) => (
                <option key={p.product_id} value={p.product_id}>
                  {p.name} (SKU: {p.sku || '-'})
                </option>
              ))}
            </select>
          </div>

          <div className="p-3 bg-muted/40 border border-border rounded-xl flex items-center justify-between">
            <span className="text-muted-foreground">Current Stock:</span>
            <span className="text-sm font-bold text-foreground">{currentQty} units</span>
          </div>

          <div>
            <label className="block font-medium text-foreground mb-1">Movement Type</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setMovementType('IN')}
                className={`py-2 px-3 rounded-lg border text-center font-semibold transition flex items-center justify-center gap-1 ${
                  movementType === 'IN'
                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500'
                    : 'border-border text-muted-foreground hover:bg-muted'
                }`}
              >
                <ArrowDownLeft className="h-3.5 w-3.5" />
                <span>Stock In</span>
              </button>

              <button
                type="button"
                onClick={() => setMovementType('OUT')}
                className={`py-2 px-3 rounded-lg border text-center font-semibold transition flex items-center justify-center gap-1 ${
                  movementType === 'OUT'
                    ? 'bg-rose-500/10 border-rose-500 text-rose-500'
                    : 'border-border text-muted-foreground hover:bg-muted'
                }`}
              >
                <ArrowUpRight className="h-3.5 w-3.5" />
                <span>Stock Out</span>
              </button>

              <button
                type="button"
                onClick={() => setMovementType('ADJUSTMENT')}
                className={`py-2 px-3 rounded-lg border text-center font-semibold transition flex items-center justify-center gap-1 ${
                  movementType === 'ADJUSTMENT'
                    ? 'bg-primary/10 border-primary text-primary'
                    : 'border-border text-muted-foreground hover:bg-muted'
                }`}
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                <span>Adjust</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block font-medium text-foreground mb-1">
              {movementType === 'ADJUSTMENT' ? 'New Exact Quantity' : 'Quantity to Add/Remove'}
            </label>
            <input
              type="number"
              min="0"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block font-medium text-foreground mb-1">Notes / Reason</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Received new shipment, Damaged goods, Audit count"
              className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none focus:border-primary"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <button
              type="button"
              onClick={closeModal}
              className="px-3 py-1.5 text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-primary text-primary-foreground font-semibold rounded-lg shadow-sm hover:bg-primary/90 transition"
            >
              Apply Stock Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
