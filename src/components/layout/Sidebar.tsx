import React from 'react';
import { useWorkbookStore } from '../../stores/workbookStore';
import { useUIStore } from '../../stores/uiStore';
import {
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
  Table as TableIcon,
  Plus,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Layers
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { sheets, activeSheetName, setActiveSheet } = useWorkbookStore();
  const { isSidebarCollapsed, toggleSidebar } = useUIStore();

  // Count low stock items for badge
  const inventorySheet = sheets['_Inventory'];
  const lowStockCount = React.useMemo(() => {
    if (!inventorySheet) return 0;
    return inventorySheet.rows.filter((r) => {
      const qty = Number(r.quantity || 0);
      const min = Number(r.minimum_stock || 0);
      return qty <= min;
    }).length;
  }, [inventorySheet]);

  // Read custom pinned tables from _CustomTables
  const customTablesSheet = sheets['_CustomTables'];
  const customTables = React.useMemo(() => {
    if (!customTablesSheet) return [];
    return customTablesSheet.rows.filter((r) => r.pinned_to_sidebar);
  }, [customTablesSheet]);

  const navItemClass = (sheetKey: string) => {
    const isActive = activeSheetName === sheetKey;
    return `w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition select-none ${
      isActive
        ? 'bg-primary text-primary-foreground shadow-sm teal-glow-sm'
        : 'text-muted-foreground hover:text-foreground hover:bg-muted/70'
    }`;
  };

  return (
    <aside
      className={`h-full border-r border-border bg-card/40 backdrop-blur-sm flex flex-col justify-between transition-all duration-200 z-20 shrink-0 ${
        isSidebarCollapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Top navigation sections */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* Dashboard */}
        <div>
          <button
            onClick={() => setActiveSheet('dashboard')}
            className={navItemClass('dashboard')}
            title="Dashboard"
          >
            <LayoutDashboard className="h-4 w-4 shrink-0" />
            {!isSidebarCollapsed && <span>Dashboard</span>}
          </button>
        </div>

        {/* Business Group */}
        <div>
          {!isSidebarCollapsed && (
            <div className="text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wider px-2 mb-1">
              Business
            </div>
          )}
          <div className="space-y-0.5">
            <button
              onClick={() => setActiveSheet('_Products')}
              className={navItemClass('_Products')}
              title="Products"
            >
              <Package className="h-4 w-4 shrink-0" />
              {!isSidebarCollapsed && <span>Products</span>}
            </button>

            <button
              onClick={() => setActiveSheet('_Categories')}
              className={navItemClass('_Categories')}
              title="Categories"
            >
              <Layers className="h-4 w-4 shrink-0" />
              {!isSidebarCollapsed && <span>Categories</span>}
            </button>

            <button
              onClick={() => setActiveSheet('_Inventory')}
              className={navItemClass('_Inventory')}
              title="Inventory"
            >
              <Boxes className="h-4 w-4 shrink-0" />
              {!isSidebarCollapsed && (
                <div className="flex-1 flex items-center justify-between">
                  <span>Inventory</span>
                  {lowStockCount > 0 && (
                    <span className="flex items-center gap-1 text-[10px] px-1.5 py-0.2 bg-amber-500/20 text-amber-500 rounded-full font-bold">
                      <AlertTriangle className="h-3 w-3" />
                      {lowStockCount}
                    </span>
                  )}
                </div>
              )}
            </button>

            <button
              onClick={() => setActiveSheet('_Customers')}
              className={navItemClass('_Customers')}
              title="Customers"
            >
              <Users className="h-4 w-4 shrink-0" />
              {!isSidebarCollapsed && <span>Customers</span>}
            </button>

            <button
              onClick={() => setActiveSheet('_Suppliers')}
              className={navItemClass('_Suppliers')}
              title="Suppliers"
            >
              <Building2 className="h-4 w-4 shrink-0" />
              {!isSidebarCollapsed && <span>Suppliers</span>}
            </button>
          </div>
        </div>

        {/* Sales Group */}
        <div>
          {!isSidebarCollapsed && (
            <div className="text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wider px-2 mb-1">
              Sales & Orders
            </div>
          )}
          <div className="space-y-0.5">
            <button
              onClick={() => setActiveSheet('new_sale')}
              className={navItemClass('new_sale')}
              title="New Sale (POS)"
            >
              <ShoppingCart className="h-4 w-4 shrink-0 text-emerald-500" />
              {!isSidebarCollapsed && <span className="font-semibold">New Sale (POS)</span>}
            </button>

            <button
              onClick={() => setActiveSheet('_Sales')}
              className={navItemClass('_Sales')}
              title="Sales History"
            >
              <Receipt className="h-4 w-4 shrink-0" />
              {!isSidebarCollapsed && <span>Sales History</span>}
            </button>
          </div>
        </div>

        {/* Finance Group */}
        <div>
          {!isSidebarCollapsed && (
            <div className="text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wider px-2 mb-1">
              Finance
            </div>
          )}
          <div className="space-y-0.5">
            <button
              onClick={() => setActiveSheet('_GST')}
              className={navItemClass('_GST')}
              title="GST / Tax"
            >
              <Percent className="h-4 w-4 shrink-0" />
              {!isSidebarCollapsed && <span>GST / Tax</span>}
            </button>

            <button
              onClick={() => setActiveSheet('_Expenses')}
              className={navItemClass('_Expenses')}
              title="Expenses"
            >
              <Wallet className="h-4 w-4 shrink-0" />
              {!isSidebarCollapsed && <span>Expenses</span>}
            </button>
          </div>
        </div>

        {/* Analytics & Reports */}
        <div>
          {!isSidebarCollapsed && (
            <div className="text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wider px-2 mb-1">
              Insights
            </div>
          )}
          <div className="space-y-0.5">
            <button
              onClick={() => setActiveSheet('analytics')}
              className={navItemClass('analytics')}
              title="Analytics"
            >
              <BarChart3 className="h-4 w-4 shrink-0" />
              {!isSidebarCollapsed && <span>Analytics</span>}
            </button>

            <button
              onClick={() => setActiveSheet('reports')}
              className={navItemClass('reports')}
              title="Reports & Export"
            >
              <FileText className="h-4 w-4 shrink-0" />
              {!isSidebarCollapsed && <span>Reports</span>}
            </button>
          </div>
        </div>

        {/* Custom Tables Group */}
        <div>
          <div className="flex items-center justify-between px-2 mb-1">
            {!isSidebarCollapsed && (
              <span className="text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wider">
                Custom Tables
              </span>
            )}
            <button
              onClick={() => setActiveSheet('create_table')}
              className="p-1 text-muted-foreground hover:text-primary rounded transition"
              title="Create Custom Table"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="space-y-0.5">
            {customTables.map((t) => (
              <button
                key={t.table_id}
                onClick={() => setActiveSheet(t.name)}
                className={navItemClass(t.name)}
                title={t.display_name}
              >
                <TableIcon className="h-4 w-4 shrink-0 text-indigo-400" />
                {!isSidebarCollapsed && <span className="truncate">{t.display_name}</span>}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer: Settings & Collapse Toggle */}
      <div className="p-3 border-t border-border/80 space-y-1">
        <button
          onClick={() => setActiveSheet('settings')}
          className={navItemClass('settings')}
          title="Settings"
        >
          <Settings className="h-4 w-4 shrink-0" />
          {!isSidebarCollapsed && <span>Settings</span>}
        </button>

        <button
          onClick={toggleSidebar}
          className="w-full flex items-center justify-center p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition"
          title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isSidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>
    </aside>
  );
};
