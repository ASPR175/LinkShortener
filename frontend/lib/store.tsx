
import { create } from "zustand";
import { persist } from "zustand/middleware";

type User = {
  Name:string
  Email: string;
  AvatarURL: string;
};

type Store = {
  user: User | null;
  setUser: (user: User) => void;
  clearUser: () => void;
};

const useUserStore = create<Store>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null }),
    }),
    {
      name: "user-storage", 
    }
  )
);

export default useUserStore;



