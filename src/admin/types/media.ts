import type { Database, MediaBucket } from '../../types/database'

export type { MediaBucket }

export type MediaAsset = Database['public']['Tables']['media_assets']['Row']

export type MediaSortOption = 'newest' | 'oldest' | 'name_asc' | 'name_desc' | 'largest'
export type MediaBucketFilter = 'all' | MediaBucket
export type MediaUsageFilter = 'all' | 'unused'

export interface MediaFilters {
  search?: string
  folder?: string
  bucket?: MediaBucketFilter
  usage?: MediaUsageFilter
  sort?: MediaSortOption
  page?: number
  pageSize?: number
}

export interface MediaListResult {
  assets: MediaAsset[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

export interface MediaUsageProject {
  id: string
  title: string
  slug: string
  as: 'cover' | 'gallery'
}

export interface UploadTask {
  id: string
  file: File
  progress: number
  status: 'pending' | 'compressing' | 'uploading' | 'done' | 'error'
  error?: string
  asset?: MediaAsset
}
