
import { StateCreator } from "zustand";
import { Link } from "./types";

export function normalizeLink(apiLink: any): Link {
  return {
    _id: apiLink._id?.toString() ?? apiLink.ID?.toString() ?? "",
    shortID: apiLink.short_id ?? apiLink.ShortID,
    original: apiLink.original ?? apiLink.Original ?? "",
    clicks: apiLink.clicks ?? apiLink.Clicks ?? 0,
    createdAt: apiLink.created_at ?? apiLink.CreatedAt ?? new Date().toISOString(),
    updatedAt: apiLink.updated_at ?? apiLink.UpdatedAt ?? undefined,
    workspaceID: apiLink.workspace_id ?? apiLink.WorkspaceID ?? null,
  };
}

export type LinkSlice = {
  links: Link[];
  setLinks: (links: Link[]) => void; 
  addOrUpdateLink: (link:Partial<Link>) => void;
  removeLink: (id: string) => void;
};

export const createLinkSlice: StateCreator<LinkSlice> = (set,_get,_api) => ({
  links: [],

  setLinks: (links) => set({ links: links.map(normalizeLink) }),

addOrUpdateLink: (link) =>
  set((state) => {
    const existing = state.links.find((l) => l._id === link._id);
    if (existing) {
      return {
        links: state.links.map((l) =>
          l._id === link._id ? { ...existing, ...link } : l
        ),
      };
    } else {
      
      const normalized: Link = {
        _id: link._id ?? crypto.randomUUID(),
        shortID: link.shortID || "",
        original: link.original ?? "",
        clicks: link.clicks ?? 0,
        createdAt: link.createdAt ?? new Date().toISOString(),
        updatedAt: link.updatedAt,
        workspaceID: link.workspaceID ?? null,
      };
      return { links: [...state.links, normalized] };
    }
  }),

  removeLink: (id) =>
    set((state) => ({
      links: state.links.filter((l) => l._id !== id),
    })),
});



