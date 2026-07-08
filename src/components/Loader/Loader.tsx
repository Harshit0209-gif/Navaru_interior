import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useSiteSettings } from '../../context/SiteSettingsContext'
import { Wordmark } from '../Wordmark'

export function Loader() {
  const [loading, setLoading] = useState(true)
  const { logo_url: logoUrl, company_name: companyName } = useSiteSettings()

  useEffect(() => {
    const minTime = new Promise((resolve) => setTimeout(resolve, 1400))
    const fontsReady = document.fonts?.ready ?? Promise.resolve()
    Promise.all([minTime, fontsReady]).then(() => setLoading(false))
  }, [])

  useEffect(() => {
    document.body.style.overflow = loading ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [loading])

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-ink-950"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.04 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center gap-6"
          >
            <img src={logoUrl || '/logo-mark.png'} alt={companyName} className="h-16 w-auto sm:h-20" />
            <div className="h-px w-40 overflow-hidden bg-cream-100/10">
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1.3, ease: [0.16, 1, 0.3, 1] }}
                className="h-full w-full origin-left bg-brass-300"
              />
            </div>
            <Wordmark light size="md" align="center" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
