import { create } from 'zustand';

interface UIState {
  sidebarCollapsed: boolean;
  activeView: 'home' | 'interview' | 'dashboard' | 'manuscript';
  showNewManuscriptModal: boolean;
  notification: { type: 'success' | 'error' | 'info'; message: string } | null;

  toggleSidebar: () => void;
  setActiveView: (view: UIState['activeView']) => void;
  setShowNewManuscriptModal: (show: boolean) => void;
  showNotification: (type: 'success' | 'error' | 'info', message: string) => void;
  clearNotification: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  activeView: 'home',
  showNewManuscriptModal: false,
  notification: null,

  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setActiveView: (view) => set({ activeView: view }),
  setShowNewManuscriptModal: (show) => set({ showNewManuscriptModal: show }),
  showNotification: (type, message) => {
    set({ notification: { type, message } });
    setTimeout(() => set({ notification: null }), 4000);
  },
  clearNotification: () => set({ notification: null }),
}));
