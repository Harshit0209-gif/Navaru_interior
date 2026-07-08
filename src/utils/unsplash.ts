export function unsplashUrl(photoId: string, width: number, height: number, quality = 80) {
  return `https://images.unsplash.com/photo-${photoId}?auto=format&fit=crop&w=${width}&h=${height}&q=${quality}`
}

export function unsplashSrcSet(photoId: string, width: number, height: number, quality = 80) {
  const ratio = height / width
  const widths = [Math.round(width * 0.5), width, Math.round(width * 1.5), Math.round(width * 2)]
  return widths
    .map((w) => `${unsplashUrl(photoId, w, Math.round(w * ratio), quality)} ${w}w`)
    .join(', ')
}
