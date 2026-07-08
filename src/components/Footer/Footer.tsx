import { motion } from 'framer-motion'
import { Facebook, Instagram, Linkedin, Twitter, Youtube } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { AnimatedHeading } from '../AnimatedHeading'
import { Wordmark } from '../Wordmark'
import { PinterestIcon } from '../Icons/BrandIcons'
import { useSiteSettings } from '../../context/SiteSettingsContext'

const NAV = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Services', to: '/services' },
  { label: 'Portfolio', to: '/portfolio' },
  { label: 'Contact', to: '/contact' },
]

export function Footer() {
  const settings = useSiteSettings()

  const socials = [
    { icon: Instagram, href: settings.social_instagram, label: 'Instagram' },
    { icon: Facebook, href: settings.social_facebook, label: 'Facebook' },
    { icon: Linkedin, href: settings.social_linkedin, label: 'LinkedIn' },
    { icon: PinterestIcon, href: settings.social_pinterest, label: 'Pinterest' },
    { icon: Youtube, href: settings.social_youtube, label: 'YouTube' },
    { icon: Twitter, href: settings.social_twitter, label: 'Twitter' },
  ].filter((social): social is typeof social & { href: string } => Boolean(social.href))

  const primaryPhone = settings.contact_phones[0]

  return (
    <footer id="contact" className="bg-ink-950 text-cream-100">
      <div className="mx-auto max-w-content px-6 pb-16 pt-24 lg:px-12">
        <div className="flex flex-col items-start justify-between gap-10 border-b border-cream-100/10 pb-16 lg:flex-row lg:items-end">
          <AnimatedHeading
            as="h2"
            className="max-w-xl text-4xl font-light leading-tight tracking-tightest sm:text-5xl"
          >
            {settings.footer_cta_heading || "Let's design a space you never want to leave."}
          </AnimatedHeading>

          {settings.email && (
            <motion.a
              href={`mailto:${settings.email}`}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="shrink-0 border-b border-brass-300 pb-1 text-sm font-medium uppercase tracking-widest2 text-brass-300 transition-colors hover:text-brass-200"
            >
              {settings.email}
            </motion.a>
          )}
        </div>

        <div className="grid grid-cols-2 gap-10 py-16 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <div className="flex items-center gap-3">
              <img
                src={settings.logo_url || '/logo-mark.png'}
                alt={settings.company_name}
                className="h-12 w-auto"
                loading="lazy"
              />
              <Wordmark light size="md" />
            </div>
            <p className="mt-4 text-sm font-light leading-relaxed text-cream-200/60">
              {settings.footer_tagline ||
                'Bespoke interior design studio crafting refined residential and commercial spaces.'}
            </p>
          </div>

          <div>
            <p className="mb-4 text-xs font-medium uppercase tracking-widest2 text-cream-200/40">
              Navigate
            </p>
            <ul className="space-y-3">
              {NAV.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    className="text-sm font-light text-cream-200/80 transition-colors hover:text-brass-300"
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="mb-4 text-xs font-medium uppercase tracking-widest2 text-cream-200/40">
              Studio
            </p>
            {settings.address && (
              <p className="text-sm font-light leading-relaxed text-cream-200/80">{settings.address}</p>
            )}
            {primaryPhone && (
              <a
                href={`tel:${primaryPhone.replace(/[^+\d]/g, '')}`}
                className="mt-3 block text-sm font-light text-cream-200/80 transition-colors hover:text-brass-300"
              >
                {primaryPhone}
              </a>
            )}
          </div>

          {socials.length > 0 && (
            <div>
              <p className="mb-4 text-xs font-medium uppercase tracking-widest2 text-cream-200/40">
                Follow
              </p>
              <div className="flex flex-wrap gap-4">
                {socials.map(({ icon: Icon, href, label }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={label}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-cream-100/15 text-cream-200/80 transition-colors duration-300 hover:border-brass-300 hover:text-brass-300"
                  >
                    <Icon className="h-4 w-4" strokeWidth={1.5} />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4 border-t border-cream-100/10 pt-8 text-xs font-light text-cream-200/40 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} {settings.company_name}. All rights reserved.</p>
          <p>{settings.footer_bottom_tagline || 'Crafted with quiet obsession.'}</p>
        </div>
      </div>
    </footer>
  )
}
