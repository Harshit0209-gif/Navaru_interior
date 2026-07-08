import { FileText } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { RecentUpload } from '../types/analytics'
import { formatFileSize } from '../../utils/imageDimensions'
import { getResizedImageUrl } from '../../utils/imageTransform'
import { timeAgo } from '../../utils/timeAgo'

export function RecentUploadsPanel({ uploads }: { uploads: RecentUpload[] | null }) {
  return (
    <div className="border border-ink-900/10 bg-cream-50 p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-normal text-ink-900">Recent Uploads</h3>
        <Link
          to="/admin/media"
          className="text-xs font-medium uppercase tracking-widest2 text-brass-400 transition-colors hover:text-brass-500"
        >
          View All
        </Link>
      </div>

      {uploads === null ? (
        <p className="mt-4 text-xs font-light text-ink-700/70">Loading…</p>
      ) : uploads.length === 0 ? (
        <p className="mt-4 text-xs font-light text-ink-700/70">No uploads yet.</p>
      ) : (
        <ul className="mt-2 divide-y divide-ink-900/5">
          {uploads.map((upload) => (
            <li key={upload.id} className="flex items-center gap-3 py-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden bg-ink-900/5">
                {upload.fileName.toLowerCase().endsWith('.pdf') ? (
                  <FileText className="h-4 w-4 text-ink-700/40" strokeWidth={1.25} />
                ) : (
                  <img
                    src={getResizedImageUrl(upload.publicUrl, { width: 80, height: 80, quality: 70 })}
                    alt={upload.fileName}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-light text-ink-800">{upload.fileName}</p>
                <p className="text-xs font-light text-ink-700/50">{formatFileSize(upload.sizeBytes)}</p>
              </div>
              <span className="shrink-0 text-xs font-light text-ink-700/70">{timeAgo(upload.createdAt)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
