import type { Session, Subscription, User } from '@supabase/supabase-js'
import { getSupabase, setRememberMePreference } from '../lib/supabase'

export interface AuthResult {
  error: string | null
}

/**
 * Translates raw Supabase Auth error text into copy safe to show a user.
 * Falls back to the original message for anything unrecognized so genuine
 * configuration issues (e.g. missing env vars) are still visible.
 */
function mapAuthErrorMessage(message: string): string {
  if (/invalid login credentials/i.test(message)) return 'Incorrect email or password.'
  if (/email not confirmed/i.test(message)) return 'Please confirm your email address before signing in.'
  if (/rate limit/i.test(message)) return 'Too many attempts. Please wait a moment and try again.'
  return message
}

export async function signInWithPassword(
  email: string,
  password: string,
  rememberMe: boolean,
): Promise<AuthResult> {
  // Must be set before signInWithPassword runs, since that call is what
  // writes the session into storage for the first time.
  setRememberMePreference(rememberMe)

  const supabase = await getSupabase()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) return { error: mapAuthErrorMessage(error.message) }
  return { error: null }
}

export async function signOut(): Promise<void> {
  const supabase = await getSupabase()
  await supabase.auth.signOut()
}

export async function getCurrentSession(): Promise<Session | null> {
  const supabase = await getSupabase()
  const { data } = await supabase.auth.getSession()
  return data.session
}

export async function updateProfile(fullName: string, avatarUrl: string | null): Promise<AuthResult> {
  const supabase = await getSupabase()
  const { error } = await supabase.auth.updateUser({
    data: { full_name: fullName, avatar_url: avatarUrl },
  })

  if (error) return { error: mapAuthErrorMessage(error.message) }
  return { error: null }
}

export async function updateEmail(newEmail: string): Promise<AuthResult> {
  const supabase = await getSupabase()
  const { error } = await supabase.auth.updateUser({ email: newEmail })

  if (error) return { error: mapAuthErrorMessage(error.message) }
  return { error: null }
}

export async function updatePassword(currentPassword: string, newPassword: string): Promise<AuthResult> {
  const supabase = await getSupabase()

  const { data: sessionData } = await supabase.auth.getSession()
  const email = sessionData.session?.user.email
  if (!email) return { error: 'Your session has expired. Please sign in again.' }

  // Re-authenticate with the current password first — a safety check so a
  // still-logged-in but unattended session can't have its password changed
  // by whoever finds the browser open.
  const { error: reauthError } = await supabase.auth.signInWithPassword({ email, password: currentPassword })
  if (reauthError) return { error: 'Current password is incorrect.' }

  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) return { error: mapAuthErrorMessage(error.message) }
  return { error: null }
}

export async function requestPasswordReset(email: string): Promise<AuthResult> {
  const supabase = await getSupabase()
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/admin/login`,
  })

  if (error) return { error: mapAuthErrorMessage(error.message) }
  return { error: null }
}

/**
 * Subscribes to Supabase auth state changes (sign-in, sign-out, token
 * refresh, session restored). Returns the subscription so the caller can
 * unsubscribe on unmount.
 */
export async function subscribeToAuthChanges(
  callback: (session: Session | null) => void,
): Promise<Subscription> {
  const supabase = await getSupabase()
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session)
  })
  return subscription
}

export type { Session, User }
