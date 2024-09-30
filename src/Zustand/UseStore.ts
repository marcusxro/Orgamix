// src/store/useStore.ts
import { create } from 'zustand';


interface AppState {
    showNotif: boolean | null;
    setShowNotif: (params: boolean) => void;
}

// Create the Zustand store with initial state and actions
const useStoreBoolean = create<AppState>((set) => ({
    showNotif: false,
    setShowNotif: (params: boolean) => set({ showNotif: params }),
    removeValue: () => set({showNotif: null})
}));

export default useStoreBoolean;
