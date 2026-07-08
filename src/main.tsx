import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import { ErrorBoundary } from './components/ErrorBoundary'
import { BookingModalProvider } from './context/BookingModalContext'
import { ToastProvider } from './context/ToastContext'
import { SiteSettingsProvider } from './context/SiteSettingsContext'
import './index.css'

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
          <ToastProvider>
            <BookingModalProvider>
              <App />
            </BookingModalProvider>
          </ToastProvider>
        </SiteSettingsProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
)
