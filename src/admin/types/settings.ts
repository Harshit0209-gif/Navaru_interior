import type { Database } from '../../types/database'

export type SiteSettings = Database['public']['Tables']['site_settings']['Row']

export type SettingsFormValues = Omit<SiteSettings, 'id' | 'updated_at'>

export function settingsToFormValues(settings: SiteSettings): SettingsFormValues {
  return {
    company_name: settings.company_name,
    logo_url: settings.logo_url,
    favicon_url: settings.favicon_url,
    contact_phones: settings.contact_phones ?? [],
    whatsapp_number: settings.whatsapp_number,
    email: settings.email,
    address: settings.address,
    google_maps_embed_url: settings.google_maps_embed_url,
    social_instagram: settings.social_instagram,
    social_facebook: settings.social_facebook,
    social_linkedin: settings.social_linkedin,
    social_pinterest: settings.social_pinterest,
    social_youtube: settings.social_youtube,
    social_twitter: settings.social_twitter,
    footer_tagline: settings.footer_tagline,
    footer_cta_heading: settings.footer_cta_heading,
    footer_bottom_tagline: settings.footer_bottom_tagline,
    seo_default_title: settings.seo_default_title,
    seo_default_description: settings.seo_default_description,
    seo_og_image_url: settings.seo_og_image_url,
    seo_keywords: settings.seo_keywords ?? [],
    ga_measurement_id: settings.ga_measurement_id,
    meta_theme_color: settings.meta_theme_color,
    meta_robots: settings.meta_robots,
    google_site_verification: settings.google_site_verification,
  }
}
