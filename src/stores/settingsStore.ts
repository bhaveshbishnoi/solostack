import { create } from 'zustand';

interface SettingsState {
  theme: 'light' | 'dark' | 'system';
  autoSaveEnabled: boolean;
  autoSaveIntervalSeconds: number;
  tableDensity: 'compact' | 'normal' | 'comfortable';
  businessAddress: string;
  businessPhone: string;
  businessEmail: string;
  businessGstin: string;

  sheetHiddenColumns: Record<string, string[]>;
  invoiceFooterNote: string;
  defaultPaymentMethod: string;
  receiptAutoPrint: boolean;
  lastWorkbookPath: string | null;
  hasCompletedOnboarding: boolean;

  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setAutoSave: (enabled: boolean, interval?: number) => void;
  setTableDensity: (density: 'compact' | 'normal' | 'comfortable') => void;
  setSheetHiddenColumns: (sheetName: string, hiddenCols: string[]) => void;
  setLastWorkbookPath: (path: string | null) => void;
  setHasCompletedOnboarding: (completed: boolean) => void;
  setInvoicePreferences: (prefs: {
    invoiceFooterNote?: string;
    defaultPaymentMethod?: string;
    receiptAutoPrint?: boolean;
  }) => void;
  updateBusinessProfile: (profile: {
    address?: string;
    phone?: string;
    email?: string;
    gstin?: string;
  }) => void;
}

export const useSettingsStore = create<SettingsState>((set) => {
  // Initialize theme from system or saved preference
  const savedTheme = (typeof window !== 'undefined' && localStorage.getItem('exdrow_theme')) as any || 'dark';
  const savedHidden = typeof window !== 'undefined' && localStorage.getItem('exdrow_hidden_columns')
    ? JSON.parse(localStorage.getItem('exdrow_hidden_columns') || '{}')
    : {};

  return {
    theme: savedTheme,
    autoSaveEnabled: true,
    autoSaveIntervalSeconds: 3,
    tableDensity: 'normal',
    sheetHiddenColumns: savedHidden,
    invoiceFooterNote: (typeof window !== 'undefined' && localStorage.getItem('exdrow_invoice_footer')) || 'Thank you for your business! Goods once sold are subject to store policy.',
    defaultPaymentMethod: (typeof window !== 'undefined' && localStorage.getItem('exdrow_default_payment')) || 'Cash',
    receiptAutoPrint: (typeof window !== 'undefined' && localStorage.getItem('exdrow_autoprint') === 'true') || false,
    lastWorkbookPath: (typeof window !== 'undefined' && localStorage.getItem('exdrow_last_workbook_path')) || null,
    hasCompletedOnboarding: (typeof window !== 'undefined' && localStorage.getItem('exdrow_has_onboarded') === 'true'),
    businessAddress: '123 Market Road, Suite 400',
    businessPhone: '+91 98765 43210',
    businessEmail: 'contact@mybusiness.local',
    businessGstin: '27AAAAA0000A1Z5',

    setLastWorkbookPath: (path) => {
      if (typeof window !== 'undefined') {
        if (path) {
          localStorage.setItem('exdrow_last_workbook_path', path);
        } else {
          localStorage.removeItem('exdrow_last_workbook_path');
        }
      }
      set({ lastWorkbookPath: path });
    },

    setHasCompletedOnboarding: (hasCompletedOnboarding) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('exdrow_has_onboarded', String(hasCompletedOnboarding));
      }
      set({ hasCompletedOnboarding });
    },

    setTheme: (theme) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('exdrow_theme', theme);
        const root = document.documentElement;
        if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      }
      set({ theme });
    },

    setAutoSave: (enabled, interval) => {
      set((state) => ({
        autoSaveEnabled: enabled,
        autoSaveIntervalSeconds: interval ?? state.autoSaveIntervalSeconds,
      }));
    },

    setTableDensity: (tableDensity) => set({ tableDensity }),

    setSheetHiddenColumns: (sheetName, hiddenCols) => {
      set((state) => {
        const updated = {
          ...state.sheetHiddenColumns,
          [sheetName]: hiddenCols,
        };
        if (typeof window !== 'undefined') {
          localStorage.setItem('exdrow_hidden_columns', JSON.stringify(updated));
        }
        return { sheetHiddenColumns: updated };
      });
    },

    setInvoicePreferences: (prefs) => {
      set((state) => {
        const updatedFooter = prefs.invoiceFooterNote ?? state.invoiceFooterNote;
        const updatedPayment = prefs.defaultPaymentMethod ?? state.defaultPaymentMethod;
        const updatedAutoPrint = prefs.receiptAutoPrint ?? state.receiptAutoPrint;

        if (typeof window !== 'undefined') {
          localStorage.setItem('exdrow_invoice_footer', updatedFooter);
          localStorage.setItem('exdrow_default_payment', updatedPayment);
          localStorage.setItem('exdrow_autoprint', String(updatedAutoPrint));
        }

        return {
          invoiceFooterNote: updatedFooter,
          defaultPaymentMethod: updatedPayment,
          receiptAutoPrint: updatedAutoPrint,
        };
      });
    },

    updateBusinessProfile: (profile) => {
      set((state) => ({
        businessAddress: profile.address ?? state.businessAddress,
        businessPhone: profile.phone ?? state.businessPhone,
        businessEmail: profile.email ?? state.businessEmail,
        businessGstin: profile.gstin ?? state.businessGstin,
      }));
    },
  };
});
