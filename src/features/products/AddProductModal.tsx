import React, { useState, useMemo } from 'react';
import { useWorkbookStore } from '../../stores/workbookStore';
import { useUIStore } from '../../stores/uiStore';
import { X, PlusCircle, Package } from 'lucide-react';
import { getBusinessTerminology } from '../../lib/businessTerminology';
import { getBusinessFlowType } from '../../types';

export const AddProductModal: React.FC = () => {
  const { activeModal, closeModal, addNotification } = useUIStore();
  const { sheets, addRow, saveWorkbook, appConfig } = useWorkbookStore();

  const currentFlow = getBusinessFlowType(appConfig?.businessType);
  const businessMeta = useMemo(() => {
    return getBusinessTerminology(currentFlow, '_Products');
  }, [currentFlow]);

  const isOpen = activeModal === 'add_product';
  const categoryRows = sheets['_Categories']?.rows || [];

  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [purchasePrice, setPurchasePrice] = useState<number>(0);
  const [sellingPrice, setSellingPrice] = useState<number>(0);
  const [gstRate, setGstRate] = useState<number>(appConfig?.defaultTaxRate || 18);
  const [unit, setUnit] = useState('pcs');
  const [initialStock, setInitialStock] = useState<number>(10);
  const [minimumStock, setMinimumStock] = useState<number>(5);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      addNotification('warning', 'Validation Error', 'Product name is required');
      return;
    }

    try {
      const productId = `prod_${Date.now()}`;
      const nowIso = new Date().toISOString();

      // 1. Add Product
      addRow('_Products', {
        product_id: productId,
        sku: sku || `SKU-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
        name,
        category_id: categoryId || (categoryRows[0]?.category_id ?? ''),
        purchase_price: purchasePrice,
        selling_price: sellingPrice,
        gst_rate: gstRate,
        unit,
        minimum_stock: minimumStock,
        status: 'active',
        created_at: nowIso,
        updated_at: nowIso,
      });

      // 2. Add Initial Inventory
      addRow('_Inventory', {
        inventory_id: `inv_${Date.now()}`,
        product_id: productId,
        quantity: initialStock,
        minimum_stock: minimumStock,
        updated_at: nowIso,
      });

      // 3. Record Initial Stock Movement
      if (initialStock > 0) {
        addRow('_StockMovements', {
          movement_id: `mov_${Date.now()}`,
          product_id: productId,
          type: 'IN',
          quantity: initialStock,
          reference_id: 'INITIAL_STOCK',
          notes: 'Initial opening balance',
          created_at: nowIso,
        });
      }

      await saveWorkbook();
      addNotification('success', 'Product Added', `Created product: ${name}`);
      closeModal();
    } catch (err: any) {
      addNotification('error', 'Error', err.message || 'Failed to add product');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4 select-none animate-in fade-in">
      <div className="bg-card border border-border rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            <h3 className="text-base font-bold text-foreground">{businessMeta.addRecordTitle}</h3>
          </div>
          <button onClick={closeModal} className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-semibold text-foreground mb-1">
              {businessMeta.columnDisplayNames.name || 'Product / Item Name'} *
            </label>
            <input
              required
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={`Enter ${businessMeta.sheetDisplayName.toLowerCase()} name...`}
              className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none focus:border-primary font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-foreground mb-1">
                {businessMeta.columnDisplayNames.sku || 'Code / Plate #'}
              </label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="e.g. Code, Model, Plate #"
                className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none focus:border-primary font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-foreground mb-1">Category / Group</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none focus:border-primary"
              >
                <option value="">Standard Category</option>
                {categoryRows.map((cat) => (
                  <option key={cat.category_id} value={cat.category_id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-foreground mb-1">
                {businessMeta.columnDisplayNames.purchase_price || 'Cost / Base Payout'}
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(Number(e.target.value))}
                className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none focus:border-primary font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-foreground mb-1">
                {businessMeta.columnDisplayNames.selling_price || 'Rate / Price'} *
              </label>
              <input
                required
                type="number"
                min="0"
                step="any"
                value={sellingPrice}
                onChange={(e) => setSellingPrice(Number(e.target.value))}
                className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none focus:border-primary font-bold font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3">
            <div>
              <label className="block font-medium text-foreground mb-1">Unit</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none focus:border-primary"
              >
                <option value="pcs">pcs</option>
                <option value="box">box</option>
                <option value="kg">kg</option>
                <option value="meter">meter</option>
                <option value="pack">pack</option>
              </select>
            </div>
            <div>
              <label className="block font-medium text-foreground mb-1">GST Rate (%)</label>
              <input
                type="number"
                value={gstRate}
                onChange={(e) => setGstRate(Number(e.target.value))}
                className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block font-medium text-foreground mb-1">Initial Stock</label>
              <input
                type="number"
                min="0"
                value={initialStock}
                onChange={(e) => setInitialStock(Number(e.target.value))}
                className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block font-medium text-foreground mb-1">Min. Alert</label>
              <input
                type="number"
                min="0"
                value={minimumStock}
                onChange={(e) => setMinimumStock(Number(e.target.value))}
                className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none focus:border-primary"
              />
            </div>
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
              className="flex items-center gap-1.5 px-4 py-1.5 bg-primary text-primary-foreground font-semibold rounded-lg shadow-sm hover:bg-primary/90 transition"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Save Product</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
