import React, { useState, useMemo } from 'react';
import { useWorkbookStore } from '../../stores/workbookStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { formatCurrency } from '../../lib/utils';
import { getBusinessFlowType } from '../../types';
import { getBusinessTerminology } from '../../lib/businessTerminology';
import {
  Sparkles,
  TrendingUp,
  DollarSign,
  Users,
  ArrowUpRight,
  BarChart3
} from 'lucide-react';
import ReactECharts from 'echarts-for-react';

export const AnalyticsView: React.FC = () => {
  const { sheets, appConfig } = useWorkbookStore();
  const { theme } = useSettingsStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'sales' | 'inventory' | 'customers' | 'products'>('overview');

  const flowType = getBusinessFlowType(appConfig?.businessType);
  const salesMeta = useMemo(() => getBusinessTerminology(flowType, '_Sales'), [flowType]);
  const invMeta = useMemo(() => getBusinessTerminology(flowType, '_Inventory'), [flowType]);
  const prodMeta = useMemo(() => getBusinessTerminology(flowType, '_Products'), [flowType]);
  const custMeta = useMemo(() => getBusinessTerminology(flowType, '_Customers'), [flowType]);

  const currencySymbol = appConfig?.currencySymbol || '₹';
  const currency = appConfig?.currency || 'INR';

  const salesRows = sheets['_Sales']?.rows || [];
  const productRows = sheets['_Products']?.rows || [];
  const inventoryRows = sheets['_Inventory']?.rows || [];
  const customerRows = sheets['_Customers']?.rows || [];
  const saleItemRows = sheets['_SaleItems']?.rows || [];
  const categoryRows = sheets['_Categories']?.rows || [];

  // Metrics
  const totalRevenue = useMemo(() => salesRows.reduce((a, b) => a + Number(b.total || 0), 0), [salesRows]);
  const aov = useMemo(() => (salesRows.length ? totalRevenue / salesRows.length : 0), [salesRows, totalRevenue]);

  // Inventory valuation: sum of (purchase_price * current_stock)
  const totalInventoryValuation = useMemo(() => {
    return inventoryRows.reduce((acc, inv) => {
      const prod = productRows.find((p) => p.product_id === inv.product_id);
      const cost = Number(prod?.purchase_price || prod?.selling_price || 0);
      const qty = Number(inv.quantity || 0);
      return acc + cost * qty;
    }, 0);
  }, [inventoryRows, productRows]);

  // Multi-color curated palette
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

  // Sales by payment method chart (Multi-color donut)
  const paymentMethodOption = useMemo(() => {
    const isDark = theme !== 'light';
    const textColor = isDark ? '#94a3b8' : '#64748b';
    const tooltipBg = isDark ? 'rgba(15, 23, 42, 0.94)' : 'rgba(255, 255, 255, 0.98)';
    const tooltipBorder = isDark ? 'rgba(51, 65, 85, 0.6)' : 'rgba(203, 213, 225, 0.9)';
    const tooltipText = isDark ? '#f8fafc' : '#0f172a';

    const counts: Record<string, number> = {};
    salesRows.forEach((s) => {
      const method = s.payment_method || 'Cash';
      counts[method] = (counts[method] || 0) + Number(s.total || 0);
    });

    return {
      tooltip: {
        trigger: 'item',
        backgroundColor: tooltipBg,
        borderColor: tooltipBorder,
        textStyle: { color: tooltipText, fontSize: 12 },
        extraCssText: 'box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.2); border-radius: 12px;',
        formatter: (item: any) => {
          return `<div style="font-weight:700;margin-bottom:2px">${item.name}</div>
            <div style="font-family:monospace">${formatCurrency(item.value, currency, currencySymbol)} (${item.percent}%)</div>`;
        },
      },
      legend: {
        bottom: '0%',
        type: 'scroll',
        textStyle: { color: textColor, fontSize: 11 },
      },
      color: VIBRANT_PALETTE,
      series: [
        {
          name: 'Payment Methods',
          type: 'pie',
          radius: ['42%', '70%'],
          itemStyle: {
            borderRadius: 6,
            borderColor: isDark ? 'rgba(15, 23, 42, 0.6)' : '#ffffff',
            borderWidth: 2,
          },
          data: Object.entries(counts).map(([name, value]) => ({ name, value })),
        },
      ],
    };
  }, [salesRows, currency, currencySymbol, theme]);

  // Top products by revenue
  const topProducts = useMemo(() => {
    const prodRevenueMap: Record<string, { name: string; revenue: number; qty: number }> = {};
    saleItemRows.forEach((item) => {
      const prodId = item.product_id;
      const lineTotal = Number(item.line_total || 0);
      const qty = Number(item.quantity || 0);
      const prod = productRows.find((p) => p.product_id === prodId);

      if (!prodRevenueMap[prodId]) {
        prodRevenueMap[prodId] = {
          name: prod?.name || prodId,
          revenue: 0,
          qty: 0,
        };
      }
      prodRevenueMap[prodId].revenue += lineTotal;
      prodRevenueMap[prodId].qty += qty;
    });

    return Object.values(prodRevenueMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  }, [saleItemRows, productRows]);

  // Top products bar chart option (Each bar with its own vibrant color)
  const topProductsChartOption = useMemo(() => {
    const isDark = theme !== 'light';
    const textColor = isDark ? '#94a3b8' : '#64748b';
    const tooltipBg = isDark ? 'rgba(15, 23, 42, 0.94)' : 'rgba(255, 255, 255, 0.98)';
    const tooltipBorder = isDark ? 'rgba(51, 65, 85, 0.6)' : 'rgba(203, 213, 225, 0.9)';
    const tooltipText = isDark ? '#f8fafc' : '#0f172a';
    const gridLineColor = isDark ? 'rgba(51, 65, 85, 0.2)' : 'rgba(226, 232, 240, 0.8)';

    return {
      tooltip: {
        trigger: 'axis',
        backgroundColor: tooltipBg,
        borderColor: tooltipBorder,
        textStyle: { color: tooltipText, fontSize: 12 },
        extraCssText: 'box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.2); border-radius: 12px;',
        formatter: (params: any[]) => {
          if (!params.length) return '';
          const p = params[0];
          return `<div style="font-weight:700;margin-bottom:2px">${p.name}</div>
            <div style="font-family:monospace">Revenue: <b>${formatCurrency(p.value, currency, currencySymbol)}</b></div>`;
        },
      },
      grid: { left: '3%', right: '4%', bottom: '8%', top: '6%', containLabel: true },
      xAxis: {
        type: 'category',
        data: topProducts.map((p) => p.name.length > 14 ? p.name.substring(0, 12) + '...' : p.name),
        axisLine: { lineStyle: { color: isDark ? '#475569' : '#cbd5e1' } },
        axisLabel: { color: textColor, fontSize: 10, interval: 0, rotate: 15 },
      },
      yAxis: {
        type: 'value',
        axisLine: { lineStyle: { color: isDark ? '#475569' : '#cbd5e1' } },
        axisLabel: {
          color: textColor,
          fontSize: 10,
          formatter: (val: number) => `${currencySymbol}${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`,
        },
        splitLine: { lineStyle: { color: gridLineColor } },
      },
      series: [
        {
          type: 'bar',
          data: topProducts.map((p) => p.revenue),
          itemStyle: {
            borderRadius: [6, 6, 0, 0],
            color: (params: any) => VIBRANT_PALETTE[params.dataIndex % VIBRANT_PALETTE.length],
          },
        },
      ],
    };
  }, [topProducts, currency, currencySymbol, theme]);

  // Inventory Stock Health Donut Chart
  const stockHealthOption = useMemo(() => {
    const isDark = theme !== 'light';
    const textColor = isDark ? '#94a3b8' : '#64748b';
    const tooltipBg = isDark ? 'rgba(15, 23, 42, 0.94)' : 'rgba(255, 255, 255, 0.98)';
    const tooltipBorder = isDark ? 'rgba(51, 65, 85, 0.6)' : 'rgba(203, 213, 225, 0.9)';
    const tooltipText = isDark ? '#f8fafc' : '#0f172a';

    let healthyCount = 0;
    let lowCount = 0;
    let outCount = 0;

    inventoryRows.forEach((inv) => {
      const qty = Number(inv.quantity || 0);
      const min = Number(inv.minimum_stock || 5);
      if (qty === 0) outCount++;
      else if (qty <= min) lowCount++;
      else healthyCount++;
    });

    return {
      tooltip: {
        trigger: 'item',
        backgroundColor: tooltipBg,
        borderColor: tooltipBorder,
        textStyle: { color: tooltipText, fontSize: 12 },
        extraCssText: 'box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.2); border-radius: 12px;',
      },
      legend: { bottom: '0%', textStyle: { color: textColor, fontSize: 11 } },
      color: ['#10b981', '#f59e0b', '#f43f5e'],
      series: [
        {
          name: 'Stock Health',
          type: 'pie',
          radius: ['45%', '72%'],
          itemStyle: {
            borderRadius: 6,
            borderColor: isDark ? 'rgba(15, 23, 42, 0.6)' : '#ffffff',
            borderWidth: 2,
          },
          data: [
            { name: 'Optimal Stock', value: healthyCount },
            { name: 'Low Stock Alert', value: lowCount },
            { name: 'Out of Stock', value: outCount },
          ],
        },
      ],
    };
  }, [inventoryRows, theme]);

  // Product Margin Comparison Chart
  const productMarginsChartOption = useMemo(() => {
    const isDark = theme !== 'light';
    const textColor = isDark ? '#94a3b8' : '#64748b';
    const tooltipBg = isDark ? 'rgba(15, 23, 42, 0.94)' : 'rgba(255, 255, 255, 0.98)';
    const tooltipBorder = isDark ? 'rgba(51, 65, 85, 0.6)' : 'rgba(203, 213, 225, 0.9)';
    const tooltipText = isDark ? '#f8fafc' : '#0f172a';
    const gridLineColor = isDark ? 'rgba(51, 65, 85, 0.2)' : 'rgba(226, 232, 240, 0.8)';

    const topMarginProducts = productRows.slice(0, 8);
    const names = topMarginProducts.map((p) => p.name.length > 12 ? p.name.substring(0, 10) + '...' : p.name);
    const costData = topMarginProducts.map((p) => Number(p.purchase_price || 0));
    const priceData = topMarginProducts.map((p) => Number(p.selling_price || 0));

    return {
      tooltip: {
        trigger: 'axis',
        backgroundColor: tooltipBg,
        borderColor: tooltipBorder,
        textStyle: { color: tooltipText, fontSize: 12 },
        extraCssText: 'box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.2); border-radius: 12px;',
        formatter: (params: any[]) => {
          if (!params.length) return '';
          let res = `<div style="font-weight:700;margin-bottom:4px">${params[0].name}</div>`;
          params.forEach((item) => {
            res += `<div style="display:flex;justify-content:space-between;gap:12px;margin-top:2px">
              <span style="color:${item.color}">${item.seriesName}:</span>
              <b style="font-family:monospace">${formatCurrency(item.value, currency, currencySymbol)}</b>
            </div>`;
          });
          return res;
        },
      },
      legend: {
        data: ['Cost Price', 'Selling Price'],
        top: '0%',
        textStyle: { color: textColor, fontSize: 11 },
      },
      grid: { left: '3%', right: '4%', bottom: '8%', top: '14%', containLabel: true },
      xAxis: {
        type: 'category',
        data: names,
        axisLine: { lineStyle: { color: isDark ? '#475569' : '#cbd5e1' } },
        axisLabel: { color: textColor, fontSize: 10 },
      },
      yAxis: {
        type: 'value',
        axisLine: { lineStyle: { color: isDark ? '#475569' : '#cbd5e1' } },
        axisLabel: {
          color: textColor,
          fontSize: 10,
          formatter: (val: number) => `${currencySymbol}${val}`,
        },
        splitLine: { lineStyle: { color: gridLineColor } },
      },
      series: [
        {
          name: 'Cost Price',
          type: 'bar',
          data: costData,
          itemStyle: { color: '#6366f1', borderRadius: [4, 4, 0, 0] },
        },
        {
          name: 'Selling Price',
          type: 'bar',
          data: priceData,
          itemStyle: { color: '#0d9488', borderRadius: [4, 4, 0, 0] },
        },
      ],
    };
  }, [productRows, currency, currencySymbol, theme]);

  // Business Edition Intelligence Meta
  const editionAnalyticsMeta = useMemo(() => {
    switch (flowType) {
      case 'taxi':
        return {
          title: 'Taxi & Cab Fleet Intelligence',
          kpi1Label: 'Total Dispatched Trips',
          kpi1Val: salesRows.length,
          kpi2Label: 'Avg Fare Realization',
          kpi2Val: aov,
          kpi3Label: 'Fleet Active Cabs',
          kpi3Val: productRows.length,
          kpi4Label: 'Registered Passengers',
          kpi4Val: customerRows.length,
          chart1Title: 'Fare Revenue by Cab Category & Slab',
          chart2Title: 'Trip Settlement Channels',
        };
      case 'hotel':
        return {
          title: 'Hotel & Hospitality Intelligence',
          kpi1Label: 'Stay Folios Billed',
          kpi1Val: salesRows.length,
          kpi2Label: 'Avg Stay Folio Value',
          kpi2Val: aov,
          kpi3Label: 'Room Categories in Portfolio',
          kpi3Val: productRows.length,
          kpi4Label: 'Registered Hotel Guests',
          kpi4Val: customerRows.length,
          chart1Title: 'Revenue by Room Tier & Suite Type',
          chart2Title: 'Folio Settlement Methods',
        };
      case 'school':
        return {
          title: 'School Management Intelligence',
          kpi1Label: 'Total Fee Receipts',
          kpi1Val: salesRows.length,
          kpi2Label: 'Avg Term Fee Realization',
          kpi2Val: aov,
          kpi3Label: 'Fee Heads & Slabs',
          kpi3Val: productRows.length,
          kpi4Label: 'Enrolled Students Roster',
          kpi4Val: customerRows.length,
          chart1Title: 'Collection Share by Fee Head',
          chart2Title: 'Fee Payment Modes',
        };
      case 'coaching':
        return {
          title: 'Coaching & Tuition Intelligence',
          kpi1Label: 'Installment Receipts',
          kpi1Val: salesRows.length,
          kpi2Label: 'Avg Installment Size',
          kpi2Val: aov,
          kpi3Label: 'Courses & Batches',
          kpi3Val: productRows.length,
          kpi4Label: 'Enrolled Aspirants',
          kpi4Val: customerRows.length,
          chart1Title: 'Revenue by Exam Course & Batch',
          chart2Title: 'Tuition Payment Channels',
        };
      case 'payroll':
        return {
          title: 'Company Payroll Intelligence',
          kpi1Label: 'Monthly Payslips Disbursed',
          kpi1Val: salesRows.length,
          kpi2Label: 'Avg Monthly Salary',
          kpi2Val: aov,
          kpi3Label: 'Salary Structures',
          kpi3Val: productRows.length,
          kpi4Label: 'Active Headcount',
          kpi4Val: customerRows.length,
          chart1Title: 'Cost by Salary Structure & Grade',
          chart2Title: 'Salary Disbursal Channels',
        };
      case 'gym':
        return {
          title: 'Gym & Fitness Intelligence',
          kpi1Label: 'Member Passes Billed',
          kpi1Val: salesRows.length,
          kpi2Label: 'Avg Pass Value',
          kpi2Val: aov,
          kpi3Label: 'Plan Tiers & Packages',
          kpi3Val: productRows.length,
          kpi4Label: 'Active Gym Members',
          kpi4Val: customerRows.length,
          chart1Title: 'Revenue by Membership Plan Tier',
          chart2Title: 'Subscription Payment Channels',
        };
      case 'hospital':
        return {
          title: 'Hospital & Healthcare Intelligence',
          kpi1Label: 'OPD Encounters Billed',
          kpi1Val: salesRows.length,
          kpi2Label: 'Avg OPD Encounter Bill',
          kpi2Val: aov,
          kpi3Label: 'Procedures & Services',
          kpi3Val: productRows.length,
          kpi4Label: 'Registered Patients',
          kpi4Val: customerRows.length,
          chart1Title: 'Revenue by Procedure & Department',
          chart2Title: 'OPD Settlement Channels',
        };
      case 'restaurant':
        return {
          title: 'Restaurant & Dining Intelligence',
          kpi1Label: 'Table Orders (KOT) Billed',
          kpi1Val: salesRows.length,
          kpi2Label: 'Avg Table Check Size',
          kpi2Val: aov,
          kpi3Label: 'Active Dishes & Drinks',
          kpi3Val: productRows.length,
          kpi4Label: 'Dine-in Guests & Accounts',
          kpi4Val: customerRows.length,
          chart1Title: 'Revenue by Course & Department',
          chart2Title: 'Order Settlement Methods',
        };
      case 'realestate':
        return {
          title: 'Real Estate & Rental Intelligence',
          kpi1Label: 'Rent Receipts Issued',
          kpi1Val: salesRows.length,
          kpi2Label: 'Avg Monthly Lease Rent',
          kpi2Val: aov,
          kpi3Label: 'Rental Units in Portfolio',
          kpi3Val: productRows.length,
          kpi4Label: 'Contracted Tenants',
          kpi4Val: customerRows.length,
          chart1Title: 'Rental Revenue by Unit Category',
          chart2Title: 'Rent Payment Channels',
        };
      case 'garage':
        return {
          title: 'Automobile Workshop Intelligence',
          kpi1Label: 'Workshop Job Cards Delivered',
          kpi1Val: salesRows.length,
          kpi2Label: 'Avg Repair Job Bill',
          kpi2Val: aov,
          kpi3Label: 'Labor Packages & Spares',
          kpi3Val: productRows.length,
          kpi4Label: 'Vehicle Owners Directory',
          kpi4Val: customerRows.length,
          chart1Title: 'Revenue by Service Package & Repair',
          chart2Title: 'Job Card Settlement Methods',
        };
      case 'salon':
        return {
          title: 'Salon & Spa Intelligence',
          kpi1Label: 'Styling Sessions Billed',
          kpi1Val: salesRows.length,
          kpi2Label: 'Avg Appointment Bill',
          kpi2Val: aov,
          kpi3Label: 'Treatments & Cosmetic Products',
          kpi3Val: productRows.length,
          kpi4Label: 'Salon Clients Directory',
          kpi4Val: customerRows.length,
          chart1Title: 'Revenue by Treatment & Beauty Category',
          chart2Title: 'Appointment Settlement Methods',
        };
      case 'retail':
      default:
        return {
          title: `${appConfig?.businessType || 'Retail'} Business Intelligence`,
          kpi1Label: 'Total Transactions',
          kpi1Val: salesRows.length,
          kpi2Label: 'Avg Transaction Value (AOV)',
          kpi2Val: aov,
          kpi3Label: 'Catalog SKUs',
          kpi3Val: productRows.length,
          kpi4Label: 'Customer Base',
          kpi4Val: customerRows.length,
          chart1Title: 'Revenue by Product Category',
          chart2Title: 'Payment Methods Distribution',
        };
    }
  }, [flowType, salesRows, productRows, customerRows, aov, appConfig?.businessType]);

  // Dynamic Category Revenue Chart
  const categoryRevenueOption = useMemo(() => {
    const isDark = theme !== 'light';
    const textColor = isDark ? '#94a3b8' : '#64748b';
    const tooltipBg = isDark ? 'rgba(15, 23, 42, 0.94)' : 'rgba(255, 255, 255, 0.98)';
    const tooltipBorder = isDark ? 'rgba(51, 65, 85, 0.6)' : 'rgba(203, 213, 225, 0.9)';
    const tooltipText = isDark ? '#f8fafc' : '#0f172a';

    const catRevMap: Record<string, number> = {};
    saleItemRows.forEach((item) => {
      const prod = productRows.find((p) => p.product_id === item.product_id);
      const catName = prod?.category_id || 'General';
      catRevMap[catName] = (catRevMap[catName] || 0) + Number(item.line_total || 0);
    });

    const data = Object.keys(catRevMap).length > 0
      ? Object.entries(catRevMap).map(([name, value]) => ({ name, value }))
      : categoryRows.length > 0
      ? categoryRows.map((c, idx) => ({ name: c.name, value: (idx + 1) * 3500 }))
      : productRows.slice(0, 5).map((p) => ({ name: p.name, value: Number(p.selling_price || 1000) * 5 }));

    return {
      tooltip: {
        trigger: 'item',
        backgroundColor: tooltipBg,
        borderColor: tooltipBorder,
        textStyle: { color: tooltipText, fontSize: 12 },
        extraCssText: 'box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.2); border-radius: 12px;',
        formatter: (item: any) => {
          return `<div style="font-weight:700;margin-bottom:2px">${item.name}</div>
            <div style="font-family:monospace">${formatCurrency(item.value, currency, currencySymbol)} (${item.percent}%)</div>`;
        },
      },
      legend: {
        bottom: '0%',
        type: 'scroll',
        textStyle: { color: textColor, fontSize: 11 },
      },
      color: VIBRANT_PALETTE,
      series: [
        {
          name: editionAnalyticsMeta.chart1Title,
          type: 'pie',
          radius: ['40%', '70%'],
          itemStyle: {
            borderRadius: 6,
            borderColor: isDark ? 'rgba(15, 23, 42, 0.6)' : '#ffffff',
            borderWidth: 2,
          },
          data,
        },
      ],
    };
  }, [saleItemRows, productRows, categoryRows, theme, currency, currencySymbol, editionAnalyticsMeta.chart1Title]);

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Business Analytics & Intelligence</h1>
          <p className="text-xs text-muted-foreground">Deep dive performance across sales, inventory, and customers</p>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-1 bg-muted/60 p-1.5 rounded-2xl border border-border">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl transition ${
              activeTab === 'overview' ? 'bg-primary text-primary-foreground shadow-sm teal-glow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>{editionAnalyticsMeta.title}</span>
          </button>
          <button
            onClick={() => setActiveTab('sales')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition ${
              activeTab === 'sales' ? 'bg-primary text-primary-foreground shadow-sm teal-glow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {salesMeta.sheetDisplayName}
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition ${
              activeTab === 'inventory' ? 'bg-primary text-primary-foreground shadow-sm teal-glow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {invMeta.sheetDisplayName}
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition ${
              activeTab === 'products' ? 'bg-primary text-primary-foreground shadow-sm teal-glow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {prodMeta.sheetDisplayName}
          </button>
          <button
            onClick={() => setActiveTab('customers')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition ${
              activeTab === 'customers' ? 'bg-primary text-primary-foreground shadow-sm teal-glow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {custMeta.sheetDisplayName}
          </button>
        </div>
      </div>

      {/* Tab: Overview (Edition Intelligence Hub) */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* 4 Edition KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-primary/15 via-card to-card border border-primary/30 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between text-muted-foreground mb-2">
                <span className="text-xs font-semibold">Total Revenue Volume</span>
                <div className="p-2 rounded-xl bg-primary/15 text-primary">
                  <TrendingUp className="h-4 w-4" />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-foreground font-mono">
                {formatCurrency(totalRevenue, currency, currencySymbol)}
              </div>
              <div className="text-[11px] text-emerald-500 font-semibold mt-1 flex items-center gap-1">
                <ArrowUpRight className="h-3 w-3" />
                <span>Real-time workbook sync</span>
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between text-muted-foreground mb-2">
                <span className="text-xs font-semibold">{editionAnalyticsMeta.kpi1Label}</span>
                <div className="p-2 rounded-xl bg-indigo-500/15 text-indigo-400">
                  <BarChart3 className="h-4 w-4" />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-foreground font-mono">
                {editionAnalyticsMeta.kpi1Val}
              </div>
              <div className="text-[11px] text-muted-foreground mt-1">Recorded ledger transactions</div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between text-muted-foreground mb-2">
                <span className="text-xs font-semibold">{editionAnalyticsMeta.kpi2Label}</span>
                <div className="p-2 rounded-xl bg-teal-500/15 text-teal-400">
                  <DollarSign className="h-4 w-4" />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-foreground font-mono">
                {formatCurrency(editionAnalyticsMeta.kpi2Val, currency, currencySymbol)}
              </div>
              <div className="text-[11px] text-muted-foreground mt-1">Average ticket realization</div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between text-muted-foreground mb-2">
                <span className="text-xs font-semibold">{editionAnalyticsMeta.kpi4Label}</span>
                <div className="p-2 rounded-xl bg-purple-500/15 text-purple-400">
                  <Users className="h-4 w-4" />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-foreground font-mono">
                {editionAnalyticsMeta.kpi4Val}
              </div>
              <div className="text-[11px] text-muted-foreground mt-1">Active registered directory</div>
            </div>
          </div>

          {/* 2 Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-foreground">{editionAnalyticsMeta.chart1Title}</h3>
                  <p className="text-xs text-muted-foreground">Portfolio revenue contribution</p>
                </div>
              </div>
              <div className="h-72">
                <ReactECharts option={categoryRevenueOption} style={{ height: '100%', width: '100%' }} />
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-foreground">{editionAnalyticsMeta.chart2Title}</h3>
                  <p className="text-xs text-muted-foreground">Payment channel settlement split</p>
                </div>
              </div>
              <div className="h-72">
                <ReactECharts option={paymentMethodOption} style={{ height: '100%', width: '100%' }} />
              </div>
            </div>
          </div>

          {/* Top Performers Bar Chart & Ranking Table */}
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-foreground">Top Performing {prodMeta.sheetDisplayName}</h3>
                <p className="text-xs text-muted-foreground">Ranked by total billing volume</p>
              </div>
            </div>
            <div className="h-72">
              <ReactECharts option={topProductsChartOption} style={{ height: '100%', width: '100%' }} />
            </div>

            <div className="overflow-x-auto pt-4 border-t border-border">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border text-muted-foreground font-bold">
                    <th className="py-2.5 px-3">Rank</th>
                    <th className="py-2.5 px-3">{prodMeta.sheetDisplayName}</th>
                    <th className="py-2.5 px-3 text-right">Units / Quantity</th>
                    <th className="py-2.5 px-3 text-right">Total Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {topProducts.slice(0, 5).map((p, idx) => (
                    <tr key={idx} className="hover:bg-muted/10">
                      <td className="py-2 px-3">
                        <span className={`inline-flex items-center justify-center h-5 w-5 rounded-full text-[10px] font-bold ${
                          idx === 0 ? 'bg-amber-500/20 text-amber-500' : idx === 1 ? 'bg-slate-500/20 text-slate-400' : 'bg-muted text-muted-foreground'
                        }`}>
                          #{idx + 1}
                        </span>
                      </td>
                      <td className="py-2 px-3 font-semibold text-foreground">{p.name}</td>
                      <td className="py-2 px-3 text-right font-mono text-muted-foreground">{p.qty}</td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-primary">
                        {formatCurrency(p.revenue, currency, currencySymbol)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Sales */}
      {activeTab === 'sales' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="text-xs text-muted-foreground font-medium">Total Lifetime Revenue</div>
              <div className="text-2xl font-bold text-foreground mt-1">
                {formatCurrency(totalRevenue, currency, currencySymbol)}
              </div>
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="text-xs text-muted-foreground font-medium">{editionAnalyticsMeta.kpi2Label}</div>
              <div className="text-2xl font-bold text-foreground mt-1">
                {formatCurrency(aov, currency, currencySymbol)}
              </div>
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="text-xs text-muted-foreground font-medium">{editionAnalyticsMeta.kpi1Label}</div>
              <div className="text-2xl font-bold text-foreground mt-1">{salesRows.length}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-foreground">Revenue by Payment Method</h3>
              <div className="h-64">
                <ReactECharts option={paymentMethodOption} style={{ height: '100%', width: '100%' }} />
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-foreground">Top 10 {prodMeta.sheetDisplayName} by Revenue</h3>
              <div className="h-64">
                <ReactECharts option={topProductsChartOption} style={{ height: '100%', width: '100%' }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Inventory */}
      {activeTab === 'inventory' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="text-xs text-muted-foreground font-medium">Total {invMeta.sheetDisplayName} Asset Valuation</div>
              <div className="text-2xl font-bold text-foreground mt-1">
                {formatCurrency(totalInventoryValuation, currency, currencySymbol)}
              </div>
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="text-xs text-muted-foreground font-medium">Units in {invMeta.sheetDisplayName}</div>
              <div className="text-2xl font-bold text-foreground mt-1">{inventoryRows.length}</div>
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="text-xs text-muted-foreground font-medium">Total Operational Count</div>
              <div className="text-2xl font-bold text-foreground mt-1">
                {inventoryRows.reduce((a, b) => a + Number(b.quantity || 0), 0)} units
              </div>
            </div>
          </div>

          {/* Stock Health Chart */}
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-foreground">{invMeta.sheetDisplayName} Health Breakdown</h3>
            <div className="h-64">
              <ReactECharts option={stockHealthOption} style={{ height: '100%', width: '100%' }} />
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-foreground">{invMeta.sheetDisplayName} Overview by Item</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="pb-2">{prodMeta.sheetDisplayName} Name</th>
                    <th className="pb-2">SKU / Code</th>
                    <th className="pb-2 text-right">Unit Cost</th>
                    <th className="pb-2 text-right">Active Stock</th>
                    <th className="pb-2 text-right">Total Valuation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {inventoryRows.map((inv) => {
                    const prod = productRows.find((p) => p.product_id === inv.product_id);
                    const cost = Number(prod?.purchase_price || 0);
                    const qty = Number(inv.quantity || 0);
                    return (
                      <tr key={inv.inventory_id} className="hover:bg-muted/20">
                        <td className="py-2.5 font-medium text-foreground">{prod?.name || inv.product_id}</td>
                        <td className="py-2.5 text-muted-foreground font-mono">{prod?.sku || '-'}</td>
                        <td className="py-2.5 text-right font-mono">{formatCurrency(cost, currency, currencySymbol)}</td>
                        <td className="py-2.5 text-right font-mono font-bold">{qty}</td>
                        <td className="py-2.5 text-right font-mono font-semibold text-foreground">
                          {formatCurrency(cost * qty, currency, currencySymbol)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Products */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          {/* Product Margins Chart */}
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-foreground">Top Products: Purchase Cost vs Selling Price</h3>
            <div className="h-72">
              <ReactECharts option={productMarginsChartOption} style={{ height: '100%', width: '100%' }} />
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-foreground">{prodMeta.sheetDisplayName} Margins & Profitability</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="pb-2">{prodMeta.sheetDisplayName}</th>
                    <th className="pb-2">Category</th>
                    <th className="pb-2 text-right">Cost Price</th>
                    <th className="pb-2 text-right">Tariff / Selling Price</th>
                    <th className="pb-2 text-right">Gross Margin</th>
                    <th className="pb-2 text-right">Margin %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {productRows.map((p) => {
                    const buy = Number(p.purchase_price || 0);
                    const sell = Number(p.selling_price || 0);
                    const margin = sell - buy;
                    const marginPct = sell > 0 ? ((margin / sell) * 100).toFixed(1) : '0';
                    const cat = categoryRows.find((c) => c.category_id === p.category_id);

                    return (
                      <tr key={p.product_id} className="hover:bg-muted/20">
                        <td className="py-2.5 font-medium text-foreground">{p.name}</td>
                        <td className="py-2.5 text-muted-foreground">{cat?.name || 'General'}</td>
                        <td className="py-2.5 text-right font-mono">{formatCurrency(buy, currency, currencySymbol)}</td>
                        <td className="py-2.5 text-right font-mono">{formatCurrency(sell, currency, currencySymbol)}</td>
                        <td className="py-2.5 text-right font-mono font-semibold text-primary">
                          {formatCurrency(margin, currency, currencySymbol)}
                        </td>
                        <td className="py-2.5 text-right font-mono font-bold text-foreground">
                          {marginPct}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Customers */}
      {activeTab === 'customers' && (
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-foreground">{custMeta.sheetDisplayName} Lifetime Value (LTV)</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="pb-2">{custMeta.sheetDisplayName} Name</th>
                    <th className="pb-2">Contact</th>
                    <th className="pb-2">GSTIN</th>
                    <th className="pb-2 text-right">Orders</th>
                    <th className="pb-2 text-right">Total Spend</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {customerRows.map((c) => {
                    const cSales = salesRows.filter((s) => s.customer_id === c.customer_id);
                    const totalSpend = cSales.reduce((a, b) => a + Number(b.total || 0), 0);

                    return (
                      <tr key={c.customer_id} className="hover:bg-muted/20">
                        <td className="py-2.5 font-medium text-foreground">{c.name}</td>
                        <td className="py-2.5 text-muted-foreground">{c.phone || c.email || '-'}</td>
                        <td className="py-2.5 text-muted-foreground font-mono">{c.gstin || '-'}</td>
                        <td className="py-2.5 text-right font-mono">{cSales.length}</td>
                        <td className="py-2.5 text-right font-mono font-bold text-foreground">
                          {formatCurrency(totalSpend, currency, currencySymbol)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
