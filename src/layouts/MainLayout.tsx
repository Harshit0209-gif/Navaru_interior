import { Outlet } from 'react-router-dom'
import { Navbar } from '../components/Navbar'
import { Footer } from '../components/Footer'
import { ScrollProgress } from '../components/ScrollProgress'
import { WhatsAppButton } from '../components/WhatsAppButton'

export function MainLayout() {
  return (
    <div className="min-h-screen bg-cream-100">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-ink-900 focus:px-4 focus:py-2 focus:text-xs focus:font-medium focus:uppercase focus:tracking-widest2 focus:text-cream-100"
      >
        Skip to content
      </a>
      <ScrollProgress />
      <Navbar />
      <main id="main-content">
        <Outlet />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  )
}
