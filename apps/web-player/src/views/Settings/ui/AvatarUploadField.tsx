'use client'

import { cn } from '@bitrate/ui-react'
import type { DragEvent } from 'react'
import { useRef, useState } from 'react'
import { useI18n } from '@/shared/i18n'

type AvatarUploadFieldProps = {
  isPending: boolean
  onFileSelected: (file: File | undefined) => void
}

/**
 * Avatar picker accepting either a dropped image or a click.
 *
 * The native file input stays in the DOM for assistive technology but is
 * visually replaced: browsers render its "no file chosen" label in the
 * *browser's* locale, which contradicted the language chosen in the app.
 *
 * The wrapper is `relative` on purpose. `sr-only` positions that input
 * absolutely, and with no positioned ancestor it is laid out against the page
 * root — escaping the app shell's overflow clipping and stretching the document
 * thousands of pixels past the viewport.
 */
export const AvatarUploadField = ({
  isPending,
  onFileSelected,
}: AvatarUploadFieldProps) => {
  const { t } = useI18n()
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDraggingOver, setIsDraggingOver] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)

  const accept = (file: File | undefined) => {
    setFileName(file?.name ?? null)
    onFileSelected(file)
  }

  const handleDrop = (event: DragEvent<HTMLButtonElement>) => {
    event.preventDefault()
    setIsDraggingOver(false)
    if (!isPending) accept(event.dataTransfer.files?.[0])
  }

  const handleDragOver = (event: DragEvent<HTMLButtonElement>) => {
    event.preventDefault()
    if (!isPending) setIsDraggingOver(true)
  }

  const status = isPending
    ? t('settings.profile.avatar.uploading')
    : (fileName ?? t('settings.profile.avatar.none'))

  return (
    <div className="relative mt-5 grid max-w-160 gap-2 text-sm text-foreground">
      <span id="avatar-upload-label">{t('settings.profile.avatar')}</span>

      <button
        aria-labelledby="avatar-upload-label"
        className={cn(
          'grid w-full gap-2 rounded-lg border border-dashed border-border bg-surface px-4 py-6 text-center transition-colors',
          'hover:bg-surface-hover focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
          isDraggingOver && 'border-primary bg-surface-hover',
          isPending && 'opacity-60',
        )}
        disabled={isPending}
        onClick={() => inputRef.current?.click()}
        onDragLeave={() => setIsDraggingOver(false)}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        type="button"
      >
        <span className="text-muted-foreground">
          {isDraggingOver
            ? t('settings.profile.avatar.drop')
            : t('settings.profile.avatar.hint')}
        </span>

        <span className="mx-auto inline-flex h-9 w-fit items-center rounded-md border border-border bg-background px-4 text-sm font-medium text-foreground">
          {t('settings.profile.avatar.browse')}
        </span>

        <span className="truncate text-xs text-muted-foreground">{status}</span>
      </button>

      <input
        accept="image/png,image/jpeg,image/webp"
        aria-labelledby="avatar-upload-label"
        className="sr-only"
        disabled={isPending}
        onChange={(event) => accept(event.target.files?.[0])}
        ref={inputRef}
        type="file"
      />
    </div>
  )
}
