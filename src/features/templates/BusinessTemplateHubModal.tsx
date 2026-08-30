import React, { useState, useMemo } from 'react';
import { useUIStore } from '../../stores/uiStore';
import { useWorkbookStore } from '../../stores/workbookStore';
import { getAllBusinessTemplates, getBusinessTemplate } from '../../lib/templates';
import {
  X,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Table,
  Link2,
  Database,
  Layers,
  Car,
  Hotel,
  GraduationCap,
  BookOpen,
  BadgeDollarSign,
  Dumbbell,
  Activity,
  Store,
  Truck,
  Stethoscope,
  Briefcase,
  Factory,
  Search,
  Check
} from 'lucide-react';

const ICON_MAP: Record<string, React.ElementType> = {
  Car,
  Hotel,
  GraduationCap,
  BookOpen,
  BadgeDollarSign,
  Dumbbell,
  Activity,
  Store,
  Truck,
  Stethoscope,
  Briefcase,
  Factory,
};

export const BusinessTemplateHubModal: React.FC = () => {
  const { activeModal, closeModal, addNotification } = useUIStore();
  const { appConfig, applyBusinessTemplate, isSaving } = useWorkbookStore();

  const isOpen = activeModal === 'business_templates';
  const templates = useMemo(() => getAllBusinessTemplates(), []);

  const [selectedId, setSelectedId] = useState<string>(() => {
    return appConfig?.businessType ? getBusinessTemplate(appConfig.businessType).id : 'taxi';
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [customBusinessName, setCustomBusinessName] = useState(appConfig?.businessName || '');
  const [activeTab, setActiveTab] = useState<'overview' | 'tables' | 'preview'>('overview');

  const selectedTemplate = useMemo(() => {
    return templates.find((t) => t.id === selectedId) || templates[0];
  }, [templates, selectedId]);

  const filteredTemplates = useMemo(() => {
    if (!searchQuery.trim()) return templates;
    const q = searchQuery.toLowerCase();
    return templates.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.tagline.toLowerCase().includes(q) ||
        t.businessType.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q)
    );
  }, [templates, searchQuery]);

  if (!isOpen) return null;

  const handleApply = async () => {
    try {
      await applyBusinessTemplate(selectedTemplate, customBusinessName.trim() || selectedTemplate.title);
      addNotification(
        'success',
        'Business Schema Applied!',
        `Successfully loaded ${selectedTemplate.title}. All interconnected tables and starter records are ready.`
      );
      closeModal();
    } catch (err: any) {
      addNotification('error', 'Import Failed', err?.message || 'Could not import business template');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4 select-none animate-in fade-in">
      <div className="bg-card border border-border rounded-2xl shadow-2xl max-w-5xl w-full h-[88vh] max-h-[820px] flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-border bg-card/60 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-foreground">Business Templates & Flow Setup</h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/15 text-primary font-bold">
                  {templates.length} Business Editions
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Select your industry to load tailored interconnected tables, schema columns, and sample business data.
              </p>
            </div>
          </div>
          <button
            onClick={closeModal}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content Body: Master-Detail Layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Column: Business Selector List */}
          <div className="w-80 border-r border-border flex flex-col shrink-0 bg-muted/10">
            <div className="p-3 border-b border-border">
              <div className="relative">
                <Search className="h-3.5 w-3.5 absolute left-3 top-2.5 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter businesses..."
                  className="w-full pl-8 pr-3 py-1.5 bg-muted/40 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {filteredTemplates.map((t) => {
                const Icon = ICON_MAP[t.iconName] || Layers;
                const isSelected = t.id === selectedId;

                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      setSelectedId(t.id);
                      if (!customBusinessName) setCustomBusinessName(t.title);
                    }}
                    className={`w-full flex items-start gap-3 p-3 rounded-xl text-left transition border ${
                      isSelected
                        ? 'bg-primary/10 border-primary text-foreground shadow-sm'
                        : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/40'
                    }`}
                  >
                    <div
                      className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                        isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-bold truncate text-foreground">{t.businessType}</div>
                        {isSelected && <Check className="h-3.5 w-3.5 text-primary shrink-0 ml-1" />}
                      </div>
                      <div className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">{t.tagline}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Detailed Business Schema Inspector */}
          <div className="flex-1 flex flex-col overflow-hidden bg-card">
            {/* Business Header Banner */}
            <div className="p-6 border-b border-border bg-gradient-to-r from-primary/5 via-transparent to-transparent shrink-0">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-primary/15 text-primary font-mono">
                      {selectedTemplate.businessType}
                    </span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground font-mono">
                      Currency: {selectedTemplate.currencySymbol} ({selectedTemplate.currency})
                    </span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground font-mono">
                      Default GST: {selectedTemplate.defaultTaxRate}%
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-foreground">{selectedTemplate.title}</h3>
                  <p className="text-xs text-muted-foreground max-w-2xl">{selectedTemplate.description}</p>
                </div>
              </div>

              {/* Tabs Bar */}
              <div className="flex items-center gap-2 mt-5 border-b border-border/60">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`flex items-center gap-1.5 pb-2 text-xs font-bold transition border-b-2 ${
                    activeTab === 'overview'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Link2 className="h-3.5 w-3.5" />
                  <span>Interconnected Tables ({selectedTemplate.relationships.length})</span>
                </button>
                <button
                  onClick={() => setActiveTab('tables')}
                  className={`flex items-center gap-1.5 pb-2 text-xs font-bold transition border-b-2 ${
                    activeTab === 'tables'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Table className="h-3.5 w-3.5" />
                  <span>Included Sheets ({selectedTemplate.sheets.length})</span>
                </button>
                <button
                  onClick={() => setActiveTab('preview')}
                  className={`flex items-center gap-1.5 pb-2 text-xs font-bold transition border-b-2 ${
                    activeTab === 'preview'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Database className="h-3.5 w-3.5" />
                  <span>Sample Data Preview</span>
                </button>
              </div>
            </div>

            {/* Tab Body */}
            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                      Data Relationships & Interconnections
                    </h4>
                    <div className="space-y-3">
                      {selectedTemplate.relationships.map((rel, i) => (
                        <div
                          key={i}
                          className="p-3.5 bg-muted/20 border border-border/80 rounded-xl flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-3">
                            <div className="px-2.5 py-1 rounded-lg bg-card border border-border font-mono font-bold text-foreground">
                              {rel.sourceSheet}
                            </div>
                            <ArrowRight className="h-3.5 w-3.5 text-primary shrink-0" />
                            <div className="px-2.5 py-1 rounded-lg bg-card border border-border font-mono font-bold text-foreground">
                              {rel.targetSheet}
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground font-medium text-right max-w-sm">
                            {rel.relationship}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl space-y-2">
                    <div className="flex items-center gap-2 text-primary font-bold text-xs">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Ready-to-Use Business OS Setup</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Importing this template sets up all relational sheets directly in your Excel file. All records,
                      categories, inventory tracking, sales history, customer ledgers, and expenses will immediately
                      interlink with full reporting and spreadsheet compatibility.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'tables' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedTemplate.sheets.map((sheet) => (
                    <div key={sheet.name} className="p-4 bg-muted/20 border border-border rounded-xl space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-foreground">{sheet.name}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-muted text-muted-foreground font-bold">
                          {sheet.columns.length} columns • {sheet.rows.length} starter rows
                        </span>
                      </div>
                      <div className="text-[11px] text-muted-foreground line-clamp-2">
                        Columns: {sheet.columns.map((c) => c.name || c.key).join(', ')}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'preview' && (
                <div className="space-y-4">
                  {selectedTemplate.sheets.slice(0, 3).map((sheet) => (
                    <div key={sheet.name} className="border border-border rounded-xl overflow-hidden text-xs">
                      <div className="px-4 py-2 bg-muted/40 border-b border-border flex items-center justify-between">
                        <span className="font-mono font-bold text-foreground">{sheet.name}</span>
                        <span className="text-[10px] text-muted-foreground">{sheet.rows.length} preview rows</span>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left">
                          <thead className="bg-muted/20 border-b border-border text-[11px] text-muted-foreground">
                            <tr>
                              {sheet.columns.slice(0, 5).map((col) => (
                                <th key={col.key} className="px-3 py-1.5 font-semibold">
                                  {col.name || col.key}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border/40 font-mono text-[11px]">
                            {sheet.rows.map((r, rIdx) => (
                              <tr key={rIdx} className="hover:bg-muted/10">
                                {sheet.columns.slice(0, 5).map((col) => (
                                  <td key={col.key} className="px-3 py-1.5 truncate max-w-[160px]">
                                    {String(r[col.key] ?? '-')}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom Footer Action */}
            <div className="p-4 px-6 border-t border-border bg-card/60 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <label className="text-xs font-semibold text-foreground">Your Business Name:</label>
                <input
                  type="text"
                  value={customBusinessName}
                  onChange={(e) => setCustomBusinessName(e.target.value)}
                  placeholder={selectedTemplate.title}
                  className="px-3 py-1.5 bg-muted/40 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:border-primary w-64 font-medium"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 text-xs text-muted-foreground hover:text-foreground rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApply}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-5 py-2 text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl shadow-md teal-glow transition disabled:opacity-50"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>{isSaving ? 'Importing Schema...' : `Import & Setup ${selectedTemplate.businessType}`}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
