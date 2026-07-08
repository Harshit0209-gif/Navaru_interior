import { useState } from 'react'
import type { FormEvent } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { KeyRound } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { AdminLoadingScreen } from '../components/AdminLoadingScreen'
import { Input } from '../../components/Input'
import { Button } from '../../components/Button'
import { isValidEmail } from '../../utils/validators'

interface LocationState {
  from?: { pathname: string }
}

type ViewMode = 'login' | 'forgot-password'

export default function AdminLogin() {
  const { isAuthenticated, isInitializing, login, requestPasswordReset } = useAuth()
  const location = useLocation()

  const [mode, setMode] = useState<ViewMode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(true)
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [resetEmail, setResetEmail] = useState('')
  const [resetError, setResetError] = useState<string | null>(null)
  const [resetSent, setResetSent] = useState(false)
  const [isSendingReset, setIsSendingReset] = useState(false)

  if (isInitializing) {
    return <AdminLoadingScreen />
  }

  if (isAuthenticated) {
    const from = (location.state as LocationState | null)?.from?.pathname ?? '/admin'
    return <Navigate to={from} replace />
  }

  async function handleLogin(e: FormEvent) {
    e.preventDefault()
    setFormError(null)

    const nextErrors: { email?: string; password?: string } = {}
    if (!isValidEmail(email)) nextErrors.email = 'Enter a valid email address.'
    if (!password) nextErrors.password = 'Enter your password.'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setIsSubmitting(true)
    try {
      const { error } = await login(email, password, rememberMe)
      if (error) setFormError(error)
    } catch {
      setFormError('Something went wrong while signing in. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleForgotPassword(e: FormEvent) {
    e.preventDefault()
    setResetError(null)

    if (!isValidEmail(resetEmail)) {
      setResetError('Enter a valid email address.')
      return
    }

    setIsSendingReset(true)
    try {
      const { error } = await requestPasswordReset(resetEmail)
      if (error) {
        setResetError(error)
      } else {
        setResetSent(true)
      }
    } catch {
      setResetError('Something went wrong. Please try again.')
    } finally {
      setIsSendingReset(false)
    }
  }

  function switchToForgotPassword() {
    setResetEmail(email)
    setResetError(null)
    setResetSent(false)
    setMode('forgot-password')
  }

  function switchToLogin() {
    setFormError(null)
    setMode('login')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-950 px-6 py-16">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md bg-cream-50 p-8 sm:p-10"
      >
        <div className="mb-8 flex flex-col items-center text-center">
          <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-full border border-brass-300 text-brass-400">
            <KeyRound className="h-5 w-5" strokeWidth={1.5} />
          </span>
          <p className="text-xs font-medium uppercase tracking-widest2 text-brass-400">
            Navaru Interior Solution
          </p>
          <h1 className="mt-3 text-2xl font-light tracking-tight text-ink-900">
            {mode === 'login' ? 'Admin Sign In' : 'Reset Your Password'}
          </h1>
        </div>

        {mode === 'login' ? (
          <form onSubmit={handleLogin} noValidate className="space-y-6">
            <div>
              <Input
                label="Email Address"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
              />
              {errors.email && <p className="mt-2 text-xs text-red-500">{errors.email}</p>}
            </div>

            <div>
              <Input
                label="Password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
              />
              {errors.password && <p className="mt-2 text-xs text-red-500">{errors.password}</p>}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2.5 text-sm font-light text-ink-700">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={isSubmitting}
                  className="h-4 w-4 accent-brass-400"
                />
                Remember me
              </label>
              <button
                type="button"
                onClick={switchToForgotPassword}
                className="text-xs font-medium uppercase tracking-widest2 text-brass-400 underline underline-offset-4 transition-colors hover:text-brass-500"
              >
                Forgot Password?
              </button>
            </div>

            {formError && (
              <p role="alert" className="border-l-2 border-red-500 bg-red-50 px-4 py-3 text-sm font-light text-red-600">
                {formError}
              </p>
            )}

            <Button type="submit" variant="primary" withArrow className="w-full justify-center" disabled={isSubmitting}>
              {isSubmitting ? 'Signing in…' : 'Sign In'}
            </Button>
          </form>
        ) : resetSent ? (
          <div className="space-y-6 text-center">
            <p className="text-sm font-light leading-relaxed text-ink-700">
              If an account exists for <span className="text-ink-900">{resetEmail}</span>, a password
              reset link has been sent. Check your inbox.
            </p>
            <Button variant="outline" className="w-full justify-center" onClick={switchToLogin}>
              Back to Sign In
            </Button>
          </div>
        ) : (
          <form onSubmit={handleForgotPassword} noValidate className="space-y-6">
            <p className="text-sm font-light leading-relaxed text-ink-700">
              Enter the email address associated with your admin account and we&apos;ll send you a
              link to reset your password.
            </p>

            <div>
              <Input
                label="Email Address"
                type="email"
                autoComplete="username"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                disabled={isSendingReset}
              />
              {resetError && <p className="mt-2 text-xs text-red-500">{resetError}</p>}
            </div>

            <Button type="submit" variant="primary" withArrow className="w-full justify-center" disabled={isSendingReset}>
              {isSendingReset ? 'Sending…' : 'Send Reset Link'}
            </Button>

            <button
              type="button"
              onClick={switchToLogin}
              className="w-full text-center text-xs font-medium uppercase tracking-widest2 text-ink-700/60 underline underline-offset-4 transition-colors hover:text-brass-400"
            >
              Back to Sign In
            </button>
          </form>
        )}
      </motion.div>
    </div>
  )
}
