import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Calendar,
  Check,
  Facebook,
  Link2,
  MapPin,
  Ruler,
  Twitter,
  User,
} from 'lucide-react'
import { usePortfolioProject } from '../hooks/usePortfolioProject'
import { usePageMeta } from '../hooks/usePageMeta'
import { useBookingModal } from '../context/BookingModalContext'
import { useToast } from '../context/ToastContext'
import { Gallery } from '../components/Gallery'
import { ProjectCard } from '../components/ProjectCard'
import { Button } from '../components/Button'
import { Skeleton } from '../components/Skeleton'
import { getResizedImageUrl } from '../utils/imageTransform'

export default function ProjectDetail() {
  const { slug } = useParams<{ slug: string }>()
  const { project, related, loading, notFound, error } = usePortfolioProject(slug)
  const { open: openBooking } = useBookingModal()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [copied, setCopied] = useState(false)

  usePageMeta(
    project?.seo_title || project?.title || 'Portfolio',
    project?.seo_description || project?.short_description || 'A Navaru Interior Solution project.',
  )

  async function handleShare() {
    const shareData = {
      title: project?.title ?? 'Navaru Interior Solution',
      text: project?.short_description ?? '',
      url: window.location.href,
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch {
        // user cancelled the native share sheet — no action needed
      }
      return
    }

    await navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    showToast('success', 'Link copied to clipboard.')
    window.setTimeout(() => setCopied(false), 2000)
  }

  const shareUrl = typeof window !== 'undefined' ? encodeURIComponent(window.location.href) : ''

  if (loading) {
    return (
      <div className="mx-auto max-w-content px-6 py-24 lg:px-12">
        <Skeleton className="h-[50vh] w-full" />
        <div className="mt-12 grid gap-12 lg:grid-cols-[1.6fr_1fr]">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    )
  }

  if (notFound || error || !project) {
    return (
      <div className="mx-auto max-w-content px-6 py-32 text-center lg:px-12">
        <h1 className="text-3xl font-light tracking-tightest text-ink-900">
          {error ? 'Something went wrong' : 'Project not found'}
        </h1>
        <p className="mt-4 text-sm font-light text-ink-700">
          {error ?? "The project you're looking for may have moved or no longer exists."}
        </p>
        <Button variant="outline" className="mt-8" onClick={() => navigate('/portfolio')}>
          Back to Portfolio
        </Button>
      </div>
    )
  }

  return (
    <>
      <section className="relative flex h-[60vh] min-h-[420px] items-end overflow-hidden bg-ink-950">
        <img
          src={getResizedImageUrl(project.cover_image_url, { width: 1920, quality: 80 })}
          alt={project.title}
          className="absolute inset-0 h-full w-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/90 via-ink-950/20 to-transparent" />

        <div className="relative mx-auto w-full max-w-content px-6 pb-12 lg:px-12">
          <Link
            to="/portfolio"
            className="mb-6 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-widest2 text-cream-100/80 transition-colors hover:text-brass-300"
          >
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.75} />
            Back to Portfolio
          </Link>
          {project.category && (
            <p className="text-xs font-medium uppercase tracking-widest2 text-brass-300">
              {project.category.name}
            </p>
          )}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="mt-3 max-w-3xl text-4xl font-light leading-tight tracking-tightest text-cream-100 sm:text-5xl"
          >
            {project.title}
          </motion.h1>
        </div>
      </section>

      <section className="mx-auto max-w-content px-6 py-20 lg:px-12">
        <div className="grid gap-16 lg:grid-cols-[1.6fr_1fr] lg:gap-24">
          <div>
            <p className="text-lg font-light leading-relaxed text-ink-800">{project.short_description}</p>
            {project.detailed_description && (
              <p className="mt-6 whitespace-pre-line text-sm font-light leading-relaxed text-ink-700">
                {project.detailed_description}
              </p>
            )}

            {project.services_provided.length > 0 && (
              <div className="mt-10">
                <h2 className="mb-4 text-xs font-medium uppercase tracking-widest2 text-ink-700/60">
                  Services Provided
                </h2>
                <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {project.services_provided.map((service) => (
                    <li key={service} className="flex items-center gap-2.5 text-sm font-light text-ink-700">
                      <Check className="h-4 w-4 shrink-0 text-brass-400" strokeWidth={1.75} />
                      {service}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {project.images.length > 0 && (
              <div className="mt-16">
                <h2 className="mb-4 text-xs font-medium uppercase tracking-widest2 text-ink-700/60">
                  Gallery
                </h2>
                <Gallery
                  images={project.images.map((img) => ({ url: img.image_url, alt: img.alt_text ?? project.title }))}
                />
              </div>
            )}
          </div>

          <aside className="space-y-8">
            <div className="border border-ink-900/10 p-6">
              <h2 className="mb-5 text-xs font-medium uppercase tracking-widest2 text-ink-700/60">
                Project Information
              </h2>
              <dl className="space-y-4 text-sm font-light text-ink-800">
                {project.location && (
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brass-400" strokeWidth={1.5} />
                    <div>
                      <dt className="text-xs uppercase tracking-widest2 text-ink-700/70">Location</dt>
                      <dd>{project.location}</dd>
                    </div>
                  </div>
                )}
                {project.completion_year && (
                  <div className="flex items-start gap-3">
                    <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-brass-400" strokeWidth={1.5} />
                    <div>
                      <dt className="text-xs uppercase tracking-widest2 text-ink-700/70">Completed</dt>
                      <dd>{project.completion_year}</dd>
                    </div>
                  </div>
                )}
                {project.area && (
                  <div className="flex items-start gap-3">
                    <Ruler className="mt-0.5 h-4 w-4 shrink-0 text-brass-400" strokeWidth={1.5} />
                    <div>
                      <dt className="text-xs uppercase tracking-widest2 text-ink-700/70">Area</dt>
                      <dd>{project.area}</dd>
                    </div>
                  </div>
                )}
                {project.client_name && (
                  <div className="flex items-start gap-3">
                    <User className="mt-0.5 h-4 w-4 shrink-0 text-brass-400" strokeWidth={1.5} />
                    <div>
                      <dt className="text-xs uppercase tracking-widest2 text-ink-700/70">Client</dt>
                      <dd>{project.client_name}</dd>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-brass-400" />
                  <div>
                    <dt className="text-xs uppercase tracking-widest2 text-ink-700/70">Status</dt>
                    <dd>{project.project_status}</dd>
                  </div>
                </div>
              </dl>
            </div>

            <Button
              variant="primary"
              withArrow
              className="w-full justify-center"
              onClick={() => openBooking({ id: project.id, name: project.title })}
            >
              Book Design Consultation
            </Button>

            <div>
              <h2 className="mb-4 text-xs font-medium uppercase tracking-widest2 text-ink-700/60">Share</h2>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleShare}
                  aria-label="Share this project"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-ink-900/15 text-ink-700 transition-colors hover:border-brass-300 hover:text-brass-400"
                >
                  <Link2 className="h-4 w-4" strokeWidth={1.5} />
                </button>
                <a
                  href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${encodeURIComponent(project.title)}`}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Share on Twitter"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-ink-900/15 text-ink-700 transition-colors hover:border-brass-300 hover:text-brass-400"
                >
                  <Twitter className="h-4 w-4" strokeWidth={1.5} />
                </a>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Share on Facebook"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-ink-900/15 text-ink-700 transition-colors hover:border-brass-300 hover:text-brass-400"
                >
                  <Facebook className="h-4 w-4" strokeWidth={1.5} />
                </a>
                {copied && <span className="text-xs font-light text-brass-400">Copied!</span>}
              </div>
            </div>
          </aside>
        </div>

        {related.length > 0 && (
          <div className="mt-24 border-t border-ink-900/10 pt-16">
            <h2 className="mb-10 text-2xl font-light tracking-tightest text-ink-900">Related Projects</h2>
            <div className="grid auto-rows-[320px] gap-4 sm:grid-cols-3">
              {related.map((relatedProject, i) => (
                <ProjectCard
                  key={relatedProject.id}
                  index={i}
                  id={relatedProject.id}
                  slug={relatedProject.slug}
                  title={relatedProject.title}
                  category={relatedProject.category?.name ?? ''}
                  image={relatedProject.cover_image_url}
                />
              ))}
            </div>
          </div>
        )}
      </section>
    </>
  )
}
