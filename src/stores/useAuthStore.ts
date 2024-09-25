import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  companyId: string;
  name: string;
  foto: string;
  is_master: boolean;
  selectedCompanyId?: string;
}

interface AuthState {
  userId: string | null;
  user: User | null;
  setUserId: (userId: string | null) => void;
  setUser: (user: User | null) => void;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      userId: null,
      user: null,
      setUserId: (userId) => set({ userId }),
      setUser: (user) => set({ user }),
    }),
    {
      name: 'auth-storage',
      getStorage: () => localStorage,
      version: 1,
    }
  )
);

export default useAuthStore;