import { Button, Input } from '@bitrate/ui-react'
import {
  createReleaseSchema,
  type ReleaseSummary,
  useUpdateRelease,
} from '@entities/release'
import { useI18n } from '@shared/i18n'
import { Check, Pencil, X } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'

export function ReleaseTitleEditor({
  artistId,
  release,
  onSaved,
}: {
  artistId: string
  release: ReleaseSummary
  onSaved: () => void
}) {
  const { t, tMessage } = useI18n()
  const update = useUpdateRelease(artistId)
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(release.title)
  const [version, setVersion] = useState(release.updatedAt)
  const [invalid, setInvalid] = useState<string | null>(null)
  const input = useRef<HTMLInputElement>(null)
  const editButton = useRef<HTMLButtonElement>(null)
  const wasEditing = useRef(false)
  const id = useId()
  useEffect(() => {
    if (editing) {
      input.current?.focus()
      input.current?.select()
    } else if (wasEditing.current) editButton.current?.focus()
    wasEditing.current = editing
  }, [editing])
  const cancel = () => {
    if (update.isPending) return
    setEditing(false)
    update.reset()
    setInvalid(null)
  }
  if (!editing)
    return (
      <div className="flex min-w-0 items-center gap-2">
        <h1 className="min-w-0 wrap-anywhere">{release.title}</h1>
        {release.status === 'DRAFT' && (
          <Button
            aria-label={t('workspace.title.edit')}
            className="shrink-0"
            onClick={() => {
              setTitle(release.title)
              setVersion(release.updatedAt)
              setEditing(true)
            }}
            ref={editButton}
            size="icon"
            variant="ghost"
          >
            <Pencil aria-hidden="true" className="size-4" />
          </Button>
        )}
      </div>
    )
  return (
    <form
      aria-busy={update.isPending}
      className="space-y-2"
      onSubmit={async (event) => {
        event.preventDefault()
        if (update.isPending) return
        const parsed = createReleaseSchema.shape.title.safeParse(title)
        if (!parsed.success) {
          setInvalid(
            parsed.error.issues[0]?.message ?? t('music.fields.titleRequired'),
          )
          return
        }
        try {
          await update.mutateAsync({
            id: release.id,
            input: { title: parsed.data, expectedUpdatedAt: version },
          })
          setEditing(false)
          onSaved()
        } catch {
          /* Keep the title and original version after a rejected or unconfirmed write. */
        }
      }}
    >
      <label className="sr-only" htmlFor={id}>
        {t('music.fields.title')}
      </label>
      <div className="flex min-w-0 items-center gap-2">
        <Input
          aria-describedby={invalid || update.error ? `${id}-error` : undefined}
          aria-invalid={!!invalid}
          className="min-w-0 flex-1"
          disabled={update.isPending}
          id={id}
          maxLength={255}
          onChange={(event) => {
            setTitle(event.target.value)
            setInvalid(null)
            update.reset()
          }}
          onKeyDown={(event) => {
            if (event.key === 'Escape') cancel()
          }}
          ref={input}
          value={title}
        />
        <Button
          aria-label={t('editRelease.saveChanges')}
          disabled={update.isPending}
          size="icon"
          type="submit"
          variant="primary"
        >
          <Check aria-hidden="true" className="size-4" />
        </Button>
        <Button
          aria-label={t('common.cancel')}
          disabled={update.isPending}
          onClick={cancel}
          size="icon"
          type="button"
          variant="ghost"
        >
          <X aria-hidden="true" className="size-4" />
        </Button>
      </div>
      {(invalid || update.error) && (
        <p className="text-sm text-destructive" id={`${id}-error`} role="alert">
          {tMessage(invalid ?? update.error?.message)}
        </p>
      )}
    </form>
  )
}
