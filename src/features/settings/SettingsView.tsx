import React, { useState, useEffect } from 'react';
import { useWorkbookStore } from '../../stores/workbookStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { useUIStore } from '../../stores/uiStore';
import { formatCurrency, formatDate } from '../../lib/utils';
import {
  Building2,
  FileSpreadsheet,
  Palette,
  Receipt,
  Coins,
  Save,
  RotateCcw,
  FolderOpen,
  Sliders,
  Check,
  Printer
} from 'lucide-react';

type SettingsTab = 'business' | 'finance' | 'pos' | 'appearance' | 'storage';

export const SettingsView: React.FC = () => {
  const {
    metadata,
    appConfig,
    backups,
    createBackup,
    restoreBackup,
    updateAppConfig,
    saveWorkbook,
    reloadWorkbook,
  } = useWorkbookStore();

  const {
    theme,
    setTheme,
    tableDensity,
    setTableDensity,
    businessAddress,
    businessPhone,
    businessEmail,
    businessGstin,
    autoSaveEnabled,
    autoSaveIntervalSeconds,
    setAutoSave,
    updateBusinessProfile,
    invoiceFooterNote,
    defaultPaymentMethod,
    receiptAutoPrint,
    setInvoicePreferences,
  } = useSettingsStore();

  const { addNotification, openModal } = useUIStore();

  const [activeTab, setActiveTab] = useState<SettingsTab>('business');

  // Business profile form state
  const [businessNameInput, setBusinessNameInput] = useState(appConfig?.businessName || 'Apex Retail & Electronics');
  const [businessTypeInput, setBusinessTypeInput] = useState(appConfig?.businessType || 'Retail Store');
  const [countryInput, setCountryInput] = useState(appConfig?.country || 'India');
  const [addressInput, setAddressInput] = useState(businessAddress);
  const [phoneInput, setPhoneInput] = useState(businessPhone);
  const [emailInput, setEmailInput] = useState(businessEmail);
  const [gstinInput, setGstinInput] = useState(businessGstin);

  // Finance & Tax form state
  const [currencyInput, setCurrencyInput] = useState(appConfig?.currency || 'INR');
  const [currencySymbolInput, setCurrencySymbolInput] = useState(appConfig?.currencySymbol || '₹');
  const [taxPreferenceInput, setTaxPreferenceInput] = useState<'inclusive' | 'exclusive'>(appConfig?.taxPreference || 'exclusive');
  const [defaultTaxRateInput, setDefaultTaxRateInput] = useState<number>(appConfig?.defaultTaxRate || 18);
  const [dateFormatInput, setDateFormatInput] = useState(appConfig?.dateFormat || 'YYYY-MM-DD');

  // POS & Invoicing form state
  const [footerNoteInput, setFooterNoteInput] = useState(invoiceFooterNote);
  const [defaultPaymentInput, setDefaultPaymentInput] = useState(defaultPaymentMethod);
  const [autoPrintInput, setAutoPrintInput] = useState(receiptAutoPrint);

  // Storage form state
  const [autoSaveEnabledInput, setAutoSaveEnabledInput] = useState(autoSaveEnabled);
  const [autoSaveIntervalInput, setAutoSaveIntervalInput] = useState(autoSaveIntervalSeconds);
  const [isSavingAll, setIsSavingAll] = useState(false);

  useEffect(() => {
    if (appConfig) {
      setBusinessNameInput(appConfig.businessName || '');
      setBusinessTypeInput(appConfig.businessType || '');
      setCountryInput(appConfig.country || 'India');
      setCurrencyInput(appConfig.currency || 'INR');
      setCurrencySymbolInput(appConfig.currencySymbol || '₹');
      setTaxPreferenceInput(appConfig.taxPreference || 'exclusive');
      setDefaultTaxRateInput(appConfig.defaultTaxRate ?? 18);
      setDateFormatInput(appConfig.dateFormat || 'YYYY-MM-DD');
    }
  }, [appConfig]);

  const CURRENCY_PRESETS: Record<string, { symbol: string; label: string }> = {
    INR: { symbol: '₹', label: 'Indian Rupee (INR - ₹)' },
    USD: { symbol: '$', label: 'US Dollar (USD - $)' },
    EUR: { symbol: '€', label: 'Euro (EUR - €)' },
    GBP: { symbol: '£', label: 'British Pound (GBP - £)' },
    AED: { symbol: 'د.إ', label: 'UAE Dirham (AED - د.إ)' },
    CAD: { symbol: 'C$', label: 'Canadian Dollar (CAD - C$)' },
    AUD: { symbol: 'A$', label: 'Australian Dollar (AUD - A$)' },
    SGD: { symbol: 'S$', label: 'Singapore Dollar (SGD - S$)' },
  };

  const handleCurrencySelect = (code: string) => {
    setCurrencyInput(code);
    if (CURRENCY_PRESETS[code]) {
      setCurrencySymbolInput(CURRENCY_PRESETS[code].symbol);
    }
  };

  const handleSaveAll = async () => {
    setIsSavingAll(true);
    try {
      // 1. Update AppConfig in workbook store and _AppConfig sheet
      updateAppConfig({
        businessName: businessNameInput,
        businessType: businessTypeInput,
        country: countryInput,
        currency: currencyInput,
        currencySymbol: currencySymbolInput,
        taxPreference: taxPreferenceInput,
        defaultTaxRate: Number(defaultTaxRateInput),
        dateFormat: dateFormatInput,
      });

      // 2. Update contact details in settings store
      updateBusinessProfile({
        address: addressInput,
        phone: phoneInput,
        email: emailInput,
        gstin: gstinInput,
      });

      // 3. Update invoice & POS preferences
      setInvoicePreferences({
        invoiceFooterNote: footerNoteInput,
        defaultPaymentMethod: defaultPaymentInput,
        receiptAutoPrint: autoPrintInput,
      });

      // 4. Update auto-save settings
      setAutoSave(autoSaveEnabledInput, autoSaveIntervalInput);

      // 5. Persist to active workbook file
      await saveWorkbook();

      addNotification('success', 'Settings Applied', 'All business, financial, and interface preferences updated across the app');
    } catch (err: any) {
      addNotification('error', 'Save Failed', err.message || 'Could not persist settings');
    } finally {
      setIsSavingAll(false);
    }
  };

  const handleCreateBackup = async () => {
    if (!metadata) {
      addNotification('warning', 'No Active Workbook', 'Please create or load a workbook first');
      return;
    }
    try {
      const b = await createBackup();
      addNotification('success', 'Backup Created', b.filename);
    } catch (err: any) {
      addNotification('error', 'Backup Failed', err.message);
    }
  };

  const handleRestore = async (backupPath: string) => {
    if (!metadata) {
      addNotification('warning', 'No Active Workbook', 'Please create or load a workbook first');
      return;
    }
    if (window.confirm('Restore this backup copy? Current unsaved workbook state will be replaced.')) {
      try {
        await restoreBackup(backupPath);
        addNotification('success', 'Backup Restored', 'Workbook data reverted to backup snapshot');
      } catch (err: any) {
        addNotification('error', 'Restore Failed', err.message);
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-background">
      {/* Top Header Bar */}
      <div className="px-6 py-4 border-b border-border bg-card/60 backdrop-blur-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-lg font-extrabold text-foreground tracking-tight flex items-center gap-2">
            <span>System & Business Settings</span>
            {metadata && (
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20">
                {metadata.fileName}
              </span>
            )}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure local business profile, active Excel store, currency, POS invoicing, and appearance
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSaveAll}
            disabled={isSavingAll}
            className="flex items-center gap-1.5 px-4 py-2 text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl shadow-md teal-glow transition disabled:opacity-50"
          >
            <Save className="h-3.5 w-3.5" />
            <span>{isSavingAll ? 'Applying...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {/* Main Full-Page Settings Layout: Left Navigation + Right Content */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Navigation Sidebar */}
        <div className="w-full md:w-64 border-r border-border bg-muted/15 p-4 flex md:flex-col gap-1.5 overflow-x-auto md:overflow-y-auto shrink-0 select-none">
          <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-3 py-1.5 hidden md:block">
            Configuration
          </div>

          <button
            onClick={() => setActiveTab('business')}
            className={`flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold rounded-xl transition text-left shrink-0 ${
              activeTab === 'business'
                ? 'bg-primary text-primary-foreground shadow-sm teal-glow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            <Building2 className="h-4 w-4 shrink-0" />
            <span>Business Profile</span>
          </button>

          <button
            onClick={() => setActiveTab('finance')}
            className={`flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold rounded-xl transition text-left shrink-0 ${
              activeTab === 'finance'
                ? 'bg-primary text-primary-foreground shadow-sm teal-glow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            <Coins className="h-4 w-4 shrink-0" />
            <span>Currency & Taxes</span>
          </button>

          <button
            onClick={() => setActiveTab('pos')}
            className={`flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold rounded-xl transition text-left shrink-0 ${
              activeTab === 'pos'
                ? 'bg-primary text-primary-foreground shadow-sm teal-glow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            <Receipt className="h-4 w-4 shrink-0" />
            <span>POS & Invoicing</span>
          </button>

          <button
            onClick={() => setActiveTab('appearance')}
            className={`flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold rounded-xl transition text-left shrink-0 ${
              activeTab === 'appearance'
                ? 'bg-primary text-primary-foreground shadow-sm teal-glow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            <Palette className="h-4 w-4 shrink-0" />
            <span>Appearance & Grid</span>
          </button>

          <button
            onClick={() => setActiveTab('storage')}
            className={`flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold rounded-xl transition text-left shrink-0 ${
              activeTab === 'storage'
                ? 'bg-primary text-primary-foreground shadow-sm teal-glow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            <FileSpreadsheet className="h-4 w-4 shrink-0" />
            <span>Workbook & Storage</span>
          </button>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
          {/* TAB 1: Business Profile */}
          {activeTab === 'business' && (
            <div className="max-w-3xl space-y-6">
              <div>
                <h2 className="text-base font-bold text-foreground">Business Profile & Entity Information</h2>
                <p className="text-xs text-muted-foreground">
                  Branding and contact details printed on customer tax invoices, receipts, and exported statements.
                </p>
              </div>

              <div className="bg-card border border-border rounded-2xl p-6 shadow-2xs space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-semibold text-foreground mb-1.5">Trade / Business Name</label>
                    <input
                      type="text"
                      value={businessNameInput}
                      onChange={(e) => setBusinessNameInput(e.target.value)}
                      placeholder="e.g. Apex Retail & Electronics"
                      className="w-full px-3.5 py-2.5 bg-muted/40 border border-border rounded-xl text-foreground font-medium focus:outline-none focus:border-primary shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-foreground mb-1.5">Business Type & Operating Flow</label>
                    <input
                      type="text"
                      value={businessTypeInput}
                      onChange={(e) => setBusinessTypeInput(e.target.value)}
                      placeholder="e.g. Retail Store, Wholesale, Pharmacy, Services, Manufacturing"
                      className="w-full px-3.5 py-2.5 bg-muted/40 border border-border rounded-xl text-foreground font-medium focus:outline-none focus:border-primary shadow-2xs"
                    />
                    <div className="flex flex-wrap items-center gap-1.5 mt-2">
                      {[
                        'Retail Store',
                        'Wholesale & Distribution',
                        'Pharmacy & Healthcare',
                        'Services & Consulting',
                        'Manufacturing & Assembly',
                        'Taxi & Cab Booking',
                        'Hotel & Resort Booking',
                        'School Management',
                        'Coaching & Tuition',
                        'Company Payroll',
                        'Gym & Fitness Center',
                        'Hospital & Clinic OPD',
                      ].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setBusinessTypeInput(preset)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                            businessTypeInput.toLowerCase() === preset.toLowerCase()
                              ? 'bg-primary text-primary-foreground shadow-xs'
                              : 'bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted'
                          }`}
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-foreground mb-1.5">GSTIN / Tax ID Number</label>
                    <input
                      type="text"
                      value={gstinInput}
                      onChange={(e) => setGstinInput(e.target.value)}
                      placeholder="e.g. 27AAAAA0000A1Z5"
                      className="w-full px-3.5 py-2.5 bg-muted/40 border border-border rounded-xl text-foreground font-mono uppercase focus:outline-none focus:border-primary shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-foreground mb-1.5">Country / Jurisdiction</label>
                    <input
                      type="text"
                      value={countryInput}
                      onChange={(e) => setCountryInput(e.target.value)}
                      placeholder="e.g. India"
                      className="w-full px-3.5 py-2.5 bg-muted/40 border border-border rounded-xl text-foreground font-medium focus:outline-none focus:border-primary shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-foreground mb-1.5">Official Phone Number</label>
                    <input
                      type="text"
                      value={phoneInput}
                      onChange={(e) => setPhoneInput(e.target.value)}
                      placeholder="e.g. +91 98765 43210"
                      className="w-full px-3.5 py-2.5 bg-muted/40 border border-border rounded-xl text-foreground font-mono focus:outline-none focus:border-primary shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-foreground mb-1.5">Official Email Address</label>
                    <input
                      type="email"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="e.g. contact@business.local"
                      className="w-full px-3.5 py-2.5 bg-muted/40 border border-border rounded-xl text-foreground font-medium focus:outline-none focus:border-primary shadow-2xs"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block font-semibold text-foreground mb-1.5">Business Address & Store Location</label>
                    <textarea
                      rows={2}
                      value={addressInput}
                      onChange={(e) => setAddressInput(e.target.value)}
                      placeholder="e.g. Shop 42, Central Commercial Complex, MG Road"
                      className="w-full px-3.5 py-2.5 bg-muted/40 border border-border rounded-xl text-foreground font-medium focus:outline-none focus:border-primary shadow-2xs resize-none"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={handleSaveAll}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl shadow-sm teal-glow-sm transition"
                  >
                    <Save className="h-3.5 w-3.5" />
                    <span>Save Business Details</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Finance, Currency & Taxes */}
          {activeTab === 'finance' && (
            <div className="max-w-3xl space-y-6">
              <div>
                <h2 className="text-base font-bold text-foreground">Currency, Tax Policy & Accounting Defaults</h2>
                <p className="text-xs text-muted-foreground">
                  Controls how numbers, currency symbols, and taxes calculate across POS checkout, inventory valuation, and reports.
                </p>
              </div>

              <div className="bg-card border border-border rounded-2xl p-6 shadow-2xs space-y-5">
                <div className="space-y-3">
                  <label className="block text-xs font-semibold text-foreground">Quick Currency Presets</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {Object.entries(CURRENCY_PRESETS).map(([code, item]) => (
                      <button
                        key={code}
                        type="button"
                        onClick={() => handleCurrencySelect(code)}
                        className={`p-2.5 rounded-xl border text-left transition flex items-center justify-between ${
                          currencyInput === code
                            ? 'bg-primary/10 border-primary text-foreground font-bold shadow-2xs'
                            : 'border-border bg-muted/20 text-muted-foreground hover:bg-muted/40'
                        }`}
                      >
                        <span className="text-xs font-mono">{code}</span>
                        <span className="text-sm font-extrabold text-primary font-mono">{item.symbol}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
                  <div>
                    <label className="block font-semibold text-foreground mb-1.5">Currency ISO Code</label>
                    <input
                      type="text"
                      value={currencyInput}
                      onChange={(e) => setCurrencyInput(e.target.value.toUpperCase())}
                      className="w-full px-3.5 py-2.5 bg-muted/40 border border-border rounded-xl text-foreground font-mono font-bold uppercase focus:outline-none focus:border-primary shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-foreground mb-1.5">Currency Symbol</label>
                    <input
                      type="text"
                      value={currencySymbolInput}
                      onChange={(e) => setCurrencySymbolInput(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-muted/40 border border-border rounded-xl text-foreground font-mono font-bold focus:outline-none focus:border-primary shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-foreground mb-1.5">GST / Tax Calculation Preference</label>
                    <select
                      value={taxPreferenceInput}
                      onChange={(e) => setTaxPreferenceInput(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 bg-muted/40 border border-border rounded-xl text-foreground font-medium focus:outline-none focus:border-primary shadow-2xs"
                    >
                      <option value="exclusive">Tax Exclusive (GST added on top of selling price)</option>
                      <option value="inclusive">Tax Inclusive (Prices include all applicable GST)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-foreground mb-1.5">Default GST / Tax Rate (%)</label>
                    <input
                      type="number"
                      value={defaultTaxRateInput}
                      onChange={(e) => setDefaultTaxRateInput(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-muted/40 border border-border rounded-xl text-foreground font-mono font-bold focus:outline-none focus:border-primary shadow-2xs"
                    />
                  </div>
                </div>

                {/* Live Preview Box */}
                <div className="p-4 bg-muted/20 border border-border/80 rounded-xl space-y-1.5">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Live Display Sample
                  </span>
                  <div className="text-lg font-bold text-primary font-mono">
                    {formatCurrency(1499, currencyInput, currencySymbolInput)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    This formatted currency will reflect immediately across all tables, POS totals, and reports.
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={handleSaveAll}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl shadow-sm teal-glow-sm transition"
                  >
                    <Save className="h-3.5 w-3.5" />
                    <span>Save Financial Settings</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: POS & Invoicing */}
          {activeTab === 'pos' && (
            <div className="max-w-3xl space-y-6">
              <div>
                <h2 className="text-base font-bold text-foreground">Point of Sale (POS) & Invoice Policy</h2>
                <p className="text-xs text-muted-foreground">
                  Customize receipt printing, default payment modes, and legal disclaimer notes.
                </p>
              </div>

              <div className="bg-card border border-border rounded-2xl p-6 shadow-2xs space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-semibold text-foreground mb-1.5">Default Payment Method</label>
                    <select
                      value={defaultPaymentInput}
                      onChange={(e) => setDefaultPaymentInput(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-muted/40 border border-border rounded-xl text-foreground font-medium focus:outline-none focus:border-primary shadow-2xs"
                    >
                      <option value="Cash">Cash</option>
                      <option value="UPI">UPI / QR Code</option>
                      <option value="Credit Card">Credit Card</option>
                      <option value="Debit Card">Debit Card</option>
                      <option value="Net Banking">Net Banking</option>
                      <option value="Credit / Pay Later">Credit / Pay Later</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-foreground mb-1.5">Receipt Printing Behavior</label>
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => setAutoPrintInput(!autoPrintInput)}
                        className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-between ${
                          autoPrintInput
                            ? 'bg-primary/10 border-primary text-primary shadow-2xs'
                            : 'border-border bg-muted/20 text-muted-foreground hover:bg-muted/40'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <Printer className="h-4 w-4" />
                          <span>Auto-Open Print Dialog</span>
                        </span>
                        {autoPrintInput ? <Check className="h-4 w-4" /> : null}
                      </button>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block font-semibold text-foreground mb-1.5">
                      Invoice Footer Note & Terms / Disclaimers
                    </label>
                    <textarea
                      rows={3}
                      value={footerNoteInput}
                      onChange={(e) => setFooterNoteInput(e.target.value)}
                      placeholder="e.g. Thank you for shopping with us! Returns accepted within 7 days with original invoice."
                      className="w-full px-3.5 py-2.5 bg-muted/40 border border-border rounded-xl text-foreground font-medium focus:outline-none focus:border-primary shadow-2xs resize-none"
                    />
                    <p className="text-[11px] text-muted-foreground mt-1">
                      This note is permanently appended to the bottom of all generated customer tax invoices.
                    </p>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={handleSaveAll}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl shadow-sm teal-glow-sm transition"
                  >
                    <Save className="h-3.5 w-3.5" />
                    <span>Save POS Preferences</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Appearance & Density */}
          {activeTab === 'appearance' && (
            <div className="max-w-3xl space-y-6">
              <div>
                <h2 className="text-base font-bold text-foreground">Visual Theme & Grid Density</h2>
                <p className="text-xs text-muted-foreground">
                  Select your color theme, spreadsheet row density, and date formatting options.
                </p>
              </div>

              <div className="bg-card border border-border rounded-2xl p-6 shadow-2xs space-y-5">
                <div className="space-y-3">
                  <label className="block text-xs font-semibold text-foreground">Color Theme Mode</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'dark', label: 'Dark Obsidian', desc: 'Deep slate & obsidian dark theme' },
                      { id: 'light', label: 'Light Slate', desc: 'Crisp, high-contrast light theme' },
                      { id: 'system', label: 'System Match', desc: 'Follows macOS / OS settings' },
                    ].map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setTheme(t.id as any)}
                        className={`p-4 rounded-xl border text-left transition flex flex-col justify-between ${
                          theme === t.id
                            ? 'bg-primary/10 border-primary shadow-xs'
                            : 'border-border bg-muted/20 hover:bg-muted/40'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-foreground">{t.label}</span>
                          {theme === t.id && <Check className="h-3.5 w-3.5 text-primary" />}
                        </div>
                        <span className="text-[10px] text-muted-foreground mt-1">{t.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <label className="block text-xs font-semibold text-foreground">Spreadsheet Table Row Density</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'compact', label: 'Compact', desc: 'Maximum data rows per screen' },
                      { id: 'normal', label: 'Normal', desc: 'Standard balanced row height' },
                      { id: 'comfortable', label: 'Comfortable', desc: 'Spacious touch-friendly rows' },
                    ].map((d) => (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => setTableDensity(d.id as any)}
                        className={`p-4 rounded-xl border text-left transition flex flex-col justify-between ${
                          tableDensity === d.id
                            ? 'bg-primary/10 border-primary shadow-xs'
                            : 'border-border bg-muted/20 hover:bg-muted/40'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-foreground">{d.label}</span>
                          {tableDensity === d.id && <Check className="h-3.5 w-3.5 text-primary" />}
                        </div>
                        <span className="text-[10px] text-muted-foreground mt-1">{d.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
                  <div>
                    <label className="block font-semibold text-foreground mb-1.5">Date Display Format</label>
                    <select
                      value={dateFormatInput}
                      onChange={(e) => setDateFormatInput(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-muted/40 border border-border rounded-xl text-foreground font-medium focus:outline-none focus:border-primary shadow-2xs"
                    >
                      <option value="YYYY-MM-DD">YYYY-MM-DD (e.g. 2026-08-30)</option>
                      <option value="DD/MM/YYYY">DD/MM/YYYY (e.g. 30/08/2026)</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY (e.g. 08/30/2026)</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={handleSaveAll}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl shadow-sm teal-glow-sm transition"
                  >
                    <Save className="h-3.5 w-3.5" />
                    <span>Apply Appearance</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: Storage & Backups */}
          {activeTab === 'storage' && (
            <div className="max-w-3xl space-y-6">
              <div>
                <h2 className="text-base font-bold text-foreground">Local Workbook Data Store & Backups</h2>
                <p className="text-xs text-muted-foreground">
                  Your business is completely local and stored inside a single user-owned .xlsx workbook.
                </p>
              </div>

              {/* Active Workbook Info Card */}
              <div className="bg-card border border-border rounded-2xl p-6 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <FileSpreadsheet className="h-5 w-5 text-primary" />
                    <div>
                      <h3 className="text-sm font-bold text-foreground">Active Excel Store</h3>
                      <p className="text-xs text-muted-foreground">Primary local database file</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={reloadWorkbook}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-muted hover:bg-muted/80 text-foreground border border-border rounded-xl transition"
                      title="Reload from disk"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      <span>Reload</span>
                    </button>
                    <button
                      onClick={() => openModal('welcome')}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground font-bold rounded-xl border border-primary/20 transition"
                    >
                      <FolderOpen className="h-3.5 w-3.5" />
                      <span>Switch / Open File</span>
                    </button>
                  </div>
                </div>

                {metadata ? (
                  <div className="bg-muted/20 border border-border/70 rounded-xl p-4 text-xs space-y-2 font-mono">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground font-sans">Filename:</span>
                      <span className="font-bold text-foreground">{metadata.fileName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground font-sans">Storage Path:</span>
                      <span className="text-muted-foreground truncate max-w-sm" title={metadata.filePath}>
                        {metadata.filePath}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground font-sans">File Size:</span>
                      <span className="text-foreground">{(metadata.fileSize / 1024).toFixed(1)} KB</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground font-sans">Sheets:</span>
                      <span className="text-primary font-bold">{metadata.sheetNames.length} registered tables</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground">No workbook loaded yet.</div>
                )}
              </div>

              {/* Auto-Save Configuration */}
              <div className="bg-card border border-border rounded-2xl p-6 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-foreground">Background Auto-Save</h3>
                    <p className="text-xs text-muted-foreground">Automatically write changes to the .xlsx workbook</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAutoSaveEnabledInput(!autoSaveEnabledInput)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition ${
                      autoSaveEnabledInput
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'border-border text-muted-foreground bg-muted/20'
                    }`}
                  >
                    {autoSaveEnabledInput ? 'Auto-Save Enabled' : 'Disabled'}
                  </button>
                </div>

                {autoSaveEnabledInput && (
                  <div className="space-y-2 pt-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Debounce Interval:</span>
                      <span className="font-bold font-mono text-primary">{autoSaveIntervalInput} seconds</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={30}
                      value={autoSaveIntervalInput}
                      onChange={(e) => setAutoSaveIntervalInput(Number(e.target.value))}
                      className="w-full accent-primary"
                    />
                  </div>
                )}
              </div>

              {/* Backups & Snapshots */}
              <div className="bg-card border border-border rounded-2xl p-6 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Sliders className="h-5 w-5 text-indigo-500" />
                    <div>
                      <h3 className="text-sm font-bold text-foreground">Workbook Snapshots & Backups</h3>
                      <p className="text-xs text-muted-foreground">Automated hourly and manual backup copies</p>
                    </div>
                  </div>
                  <button
                    onClick={handleCreateBackup}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-muted hover:bg-muted/80 text-foreground border border-border rounded-xl font-medium transition"
                  >
                    <span>Create Snapshot Now</span>
                  </button>
                </div>

                {backups.length === 0 ? (
                  <div className="p-6 text-center text-xs text-muted-foreground border border-dashed border-border rounded-xl">
                    No snapshots captured yet. Click "Create Snapshot Now" to generate an instantaneous recovery checkpoint.
                  </div>
                ) : (
                  <div className="border border-border rounded-xl overflow-hidden divide-y divide-border/60">
                    {backups.map((b) => (
                      <div
                        key={b.path}
                        className="px-4 py-3 flex items-center justify-between text-xs hover:bg-muted/15 transition"
                      >
                        <div>
                          <div className="font-mono font-bold text-foreground">{b.filename}</div>
                          <div className="text-[10px] text-muted-foreground mt-0.5">
                            {formatDate(b.timestamp)} • {(b.sizeBytes / 1024).toFixed(1)} KB
                          </div>
                        </div>
                        <button
                          onClick={() => handleRestore(b.path)}
                          className="flex items-center gap-1 px-2.5 py-1 text-[11px] bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground font-bold rounded-lg transition"
                        >
                          <RotateCcw className="h-3 w-3" />
                          <span>Restore</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
