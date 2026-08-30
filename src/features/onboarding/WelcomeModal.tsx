import React, { useState } from 'react';
import { useWorkbookStore } from '../../stores/workbookStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { useUIStore } from '../../stores/uiStore';
import { AppConfig } from '../../types';
import {
  FileSpreadsheet,
  PlusCircle,
  FolderOpen,
  Sparkles,
  Loader2,
  CheckCircle2
} from 'lucide-react';

export const WelcomeModal: React.FC = () => {
  const { activeModal, closeModal, addNotification } = useUIStore();
  const { createWorkbook, openWorkbook, metadata } = useWorkbookStore();

  const [mode, setMode] = useState<'welcome' | 'create' | 'open'>('welcome');
  const [loading, setLoading] = useState(false);

  // New workbook form state
  const [businessName, setBusinessName] = useState('Apex Retail & Electronics');
  const [businessType, setBusinessType] = useState('Retail Store');
  const [country, setCountry] = useState('India');
  const [currency, setCurrency] = useState('INR');
  const [currencySymbol, setCurrencySymbol] = useState('₹');
  const [taxPreference, setTaxPreference] = useState<'inclusive' | 'exclusive'>('exclusive');
  const [defaultTaxRate, setDefaultTaxRate] = useState(18);

  const isOpen = activeModal === 'welcome' || (!metadata && activeModal === null);
  if (!isOpen) return null;

  const handleCurrencyChange = (curr: string) => {
    setCurrency(curr);
    const symbols: Record<string, string> = {
      INR: '₹',
      USD: '$',
      EUR: '€',
      GBP: '£',
      AUD: 'A$',
      CAD: 'C$',
    };
    setCurrencySymbol(symbols[curr] || '$');
  };

  const handleCreateNew = async () => {
    setLoading(true);
    try {
      const sanitized = businessName.replace(/[^a-zA-Z0-9_-]/g, '_');
      const filePath = `/workbooks/${sanitized || 'Business'}.xlsx`;

      const config: AppConfig = {
        businessName,
        businessType,
        country,
        currency,
        currencySymbol,
        taxPreference,
        defaultTaxRate,
        dateFormat: 'YYYY-MM-DD',
        timezone: 'UTC',
        schemaVersion: '1.0.0',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await createWorkbook(filePath, config);
      addNotification('success', 'Workbook Created', `Active workbook: ${sanitized}.xlsx`);
      closeModal();
    } catch (err: any) {
      addNotification('error', 'Creation Failed', err.message || 'Could not create workbook');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDemo = async () => {
    setLoading(true);
    try {
      const config: AppConfig = {
        businessName: 'Apex Retail & Electronics',
        businessType: 'Retail & Hardware',
        country: 'India',
        currency: 'INR',
        currencySymbol: '₹',
        taxPreference: 'exclusive',
        defaultTaxRate: 18,
        dateFormat: 'YYYY-MM-DD',
        timezone: 'UTC',
        schemaVersion: '1.0.0',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const filePath = '/workbooks/Apex_Retail_Demo.xlsx';
      await createWorkbook(filePath, config);

      // Populate demo business records
      const { addRow } = useWorkbookStore.getState();

      // 1. Categories
      const categories = [
        { category_id: 'cat_1', name: 'Smartphones & Audio', description: 'Phones, earbuds, headphones', status: 'active', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { category_id: 'cat_2', name: 'Computer Accessories', description: 'Keyboards, cables, monitors', status: 'active', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { category_id: 'cat_3', name: 'Home Appliances', description: 'Smart bulbs, plugs, vacuum', status: 'active', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      ];
      categories.forEach((c) => addRow('_Categories', c));

      // 2. Products
      const products = [
        { product_id: 'prod_1', sku: 'AUDIO-WH1000', name: 'Sony Wireless ANC Headphones', category_id: 'cat_1', purchase_price: 18000, selling_price: 24999, gst_rate: 18, unit: 'pcs', minimum_stock: 5, status: 'active', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { product_id: 'prod_2', sku: 'KB-MECH-RGB', name: 'Mechanical Gaming Keyboard Pro', category_id: 'cat_2', purchase_price: 3200, selling_price: 4999, gst_rate: 18, unit: 'pcs', minimum_stock: 8, status: 'active', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { product_id: 'prod_3', sku: 'DISP-4K27', name: 'UltraHD 27-inch IPS Monitor', category_id: 'cat_2', purchase_price: 15500, selling_price: 21999, gst_rate: 18, unit: 'pcs', minimum_stock: 4, status: 'active', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { product_id: 'prod_4', sku: 'EAR-PRO2', name: 'Noise Cancelling Earbuds Gen 2', category_id: 'cat_1', purchase_price: 6500, selling_price: 9999, gst_rate: 18, unit: 'pcs', minimum_stock: 10, status: 'active', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { product_id: 'prod_5', sku: 'HOME-WIFI-PLUG', name: 'Smart Wi-Fi Power Plug 16A', category_id: 'cat_3', purchase_price: 600, selling_price: 1199, gst_rate: 18, unit: 'pcs', minimum_stock: 15, status: 'active', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { product_id: 'prod_6', sku: 'CABLE-TB4-2M', name: 'Thunderbolt 4 High-Speed Cable', category_id: 'cat_2', purchase_price: 1200, selling_price: 2499, gst_rate: 18, unit: 'pcs', minimum_stock: 3, status: 'active', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      ];
      products.forEach((p) => addRow('_Products', p));

      // 3. Inventory
      const inventory = [
        { inventory_id: 'inv_1', product_id: 'prod_1', quantity: 18, minimum_stock: 5, updated_at: new Date().toISOString() },
        { inventory_id: 'inv_2', product_id: 'prod_2', quantity: 24, minimum_stock: 8, updated_at: new Date().toISOString() },
        { inventory_id: 'inv_3', product_id: 'prod_3', quantity: 3, minimum_stock: 4, updated_at: new Date().toISOString() }, // LOW STOCK!
        { inventory_id: 'inv_4', product_id: 'prod_4', quantity: 35, minimum_stock: 10, updated_at: new Date().toISOString() },
        { inventory_id: 'inv_5', product_id: 'prod_5', quantity: 50, minimum_stock: 15, updated_at: new Date().toISOString() },
        { inventory_id: 'inv_6', product_id: 'prod_6', quantity: 2, minimum_stock: 3, updated_at: new Date().toISOString() }, // LOW STOCK!
      ];
      inventory.forEach((i) => addRow('_Inventory', i));

      // 4. Customers
      const customers = [
        { customer_id: 'cust_1', name: 'Rohan Sharma', phone: '+91 98201 11223', email: 'rohan@example.com', address: 'Bandra West, Mumbai', gstin: '27AABCS1234F1Z1', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { customer_id: 'cust_2', name: 'Priya Patel', phone: '+91 97112 33445', email: 'priya@techcorp.in', address: 'Koramangala, Bengaluru', gstin: '29AABCP5678K1Z3', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { customer_id: 'cust_3', name: 'Amit Verma', phone: '+91 98450 99887', email: 'amit.verma@gmail.com', address: 'Connaught Place, New Delhi', gstin: '', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      ];
      customers.forEach((c) => addRow('_Customers', c));

      // 5. Suppliers
      const suppliers = [
        { supplier_id: 'supp_1', name: 'Zenith Tech Distributors Ltd', phone: '+91 22 2456 7890', email: 'sales@zenithtech.in', address: 'Lamington Road, Mumbai', gstin: '27AABCZ9999P1Z8', notes: 'Lead distributor for audio & accessories', created_at: new Date().toISOString() },
        { supplier_id: 'supp_2', name: 'Optima Displays & Peripherals', phone: '+91 80 4123 4567', email: 'orders@optimadisplays.com', address: 'SP Road, Bengaluru', gstin: '29AABCO8888D1Z2', notes: 'Direct importer of IPS monitors', created_at: new Date().toISOString() },
      ];
      suppliers.forEach((s) => addRow('_Suppliers', s));

      // 6. Past Sales
      const sales = [
        { sale_id: 'sale_101', customer_id: 'cust_1', sale_date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0], subtotal: 24999, discount: 500, tax: 4409.82, total: 28908.82, payment_method: 'UPI', status: 'completed', created_at: new Date().toISOString() },
        { sale_id: 'sale_102', customer_id: 'cust_2', sale_date: new Date(Date.now() - 86400000 * 1).toISOString().split('T')[0], subtotal: 26998, discount: 1000, tax: 4679.64, total: 30677.64, payment_method: 'Credit Card', status: 'completed', created_at: new Date().toISOString() },
        { sale_id: 'sale_103', customer_id: 'cust_3', sale_date: new Date().toISOString().split('T')[0], subtotal: 9999, discount: 0, tax: 1799.82, total: 11798.82, payment_method: 'Cash', status: 'completed', created_at: new Date().toISOString() },
      ];
      sales.forEach((s) => addRow('_Sales', s));

      // 7. Expenses
      const expenses = [
        { expense_id: 'exp_1', date: new Date(Date.now() - 86400000 * 5).toISOString().split('T')[0], category: 'Store Rent', description: 'Monthly showroom retail lease', amount: 35000, gst: 6300, payment_method: 'Bank Transfer', notes: 'Paid on 1st of month' },
        { expense_id: 'exp_2', date: new Date(Date.now() - 86400000 * 3).toISOString().split('T')[0], category: 'Electricity & Utilities', description: 'Commercial high-load power bill', amount: 4800, gst: 0, payment_method: 'UPI', notes: 'Monthly utility' },
        { expense_id: 'exp_3', date: new Date(Date.now() - 86400000 * 1).toISOString().split('T')[0], category: 'Packaging & Bags', description: 'Branded shopping bags and bubble wrap', amount: 2500, gst: 450, payment_method: 'Cash', notes: 'Restocked packing materials' },
      ];
      expenses.forEach((e) => addRow('_Expenses', e));

      // Persist demo changes to Excel
      await useWorkbookStore.getState().saveWorkbook();
      useWorkbookStore.getState().setActiveSheet('dashboard');

      // Populate business profile in settings
      useSettingsStore.getState().updateBusinessProfile({
        address: '104 Galaxy Commercial Mall, Linking Road, Mumbai 400050',
        phone: '+91 98200 98200',
        email: 'billing@apexretail.in',
        gstin: '27AABCA1234F1Z5',
      });

      addNotification('success', 'Demo Business Loaded', 'Apex Retail demo workbook ready with sample data');
      closeModal();
    } catch (err: any) {
      addNotification('error', 'Demo Creation Failed', err.message || 'Could not load demo');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      await openWorkbook(file);
      addNotification('success', 'Workbook Loaded', `Opened ${file.name}`);
      closeModal();
    } catch (err: any) {
      addNotification('error', 'Open Failed', err.message || 'Could not open workbook');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4 select-none animate-in fade-in">
      <div className="bg-card border border-border rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden p-8 space-y-6">
        {mode === 'welcome' && (
          <div className="space-y-6 text-center">
            <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-to-tr from-teal-500 via-teal-600 to-emerald-600 flex items-center justify-center text-white shadow-xl teal-glow">
              <FileSpreadsheet className="h-8 w-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight text-foreground">
                Run your business from one Excel workbook
              </h2>
              <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
                Exdrow is a local-first business operating system. No cloud account, no subscription,
                and no hosted database. Your workbook remains 100% standard Excel.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setMode('create')}
                className="flex flex-col items-center p-5 rounded-xl border border-border bg-muted/40 hover:bg-muted/80 hover:border-primary/50 transition text-left group"
              >
                <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-3 group-hover:scale-110 transition">
                  <PlusCircle className="h-5 w-5" />
                </div>
                <div className="text-sm font-semibold text-foreground">Create New Workbook</div>
                <div className="text-[11px] text-muted-foreground mt-1 text-center">
                  Start fresh with default products, inventory, sales, and GST sheets.
                </div>
              </button>

              <label className="flex flex-col items-center p-5 rounded-xl border border-border bg-muted/40 hover:bg-muted/80 hover:border-primary/50 transition cursor-pointer group">
                <input
                  type="file"
                  accept=".xlsx"
                  onChange={handleOpenFile}
                  className="hidden"
                />
                <div className="h-10 w-10 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-3 group-hover:scale-110 transition">
                  <FolderOpen className="h-5 w-5" />
                </div>
                <div className="text-sm font-semibold text-foreground">Open Existing .xlsx</div>
                <div className="text-[11px] text-muted-foreground mt-1 text-center">
                  Pick an existing Excel file from your computer.
                </div>
              </label>
            </div>

            {/* Quick Demo Option */}
            <div className="pt-2 border-t border-border">
              <button
                onClick={handleCreateDemo}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-primary/10 to-teal-500/10 hover:from-primary/20 hover:to-teal-500/20 border border-primary/30 text-primary text-xs font-bold transition teal-glow-sm"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4 text-primary" />
                )}
                <span>Launch Quick Demo (Pre-loaded with sample store data)</span>
              </button>
            </div>
          </div>
        )}

        {mode === 'create' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <h3 className="text-lg font-bold text-foreground">Configure New Business</h3>
                <p className="text-xs text-muted-foreground">Setup your business preferences</p>
              </div>
              <button
                onClick={() => setMode('welcome')}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Back
              </button>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">
                  Business Name
                </label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none focus:border-primary"
                  placeholder="e.g. Apex Hardware Store"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">
                    Business Type
                  </label>
                  <select
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none focus:border-primary font-medium"
                  >
                    <option value="Retail Store">Retail Store & Supermarket (POS)</option>
                    <option value="Wholesale & Distribution">Wholesale & B2B Distribution (Credit & Dispatch)</option>
                    <option value="Pharmacy">Pharmacy & Healthcare (Batch & Expiry)</option>
                    <option value="Service & Consultancy">Services & Consultancy (Hourly & Milestones)</option>
                    <option value="Manufacturing">Manufacturing & Assembly (BOM Engine)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">
                    Currency
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => handleCurrencyChange(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none focus:border-primary"
                  >
                    <option value="INR">INR (₹ - Indian Rupee)</option>
                    <option value="USD">USD ($ - US Dollar)</option>
                    <option value="EUR">EUR (€ - Euro)</option>
                    <option value="GBP">GBP (£ - British Pound)</option>
                    <option value="AUD">AUD (A$ - Australian Dollar)</option>
                    <option value="CAD">CAD (C$ - Canadian Dollar)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">
                    Tax / Pricing Model
                  </label>
                  <select
                    value={taxPreference}
                    onChange={(e) => setTaxPreference(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none focus:border-primary"
                  >
                    <option value="exclusive">Tax Exclusive (Added at checkout)</option>
                    <option value="inclusive">Tax Inclusive (Included in retail price)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground mb-1">
                  Default Tax / GST Rate (%)
                </label>
                <input
                  type="number"
                  value={defaultTaxRate}
                  onChange={(e) => setDefaultTaxRate(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
              <button
                onClick={() => setMode('welcome')}
                className="px-3 py-2 text-xs text-muted-foreground hover:text-foreground rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateNew}
                disabled={loading || !businessName.trim()}
                className="flex items-center gap-1.5 px-4 py-2 text-xs bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg shadow-sm font-semibold transition"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                <span>Create & Initialize Workbook</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
