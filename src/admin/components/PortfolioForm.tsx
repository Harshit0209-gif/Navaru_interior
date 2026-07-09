import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Check, Loader2 } from 'lucide-react'
import { Input } from '../../components/Input'
import { Button } from '../../components/Button'
import { TagInput } from './TagInput'
import { CoverImagePicker } from './CoverImagePicker'
import { GalleryManager } from './GalleryManager'
import { useCategories } from '../../hooks/useCategories'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import { useToast } from '../../context/ToastContext'
import { getErrorMessage } from '../../utils/errors'
import { createProject, isSlugAvailable, updateProject } from '../services/portfolioService'
import { slugify, isValidSlug } from '../../utils/slugify'
import { PROJECT_STATUS_OPTIONS, EMPTY_PORTFOLIO_FORM } from '../types/portfolio'
import type { PortfolioFormErrors, PortfolioFormValues } from '../types/portfolio'
import type { PortfolioProject } from '../../types/portfolio'
import type { PublishStatus } from '../../types/database'

const selectClasses =
  'peer w-full border-b border-ink-900/20 bg-ink-900/5 pb-3 pt-6 text-base font-light text-ink-900 outline-none transition-colors duration-300 focus:border-brass-400'

const STATUS_SELECT_OPTIONS: { value: PublishStatus; label: string }[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' },
]

function isLikelyUrl(value: string): boolean {
  return /^https?:\/\/.+/i.test(value.trim())
}

function validate(values: PortfolioFormValues): PortfolioFormErrors {
  const errors: PortfolioFormErrors = {}

  if (!values.title.trim()) errors.title = 'Title is required.'
  if (!values.slug.trim()) errors.slug = 'Slug is required.'
  else if (!isValidSlug(values.slug)) {
    errors.slug = 'Use lowercase letters, numbers, and hyphens only.'
  }
  if (!values.shortDescription.trim()) errors.shortDescription = 'Short description is required.'
  if (!values.coverImageUrl.trim()) errors.coverImageUrl = 'Cover image URL is required.'
  else if (!isLikelyUrl(values.coverImageUrl)) errors.coverImageUrl = 'Enter a valid http(s) URL.'

  if (values.completionYear) {
    const year = Number(values.completionYear)
    if (!Number.isInteger(year) || year < 1900 || year > 2100) {
      errors.completionYear = 'Enter a valid year.'
    }
  }

  const badGalleryUrl = values.galleryImageUrls.some((url) => url.trim() && !isLikelyUrl(url))
  if (badGalleryUrl) errors.galleryImageUrls = 'Each gallery URL must be a valid http(s) link.'

  return errors
}

type PortfolioFormProps = {
  mode: 'create' | 'edit'
  projectId?: string
  initialValues?: PortfolioFormValues
  onSuccess: (project: PortfolioProject) => void
  onCancel: () => void
}

export function PortfolioForm({ mode, projectId, initialValues, onSuccess, onCancel }: PortfolioFormProps) {
  const { categories } = useCategories()
  const { showToast } = useToast()

  const [values, setValues] = useState<PortfolioFormValues>(initialValues ?? EMPTY_PORTFOLIO_FORM)
  const [errors, setErrors] = useState<PortfolioFormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const slugEditedManually = useRef(mode === 'edit')

  const [slugAvailability, setSlugAvailability] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle')
  const debouncedSlug = useDebouncedValue(values.slug, 400)

  useEffect(() => {
    const slug = debouncedSlug.trim()
    if (!slug || !isValidSlug(slug)) {
      setSlugAvailability('idle')
      return
    }
    if (mode === 'edit' && slug === initialValues?.slug) {
      setSlugAvailability('idle')
      return
    }

    let cancelled = false
    setSlugAvailability('checking')
    isSlugAvailable(slug, projectId)
      .then((available) => {
        if (!cancelled) setSlugAvailability(available ? 'available' : 'taken')
      })
      .catch(() => {
        if (!cancelled) setSlugAvailability('idle')
      })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSlug, mode, projectId])

  function update<K extends keyof PortfolioFormValues>(key: K, value: PortfolioFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  function handleTitleChange(title: string) {
    update('title', title)
    if (!slugEditedManually.current) {
      update('slug', slugify(title))
    }
  }

  function handleSlugChange(slug: string) {
    slugEditedManually.current = true
    update('slug', slug)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const nextErrors = validate(values)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setIsSubmitting(true)
    try {
      const available =
        mode === 'edit' && values.slug === initialValues?.slug
          ? true
          : await isSlugAvailable(values.slug, projectId)

      if (!available) {
        setErrors((prev) => ({ ...prev, slug: 'This slug is already in use.' }))
        setSlugAvailability('taken')
        return
      }

      const project =
        mode === 'create' ? await createProject(values) : await updateProject(projectId!, values)

      showToast('success', mode === 'create' ? 'Project created.' : 'Project updated.')
      onSuccess(project)
    } catch (err) {
      showToast('error', getErrorMessage(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-12">
      {/* Basic Information */}
      <section>
        <h2 className="mb-6 text-xs font-medium uppercase tracking-widest2 text-ink-700/60">
          Basic Information
        </h2>
        <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
          <div>
            <Input label="Title" value={values.title} onChange={(e) => handleTitleChange(e.target.value)} />
            {errors.title && <p className="mt-2 text-xs text-red-500">{errors.title}</p>}
          </div>

          <div>
            <Input label="Slug" value={values.slug} onChange={(e) => handleSlugChange(e.target.value)} />
            {errors.slug ? (
              <p className="mt-2 text-xs text-red-500">{errors.slug}</p>
            ) : (
              <SlugAvailabilityHint state={slugAvailability} />
            )}
          </div>

          <div className="relative">
            <select
              value={values.categoryId}
              onChange={(e) => update('categoryId', e.target.value)}
              className={selectClasses}
              aria-label="Category"
            >
              <option value="">Select category…</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <label className="pointer-events-none absolute left-0 top-0 text-[11px] font-light uppercase tracking-widest2 text-brass-400">
              Category
            </label>
          </div>

          <div className="relative">
            <select
              value={values.projectStatus}
              onChange={(e) => update('projectStatus', e.target.value as PortfolioFormValues['projectStatus'])}
              className={selectClasses}
              aria-label="Project Status"
            >
              {PROJECT_STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <label className="pointer-events-none absolute left-0 top-0 text-[11px] font-light uppercase tracking-widest2 text-brass-400">
              Project Status
            </label>
          </div>

          <Input label="Location" value={values.location} onChange={(e) => update('location', e.target.value)} />
          <div>
            <Input
              label="Completion Year"
              value={values.completionYear}
              onChange={(e) => update('completionYear', e.target.value.replace(/[^0-9]/g, ''))}
              inputMode="numeric"
            />
            {errors.completionYear && <p className="mt-2 text-xs text-red-500">{errors.completionYear}</p>}
          </div>

          <Input label="Client" value={values.clientName} onChange={(e) => update('clientName', e.target.value)} />
          <Input label="Area" value={values.area} onChange={(e) => update('area', e.target.value)} />
        </div>

        <div className="mt-6">
          <TagInput
            label="Services Provided"
            values={values.servicesProvided}
            onChange={(v) => update('servicesProvided', v)}
            placeholder="e.g. Space Planning"
          />
        </div>
      </section>

      {/* Description */}
      <section>
        <h2 className="mb-6 text-xs font-medium uppercase tracking-widest2 text-ink-700/60">Description</h2>
        <div className="space-y-6">
          <div>
            <Input
              as="textarea"
              rows={2}
              label="Short Description"
              value={values.shortDescription}
              onChange={(e) => update('shortDescription', e.target.value)}
            />
            {errors.shortDescription && <p className="mt-2 text-xs text-red-500">{errors.shortDescription}</p>}
          </div>
          <Input
            as="textarea"
            rows={5}
            label="Detailed Description"
            value={values.detailedDescription}
            onChange={(e) => update('detailedDescription', e.target.value)}
          />
        </div>
      </section>

      {/* SEO */}
      <section>
        <h2 className="mb-6 text-xs font-medium uppercase tracking-widest2 text-ink-700/60">SEO</h2>
        <div className="space-y-6">
          <Input label="SEO Title" value={values.seoTitle} onChange={(e) => update('seoTitle', e.target.value)} />
          <Input
            as="textarea"
            rows={2}
            label="SEO Description"
            value={values.seoDescription}
            onChange={(e) => update('seoDescription', e.target.value)}
          />
          <TagInput
            label="SEO Keywords"
            values={values.seoKeywords}
            onChange={(v) => update('seoKeywords', v)}
            placeholder="e.g. luxury interior design"
          />
        </div>
      </section>

      {/* Media */}
      <section>
        <h2 className="mb-6 text-xs font-medium uppercase tracking-widest2 text-ink-700/60">Media</h2>
        <div className="space-y-8">
          <CoverImagePicker
            value={values.coverImageUrl}
            onChange={(url) => update('coverImageUrl', url)}
            error={errors.coverImageUrl}
          />

          <GalleryManager
            values={values.galleryImageUrls}
            onChange={(v) => update('galleryImageUrls', v)}
          />
        </div>
      </section>

      {/* Publishing */}
      <section>
        <h2 className="mb-6 text-xs font-medium uppercase tracking-widest2 text-ink-700/60">Publishing</h2>
        <div className="flex flex-wrap items-center gap-8">
          <div className="relative w-full max-w-xs">
            <select
              value={values.status}
              onChange={(e) => update('status', e.target.value as PublishStatus)}
              className={selectClasses}
              aria-label="Publish Status"
            >
              {STATUS_SELECT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <label className="pointer-events-none absolute left-0 top-0 text-[11px] font-light uppercase tracking-widest2 text-brass-400">
              Status
            </label>
          </div>

          <label className="flex items-center gap-2.5 text-sm font-light text-ink-700">
            <input
              type="checkbox"
              checked={values.isFeatured}
              onChange={(e) => update('isFeatured', e.target.checked)}
              className="h-4 w-4 accent-brass-400"
            />
            Featured project
          </label>
        </div>
      </section>

      <div className="flex items-center gap-4 border-t border-ink-900/10 pt-8">
        <Button type="submit" variant="primary" withArrow disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : mode === 'create' ? 'Create Project' : 'Save Changes'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
      </div>
    </form>
  )
}

function SlugAvailabilityHint({ state }: { state: 'idle' | 'checking' | 'available' | 'taken' }) {
  if (state === 'checking') {
    return (
      <p className="mt-2 flex items-center gap-1.5 text-xs text-ink-700/50">
        <Loader2 className="h-3 w-3 animate-spin" strokeWidth={2} />
        Checking availability…
      </p>
    )
  }
  if (state === 'available') {
    return (
      <p className="mt-2 flex items-center gap-1.5 text-xs text-emerald-600">
        <Check className="h-3 w-3" strokeWidth={2} />
        Available
      </p>
    )
  }
  if (state === 'taken') {
    return <p className="mt-2 text-xs text-red-500">This slug is already in use.</p>
  }
  return null
}
