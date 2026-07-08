import { getSupabase } from '../lib/supabase'
import type {
  PortfolioFilters,
  PortfolioListResult,
  PortfolioProject,
  PortfolioProjectWithGallery,
} from '../types/portfolio'

const DEFAULT_PAGE_SIZE = 9

export async function fetchPortfolioProjects(
  filters: PortfolioFilters = {},
): Promise<PortfolioListResult> {
  const supabase = await getSupabase()
  const page = Math.max(1, filters.page ?? 1)
  const pageSize = filters.pageSize ?? DEFAULT_PAGE_SIZE

  // `!inner` is required so filtering on the joined category actually
  // restricts the parent rows (a plain embed ignores filters on it).
  const categoryJoin = filters.categorySlug ? 'category:categories!inner(*)' : 'category:categories(*)'

  let query = supabase
    .from('portfolio_projects')
    .select(`*, ${categoryJoin}`, { count: 'exact' })
    .eq('status', 'published')

  if (filters.categorySlug) {
    query = query.eq('category.slug', filters.categorySlug)
  }

  if (filters.search?.trim()) {
    const term = `%${filters.search.trim()}%`
    query = query.or(`title.ilike.${term},short_description.ilike.${term},location.ilike.${term}`)
  }

  switch (filters.sort) {
    case 'oldest':
      query = query.order('completion_year', { ascending: true, nullsFirst: true })
      break
    case 'title_asc':
      query = query.order('title', { ascending: true })
      break
    case 'title_desc':
      query = query.order('title', { ascending: false })
      break
    case 'newest':
    default:
      query = query.order('display_order', { ascending: true }).order('created_at', { ascending: false })
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

export async function fetchFeaturedProjects(limit = 6): Promise<PortfolioProject[]> {
  const supabase = await getSupabase()
  const { data, error } = await supabase
    .from('portfolio_projects')
    .select('*, category:categories(*)')
    .eq('status', 'published')
    .eq('is_featured', true)
    .order('display_order', { ascending: true })
    .limit(limit)

  if (error) throw error
  return (data ?? []) as unknown as PortfolioProject[]
}

export async function fetchProjectBySlug(slug: string): Promise<PortfolioProjectWithGallery | null> {
  const supabase = await getSupabase()
  const { data: project, error } = await supabase
    .from('portfolio_projects')
    .select('*, category:categories(*)')
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle()

  if (error) throw error
  if (!project) return null

  const { data: images, error: imagesError } = await supabase
    .from('portfolio_images')
    .select('*')
    .eq('project_id', project.id)
    .order('display_order', { ascending: true })

  if (imagesError) throw imagesError

  return { ...(project as unknown as PortfolioProject), images: images ?? [] }
}

export async function fetchRelatedProjects(
  currentProjectId: string,
  categoryId: string | null,
  limit = 3,
): Promise<PortfolioProject[]> {
  const supabase = await getSupabase()
  let query = supabase
    .from('portfolio_projects')
    .select('*, category:categories(*)')
    .eq('status', 'published')
    .neq('id', currentProjectId)
    .limit(limit)

  query = categoryId ? query.eq('category_id', categoryId) : query.order('is_featured', { ascending: false })

  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as unknown as PortfolioProject[]
}
