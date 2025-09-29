import { create } from "zustand";
import { persist } from "zustand/middleware";

type User = {
  Name: string;
  Email: string;
  AvatarURL: string;
  token: string;
};

type Link = {
  _id: string;
  short_id: string;
  original: string;
  clicks: number;
  created_at: string;
  updated_at?: string;
  workspace_id?: string | null;
};

type Analytics = {
  clicks: number;
  uniqueClicks:number;
  country: { country: string; clicks: number }[];
  referrer: { referrer: string; clicks: number }[];
  device: { device: string; clicks: number }[];
  browser: { browser: string; clicks: number }[];
   timestamp: { date: string; clicks: number ; uniqueClicks: number}[]; 
};
type Workspace = {
  _id: string;
  name: string;
  role: "admin" | "member";
  links: Link[];
  members: {
    _id: string;
    name: string;
    email: string;
    avatarURL: string;
    role: "admin" | "member";
  }[];
};
type Store = {
  user: User | null;
  links: Link[];
  analytics: Record<string, Analytics>;

  setUser: (user: User) => void;
  clearUser: () => void;

  setLinks: (links: any[]) => void;
  addLink: (link: any) => void;
  removeLink: (id: string) => void;
  updateLink: (id: string, newData: any) => void;

  setAnalytics: (linkId: string, data: Analytics) => void;
  clearAnalytics: () => void;

      currentWorkspaceId: string | null;
  workspaces: Workspace[];

  setCurrentWorkspace: (id: string | null) => void;
  setWorkspaces: (workspaces: Workspace[]) => void;
  addWorkspace: (workspace: Workspace) => void;
  updateWorkspace: (id: string, newData: Partial<Workspace>) => void;
  removeWorkspace: (id: string) => void;
};


function normalizeLink(apiLink: any): Link {
  return {
    _id: apiLink._id ?? apiLink.ID ?? "",
    short_id: apiLink.short_id ?? apiLink.ShortID ?? "",
    original: apiLink.original ?? apiLink.Original ?? "",
    clicks: apiLink.clicks ?? apiLink.Clicks ?? 0,
    created_at: apiLink.created_at ?? apiLink.CreatedAt ?? new Date().toISOString(),
    updated_at: apiLink.updated_at ?? apiLink.updatedAt ?? undefined,
    workspace_id: apiLink.workspace_id ?? apiLink.WorkspaceID ?? null,
  };
}

const useAppStore = create<Store>()(
  persist(
    (set) => ({
      user: null,
      links: [],
      analytics: {},

      
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null, links: [], analytics: {} }),

        currentWorkspaceId: null,
workspaces: [],

setCurrentWorkspace: (id) => set({ currentWorkspaceId: id }),

setWorkspaces: (ws) => set({ workspaces: ws }),

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

      setLinks: (links) =>
        set({
          links: Array.isArray(links) ? links.map((l) => normalizeLink(l)) : [],
        }),

      addLink: (link) =>
        set((state) => {
          const normalized = normalizeLink(link);
          return {
            links: state.links.some((l) => l._id === normalized._id)
              ? state.links.map((l) =>
                  l._id === normalized._id ? normalized : l
                )
              : [...state.links, normalized],
          };
        }),

      removeLink: (id) =>
        set((state) => {
          const { [id]: _, ...restAnalytics } = state.analytics;
          return {
            links: state.links.filter((l) => l._id !== id),
            analytics: restAnalytics,
          };
        }),

      updateLink: (id, newData) =>
        set((state) => ({
          links: state.links.map((l) =>
            l._id === id ? { ...l, ...normalizeLink(newData) } : l
          ),
        })),

      
   setAnalytics: (linkId, data: any) =>
  set((state) => {
    const normalized: Analytics = {
      clicks: data.clicks ?? 0,
      uniqueClicks: data.uniqueClicks ?? 0,

      country: (data.country ?? []).map((c: any) => ({
        country: c._id || "Unknown",
        clicks: c.clicks ?? 0,
      })),

      referrer: (data.referrer ?? []).map((r: any) => ({
        referrer: r._id || "Direct",
        clicks: r.clicks ?? 0,
      })),

      device: (data.device ?? []).map((d: any) => ({
        device: d._id || "Unknown",
        clicks: d.clicks ?? 0,
      })),

      browser: (data.browser ?? []).map((b: any) => ({
        browser: b._id || "Unknown",
        clicks: b.clicks ?? 0,
      })),

      timestamp: (data.timestamp ?? []).map((t: any) => ({
        date: t.date || t._id || "",
        clicks: t.clicks ?? 0,
        uniqueClicks: t.uniqueClicks ?? 0,
      })),
    };

    return {
      analytics: { ...state.analytics, [linkId]: normalized },
    };
  }),


      clearAnalytics: () => set({ analytics: {} }),
     
    }),
    {
      name: "user-storage",
    }
  )
);

export default useAppStore;
