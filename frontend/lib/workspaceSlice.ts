
import { StateCreator } from "zustand";
import { Workspace } from "./types";
import { normalizeLink } from "./linkSlice";

export type WorkspaceSlice = {
  workspaces: Workspace[];
  currentWorkspaceId: string | null;

  setWorkspaces: (ws: Workspace[]) => void;
  setCurrentWorkspace: (id: string | null) => void;

  addOrUpdateWorkspace: (workspace: Workspace) => void;
  removeWorkspace: (id: string) => void;

  fetchWorkspaces: (token: string) => Promise<void>;
  fetchWorkspaceDetail: (id: string, token: string) => Promise<Workspace>;
};

export const createWorkspaceSlice: StateCreator<WorkspaceSlice> = (set,_get,_api) => ({
  workspaces: [],
  currentWorkspaceId: null,

  setWorkspaces: (ws) => set({ workspaces: ws }),
  setCurrentWorkspace: (id) => set({ currentWorkspaceId: id }),


  addOrUpdateWorkspace: (workspace) =>
    set((state) => {
      const exists = state.workspaces.some((w) => w._id === workspace._id);
      return {
        workspaces: exists
          ? state.workspaces.map((w) => (w._id === workspace._id ? workspace : w))
          : [...state.workspaces, workspace],
      };
    }),

  removeWorkspace: (id) =>
    set((state) => ({
      workspaces: state.workspaces.filter((w) => w._id !== id),
    })),

  fetchWorkspaces: async (token) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/workspace`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        console.error(`fetchWorkspaces: HTTP ${res.status}`);
        return;
      }

      const data = await res.json();
      const normalized: Workspace[] = (data.workspaces || []).map((ws: any) => ({
        _id: ws._id?.toString() ?? crypto.randomUUID(),
        name: ws.name ?? "Unnamed",
        role: ws.role ?? "member",
        links: (ws.links || []).map(normalizeLink),
        members: ws.members ?? [],
      }));

      set({ workspaces: normalized });
    } catch (err) {
      console.error("fetchWorkspaces error", err);
    }
  },

  fetchWorkspaceDetail: async (id, token) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/workspace/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      const workspace: Workspace = {
        _id: data.workspace._id.toString(),
        name: data.workspace.name,
        role: data.workspace.role,
        links: (data.links || []).map(normalizeLink),
        members: data.workspace.members || [],
      };

      set((state) => {
        const exists = state.workspaces.some((w) => w._id === id);
        return {
          workspaces: exists
            ? state.workspaces.map((w) => (w._id === id ? workspace : w))
            : [...state.workspaces, workspace],
          currentWorkspaceId: id,
        };
      });

      return workspace;
    } catch (err) {
      console.error("fetchWorkspaceDetail error", err);
      throw err;
    }
  },
});

