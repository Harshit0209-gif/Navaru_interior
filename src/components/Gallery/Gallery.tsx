import { useCallback, useEffect, useRef, useState } from 'react'
import type { TouchEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react'
import { cn } from '../../utils/cn'
import { getResizedImageUrl } from '../../utils/imageTransform'

export type GalleryImage = {
  url: string
  alt?: string
}

type GalleryProps = {
  images: GalleryImage[]
  className?: string
}

const SWIPE_THRESHOLD_PX = 50

export function Gallery({ images, className }: GalleryProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const touchStartX = useRef<number | null>(null)

  const close = useCallback(() => setActiveIndex(null), [])
  const showPrev = useCallback(
    () => setActiveIndex((i) => (i === null ? null : (i - 1 + images.length) % images.length)),
    [images.length],
  )
  const showNext = useCallback(
    () => setActiveIndex((i) => (i === null ? null : (i + 1) % images.length)),
    [images.length],
  )

  useEffect(() => {
    if (activeIndex === null) return

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowLeft') showPrev()
      if (e.key === 'ArrowRight') showNext()
    }
    window.addEventListener('keydown', onKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
    }
  }, [activeIndex, close, showPrev, showNext])

  function handleTouchStart(e: TouchEvent) {
    touchStartX.current = e.touches[0]?.clientX ?? null
  }

  function handleTouchEnd(e: TouchEvent) {
    if (touchStartX.current === null) return
    const deltaX = e.changedTouches[0].clientX - touchStartX.current
    if (deltaX > SWIPE_THRESHOLD_PX) showPrev()
    else if (deltaX < -SWIPE_THRESHOLD_PX) showNext()
    touchStartX.current = null
  }

  if (images.length === 0) return null

  return (
    <>
      <div className={cn('grid grid-cols-2 gap-4 sm:grid-cols-3', className)}>
        {images.map((image, i) => (
          <button
            key={image.url}
            type="button"
            onClick={() => setActiveIndex(i)}
            className="group relative aspect-square overflow-hidden bg-ink-900"
            aria-label={`Open image ${i + 1} of ${images.length} in fullscreen`}
          >
            <img
              src={getResizedImageUrl(image.url, { width: 500, height: 500, quality: 75 })}
              alt={image.alt ?? ''}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition-transform duration-700 ease-luxury group-hover:scale-110"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-ink-950/0 opacity-0 transition-all duration-300 group-hover:bg-ink-950/30 group-hover:opacity-100">
              <ZoomIn className="h-6 w-6 text-cream-100" strokeWidth={1.5} />
            </div>
          </button>
        ))}
      </div>

      <AnimatePresence>
        {activeIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[95] flex items-center justify-center bg-ink-950/95 backdrop-blur-sm"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            role="dialog"
            aria-modal="true"
            aria-label="Image gallery, fullscreen preview"
          >
            <button
              type="button"
              onClick={close}
              aria-label="Close fullscreen preview"
              className="absolute right-6 top-6 z-10 text-cream-100/70 transition-colors hover:text-cream-100"
            >
              <X className="h-7 w-7" strokeWidth={1.5} />
            </button>

            <button
              type="button"
              onClick={showPrev}
              aria-label="Previous image"
              className="absolute left-2 top-1/2 z-10 -translate-y-1/2 p-3 text-cream-100/70 transition-colors hover:text-cream-100 sm:left-6"
            >
              <ChevronLeft className="h-8 w-8" strokeWidth={1.25} />
            </button>

            <AnimatePresence mode="wait">
              <motion.img
                key={activeIndex}
                src={getResizedImageUrl(images[activeIndex].url, { width: 1800, quality: 80 })}
                alt={images[activeIndex].alt ?? ''}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="max-h-[85vh] max-w-[90vw] object-contain"
              />
            </AnimatePresence>

            <button
              type="button"
              onClick={showNext}
              aria-label="Next image"
              className="absolute right-2 top-1/2 z-10 -translate-y-1/2 p-3 text-cream-100/70 transition-colors hover:text-cream-100 sm:right-6"
            >
              <ChevronRight className="h-8 w-8" strokeWidth={1.25} />
            </button>

            <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-xs font-medium uppercase tracking-widest2 text-cream-100/50">
              {activeIndex + 1} / {images.length}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
