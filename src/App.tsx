import { lazy, Suspense, useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { MainLayout } from './layouts/MainLayout'
import { Loader } from './components/Loader'
import { BookingModal } from './components/BookingModal'
import { ToastContainer } from './components/Toast'
import { ProtectedRoute } from './admin/components/ProtectedRoute'
import { DashboardLayout } from './admin/layouts/DashboardLayout'
import { AuthProvider } from './admin/context/AuthContext'
// Kept as a static import (not lazy) deliberately: it's the most likely
// landing page, so it should be in the initial bundle rather than costing
// an extra round-trip on first paint. Every other page is lazy-loaded.
import Home from './pages/Home'

const About = lazy(() => import('./pages/About'))
const Services = lazy(() => import('./pages/Services'))
const Portfolio = lazy(() => import('./pages/Portfolio'))
const ProjectDetail = lazy(() => import('./pages/ProjectDetail'))
const Contact = lazy(() => import('./pages/Contact'))
const NotFound = lazy(() => import('./pages/NotFound'))

const AdminLogin = lazy(() => import('./admin/pages/Login'))
const AdminDashboard = lazy(() => import('./admin/pages/Dashboard'))
const AdminPortfolio = lazy(() => import('./admin/pages/Portfolio'))
const AdminPortfolioNew = lazy(() => import('./admin/pages/PortfolioNew'))
const AdminPortfolioEdit = lazy(() => import('./admin/pages/PortfolioEdit'))
const AdminBookings = lazy(() => import('./admin/pages/Bookings'))
const AdminContact = lazy(() => import('./admin/pages/Contact'))
const AdminMediaLibrary = lazy(() => import('./admin/pages/MediaLibrary'))
const AdminSettings = lazy(() => import('./admin/pages/Settings'))
const AdminProfile = lazy(() => import('./admin/pages/Profile'))
const AdminActivityLog = lazy(() => import('./admin/pages/ActivityLog'))
const AdminNotFound = lazy(() => import('./admin/pages/NotFound'))

function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  )
}

function RouteFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream-100">
      <motion.span
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
        className="h-2 w-2 rounded-full bg-brass-400"
      />
    </div>
  )
}

export default function App() {
  const location = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [location.pathname])

  return (
    <>
      <Loader />
      <BookingModal />
      <ToastContainer />
      {/*
        Only rendered off /admin/* paths — otherwise this tree's own
        catch-all "*" route would match admin URLs too and render the
        public 404 page underneath/alongside the admin one.
      */}
      {!location.pathname.startsWith('/admin') && (
        <Suspense fallback={<RouteFallback />}>
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route element={<MainLayout />}>
                <Route
                  path="/"
                  element={
                    <PageTransition>
                      <Home />
                    </PageTransition>
                  }
                />
                <Route
                  path="/about"
                  element={
                    <PageTransition>
                      <About />
                    </PageTransition>
                  }
                />
                <Route
                  path="/services"
                  element={
                    <PageTransition>
                      <Services />
                    </PageTransition>
                  }
                />
                <Route
                  path="/portfolio"
                  element={
                    <PageTransition>
                      <Portfolio />
                    </PageTransition>
                  }
                />
                <Route
                  path="/portfolio/:slug"
                  element={
                    <PageTransition>
                      <ProjectDetail />
                    </PageTransition>
                  }
                />
                <Route
                  path="/contact"
                  element={
                    <PageTransition>
                      <Contact />
                    </PageTransition>
                  }
                />
                <Route
                  path="*"
                  element={
                    <PageTransition>
                      <NotFound />
                    </PageTransition>
                  }
                />
              </Route>
            </Routes>
          </AnimatePresence>
        </Suspense>
      )}

      {/*
        Admin routes deliberately live in their own <Routes> tree, outside
        the public site's AnimatePresence/PageTransition/MainLayout wrapper
        above. They don't share the marketing site's page-transition
        choreography or Navbar/Footer chrome.

        AuthProvider is only mounted (and only rendered at all) while on an
        /admin/* path, so anonymous visitors to the public site never incur
        a Supabase session check or pull in the Supabase SDK chunk.
      */}
      {location.pathname.startsWith('/admin') && (
        <AuthProvider>
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/portfolio" element={<AdminPortfolio />} />
                <Route path="/admin/portfolio/new" element={<AdminPortfolioNew />} />
                <Route path="/admin/portfolio/edit/:id" element={<AdminPortfolioEdit />} />
                <Route path="/admin/bookings" element={<AdminBookings />} />
                <Route path="/admin/contact" element={<AdminContact />} />
                <Route path="/admin/media" element={<AdminMediaLibrary />} />
                <Route path="/admin/settings" element={<AdminSettings />} />
                <Route path="/admin/profile" element={<AdminProfile />} />
                <Route path="/admin/activity" element={<AdminActivityLog />} />
                <Route path="*" element={<AdminNotFound />} />
              </Route>
            </Routes>
          </Suspense>
        </AuthProvider>
      )}
    </>
  )
}
