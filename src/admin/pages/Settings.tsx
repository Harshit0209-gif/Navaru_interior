import { useEffect, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { Loader2, Save } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { Input } from '../../components/Input'
import { Button } from '../../components/Button'
import { TagInput } from '../components/TagInput'
import { BrandingImagePicker } from '../components/BrandingImagePicker'
import { useToast } from '../../context/ToastContext'
import { getErrorMessage } from '../../utils/errors'
import { fetchSiteSettings, updateSiteSettings } from '../services/settingsService'
import { settingsToFormValues } from '../types/settings'
import type { SettingsFormValues } from '../types/settings'

const SOCIAL_FIELDS: { key: keyof SettingsFormValues; label: string; placeholder: string }[] = [
  { key: 'social_instagram', label: 'Instagram', placeholder: 'https://instagram.com/yourstudio' },
  { key: 'social_facebook', label: 'Facebook', placeholder: 'https://facebook.com/yourstudio' },
  { key: 'social_linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/company/yourstudio' },
  { key: 'social_pinterest', label: 'Pinterest', placeholder: 'https://pinterest.com/yourstudio' },
  { key: 'social_youtube', label: 'YouTube', placeholder: 'https://youtube.com/@yourstudio' },
  { key: 'social_twitter', label: 'Twitter / X', placeholder: 'https://x.com/yourstudio' },
]

function Section({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="border border-ink-900/10 bg-cream-50 p-6 sm:p-8">
      <h2 className="text-lg font-normal text-ink-900">{title}</h2>
      {description && <p className="mt-1 text-sm font-light text-ink-700/60">{description}</p>}
      <div className="mt-6 grid gap-6 sm:grid-cols-2">{children}</div>
    </section>
  )
}

export default function AdminSettings() {
  const { showToast } = useToast()
  const [settingsId, setSettingsId] = useState<string | null>(null)
  const [form, setForm] = useState<SettingsFormValues | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    fetchSiteSettings()
      .then((settings) => {
        if (!settings) {
          setLoadError(
            'No settings row found. Run supabase/migrations/0007_site_settings.sql in the Supabase SQL Editor, then reload this page.',
          )
          return
        }
        setSettingsId(settings.id)
        setForm(settingsToFormValues(settings))
      })
      .catch((err) => setLoadError(getErrorMessage(err, 'Could not load site settings.')))
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function set<K extends keyof SettingsFormValues>(key: K, value: SettingsFormValues[K]) {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!form || !settingsId) return

    setIsSaving(true)
    try {
      const updated = await updateSiteSettings(settingsId, form)
      setForm(settingsToFormValues(updated))
      showToast('success', 'Settings saved. Changes are live on the site immediately.')
    } catch (err) {
      showToast('error', getErrorMessage(err, 'Could not save settings.'))
    } finally {
      setIsSaving(false)
    }
  }

  if (loading) {
    return (
      <>
        <PageHeader title="Settings" breadcrumbs={[{ label: 'Settings' }]} />
        <div className="flex justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-ink-700/40" strokeWidth={2} />
        </div>
      </>
    )
  }

  if (loadError || !form) {
    return (
      <>
        <PageHeader title="Settings" breadcrumbs={[{ label: 'Settings' }]} />
        <p className="py-16 text-center text-sm font-light text-red-500">{loadError}</p>
      </>
    )
  }

  return (
    <>
      <PageHeader
        title="Settings"
        description="Site-wide configuration — changes here apply across the public website immediately."
        breadcrumbs={[{ label: 'Settings' }]}
      />

      <form onSubmit={handleSubmit} noValidate className="space-y-8">
        <Section title="Company">
          <Input
            label="Company Name"
            value={form.company_name}
            onChange={(e) => set('company_name', e.target.value)}
            required
          />
        </Section>

        <Section title="Branding" description="Used across the site header, footer, loader, and browser tab.">
          <BrandingImagePicker label="Logo" value={form.logo_url} onChange={(url) => set('logo_url', url)} />
          <BrandingImagePicker
            label="Favicon"
            value={form.favicon_url}
            onChange={(url) => set('favicon_url', url)}
            previewClassName="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded bg-ink-900/5 p-3"
          />
        </Section>

        <Section title="Contact" description="Shown in the footer, the Contact page, and used for the WhatsApp button.">
          <div className="sm:col-span-2">
            <TagInput
              label="Contact Numbers"
              values={form.contact_phones}
              onChange={(values) => set('contact_phones', values)}
              placeholder="+91 99726 76594"
            />
          </div>
          <Input label="Email" type="email" value={form.email ?? ''} onChange={(e) => set('email', e.target.value)} />
          <Input
            label="WhatsApp Number"
            value={form.whatsapp_number ?? ''}
            onChange={(e) => set('whatsapp_number', e.target.value)}
            placeholder="919972676594"
          />
          <div className="sm:col-span-2">
            <Input
              label="Address"
              as="textarea"
              rows={2}
              value={form.address ?? ''}
              onChange={(e) => set('address', e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <Input
              label="Google Maps Embed URL"
              value={form.google_maps_embed_url ?? ''}
              onChange={(e) => set('google_maps_embed_url', e.target.value)}
              placeholder="https://www.google.com/maps/embed?pb=..."
            />
            <p className="mt-1.5 text-[11px] font-light text-ink-700/40">
              Google Maps &rarr; Share &rarr; Embed a map &rarr; copy the src URL from the iframe.
            </p>
          </div>
        </Section>

        <Section title="Social Links" description="Only platforms with a URL set are shown in the footer.">
          {SOCIAL_FIELDS.map(({ key, label, placeholder }) => (
            <Input
              key={key}
              label={label}
              value={(form[key] as string | null) ?? ''}
              onChange={(e) => set(key, e.target.value)}
              placeholder={placeholder}
            />
          ))}
        </Section>

        <Section title="Footer">
          <div className="sm:col-span-2">
            <Input
              label="Footer CTA Heading"
              value={form.footer_cta_heading ?? ''}
              onChange={(e) => set('footer_cta_heading', e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <Input
              label="Footer Tagline"
              as="textarea"
              rows={2}
              value={form.footer_tagline ?? ''}
              onChange={(e) => set('footer_tagline', e.target.value)}
            />
          </div>
          <Input
            label="Footer Bottom Tagline"
            value={form.footer_bottom_tagline ?? ''}
            onChange={(e) => set('footer_bottom_tagline', e.target.value)}
          />
        </Section>

        <Section title="SEO Defaults" description="Used as a fallback and for social share previews (Open Graph).">
          <Input
            label="Default Meta Title"
            value={form.seo_default_title ?? ''}
            onChange={(e) => set('seo_default_title', e.target.value)}
          />
          <div className="sm:col-span-2">
            <Input
              label="Default Meta Description"
              as="textarea"
              rows={2}
              value={form.seo_default_description ?? ''}
              onChange={(e) => set('seo_default_description', e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <TagInput
              label="SEO Keywords"
              values={form.seo_keywords}
              onChange={(values) => set('seo_keywords', values)}
              placeholder="interior design, luxury homes…"
            />
          </div>
          <div className="sm:col-span-2">
            <BrandingImagePicker
              label="Social Share Image"
              value={form.seo_og_image_url}
              onChange={(url) => set('seo_og_image_url', url)}
              previewClassName="flex h-20 w-32 shrink-0 items-center justify-center overflow-hidden rounded bg-ink-900/5"
            />
          </div>
        </Section>

        <Section title="Analytics & Meta Tags">
          <Input
            label="Google Analytics Measurement ID"
            value={form.ga_measurement_id ?? ''}
            onChange={(e) => set('ga_measurement_id', e.target.value)}
            placeholder="G-XXXXXXXXXX"
          />
          <Input
            label="Google Site Verification"
            value={form.google_site_verification ?? ''}
            onChange={(e) => set('google_site_verification', e.target.value)}
            placeholder="Content value from the meta tag"
          />
          <Input
            label="Theme Color"
            type="text"
            value={form.meta_theme_color ?? ''}
            onChange={(e) => set('meta_theme_color', e.target.value)}
            placeholder="#14130f"
          />
          <Input
            label="Robots Meta Tag"
            value={form.meta_robots}
            onChange={(e) => set('meta_robots', e.target.value)}
            placeholder="index, follow"
          />
        </Section>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSaving}>
            <span className="flex items-center gap-2">
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} /> : <Save className="h-4 w-4" strokeWidth={1.5} />}
              {isSaving ? 'Saving…' : 'Save Settings'}
            </span>
          </Button>
        </div>
      </form>
    </>
  )
}
