import { Button } from '@bitrate/ui-react'
import { formatBytes } from '@entities/release'
import { useId, useRef } from 'react'

interface MediaFilePickerProps {
  label: string
  hint: string
  accept: string
  file: File | null
  problem: string | null
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
  return (
    <div className="space-y-2">
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
          {file ? 'Choose another file' : 'Choose file'}
        </Button>
        <span className="min-w-0 truncate text-sm text-text-secondary">
          {file ? `${file.name} · ${formatBytes(file.size)}` : 'No file chosen'}
        </span>
      </div>
      <p className="text-sm text-text-secondary" id={`${id}-hint`}>
        {hint}
      </p>
      {problem && (
        <p className="text-sm text-destructive" id={`${id}-error`} role="alert">
          {problem}
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
  if (fraction === null) return null
  const percent = Math.round(fraction * 100)
  return (
    <div className="space-y-1">
      <progress
        aria-label="Upload progress"
        className="h-2 w-full overflow-hidden rounded-full accent-accent"
        max={100}
        value={percent}
      />
      <p aria-live="polite" className="text-sm text-text-secondary">
        {percent < 100 ? `Uploading… ${percent}%` : 'Saving…'}
      </p>
    </div>
  )
}
