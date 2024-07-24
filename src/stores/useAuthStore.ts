import { create } from 'zustand'
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  companyId: string;
}

interface AuthState {
  user: User | null;
  setUser: (user: User | null) => void;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
    }),
    {
      name: 'auth-storage',
      getStorage: () => localStorage, 
      version: 1,
      migrate: (persistedState, version) => {
        if (version === 0) {
          return {
            user: persistedState,
          };
        }
        return persistedState;
      },
    }
  )
);

export default useAuthStore;
