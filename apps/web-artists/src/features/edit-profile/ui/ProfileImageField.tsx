import { Button, cn } from '@bitrate/ui-react'
import {
  type ArtistProfile,
  type ProfileImageKind,
  useProfileImage,
} from '@entities/artist-account'
import { apiBaseUrl } from '@shared/api'
import { type TranslationKey, useI18n } from '@shared/i18n'
import { ImagePlus } from 'lucide-react'
import { useId, useRef, useState } from 'react'

const ACCEPT = 'image/jpeg,image/png,image/webp'
const MAX_BYTES = 10 * 1024 * 1024

/** Public images live under the API's `/static` route. */
export function profileImageUrl(path: string): string {
  return path.startsWith('/static/') ? `${apiBaseUrl}${path}` : path
}

interface ProfileImageFieldProps {
  artistId: string
  profile: ArtistProfile
  kind: ProfileImageKind
}

const copy = {
  avatar: { label: 'profile.photo', hint: 'profile.photoHint' },
  background: { label: 'profile.header', hint: 'profile.headerHint' },
} satisfies Record<
  ProfileImageKind,
  { label: TranslationKey; hint: TranslationKey }
>

/** Uploads or removes one profile image immediately, with progress and a recoverable error. */
export function ProfileImageField({
  artistId,
  profile,
  kind,
}: ProfileImageFieldProps) {
  const id = useId()
  const input = useRef<HTMLInputElement>(null)
  const image = useProfileImage(artistId)
  const { t, tMessage } = useI18n()
  const [progress, setProgress] = useState<number | null>(null)
  const [problem, setProblem] = useState<TranslationKey | null>(null)
  const current = kind === 'avatar' ? profile.avatar : profile.backgroundImage
  const { label, hint } = copy[kind]

  const upload = async (file: File | null) => {
    setProblem(null)
    image.reset()
    if (file && !ACCEPT.split(',').includes(file.type)) {
      setProblem('media.coverType')
      return
    }
    if (file && file.size > MAX_BYTES) {
      setProblem('profile.imageSize')
      return
    }
    setProgress(file ? 0 : null)
    try {
      await image.mutateAsync({
        kind,
        file,
        expectedUpdatedAt: profile.updatedAt,
        onProgress: setProgress,
      })
    } catch {
      // The current image stays; the error explains what to do next.
    } finally {
      setProgress(null)
      if (input.current) input.current.value = ''
    }
  }

  return (
    <div className="space-y-2">
      <span className="block text-sm font-medium" id={`${id}-label`}>
        {t(label)}
      </span>
      <div className="flex flex-wrap items-center gap-4">
        <div
          className={cn(
            'flex shrink-0 items-center justify-center overflow-hidden border border-border bg-secondary',
            kind === 'avatar' ? 'size-20 rounded-full' : 'h-20 w-40 rounded-lg',
          )}
        >
          {current ? (
            <img
              alt={t(label)}
              className="size-full object-cover"
              src={profileImageUrl(current)}
            />
          ) : (
            <ImagePlus aria-hidden="true" className="size-6 text-accent" />
          )}
        </div>
        <div className="space-y-2">
          <input
            accept={ACCEPT}
            aria-labelledby={`${id}-label`}
            className="sr-only"
            disabled={image.isPending}
            onChange={(event) => {
              void upload(event.target.files?.[0] ?? null)
            }}
            ref={input}
            type="file"
          />
          <div className="flex flex-wrap gap-2">
            <Button
              disabled={image.isPending}
              onClick={() => input.current?.click()}
              size="sm"
              type="button"
              variant="outline"
            >
              {progress !== null
                ? t('media.uploadingPercent', {
                    percent: Math.round(progress * 100),
                  })
                : current
                  ? t('profile.replace')
                  : t('profile.upload')}
            </Button>
            {current && (
              <Button
                disabled={image.isPending}
                onClick={() => {
                  void upload(null)
                }}
                size="sm"
                type="button"
                variant="ghost"
              >
                {t('workspace.track.remove')}
              </Button>
            )}
          </div>
          <p className="text-xs text-text-secondary">{t(hint)}</p>
        </div>
      </div>
      {(problem ?? image.error) && (
        <p className="text-sm text-destructive" role="alert">
          {problem ? t(problem) : tMessage(image.error?.message)}
        </p>
      )}
    </div>
  )
}
