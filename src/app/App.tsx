import React, { useEffect, useRef } from 'react';
import { useWorkbookStore } from '../stores/workbookStore';
import { useSettingsStore } from '../stores/settingsStore';
import { useUIStore } from '../stores/uiStore';
import { Topbar } from '../components/layout/Topbar';
import { Sidebar } from '../components/layout/Sidebar';
import { CommandPalette } from '../components/layout/CommandPalette';
import { NotificationCenter } from '../features/feedback/NotificationCenter';
import { WelcomeModal } from '../features/onboarding/WelcomeModal';
import { DashboardView } from '../features/dashboard/DashboardView';
import { TableWorkspace } from '../features/tables/TableWorkspace';
import { AnalyticsView } from '../features/analytics/AnalyticsView';
import { ReportsView } from '../features/reports/ReportsView';
import { SettingsView } from '../features/settings/SettingsView';
import { NewSalePage } from '../features/sales/NewSalePage';
import { RecordFormPage } from '../features/records/RecordFormPage';
import { RecordDetailPage } from '../features/records/RecordDetailPage';
import { CreateTablePage } from '../features/custom-tables/CreateTablePage';
import { NewSaleModal } from '../features/sales/NewSaleModal';
import { InvoiceModal } from '../features/sales/InvoiceModal';
import { AddProductModal } from '../features/products/AddProductModal';
import { AddCustomerModal } from '../features/customers/AddCustomerModal';
import { AddExpenseModal } from '../features/expenses/AddExpenseModal';
import { StockMovementModal } from '../features/inventory/StockMovementModal';
import { CreateTableModal } from '../features/custom-tables/CreateTableModal';
import { ChartBuilderModal } from '../features/charts/ChartBuilderModal';
import { BusinessTemplateHubModal } from '../features/templates/BusinessTemplateHubModal';

export const App: React.FC = () => {
  const {
    activeSheetName,
    metadata,
    saveStatus,
    saveWorkbook,
  } = useWorkbookStore();

  const {
    theme,
    autoSaveEnabled,
    autoSaveIntervalSeconds,
    lastWorkbookPath,
    hasCompletedOnboarding,
  } = useSettingsStore();
  const { openWorkbook } = useWorkbookStore();
  const { openModal, addNotification } = useUIStore();

  // Apply dark theme class to <html>
  useEffect(() => {
    const root = document.documentElement;
    if (
      theme === 'dark' ||
      (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    ) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // Global Keyboard Shortcuts (Cmd+S for save, etc.)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        saveWorkbook().then(() => {
          addNotification('success', 'Workbook Saved', 'Changes persisted to Excel');
        }).catch((err) => {
          addNotification('error', 'Save Failed', err.message);
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [saveWorkbook, addNotification]);

  // On App Launch: Auto-restore last opened workbook, or show welcome modal strictly ONCE for brand new users
  useEffect(() => {
    let isMounted = true;

    const restoreLastWorkbookOrShowOnboarding = async () => {
      if (lastWorkbookPath && !metadata) {
        try {
          await openWorkbook(lastWorkbookPath);
          return;
        } catch (err) {
          console.warn('Could not auto-reload previous workbook:', err);
        }
      }

      // Strictly show welcome popup ONETIME if user has never onboarded
      if (!hasCompletedOnboarding && !metadata && isMounted) {
        openModal('welcome');
      }
    };

    restoreLastWorkbookOrShowOnboarding();

    return () => {
      isMounted = false;
    };
  }, []);

  // Debounced Auto-Save
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (!autoSaveEnabled || saveStatus !== 'unsaved' || !metadata) return;

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(() => {
      saveWorkbook().catch((err) => {
        console.error('Auto-save error:', err);
      });
    }, autoSaveIntervalSeconds * 1000);

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [saveStatus, autoSaveEnabled, autoSaveIntervalSeconds, metadata, saveWorkbook]);

  // Render main view based on activeSheetName
  const renderMainContent = () => {
    // Settings is always accessible
    if (activeSheetName === 'settings') {
      return <SettingsView />;
    }

    if (!metadata) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white flex items-center justify-center teal-glow shadow-xl font-black text-2xl tracking-tight">
            Ex
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-foreground">Welcome to Exdrow</h2>
            <p className="text-xs text-muted-foreground max-w-sm">
              Please create a new business workbook or open an existing .xlsx file to begin.
            </p>
          </div>
          <button
            onClick={() => openModal('welcome')}
            className="px-5 py-2.5 text-xs bg-primary text-primary-foreground font-bold rounded-xl shadow-md teal-glow hover:bg-primary/90 transition"
          >
            Open / Create Workbook
          </button>
        </div>
      );
    }

    switch (activeSheetName) {
      case 'dashboard':
        return <DashboardView />;
      case 'new_sale':
        return <NewSalePage />;
      case 'record_form':
        return <RecordFormPage />;
      case 'record_detail':
        return <RecordDetailPage />;
      case 'create_table':
        return <CreateTablePage />;
      case 'analytics':
        return <AnalyticsView />;
      case 'reports':
        return <ReportsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <TableWorkspace sheetName={activeSheetName} />;
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-background text-foreground overflow-hidden font-sans select-none">
      {/* Topbar */}
      <Topbar />

      {/* Main Layout Area: Sidebar + Active Canvas */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 flex flex-col overflow-hidden relative">
          {renderMainContent()}
        </main>
      </div>

      {/* Modals & Dialogs */}
      <WelcomeModal />
      <BusinessTemplateHubModal />
      <NewSaleModal />
      <InvoiceModal />
      <AddProductModal />
      <AddCustomerModal />
      <AddExpenseModal />
      <StockMovementModal />
      <CreateTableModal />
      <ChartBuilderModal />
      <CommandPalette />
      <NotificationCenter />
    </div>
  );
};
