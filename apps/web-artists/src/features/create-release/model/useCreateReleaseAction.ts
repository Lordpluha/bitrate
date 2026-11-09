import { useCreateRelease } from '@entities/release'
import { useI18n } from '@shared/i18n'
import { useNavigate } from '@tanstack/react-router'
import { useRef, useState } from 'react'

/** One creation shared by every workspace entry point; navigation retries never repeat POST. */
export function useCreateReleaseAction(
  artistId: string,
  type: 'SINGLE' | 'COMPILATION' = 'SINGLE',
) {
  const mutation = useCreateRelease(artistId)
  const navigate = useNavigate()
  const { t } = useI18n()
  const running = useRef(false)
  const [pending, setPending] = useState(false)
  const [navigationFailed, setNavigationFailed] = useState(false)
  const savedDraft = useRef<string | null>(null)

  const create = async () => {
    if (running.current) return
    running.current = true
    setPending(true)
    setNavigationFailed(false)
    try {
      if (!savedDraft.current) {
        const draft = await mutation.mutateAsync({
          title: t(
            type === 'COMPILATION'
              ? 'profile.compilations.untitled'
              : 'music.create.untitled',
          ),
          type,
        })
        savedDraft.current = draft.id
      }
      await navigate({
        to: '/dashboard/music/$releaseId',
        params: { releaseId: savedDraft.current },
      })
      savedDraft.current = null
      mutation.reset()
    } catch {
      if (savedDraft.current) setNavigationFailed(true)
    } finally {
      running.current = false
      setPending(false)
    }
  }

  const dismiss = () => {
    mutation.reset()
    setNavigationFailed(false)
  }
  return { create, pending, error: mutation.error, navigationFailed, dismiss }
}
