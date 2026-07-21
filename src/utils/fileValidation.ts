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
// attachments: admins can also manage vector (SVG), print-ready (PDF), and
// video (MP4/WEBM, for the Hero background) assets here.
export const ALLOWED_MEDIA_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/svg+xml',
  'application/pdf',
  'video/mp4',
  'video/webm',
]

export const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm']

// Matches the buckets' file_size_limit — this is the pre-compression cap for
// images; video is uploaded as-is (no client-side re-encoding), so this cap
// is sized for a short, already-compressed background video clip.
export const MAX_MEDIA_SIZE_BYTES = 50 * 1024 * 1024

export function validateMediaFile(file: File): string | null {
  if (!ALLOWED_MEDIA_TYPES.includes(file.type)) {
    return 'Please upload a PNG, JPG, WEBP, SVG, PDF, MP4, or WEBM file.'
  }
  if (file.size > MAX_MEDIA_SIZE_BYTES) {
    return 'File is too large. Maximum size is 50MB.'
  }
  return null
}
