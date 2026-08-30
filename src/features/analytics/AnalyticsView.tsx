import React, { useState, useMemo } from 'react';
import { useWorkbookStore } from '../../stores/workbookStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { formatCurrency } from '../../lib/utils';
import ReactECharts from 'echarts-for-react';

export const AnalyticsView: React.FC = () => {
  const { sheets, appConfig } = useWorkbookStore();
  const { theme } = useSettingsStore();
  const [activeTab, setActiveTab] = useState<'sales' | 'inventory' | 'customers' | 'products'>('sales');

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
            onClick={() => setActiveTab('sales')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition ${
              activeTab === 'sales' ? 'bg-primary text-primary-foreground shadow-sm teal-glow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Sales
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition ${
              activeTab === 'inventory' ? 'bg-primary text-primary-foreground shadow-sm teal-glow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Inventory
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition ${
              activeTab === 'products' ? 'bg-primary text-primary-foreground shadow-sm teal-glow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Products
          </button>
          <button
            onClick={() => setActiveTab('customers')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition ${
              activeTab === 'customers' ? 'bg-primary text-primary-foreground shadow-sm teal-glow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Customers
          </button>
        </div>
      </div>

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
              <div className="text-xs text-muted-foreground font-medium">Average Order Value (AOV)</div>
              <div className="text-2xl font-bold text-foreground mt-1">
                {formatCurrency(aov, currency, currencySymbol)}
              </div>
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="text-xs text-muted-foreground font-medium">Total Orders Placed</div>
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
              <h3 className="text-sm font-bold text-foreground">Top 10 Products by Revenue</h3>
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
              <div className="text-xs text-muted-foreground font-medium">Total Inventory Asset Valuation</div>
              <div className="text-2xl font-bold text-foreground mt-1">
                {formatCurrency(totalInventoryValuation, currency, currencySymbol)}
              </div>
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="text-xs text-muted-foreground font-medium">SKUs in Inventory</div>
              <div className="text-2xl font-bold text-foreground mt-1">{inventoryRows.length}</div>
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="text-xs text-muted-foreground font-medium">Total Stock Quantity</div>
              <div className="text-2xl font-bold text-foreground mt-1">
                {inventoryRows.reduce((a, b) => a + Number(b.quantity || 0), 0)} units
              </div>
            </div>
          </div>

          {/* Stock Health Chart */}
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-foreground">Inventory Health Breakdown</h3>
            <div className="h-64">
              <ReactECharts option={stockHealthOption} style={{ height: '100%', width: '100%' }} />
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-foreground">Stock Overview by SKU</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="pb-2">Product Name</th>
                    <th className="pb-2">SKU</th>
                    <th className="pb-2 text-right">Unit Cost</th>
                    <th className="pb-2 text-right">In Stock</th>
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
            <h3 className="text-sm font-bold text-foreground">Product Margins & Profitability</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="pb-2">Product</th>
                    <th className="pb-2">Category</th>
                    <th className="pb-2 text-right">Purchase Price</th>
                    <th className="pb-2 text-right">Selling Price</th>
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
            <h3 className="text-sm font-bold text-foreground">Customer Lifetime Value (LTV)</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="pb-2">Customer Name</th>
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
