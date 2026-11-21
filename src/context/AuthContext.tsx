import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, type User } from 'firebase/auth';
import { auth, googleAuthProvider } from '../lib/firebase';
import type { AuthSessionUser } from '../types/coffee';

interface AuthContextValue {
  firebaseUser: User | null;
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [sessionUser, setSessionUser] = useState<AuthSessionUser | null>(null);
  const [idToken, setIdToken] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [signingIn, setSigningIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const verifyWithBackend = useCallback(async (user: User) => {
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

      if (!response.ok) {
        throw new Error('SESSION_VERIFY_FAILED');
      }

      const data = await response.json();
      setSessionUser(data.user ?? null);
      setIsAdmin(Boolean(data.isAdmin));
      setAuthError(null);
    } catch (err) {
      console.error('Failed to verify auth session:', err);
      setSessionUser(null);
      setIsAdmin(false);
      setAuthError('SESSION_VERIFY_FAILED');
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        setLoading(true);
        await verifyWithBackend(user);
        setLoading(false);
      } else {
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
    await signOut(auth);
    setIdToken(null);
    setSessionUser(null);
    setIsAdmin(false);
    setAuthError(null);
  }, []);

  const refreshToken = useCallback(async () => {
    if (!firebaseUser) return null;
    const fresh = await firebaseUser.getIdToken(true);
    setIdToken(fresh);
    return fresh;
  }, [firebaseUser]);

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
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
