import React, { useState, useMemo } from 'react';
import { useWorkbookStore } from '../../stores/workbookStore';
import { useUIStore } from '../../stores/uiStore';
import { getBusinessFlowType } from '../../types';
import ReactECharts from 'echarts-for-react';
import { X, Sparkles, CheckCircle2, TrendingUp } from 'lucide-react';

interface ChartPreset {
  title: string;
  sheet: string;
  xAxis: string;
  metric: string;
  aggregation: 'SUM' | 'COUNT' | 'AVG' | 'MIN' | 'MAX';
  type: 'line' | 'bar' | 'area' | 'pie' | 'donut';
}

export const ChartBuilderModal: React.FC = () => {
  const { activeModal, closeModal, addNotification } = useUIStore();
  const { sheets, appConfig } = useWorkbookStore();

  const isOpen = activeModal === 'chart_builder';

  const flowType = getBusinessFlowType(appConfig?.businessType);

  // Smart template presets tailored to the active business edition
  const templatePresets: ChartPreset[] = useMemo(() => {
    switch (flowType) {
      case 'taxi':
        return [
          { title: 'Daily Fare Revenue Trend', sheet: '_Sales', xAxis: 'sale_date', metric: 'total', aggregation: 'SUM', type: 'line' },
          { title: 'Fare Rates by Cab Category', sheet: '_Products', xAxis: 'name', metric: 'selling_price', aggregation: 'AVG', type: 'bar' },
          { title: 'Trips by Settlement Mode', sheet: '_Sales', xAxis: 'payment_method', metric: 'total', aggregation: 'COUNT', type: 'pie' },
          { title: 'Trips per Passenger', sheet: '_Sales', xAxis: 'customer_id', metric: 'total', aggregation: 'COUNT', type: 'bar' },
        ];
      case 'hotel':
        return [
          { title: 'Daily Stay Revenue', sheet: '_Sales', xAxis: 'sale_date', metric: 'total', aggregation: 'SUM', type: 'area' },
          { title: 'Room Tariffs by Category', sheet: '_Products', xAxis: 'name', metric: 'selling_price', aggregation: 'AVG', type: 'bar' },
          { title: 'Folio Settlement Modes', sheet: '_Sales', xAxis: 'payment_method', metric: 'total', aggregation: 'COUNT', type: 'donut' },
          { title: 'Check-ins by Guest', sheet: '_Sales', xAxis: 'customer_id', metric: 'total', aggregation: 'COUNT', type: 'bar' },
        ];
      case 'school':
        return [
          { title: 'Term Fee Collection Trend', sheet: '_Sales', xAxis: 'sale_date', metric: 'total', aggregation: 'SUM', type: 'line' },
          { title: 'Fee Slabs by Grade / Head', sheet: '_Products', xAxis: 'name', metric: 'selling_price', aggregation: 'AVG', type: 'bar' },
          { title: 'Fee Receipts by Mode', sheet: '_Sales', xAxis: 'payment_method', metric: 'total', aggregation: 'COUNT', type: 'donut' },
          { title: 'Student Enrollments Fee Share', sheet: '_Sales', xAxis: 'customer_id', metric: 'total', aggregation: 'SUM', type: 'bar' },
        ];
      case 'coaching':
        return [
          { title: 'Tuition Inflow Trend', sheet: '_Sales', xAxis: 'sale_date', metric: 'total', aggregation: 'SUM', type: 'line' },
          { title: 'Course Fees by Exam', sheet: '_Products', xAxis: 'name', metric: 'selling_price', aggregation: 'AVG', type: 'bar' },
          { title: 'Installments by Payment Channel', sheet: '_Sales', xAxis: 'payment_method', metric: 'total', aggregation: 'COUNT', type: 'pie' },
          { title: 'Installments by Candidate', sheet: '_Sales', xAxis: 'customer_id', metric: 'total', aggregation: 'COUNT', type: 'bar' },
        ];
      case 'payroll':
        return [
          { title: 'Monthly Disbursal Trend', sheet: '_Sales', xAxis: 'sale_date', metric: 'total', aggregation: 'SUM', type: 'bar' },
          { title: 'Salary by Component', sheet: '_Products', xAxis: 'name', metric: 'selling_price', aggregation: 'SUM', type: 'donut' },
          { title: 'Disbursals by Method', sheet: '_Sales', xAxis: 'payment_method', metric: 'total', aggregation: 'COUNT', type: 'pie' },
          { title: 'Net Pay by Employee', sheet: '_Sales', xAxis: 'customer_id', metric: 'total', aggregation: 'SUM', type: 'bar' },
        ];
      case 'gym':
        return [
          { title: 'Daily Subscription Inflow', sheet: '_Sales', xAxis: 'sale_date', metric: 'total', aggregation: 'SUM', type: 'line' },
          { title: 'Revenue by Membership Tier', sheet: '_Products', xAxis: 'name', metric: 'selling_price', aggregation: 'AVG', type: 'donut' },
          { title: 'Subscriptions by Payment Mode', sheet: '_Sales', xAxis: 'payment_method', metric: 'total', aggregation: 'COUNT', type: 'pie' },
          { title: 'Renewals by Member', sheet: '_Sales', xAxis: 'customer_id', metric: 'total', aggregation: 'COUNT', type: 'bar' },
        ];
      case 'hospital':
        return [
          { title: 'Daily OPD Billing Trend', sheet: '_Sales', xAxis: 'sale_date', metric: 'total', aggregation: 'SUM', type: 'area' },
          { title: 'Standard Charges by Procedure', sheet: '_Products', xAxis: 'name', metric: 'selling_price', aggregation: 'AVG', type: 'bar' },
          { title: 'Billing by Insurance / Mode', sheet: '_Sales', xAxis: 'payment_method', metric: 'total', aggregation: 'COUNT', type: 'donut' },
          { title: 'Visits by Patient UHID', sheet: '_Sales', xAxis: 'customer_id', metric: 'total', aggregation: 'COUNT', type: 'bar' },
        ];
      case 'restaurant':
        return [
          { title: 'Daily Food Sales Trend', sheet: '_Sales', xAxis: 'sale_date', metric: 'total', aggregation: 'SUM', type: 'line' },
          { title: 'Menu Pricing by Course', sheet: '_Products', xAxis: 'category_id', metric: 'selling_price', aggregation: 'AVG', type: 'bar' },
          { title: 'Settlement Modes Split', sheet: '_Sales', xAxis: 'payment_method', metric: 'total', aggregation: 'COUNT', type: 'donut' },
          { title: 'Orders by Table / Guest', sheet: '_Sales', xAxis: 'customer_id', metric: 'total', aggregation: 'COUNT', type: 'bar' },
        ];
      case 'realestate':
        return [
          { title: 'Monthly Rent Collections', sheet: '_Sales', xAxis: 'sale_date', metric: 'total', aggregation: 'SUM', type: 'line' },
          { title: 'Tariff by Unit Type', sheet: '_Products', xAxis: 'name', metric: 'selling_price', aggregation: 'AVG', type: 'bar' },
          { title: 'Rent Receipts by Channel', sheet: '_Sales', xAxis: 'payment_method', metric: 'total', aggregation: 'COUNT', type: 'donut' },
          { title: 'Collections by Leased Unit', sheet: '_Sales', xAxis: 'customer_id', metric: 'total', aggregation: 'SUM', type: 'bar' },
        ];
      case 'garage':
        return [
          { title: 'Daily Repair Billing', sheet: '_Sales', xAxis: 'sale_date', metric: 'total', aggregation: 'SUM', type: 'area' },
          { title: 'Service Package Rates', sheet: '_Products', xAxis: 'name', metric: 'selling_price', aggregation: 'AVG', type: 'bar' },
          { title: 'Repair Bills by Mode', sheet: '_Sales', xAxis: 'payment_method', metric: 'total', aggregation: 'COUNT', type: 'donut' },
          { title: 'Jobs by Vehicle Owner', sheet: '_Sales', xAxis: 'customer_id', metric: 'total', aggregation: 'COUNT', type: 'bar' },
        ];
      case 'salon':
        return [
          { title: 'Daily Salon Revenue', sheet: '_Sales', xAxis: 'sale_date', metric: 'total', aggregation: 'SUM', type: 'line' },
          { title: 'Treatment Charges by Service', sheet: '_Products', xAxis: 'name', metric: 'selling_price', aggregation: 'AVG', type: 'bar' },
          { title: 'Payment Modes Split', sheet: '_Sales', xAxis: 'payment_method', metric: 'total', aggregation: 'COUNT', type: 'donut' },
          { title: 'Appointments by Client', sheet: '_Sales', xAxis: 'customer_id', metric: 'total', aggregation: 'COUNT', type: 'bar' },
        ];
      case 'retail':
      default:
        return [
          { title: 'Daily Revenue Trend', sheet: '_Sales', xAxis: 'sale_date', metric: 'total', aggregation: 'SUM', type: 'line' },
          { title: 'Product Catalog Pricing', sheet: '_Products', xAxis: 'name', metric: 'selling_price', aggregation: 'AVG', type: 'bar' },
          { title: 'Sales by Payment Method', sheet: '_Sales', xAxis: 'payment_method', metric: 'total', aggregation: 'COUNT', type: 'pie' },
          { title: 'Target Stock Thresholds', sheet: '_Products', xAxis: 'name', metric: 'minimum_stock', aggregation: 'AVG', type: 'bar' },
        ];
    }
  }, [flowType]);

  // Table options: all sheets with rows
  const availableSheets = useMemo(() => {
    return Object.keys(sheets).filter((s) => !s.startsWith('_App') && !s.startsWith('_Dashboard'));
  }, [sheets]);

  const [selectedSheet, setSelectedSheet] = useState<string>('_Sales');
  const targetSheet = sheets[selectedSheet];

  // Column options
  const columns = targetSheet?.columns || [];
  const [xAxisCol, setXAxisCol] = useState<string>('sale_date');
  const [metricCol, setMetricCol] = useState<string>('total');
  const [aggregation, setAggregation] = useState<'SUM' | 'COUNT' | 'AVG' | 'MIN' | 'MAX'>('SUM');
  const [chartType, setChartType] = useState<'line' | 'bar' | 'area' | 'pie' | 'donut'>('bar');
  const [chartTitle, setChartTitle] = useState<string>(templatePresets[0]?.title || 'Custom Business Chart');

  const applyPreset = (preset: ChartPreset) => {
    if (sheets[preset.sheet]) {
      setSelectedSheet(preset.sheet);
    }
    setXAxisCol(preset.xAxis);
    setMetricCol(preset.metric);
    setAggregation(preset.aggregation);
    setChartType(preset.type);
    setChartTitle(preset.title);
  };

  // Compute Aggregations
  const computedData = useMemo(() => {
    if (!targetSheet || !xAxisCol) return { categories: [], values: [] };

    const grouped: Record<string, number[]> = {};
    targetSheet.rows.forEach((row) => {
      const xVal = String(row[xAxisCol] ?? 'Unknown').split('T')[0];
      const mVal = Number(row[metricCol] ?? 0);
      if (!grouped[xVal]) grouped[xVal] = [];
      grouped[xVal].push(isNaN(mVal) ? 0 : mVal);
    });

    const categories = Object.keys(grouped).sort();
    const values = categories.map((cat) => {
      const arr = grouped[cat];
      if (aggregation === 'COUNT') return arr.length;
      if (aggregation === 'SUM') return arr.reduce((a, b) => a + b, 0);
      if (aggregation === 'AVG') return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
      if (aggregation === 'MIN') return Math.min(...arr);
      if (aggregation === 'MAX') return Math.max(...arr);
      return 0;
    });

    return { categories, values };
  }, [targetSheet, xAxisCol, metricCol, aggregation]);

  const VIBRANT_PALETTE = [
    '#0d9488', '#6366f1', '#f59e0b', '#ec4899', '#3b82f6', '#10b981', '#8b5cf6', '#06b6d4', '#f97316', '#14b8a6'
  ];

  // Generate ECharts option
  const chartOption = useMemo(() => {
    if (chartType === 'pie' || chartType === 'donut') {
      const pieData = computedData.categories.map((cat, idx) => ({
        name: cat,
        value: computedData.values[idx],
      }));
      return {
        title: { text: chartTitle, left: 'center', textStyle: { color: '#f8fafc', fontSize: 13 } },
        tooltip: { trigger: 'item' },
        color: VIBRANT_PALETTE,
        series: [
          {
            type: 'pie',
            radius: chartType === 'donut' ? ['40%', '70%'] : '65%',
            data: pieData,
            itemStyle: { borderRadius: 6, borderColor: '#1e293b', borderWidth: 2 },
          },
        ],
      };
    }

    return {
      title: { text: chartTitle, left: 'center', textStyle: { color: '#f8fafc', fontSize: 13 } },
      tooltip: { trigger: 'axis' },
      grid: { left: '3%', right: '4%', bottom: '5%', top: '15%', containLabel: true },
      xAxis: {
        type: 'category',
        data: computedData.categories,
        axisLine: { lineStyle: { color: '#94a3b8' } },
      },
      yAxis: {
        type: 'value',
        axisLine: { lineStyle: { color: '#94a3b8' } },
        splitLine: { lineStyle: { color: '#334155', opacity: 0.2 } },
      },
      series: [
        {
          name: metricCol,
          type: chartType === 'area' ? 'line' : chartType,
          data: computedData.values,
          smooth: true,
          areaStyle: chartType === 'area' ? { opacity: 0.3 } : undefined,
          itemStyle: chartType === 'bar' ? {
            borderRadius: [6, 6, 0, 0],
            color: (params: any) => VIBRANT_PALETTE[params.dataIndex % VIBRANT_PALETTE.length],
          } : { color: '#0d9488' },
        },
      ],
    };
  }, [chartTitle, chartType, computedData, metricCol]);

  if (!isOpen) return null;

  const handleSaveWidget = () => {
    addNotification('success', 'Chart Configured', `Saved "${chartTitle}" configuration`);
    closeModal();
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4 select-none animate-in fade-in">
      <div className="bg-card border border-border rounded-2xl shadow-2xl max-w-4xl w-full h-[80vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/30 shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-400" />
            <h2 className="text-sm font-bold text-foreground">Interactive Chart Builder</h2>
          </div>
          <button onClick={closeModal} className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Builder Split Layout */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
          {/* Controls Panel (5 cols) */}
          <div className="md:col-span-5 border-r border-border p-5 overflow-y-auto space-y-4 text-xs bg-muted/10">
            {/* Recommended Template Presets */}
            <div className="space-y-2 pb-3 border-b border-border/80">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-primary font-bold">
                  <TrendingUp className="h-3.5 w-3.5" />
                  <span className="text-[10px] uppercase tracking-wider">
                    {appConfig?.businessType || 'Industry'} Presets
                  </span>
                </div>
                <span className="text-[10px] text-muted-foreground font-semibold">1-Click Apply</span>
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                {templatePresets.map((preset, pIdx) => {
                  const isSelected = chartTitle === preset.title;
                  return (
                    <button
                      key={pIdx}
                      type="button"
                      onClick={() => applyPreset(preset)}
                      className={`p-2 text-left rounded-xl border transition ${
                        isSelected
                          ? 'bg-primary/20 border-primary text-primary shadow-xs'
                          : 'bg-muted/40 hover:bg-muted/80 border-border text-foreground hover:border-primary/40'
                      }`}
                    >
                      <div className="text-[11px] font-bold truncate">
                        {preset.title}
                      </div>
                      <div className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                        <span className="uppercase font-mono font-semibold">{preset.type}</span>
                        <span>•</span>
                        <span>{preset.sheet.replace('_', '')}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block font-medium text-foreground mb-1">Chart Title</label>
              <input
                type="text"
                value={chartTitle}
                onChange={(e) => setChartTitle(e.target.value)}
                className="w-full px-3 py-1.5 bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block font-medium text-foreground mb-1">Data Source (Sheet)</label>
              <select
                value={selectedSheet}
                onChange={(e) => setSelectedSheet(e.target.value)}
                className="w-full px-3 py-1.5 bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none focus:border-primary"
              >
                {availableSheets.map((s) => (
                  <option key={s} value={s}>
                    {s.replace('_', '')}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-foreground mb-1">X-Axis / Category</label>
                <select
                  value={xAxisCol}
                  onChange={(e) => setXAxisCol(e.target.value)}
                  className="w-full px-3 py-1.5 bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none focus:border-primary"
                >
                  {columns.map((c) => (
                    <option key={c.key} value={c.key}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-foreground mb-1">Metric Column</label>
                <select
                  value={metricCol}
                  onChange={(e) => setMetricCol(e.target.value)}
                  className="w-full px-3 py-1.5 bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none focus:border-primary"
                >
                  {columns.map((c) => (
                    <option key={c.key} value={c.key}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block font-medium text-foreground mb-1">Aggregation</label>
              <div className="grid grid-cols-5 gap-1">
                {(['SUM', 'COUNT', 'AVG', 'MIN', 'MAX'] as const).map((agg) => (
                  <button
                    key={agg}
                    type="button"
                    onClick={() => setAggregation(agg)}
                    className={`py-1.5 text-[10px] font-bold rounded border transition ${
                      aggregation === agg
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'border-border text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    {agg}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-medium text-foreground mb-1">Chart Type</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { type: 'bar', label: 'Bar' },
                  { type: 'line', label: 'Line' },
                  { type: 'area', label: 'Area' },
                  { type: 'pie', label: 'Pie' },
                  { type: 'donut', label: 'Donut' },
                ].map((ct) => (
                  <button
                    key={ct.type}
                    type="button"
                    onClick={() => setChartType(ct.type as any)}
                    className={`py-1.5 px-2 rounded-lg border text-center font-medium transition text-xs ${
                      chartType === ct.type
                        ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400 font-bold'
                        : 'border-border text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    {ct.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <button
                onClick={handleSaveWidget}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-primary text-primary-foreground font-semibold rounded-xl shadow-sm hover:bg-primary/90 transition text-xs"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Save Widget</span>
              </button>
            </div>
          </div>

          {/* Live Preview Panel (7 cols) */}
          <div className="md:col-span-7 p-6 flex flex-col justify-center items-center bg-card">
            <div className="w-full h-full">
              <ReactECharts option={chartOption} style={{ height: '100%', width: '100%' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
