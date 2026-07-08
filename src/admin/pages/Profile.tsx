import { useState } from 'react'
import type { FormEvent } from 'react'
import { Loader2, Save } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { Input } from '../../components/Input'
import { Button } from '../../components/Button'
import { BrandingImagePicker } from '../components/BrandingImagePicker'
import { useAuth } from '../hooks/useAuth'
import { useAdminTheme } from '../hooks/useAdminTheme'
import { useToast } from '../../context/ToastContext'
import { getErrorMessage } from '../../utils/errors'
import { isValidEmail } from '../../utils/validators'
import {
  getNotifyOnNewBookings,
  getNotifyOnNewEnquiries,
  setNotifyOnNewBookings,
  setNotifyOnNewEnquiries,
} from '../utils/notificationPreferences'
import { logActivity } from '../services/activityLogService'

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="border border-ink-900/10 bg-cream-50 p-6 sm:p-8">
      <h2 className="text-lg font-normal text-ink-900">{title}</h2>
      {description && <p className="mt-1 text-sm font-light text-ink-700/60">{description}</p>}
      <div className="mt-6 space-y-6">{children}</div>
    </section>
  )
}

export default function AdminProfile() {
  const { user, updateProfile, updateEmail, updatePassword } = useAuth()
  const { theme, setTheme } = useAdminTheme()
  const { showToast } = useToast()

  const metadata = (user?.user_metadata ?? {}) as { full_name?: string; avatar_url?: string }
  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
    : null

  const [fullName, setFullName] = useState(metadata.full_name ?? '')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(metadata.avatar_url ?? null)
  const [isSavingProfile, setIsSavingProfile] = useState(false)

  const [newEmail, setNewEmail] = useState(user?.email ?? '')
  const [emailError, setEmailError] = useState<string | null>(null)
  const [isSavingEmail, setIsSavingEmail] = useState(false)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [isSavingPassword, setIsSavingPassword] = useState(false)

  const [notifyBookings, setNotifyBookingsState] = useState(getNotifyOnNewBookings)
  const [notifyEnquiries, setNotifyEnquiriesState] = useState(getNotifyOnNewEnquiries)

  const displayName = metadata.full_name || user?.email || 'Admin'
  const initials = displayName.charAt(0).toUpperCase()

  async function handleSaveProfile(e: FormEvent) {
    e.preventDefault()
    setIsSavingProfile(true)
    try {
      const { error } = await updateProfile(fullName.trim(), avatarUrl)
      if (error) throw new Error(error)
      await logActivity({ action: 'profile.updated', description: 'Updated profile information', recordType: 'profile' })
      showToast('success', 'Profile updated.')
    } catch (err) {
      showToast('error', getErrorMessage(err, 'Could not update your profile.'))
    } finally {
      setIsSavingProfile(false)
    }
  }

  async function handleSaveEmail(e: FormEvent) {
    e.preventDefault()
    setEmailError(null)

    if (!isValidEmail(newEmail)) {
      setEmailError('Enter a valid email address.')
      return
    }
    if (newEmail === user?.email) return

    setIsSavingEmail(true)
    try {
      const { error } = await updateEmail(newEmail)
      if (error) throw new Error(error)
      await logActivity({
        action: 'profile.email_changed',
        description: `Requested email change to "${newEmail}"`,
        recordType: 'profile',
      })
      showToast('success', 'Confirmation links sent to your old and new email addresses. The change applies once confirmed.')
    } catch (err) {
      showToast('error', getErrorMessage(err, 'Could not update your email.'))
    } finally {
      setIsSavingEmail(false)
    }
  }

  async function handleSavePassword(e: FormEvent) {
    e.preventDefault()
    setPasswordError(null)

    if (!currentPassword) {
      setPasswordError('Enter your current password.')
      return
    }
    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.')
      return
    }

    setIsSavingPassword(true)
    try {
      const { error } = await updatePassword(currentPassword, newPassword)
      if (error) throw new Error(error)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      await logActivity({ action: 'profile.password_changed', description: 'Changed account password', recordType: 'profile' })
      showToast('success', 'Password updated.')
    } catch (err) {
      showToast('error', getErrorMessage(err, 'Could not update your password.'))
    } finally {
      setIsSavingPassword(false)
    }
  }

  function handleToggleNotifyBookings() {
    const next = !notifyBookings
    setNotifyBookingsState(next)
    setNotifyOnNewBookings(next)
  }

  function handleToggleNotifyEnquiries() {
    const next = !notifyEnquiries
    setNotifyEnquiriesState(next)
    setNotifyOnNewEnquiries(next)
  }

  return (
    <>
      <PageHeader title="Profile" breadcrumbs={[{ label: 'Profile' }]} />

      <div className="mb-8 flex items-center gap-4 border border-ink-900/10 bg-cream-50 p-6">
        {avatarUrl ? (
          <img src={avatarUrl} alt="" className="h-14 w-14 rounded-full object-cover" />
        ) : (
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-ink-900 text-lg font-medium text-cream-100">
            {initials}
          </span>
        )}
        <div>
          <p className="text-lg font-normal text-ink-900">{displayName}</p>
          <p className="text-sm font-light text-ink-700/60">{user?.email}</p>
          {memberSince && <p className="text-xs font-light text-ink-700/70">Member since {memberSince}</p>}
        </div>
      </div>

      <div className="space-y-8">
        <Section title="Basic Information">
          <form onSubmit={handleSaveProfile} className="space-y-6">
            <BrandingImagePicker
              label="Avatar"
              value={avatarUrl}
              onChange={(url) => setAvatarUrl(url || null)}
              folder="avatars"
              previewClassName="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-ink-900/5"
            />
            <Input label="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            <div className="flex justify-end">
              <Button type="submit" variant="outline" disabled={isSavingProfile}>
                <span className="flex items-center gap-2">
                  {isSavingProfile ? <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} /> : <Save className="h-4 w-4" strokeWidth={1.5} />}
                  {isSavingProfile ? 'Saving…' : 'Save'}
                </span>
              </Button>
            </div>
          </form>
        </Section>

        <Section title="Email Address" description="Changing your email requires confirming the change from your inbox.">
          <form onSubmit={handleSaveEmail} className="space-y-6">
            <Input
              label="Email Address"
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
            />
            {emailError && <p className="text-xs text-red-500">{emailError}</p>}
            <div className="flex justify-end">
              <Button type="submit" variant="outline" disabled={isSavingEmail || newEmail === user?.email}>
                <span className="flex items-center gap-2">
                  {isSavingEmail ? <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} /> : <Save className="h-4 w-4" strokeWidth={1.5} />}
                  {isSavingEmail ? 'Saving…' : 'Update Email'}
                </span>
              </Button>
            </div>
          </form>
        </Section>

        <Section title="Password">
          <form onSubmit={handleSavePassword} className="space-y-6">
            <Input
              label="Current Password"
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <div className="grid gap-6 sm:grid-cols-2">
              <Input
                label="New Password"
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <Input
                label="Confirm New Password"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            {passwordError && <p className="text-xs text-red-500">{passwordError}</p>}
            <div className="flex justify-end">
              <Button type="submit" variant="outline" disabled={isSavingPassword}>
                <span className="flex items-center gap-2">
                  {isSavingPassword ? <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} /> : <Save className="h-4 w-4" strokeWidth={1.5} />}
                  {isSavingPassword ? 'Saving…' : 'Update Password'}
                </span>
              </Button>
            </div>
          </form>
        </Section>

        <Section title="Preferences" description="Saved to this browser.">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-normal text-ink-900">Theme</p>
              <p className="text-xs font-light text-ink-700/50">Choose how the admin panel looks.</p>
            </div>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value as 'light' | 'dark')}
              className="border-b border-ink-900/20 bg-transparent py-2 text-sm font-light text-ink-900 outline-none focus:border-brass-400"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>

          <label className="flex items-center justify-between">
            <div>
              <p className="text-sm font-normal text-ink-900">Notify on new bookings</p>
              <p className="text-xs font-light text-ink-700/50">Show a toast when a booking request arrives on the Bookings page.</p>
            </div>
            <input
              type="checkbox"
              checked={notifyBookings}
              onChange={handleToggleNotifyBookings}
              className="h-4 w-4 accent-brass-400"
            />
          </label>

          <label className="flex items-center justify-between">
            <div>
              <p className="text-sm font-normal text-ink-900">Notify on new contact enquiries</p>
              <p className="text-xs font-light text-ink-700/50">Show a toast when an enquiry arrives on the Contact page.</p>
            </div>
            <input
              type="checkbox"
              checked={notifyEnquiries}
              onChange={handleToggleNotifyEnquiries}
              className="h-4 w-4 accent-brass-400"
            />
          </label>
        </Section>
      </div>
    </>
  )
}
