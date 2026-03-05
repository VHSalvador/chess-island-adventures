import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

type ChildProfile = Tables<'child_profiles'>;

interface AuthContextType {
  user: User | null;
  session: Session | null;
  childProfile: ChildProfile | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshChildProfile: () => Promise<ChildProfile | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [childProfile, setChildProfile] = useState<ChildProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchChildProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('child_profiles')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Child profile lekérés hiba:', error.message);
      setChildProfile(null);
      return null;
    }

    setChildProfile(data);
    return data;
  };

  const refreshChildProfile = async () => {
    const currentUser = (await supabase.auth.getUser()).data.user;
    if (currentUser) return await fetchChildProfile(currentUser.id);
    return null;
  };

  useEffect(() => {
    // Initialize from getSession — fires reliably on page load.
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchChildProfile(session.user.id);
      }
      setLoading(false);
    });

    // Handle subsequent auth changes (sign-in, sign-out, token refresh).
    // Skip INITIAL_SESSION — already handled by getSession above.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'INITIAL_SESSION') return;
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchChildProfile(session.user.id);
      } else {
        setChildProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, displayName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName },
        emailRedirectTo: window.location.origin,
      },
    });
    if (error) throw error;
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setChildProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, childProfile, loading, signUp, signIn, signOut, refreshChildProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
