import { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type { Session, Subscription, User } from '@supabase/supabase-js'
import {
  getCurrentSession,
  requestPasswordReset as requestPasswordResetRequest,
  signInWithPassword,
  signOut as signOutRequest,
  subscribeToAuthChanges,
  updateEmail as updateEmailRequest,
  updatePassword as updatePasswordRequest,
  updateProfile as updateProfileRequest,
} from '../../services/authService'
import type { AuthResult } from '../../services/authService'
import { logActivity } from '../services/activityLogService'

export interface AuthContextValue {
  user: User | null
  session: Session | null
  isAuthenticated: boolean
  isInitializing: boolean
  login: (email: string, password: string, rememberMe: boolean) => Promise<AuthResult>
  logout: () => Promise<void>
  requestPasswordReset: (email: string) => Promise<AuthResult>
  updateProfile: (fullName: string, avatarUrl: string | null) => Promise<AuthResult>
  updateEmail: (newEmail: string) => Promise<AuthResult>
  updatePassword: (currentPassword: string, newPassword: string) => Promise<AuthResult>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [isInitializing, setIsInitializing] = useState(true)
  const subscriptionRef = useRef<Subscription | null>(null)

  useEffect(() => {
    let cancelled = false

    getCurrentSession()
      .then((initialSession) => {
        if (!cancelled) setSession(initialSession)
      })
      .catch(() => {
        if (!cancelled) setSession(null)
      })
      .finally(() => {
        if (!cancelled) setIsInitializing(false)
      })

    subscribeToAuthChanges((nextSession) => {
      if (!cancelled) setSession(nextSession)
    })
      .then((subscription) => {
        if (cancelled) {
          subscription.unsubscribe()
        } else {
          subscriptionRef.current = subscription
        }
      })
      .catch(() => {
        // Supabase client failed to initialize (e.g. missing env vars) —
        // getCurrentSession() above already surfaces this via isInitializing
        // resolving with no session, so there's nothing further to do here.
      })

    return () => {
      cancelled = true
      subscriptionRef.current?.unsubscribe()
    }
  }, [])

  const login = useCallback(async (email: string, password: string, rememberMe: boolean) => {
    const result = await signInWithPassword(email, password, rememberMe)
    if (!result.error) {
      await logActivity({ action: 'login', description: `${email} logged in`, recordType: 'auth' })
    }
    return result
  }, [])

  const logout = useCallback(async () => {
    // Must log while still authenticated — the insert policy requires
    // user_id = auth.uid(), which no longer resolves once signed out.
    if (session?.user) {
      await logActivity({
        action: 'logout',
        description: `${session.user.email ?? 'Admin'} logged out`,
        recordType: 'auth',
      })
    }
    await signOutRequest()
  }, [session])

  const requestPasswordReset = useCallback(
    (email: string) => requestPasswordResetRequest(email),
    [],
  )

  const updateProfile = useCallback(
    (fullName: string, avatarUrl: string | null) => updateProfileRequest(fullName, avatarUrl),
    [],
  )

  const updateEmail = useCallback((newEmail: string) => updateEmailRequest(newEmail), [])

  const updatePassword = useCallback(
    (currentPassword: string, newPassword: string) => updatePasswordRequest(currentPassword, newPassword),
    [],
  )

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      session,
      isAuthenticated: Boolean(session),
      isInitializing,
      login,
      logout,
      requestPasswordReset,
      updateProfile,
      updateEmail,
      updatePassword,
    }),
    [session, isInitializing, login, logout, requestPasswordReset, updateProfile, updateEmail, updatePassword],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
