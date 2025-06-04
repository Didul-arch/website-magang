import { create } from 'zustand'

interface UserStore {
  user: {
    id: string;
    email: string;
    name: string;
    phoneNumber?: string;
    role: 'USER' | 'ADMIN';
  } | null;
  setUser: (user: UserStore['user']) => void;
}

export const useStore = create<UserStore>((set) => ({
  user: null,
  setUser: (user: UserStore['user']) => set({ user : user ? {
    id: user.id,
    email: user.email,
    name: user.name,
    phoneNumber: user.phoneNumber,
    role: user.role,
  } : null})
}));
