import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Loader2, Save } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { Input } from '../../components/Input'
import { Button } from '../../components/Button'
import { TagInput } from '../components/TagInput'
import { BrandingImagePicker } from '../components/BrandingImagePicker'
import { VideoPicker } from '../components/VideoPicker'
import { Section } from '../components/Section'
import { RepeaterField } from '../components/RepeaterField'
import { IconSelect } from '../components/IconSelect'
import { useToast } from '../../context/ToastContext'
import { getErrorMessage } from '../../utils/errors'
import { fetchSiteContent, updateSiteContent } from '../services/siteContentService'
import { siteContentToFormValues } from '../types/siteContent'
import type { SiteContentFormValues } from '../types/siteContent'
import type { ServiceItem, StatItem, TestimonialItem, ValueItem, ProcessStepItem } from '../../types/database'

const NAV_SECTIONS = [
  { id: 'hero', label: 'Hero' },
  { id: 'about', label: 'About Us' },
  { id: 'mission-vision', label: 'Mission & Vision' },
  { id: 'philosophy', label: 'Philosophy' },
  { id: 'stats', label: 'Stats' },
  { id: 'services', label: 'Services' },
  { id: 'testimonials', label: 'Testimonials' },
  { id: 'portfolio-section', label: 'Portfolio Section' },
  { id: 'about-page', label: 'About Page Header' },
  { id: 'about-story', label: 'Our Story' },
  { id: 'values', label: 'What We Believe' },
  { id: 'process', label: 'How We Work' },
  { id: 'services-page', label: 'Services Page Header' },
  { id: 'services-cta', label: 'Services CTA' },
  { id: 'contact-page', label: 'Contact Page Header' },
]

export default function AdminSiteContent() {
  const { showToast } = useToast()
  const [contentId, setContentId] = useState<string | null>(null)
  const [form, setForm] = useState<SiteContentFormValues | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    fetchSiteContent()
      .then((content) => {
        if (!content) {
          setLoadError(
            'No content row found. Run supabase/migrations/0009_site_content.sql in the Supabase SQL Editor, then reload this page.',
          )
          return
        }
        setContentId(content.id)
        setForm(siteContentToFormValues(content))
      })
      .catch((err) => setLoadError(getErrorMessage(err, 'Could not load website content.')))
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function set<K extends keyof SiteContentFormValues>(key: K, value: SiteContentFormValues[K]) {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!form || !contentId) return

    setIsSaving(true)
    try {
      const updated = await updateSiteContent(contentId, form)
      setForm(siteContentToFormValues(updated))
      showToast('success', 'Website content saved. Changes are live on the site immediately.')
    } catch (err) {
      showToast('error', getErrorMessage(err, 'Could not save website content.'))
    } finally {
      setIsSaving(false)
    }
  }

  if (loading) {
    return (
      <>
        <PageHeader title="Website Content" breadcrumbs={[{ label: 'Website Content' }]} />
        <div className="flex justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-ink-700/40" strokeWidth={2} />
        </div>
      </>
    )
  }

  if (loadError || !form) {
    return (
      <>
        <PageHeader title="Website Content" breadcrumbs={[{ label: 'Website Content' }]} />
        <p className="py-16 text-center text-sm font-light text-red-500">{loadError}</p>
      </>
    )
  }

  return (
    <>
      <PageHeader
        title="Website Content"
        description="Every editable section of the public site — changes here apply immediately, no deploy needed."
        breadcrumbs={[{ label: 'Website Content' }]}
      />

      <nav className="mb-8 flex flex-wrap gap-x-5 gap-y-2 border-b border-ink-900/10 pb-6">
        {NAV_SECTIONS.map((section) => (
          <a
            key={section.id}
            href={`#${section.id}`}
            className="text-xs font-medium uppercase tracking-widest2 text-ink-700/60 transition-colors hover:text-brass-400"
          >
            {section.label}
          </a>
        ))}
      </nav>

      <form onSubmit={handleSubmit} noValidate className="space-y-8">
        <Section id="hero" title="Hero" description="The full-screen banner at the top of the Home page.">
          <Input label="Kicker" value={form.hero_kicker ?? ''} onChange={(e) => set('hero_kicker', e.target.value)} />
          <Input
            label="Headline"
            value={form.hero_headline ?? ''}
            onChange={(e) => set('hero_headline', e.target.value)}
          />
          <div className="sm:col-span-2">
            <Input
              label="Subtext"
              as="textarea"
              rows={2}
              value={form.hero_subtext ?? ''}
              onChange={(e) => set('hero_subtext', e.target.value)}
            />
          </div>
          <Input
            label="Primary Button Label"
            value={form.hero_cta_primary_label ?? ''}
            onChange={(e) => set('hero_cta_primary_label', e.target.value)}
          />
          <Input
            label="Secondary Button Label"
            value={form.hero_cta_secondary_label ?? ''}
            onChange={(e) => set('hero_cta_secondary_label', e.target.value)}
          />
          <div className="sm:col-span-2">
            <BrandingImagePicker
              label="Background Image"
              value={form.hero_image_url}
              onChange={(url) => set('hero_image_url', url)}
              folder="hero"
              previewClassName="flex h-24 w-40 shrink-0 items-center justify-center overflow-hidden rounded bg-ink-900/5"
            />
            <p className="mt-1.5 text-[11px] font-light text-ink-700/40">
              Leave empty to keep the current placeholder photo.
            </p>
          </div>
          <div className="sm:col-span-2">
            <VideoPicker
              label="Background Video"
              value={form.hero_video_url}
              onChange={(url) => set('hero_video_url', url)}
              folder="hero"
            />
            <p className="mt-1.5 text-[11px] font-light text-ink-700/40">
              Optional — if set, this plays behind the Hero instead of the background image above.
            </p>
          </div>
        </Section>

        <Section id="about" title="About Us" description="The full company story on the Home page.">
          <Input label="Eyebrow" value={form.about_eyebrow ?? ''} onChange={(e) => set('about_eyebrow', e.target.value)} />
          <Input label="Title" value={form.about_title ?? ''} onChange={(e) => set('about_title', e.target.value)} />
          <div className="sm:col-span-2">
            <Input
              label="Body"
              as="textarea"
              rows={14}
              value={form.about_body ?? ''}
              onChange={(e) => set('about_body', e.target.value)}
            />
            <p className="mt-1.5 text-[11px] font-light text-ink-700/40">
              Separate paragraphs with a blank line. Wrap text in **double asterisks** to make it bold.
            </p>
          </div>
        </Section>

        <Section id="mission-vision" title="Mission & Vision">
          <Input label="Mission Title" value={form.mission_title ?? ''} onChange={(e) => set('mission_title', e.target.value)} />
          <div />
          <div className="sm:col-span-2">
            <Input
              label="Mission Body"
              as="textarea"
              rows={4}
              value={form.mission_body ?? ''}
              onChange={(e) => set('mission_body', e.target.value)}
            />
          </div>
          <Input label="Vision Title" value={form.vision_title ?? ''} onChange={(e) => set('vision_title', e.target.value)} />
          <div />
          <div className="sm:col-span-2">
            <Input
              label="Vision Body"
              as="textarea"
              rows={4}
              value={form.vision_body ?? ''}
              onChange={(e) => set('vision_body', e.target.value)}
            />
          </div>
        </Section>

        <Section id="philosophy" title="Our Philosophy" description="Shown alongside the Stats on the Home page.">
          <Input
            label="Eyebrow"
            value={form.philosophy_eyebrow ?? ''}
            onChange={(e) => set('philosophy_eyebrow', e.target.value)}
          />
          <Input label="Title" value={form.philosophy_title ?? ''} onChange={(e) => set('philosophy_title', e.target.value)} />
          <div className="sm:col-span-2">
            <Input
              label="Body"
              as="textarea"
              rows={3}
              value={form.philosophy_body ?? ''}
              onChange={(e) => set('philosophy_body', e.target.value)}
            />
          </div>
        </Section>

        <Section id="stats" title="Stats" description="Shown on both the Home page and the About page.">
          <RepeaterField<StatItem>
            label="Stat Items"
            items={form.stats}
            onChange={(items) => set('stats', items)}
            createItem={() => ({ value: 0, suffix: '', label: '' })}
            itemLabel={(item) => item.label || 'New Stat'}
            addLabel="Add Stat"
            renderItem={(item, update) => (
              <>
                <Input
                  label="Value"
                  type="number"
                  value={String(item.value)}
                  onChange={(e) => update({ value: Number(e.target.value) || 0 })}
                />
                <Input label="Suffix" value={item.suffix} onChange={(e) => update({ suffix: e.target.value })} placeholder="+ or %" />
                <div className="sm:col-span-2">
                  <Input label="Label" value={item.label} onChange={(e) => update({ label: e.target.value })} />
                </div>
              </>
            )}
          />
        </Section>

        <Section
          id="services"
          title="Services"
          description="This single list feeds both the Home page summary cards and the full Services page detail."
        >
          <Input
            label="Home Section Eyebrow"
            value={form.services_summary_eyebrow ?? ''}
            onChange={(e) => set('services_summary_eyebrow', e.target.value)}
          />
          <Input
            label="Home Section Title"
            value={form.services_summary_title ?? ''}
            onChange={(e) => set('services_summary_title', e.target.value)}
          />
          <div className="sm:col-span-2">
            <Input
              label="Home Section Description"
              as="textarea"
              rows={2}
              value={form.services_summary_body ?? ''}
              onChange={(e) => set('services_summary_body', e.target.value)}
            />
          </div>

          <RepeaterField<ServiceItem>
            label="Service Items"
            items={form.services}
            onChange={(items) => set('services', items)}
            createItem={() => ({ icon: 'Sparkles', title: '', description: '', bullets: [], image_url: null })}
            itemLabel={(item) => item.title || 'New Service'}
            addLabel="Add Service"
            renderItem={(item, update) => (
              <>
                <div className="sm:col-span-2">
                  <IconSelect value={item.icon} onChange={(icon) => update({ icon })} />
                </div>
                <div className="sm:col-span-2">
                  <Input label="Title" value={item.title} onChange={(e) => update({ title: e.target.value })} />
                </div>
                <div className="sm:col-span-2">
                  <Input
                    label="Description"
                    as="textarea"
                    rows={3}
                    value={item.description}
                    onChange={(e) => update({ description: e.target.value })}
                  />
                </div>
                <div className="sm:col-span-2">
                  <TagInput
                    label="Bullet Points"
                    values={item.bullets}
                    onChange={(bullets) => update({ bullets })}
                    placeholder="Add a bullet point…"
                  />
                </div>
                <div className="sm:col-span-2">
                  <BrandingImagePicker
                    label="Photo"
                    value={item.image_url}
                    onChange={(image_url) => update({ image_url })}
                    folder="services"
                    previewClassName="flex h-24 w-32 shrink-0 items-center justify-center overflow-hidden rounded bg-ink-900/5"
                  />
                </div>
              </>
            )}
          />
        </Section>

        <Section id="testimonials" title="Testimonials" description="Shown in the rotating testimonial panel on the Home page.">
          <RepeaterField<TestimonialItem>
            label="Testimonial Items"
            items={form.testimonials}
            onChange={(items) => set('testimonials', items)}
            createItem={() => ({ quote: '', name: '', role: '' })}
            itemLabel={(item) => item.name || 'New Testimonial'}
            addLabel="Add Testimonial"
            renderItem={(item, update) => (
              <>
                <div className="sm:col-span-2">
                  <Input
                    label="Quote"
                    as="textarea"
                    rows={3}
                    value={item.quote}
                    onChange={(e) => update({ quote: e.target.value })}
                  />
                </div>
                <Input label="Name" value={item.name} onChange={(e) => update({ name: e.target.value })} />
                <Input label="Role" value={item.role} onChange={(e) => update({ role: e.target.value })} placeholder="Homeowner, Project Name" />
              </>
            )}
          />
        </Section>

        <Section id="portfolio-section" title="Portfolio Section" description="The 'Selected Work' teaser on the Home page.">
          <Input
            label="Eyebrow"
            value={form.portfolio_eyebrow ?? ''}
            onChange={(e) => set('portfolio_eyebrow', e.target.value)}
          />
          <Input label="Title" value={form.portfolio_title ?? ''} onChange={(e) => set('portfolio_title', e.target.value)} />
          <Input
            label="Button Label"
            value={form.portfolio_button_label ?? ''}
            onChange={(e) => set('portfolio_button_label', e.target.value)}
          />
        </Section>

        <Section id="about-page" title="About Page Header">
          <Input
            label="Eyebrow"
            value={form.about_page_eyebrow ?? ''}
            onChange={(e) => set('about_page_eyebrow', e.target.value)}
          />
          <Input
            label="Title"
            value={form.about_page_title ?? ''}
            onChange={(e) => set('about_page_title', e.target.value)}
          />
          <div className="sm:col-span-2">
            <Input
              label="Description"
              as="textarea"
              rows={2}
              value={form.about_page_description ?? ''}
              onChange={(e) => set('about_page_description', e.target.value)}
            />
          </div>
        </Section>

        <Section id="about-story" title="Our Story" description="The story section with a photo on the About page.">
          <Input
            label="Eyebrow"
            value={form.about_story_eyebrow ?? ''}
            onChange={(e) => set('about_story_eyebrow', e.target.value)}
          />
          <Input
            label="Title"
            value={form.about_story_title ?? ''}
            onChange={(e) => set('about_story_title', e.target.value)}
          />
          <div className="sm:col-span-2">
            <Input
              label="Body"
              as="textarea"
              rows={4}
              value={form.about_story_body ?? ''}
              onChange={(e) => set('about_story_body', e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <BrandingImagePicker
              label="Photo"
              value={form.about_story_image_url}
              onChange={(url) => set('about_story_image_url', url)}
              folder="about"
              previewClassName="flex h-24 w-32 shrink-0 items-center justify-center overflow-hidden rounded bg-ink-900/5"
            />
            <p className="mt-1.5 text-[11px] font-light text-ink-700/40">
              Leave empty to keep the current placeholder photo.
            </p>
          </div>
        </Section>

        <Section id="values" title="What We Believe" description="The four principle cards on the About page.">
          <Input label="Eyebrow" value={form.values_eyebrow ?? ''} onChange={(e) => set('values_eyebrow', e.target.value)} />
          <Input label="Title" value={form.values_title ?? ''} onChange={(e) => set('values_title', e.target.value)} />

          <RepeaterField<ValueItem>
            label="Value Items"
            items={form.values}
            onChange={(items) => set('values', items)}
            createItem={() => ({ icon: 'Sparkles', title: '', description: '' })}
            itemLabel={(item) => item.title || 'New Value'}
            addLabel="Add Value"
            renderItem={(item, update) => (
              <>
                <div className="sm:col-span-2">
                  <IconSelect value={item.icon} onChange={(icon) => update({ icon })} />
                </div>
                <div className="sm:col-span-2">
                  <Input label="Title" value={item.title} onChange={(e) => update({ title: e.target.value })} />
                </div>
                <div className="sm:col-span-2">
                  <Input
                    label="Description"
                    as="textarea"
                    rows={2}
                    value={item.description}
                    onChange={(e) => update({ description: e.target.value })}
                  />
                </div>
              </>
            )}
          />
        </Section>

        <Section id="process" title="How We Work" description="The step-by-step process timeline on the About page.">
          <Input label="Eyebrow" value={form.process_eyebrow ?? ''} onChange={(e) => set('process_eyebrow', e.target.value)} />
          <Input label="Title" value={form.process_title ?? ''} onChange={(e) => set('process_title', e.target.value)} />
          <div className="sm:col-span-2">
            <Input
              label="Description"
              as="textarea"
              rows={2}
              value={form.process_body ?? ''}
              onChange={(e) => set('process_body', e.target.value)}
            />
          </div>

          <RepeaterField<ProcessStepItem>
            label="Process Steps"
            items={form.process_steps}
            onChange={(items) => set('process_steps', items)}
            createItem={() => ({ title: '', description: '' })}
            itemLabel={(item) => item.title || 'New Step'}
            addLabel="Add Step"
            renderItem={(item, update) => (
              <>
                <div className="sm:col-span-2">
                  <Input label="Title" value={item.title} onChange={(e) => update({ title: e.target.value })} />
                </div>
                <div className="sm:col-span-2">
                  <Input
                    label="Description"
                    as="textarea"
                    rows={2}
                    value={item.description}
                    onChange={(e) => update({ description: e.target.value })}
                  />
                </div>
              </>
            )}
          />
        </Section>

        <Section id="services-page" title="Services Page Header">
          <Input
            label="Eyebrow"
            value={form.services_page_eyebrow ?? ''}
            onChange={(e) => set('services_page_eyebrow', e.target.value)}
          />
          <Input
            label="Title"
            value={form.services_page_title ?? ''}
            onChange={(e) => set('services_page_title', e.target.value)}
          />
          <div className="sm:col-span-2">
            <Input
              label="Description"
              as="textarea"
              rows={2}
              value={form.services_page_description ?? ''}
              onChange={(e) => set('services_page_description', e.target.value)}
            />
          </div>
        </Section>

        <Section id="services-cta" title="Services Closing CTA" description="The dark call-to-action band at the bottom of the Services page.">
          <Input
            label="Eyebrow"
            value={form.services_cta_eyebrow ?? ''}
            onChange={(e) => set('services_cta_eyebrow', e.target.value)}
          />
          <Input
            label="Button Label"
            value={form.services_cta_button_label ?? ''}
            onChange={(e) => set('services_cta_button_label', e.target.value)}
          />
          <div className="sm:col-span-2">
            <Input
              label="Heading"
              as="textarea"
              rows={2}
              value={form.services_cta_heading ?? ''}
              onChange={(e) => set('services_cta_heading', e.target.value)}
            />
          </div>
        </Section>

        <Section id="contact-page" title="Contact Page Header">
          <Input
            label="Eyebrow"
            value={form.contact_page_eyebrow ?? ''}
            onChange={(e) => set('contact_page_eyebrow', e.target.value)}
          />
          <Input
            label="Title"
            value={form.contact_page_title ?? ''}
            onChange={(e) => set('contact_page_title', e.target.value)}
          />
          <div className="sm:col-span-2">
            <Input
              label="Description"
              as="textarea"
              rows={2}
              value={form.contact_page_description ?? ''}
              onChange={(e) => set('contact_page_description', e.target.value)}
            />
          </div>
        </Section>

        <div className="sticky bottom-4 flex justify-end">
          <Button type="submit" disabled={isSaving}>
            <span className="flex items-center gap-2">
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} /> : <Save className="h-4 w-4" strokeWidth={1.5} />}
              {isSaving ? 'Saving…' : 'Save Website Content'}
            </span>
          </Button>
        </div>
      </form>
    </>
  )
}
