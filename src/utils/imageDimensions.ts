// Reads intrinsic pixel dimensions from an image file in the browser before
// upload. Returns null for non-raster/non-vector files (e.g. PDF), where
// "dimensions" don't apply.
export async function readImageDimensions(file: File): Promise<{ width: number; height: number } | null> {
  if (!file.type.startsWith('image/')) return null

  const objectUrl = URL.createObjectURL(file)
  try {
    return await new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight })
      img.onerror = () => reject(new Error('Could not read image dimensions.'))
      img.src = objectUrl
    })
  } catch {
    return null
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}
