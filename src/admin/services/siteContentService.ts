import { getSupabase } from '../../lib/supabase'
import { logActivity } from './activityLogService'
import type { SiteContentFormValues, SiteContent } from '../types/siteContent'

export async function fetchSiteContent(): Promise<SiteContent | null> {
  const supabase = await getSupabase()
  const { data, error } = await supabase.from('site_content').select('*').limit(1).maybeSingle()
  if (error) throw error
  return data
}

export async function updateSiteContent(id: string, values: SiteContentFormValues): Promise<SiteContent> {
  const supabase = await getSupabase()
  const { data, error } = await supabase
    .from('site_content')
    .update({
      hero_kicker: values.hero_kicker || null,
      hero_headline: values.hero_headline || null,
      hero_subtext: values.hero_subtext || null,
      hero_cta_primary_label: values.hero_cta_primary_label || null,
      hero_cta_secondary_label: values.hero_cta_secondary_label || null,
      hero_image_url: values.hero_image_url || null,
      hero_video_url: values.hero_video_url || null,
      about_eyebrow: values.about_eyebrow || null,
      about_title: values.about_title || null,
      about_body: values.about_body || null,
      mission_title: values.mission_title || null,
      mission_body: values.mission_body || null,
      vision_title: values.vision_title || null,
      vision_body: values.vision_body || null,
      philosophy_eyebrow: values.philosophy_eyebrow || null,
      philosophy_title: values.philosophy_title || null,
      philosophy_body: values.philosophy_body || null,
      services_summary_eyebrow: values.services_summary_eyebrow || null,
      services_summary_title: values.services_summary_title || null,
      services_summary_body: values.services_summary_body || null,
      portfolio_eyebrow: values.portfolio_eyebrow || null,
      portfolio_title: values.portfolio_title || null,
      portfolio_button_label: values.portfolio_button_label || null,
      about_page_eyebrow: values.about_page_eyebrow || null,
      about_page_title: values.about_page_title || null,
      about_page_description: values.about_page_description || null,
      about_story_eyebrow: values.about_story_eyebrow || null,
      about_story_title: values.about_story_title || null,
      about_story_body: values.about_story_body || null,
      about_story_image_url: values.about_story_image_url || null,
      values_eyebrow: values.values_eyebrow || null,
      values_title: values.values_title || null,
      process_eyebrow: values.process_eyebrow || null,
      process_title: values.process_title || null,
      process_body: values.process_body || null,
      services_page_eyebrow: values.services_page_eyebrow || null,
      services_page_title: values.services_page_title || null,
      services_page_description: values.services_page_description || null,
      services_cta_eyebrow: values.services_cta_eyebrow || null,
      services_cta_heading: values.services_cta_heading || null,
      services_cta_button_label: values.services_cta_button_label || null,
      contact_page_eyebrow: values.contact_page_eyebrow || null,
      contact_page_title: values.contact_page_title || null,
      contact_page_description: values.contact_page_description || null,
      stats: values.stats,
      services: values.services,
      testimonials: values.testimonials,
      values: values.values,
      process_steps: values.process_steps,
    })
    .eq('id', id)
    .select('*')
    .single()

  if (error) throw error

  await logActivity({
    action: 'content.updated',
    description: 'Updated website content',
    recordType: 'site_content',
    recordId: id,
  })

  return data
}
