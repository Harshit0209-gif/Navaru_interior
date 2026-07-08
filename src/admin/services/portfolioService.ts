import type { PostgrestError } from '@supabase/supabase-js'
import { getSupabase } from '../../lib/supabase'
import { sanitizeFormValues } from '../../utils/sanitize'
import { logActivity } from './activityLogService'
import type { PortfolioImage, PortfolioProject } from '../../types/portfolio'
import type { PublishStatus } from '../../types/database'
import type { AdminPortfolioFilters, AdminPortfolioListResult, PortfolioFormValues } from '../types/portfolio'

const DEFAULT_PAGE_SIZE = 10

function mapDbError(error: PostgrestError): Error {
  if (error.code === '23505') {
    return new Error('This slug is already in use. Please choose another.')
  }
  return new Error(error.message)
}

function toDbPayload(values: PortfolioFormValues) {
  const clean = sanitizeFormValues(values)
  return {
    title: clean.title,
    slug: clean.slug,
    category_id: clean.categoryId || null,
    location: clean.location || null,
    completion_year: clean.completionYear ? Number(clean.completionYear) : null,
    project_status: clean.projectStatus,
    client_name: clean.clientName || null,
    area: clean.area || null,
    services_provided: clean.servicesProvided,
    short_description: clean.shortDescription,
    detailed_description: clean.detailedDescription || null,
    seo_title: clean.seoTitle || null,
    seo_description: clean.seoDescription || null,
    seo_keywords: clean.seoKeywords,
    is_featured: clean.isFeatured,
    status: clean.status,
    cover_image_url: clean.coverImageUrl,
  }
}

async function syncGalleryImages(projectId: string, urls: string[]): Promise<void> {
  const supabase = await getSupabase()

  const { error: deleteError } = await supabase.from('portfolio_images').delete().eq('project_id', projectId)
  if (deleteError) throw deleteError

  const cleanUrls = urls.map((url) => url.trim()).filter(Boolean)
  if (cleanUrls.length === 0) return

  const { error: insertError } = await supabase.from('portfolio_images').insert(
    cleanUrls.map((image_url, i) => ({ project_id: projectId, image_url, display_order: i })),
  )
  if (insertError) throw insertError
}

export async function isSlugAvailable(slug: string, excludeId?: string): Promise<boolean> {
  const supabase = await getSupabase()
  let query = supabase.from('portfolio_projects').select('id').eq('slug', slug).limit(1)
  if (excludeId) query = query.neq('id', excludeId)

  const { data, error } = await query
  if (error) throw error
  return (data ?? []).length === 0
}

async function findAvailableSlug(baseSlug: string): Promise<string> {
  let candidate = baseSlug
  let attempt = 1
  while (!(await isSlugAvailable(candidate))) {
    attempt += 1
    candidate = `${baseSlug}-${attempt}`
    if (attempt > 50) throw new Error('Could not generate a unique slug for the duplicate.')
  }
  return candidate
}

export async function fetchAdminProjects(
  filters: AdminPortfolioFilters = {},
): Promise<AdminPortfolioListResult> {
  const supabase = await getSupabase()
  const page = Math.max(1, filters.page ?? 1)
  const pageSize = filters.pageSize ?? DEFAULT_PAGE_SIZE

  let query = supabase.from('portfolio_projects').select('*, category:categories(*)', { count: 'exact' })

  if (filters.status && filters.status !== 'all') {
    query = query.eq('status', filters.status)
  }
  if (filters.categoryId) {
    query = query.eq('category_id', filters.categoryId)
  }
  if (filters.featured === 'featured') query = query.eq('is_featured', true)
  if (filters.featured === 'unfeatured') query = query.eq('is_featured', false)

  if (filters.search?.trim()) {
    const term = `%${filters.search.trim()}%`
    query = query.or(`title.ilike.${term},short_description.ilike.${term},location.ilike.${term},slug.ilike.${term}`)
  }

  switch (filters.sort) {
    case 'oldest':
      query = query.order('created_at', { ascending: true })
      break
    case 'title_asc':
      query = query.order('title', { ascending: true })
      break
    case 'title_desc':
      query = query.order('title', { ascending: false })
      break
    case 'newest':
    default:
      query = query.order('created_at', { ascending: false })
  }

  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  query = query.range(from, to)

  const { data, error, count } = await query
  if (error) throw error

  const total = count ?? 0
  const projects = (data ?? []) as unknown as PortfolioProject[]

  return {
    projects,
    total,
    page,
    pageSize,
    hasMore: from + projects.length < total,
  }
}

export async function fetchAdminProjectById(
  id: string,
): Promise<{ project: PortfolioProject; images: PortfolioImage[] } | null> {
  const supabase = await getSupabase()
  const { data: project, error } = await supabase
    .from('portfolio_projects')
    .select('*, category:categories(*)')
    .eq('id', id)
    .maybeSingle()

  if (error) throw error
  if (!project) return null

  const { data: images, error: imagesError } = await supabase
    .from('portfolio_images')
    .select('*')
    .eq('project_id', id)
    .order('display_order', { ascending: true })

  if (imagesError) throw imagesError

  return { project: project as unknown as PortfolioProject, images: images ?? [] }
}

export async function createProject(values: PortfolioFormValues): Promise<PortfolioProject> {
  const supabase = await getSupabase()
  const payload = toDbPayload(values)

  const { data, error } = await supabase
    .from('portfolio_projects')
    .insert(payload)
    .select('*, category:categories(*)')
    .single()

  if (error) throw mapDbError(error)

  await syncGalleryImages(data.id, values.galleryImageUrls)

  await logActivity({
    action: 'project.created',
    description: `Created project "${data.title}"`,
    recordType: 'portfolio_project',
    recordId: data.id,
    metadata: { slug: data.slug, status: data.status },
  })

  return data as unknown as PortfolioProject
}

export async function updateProject(id: string, values: PortfolioFormValues): Promise<PortfolioProject> {
  const supabase = await getSupabase()
  const payload = toDbPayload(values)

  const { data, error } = await supabase
    .from('portfolio_projects')
    .update(payload)
    .eq('id', id)
    .select('*, category:categories(*)')
    .single()

  if (error) throw mapDbError(error)

  await syncGalleryImages(id, values.galleryImageUrls)

  await logActivity({
    action: 'project.updated',
    description: `Updated project "${data.title}"`,
    recordType: 'portfolio_project',
    recordId: data.id,
    metadata: { slug: data.slug, status: data.status },
  })

  return data as unknown as PortfolioProject
}

export async function deleteProject(id: string): Promise<void> {
  const supabase = await getSupabase()
  const { data, error } = await supabase.from('portfolio_projects').delete().eq('id', id).select('title').single()
  if (error) throw error

  await logActivity({
    action: 'project.deleted',
    description: `Deleted project "${data.title}"`,
    recordType: 'portfolio_project',
    recordId: id,
  })
}

export async function duplicateProject(id: string): Promise<PortfolioProject> {
  const existing = await fetchAdminProjectById(id)
  if (!existing) throw new Error('Project not found.')

  const supabase = await getSupabase()
  const slug = await findAvailableSlug(`${existing.project.slug}-copy`)

  const { data, error } = await supabase
    .from('portfolio_projects')
    .insert({
      title: `${existing.project.title} (Copy)`,
      slug,
      category_id: existing.project.category_id,
      location: existing.project.location,
      completion_year: existing.project.completion_year,
      project_status: existing.project.project_status,
      client_name: existing.project.client_name,
      area: existing.project.area,
      services_provided: existing.project.services_provided,
      short_description: existing.project.short_description,
      detailed_description: existing.project.detailed_description,
      seo_title: existing.project.seo_title,
      seo_description: existing.project.seo_description,
      seo_keywords: existing.project.seo_keywords,
      is_featured: false,
      status: 'draft',
      cover_image_url: existing.project.cover_image_url,
    })
    .select('*, category:categories(*)')
    .single()

  if (error) throw mapDbError(error)

  if (existing.images.length > 0) {
    const { error: imagesError } = await supabase.from('portfolio_images').insert(
      existing.images.map((img, i) => ({
        project_id: data.id,
        image_url: img.image_url,
        alt_text: img.alt_text,
        display_order: i,
      })),
    )
    if (imagesError) throw imagesError
  }

  await logActivity({
    action: 'project.duplicated',
    description: `Duplicated project "${existing.project.title}" as "${data.title}"`,
    recordType: 'portfolio_project',
    recordId: data.id,
    metadata: { sourceId: id, slug: data.slug },
  })

  return data as unknown as PortfolioProject
}

export async function updateProjectStatus(id: string, status: PublishStatus): Promise<void> {
  const supabase = await getSupabase()
  const { data, error } = await supabase
    .from('portfolio_projects')
    .update({ status })
    .eq('id', id)
    .select('title')
    .single()
  if (error) throw error

  await logActivity({
    action: 'project.status_changed',
    description: `Changed status of "${data.title}" to "${status}"`,
    recordType: 'portfolio_project',
    recordId: id,
    metadata: { status },
  })
}

export async function updateProjectFeatured(id: string, isFeatured: boolean): Promise<void> {
  const supabase = await getSupabase()
  const { data, error } = await supabase
    .from('portfolio_projects')
    .update({ is_featured: isFeatured })
    .eq('id', id)
    .select('title')
    .single()
  if (error) throw error

  await logActivity({
    action: 'project.featured_toggled',
    description: `${isFeatured ? 'Marked' : 'Unmarked'} "${data.title}" as featured`,
    recordType: 'portfolio_project',
    recordId: id,
    metadata: { isFeatured },
  })
}
