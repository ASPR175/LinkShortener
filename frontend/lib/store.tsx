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
  totalClicks: number;
  countryStats: { country: string; count: number }[];
  referrerStats: { referrer: string; count: number }[];
  deviceStats: { device: string; count: number }[];
  browserStats: { browser: string; count: number }[];
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

      
      setAnalytics: (linkId, data) =>
        set((state) => ({
          analytics: { ...state.analytics, [linkId]: data },
        })),

      clearAnalytics: () => set({ analytics: {} }),
    }),
    {
      name: "user-storage",
    }
  )
);

export default useAppStore;
