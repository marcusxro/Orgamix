import { create } from 'zustand';

interface taskDataType {
    title: string;
    deadline: string;
    description: string;
    id: number;
    isdone: boolean;
    priority: string;
    userid: string;
    repeat: string
    createdAt: string;
    link: string[];
    category: string;
}
interface dataType {
    id: number;
    content: string;
    created_at: any; // Assuming this is a timestamp in milliseconds
    uid: string;
    linkofpage: string;
  }
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
    viewNotifs: boolean | null;
    setViewNotifs: (params: boolean) => void;
    isSidebarHover: boolean | null;
    setIsSidebarHover: (params: boolean) => void;
    loading: boolean | null;
    setLoading: (params: boolean) => void;
    viewEditTask: taskDataType | null;
    setViewEditTask: (params: taskDataType | null) => void;
    viewTask: taskDataType | null;
    setViewTask: (task: taskDataType | null) => void;
    isSort: boolean | null;
    setSort: (params: boolean) => void;



    isShowAdd: boolean | null;
    setIsShowAdd: (params: boolean) => void;

    
    showMenu: boolean | null;
    setShowMenu: (params: boolean) => void;
    
    
    isProgress: string | null;
    setProgress: (params: string) => void;


    
    mobileShow: boolean | null;
    setMobileShow: (params: boolean) => void;


    notifData: taskDataType | null;
    setNotifData: (task: taskDataType | null) => void;

    showActivity: boolean | null;
    setShowActivity: (params: boolean) => void;

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
    viewNotifs: null,
    setViewNotifs: (params: boolean) => set({ viewNotifs: params }),
    isSidebarHover: null,
    setIsSidebarHover: (params: boolean) => set({ isSidebarHover: params }),
    loading: null,
    setLoading: (params: boolean) => set({ loading: params }),
    viewEditTask: null,
    setViewEditTask: (taskData) => set({ viewEditTask: taskData }),
    viewTask: null,
    setViewTask: (task) => set({ viewTask: task }),

    isSort: null,
    setSort: (params: boolean) => set({ isSort: params }),

    isShowAdd: false,
    setIsShowAdd: (params: boolean) => set({ isShowAdd: params }),

    showMenu: false,
    setShowMenu: (params: boolean) => set({ showMenu: params }),

    isProgress: "tutorial",
    setProgress: (params: string) => set({ isProgress: params }),


    mobileShow: false,
    setMobileShow: (params: boolean) => set({ mobileShow: params }),

    notifData: null,
    setNotifData: (task) => set({ notifData: task }),


    showActivity: null,
    setShowActivity: (task) => set({ showActivity: task }),


}));

export default useStore;
