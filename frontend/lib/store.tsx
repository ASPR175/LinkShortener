
import { create } from "zustand";
import { persist } from "zustand/middleware";

type User = {
  Name:string
  Email: string;
  AvatarURL: string;
  token:string
};

type Link = {
  _id: string;
  short_id: string;
  original: string;
  clicks: number;
  createdAt: string;
  updatedAt?: string;
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

  setLinks: (links: Link[]) => void;
  addLink: (link: Link) => void;
  removeLink: (id: string) => void;
  updateLink: (id: string, newData: Partial<Link>) => void;

  setAnalytics: (linkId: string, data: Analytics) => void;
  clearAnalytics: () => void;
};

const useAppStore = create<Store>()(
  persist(
   (set) => ({
      user: null,
      links: [],
      analytics: {},

      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null, links: [], analytics: {} }),

      setLinks: (links) => set({ links }),
     addLink: (link) =>
  set((state) => ({
    links: state.links.some((l) => l._id === link._id)
      ? state.links.map((l) => (l._id === link._id ? link : l))
      : [...state.links, link],
  })),

      removeLink: (id) =>
        set((state) => ({
          links: state.links.filter((l) => l._id !== id),
        })),
      updateLink: (id, newData) =>
        set((state) => ({
          links: state.links.map((l) =>
            l._id === id ? { ...l, ...newData } : l
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



