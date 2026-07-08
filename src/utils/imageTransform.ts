interface ResizeOptions {
  width?: number
  height?: number
  quality?: number
}

const OBJECT_PATH = '/storage/v1/object/public/'
const RENDER_PATH = '/storage/v1/render/image/public/'

// Supabase Storage's on-the-fly image transform endpoint (confirmed
// available on this project — a 100x100 request returns a real resized
// file, not the original). Rewrites a public object URL into the
// render/image variant with resize params, so a phone loading a small
// thumbnail doesn't download the same full-resolution file a desktop hero
// image would. URLs from other sources (e.g. Unsplash placeholders, which
// already request an appropriately-sized image via their own CDN params in
// src/utils/unsplash.ts) are returned unchanged.
export function getResizedImageUrl(url: string, { width, height, quality = 75 }: ResizeOptions): string {
  if (!url || !url.includes(OBJECT_PATH)) return url

  const [base, existingQuery] = url.split('?')
  const renderBase = base.replace(OBJECT_PATH, RENDER_PATH)
  const params = new URLSearchParams(existingQuery)
  if (width) params.set('width', String(width))
  if (height) params.set('height', String(height))
  params.set('quality', String(quality))
  params.set('resize', 'cover')

  return `${renderBase}?${params.toString()}`
}
