import type { Database, ProjectStatus, PublishStatus } from './database'

export type Category = Database['public']['Tables']['categories']['Row']

export type PortfolioImage = Database['public']['Tables']['portfolio_images']['Row']

export type PortfolioProjectRow = Database['public']['Tables']['portfolio_projects']['Row']

export interface PortfolioProject extends PortfolioProjectRow {
  category: Category | null
}

export interface PortfolioProjectWithGallery extends PortfolioProject {
  images: PortfolioImage[]
}

export type SortOption = 'newest' | 'oldest' | 'title_asc' | 'title_desc'

export interface PortfolioFilters {
  search?: string
  categorySlug?: string
  sort?: SortOption
  page?: number
  pageSize?: number
}

export interface PortfolioListResult {
  projects: PortfolioProject[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

export type { ProjectStatus, PublishStatus }
