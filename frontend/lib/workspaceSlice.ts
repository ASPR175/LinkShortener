import { StateCreator } from "zustand";
import { Workspace } from "./types";
import { normalizeLink } from "./linkSlice";

export type WorkspaceSlice = {
  workspaces: Workspace[];
  currentWorkspaceId: string | null;
  setWorkspaces: (ws: Workspace[]) => void;
  setCurrentWorkspace: (id: string | null) => void;
  addWorkspace: (workspace: Workspace) => void;
  updateWorkspace: (id: string, newData: Partial<Workspace>) => void;
  removeWorkspace: (id: string) => void;
  fetchWorkspaces: (token: string) => Promise<void>;
  fetchWorkspaceDetail: (id: string, token: string) => Promise<void>;
};

export const createWorkspaceSlice: StateCreator<WorkspaceSlice> = (set) => ({
  workspaces: [],
  currentWorkspaceId: null,

  setWorkspaces: (ws) => set({ workspaces: ws }),
  setCurrentWorkspace: (id) => set({ currentWorkspaceId: id }),

  addWorkspace: (workspace) =>
    set((state) => ({
      workspaces: state.workspaces.some((w) => w._id === workspace._id)
        ? state.workspaces.map((w) => (w._id === workspace._id ? workspace : w))
        : [...state.workspaces, workspace],
    })),

  updateWorkspace: (id, newData) =>
    set((state) => ({
      workspaces: state.workspaces.map((w) =>
        w._id === id ? { ...w, ...newData } : w
      ),
    })),

  removeWorkspace: (id) =>
    set((state) => ({
      workspaces: state.workspaces.filter((w) => w._id !== id),
    })),

  fetchWorkspaces: async (token) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/workspace`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      set({ workspaces: data.workspaces || [] });
    } catch (err) {
      console.error("fetchWorkspaces error", err);
    }
  },

  // fetchWorkspaceDetail: async (id, token) => {
  //   try {
  //     const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/workspace/${id}`, {
  //       headers: { Authorization: `Bearer ${token}` },
  //     });
  //     const data = await res.json();

  //     set((state) => ({
  //       workspaces: state.workspaces.map((w) =>
  //         w._id === id
  //           ? { ...w, ...data.workspace, links: (data.links || []).map(normalizeLink) }
  //           : w
  //       ),
  //       currentWorkspaceId: id,
  //     }));
  //   } catch (err) {
  //     console.error("fetchWorkspaceDetail error", err);
  //   }
  // },
  fetchWorkspaceDetail: async (id, token) => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/workspace/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();

    const workspace = {
      ...data.workspace,
      links: (data.links || []).map(normalizeLink),
    };

    set((state) => ({
      workspaces: state.workspaces.some((w) => w._id === id)
        ? state.workspaces.map((w) => (w._id === id ? workspace : w))
        : [...state.workspaces, workspace],
      currentWorkspaceId: id,
      links: workspace.links,
    }));

    return workspace;
  } catch (err) {
    console.error("fetchWorkspaceDetail error", err);
    throw err;
  }
},

});
