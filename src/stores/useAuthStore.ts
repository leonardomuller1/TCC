import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  companyId: string;
  name: string;
  foto: string;
  is_master: boolean; 
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
      migrate: (persistedState, version) => {
        if (version === 0) {
          if (
            typeof persistedState === 'object' &&
            persistedState !== null &&
            'user' in persistedState
          ) {
            const user = persistedState as unknown as User;
            return {
              userId: user.id || null,
            };
          }
        }
        return persistedState;
      },
    },
  ),
);

export default useAuthStore;
