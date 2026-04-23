import { create } from 'zustand';
import { UserProfile, Organization } from '../lib/types';
import { authService } from '../lib/authService';

interface AuthState {
  user: UserProfile | null;
  organization: Organization | null;
  isLoading: boolean;
  setUser: (user: UserProfile | null) => void;
  setOrganization: (org: Organization | null) => void;
  setLoading: (v: boolean) => void;
  signIn: (login: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
  loadProfile: () => Promise<void>;
  verifyAuth: () => Promise<boolean>;
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  organization: null,
  isLoading: true,

  setUser: (user) => set({ user }),
  setOrganization: (organization) => set({ organization }),
  setLoading: (isLoading) => set({ isLoading }),

  signIn: async (login, password) => {
    try {
      const response = await authService.login({ login, password });
      
      if (response.success && response.data) {
        set({ 
          user: response.data.user, 
          organization: response.data.organization 
        });
        return null;
      }
      
      return response.error?.message || 'Login yoki parol noto\'g\'ri';
    } catch (error) {
      console.error('Login error:', error);
      return 'Serverga ulanishda xatolik';
    }
  },

  signOut: async () => {
    await authService.logout();
    set({ user: null, organization: null });
  },

  loadProfile: async () => {
    set({ isLoading: true });

    try {
      // Try to load from localStorage first
      const stored = authService.getStoredAuth();
      
      if (stored) {
        set({ 
          user: stored.user, 
          organization: stored.organization, 
          isLoading: false 
        });

        // Verify with API in background
        if (authService.isAuthenticated()) {
          const isValid = await authService.verifyAuth();
          if (!isValid) {
            set({ user: null, organization: null });
          } else {
            // Refresh user data from API
            const updated = authService.getStoredAuth();
            if (updated) {
              set({ user: updated.user, organization: updated.organization });
            }
          }
        }
      } else {
        set({ user: null, organization: null, isLoading: false });
      }
    } catch (error) {
      console.error('Load profile error:', error);
      set({ user: null, organization: null, isLoading: false });
    }
  },

  verifyAuth: async () => {
    return await authService.verifyAuth();
  },
}));
