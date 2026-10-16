import { Button, cn } from '@bitrate/ui-react'
import {
  type ArtistProfile,
  type ProfileImageKind,
  useProfileImage,
} from '@entities/artist-account'
import { apiBaseUrl } from '@shared/api'
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
  avatar: {
    label: 'Profile photo',
    hint: 'Square, at least 600 × 600 px. JPEG, PNG or WebP up to 10 MB.',
  },
  background: {
    label: 'Header image',
    hint: 'Wide, at least 2000 × 800 px. JPEG, PNG or WebP up to 10 MB.',
  },
} satisfies Record<ProfileImageKind, { label: string; hint: string }>

/** Uploads or removes one profile image immediately, with progress and a recoverable error. */
export function ProfileImageField({
  artistId,
  profile,
  kind,
}: ProfileImageFieldProps) {
  const id = useId()
  const input = useRef<HTMLInputElement>(null)
  const image = useProfileImage(artistId)
  const [progress, setProgress] = useState<number | null>(null)
  const [problem, setProblem] = useState<string | null>(null)
  const current = kind === 'avatar' ? profile.avatar : profile.backgroundImage
  const { label, hint } = copy[kind]

  const upload = async (file: File | null) => {
    setProblem(null)
    image.reset()
    if (file && !ACCEPT.split(',').includes(file.type)) {
      setProblem('Choose a JPEG, PNG or WebP image.')
      return
    }
    if (file && file.size > MAX_BYTES) {
      setProblem('Choose an image up to 10 MB.')
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
        {label}
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
              alt={kind === 'avatar' ? 'Profile photo' : 'Header image'}
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
                ? `Uploading… ${Math.round(progress * 100)}%`
                : current
                  ? 'Replace'
                  : 'Upload'}
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
                Remove
              </Button>
            )}
          </div>
          <p className="text-xs text-text-secondary">{hint}</p>
        </div>
      </div>
      {(problem ?? image.error) && (
        <p className="text-sm text-destructive" role="alert">
          {problem ?? image.error?.message}
        </p>
      )}
    </div>
  )
}
