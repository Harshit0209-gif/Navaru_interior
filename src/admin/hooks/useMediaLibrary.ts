import { useCallback, useEffect, useState } from 'react'
import { fetchMediaAssets } from '../services/mediaService'
import type { MediaAsset, MediaFilters } from '../types/media'

export function useMediaLibrary(filters: MediaFilters) {
  const [assets, setAssets] = useState<MediaAsset[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadToken, setReloadToken] = useState(0)

  const { search, folder, bucket, usage, sort, page, pageSize } = filters

  const reload = useCallback(() => setReloadToken((t) => t + 1), [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    fetchMediaAssets({ search, folder, bucket, usage, sort, page, pageSize })
      .then((result) => {
        if (cancelled) return
        setAssets(result.assets)
        setTotal(result.total)
      })
      .catch(() => {
        if (!cancelled) setError('Could not load the media library right now. Please try again.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, folder, bucket, usage, sort, page, pageSize, reloadToken])

  return { assets, total, loading, error, reload }
}
