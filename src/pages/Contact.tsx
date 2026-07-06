import { MapPin, Mail, Phone } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { ContactForm } from '../components/ContactForm'

const DETAILS = [
  {
    icon: MapPin,
    label: '4 - 176C, Amba Road, Kidiyoor, Udupi Taluk & Dist - 576103',
  },
  {
    icon: Mail,
    label: 'navaruinteriorsolutions@gmail.com',
    href: 'mailto:navaruinteriorsolutions@gmail.com',
  },
  { icon: Phone, label: '+91 99726 76594', href: 'tel:+919972676594' },
]

export default function Contact() {
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
            {DETAILS.map(({ icon: Icon, label, href }) => (
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
          </div>

          <ContactForm />
        </div>
      </section>
    </>
  )
}
