import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { getSupabase } from '../lib/supabase'
import type { Database } from '../types/database'

export type SiteSettings = Database['public']['Tables']['site_settings']['Row']

// Mirrors the values that were previously hardcoded across the frontend
// (Footer, Contact page, index.html) and the seed row in
// supabase/migrations/0007_site_settings.sql — used until the real row
// loads, and as a safety net if the fetch ever fails, so nothing on the
// public site breaks or flashes empty content.
const DEFAULT_SETTINGS: SiteSettings = {
  id: '',
  company_name: 'Navaru Interior Solution',
  logo_url: null,
  favicon_url: null,
  contact_phones: ['+91 99726 76594'],
  whatsapp_number: null,
  email: 'navaruinteriorsolutions@gmail.com',
  address: '4 - 176C, Amba Road, Kidiyoor, Udupi Taluk & Dist, Karnataka 576103',
  google_maps_embed_url: null,
  social_instagram: null,
  social_facebook: null,
  social_linkedin: null,
  social_pinterest: null,
  social_youtube: null,
  social_twitter: null,
  footer_tagline: 'Bespoke interior design studio crafting refined residential and commercial spaces.',
  footer_cta_heading: "Let's design a space you never want to leave.",
  footer_bottom_tagline: 'Crafted with quiet obsession.',
  seo_default_title: 'Navaru Interior Solution',
  seo_default_description:
    'Navaru Interior Solution — bespoke interior design and space transformation for discerning homes and businesses.',
  seo_og_image_url: null,
  seo_keywords: [],
  ga_measurement_id: null,
  meta_theme_color: null,
  meta_robots: 'index, follow',
  google_site_verification: null,
  updated_at: '',
}

const SiteSettingsContext = createContext<SiteSettings>(DEFAULT_SETTINGS)

function upsertMeta(name: string, content: string) {
  let meta = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`)
  if (!meta) {
    meta = document.createElement('meta')
    meta.setAttribute('name', name)
    document.head.appendChild(meta)
  }
  meta.setAttribute('content', content)
}

function loadGoogleAnalytics(measurementId: string) {
  const existing = document.getElementById('ga-gtag-script') as HTMLScriptElement | null
  if (existing?.dataset.gaId === measurementId) return

  existing?.remove()
  document.getElementById('ga-gtag-inline')?.remove()

  const script = document.createElement('script')
  script.id = 'ga-gtag-script'
  script.dataset.gaId = measurementId
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`
  document.head.appendChild(script)

  const inline = document.createElement('script')
  inline.id = 'ga-gtag-inline'
  inline.textContent = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${measurementId}');`
  document.head.appendChild(inline)
}

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS)

  useEffect(() => {
    let cancelled = false
    getSupabase()
      .then((supabase) => supabase.from('site_settings').select('*').limit(1).maybeSingle())
      .then(({ data }) => {
        if (!cancelled && data) setSettings(data)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (settings.favicon_url) {
      let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]')
      if (!link) {
        link = document.createElement('link')
        link.rel = 'icon'
        document.head.appendChild(link)
      }
      link.href = settings.favicon_url
    }

    if (settings.meta_theme_color) upsertMeta('theme-color', settings.meta_theme_color)
    if (settings.meta_robots) upsertMeta('robots', settings.meta_robots)
    if (settings.google_site_verification) upsertMeta('google-site-verification', settings.google_site_verification)
    if (settings.ga_measurement_id) loadGoogleAnalytics(settings.ga_measurement_id)
  }, [settings.favicon_url, settings.meta_theme_color, settings.meta_robots, settings.google_site_verification, settings.ga_measurement_id])

  return <SiteSettingsContext.Provider value={settings}>{children}</SiteSettingsContext.Provider>
}

export function useSiteSettings(): SiteSettings {
  return useContext(SiteSettingsContext)
}
