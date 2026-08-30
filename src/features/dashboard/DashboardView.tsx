import React, { useMemo } from 'react';
import { useWorkbookStore } from '../../stores/workbookStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { useUIStore } from '../../stores/uiStore';
import { formatCurrency, formatDate } from '../../lib/utils';
import { getBusinessFlowType } from '../../types';
import ReactECharts from 'echarts-for-react';
import {
  TrendingUp,
  DollarSign,
  Package,
  AlertTriangle,
  Users,
  Wallet,
  ShoppingCart,
  PlusCircle,
  Clock,
  ArrowUpRight,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Truck,
  Stethoscope,
  Briefcase,
  Factory,
  Store,
  Car,
  Hotel,
  GraduationCap,
  BookOpen,
  BadgeDollarSign,
  Dumbbell,
  Activity,
  Utensils,
  Home,
  Wrench,
  Printer
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const { sheets, appConfig, setActiveSheet } = useWorkbookStore();
  const { theme } = useSettingsStore();
  const { openModal, setTargetRecord } = useUIStore();

  const currencySymbol = appConfig?.currencySymbol || '₹';
  const currency = appConfig?.currency || 'INR';

  // Calculate Metrics from Real Sheets
  const salesRows = sheets['_Sales']?.rows || [];
  const productRows = sheets['_Products']?.rows || [];
  const inventoryRows = sheets['_Inventory']?.rows || [];
  const customerRows = sheets['_Customers']?.rows || [];
  const expenseRows = sheets['_Expenses']?.rows || [];

  // Total Sales
  const totalRevenue = useMemo(() => {
    return salesRows.reduce((acc, row) => acc + Number(row.total || 0), 0);
  }, [salesRows]);

  // Today's Sales
  const todayRevenue = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    return salesRows
      .filter((r) => String(r.sale_date || '').startsWith(todayStr))
      .reduce((acc, r) => acc + Number(r.total || 0), 0);
  }, [salesRows]);

  // Total Expenses
  const totalExpenses = useMemo(() => {
    return expenseRows.reduce((acc, row) => acc + Number(row.amount || 0), 0);
  }, [expenseRows]);

  // Low Stock Items
  const lowStockItems = useMemo(() => {
    const lowStockInv = inventoryRows.filter((r) => {
      const qty = Number(r.quantity || 0);
      const min = Number(r.minimum_stock || 0);
      return qty <= min;
    });

    return lowStockInv.map((inv) => {
      const prod = productRows.find((p) => p.product_id === inv.product_id);
      return {
        name: prod?.name || inv.product_id,
        sku: prod?.sku || '-',
        quantity: Number(inv.quantity || 0),
        minStock: Number(inv.minimum_stock || 0),
        id: inv.product_id,
      };
    });
  }, [inventoryRows, productRows]);

  // Recent 5 Sales
  const recentSales = useMemo(() => {
    return [...salesRows]
      .sort((a, b) => new Date(b.created_at || b.sale_date).getTime() - new Date(a.created_at || a.sale_date).getTime())
      .slice(0, 5)
      .map((s) => {
        const customer = customerRows.find((c) => c.customer_id === s.customer_id);
        return {
          id: s.sale_id,
          customerName: customer?.name || 'Walk-in Customer',
          total: Number(s.total || 0),
          amount: Number(s.total || 0),
          date: s.sale_date,
          paymentMethod: s.payment_method || 'Cash',
        };
      });
  }, [salesRows, customerRows]);

  const flowType = getBusinessFlowType(appConfig?.businessType);

  const dashboardMeta = useMemo(() => {
    switch (flowType) {
      case 'taxi':
        return {
          editionName: 'Taxi & Cab Dispatch',
          revenueTitle: 'Total Trip Fare Revenue',
          todayTitle: "Today's Fare Collections",
          volumeLabel: 'trips dispatched',
          catalogTitle: 'Fleet Vehicle Categories',
          inventorySubtext: 'vehicles on road',
          alertTitle: 'Maintenance / Idle Cabs',
          alertOk: 'All cabs roadworthy',
          alertWarning: 'Cabs need attention',
          counterpartyTitle: 'Registered Passengers',
          counterpartySub: 'frequent travelers',
          quickAddTitle: 'Add Cab / Fare Slab',
          quickAddSub: 'Expand fleet tariff',
          quickActionBtn: 'Dispatch Trip',
          recentTitle: 'Recent Dispatched Trips',
          recentColCustomer: 'Passenger Name',
          recentColDate: 'Trip Date',
          recentColAmount: 'Fare Total',
          chartRevenueTitle: 'Daily Trip Fare Trend',
          chartCategoryTitle: 'Fare by Vehicle Category',
        };
      case 'hotel':
        return {
          editionName: 'Hotel & Resort Booking',
          revenueTitle: 'Total Room & Folio Revenue',
          todayTitle: "Today's Guest Billing",
          volumeLabel: 'stay folios settled',
          catalogTitle: 'Room Tariff Categories',
          inventorySubtext: 'rooms in inventory',
          alertTitle: 'Rooms in Housekeeping',
          alertOk: 'All rooms guest-ready',
          alertWarning: 'Turnaround required',
          counterpartyTitle: 'In-House Guests',
          counterpartySub: 'registered guest folios',
          quickAddTitle: 'Add Room Tariff',
          quickAddSub: 'Configure suites & beds',
          quickActionBtn: 'Book Room / Check-in',
          recentTitle: 'Recent Stay Folios',
          recentColCustomer: 'Guest Name',
          recentColDate: 'Check-in Date',
          recentColAmount: 'Folio Total',
          chartRevenueTitle: 'Daily Stay Revenue Trend',
          chartCategoryTitle: 'Tariff by Room Category',
        };
      case 'school':
        return {
          editionName: 'School Management',
          revenueTitle: 'Total Term Fees Collected',
          todayTitle: "Today's Fee Collections",
          volumeLabel: 'official receipts issued',
          catalogTitle: 'Fee Heads & Slabs',
          inventorySubtext: 'classrooms & sections',
          alertTitle: 'Fee Overdue / Alerts',
          alertOk: 'All student dues clear',
          alertWarning: 'Outstanding installments',
          counterpartyTitle: 'Enrolled Students',
          counterpartySub: 'admitted student directory',
          quickAddTitle: 'Add Fee Head / Slab',
          quickAddSub: 'Set term tuition fee',
          quickActionBtn: 'Collect Student Fee',
          recentTitle: 'Recent Fee Receipts',
          recentColCustomer: 'Student Name',
          recentColDate: 'Receipt Date',
          recentColAmount: 'Fee Paid',
          chartRevenueTitle: 'Term Fee Collection Trend',
          chartCategoryTitle: 'Fee Distribution by Slabs',
        };
      case 'coaching':
        return {
          editionName: 'Coaching & Tuition',
          revenueTitle: 'Total Tuition Fees Inflow',
          todayTitle: "Today's Installments",
          volumeLabel: 'installments settled',
          catalogTitle: 'Exam Prep Courses',
          inventorySubtext: 'batches & kits pool',
          alertTitle: 'Installments Due',
          alertOk: 'Installments current',
          alertWarning: 'Overdue installments',
          counterpartyTitle: 'Enrolled Candidates',
          counterpartySub: 'coaching student roll',
          quickAddTitle: 'Add Course / Batch',
          quickAddSub: 'Target exam syllabus',
          quickActionBtn: 'Enroll & Collect Fee',
          recentTitle: 'Recent Tuition Receipts',
          recentColCustomer: 'Candidate Name',
          recentColDate: 'Installment Date',
          recentColAmount: 'Installment Paid',
          chartRevenueTitle: 'Tuition Inflow Trend',
          chartCategoryTitle: 'Fees by Course Batch',
        };
      case 'payroll':
        return {
          editionName: 'Company Payroll',
          revenueTitle: 'Total Disbursed Salaries',
          todayTitle: "Today's Pay Run Amount",
          volumeLabel: 'payslips processed',
          catalogTitle: 'Salary Components',
          inventorySubtext: 'active company headcount',
          alertTitle: 'Statutory Dues / Tax',
          alertOk: 'Statutory dues reconciled',
          alertWarning: 'Pending PF/ESI/TDS',
          counterpartyTitle: 'Staff Directory',
          counterpartySub: 'payroll active employees',
          quickAddTitle: 'Add Pay Component',
          quickAddSub: 'Allowance or deduction',
          quickActionBtn: 'Run Monthly Payroll',
          recentTitle: 'Recent Monthly Payslips',
          recentColCustomer: 'Employee Name',
          recentColDate: 'Disbursal Date',
          recentColAmount: 'Net Take-Home Pay',
          chartRevenueTitle: 'Monthly Disbursal Trend',
          chartCategoryTitle: 'Salary by Pay Component',
        };
      case 'gym':
        return {
          editionName: 'Gym & Fitness Center',
          revenueTitle: 'Total Subscription Revenue',
          todayTitle: "Today's Pass Renewals",
          volumeLabel: 'passes & memberships',
          catalogTitle: 'Membership Tiers',
          inventorySubtext: 'gym lockers & equipment',
          alertTitle: 'Memberships Expiring Soon',
          alertOk: 'All memberships active',
          alertWarning: 'Renewal reminders needed',
          counterpartyTitle: 'Active Members',
          counterpartySub: 'gym subscriber roll',
          quickAddTitle: 'Add Membership Plan',
          quickAddSub: 'Configure duration & pass',
          quickActionBtn: 'Enroll / Renew Member',
          recentTitle: 'Recent Subscriptions',
          recentColCustomer: 'Member Name',
          recentColDate: 'Activation Date',
          recentColAmount: 'Subscription Fee',
          chartRevenueTitle: 'Daily Subscription Inflow',
          chartCategoryTitle: 'Revenue by Plan Tier',
        };
      case 'hospital':
        return {
          editionName: 'Hospital & Clinic OPD',
          revenueTitle: 'Total OPD & Medical Revenue',
          todayTitle: "Today's Clinical Billings",
          volumeLabel: 'encounters billed',
          catalogTitle: 'Medical Procedures & Tests',
          inventorySubtext: 'bed slots & reagents',
          alertTitle: 'Critical Supply / Bed Shortage',
          alertOk: 'Clinical supplies optimal',
          alertWarning: 'Immediate restock needed',
          counterpartyTitle: 'Patients Registry',
          counterpartySub: 'universal health IDs (UHID)',
          quickAddTitle: 'Add Medical Procedure',
          quickAddSub: 'Set consultation / test fee',
          quickActionBtn: 'OPD Encounter & Bill',
          recentTitle: 'Recent Patient Encounters',
          recentColCustomer: 'Patient Name',
          recentColDate: 'Encounter Time',
          recentColAmount: 'Medical Bill Total',
          chartRevenueTitle: 'Daily OPD Billing Trend',
          chartCategoryTitle: 'Revenue by Procedure Type',
        };
      case 'restaurant':
        return {
          editionName: 'Restaurant & Cafe',
          revenueTitle: 'Total Food & Dining Sales',
          todayTitle: "Today's KOT Revenue",
          volumeLabel: 'orders served',
          catalogTitle: 'Dishes & Menu Catalog',
          inventorySubtext: 'daily kitchen prep portions',
          alertTitle: 'Low Kitchen Prep Portions',
          alertOk: 'Kitchen ingredients optimal',
          alertWarning: 'Prep items running low',
          counterpartyTitle: 'Dine-in Guests & Tables',
          counterpartySub: 'regular customer directory',
          quickAddTitle: 'Add Menu Dish',
          quickAddSub: 'New recipe & price',
          quickActionBtn: 'Settle Food Bill (KOT)',
          recentTitle: 'Recent Table Orders (KOT)',
          recentColCustomer: 'Guest / Table #',
          recentColDate: 'Order Time',
          recentColAmount: 'Bill Amount',
          chartRevenueTitle: 'Daily Food Sales Trend',
          chartCategoryTitle: 'Dish Prices by Course',
        };
      case 'realestate':
        return {
          editionName: 'Real Estate & Property',
          revenueTitle: 'Total Rental Collections',
          todayTitle: "Today's Rent Inflow",
          volumeLabel: 'rent receipts issued',
          catalogTitle: 'Rental Units & Properties',
          inventorySubtext: 'apartments in portfolio',
          alertTitle: 'Vacant Units Pending Lease',
          alertOk: 'All units leased',
          alertWarning: 'Vacant units available',
          counterpartyTitle: 'Registered Tenants',
          counterpartySub: 'lease contract holders',
          quickAddTitle: 'Add Rental Unit Type',
          quickAddSub: 'Configure monthly rent',
          quickActionBtn: 'Collect Rent Receipt',
          recentTitle: 'Recent Rent Receipts',
          recentColCustomer: 'Tenant Name',
          recentColDate: 'Receipt Date',
          recentColAmount: 'Rent Collected',
          chartRevenueTitle: 'Monthly Rent Collections',
          chartCategoryTitle: 'Tariff by Unit Type',
        };
      case 'garage':
        return {
          editionName: 'Auto Workshop & Garage',
          revenueTitle: 'Total Auto Repair Revenue',
          todayTitle: "Today's Workshop Billing",
          volumeLabel: 'job cards completed',
          catalogTitle: 'Service Packages & Spares',
          inventorySubtext: 'parts in bin stock',
          alertTitle: 'Spares Below Reorder Level',
          alertOk: 'All spares well stocked',
          alertWarning: 'Order spare parts immediately',
          counterpartyTitle: 'Vehicle Owners',
          counterpartySub: 'customer vehicle fleet',
          quickAddTitle: 'Add Service Package',
          quickAddSub: 'Labor rate or spare part',
          quickActionBtn: 'New Workshop Job Card',
          recentTitle: 'Recent Repair Invoices',
          recentColCustomer: 'Vehicle Owner',
          recentColDate: 'Delivery Date',
          recentColAmount: 'Repair Invoice',
          chartRevenueTitle: 'Daily Repair Billing Trend',
          chartCategoryTitle: 'Pricing by Service Package',
        };
      case 'salon':
        return {
          editionName: 'Salon, Spa & Wellness',
          revenueTitle: 'Total Salon & Spa Revenue',
          todayTitle: "Today's Session Billing",
          volumeLabel: 'appointments billed',
          catalogTitle: 'Treatments & Aesthetics',
          inventorySubtext: 'cosmetics & treatment kits',
          alertTitle: 'Cosmetics Running Low',
          alertOk: 'Beauty products optimal',
          alertWarning: 'Restock cosmetic kits',
          counterpartyTitle: 'Salon Clients',
          counterpartySub: 'client style directory',
          quickAddTitle: 'Add Salon Treatment',
          quickAddSub: 'New haircut or spa service',
          quickActionBtn: 'Bill Salon Appointment',
          recentTitle: 'Recent Client Appointments',
          recentColCustomer: 'Client Name',
          recentColDate: 'Appointment Date',
          recentColAmount: 'Salon Bill',
          chartRevenueTitle: 'Daily Salon Revenue Trend',
          chartCategoryTitle: 'Charges by Treatment',
        };
      case 'wholesale':
        return {
          editionName: 'Wholesale & B2B',
          revenueTitle: 'Total B2B Wholesale Revenue',
          todayTitle: "Today's Wholesale Billing",
          volumeLabel: 'B2B tax invoices',
          catalogTitle: 'Case Lots & Cartons',
          inventorySubtext: 'pallet units in warehouse',
          alertTitle: 'Warehouse Shortages',
          alertOk: 'Case packs well stocked',
          alertWarning: 'Carton reorder threshold',
          counterpartyTitle: 'B2B Dealer Accounts',
          counterpartySub: 'wholesale credit accounts',
          quickAddTitle: 'Add Wholesale SKU',
          quickAddSub: 'Set case lot & MOQ',
          quickActionBtn: 'New B2B Order',
          recentTitle: 'Recent B2B Tax Invoices',
          recentColCustomer: 'Dealer Account',
          recentColDate: 'Invoice Date',
          recentColAmount: 'Invoice Total',
          chartRevenueTitle: 'Daily B2B Invoice Inflow',
          chartCategoryTitle: 'Pricing by Case Lot',
        };
      case 'pharmacy':
        return {
          editionName: 'Pharmacy & Healthcare',
          revenueTitle: 'Total Pharmacy Sales',
          todayTitle: "Today's Medicine Counter",
          volumeLabel: 'prescriptions dispensed',
          catalogTitle: 'Medicines & Drug Salts',
          inventorySubtext: 'tablets & bottles in store',
          alertTitle: 'Near-Expiry Batches',
          alertOk: 'All batches within validity',
          alertWarning: 'Expiring in <60 days',
          counterpartyTitle: 'Patients & Customers',
          counterpartySub: 'patient prescription records',
          quickAddTitle: 'Add Medicine / Drug',
          quickAddSub: 'Generic salt & Schedule H',
          quickActionBtn: 'Prescribe & Dispense',
          recentTitle: 'Recent Dispensed Bills',
          recentColCustomer: 'Patient Name',
          recentColDate: 'Dispensed Date',
          recentColAmount: 'Medicine Bill',
          chartRevenueTitle: 'Daily Pharmacy Sales Trend',
          chartCategoryTitle: 'Drug MRP by Category',
        };
      case 'services':
        return {
          editionName: 'Services & Consulting',
          revenueTitle: 'Total Professional Revenue',
          todayTitle: "Today's Billed Retainers",
          volumeLabel: 'service milestones billed',
          catalogTitle: 'Billable Scopes & Rates',
          inventorySubtext: 'sprint hours & retainers',
          alertTitle: 'Pending Milestones',
          alertOk: 'All deliverables on schedule',
          alertWarning: 'Scope reviews pending',
          counterpartyTitle: 'Corporate Clients',
          counterpartySub: 'retained client accounts',
          quickAddTitle: 'Add Billable Scope',
          quickAddSub: 'Hourly rate or retainer',
          quickActionBtn: 'Bill Client Deliverable',
          recentTitle: 'Recent Professional Invoices',
          recentColCustomer: 'Client / Account',
          recentColDate: 'Invoice Date',
          recentColAmount: 'Retainer Billed',
          chartRevenueTitle: 'Client Retainer Inflow',
          chartCategoryTitle: 'Rates by Service Scope',
        };
      case 'manufacturing':
        return {
          editionName: 'Manufacturing & Assembly',
          revenueTitle: 'Total Industrial Revenue',
          todayTitle: "Today's Dispatched Value",
          volumeLabel: 'dispatch orders',
          catalogTitle: 'Finished Assemblies & BOM',
          inventorySubtext: 'assembled units in store',
          alertTitle: 'Raw Material Shortages',
          alertOk: 'Raw materials sufficient',
          alertWarning: 'Component stock low',
          counterpartyTitle: 'Industrial Buyers',
          counterpartySub: 'contract manufacturing buyers',
          quickAddTitle: 'Add Assembly BOM',
          quickAddSub: 'Configure finished assembly',
          quickActionBtn: 'Production Console',
          recentTitle: 'Recent Dispatch Orders',
          recentColCustomer: 'Industrial Buyer',
          recentColDate: 'Order Date',
          recentColAmount: 'Production Value',
          chartRevenueTitle: 'Production Orders Value',
          chartCategoryTitle: 'Assemblies by Unit Cost',
        };
      case 'retail':
      default:
        return {
          editionName: 'Retail Point of Sale',
          revenueTitle: 'Total Revenue',
          todayTitle: "Today's Sales",
          volumeLabel: 'completed sales',
          catalogTitle: 'Products in Catalog',
          inventorySubtext: 'total units in stock',
          alertTitle: 'Low Stock Alerts',
          alertOk: 'All stocks optimal',
          alertWarning: 'Requires reordering',
          counterpartyTitle: 'Customers',
          counterpartySub: 'registered clients',
          quickAddTitle: 'Add New Product',
          quickAddSub: 'Expand your catalog',
          quickActionBtn: 'Counter POS',
          recentTitle: 'Recent Sales Orders',
          recentColCustomer: 'Customer Name',
          recentColDate: 'Sale Date',
          recentColAmount: 'Order Total',
          chartRevenueTitle: 'Sales Revenue Trend',
          chartCategoryTitle: 'Products by Category',
        };
    }
  }, [flowType]);

  // Flow specific metrics
  const wholesaleCreditPending = useMemo(() => {
    return salesRows
      .filter((s) => String(s.payment_method || '').includes('Credit') || s.status === 'credit_pending')
      .reduce((a, b) => a + Number(b.total || 0), 0);
  }, [salesRows]);

  const pharmacyNearExpiryCount = useMemo(() => {
    const saleItemRows = sheets['_SaleItems']?.rows || [];
    const now = new Date().getTime();
    const sixtyDaysMs = 60 * 24 * 60 * 60 * 1000;
    return saleItemRows.filter((item) => {
      if (!item.expiry_date) return false;
      const exp = new Date(item.expiry_date).getTime();
      return exp - now > 0 && exp - now < sixtyDaysMs;
    }).length;
  }, [sheets]);

  const productionMovementsCount = useMemo(() => {
    const movements = sheets['_StockMovements']?.rows || [];
    return movements.filter((m) => String(m.type || '').includes('PRODUCTION') || String(m.type || '').includes('BOM')).length;
  }, [sheets]);

  // Chart 1: Multi-metric Sales & Volume Trend (Date vs Revenue & Order Count)
  const salesTrendOption = useMemo(() => {
    const isDark = theme !== 'light';
    const textColor = isDark ? '#94a3b8' : '#64748b';
    const tooltipBg = isDark ? 'rgba(15, 23, 42, 0.94)' : 'rgba(255, 255, 255, 0.98)';
    const tooltipBorder = isDark ? 'rgba(51, 65, 85, 0.6)' : 'rgba(203, 213, 225, 0.9)';
    const tooltipText = isDark ? '#f8fafc' : '#0f172a';
    const gridLineColor = isDark ? 'rgba(51, 65, 85, 0.2)' : 'rgba(226, 232, 240, 0.8)';

    const dateRevenueMap: Record<string, number> = {};
    const dateOrdersMap: Record<string, number> = {};

    salesRows.forEach((s) => {
      const date = String(s.sale_date || '').split('T')[0];
      if (date) {
        dateRevenueMap[date] = (dateRevenueMap[date] || 0) + Number(s.total || 0);
        dateOrdersMap[date] = (dateOrdersMap[date] || 0) + 1;
      }
    });

    const dates = Object.keys(dateRevenueMap).sort();
    const revenueValues = dates.map((d) => dateRevenueMap[d]);
    const orderValues = dates.map((d) => dateOrdersMap[d]);

    return {
      tooltip: {
        trigger: 'axis',
        backgroundColor: tooltipBg,
        borderColor: tooltipBorder,
        textStyle: { color: tooltipText, fontSize: 12 },
        extraCssText: 'box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1); border-radius: 12px;',
        formatter: (params: any[]) => {
          if (!params || !params.length) return '';
          let res = `<div style="font-weight:700;margin-bottom:4px;color:${textColor}">${params[0].name}</div>`;
          params.forEach((item) => {
            const valStr = item.seriesName === 'Revenue'
              ? formatCurrency(item.value, currency, currencySymbol)
              : `${item.value} orders`;
            res += `<div style="display:flex;align-items:center;justify-content:space-between;gap:16px;margin-top:2px">
              <span style="display:inline-flex;align-items:center;gap:6px">
                <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${item.color}"></span>
                <span>${item.seriesName}</span>
              </span>
              <b style="font-family:monospace">${valStr}</b>
            </div>`;
          });
          return res;
        },
      },
      legend: {
        data: ['Revenue', 'Orders'],
        top: '0%',
        right: '4%',
        textStyle: { color: textColor, fontSize: 11 },
      },
      grid: { left: '3%', right: '4%', bottom: '3%', top: '14%', containLabel: true },
      xAxis: {
        type: 'category',
        data: dates.length ? dates : ['No Sales Yet'],
        axisLine: { lineStyle: { color: isDark ? '#475569' : '#cbd5e1' } },
        axisLabel: { color: textColor, fontSize: 10 },
      },
      yAxis: [
        {
          type: 'value',
          name: 'Revenue',
          nameTextStyle: { color: textColor, fontSize: 10 },
          axisLine: { lineStyle: { color: '#0d9488' } },
          axisLabel: {
            color: textColor,
            fontSize: 10,
            formatter: (val: number) => `${currencySymbol}${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`,
          },
          splitLine: { lineStyle: { color: gridLineColor } },
        },
        {
          type: 'value',
          name: 'Orders',
          nameTextStyle: { color: '#818cf8', fontSize: 10 },
          minInterval: 1,
          axisLine: { lineStyle: { color: '#6366f1' } },
          axisLabel: { color: textColor, fontSize: 10 },
          splitLine: { show: false },
        },
      ],
      series: [
        {
          name: 'Revenue',
          type: 'line',
          yAxisIndex: 0,
          smooth: true,
          showSymbol: true,
          symbolSize: 6,
          lineStyle: { width: 3, color: '#0d9488' },
          itemStyle: { color: '#0d9488' },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(13, 148, 136, 0.4)' },
                { offset: 1, color: 'rgba(13, 148, 136, 0.0)' },
              ],
            },
          },
          data: revenueValues.length ? revenueValues : [0],
        },
        {
          name: 'Orders',
          type: 'bar',
          yAxisIndex: 1,
          barMaxWidth: 22,
          itemStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: '#818cf8' },
                { offset: 1, color: 'rgba(99, 102, 241, 0.3)' },
              ],
            },
            borderRadius: [4, 4, 0, 0],
          },
          data: orderValues.length ? orderValues : [0],
        },
      ],
    };
  }, [salesRows, currency, currencySymbol, theme]);

  // Chart 2: Category Distribution (Rich Multi-Color Donut)
  const categoryOption = useMemo(() => {
    const isDark = theme !== 'light';
    const textColor = isDark ? '#94a3b8' : '#64748b';
    const tooltipBg = isDark ? 'rgba(15, 23, 42, 0.94)' : 'rgba(255, 255, 255, 0.98)';
    const tooltipBorder = isDark ? 'rgba(51, 65, 85, 0.6)' : 'rgba(203, 213, 225, 0.9)';
    const tooltipText = isDark ? '#f8fafc' : '#0f172a';

    const categoryRows = sheets['_Categories']?.rows || [];
    const catCountMap: Record<string, number> = {};

    productRows.forEach((p) => {
      const cat = categoryRows.find((c) => c.category_id === p.category_id);
      const catName = cat?.name || 'Uncategorized';
      catCountMap[catName] = (catCountMap[catName] || 0) + 1;
    });

    const data = Object.entries(catCountMap).map(([name, value]) => ({ name, value }));

    // Vibrant, balanced multi-color palette
    const VIBRANT_PALETTE = [
      '#0d9488', // Teal
      '#6366f1', // Indigo
      '#f59e0b', // Amber
      '#ec4899', // Pink
      '#3b82f6', // Blue
      '#10b981', // Emerald
      '#8b5cf6', // Violet
      '#06b6d4', // Cyan
      '#f97316', // Orange
      '#14b8a6', // Light Teal
    ];

    return {
      tooltip: {
        trigger: 'item',
        backgroundColor: tooltipBg,
        borderColor: tooltipBorder,
        textStyle: { color: tooltipText, fontSize: 12 },
        extraCssText: 'box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.2); border-radius: 12px;',
        formatter: (item: any) => {
          return `<div style="font-weight:700;margin-bottom:2px">${item.name}</div>
            <div style="font-family:monospace">${item.value} products (${item.percent}%)</div>`;
        },
      },
      legend: {
        bottom: '0%',
        type: 'scroll',
        textStyle: { color: textColor, fontSize: 11 },
        pageTextStyle: { color: textColor },
      },
      color: VIBRANT_PALETTE,
      series: [
        {
          name: 'Categories',
          type: 'pie',
          radius: ['45%', '72%'],
          avoidLabelOverlap: true,
          itemStyle: {
            borderRadius: 6,
            borderColor: isDark ? 'rgba(15, 23, 42, 0.7)' : '#ffffff',
            borderWidth: 2,
          },
          label: {
            show: false,
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 12,
              fontWeight: 'bold',
              color: isDark ? '#f8fafc' : '#0f172a',
            },
          },
          data: data.length ? data : [{ name: 'No Categories', value: 1 }],
        },
      ],
    };
  }, [productRows, sheets, theme]);

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* Top Banner: Quick Summary & Quick POS button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-primary/15 via-primary/5 to-transparent border border-primary/25 rounded-2xl p-5 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-foreground">
              {appConfig?.businessName || 'Business Dashboard'}
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-primary/20 text-primary font-bold">
              Live Workbook
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-muted/80 border border-border text-foreground font-semibold flex items-center gap-1.5">
              {flowType === 'wholesale' && <Truck className="h-3 w-3 text-indigo-400" />}
              {flowType === 'pharmacy' && <Stethoscope className="h-3 w-3 text-emerald-400" />}
              {flowType === 'services' && <Briefcase className="h-3 w-3 text-amber-400" />}
              {flowType === 'manufacturing' && <Factory className="h-3 w-3 text-cyan-400" />}
              {flowType === 'taxi' && <Car className="h-3 w-3 text-amber-400" />}
              {flowType === 'hotel' && <Hotel className="h-3 w-3 text-blue-400" />}
              {flowType === 'school' && <GraduationCap className="h-3 w-3 text-emerald-400" />}
              {flowType === 'coaching' && <BookOpen className="h-3 w-3 text-purple-400" />}
              {flowType === 'payroll' && <BadgeDollarSign className="h-3 w-3 text-teal-400" />}
              {flowType === 'gym' && <Dumbbell className="h-3 w-3 text-orange-400" />}
              {flowType === 'hospital' && <Activity className="h-3 w-3 text-rose-400" />}
              {flowType === 'restaurant' && <Utensils className="h-3 w-3 text-amber-500" />}
              {flowType === 'realestate' && <Home className="h-3 w-3 text-blue-400" />}
              {flowType === 'garage' && <Wrench className="h-3 w-3 text-orange-400" />}
              {flowType === 'salon' && <Sparkles className="h-3 w-3 text-pink-400" />}
              {flowType === 'retail' && <Store className="h-3 w-3 text-primary" />}
              <span>{appConfig?.businessType || dashboardMeta.editionName} Edition</span>
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            All metrics reflect your single Excel workbook in real time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => openModal('chart_builder')}
            className="flex items-center gap-2 px-3 py-2 text-xs bg-muted/60 hover:bg-muted text-foreground border border-border rounded-xl transition font-medium"
          >
            <Sparkles className="h-4 w-4 text-primary" />
            <span>Chart Builder</span>
          </button>

          <button
            onClick={() => setActiveSheet('new_sale')}
            className="flex items-center gap-2 px-4 py-2 text-xs bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-md teal-glow transition font-bold"
          >
            {flowType === 'pharmacy' && <Stethoscope className="h-4 w-4" />}
            {flowType === 'wholesale' && <Truck className="h-4 w-4" />}
            {flowType === 'services' && <Briefcase className="h-4 w-4" />}
            {flowType === 'manufacturing' && <Factory className="h-4 w-4" />}
            {flowType === 'taxi' && <Car className="h-4 w-4" />}
            {flowType === 'hotel' && <Hotel className="h-4 w-4" />}
            {flowType === 'school' && <GraduationCap className="h-4 w-4" />}
            {flowType === 'coaching' && <BookOpen className="h-4 w-4" />}
            {flowType === 'payroll' && <BadgeDollarSign className="h-4 w-4" />}
            {flowType === 'gym' && <Dumbbell className="h-4 w-4" />}
            {flowType === 'hospital' && <Activity className="h-4 w-4" />}
            {flowType === 'restaurant' && <Utensils className="h-4 w-4" />}
            {flowType === 'realestate' && <Home className="h-4 w-4" />}
            {flowType === 'garage' && <Wrench className="h-4 w-4" />}
            {flowType === 'salon' && <Sparkles className="h-4 w-4" />}
            {flowType === 'retail' && <ShoppingCart className="h-4 w-4" />}
            <span>{dashboardMeta.quickActionBtn}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Flow-Specific Highlight Card */}
        {flowType === 'wholesale' && (
          <div className="bg-gradient-to-br from-indigo-500/15 via-card to-card border border-indigo-500/30 rounded-2xl p-4 shadow-sm hover:border-indigo-500/50 transition">
            <div className="flex items-center justify-between text-muted-foreground mb-2">
              <span className="text-xs font-semibold">B2B Credit Receivables</span>
              <div className="p-2 rounded-xl bg-indigo-500/15 text-indigo-400">
                <Truck className="h-4 w-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-indigo-400 font-mono">
              {formatCurrency(wholesaleCreditPending, currency, currencySymbol)}
            </div>
            <div className="text-[11px] text-muted-foreground mt-1">Pending Net terms collection</div>
          </div>
        )}

        {flowType === 'pharmacy' && (
          <div className="bg-gradient-to-br from-amber-500/15 via-card to-card border border-amber-500/30 rounded-2xl p-4 shadow-sm hover:border-amber-500/50 transition">
            <div className="flex items-center justify-between text-muted-foreground mb-2">
              <span className="text-xs font-semibold">Near-Expiry Batches</span>
              <div className="p-2 rounded-xl bg-amber-500/15 text-amber-500">
                <Stethoscope className="h-4 w-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-amber-500 font-mono">
              {pharmacyNearExpiryCount}
            </div>
            <div className="text-[11px] text-muted-foreground mt-1">Batches expiring in &lt;60 days</div>
          </div>
        )}

        {flowType === 'services' && (
          <div className="bg-gradient-to-br from-amber-500/15 via-card to-card border border-amber-500/30 rounded-2xl p-4 shadow-sm hover:border-amber-500/50 transition">
            <div className="flex items-center justify-between text-muted-foreground mb-2">
              <span className="text-xs font-semibold">Service Deliverables</span>
              <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400">
                <Briefcase className="h-4 w-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-amber-400 font-mono">
              {salesRows.length}
            </div>
            <div className="text-[11px] text-muted-foreground mt-1">Active client contracts billed</div>
          </div>
        )}

        {flowType === 'manufacturing' && (
          <div className="bg-gradient-to-br from-cyan-500/15 via-card to-card border border-cyan-500/30 rounded-2xl p-4 shadow-sm hover:border-cyan-500/50 transition">
            <div className="flex items-center justify-between text-muted-foreground mb-2">
              <span className="text-xs font-semibold">BOM Production Runs</span>
              <div className="p-2 rounded-xl bg-cyan-500/15 text-cyan-400">
                <Factory className="h-4 w-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-cyan-400 font-mono">
              {productionMovementsCount}
            </div>
            <div className="text-[11px] text-muted-foreground mt-1">Assembly batches recorded</div>
          </div>
        )}

        {flowType === 'taxi' && (
          <div className="bg-gradient-to-br from-amber-500/15 via-card to-card border border-amber-500/30 rounded-2xl p-4 shadow-sm hover:border-amber-500/50 transition">
            <div className="flex items-center justify-between text-muted-foreground mb-2">
              <span className="text-xs font-semibold">Dispatched Trips</span>
              <div className="p-2 rounded-xl bg-amber-500/15 text-amber-500">
                <Car className="h-4 w-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-amber-500 font-mono">
              {salesRows.length}
            </div>
            <div className="text-[11px] text-muted-foreground mt-1">Passenger cab rides logged</div>
          </div>
        )}

        {flowType === 'hotel' && (
          <div className="bg-gradient-to-br from-blue-500/15 via-card to-card border border-blue-500/30 rounded-2xl p-4 shadow-sm hover:border-blue-500/50 transition">
            <div className="flex items-center justify-between text-muted-foreground mb-2">
              <span className="text-xs font-semibold">Stay Reservations</span>
              <div className="p-2 rounded-xl bg-blue-500/15 text-blue-400">
                <Hotel className="h-4 w-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-blue-400 font-mono">
              {salesRows.length}
            </div>
            <div className="text-[11px] text-muted-foreground mt-1">Guest check-in folios settled</div>
          </div>
        )}

        {flowType === 'school' && (
          <div className="bg-gradient-to-br from-emerald-500/15 via-card to-card border border-emerald-500/30 rounded-2xl p-4 shadow-sm hover:border-emerald-500/50 transition">
            <div className="flex items-center justify-between text-muted-foreground mb-2">
              <span className="text-xs font-semibold">Term Fee Receipts</span>
              <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400">
                <GraduationCap className="h-4 w-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-emerald-400 font-mono">
              {salesRows.length}
            </div>
            <div className="text-[11px] text-muted-foreground mt-1">Student tuition collections</div>
          </div>
        )}

        {flowType === 'coaching' && (
          <div className="bg-gradient-to-br from-purple-500/15 via-card to-card border border-purple-500/30 rounded-2xl p-4 shadow-sm hover:border-purple-500/50 transition">
            <div className="flex items-center justify-between text-muted-foreground mb-2">
              <span className="text-xs font-semibold">Course Installments</span>
              <div className="p-2 rounded-xl bg-purple-500/15 text-purple-400">
                <BookOpen className="h-4 w-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-purple-400 font-mono">
              {salesRows.length}
            </div>
            <div className="text-[11px] text-muted-foreground mt-1">Tuition installments paid</div>
          </div>
        )}

        {flowType === 'payroll' && (
          <div className="bg-gradient-to-br from-teal-500/15 via-card to-card border border-teal-500/30 rounded-2xl p-4 shadow-sm hover:border-teal-500/50 transition">
            <div className="flex items-center justify-between text-muted-foreground mb-2">
              <span className="text-xs font-semibold">Payslips Issued</span>
              <div className="p-2 rounded-xl bg-teal-500/15 text-teal-400">
                <BadgeDollarSign className="h-4 w-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-teal-400 font-mono">
              {salesRows.length}
            </div>
            <div className="text-[11px] text-muted-foreground mt-1">Employee pay runs completed</div>
          </div>
        )}

        {flowType === 'gym' && (
          <div className="bg-gradient-to-br from-orange-500/15 via-card to-card border border-orange-500/30 rounded-2xl p-4 shadow-sm hover:border-orange-500/50 transition">
            <div className="flex items-center justify-between text-muted-foreground mb-2">
              <span className="text-xs font-semibold">Active Memberships</span>
              <div className="p-2 rounded-xl bg-orange-500/15 text-orange-400">
                <Dumbbell className="h-4 w-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-orange-400 font-mono">
              {salesRows.length}
            </div>
            <div className="text-[11px] text-muted-foreground mt-1">Gym passes & renewals issued</div>
          </div>
        )}

        {flowType === 'hospital' && (
          <div className="bg-gradient-to-br from-rose-500/15 via-card to-card border border-rose-500/30 rounded-2xl p-4 shadow-sm hover:border-rose-500/50 transition">
            <div className="flex items-center justify-between text-muted-foreground mb-2">
              <span className="text-xs font-semibold">Clinical Encounters</span>
              <div className="p-2 rounded-xl bg-rose-500/15 text-rose-400">
                <Activity className="h-4 w-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-rose-400 font-mono">
              {salesRows.length}
            </div>
            <div className="text-[11px] text-muted-foreground mt-1">OPD patients examined & billed</div>
          </div>
        )}

        {flowType === 'restaurant' && (
          <div className="bg-gradient-to-br from-amber-500/15 via-card to-card border border-amber-500/30 rounded-2xl p-4 shadow-sm hover:border-amber-500/50 transition">
            <div className="flex items-center justify-between text-muted-foreground mb-2">
              <span className="text-xs font-semibold">Table Orders (KOT)</span>
              <div className="p-2 rounded-xl bg-amber-500/15 text-amber-500">
                <Utensils className="h-4 w-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-amber-500 font-mono">
              {salesRows.length}
            </div>
            <div className="text-[11px] text-muted-foreground mt-1">Dine-in table orders billed</div>
          </div>
        )}

        {flowType === 'realestate' && (
          <div className="bg-gradient-to-br from-blue-500/15 via-card to-card border border-blue-500/30 rounded-2xl p-4 shadow-sm hover:border-blue-500/50 transition">
            <div className="flex items-center justify-between text-muted-foreground mb-2">
              <span className="text-xs font-semibold">Active Tenancy Leases</span>
              <div className="p-2 rounded-xl bg-blue-500/15 text-blue-400">
                <Home className="h-4 w-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-blue-400 font-mono">
              {customerRows.length}
            </div>
            <div className="text-[11px] text-muted-foreground mt-1">Contracted rental tenants</div>
          </div>
        )}

        {flowType === 'garage' && (
          <div className="bg-gradient-to-br from-orange-500/15 via-card to-card border border-orange-500/30 rounded-2xl p-4 shadow-sm hover:border-orange-500/50 transition">
            <div className="flex items-center justify-between text-muted-foreground mb-2">
              <span className="text-xs font-semibold">Workshop Job Cards</span>
              <div className="p-2 rounded-xl bg-orange-500/15 text-orange-500">
                <Wrench className="h-4 w-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-orange-500 font-mono">
              {salesRows.length}
            </div>
            <div className="text-[11px] text-muted-foreground mt-1">Repairs completed & delivered</div>
          </div>
        )}

        {flowType === 'salon' && (
          <div className="bg-gradient-to-br from-pink-500/15 via-card to-card border border-pink-500/30 rounded-2xl p-4 shadow-sm hover:border-pink-500/50 transition">
            <div className="flex items-center justify-between text-muted-foreground mb-2">
              <span className="text-xs font-semibold">Styling Appointments</span>
              <div className="p-2 rounded-xl bg-pink-500/15 text-pink-400">
                <Sparkles className="h-4 w-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-pink-400 font-mono">
              {salesRows.length}
            </div>
            <div className="text-[11px] text-muted-foreground mt-1">Sessions billed & completed</div>
          </div>
        )}

        {/* Total Sales */}
        <div className="bg-gradient-to-br from-primary/10 via-card to-card border border-primary/30 rounded-2xl p-4 shadow-sm hover:teal-glow-sm hover:border-primary/50 transition">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-semibold">{dashboardMeta.revenueTitle}</span>
            <div className="p-2 rounded-xl bg-primary/15 text-primary">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-foreground font-mono">
            {formatCurrency(totalRevenue, currency, currencySymbol)}
          </div>
          <div className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
            <span className="font-semibold text-primary">{salesRows.length}</span>
            <span>{dashboardMeta.volumeLabel}</span>
          </div>
        </div>

        {/* Today's Sales */}
        <div className="bg-gradient-to-br from-emerald-500/10 via-card to-card border border-emerald-500/20 rounded-2xl p-4 shadow-sm hover:border-emerald-500/40 transition">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-semibold">{dashboardMeta.todayTitle}</span>
            <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-500">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-foreground font-mono">
            {formatCurrency(todayRevenue, currency, currencySymbol)}
          </div>
          <div className="text-[11px] text-emerald-500 mt-1 flex items-center gap-1 font-semibold">
            <ArrowUpRight className="h-3 w-3" />
            <span>Today's counter</span>
          </div>
        </div>

        {/* Products & Inventory */}
        <div className="bg-card border border-border rounded-2xl p-4 shadow-sm hover:border-primary/40 transition">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-semibold">{dashboardMeta.catalogTitle}</span>
            <div className="p-2 rounded-xl bg-teal-500/15 text-teal-600 dark:text-teal-400">
              <Package className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-foreground font-mono">{productRows.length}</div>
          <div className="text-[11px] text-muted-foreground mt-1">
            <span className="font-semibold text-foreground">{inventoryRows.reduce((a, b) => a + Number(b.quantity || 0), 0)}</span> {dashboardMeta.inventorySubtext}
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="bg-gradient-to-br from-amber-500/10 via-card to-card border border-amber-500/30 rounded-2xl p-4 shadow-sm hover:border-amber-500/50 transition">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-semibold">{dashboardMeta.alertTitle}</span>
            <div className="p-2 rounded-xl bg-amber-500/15 text-amber-500">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-amber-500 font-mono">{lowStockItems.length}</div>
          <div className="text-[11px] text-amber-500/80 mt-1 font-medium">
            {lowStockItems.length === 0 ? dashboardMeta.alertOk : dashboardMeta.alertWarning}
          </div>
        </div>

        {/* Total Customers */}
        <div className="bg-card border border-border rounded-2xl p-4 shadow-sm hover:border-primary/40 transition">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-semibold">{dashboardMeta.counterpartyTitle}</span>
            <div className="p-2 rounded-xl bg-purple-500/15 text-purple-500">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-foreground font-mono">{customerRows.length}</div>
          <div className="text-[11px] text-muted-foreground mt-1">{dashboardMeta.counterpartySub}</div>
        </div>

        {/* Total Expenses */}
        <div className="bg-card border border-border rounded-2xl p-4 shadow-sm hover:border-primary/40 transition">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-semibold">Total Expenses</span>
            <div className="p-2 rounded-xl bg-rose-500/15 text-rose-500">
              <Wallet className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-foreground font-mono">
            {formatCurrency(totalExpenses, currency, currencySymbol)}
          </div>
          <div className="text-[11px] text-muted-foreground mt-1">
            <span className="font-semibold text-foreground">{expenseRows.length}</span> recorded entries
          </div>
        </div>

        {/* Net Profit Estimate */}
        <div className="bg-gradient-to-br from-teal-500/15 via-card to-card border border-teal-500/30 rounded-2xl p-4 shadow-sm hover:teal-glow-sm transition">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-semibold">Net Operating Surplus (Est.)</span>
            <div className="p-2 rounded-xl bg-teal-500/15 text-teal-600 dark:text-teal-400">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-teal-600 dark:text-teal-400 font-mono">
            {formatCurrency(Math.max(0, totalRevenue - totalExpenses), currency, currencySymbol)}
          </div>
          <div className="text-[11px] text-muted-foreground mt-1">Revenue minus expenses</div>
        </div>

        {/* Quick Add Product */}
        <div
          onClick={() => {
            setTargetRecord({ sheetName: '_Products', mode: 'add' });
            setActiveSheet('record_form');
          }}
          className="bg-card/60 border-2 border-dashed border-primary/30 rounded-2xl p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary hover:bg-primary/5 hover:teal-glow-sm transition group"
        >
          <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center mb-1 group-hover:scale-110 transition text-primary">
            <PlusCircle className="h-5 w-5" />
          </div>
          <span className="text-xs font-bold text-foreground group-hover:text-primary transition">{dashboardMeta.quickAddTitle}</span>
          <span className="text-[10px] text-muted-foreground">{dashboardMeta.quickAddSub}</span>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Trend Line Chart */}
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-foreground">{dashboardMeta.chartRevenueTitle}</h3>
              <p className="text-xs text-muted-foreground">Track daily performance</p>
            </div>
            <button
              onClick={() => setActiveSheet('_Sales')}
              className="text-xs text-primary hover:underline font-semibold flex items-center gap-1"
            >
              <span>View History</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          <div className="h-72 w-full">
            <ReactECharts option={salesTrendOption} style={{ height: '100%', width: '100%' }} />
          </div>
        </div>

        {/* Product Category Distribution Donut */}
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-foreground">{dashboardMeta.chartCategoryTitle}</h3>
              <p className="text-xs text-muted-foreground">Catalog & tariff breakdown</p>
            </div>
            <button
              onClick={() => setActiveSheet('_Categories')}
              className="text-xs text-primary hover:underline font-semibold flex items-center gap-1"
            >
              <span>Manage</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          <div className="h-72 w-full">
            <ReactECharts option={categoryOption} style={{ height: '100%', width: '100%' }} />
          </div>
        </div>
      </div>

      {/* Recent Activity Feeds */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Sales Table */}
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-bold text-foreground">{dashboardMeta.recentTitle}</h3>
            </div>
            <button
              onClick={() => setActiveSheet('_Sales')}
              className="text-xs text-primary hover:underline font-medium"
            >
              View All ({salesRows.length})
            </button>
          </div>

          <div className="overflow-x-auto">
            {recentSales.length === 0 ? (
              <div className="text-center py-8 text-xs text-muted-foreground">
                No transactions recorded yet. Click "{dashboardMeta.quickActionBtn}" above!
              </div>
            ) : (
              <div className="border border-border/80 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-muted/40 border-b border-border/80 font-bold text-foreground">
                    <tr>
                      <th className="py-2.5 px-3 border-r border-border/60">{dashboardMeta.recentColCustomer}</th>
                      <th className="py-2.5 px-3 border-r border-border/60">{dashboardMeta.recentColDate}</th>
                      <th className="py-2.5 px-3 border-r border-border/60">Payment Method</th>
                      <th className="py-2.5 px-3 border-r border-border/60 text-right">{dashboardMeta.recentColAmount}</th>
                      <th className="py-2.5 px-3 text-center w-16">Invoice</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {recentSales.map((sale) => (
                      <tr key={sale.id} className="even:bg-muted/10 odd:bg-card hover:bg-primary/5 transition">
                        <td className="py-2 px-3 font-semibold text-foreground border-r border-border/60">{sale.customerName}</td>
                        <td className="py-2 px-3 text-muted-foreground border-r border-border/60">{formatDate(sale.date)}</td>
                        <td className="py-2 px-3 border-r border-border/60">
                          <span className="px-2 py-0.5 rounded-full text-[10px] bg-primary/10 text-primary font-bold">
                            {sale.paymentMethod}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-foreground border-r border-border/60">
                          {formatCurrency(sale.amount, currency, currencySymbol)}
                        </td>
                        <td className="py-2 px-3 text-center">
                          <button
                            onClick={() => openModal('invoice_preview', { saleId: sale.id })}
                            className="p-1 text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/15 rounded-md transition inline-flex items-center justify-center"
                            title="View / Print Tax Invoice"
                          >
                            <Printer className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Low Stock Alert Feed */}
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-500">
              <AlertTriangle className="h-4 w-4" />
              <h3 className="text-sm font-bold text-foreground">Low Stock Warnings</h3>
            </div>
            <button
              onClick={() => setActiveSheet('_Inventory')}
              className="text-xs text-primary hover:underline font-semibold flex items-center gap-1"
            >
              <span>Inventory Manager</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          <div>
            {lowStockItems.length === 0 ? (
              <div className="flex items-center gap-3 p-4 rounded-xl border border-primary/20 bg-primary/5 text-xs text-foreground">
                <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                <div>
                  <div className="font-semibold text-foreground">Healthy Inventory Levels</div>
                  <div className="text-[11px] text-muted-foreground">All catalog products are operating above minimum safety stock thresholds.</div>
                </div>
              </div>
            ) : (
              <div className="border border-border/80 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-muted/40 border-b border-border/80 font-bold text-foreground">
                    <tr>
                      <th className="py-2.5 px-3 border-r border-border/60">Product</th>
                      <th className="py-2.5 px-3 border-r border-border/60">SKU</th>
                      <th className="py-2.5 px-3 border-r border-border/60 text-right">In Stock</th>
                      <th className="py-2.5 px-3 text-right">Min Stock</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {lowStockItems.slice(0, 5).map((item) => (
                      <tr key={item.id} className="even:bg-muted/10 odd:bg-card hover:bg-primary/5 transition">
                        <td className="py-2 px-3 font-semibold text-foreground border-r border-border/60">{item.name}</td>
                        <td className="py-2 px-3 text-muted-foreground font-mono border-r border-border/60">{item.sku}</td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-amber-500 border-r border-border/60">
                          {item.quantity}
                        </td>
                        <td className="py-2 px-3 text-right font-mono text-muted-foreground">
                          {item.minStock}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
