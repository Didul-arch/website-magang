import { create } from 'zustand'

interface UserStore {
  user: {
    id: string;
    email: string;
    name: string;
    phoneNumber?: string;
    role: 'USER' | 'ADMIN';
    internship: {
      id: number;
      portfolio: string | null;
    }
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
    internship: {
      id: user.internship.id,
      portfolio: user.internship.portfolio
    }
  } : null})
}));
