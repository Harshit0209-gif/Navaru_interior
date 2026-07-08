import { getSupabase } from '../../lib/supabase'
import { validateMediaFile } from '../../utils/fileValidation'
import { compressImage } from '../../utils/imageCompression'
import { readImageDimensions } from '../../utils/imageDimensions'
import { logActivity } from './activityLogService'
import type { MediaAsset, MediaBucket, MediaFilters, MediaListResult, MediaUsageProject } from '../types/media'

const DEFAULT_PAGE_SIZE = 24

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9.\-_]/g, '_').toLowerCase()
}

async function fetchUsedUrls(): Promise<Set<string>> {
  const supabase = await getSupabase()
  const [coversRes, galleryRes] = await Promise.all([
    supabase.from('portfolio_projects').select('cover_image_url'),
    supabase.from('portfolio_images').select('image_url'),
  ])
  // Must throw rather than silently treat a failed query as "nothing is
  // used" — that would make the "unused" filter report every asset
  // (including ones actively referenced by published projects) as safe to
  // bulk-delete.
  if (coversRes.error) throw coversRes.error
  if (galleryRes.error) throw galleryRes.error

  const urls = new Set<string>()
  coversRes.data?.forEach((row) => urls.add(row.cover_image_url))
  galleryRes.data?.forEach((row) => urls.add(row.image_url))
  return urls
}

export async function fetchFolders(): Promise<string[]> {
  const supabase = await getSupabase()
  const { data, error } = await supabase.from('media_assets').select('folder')
  if (error) throw error

  const unique = Array.from(new Set((data ?? []).map((row) => row.folder)))
  return unique.sort((a, b) => a.localeCompare(b))
}

export async function fetchMediaAssets(filters: MediaFilters = {}): Promise<MediaListResult> {
  const supabase = await getSupabase()
  const page = Math.max(1, filters.page ?? 1)
  const pageSize = filters.pageSize ?? DEFAULT_PAGE_SIZE

  let query = supabase.from('media_assets').select('*', { count: 'exact' })

  if (filters.bucket && filters.bucket !== 'all') {
    query = query.eq('bucket_id', filters.bucket)
  }
  if (filters.folder) {
    query = query.eq('folder', filters.folder)
  }
  if (filters.search?.trim()) {
    query = query.ilike('file_name', `%${filters.search.trim()}%`)
  }
  if (filters.usage === 'unused') {
    const usedUrls = await fetchUsedUrls()
    if (usedUrls.size > 0) {
      const list = Array.from(usedUrls)
        .map((url) => `"${url.replace(/"/g, '\\"')}"`)
        .join(',')
      query = query.not('public_url', 'in', `(${list})`)
    }
  }

  switch (filters.sort) {
    case 'oldest':
      query = query.order('created_at', { ascending: true })
      break
    case 'name_asc':
      query = query.order('file_name', { ascending: true })
      break
    case 'name_desc':
      query = query.order('file_name', { ascending: false })
      break
    case 'largest':
      query = query.order('size_bytes', { ascending: false })
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
  const assets = data ?? []

  return {
    assets,
    total,
    page,
    pageSize,
    hasMore: from + assets.length < total,
  }
}

export async function uploadMediaAsset(
  file: File,
  options: { bucket: MediaBucket; folder: string },
  onProgress?: (percent: number) => void,
): Promise<MediaAsset> {
  const validationError = validateMediaFile(file)
  if (validationError) throw new Error(validationError)

  onProgress?.(5)
  const preparedFile = await compressImage(file)
  onProgress?.(25)

  const dimensions = await readImageDimensions(preparedFile)
  onProgress?.(35)

  const folder = options.folder.trim() || 'general'
  const path = `${folder}/${crypto.randomUUID()}-${sanitizeFileName(preparedFile.name)}`

  const supabase = await getSupabase()
  const { error: uploadError } = await supabase.storage
    .from(options.bucket)
    .upload(path, preparedFile, { cacheControl: '3600', upsert: false, contentType: preparedFile.type })

  if (uploadError) throw uploadError
  onProgress?.(80)

  const { data: publicUrlData } = supabase.storage.from(options.bucket).getPublicUrl(path)

  const { data, error } = await supabase
    .from('media_assets')
    .insert({
      bucket_id: options.bucket,
      folder,
      file_name: file.name,
      file_path: path,
      public_url: publicUrlData.publicUrl,
      mime_type: preparedFile.type,
      size_bytes: preparedFile.size,
      width: dimensions?.width ?? null,
      height: dimensions?.height ?? null,
    })
    .select('*')
    .single()

  if (error) throw error
  onProgress?.(100)

  await logActivity({
    action: 'image.uploaded',
    description: `Uploaded image "${data.file_name}"`,
    recordType: 'media_asset',
    recordId: data.id,
    metadata: { bucket: data.bucket_id, folder: data.folder, sizeBytes: data.size_bytes },
  })

  return data
}

export async function replaceMediaAsset(
  asset: MediaAsset,
  newFile: File,
  onProgress?: (percent: number) => void,
): Promise<MediaAsset> {
  const validationError = validateMediaFile(newFile)
  if (validationError) throw new Error(validationError)

  onProgress?.(5)
  const preparedFile = await compressImage(newFile)
  onProgress?.(25)

  const dimensions = await readImageDimensions(preparedFile)
  onProgress?.(35)

  const supabase = await getSupabase()
  // upsert at the SAME path keeps the same public_url, so every project
  // referencing this image picks up the new file automatically.
  const { error: uploadError } = await supabase.storage
    .from(asset.bucket_id)
    .upload(asset.file_path, preparedFile, { cacheControl: '3600', upsert: true, contentType: preparedFile.type })

  if (uploadError) throw uploadError
  onProgress?.(80)

  const { data, error } = await supabase
    .from('media_assets')
    .update({
      file_name: newFile.name,
      mime_type: preparedFile.type,
      size_bytes: preparedFile.size,
      width: dimensions?.width ?? null,
      height: dimensions?.height ?? null,
    })
    .eq('id', asset.id)
    .select('*')
    .single()

  if (error) throw error
  onProgress?.(100)

  await logActivity({
    action: 'image.replaced',
    description: `Replaced image "${data.file_name}"`,
    recordType: 'media_asset',
    recordId: data.id,
    metadata: { bucket: data.bucket_id },
  })

  return data
}

export async function renameMediaAsset(id: string, newFileName: string): Promise<MediaAsset> {
  const supabase = await getSupabase()
  const { data, error } = await supabase
    .from('media_assets')
    .update({ file_name: newFileName })
    .eq('id', id)
    .select('*')
    .single()

  if (error) throw error

  await logActivity({
    action: 'image.renamed',
    description: `Renamed image to "${data.file_name}"`,
    recordType: 'media_asset',
    recordId: id,
  })

  return data
}

export async function deleteMediaAsset(asset: MediaAsset): Promise<void> {
  const supabase = await getSupabase()

  const { error: storageError } = await supabase.storage.from(asset.bucket_id).remove([asset.file_path])
  if (storageError) throw storageError

  const { error } = await supabase.from('media_assets').delete().eq('id', asset.id)
  if (error) throw error

  await logActivity({
    action: 'image.deleted',
    description: `Deleted image "${asset.file_name}"`,
    recordType: 'media_asset',
    recordId: asset.id,
    metadata: { bucket: asset.bucket_id },
  })
}

export async function getMediaUsage(publicUrl: string): Promise<MediaUsageProject[]> {
  const supabase = await getSupabase()

  const [{ data: coverMatches, error: coverError }, { data: galleryMatches, error: galleryError }] =
    await Promise.all([
      supabase.from('portfolio_projects').select('id, title, slug').eq('cover_image_url', publicUrl),
      supabase
        .from('portfolio_images')
        .select('project_id, portfolio_projects(id, title, slug)')
        .eq('image_url', publicUrl),
    ])

  if (coverError) throw coverError
  if (galleryError) throw galleryError

  const results: MediaUsageProject[] = []
  coverMatches?.forEach((project) => {
    results.push({ id: project.id, title: project.title, slug: project.slug, as: 'cover' })
  })
  galleryMatches?.forEach((row) => {
    const project = row.portfolio_projects as unknown as { id: string; title: string; slug: string } | null
    if (project) results.push({ id: project.id, title: project.title, slug: project.slug, as: 'gallery' })
  })

  return results
}
