import { getSupabase, STORAGE_BUCKETS } from '../lib/supabase'
import { validateAttachment } from '../utils/fileValidation'
import { compressImage } from '../utils/imageCompression'

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9.\-_]/g, '_').toLowerCase()
}

export type AttachmentFolder = 'bookings' | 'contact'

/**
 * Uploads a single attachment to the private `attachments` bucket and
 * returns its storage path (not a public URL — the bucket has no public
 * read policy, so retrieval later requires a signed URL from the
 * service_role key, e.g. from a future admin portal).
 */
export async function uploadAttachment(
  file: File,
  folder: AttachmentFolder,
  onProgress?: (percent: number) => void,
): Promise<string> {
  const validationError = validateAttachment(file)
  if (validationError) throw new Error(validationError)

  onProgress?.(10)
  const preparedFile = await compressImage(file)
  onProgress?.(40)

  const path = `${folder}/${crypto.randomUUID()}-${sanitizeFileName(preparedFile.name)}`

  const supabase = await getSupabase()
  const { error } = await supabase.storage
    .from(STORAGE_BUCKETS.attachments)
    .upload(path, preparedFile, { cacheControl: '3600', upsert: false })

  if (error) throw error
  onProgress?.(100)

  return path
}
