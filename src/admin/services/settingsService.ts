import { getSupabase } from '../../lib/supabase'
import { logActivity } from './activityLogService'
import type { SettingsFormValues, SiteSettings } from '../types/settings'

export async function fetchSiteSettings(): Promise<SiteSettings | null> {
  const supabase = await getSupabase()
  const { data, error } = await supabase.from('site_settings').select('*').limit(1).maybeSingle()
  if (error) throw error
  return data
}

export async function updateSiteSettings(id: string, values: SettingsFormValues): Promise<SiteSettings> {
  const supabase = await getSupabase()
  const { data, error } = await supabase
    .from('site_settings')
    .update({
      company_name: values.company_name,
      logo_url: values.logo_url || null,
      favicon_url: values.favicon_url || null,
      contact_phones: values.contact_phones,
      whatsapp_number: values.whatsapp_number || null,
      email: values.email || null,
      address: values.address || null,
      google_maps_embed_url: values.google_maps_embed_url || null,
      social_instagram: values.social_instagram || null,
      social_facebook: values.social_facebook || null,
      social_linkedin: values.social_linkedin || null,
      social_pinterest: values.social_pinterest || null,
      social_youtube: values.social_youtube || null,
      social_twitter: values.social_twitter || null,
      footer_tagline: values.footer_tagline || null,
      footer_cta_heading: values.footer_cta_heading || null,
      footer_bottom_tagline: values.footer_bottom_tagline || null,
      seo_default_title: values.seo_default_title || null,
      seo_default_description: values.seo_default_description || null,
      seo_og_image_url: values.seo_og_image_url || null,
      seo_keywords: values.seo_keywords,
      ga_measurement_id: values.ga_measurement_id || null,
      meta_theme_color: values.meta_theme_color || null,
      meta_robots: values.meta_robots || 'index, follow',
      google_site_verification: values.google_site_verification || null,
    })
    .eq('id', id)
    .select('*')
    .single()

  if (error) throw error

  await logActivity({
    action: 'settings.updated',
    description: 'Updated site settings',
    recordType: 'site_settings',
    recordId: id,
  })

  return data
}
