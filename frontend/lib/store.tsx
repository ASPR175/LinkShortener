import { create } from "zustand";
import { persist } from "zustand/middleware";

import { createUserSlice, UserSlice } from "./userSlice";
import { createLinkSlice, LinkSlice } from "./linkSlice";
import { createWorkspaceSlice, WorkspaceSlice } from "./workspaceSlice";
import { createAnalyticsSlice, AnalyticsSlice } from "./analyticsSlice";

export type AppStore = UserSlice & LinkSlice & WorkspaceSlice & AnalyticsSlice;

export const useAppStore = create<AppStore>()(
  persist(
    (set,_get,_api) => ({
      ...createUserSlice(set,_get,_api),
      ...createLinkSlice(set,_get,_api),
      ...createWorkspaceSlice(set,_get,_api),
      ...createAnalyticsSlice(set,_get,_api),
    }),
    {
      name: "app-storage",
      partialize: (state) => ({ user: state.user }), 
    }
  )
);







