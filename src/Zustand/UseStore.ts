// src/store/useStore.ts
import { create } from 'zustand';

interface AppState {
    showNotif: boolean | null;
    setShowNotif: (params: boolean) => void;
    editTask: boolean | null;
    setEditTask: (params: boolean) => void;
    removeValue: () => void;
}

// Create a single Zustand store with combined state and actions
const useStore = create<AppState>((set) => ({
    showNotif: false,
    setShowNotif: (params: boolean) => set({ showNotif: params }),
    removeValue: () => set({ showNotif: null }),
    editTask: false,
    setEditTask: (params: boolean) => set({ editTask: params }),
}));

export default useStore;
