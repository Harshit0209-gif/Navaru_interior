import type { ProjectStatus, PublishStatus } from '../../types/database'
import type { PortfolioImage, PortfolioProject } from '../../types/portfolio'

export type { PublishStatus, ProjectStatus }

export const PROJECT_STATUS_OPTIONS: ProjectStatus[] = ['Completed', 'Ongoing', 'Upcoming']

export type FeaturedFilter = 'all' | 'featured' | 'unfeatured'
export type PublishFilter = 'all' | PublishStatus
export type AdminSortOption = 'newest' | 'oldest' | 'title_asc' | 'title_desc'

export interface AdminPortfolioFilters {
  search?: string
  categoryId?: string
  featured?: FeaturedFilter
  status?: PublishFilter
  sort?: AdminSortOption
  page?: number
  pageSize?: number
}

export interface AdminPortfolioListResult {
  projects: PortfolioProject[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

/** Shape the PortfolioForm component edits; mapped to/from DB rows in the service layer. */
export interface PortfolioFormValues {
  title: string
  slug: string
  categoryId: string
  location: string
  completionYear: string
  projectStatus: ProjectStatus
  clientName: string
  area: string
  servicesProvided: string[]
  shortDescription: string
  detailedDescription: string
  seoTitle: string
  seoDescription: string
  seoKeywords: string[]
  isFeatured: boolean
  status: PublishStatus
  coverImageUrl: string
  galleryImageUrls: string[]
}

export const EMPTY_PORTFOLIO_FORM: PortfolioFormValues = {
  title: '',
  slug: '',
  categoryId: '',
  location: '',
  completionYear: '',
  projectStatus: 'Completed',
  clientName: '',
  area: '',
  servicesProvided: [],
  shortDescription: '',
  detailedDescription: '',
  seoTitle: '',
  seoDescription: '',
  seoKeywords: [],
  isFeatured: false,
  status: 'published',
  coverImageUrl: '',
  galleryImageUrls: [],
}

export type PortfolioFormErrors = Partial<Record<keyof PortfolioFormValues, string>>

export function projectToFormValues(project: PortfolioProject, images: PortfolioImage[]): PortfolioFormValues {
  return {
    title: project.title,
    slug: project.slug,
    categoryId: project.category_id ?? '',
    location: project.location ?? '',
    completionYear: project.completion_year ? String(project.completion_year) : '',
    projectStatus: project.project_status,
    clientName: project.client_name ?? '',
    area: project.area ?? '',
    // Defensive fallbacks: if the 0002 migration hasn't been run yet, these
    // columns won't exist on the fetched row — default rather than crash.
    servicesProvided: project.services_provided ?? [],
    shortDescription: project.short_description,
    detailedDescription: project.detailed_description ?? '',
    seoTitle: project.seo_title ?? '',
    seoDescription: project.seo_description ?? '',
    seoKeywords: project.seo_keywords ?? [],
    isFeatured: project.is_featured,
    status: project.status ?? 'draft',
    coverImageUrl: project.cover_image_url,
    galleryImageUrls: images.map((img) => img.image_url),
  }
}
