import { useState } from 'react'
import { uploadMediaAsset } from '../services/mediaService'
import { getErrorMessage } from '../../utils/errors'
import type { MediaAsset, MediaBucket, UploadTask } from '../types/media'

type UseMediaUploadOptions = {
  onUploaded?: (asset: MediaAsset) => void
}

export function useMediaUpload({ onUploaded }: UseMediaUploadOptions = {}) {
  const [tasks, setTasks] = useState<UploadTask[]>([])

  function updateTask(id: string, patch: Partial<UploadTask>) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)))
  }

  async function runTask(id: string, file: File, bucket: MediaBucket, folder: string) {
    updateTask(id, { status: 'compressing' })
    try {
      const asset = await uploadMediaAsset(file, { bucket, folder }, (pct) => {
        updateTask(id, { progress: pct, status: pct < 40 ? 'compressing' : 'uploading' })
      })
      updateTask(id, { status: 'done', progress: 100, asset })
      onUploaded?.(asset)
    } catch (err) {
      updateTask(id, { status: 'error', error: getErrorMessage(err, 'Upload failed.') })
    }
  }

  function addFiles(files: File[], bucket: MediaBucket, folder: string) {
    const newTasks: UploadTask[] = files.map((file) => ({
      id: crypto.randomUUID(),
      file,
      progress: 0,
      status: 'pending',
    }))
    setTasks((prev) => [...prev, ...newTasks])
    newTasks.forEach((task) => runTask(task.id, task.file, bucket, folder))
  }

  function removeTask(id: string) {
    setTasks((prev) => prev.filter((t) => t.id !== id))
  }

  function clearCompleted() {
    setTasks((prev) => prev.filter((t) => t.status !== 'done'))
  }

  const isUploading = tasks.some((t) => t.status === 'compressing' || t.status === 'uploading' || t.status === 'pending')

  return { tasks, addFiles, removeTask, clearCompleted, isUploading }
}
