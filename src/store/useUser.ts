import zustandStorageEncryption from "@/helpers/zustand-storage-encryption.utils";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface User {
  id?: string;
  email: string;
  firstName: string;
  lastName: string;
  profileImage?: string;
  roles?: string[];
  isAccountActivate?: boolean;
}

interface UserStore {
  user: User | null;
  setUser: (user: User | null) => void;
  updateUser: (userData: Partial<User>) => void;
}

export const useUser = create<UserStore>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      updateUser: (userData) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        })),
    }),
    {
      name: "user",
      storage: zustandStorageEncryption,
    }
  )
);
