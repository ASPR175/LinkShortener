import { StateCreator } from "zustand";
import { User } from "./types";

export type UserSlice = {
  user: User | null;
  setUser: (user: User) => void;
  clearUser: () => void;
};

export const createUserSlice: StateCreator<UserSlice> = (set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
});
