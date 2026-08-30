import React from 'react';
import { useWorkbookStore } from '../../stores/workbookStore';
import { useUIStore } from '../../stores/uiStore';
import { getBusinessFlowType } from '../../types';
import {
  LayoutDashboard,
  Package,
  Boxes,
  Users,
  Building2,
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
  Layers,
  Store,
  Truck,
  Stethoscope,
  Briefcase,
  Factory,
  Car,
  Hotel,
  GraduationCap,
  BookOpen,
  BadgeDollarSign,
  Dumbbell,
  Activity,
  Sparkles
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { sheets, activeSheetName, setActiveSheet, appConfig } = useWorkbookStore();
  const { isSidebarCollapsed, toggleSidebar, openModal } = useUIStore();

  const flowType = getBusinessFlowType(appConfig?.businessType);

  const flowMeta = React.useMemo(() => {
    switch (flowType) {
      case 'pharmacy':
        return {
          editionName: 'Pharmacy Rx',
          opTitle: 'Prescribe & Dispense',
          opIcon: Stethoscope,
          productsTitle: 'Medicines & Drugs',
          inventoryTitle: 'Batches & Expiry',
          customersTitle: 'Patients & Clients',
          suppliersTitle: 'Pharma Distributors',
          salesTitle: 'Dispensed Rx Ledger',
        };
      case 'wholesale':
        return {
          editionName: 'Wholesale B2B',
          opTitle: 'B2B Order & Dispatch',
          opIcon: Truck,
          productsTitle: 'Wholesale Catalog',
          inventoryTitle: 'Warehouse Inventory',
          customersTitle: 'B2B Client Accounts',
          suppliersTitle: 'Manufacturers',
          salesTitle: 'B2B Invoices Ledger',
        };
      case 'services':
        return {
          editionName: 'Services & Retainers',
          opTitle: 'Bill Client / Retainer',
          opIcon: Briefcase,
          productsTitle: 'Billable Services',
          inventoryTitle: 'Deliverables Pool',
          customersTitle: 'Clients & Retainers',
          suppliersTitle: 'Contractors',
          salesTitle: 'Client Invoices Ledger',
        };
      case 'manufacturing':
        return {
          editionName: 'Manufacturing BOM',
          opTitle: 'Production Run (BOM)',
          opIcon: Factory,
          productsTitle: 'Assemblies & Goods',
          inventoryTitle: 'Raw Materials & Stock',
          customersTitle: 'Distributors & Buyers',
          suppliersTitle: 'Material Suppliers',
          salesTitle: 'Production Orders',
        };
      case 'taxi':
        return {
          editionName: 'Taxi & Cab Fleet',
          opTitle: 'Dispatch Trip',
          opIcon: Car,
          productsTitle: 'Cab Rates & Slabs',
          inventoryTitle: 'Vehicle Fleet Status',
          customersTitle: 'Passengers & Accounts',
          suppliersTitle: 'Drivers & Fleet Owners',
          salesTitle: 'Trips & Dispatch Ledger',
        };
      case 'hotel':
        return {
          editionName: 'Hotel & Hospitality',
          opTitle: 'Book Room / Check-in',
          opIcon: Hotel,
          productsTitle: 'Rooms & Tariffs',
          inventoryTitle: 'Room Occupancy Status',
          customersTitle: 'Guests & Folios',
          suppliersTitle: 'Vendors & Supplies',
          salesTitle: 'Stay Folios Ledger',
        };
      case 'school':
        return {
          editionName: 'School Management',
          opTitle: 'Collect Student Fee',
          opIcon: GraduationCap,
          productsTitle: 'Fee Heads & Slabs',
          inventoryTitle: 'Academic Assets',
          customersTitle: 'Students Roster',
          suppliersTitle: 'Teachers & Academic Staff',
          salesTitle: 'Fee Receipts Ledger',
        };
      case 'coaching':
        return {
          editionName: 'Coaching & Tuition',
          opTitle: 'Enroll & Collect Fee',
          opIcon: BookOpen,
          productsTitle: 'Courses & Batches',
          inventoryTitle: 'Study Material Kits',
          customersTitle: 'Enrolled Students',
          suppliersTitle: 'Instructors & Mentors',
          salesTitle: 'Installments Ledger',
        };
      case 'payroll':
        return {
          editionName: 'Company Payroll',
          opTitle: 'Monthly Pay Run',
          opIcon: BadgeDollarSign,
          productsTitle: 'Salary Structures',
          inventoryTitle: 'Staff Allowances Pool',
          customersTitle: 'Employees Roster',
          suppliersTitle: 'Contractors & Consultants',
          salesTitle: 'Monthly Payslips Ledger',
        };
      case 'gym':
        return {
          editionName: 'Gym & Fitness Center',
          opTitle: 'Enroll / Renew Plan',
          opIcon: Dumbbell,
          productsTitle: 'Membership Plans',
          inventoryTitle: 'Gym Equipment & Lockers',
          customersTitle: 'Active Members',
          suppliersTitle: 'Personal Trainers',
          salesTitle: 'Subscriptions Ledger',
        };
      case 'hospital':
        return {
          editionName: 'Hospital & Healthcare',
          opTitle: 'OPD Encounter & Bill',
          opIcon: Activity,
          productsTitle: 'Medical Procedures & OPD',
          inventoryTitle: 'Pharmacy & Bed Status',
          customersTitle: 'Patients Registry',
          suppliersTitle: 'Doctors & Specialists',
          salesTitle: 'OPD Encounters Ledger',
        };
      case 'retail':
      default:
        return {
          editionName: 'Retail POS',
          opTitle: 'Point of Sale (POS)',
          opIcon: Store,
          productsTitle: 'Store Products',
          inventoryTitle: 'Store Inventory',
          customersTitle: 'Customers',
          suppliersTitle: 'Suppliers',
          salesTitle: 'Sales Ledger',
        };
    }
  }, [flowType]);

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

          <button
            onClick={() => openModal('business_templates')}
            className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-primary hover:bg-primary/10 transition mt-1 border border-primary/20"
            title="Setup & Import Business Tables (Taxi, Hotel, School, Payroll, Gym, Hospital...)"
          >
            <Sparkles className="h-4 w-4 shrink-0 text-primary" />
            {!isSidebarCollapsed && <span className="font-bold truncate">Setup Business Flow</span>}
          </button>
        </div>

        {/* Business Group */}
        <div>
          {!isSidebarCollapsed && (
            <div className="text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wider px-2 mb-1 flex items-center justify-between">
              <span>{flowMeta.editionName}</span>
              <button
                onClick={() => openModal('business_templates')}
                className="text-[10px] text-primary hover:underline lowercase font-mono flex items-center gap-1 cursor-pointer"
                title="Switch business edition / import tables"
              >
                <Sparkles className="h-2.5 w-2.5" />
                <span>switch</span>
              </button>
            </div>
          )}
          <div className="space-y-0.5">
            <button
              onClick={() => setActiveSheet('_Products')}
              className={navItemClass('_Products')}
              title={flowMeta.productsTitle}
            >
              <Package className="h-4 w-4 shrink-0" />
              {!isSidebarCollapsed && <span>{flowMeta.productsTitle}</span>}
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
              title={flowMeta.inventoryTitle}
            >
              <Boxes className="h-4 w-4 shrink-0" />
              {!isSidebarCollapsed && (
                <div className="flex-1 flex items-center justify-between">
                  <span>{flowMeta.inventoryTitle}</span>
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
              title={flowMeta.customersTitle}
            >
              <Users className="h-4 w-4 shrink-0" />
              {!isSidebarCollapsed && <span>{flowMeta.customersTitle}</span>}
            </button>

            <button
              onClick={() => setActiveSheet('_Suppliers')}
              className={navItemClass('_Suppliers')}
              title={flowMeta.suppliersTitle}
            >
              <Building2 className="h-4 w-4 shrink-0" />
              {!isSidebarCollapsed && <span>{flowMeta.suppliersTitle}</span>}
            </button>
          </div>
        </div>

        {/* Operations Group */}
        <div>
          {!isSidebarCollapsed && (
            <div className="text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wider px-2 mb-1">
              Operations
            </div>
          )}
          <div className="space-y-0.5">
            <button
              onClick={() => setActiveSheet('new_sale')}
              className={navItemClass('new_sale')}
              title={flowMeta.opTitle}
            >
              <flowMeta.opIcon className="h-4 w-4 shrink-0 text-emerald-500" />
              {!isSidebarCollapsed && <span className="font-bold">{flowMeta.opTitle}</span>}
            </button>

            <button
              onClick={() => setActiveSheet('_Sales')}
              className={navItemClass('_Sales')}
              title={flowMeta.salesTitle}
            >
              <Receipt className="h-4 w-4 shrink-0" />
              {!isSidebarCollapsed && <span>{flowMeta.salesTitle}</span>}
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
