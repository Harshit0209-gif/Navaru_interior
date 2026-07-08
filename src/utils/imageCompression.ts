// Client-side downscale/recompress for image attachments before upload.
// Skips non-images (e.g. PDFs) and files that are already small.
export async function compressImage(file: File, maxDimension = 1920, quality = 0.82): Promise<File> {
  if (!file.type.startsWith('image/')) return file
  if (file.size < 400 * 1024) return file

  try {
    const bitmap = await createImageBitmap(file)
    const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height))

    const canvas = document.createElement('canvas')
    canvas.width = Math.round(bitmap.width * scale)
    canvas.height = Math.round(bitmap.height * scale)

    const ctx = canvas.getContext('2d')
    if (!ctx) return file

    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)

    const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality))
    if (!blob || blob.size >= file.size) return file

    const compressedName = file.name.replace(/\.\w+$/, '.jpg')
    return new File([blob], compressedName, { type: 'image/jpeg' })
  } catch {
    // If compression fails for any reason, fall back to the original file
    // rather than blocking the upload.
    return file
  }
}
