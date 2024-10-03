// src/store/useStore.ts
import { create } from 'zustand';

interface AppState {
    showNotif: boolean | null;
    setShowNotif: (params: boolean) => void;
    editTask: boolean | null;
    setEditTask: (params: boolean) => void;
    removeValue: () => void;

    showCreate: string | null;
    setShowCreate: (params: string) => void;


    createdAt: string | null;
    setCreatedAt: (params: string) => void;

}

// Create a single Zustand store with combined state and actions
const useStore = create<AppState>((set) => ({
    showNotif: false,
    setShowNotif: (params: boolean) => set({ showNotif: params }),
    removeValue: () => set({ showNotif: null }),
    editTask: false,
    setEditTask: (params: boolean) => set({ editTask: params }),

    showCreate: "",
    setShowCreate: (params: string) => set({ showCreate: params }),

    createdAt: "",
    setCreatedAt: (params: string) => set({ createdAt: params }),

}));

export default useStore;
