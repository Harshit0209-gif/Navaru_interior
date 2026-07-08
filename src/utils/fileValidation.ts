export const ALLOWED_ATTACHMENT_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']

// Matches the `attachments` storage bucket's file_size_limit in supabase/schema.sql
export const MAX_ATTACHMENT_SIZE_BYTES = 10 * 1024 * 1024

export function validateAttachment(file: File): string | null {
  if (!ALLOWED_ATTACHMENT_TYPES.includes(file.type)) {
    return 'Please upload a JPG, PNG, WEBP, or PDF file.'
  }
  if (file.size > MAX_ATTACHMENT_SIZE_BYTES) {
    return 'File is too large. Maximum size is 10MB.'
  }
  return null
}

// Media Library — matches the portfolio-images / website-assets storage
// buckets' allowed_mime_types in supabase/schema.sql. Broader than
// attachments: admins can also manage vector (SVG) and print-ready (PDF)
// assets here.
export const ALLOWED_MEDIA_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/svg+xml',
  'application/pdf',
]

// Matches the buckets' file_size_limit — this is the pre-compression cap;
// raster images are downscaled/recompressed further before upload.
export const MAX_MEDIA_SIZE_BYTES = 15 * 1024 * 1024

export function validateMediaFile(file: File): string | null {
  if (!ALLOWED_MEDIA_TYPES.includes(file.type)) {
    return 'Please upload a PNG, JPG, WEBP, SVG, or PDF file.'
  }
  if (file.size > MAX_MEDIA_SIZE_BYTES) {
    return 'File is too large. Maximum size is 15MB.'
  }
  return null
}
