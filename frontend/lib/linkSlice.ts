import { StateCreator } from "zustand";
import { Link } from "./types";

export function normalizeLink(apiLink: any): Link {
  return {
    _id: apiLink._id ?? apiLink.ID ?? "",
    short_id: apiLink.short_id ?? apiLink.ShortID ?? "",
    original: apiLink.original ?? apiLink.Original ?? "",
    clicks: apiLink.clicks ?? apiLink.Clicks ?? 0,
    created_at: apiLink.created_at ?? apiLink.CreatedAt ?? new Date().toISOString(),
    updated_at: apiLink.updated_at ?? apiLink.UpdatedAt ?? undefined,
    workspace_id: apiLink.workspace_id ?? apiLink.WorkspaceID ?? null,
  };
}

export type LinkSlice = {
  links: Link[];
  setLinks: (links: any[]) => void;
  addLink: (link: any) => void;
  removeLink: (id: string) => void;
  updateLink: (id: string, newData: any) => void;
};

export const createLinkSlice: StateCreator<LinkSlice> = (set) => ({
  links: [],

  setLinks: (links) =>
    set({
      links: Array.isArray(links) ? links.map((l) => normalizeLink(l)) : [],
    }),

  addLink: (link) =>
    set((state) => {
      const normalized = normalizeLink(link);
      return {
        links: state.links.some((l) => l._id === normalized._id)
          ? state.links.map((l) => (l._id === normalized._id ? normalized : l))
          : [...state.links, normalized],
      };
    }),

  removeLink: (id) =>
    set((state) => ({
      links: state.links.filter((l) => l._id !== id),
    })),

  updateLink: (id, newData) =>
    set((state) => ({
      links: state.links.map((l) =>
        l._id === id ? { ...l, ...normalizeLink(newData) } : l
      ),
    })),
});
