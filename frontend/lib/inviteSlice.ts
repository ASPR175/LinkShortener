import { StateCreator } from "zustand";
import { WorkspaceInvite } from "@/lib/types";

export type InviteSlice = {
  invites: WorkspaceInvite[];

  setInvites: (invites: WorkspaceInvite[] | ((prev: WorkspaceInvite[]) => WorkspaceInvite[])) => void;
  addOrUpdateInvite: (invite: WorkspaceInvite) => void;
  removeInvite: (id: string) => void;
  getInviteByToken: (token: string) => WorkspaceInvite | undefined;
  getPendingInvites: () => WorkspaceInvite[];
  clearInvites: () => void;
};

export const createInviteSlice: StateCreator<InviteSlice> = (set, get, _api) => ({
  invites: [],

  setInvites: (invites) =>
    set((state) => ({
      invites: typeof invites === "function" ? invites(state.invites) : invites,
    })),

  addOrUpdateInvite: (invite) =>
    set((state) => {
      const exists = state.invites.some((i) => i._id === invite._id);
      return {
        invites: exists
          ? state.invites.map((i) => (i._id === invite._id ? invite : i))
          : [...state.invites, invite],
      };
    }),

  removeInvite: (id) =>
    set((state) => ({
      invites: state.invites.filter((i) => i._id !== id),
    })),

  getInviteByToken: (token) => get().invites.find((i) => i.token === token),

  getPendingInvites: () => get().invites.filter((i) => i.status === "pending"),

  clearInvites: () => set({ invites: [] }),
});