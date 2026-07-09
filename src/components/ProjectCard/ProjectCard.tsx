import { motion } from 'framer-motion'
import { ArrowUpRight, CalendarPlus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '../../utils/cn'
import { useBookingModal } from '../../context/BookingModalContext'
import { getResizedImageUrl } from '../../utils/imageTransform'

const MotionLink = motion.create(Link)

type ProjectCardProps = {
  index: number
  id: string
  slug: string
  image: string
  title: string
  category: string
  className?: string
}

export function ProjectCard({ index, id, slug, image, title, category, className }: ProjectCardProps) {
  const { open: openBooking } = useBookingModal()
  const src = getResizedImageUrl(image, { width: 900, quality: 75 })

  return (
    <MotionLink
      to={`/portfolio/${slug}`}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.8, delay: (index % 3) * 0.1, ease: [0.16, 1, 0.3, 1] }}
      className={cn('group relative block overflow-hidden bg-ink-900', className)}
    >
      {/* No fixed aspect-ratio box: the card takes the exact shape of
          whatever image is uploaded (portrait, landscape, square, etc.)
          instead of forcing every cover image into the same box and
          cropping or padding it to fit. */}
      <motion.img
        src={src}
        alt={title}
        loading="lazy"
        decoding="async"
        className="block h-auto w-full"
        initial={{ scale: 1 }}
        whileHover={{ scale: 1.06 }}
        transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
      />

      <div className="absolute inset-0 bg-gradient-to-t from-ink-950/85 via-ink-950/10 to-transparent opacity-70 transition-opacity duration-500 group-hover:opacity-90" />

      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-6">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-widest2 text-brass-300">
            {category}
          </p>
          <h3 className="mt-2 text-2xl font-light tracking-tightest text-cream-100">{title}</h3>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              openBooking({ id, name: title })
            }}
            aria-label={`Book a design consultation for ${title}`}
            title="Book Design"
            className="flex h-11 w-11 translate-y-2 items-center justify-center rounded-full border border-cream-100/30 text-cream-100 opacity-0 transition-all duration-500 ease-luxury hover:border-brass-300 hover:text-brass-300 group-hover:translate-y-0 group-hover:opacity-100"
          >
            <CalendarPlus className="h-4 w-4" strokeWidth={1.5} />
          </button>
          <span
            aria-hidden="true"
            title="View Details"
            className="flex h-11 w-11 shrink-0 translate-y-2 items-center justify-center rounded-full border border-cream-100/30 text-cream-100 opacity-0 transition-all duration-500 ease-luxury group-hover:translate-y-0 group-hover:opacity-100"
          >
            <ArrowUpRight className="h-4 w-4" strokeWidth={1.5} />
          </span>
        </div>
      </div>
    </MotionLink>
  )
}
