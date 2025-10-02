import { StateCreator } from "zustand";
import { Analytics } from "./types";

export type AnalyticsSlice = {
  analytics: Record<string, Analytics>;
  setAnalytics: (linkId: string, data: any) => void;
  clearAnalytics: () => void;
};

export const createAnalyticsSlice: StateCreator<AnalyticsSlice> = (set) => ({
  analytics: {},

  setAnalytics: (linkId, data) =>
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
      return { analytics: { ...state.analytics, [linkId]: normalized } };
    }),

  clearAnalytics: () => set({ analytics: {} }),
});
