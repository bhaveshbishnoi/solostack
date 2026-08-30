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

  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setAutoSave: (enabled: boolean, interval?: number) => void;
  setTableDensity: (density: 'compact' | 'normal' | 'comfortable') => void;
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

  return {
    theme: savedTheme,
    autoSaveEnabled: true,
    autoSaveIntervalSeconds: 3,
    tableDensity: 'normal',
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
