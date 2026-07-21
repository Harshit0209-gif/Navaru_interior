import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import { ErrorBoundary } from './components/ErrorBoundary'
import { BookingModalProvider } from './context/BookingModalContext'
import { ToastProvider } from './context/ToastContext'
import { SiteSettingsProvider } from './context/SiteSettingsContext'
import { SiteContentProvider } from './context/SiteContentContext'
import './index.css'

// Chrome/Safari restore the previous scroll position on a hard refresh by
// default (history.scrollRestoration = 'auto'), which fights the "every
// reload starts at the top" expectation almost every site actually has.
// Turning it off here means our own scrollTo(0,0) in App.tsx is what
// governs scroll position instead of the browser silently overriding it.
if ('scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual'
}

// AuthProvider (Supabase session/auth state) is deliberately NOT mounted
// here — it only wraps the admin route tree, inside App.tsx. Mounting it
// globally would run a Supabase session check (and pull in the ~55KB gzip
// SDK chunk) for every anonymous visitor to the public marketing site, who
// never touches /admin.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <SiteSettingsProvider>
          <SiteContentProvider>
            <ToastProvider>
              <BookingModalProvider>
                <App />
              </BookingModalProvider>
            </ToastProvider>
          </SiteContentProvider>
        </SiteSettingsProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
)
