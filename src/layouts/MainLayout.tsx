import { Outlet } from 'react-router-dom'
import { Navbar } from '../components/Navbar'
import { Footer } from '../components/Footer'
import { ScrollProgress } from '../components/ScrollProgress'

export function MainLayout() {
  return (
    <div className="min-h-screen bg-cream-100">
      <ScrollProgress />
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
