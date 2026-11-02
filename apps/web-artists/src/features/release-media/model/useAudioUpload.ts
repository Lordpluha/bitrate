import {
  audioFileProblem,
  type ReleaseWorkspace,
  useUploadTrack,
} from '@entities/release'
import type { TranslationKey } from '@shared/i18n'
import { useState } from 'react'

interface AudioUploadTarget {
  /** Replaces this recording's master; omitted to add a new recording. */
  trackId?: string
  title?: string
}

/**
 * The chosen master, its validation and progress, and the upload against the release
 * version the dialog opened with. `onChosen` lets a dialog react to a new file.
 */
export function useAudioUpload(
  artistId: string,
  release: ReleaseWorkspace,
  onChosen?: (file: File) => void,
) {
  const upload = useUploadTrack(artistId)
  const [expectedUpdatedAt] = useState(release.updatedAt)
  const [file, setFile] = useState<File | null>(null)
  const [problem, setProblem] = useState<TranslationKey | null>(null)
  const [progress, setProgress] = useState<number | null>(null)

  const choose = (next: File | null) => {
    setProblem(next ? audioFileProblem(next) : null)
    upload.reset()
    setFile(next)
    if (next) onChosen?.(next)
  }

  /** Narrows to a valid file, explaining the problem otherwise. */
  const validFile = (): File | null => {
    if (!file) {
      setProblem('media.chooseAudio')
      return null
    }
    const fileProblem = audioFileProblem(file)
    setProblem(fileProblem)
    return fileProblem ? null : file
  }

  /** Uploads a validated file; true once the API confirmed it. */
  const send = async (master: File, target: AudioUploadTarget) => {
    setProgress(0)
    try {
      await upload.mutateAsync({
        id: release.id,
        ...target,
        file: master,
        expectedUpdatedAt,
        onProgress: setProgress,
      })
      return true
    } catch {
      // The file and fields stay so the artist can retry after reading the error.
      return false
    } finally {
      setProgress(null)
    }
  }

  return {
    file,
    problem,
    progress,
    pending: upload.isPending,
    error: upload.error,
    reset: upload.reset,
    choose,
    validFile,
    send,
  }
}

export type AudioUpload = ReturnType<typeof useAudioUpload>
