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
    templateID: string | null;
    setTemplateID: (params: string) => void;
    openNew: boolean | null;
    setOpenNew: (params: boolean) => void;
    settingsTask: null | number;
    setSettingsTask: (params: number) => void;
    settingsBoard: null | number;
    setSettingsBoard: (params: number) => void;
    inviteToProject: boolean | null;
    setInviteToProject: (params: boolean) => void;

    openKanbanSettings: boolean | null;
    setOpenKanbanSettings: (params: boolean) => void;

    openKanbanChat: boolean | null;
    setOpenKanbanChat: (params: boolean) => void;


    chatListener: boolean | null;
    setChatListener: (params: boolean) => void;


sidebarLoc: string | null;
    setSidebarLoc: (params: string) => void;


}

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
    templateID: "",
    setTemplateID: (params: string) => set({ templateID: params }),
    openNew: false,
    setOpenNew: (params: boolean) => set({ openNew: params }),
    settingsTask: null,
    setSettingsTask: (params: number) => set({ settingsTask: params }),
    settingsBoard: null,
    setSettingsBoard: (params: number) => set({ settingsBoard: params }),

    inviteToProject: null,
    setInviteToProject: (params: boolean) => set({ inviteToProject: params }),

    openKanbanSettings: null,
    setOpenKanbanSettings: (params: boolean) => set({ openKanbanSettings: params }),

    openKanbanChat: null,
    setOpenKanbanChat: (params: boolean) => set({ openKanbanChat: params }),

    
    chatListener: null,
    setChatListener: (params: boolean) => set({ chatListener: params }),

    sidebarLoc: "Home",
    setSidebarLoc: (params: string) => set({ sidebarLoc: params }),


}));

export default useStore;
