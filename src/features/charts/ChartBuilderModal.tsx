import React, { useState, useMemo } from 'react';
import { useWorkbookStore } from '../../stores/workbookStore';
import { useUIStore } from '../../stores/uiStore';
import ReactECharts from 'echarts-for-react';
import { X, Sparkles, CheckCircle2 } from 'lucide-react';

export const ChartBuilderModal: React.FC = () => {
  const { activeModal, closeModal, addNotification } = useUIStore();
  const { sheets } = useWorkbookStore();

  const isOpen = activeModal === 'chart_builder';

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
  const [chartTitle, setChartTitle] = useState<string>('Custom Business Chart');

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
