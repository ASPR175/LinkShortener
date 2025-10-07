import { StateCreator } from "zustand";
import { WorkspaceInvite } from "@/lib/types";

export type InviteSlice = {
  invites: WorkspaceInvite[];
  
  setInvites: (invites: WorkspaceInvite[]) => void;
  addOrUpdateInvite: (invite: WorkspaceInvite) => void;
  removeInvite: (id: string) => void;
  getInviteByToken: (token: string) => WorkspaceInvite | undefined;
};

export const createInviteSlice: StateCreator<InviteSlice> = (set, _get, _api) => ({
  invites: [],

  setInvites: (invites) => set({ invites }),

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

  getInviteByToken: (token) =>
    _get().invites.find((i) => i.token === token),
});
