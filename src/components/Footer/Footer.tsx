import { motion } from 'framer-motion'
import { Instagram, Linkedin, Facebook } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { AnimatedHeading } from '../AnimatedHeading'

const NAV = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Services', to: '/services' },
  { label: 'Portfolio', to: '/portfolio' },
  { label: 'Contact', to: '/contact' },
]

const SOCIALS = [
  { icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
  { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
  { icon: Facebook, href: 'https://facebook.com', label: 'Facebook' },
]

export function Footer() {
  return (
    <footer id="contact" className="bg-ink-950 text-cream-100">
      <div className="mx-auto max-w-content px-6 pb-16 pt-24 lg:px-12">
        <div className="flex flex-col items-start justify-between gap-10 border-b border-cream-100/10 pb-16 lg:flex-row lg:items-end">
          <AnimatedHeading
            as="h2"
            className="max-w-xl text-4xl font-light leading-tight tracking-tightest sm:text-5xl"
          >
            Let's design a space you never want to leave.
          </AnimatedHeading>

          <motion.a
            href="mailto:navaruinteriorsolutions@gmail.com"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="shrink-0 border-b border-brass-300 pb-1 text-sm font-medium uppercase tracking-widest2 text-brass-300 transition-colors hover:text-brass-200"
          >
            navaruinteriorsolutions@gmail.com
          </motion.a>
        </div>

        <div className="grid grid-cols-2 gap-10 py-16 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <img src="/logo-mark.png" alt="Navaru Interior Solution" className="h-12 w-auto" />
            <p className="mt-4 text-sm font-light leading-relaxed text-cream-200/60">
              Bespoke interior design studio crafting refined residential and
              commercial spaces.
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
            <p className="text-sm font-light leading-relaxed text-cream-200/80">
              4 - 176C, Amba Road
              <br />
              Kidiyoor, Udupi Taluk &amp; Dist
              <br />
              Karnataka 576103
            </p>
            <a
              href="tel:+919972676594"
              className="mt-3 block text-sm font-light text-cream-200/80 transition-colors hover:text-brass-300"
            >
              +91 99726 76594
            </a>
          </div>

          <div>
            <p className="mb-4 text-xs font-medium uppercase tracking-widest2 text-cream-200/40">
              Follow
            </p>
            <div className="flex gap-4">
              {SOCIALS.map(({ icon: Icon, href, label }) => (
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
        </div>

        <div className="flex flex-col gap-4 border-t border-cream-100/10 pt-8 text-xs font-light text-cream-200/40 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} Navaru Interior Solution. All rights reserved.</p>
          <p>Crafted with quiet obsession.</p>
        </div>
      </div>
    </footer>
  )
}
