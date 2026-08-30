import React, { useMemo } from 'react';
import { useWorkbookStore } from '../../stores/workbookStore';
import { useUIStore } from '../../stores/uiStore';
import { formatCurrency, formatDate } from '../../lib/utils';
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
  Sparkles
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const { sheets, appConfig, setActiveSheet } = useWorkbookStore();
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
          date: s.sale_date,
          amount: Number(s.total || 0),
          status: s.status || 'completed',
          paymentMethod: s.payment_method || 'Cash',
        };
      });
  }, [salesRows, customerRows]);

  // Chart 1: Sales Trend (Date vs Revenue)
  const salesTrendOption = useMemo(() => {
    const dateMap: Record<string, number> = {};
    salesRows.forEach((s) => {
      const date = String(s.sale_date || '').split('T')[0];
      if (date) {
        dateMap[date] = (dateMap[date] || 0) + Number(s.total || 0);
      }
    });

    const dates = Object.keys(dateMap).sort();
    const values = dates.map((d) => dateMap[d]);

    return {
      tooltip: {
        trigger: 'axis',
        formatter: (params: any) => {
          const item = params[0];
          return `${item.name}<br/><b>${formatCurrency(item.value, currency, currencySymbol)}</b>`;
        },
      },
      grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
      xAxis: {
        type: 'category',
        data: dates.length ? dates : ['No Sales Yet'],
        axisLine: { lineStyle: { color: '#94a3b8' } },
      },
      yAxis: {
        type: 'value',
        axisLine: { lineStyle: { color: '#94a3b8' } },
        splitLine: { lineStyle: { color: '#334155', opacity: 0.2 } },
      },
      series: [
        {
          data: values.length ? values : [0],
          type: 'line',
          smooth: true,
          showSymbol: true,
          symbolSize: 8,
          lineStyle: { width: 3, color: '#3b82f6' },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(59, 130, 246, 0.4)' },
                { offset: 1, color: 'rgba(59, 130, 246, 0.0)' },
              ],
            },
          },
        },
      ],
    };
  }, [salesRows, currency, currencySymbol]);

  // Chart 2: Category Distribution
  const categoryOption = useMemo(() => {
    const categoryRows = sheets['_Categories']?.rows || [];
    const catCountMap: Record<string, number> = {};

    productRows.forEach((p) => {
      const cat = categoryRows.find((c) => c.category_id === p.category_id);
      const catName = cat?.name || 'Uncategorized';
      catCountMap[catName] = (catCountMap[catName] || 0) + 1;
    });

    const data = Object.entries(catCountMap).map(([name, value]) => ({ name, value }));

    return {
      tooltip: { trigger: 'item' },
      legend: { bottom: '0%', textStyle: { color: '#94a3b8', fontSize: 11 } },
      series: [
        {
          name: 'Products by Category',
          type: 'pie',
          radius: ['45%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: { borderRadius: 6, borderColor: '#1e293b', borderWidth: 2 },
          label: { show: false },
          data: data.length ? data : [{ name: 'No Categories', value: 1 }],
        },
      ],
    };
  }, [productRows, sheets]);

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* Top Banner: Quick Summary & Quick POS button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-primary/10 via-indigo-500/10 to-purple-500/10 border border-primary/20 rounded-2xl p-5 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-foreground">
              {appConfig?.businessName || 'Business Dashboard'}
            </h1>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-500 font-semibold">
              Live Workbook
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            All metrics reflect your single Excel workbook in real time.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => openModal('chart_builder')}
            className="flex items-center gap-1.5 px-3 py-2 text-xs bg-muted hover:bg-muted/80 text-foreground rounded-xl transition font-medium border border-border"
          >
            <Sparkles className="h-4 w-4 text-indigo-400" />
            <span>Chart Builder</span>
          </button>

          <button
            onClick={() => setActiveSheet('new_sale')}
            className="flex items-center gap-2 px-4 py-2 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md transition font-semibold"
          >
            <ShoppingCart className="h-4 w-4" />
            <span>Start New Sale (POS)</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Sales */}
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm hover:border-primary/40 transition">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-medium">Total Revenue</span>
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-foreground">
            {formatCurrency(totalRevenue, currency, currencySymbol)}
          </div>
          <div className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
            <span>{salesRows.length} completed orders</span>
          </div>
        </div>

        {/* Today's Sales */}
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm hover:border-primary/40 transition">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-medium">Today's Sales</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-foreground">
            {formatCurrency(todayRevenue, currency, currencySymbol)}
          </div>
          <div className="text-[11px] text-emerald-500 mt-1 flex items-center gap-1 font-medium">
            <ArrowUpRight className="h-3 w-3" />
            <span>Today's counter</span>
          </div>
        </div>

        {/* Products & Inventory */}
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm hover:border-primary/40 transition">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-medium">Products in Catalog</span>
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500">
              <Package className="h-4 w-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-foreground">{productRows.length}</div>
          <div className="text-[11px] text-muted-foreground mt-1">
            {inventoryRows.reduce((a, b) => a + Number(b.quantity || 0), 0)} total units in stock
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm hover:border-amber-500/40 transition">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-medium">Low Stock Alerts</span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-amber-500">{lowStockItems.length}</div>
          <div className="text-[11px] text-amber-500/80 mt-1">
            {lowStockItems.length === 0 ? 'All stocks optimal' : 'Requires reordering'}
          </div>
        </div>

        {/* Total Customers */}
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm hover:border-primary/40 transition">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-medium">Customers</span>
            <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-500">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-foreground">{customerRows.length}</div>
          <div className="text-[11px] text-muted-foreground mt-1">Registered clients</div>
        </div>

        {/* Total Expenses */}
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm hover:border-primary/40 transition">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-medium">Total Expenses</span>
            <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500">
              <Wallet className="h-4 w-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-foreground">
            {formatCurrency(totalExpenses, currency, currencySymbol)}
          </div>
          <div className="text-[11px] text-muted-foreground mt-1">
            {expenseRows.length} recorded entries
          </div>
        </div>

        {/* Net Profit Estimate */}
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm hover:border-primary/40 transition">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-medium">Net Profit (Est.)</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-emerald-500">
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
          className="bg-card/50 border border-dashed border-border rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary/70 hover:bg-primary/5 transition group"
        >
          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center mb-1 group-hover:scale-110 transition text-muted-foreground group-hover:text-primary">
            <PlusCircle className="h-4 w-4" />
          </div>
          <span className="text-xs font-semibold text-foreground">Add New Product</span>
          <span className="text-[10px] text-muted-foreground">Expand your catalog</span>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Trend Line Chart */}
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-foreground">Sales Revenue Trend</h3>
              <p className="text-xs text-muted-foreground">Track daily performance</p>
            </div>
            <button
              onClick={() => setActiveSheet('_Sales')}
              className="text-xs text-primary hover:underline font-medium"
            >
              View Sales History →
            </button>
          </div>
          <div className="h-64 w-full">
            <ReactECharts option={salesTrendOption} style={{ height: '100%', width: '100%' }} />
          </div>
        </div>

        {/* Product Category Distribution Donut */}
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-foreground">Categories</h3>
              <p className="text-xs text-muted-foreground">Product catalog breakdown</p>
            </div>
            <button
              onClick={() => setActiveSheet('_Categories')}
              className="text-xs text-primary hover:underline font-medium"
            >
              Manage →
            </button>
          </div>
          <div className="h-64 w-full">
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
              <h3 className="text-sm font-bold text-foreground">Recent Transactions</h3>
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
                No transactions recorded yet. Click "Start New Sale" above!
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="pb-2 font-medium">Customer</th>
                    <th className="pb-2 font-medium">Date</th>
                    <th className="pb-2 font-medium">Payment</th>
                    <th className="pb-2 font-medium text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {recentSales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-muted/40 transition">
                      <td className="py-2.5 font-medium text-foreground">{sale.customerName}</td>
                      <td className="py-2.5 text-muted-foreground">{formatDate(sale.date)}</td>
                      <td className="py-2.5">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-muted font-medium">
                          {sale.paymentMethod}
                        </span>
                      </td>
                      <td className="py-2.5 text-right font-semibold text-foreground">
                        {formatCurrency(sale.amount, currency, currencySymbol)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
              className="text-xs text-primary hover:underline font-medium"
            >
              Inventory Manager →
            </button>
          </div>

          <div className="space-y-2">
            {lowStockItems.length === 0 ? (
              <div className="text-center py-8 text-xs text-muted-foreground">
                🎉 Awesome! All products have healthy stock levels above minimum thresholds.
              </div>
            ) : (
              lowStockItems.slice(0, 5).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-amber-500/20 bg-amber-500/5"
                >
                  <div>
                    <div className="text-xs font-semibold text-foreground">{item.name}</div>
                    <div className="text-[11px] text-muted-foreground">SKU: {item.sku}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-amber-500">
                      {item.quantity} left
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      Min: {item.minStock}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
