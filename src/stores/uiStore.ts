import { create } from 'zustand';

export interface AppNotification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
}

interface UIState {
  isSidebarCollapsed: boolean;
  activeModal:
    | 'new_sale'
    | 'add_product'
    | 'add_category'
    | 'add_customer'
    | 'add_supplier'
    | 'add_expense'
    | 'stock_movement'
    | 'create_table'
    | 'chart_builder'
    | 'invoice_preview'
    | 'backup_manager'
    | 'welcome'
    | null;
  modalData: any;
  commandPaletteOpen: boolean;
  notifications: AppNotification[];

  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  openModal: (modal: UIState['activeModal'], data?: any) => void;
  closeModal: () => void;
  setCommandPaletteOpen: (open: boolean) => void;
  addNotification: (type: AppNotification['type'], title: string, message: string) => void;
  removeNotification: (id: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isSidebarCollapsed: false,
  activeModal: null,
  modalData: null,
  commandPaletteOpen: false,
  notifications: [],

  toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
  setSidebarCollapsed: (isSidebarCollapsed) => set({ isSidebarCollapsed }),
  openModal: (activeModal, modalData = null) => set({ activeModal, modalData }),
  closeModal: () => set({ activeModal: null, modalData: null }),
  setCommandPaletteOpen: (commandPaletteOpen) => set({ commandPaletteOpen }),

  addNotification: (type, title, message) => {
    const id = `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const notification: AppNotification = {
      id,
      type,
      title,
      message,
      timestamp: new Date().toLocaleTimeString(),
    };
    set((state) => ({ notifications: [notification, ...state.notifications].slice(0, 10) }));

    // Auto dismiss after 5s
    setTimeout(() => {
      set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id),
      }));
    }, 5000);
  },

  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
}));
