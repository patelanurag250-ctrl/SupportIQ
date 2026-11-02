import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';

interface AuthContextType {
  user: User;
  supabaseUser: SupabaseUser | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  isAgent: boolean;
  isCustomer: boolean;
  isSupabaseConnected: boolean;
  loginWithPassword: (email: string, password?: string, role?: UserRole) => Promise<void>;
  signUp: (email: string, password?: string, displayName?: string, role?: UserRole) => Promise<void>;
  loginWithOAuth: (provider?: 'google' | 'github') => Promise<void>;
  logout: () => Promise<void>;
  switchDemoRole: (role: UserRole) => void;
  updateProfile: (name: string, department?: string) => void;
}

const DEMO_USERS: Record<UserRole, User> = {
  ADMIN: {
    id: 'usr-admin-runtime',
    organizationId: 'org-apex-01',
    email: 'admin@supportiq.com',
    displayName: 'Alex Mercer (Lead Operations)',
    role: 'ADMIN',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    department: 'Platform Operations & Infrastructure',
    assignedCount: 5,
    resolvedCount: 42,
    csatAvg: 5.0,
    createdAt: new Date().toISOString(),
  },
  SUPPORT_AGENT: {
    id: 'usr-agent-01',
    organizationId: 'org-apex-01',
    email: 'sarah.agent@supportiq.com',
    displayName: 'Sarah Jenkins',
    role: 'SUPPORT_AGENT',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    department: 'Tier 2 Technical Support',
    assignedCount: 7,
    resolvedCount: 89,
    csatAvg: 4.8,
    createdAt: new Date().toISOString(),
  },
  CUSTOMER: {
    id: 'usr-cust-01',
    organizationId: 'org-apex-01',
    email: 'elena.rodriguez@clientcorp.io',
    displayName: 'Elena Rodriguez',
    role: 'CUSTOMER',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    department: 'ClientCorp Engineering',
    createdAt: new Date().toISOString(),
  },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(DEMO_USERS.ADMIN);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // If Supabase is configured, listen to real Supabase auth state changes
    if (isSupabaseConfigured) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        setSupabaseUser(session?.user ?? null);
        if (session?.user) {
          syncSupabaseUser(session.user);
        }
        setLoading(false);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
        setSupabaseUser(session?.user ?? null);
        if (session?.user) {
          syncSupabaseUser(session.user);
        }
        setLoading(false);
      });

      return () => subscription.unsubscribe();
    } else {
      setLoading(false);
    }
  }, []);

  const syncSupabaseUser = (sbUser: SupabaseUser) => {
    const email = sbUser.email || '';
    const role: UserRole =
      email.includes('admin') || sbUser.user_metadata?.role === 'ADMIN'
        ? 'ADMIN'
        : email.includes('agent') || sbUser.user_metadata?.role === 'SUPPORT_AGENT'
        ? 'SUPPORT_AGENT'
        : 'CUSTOMER';

    setUser({
      id: sbUser.id,
      organizationId: sbUser.user_metadata?.organizationId || 'org-apex-01',
      email,
      displayName: sbUser.user_metadata?.full_name || sbUser.user_metadata?.displayName || email.split('@')[0],
      role,
      avatarUrl:
        sbUser.user_metadata?.avatar_url ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      createdAt: sbUser.created_at || new Date().toISOString(),
    });
  };

  const loginWithPassword = async (email: string, password = 'password123', role: UserRole = 'ADMIN') => {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        console.warn('Supabase signInWithPassword:', error.message);
      } else if (data.user) {
        syncSupabaseUser(data.user);
        return;
      }
    }

    // Seamless operational switch if local/demo
    setUser({
      id: `usr-${Date.now()}`,
      organizationId: 'org-apex-01',
      email,
      displayName: email.split('@')[0].replace('.', ' '),
      role,
      avatarUrl: DEMO_USERS[role]?.avatarUrl || DEMO_USERS.ADMIN.avatarUrl,
      createdAt: new Date().toISOString(),
    });
  };

  const signUp = async (email: string, password = 'password123', displayName?: string, role: UserRole = 'CUSTOMER') => {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: displayName || email.split('@')[0],
            role,
            organizationId: 'org-apex-01',
          },
        },
      });
      if (error) {
        console.warn('Supabase signUp:', error.message);
      } else if (data.user) {
        syncSupabaseUser(data.user);
        return;
      }
    }

    setUser({
      id: `usr-${Date.now()}`,
      organizationId: 'org-apex-01',
      email,
      displayName: displayName || email.split('@')[0],
      role,
      avatarUrl: DEMO_USERS[role].avatarUrl,
      createdAt: new Date().toISOString(),
    });
  };

  const loginWithOAuth = async (provider: 'google' | 'github' = 'google') => {
    if (isSupabaseConfigured) {
      await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: window.location.origin,
        },
      });
    } else {
      switchDemoRole('ADMIN');
    }
  };

  const logout = async () => {
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        // ignore
      }
    }
    setSession(null);
    setSupabaseUser(null);
    setUser(DEMO_USERS.ADMIN);
  };

  const switchDemoRole = (role: UserRole) => {
    setUser(DEMO_USERS[role]);
  };

  const updateProfile = (name: string, department?: string) => {
    setUser((prev) => ({
      ...prev,
      displayName: name,
      department: department || prev.department,
    }));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        supabaseUser,
        session,
        loading,
        isAdmin: user.role === 'ADMIN',
        isAgent: user.role === 'SUPPORT_AGENT' || user.role === 'ADMIN',
        isCustomer: user.role === 'CUSTOMER',
        isSupabaseConnected: isSupabaseConfigured,
        loginWithPassword,
        signUp,
        loginWithOAuth,
        logout,
        switchDemoRole,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
