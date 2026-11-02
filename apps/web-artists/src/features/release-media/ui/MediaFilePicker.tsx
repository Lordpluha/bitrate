import { Button, cn } from '@bitrate/ui-react'
import { formatBytes } from '@entities/release'
import { type TranslationKey, useI18n } from '@shared/i18n'
import { type DragEvent, useId, useRef, useState } from 'react'

const carriesFiles = (event: DragEvent<HTMLElement>) =>
  event.dataTransfer.types.includes('Files')

/**
 * Drag-and-drop of one file onto an element. A file drag is always caught, even while
 * `disabled`, so a stray drop never makes the browser navigate away from an upload in progress.
 */
export function useFileDrop(disabled: boolean, onFile: (file: File) => void) {
  const [over, setOver] = useState(false)
  const handlers = {
    onDragOver: (event: DragEvent<HTMLElement>) => {
      if (!carriesFiles(event)) return
      event.preventDefault()
      event.dataTransfer.dropEffect = disabled ? 'none' : 'copy'
      setOver(!disabled)
    },
    onDragLeave: (event: DragEvent<HTMLElement>) => {
      const next = event.relatedTarget
      if (next instanceof Node && event.currentTarget.contains(next)) return
      setOver(false)
    },
    onDrop: (event: DragEvent<HTMLElement>) => {
      if (!carriesFiles(event)) return
      event.preventDefault()
      setOver(false)
      const file = event.dataTransfer.files[0]
      if (file && !disabled) onFile(file)
    },
  }
  return { over, handlers }
}

interface MediaFilePickerProps {
  label: string
  hint: string
  accept: string
  file: File | null
  /** A catalog key explaining why the chosen file cannot be used. */
  problem: TranslationKey | null
  disabled: boolean
  onChange: (file: File | null) => void
}

/** A labelled file input with a visible choose button, the chosen name and its size. */
export function MediaFilePicker({
  label,
  hint,
  accept,
  file,
  problem,
  disabled,
  onChange,
}: MediaFilePickerProps) {
  const id = useId()
  const input = useRef<HTMLInputElement>(null)
  const drop = useFileDrop(disabled, onChange)
  const { t } = useI18n()
  return (
    <div
      className={cn(
        'space-y-2 rounded-lg',
        drop.over && 'outline-2 outline-offset-4 outline-accent outline-dashed',
      )}
      {...drop.handlers}
    >
      <label className="block text-sm font-medium" htmlFor={`${id}-file`}>
        {label}
      </label>
      <div className="flex flex-wrap items-center gap-3">
        <input
          accept={accept}
          aria-describedby={problem ? `${id}-error` : `${id}-hint`}
          aria-invalid={Boolean(problem)}
          className="sr-only"
          disabled={disabled}
          id={`${id}-file`}
          onChange={(event) => onChange(event.target.files?.[0] ?? null)}
          ref={input}
          type="file"
        />
        <Button
          data-initial-focus
          disabled={disabled}
          onClick={() => input.current?.click()}
          type="button"
          variant="outline"
        >
          {file ? t('media.chooseAnother') : t('media.chooseFile')}
        </Button>
        <span className="min-w-0 truncate text-sm text-text-secondary">
          {file
            ? `${file.name} · ${formatBytes(file.size)}`
            : t('media.noFile')}
        </span>
      </div>
      <p className="text-sm text-text-secondary" id={`${id}-hint`}>
        {hint}
      </p>
      {problem && (
        <p className="text-sm text-destructive" id={`${id}-error`} role="alert">
          {t(problem)}
        </p>
      )}
    </div>
  )
}

interface UploadProgressProps {
  fraction: number | null
}

/** Upload progress; the final stretch is server-side storage, so 100% reads "Saving…". */
export function UploadProgress({ fraction }: UploadProgressProps) {
  const { t } = useI18n()
  if (fraction === null) return null
  const percent = Math.round(fraction * 100)
  return (
    <div className="space-y-1">
      <progress
        aria-label={t('media.progress')}
        className="h-2 w-full overflow-hidden rounded-full accent-accent"
        max={100}
        value={percent}
      />
      <p aria-live="polite" className="text-sm text-text-secondary">
        {percent < 100
          ? t('media.uploadingPercent', { percent })
          : t('common.saving')}
      </p>
    </div>
  )
}
