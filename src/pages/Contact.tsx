import { MapPin, Mail, Phone } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { ContactForm } from '../components/ContactForm'
import { usePageMeta } from '../hooks/usePageMeta'
import { useSiteSettings } from '../context/SiteSettingsContext'

export default function Contact() {
  const settings = useSiteSettings()

  usePageMeta(
    'Contact',
    `Get in touch with ${settings.company_name} to schedule a consultation for your next residential or commercial interior project.`,
  )

  const details = [
    settings.address && { icon: MapPin, label: settings.address },
    settings.email && { icon: Mail, label: settings.email, href: `mailto:${settings.email}` },
    ...settings.contact_phones.map((phone) => ({
      icon: Phone,
      label: phone,
      href: `tel:${phone.replace(/[^+\d]/g, '')}`,
    })),
  ].filter((detail): detail is { icon: typeof MapPin; label: string; href?: string } => Boolean(detail))

  return (
    <>
      <PageHeader
        eyebrow="Get in Touch"
        title="Tell us about the space you're imagining."
        description="Share a few details below and one of our designers will reach out to schedule an initial consultation."
      />
      <section className="mx-auto max-w-content px-6 py-24 lg:px-12">
        <div className="grid gap-16 lg:grid-cols-[1fr_1.4fr] lg:gap-24">
          <div className="space-y-8">
            {details.map(({ icon: Icon, label, href }) => (
              <div key={label} className="flex items-start gap-4">
                <Icon className="mt-0.5 h-5 w-5 shrink-0 text-brass-400" strokeWidth={1.5} />
                {href ? (
                  <a
                    href={href}
                    className="text-sm font-light leading-relaxed text-ink-700 transition-colors hover:text-brass-400"
                  >
                    {label}
                  </a>
                ) : (
                  <p className="text-sm font-light leading-relaxed text-ink-700">{label}</p>
                )}
              </div>
            ))}

            {settings.google_maps_embed_url && (
              <div className="overflow-hidden border border-ink-900/10">
                <iframe
                  src={settings.google_maps_embed_url}
                  title="Studio location"
                  width="100%"
                  height="240"
                  style={{ border: 0 }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            )}
          </div>

          <ContactForm />
        </div>
      </section>
    </>
  )
}
