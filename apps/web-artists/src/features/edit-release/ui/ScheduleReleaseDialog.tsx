import { Button, Input } from '@bitrate/ui-react'
import { type ReleaseSummary, useUpdateRelease } from '@entities/release'
import { zodResolver } from '@hookform/resolvers/zod'
import { WorkspaceModal } from '@shared/ui/WorkspaceModal/WorkspaceModal'
import { useId, useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  type ScheduleValues,
  scheduleDefaults,
  scheduleInstant,
  scheduleSchema,
} from '../model/schedule.schema'
import { DraftEditorLoader } from './DraftEditorLoader'

interface ScheduleReleaseDialogProps {
  artistId: string
  releaseId: string
  onClose: () => void
  onSaved: () => void
}

export function ScheduleReleaseDialog(props: ScheduleReleaseDialogProps) {
  return (
    <DraftEditorLoader
      artistId={props.artistId}
      onClose={props.onClose}
      releaseId={props.releaseId}
      renderDraft={(release) => (
        <ScheduleReleaseForm {...props} release={release} />
      )}
      title="Release timing"
    />
  )
}

function ScheduleReleaseForm({
  artistId,
  release,
  onClose,
  onSaved,
}: ScheduleReleaseDialogProps & { release: ReleaseSummary }) {
  const id = useId()
  const update = useUpdateRelease(artistId)
  const form = useForm<ScheduleValues>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: scheduleDefaults(release.scheduledAt),
    mode: 'onTouched',
  })
  const [expectedUpdatedAt] = useState(release.updatedAt)
  const { isDirty, isSubmitting, errors } = form.formState
  const values = form.watch()
  const parsed = scheduleSchema.safeParse(values)
  const changed = parsed.success
    ? scheduleInstant(parsed.data) !==
      (release.scheduledAt ? new Date(release.scheduledAt).toISOString() : null)
    : isDirty
  const planned = values.planned
  const busy = update.isPending || isSubmitting
  const submit = async (values: ScheduleValues) => {
    try {
      await update.mutateAsync({
        id: release.id,
        input: { scheduledAt: scheduleInstant(values), expectedUpdatedAt },
      })
      onSaved()
    } catch {
      // Keep entries when persistence is rejected or unconfirmed.
    }
  }
  return (
    <WorkspaceModal
      canClose={!busy}
      className="artist-release-schedule-modal"
      onClose={onClose}
      title="Release timing"
    >
      <form
        aria-busy={busy}
        className="space-y-6"
        noValidate
        onSubmit={form.handleSubmit(submit)}
      >
        <p className="text-sm text-text-secondary">
          Save a planned date and time. This does not submit or deliver your
          release.
        </p>
        <label
          className="flex items-center gap-3 text-sm"
          htmlFor={`${id}-planned`}
        >
          <input
            className="artist-release-schedule-toggle"
            data-initial-focus
            disabled={busy}
            id={`${id}-planned`}
            type="checkbox"
            {...form.register('planned', { onChange: () => update.reset() })}
          />
          Set a planned release date
        </label>
        <div className="artist-release-schedule-fields">
          {(['date', 'time'] as const).map((field) => (
            <div className="min-w-0 space-y-2" key={field}>
              <label
                className="block text-sm font-medium"
                htmlFor={`${id}-${field}`}
              >
                {field === 'date' ? 'Release date' : 'Time (UTC)'}
              </label>
              <Input
                aria-describedby={
                  errors[field] ? `${id}-${field}-error` : undefined
                }
                aria-invalid={Boolean(errors[field])}
                aria-required={planned}
                className="h-11 min-w-0 border-input bg-secondary text-foreground"
                disabled={busy || !planned}
                id={`${id}-${field}`}
                max={field === 'date' ? '9999-12-31' : undefined}
                min={field === 'date' ? '0001-01-01' : undefined}
                step={field === 'time' ? '0.001' : undefined}
                type={field}
                {...form.register(field, { onChange: () => update.reset() })}
              />
              {errors[field] && (
                <p
                  className="text-sm text-destructive"
                  id={`${id}-${field}-error`}
                  role="alert"
                >
                  {errors[field]?.message}
                </p>
              )}
            </div>
          ))}
        </div>
        <p className="text-sm text-text-secondary">
          Time zone: UTC. Uncheck the planned date to clear the schedule.
        </p>
        {update.error && (
          <p className="text-sm text-destructive" role="alert">
            {update.error.message}
          </p>
        )}
        <div className="flex flex-wrap justify-end gap-3">
          <Button
            disabled={busy}
            onClick={onClose}
            type="button"
            variant="outline"
          >
            Cancel
          </Button>
          <Button
            className="artist-workspace-primary"
            disabled={busy || !changed}
            type="submit"
            variant="primary"
          >
            {busy ? 'Saving schedule…' : 'Save schedule'}
          </Button>
        </div>
      </form>
    </WorkspaceModal>
  )
}
