import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createUserSlice, UserSlice } from "./userSlice";
import { createLinkSlice, LinkSlice } from "./linkSlice";
import { createWorkspaceSlice, WorkspaceSlice } from "./workspaceSlice";
import { createAnalyticsSlice, AnalyticsSlice } from "./analyticsSlice";

type AppStore = UserSlice & LinkSlice & WorkspaceSlice & AnalyticsSlice;

const useAppStore = create<AppStore>()(
  persist(
    (...a) => ({
      ...createUserSlice(...a),
      ...createLinkSlice(...a),
      ...createWorkspaceSlice(...a),
      ...createAnalyticsSlice(...a),
    }),
    { name: "user-storage" }
  )
);

export default useAppStore;

