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

  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setAutoSave: (enabled: boolean, interval?: number) => void;
  setTableDensity: (density: 'compact' | 'normal' | 'comfortable') => void;
  setSheetHiddenColumns: (sheetName: string, hiddenCols: string[]) => void;
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
    businessAddress: '123 Market Road, Suite 400',
    businessPhone: '+91 98765 43210',
    businessEmail: 'contact@mybusiness.local',
    businessGstin: '27AAAAA0000A1Z5',

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
