import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, type User } from 'firebase/auth';
import { auth, googleAuthProvider } from '../lib/firebase';
import { recordFallbackLoginLog } from '../lib/dataService';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import type { AuthSessionUser } from '../types/coffee';

interface AuthContextValue {
  firebaseUser: User | null;
  authEmail: string | null;
  authDisplayName: string | null;
  sessionUser: AuthSessionUser | null;
  idToken: string | null;
  isAdmin: boolean;
  loading: boolean;
  signingIn: boolean;
  authError: string | null;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const FALLBACK_ADMIN_EMAIL = (
  import.meta.env.VITE_ADMIN_EMAIL || 'ahmadjondadamirzayev6@gmail.com'
)
  .trim()
  .toLowerCase();

function checkEmailIsAdmin(email?: string | null): boolean {
  if (!email) return false;
  return FALLBACK_ADMIN_EMAIL.split(',')
    .map((s: string) => s.trim().toLowerCase())
    .includes(email.trim().toLowerCase());
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [authEmail, setAuthEmail] = useState<string | null>(null);
  const [authDisplayName, setAuthDisplayName] = useState<string | null>(null);
  const [sessionUser, setSessionUser] = useState<AuthSessionUser | null>(null);
  const [idToken, setIdToken] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [signingIn, setSigningIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const verifyWithBackend = useCallback(async (user: User) => {
    const email = user.email ?? '';
    const displayName = user.displayName ?? email.split('@')[0];
    setAuthEmail(email);
    setAuthDisplayName(displayName);

    try {
      const token = await user.getIdToken();
      setIdToken(token);

      const response = await fetch('/api/auth/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSessionUser(data.user ?? null);
        setIsAdmin(Boolean(data.isAdmin));
        setAuthError(null);
        return;
      }
      throw new Error('BACKEND_UNAVAILABLE');
    } catch {
      // If deployed statically without Express backend, evaluate client session & record log
      const admin = checkEmailIsAdmin(email);
      setIsAdmin(admin);
      setSessionUser({
        id: 1,
        uid: user.uid,
        email,
        displayName,
        role: admin ? 'admin' : 'pending',
      });
      await recordFallbackLoginLog({
        uid: user.uid,
        email,
        displayName,
        status: admin ? 'granted' : 'denied',
        userAgent: navigator.userAgent,
      });
      setAuthError(null);
    }
  }, []);

  useEffect(() => {
    if (isSupabaseConfigured && supabase) {
      let mounted = true;

      const syncSupabaseUser = async (sbUser: { id: string; email?: string; user_metadata?: Record<string, unknown> } | null, token: string | null) => {
        if (!mounted) return;
        if (!sbUser || !sbUser.email) {
          setAuthEmail(null);
          setAuthDisplayName(null);
          setIdToken(null);
          setSessionUser(null);
          setIsAdmin(false);
          setLoading(false);
          return;
        }
        const email = sbUser.email;
        const displayName = String(sbUser.user_metadata?.full_name ?? sbUser.user_metadata?.name ?? email.split('@')[0]);
        const admin = checkEmailIsAdmin(email);
        setAuthEmail(email);
        setAuthDisplayName(displayName);
        setIdToken(token);
        setIsAdmin(admin);
        setSessionUser({
          id: 1,
          uid: sbUser.id,
          email,
          displayName,
          role: admin ? 'admin' : 'pending',
        });
        await recordFallbackLoginLog({
          uid: sbUser.id,
          email,
          displayName,
          status: admin ? 'granted' : 'denied',
          userAgent: navigator.userAgent,
        });
        setLoading(false);
      };

      supabase.auth.getSession().then(({ data }) => {
        syncSupabaseUser(data.session?.user ?? null, data.session?.access_token ?? null);
      });

      const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
        syncSupabaseUser(session?.user ?? null, session?.access_token ?? null);
      });

      return () => {
        mounted = false;
        sub.subscription.unsubscribe();
      };
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        setLoading(true);
        await verifyWithBackend(user);
        setLoading(false);
      } else {
        setAuthEmail(null);
        setAuthDisplayName(null);
        setIdToken(null);
        setSessionUser(null);
        setIsAdmin(false);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [verifyWithBackend]);

  const signInWithGoogle = useCallback(async () => {
    setSigningIn(true);
    setAuthError(null);
    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: window.location.origin + '/admin',
          },
        });
        if (error) throw error;
        return;
      }

      const result = await signInWithPopup(auth, googleAuthProvider);
      if (result.user) {
        await verifyWithBackend(result.user);
      }
    } catch (err) {
      console.error('Google Sign-In failed:', err);
      setAuthError('GOOGLE_SIGNIN_FAILED');
    } finally {
      setSigningIn(false);
    }
  }, [verifyWithBackend]);

  const logout = useCallback(async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    } else {
      await signOut(auth);
    }
    setAuthEmail(null);
    setAuthDisplayName(null);
    setIdToken(null);
    setSessionUser(null);
    setIsAdmin(false);
    setAuthError(null);
  }, []);

  const refreshToken = useCallback(async () => {
    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token ?? null;
      setIdToken(token);
      return token;
    }
    if (!firebaseUser) return null;
    const fresh = await firebaseUser.getIdToken(true);
    setIdToken(fresh);
    return fresh;
  }, [firebaseUser]);

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        authEmail,
        authDisplayName,
        sessionUser,
        idToken,
        isAdmin,
        loading,
        signingIn,
        authError,
        signInWithGoogle,
        logout,
        refreshToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
