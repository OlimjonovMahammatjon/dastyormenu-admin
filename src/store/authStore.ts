import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase, UserProfile, Organization } from '../lib/supabase';

interface AuthState {
  user: UserProfile | null;
  organization: Organization | null;
  isLoading: boolean;
  setUser: (user: UserProfile | null) => void;
  setOrganization: (org: Organization | null) => void;
  setLoading: (v: boolean) => void;
  signIn: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
  loadProfile: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      organization: null,
      isLoading: true,

      setUser: (user) => set({ user }),
      setOrganization: (organization) => set({ organization }),
      setLoading: (isLoading) => set({ isLoading }),

      signIn: async (email, password) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) return error.message;
        await get().loadProfile();
        return null;
      },

      signOut: async () => {
        await supabase.auth.signOut();
        set({ user: null, organization: null });
      },

      loadProfile: async () => {
        set({ isLoading: true });
        try {
          const { data: { user: authUser } } = await supabase.auth.getUser();
          if (!authUser) { set({ user: null, organization: null, isLoading: false }); return; }

          const { data: profile } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', authUser.id)
            .single();

          if (!profile) { set({ user: null, organization: null, isLoading: false }); return; }

          const { data: org } = await supabase
            .from('organizations')
            .select('*')
            .eq('id', profile.organization_id)
            .single();

          set({ user: profile, organization: org ?? null, isLoading: false });
        } catch {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'dastyor-auth',
      partialize: (state) => ({ user: state.user, organization: state.organization }),
    }
  )
);
