import React, { useState, useEffect, useRef } from 'react';
import { useWorkbookStore } from '../../stores/workbookStore';
import { useUIStore } from '../../stores/uiStore';
import {
  Search,
  LayoutDashboard,
  Package,
  Boxes,
  Users,
  Building2,
  ShoppingCart,
  Receipt,
  Percent,
  Wallet,
  BarChart3,
  FileText,
  Settings,
  PlusCircle,
  ShieldCheck,
  Save,
  Table as TableIcon
} from 'lucide-react';

export const CommandPalette: React.FC = () => {
  const { commandPaletteOpen, setCommandPaletteOpen, openModal, addNotification } = useUIStore();
  const { setActiveSheet, saveWorkbook, createBackup, sheets } = useWorkbookStore();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
      } else if (e.key === 'Escape' && commandPaletteOpen) {
        setCommandPaletteOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [commandPaletteOpen, setCommandPaletteOpen]);

  useEffect(() => {
    if (commandPaletteOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [commandPaletteOpen]);

  if (!commandPaletteOpen) return null;

  // List of actions and navigation items
  const allItems = [
    {
      category: 'Quick Actions',
      items: [
        {
          id: 'action_new_sale',
          label: 'New Sale (POS)',
          icon: ShoppingCart,
          action: () => openModal('new_sale'),
        },
        {
          id: 'action_add_product',
          label: 'Add New Product',
          icon: PlusCircle,
          action: () => openModal('add_product'),
        },
        {
          id: 'action_add_customer',
          label: 'Add New Customer',
          icon: PlusCircle,
          action: () => openModal('add_customer'),
        },
        {
          id: 'action_add_expense',
          label: 'Record Expense',
          icon: Wallet,
          action: () => openModal('add_expense'),
        },
        {
          id: 'action_stock_movement',
          label: 'Stock In / Out / Adjustment',
          icon: Boxes,
          action: () => openModal('stock_movement'),
        },
        {
          id: 'action_create_table',
          label: 'Create Custom Table',
          icon: TableIcon,
          action: () => openModal('create_table'),
        },
        {
          id: 'action_save',
          label: 'Save Workbook (Cmd+S)',
          icon: Save,
          action: async () => {
            await saveWorkbook();
            addNotification('success', 'Workbook Saved', 'All changes persisted to Excel');
          },
        },
        {
          id: 'action_backup',
          label: 'Create Instant Backup',
          icon: ShieldCheck,
          action: async () => {
            const b = await createBackup();
            addNotification('success', 'Backup Created', b.filename);
          },
        },
      ],
    },
    {
      category: 'Navigate To',
      items: [
        { id: 'nav_dashboard', label: 'Dashboard', icon: LayoutDashboard, action: () => setActiveSheet('dashboard') },
        { id: 'nav_products', label: 'Products Catalog', icon: Package, action: () => setActiveSheet('_Products') },
        { id: 'nav_categories', label: 'Categories', icon: TableIcon, action: () => setActiveSheet('_Categories') },
        { id: 'nav_inventory', label: 'Inventory Management', icon: Boxes, action: () => setActiveSheet('_Inventory') },
        { id: 'nav_customers', label: 'Customers', icon: Users, action: () => setActiveSheet('_Customers') },
        { id: 'nav_suppliers', label: 'Suppliers', icon: Building2, action: () => setActiveSheet('_Suppliers') },
        { id: 'nav_sales', label: 'Sales History', icon: Receipt, action: () => setActiveSheet('_Sales') },
        { id: 'nav_gst', label: 'GST & Tax Rates', icon: Percent, action: () => setActiveSheet('_GST') },
        { id: 'nav_expenses', label: 'Expenses', icon: Wallet, action: () => setActiveSheet('_Expenses') },
        { id: 'nav_analytics', label: 'Business Analytics', icon: BarChart3, action: () => setActiveSheet('analytics') },
        { id: 'nav_reports', label: 'Reports & Export', icon: FileText, action: () => setActiveSheet('reports') },
        { id: 'nav_settings', label: 'Settings', icon: Settings, action: () => setActiveSheet('settings') },
      ],
    },
  ];

  // Also include products if user searches
  const productSheet = sheets['_Products'];
  const productMatches = query.trim().length > 1 && productSheet
    ? productSheet.rows
        .filter((p) => String(p.name || '').toLowerCase().includes(query.toLowerCase()) || String(p.sku || '').toLowerCase().includes(query.toLowerCase()))
        .slice(0, 5)
        .map((p) => ({
          id: `prod_${p.product_id}`,
          label: `Product: ${p.name} (${p.sku || 'No SKU'})`,
          icon: Package,
          action: () => {
            setActiveSheet('_Products');
          },
        }))
    : [];

  const filteredCategories = allItems.map((cat) => ({
    category: cat.category,
    items: cat.items.filter((item) =>
      item.label.toLowerCase().includes(query.toLowerCase())
    ),
  })).filter((cat) => cat.items.length > 0);

  if (productMatches.length > 0) {
    filteredCategories.unshift({
      category: 'Matched Products',
      items: productMatches,
    });
  }

  const flattenedItems = filteredCategories.flatMap((c) => c.items);

  const handleSelect = (item: any) => {
    item.action();
    setCommandPaletteOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, flattenedItems.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + flattenedItems.length) % Math.max(1, flattenedItems.length));
    } else if (e.key === 'Enter' && flattenedItems[selectedIndex]) {
      e.preventDefault();
      handleSelect(flattenedItems[selectedIndex]);
    }
  };

  let itemCounter = -1;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center pt-24 px-4 select-none animate-in fade-in duration-150"
      onClick={() => setCommandPaletteOpen(false)}
    >
      <div
        className="w-full max-w-xl bg-card border border-border rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[60vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-border gap-3 bg-muted/30">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or search business data..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
          />
          <kbd className="text-[10px] bg-background border border-border px-1.5 py-0.5 rounded font-mono text-muted-foreground">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-3">
          {flattenedItems.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              No matching commands or records found.
            </div>
          ) : (
            filteredCategories.map((cat) => (
              <div key={cat.category}>
                <div className="text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wider px-2 py-1">
                  {cat.category}
                </div>
                <div className="space-y-0.5">
                  {cat.items.map((item) => {
                    itemCounter++;
                    const isSelected = itemCounter === selectedIndex;
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleSelect(item)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition text-left ${
                          isSelected
                            ? 'bg-primary text-primary-foreground'
                            : 'text-foreground hover:bg-muted'
                        }`}
                      >
                        <Icon className="h-4 w-4 shrink-0 opacity-80" />
                        <span className="flex-1 truncate">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
