import React, { useState, useMemo } from 'react';
import { useWorkbookStore } from '../../stores/workbookStore';
import { formatCurrency } from '../../lib/utils';
import ReactECharts from 'echarts-for-react';


export const AnalyticsView: React.FC = () => {
  const { sheets, appConfig } = useWorkbookStore();
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

  // Sales by payment method chart
  const paymentMethodOption = useMemo(() => {
    const counts: Record<string, number> = {};
    salesRows.forEach((s) => {
      const method = s.payment_method || 'Cash';
      counts[method] = (counts[method] || 0) + Number(s.total || 0);
    });

    return {
      tooltip: { trigger: 'item' },
      legend: { bottom: '0%', textStyle: { color: '#94a3b8' } },
      color: ['#0d9488', '#14b8a6', '#2dd4bf', '#0f766e', '#5eead4', '#115e59'],
      series: [
        {
          type: 'pie',
          radius: ['40%', '70%'],
          itemStyle: { borderRadius: 8, borderColor: '#1e293b', borderWidth: 2 },
          data: Object.entries(counts).map(([name, value]) => ({ name, value })),
        },
      ],
    };
  }, [salesRows]);

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

  // Top products bar chart option
  const topProductsChartOption = useMemo(() => {
    return {
      tooltip: { trigger: 'axis' },
      grid: { left: '3%', right: '4%', bottom: '5%', top: '5%', containLabel: true },
      xAxis: {
        type: 'category',
        data: topProducts.map((p) => p.name.length > 14 ? p.name.substring(0, 12) + '...' : p.name),
        axisLine: { lineStyle: { color: '#94a3b8' } },
      },
      yAxis: {
        type: 'value',
        axisLine: { lineStyle: { color: '#94a3b8' } },
        splitLine: { lineStyle: { color: '#334155', opacity: 0.2 } },
      },
      series: [
        {
          type: 'bar',
          data: topProducts.map((p) => p.revenue),
          itemStyle: { color: '#0d9488', borderRadius: [6, 6, 0, 0] },
        },
      ],
    };
  }, [topProducts]);

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
                        <td className="py-2.5 text-right font-mono font-semibold text-emerald-500">
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
