import { create } from "zustand";
import { persist } from "zustand/middleware";

import { createUserSlice, UserSlice } from "./userSlice";
import { createLinkSlice, LinkSlice } from "./linkSlice";
import { createWorkspaceSlice, WorkspaceSlice } from "./workspaceSlice";
import { createAnalyticsSlice, AnalyticsSlice } from "./analyticsSlice";

export type AppStore = UserSlice & LinkSlice & WorkspaceSlice & AnalyticsSlice;

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      ...createUserSlice(set, get),
      ...createLinkSlice(set, get),
      ...createWorkspaceSlice(set, get),
      ...createAnalyticsSlice(set, get),
    }),
    {
      name: "app-storage",
      partialize: (state) => ({ user: state.user }), 
    }
  )
);







