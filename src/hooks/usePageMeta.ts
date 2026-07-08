import { useEffect } from 'react'
import { useSiteSettings } from '../context/SiteSettingsContext'

function upsertMeta(selector: string, attrs: Record<string, string>) {
  let meta = document.querySelector<HTMLMetaElement>(selector)
  if (!meta) {
    meta = document.createElement('meta')
    for (const [key, value] of Object.entries(attrs)) {
      if (key !== 'content') meta.setAttribute(key, value)
    }
    document.head.appendChild(meta)
  }
  meta.setAttribute('content', attrs.content)
}

export function usePageMeta(title: string, description: string) {
  const settings = useSiteSettings()

  useEffect(() => {
    const siteName = settings.company_name || 'Navaru Interior Solution'
    const fullTitle = title ? `${title} | ${siteName}` : siteName

    document.title = fullTitle
    upsertMeta('meta[name="description"]', { name: 'description', content: description })
    upsertMeta('meta[property="og:title"]', { property: 'og:title', content: fullTitle })
    upsertMeta('meta[property="og:description"]', { property: 'og:description', content: description })
    upsertMeta('meta[property="og:type"]', { property: 'og:type', content: 'website' })
    upsertMeta('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary_large_image' })
    upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: fullTitle })
    upsertMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: description })

    if (settings.seo_og_image_url) {
      upsertMeta('meta[property="og:image"]', { property: 'og:image', content: settings.seo_og_image_url })
      upsertMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: settings.seo_og_image_url })
    }
  }, [title, description, settings.company_name, settings.seo_og_image_url])
}
