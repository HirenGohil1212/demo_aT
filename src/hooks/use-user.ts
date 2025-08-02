
"use client";

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User } from '@/types';


interface UserState {
  user: (Omit<User, 'password'> & { id: string }) | null;
  isAdmin: boolean;
  login: (user: Omit<User, 'password'> & { id: string }) => void;
  logout: () => void;
}

export const useUser = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      isAdmin: false,
      login: (user) => set({ user: user, isAdmin: user.role === 'admin' }),
      logout: () => set({ user: null, isAdmin: false }),
    }),
    {
      name: 'user-storage', // unique name
      storage: createJSONStorage(() => localStorage),
    }
  )
);
