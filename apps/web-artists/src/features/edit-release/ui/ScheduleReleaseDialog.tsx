import { Button, Input } from '@bitrate/ui-react'
import { type ReleaseSummary, useUpdateRelease } from '@entities/release'
import { zodResolver } from '@hookform/resolvers/zod'
import { useI18n } from '@shared/i18n'
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

/** The timing stays editable after approval, until publishing starts. */
const TIMING_STATUSES = ['DRAFT', 'READY'] as const

const TIMING_CHOICES = [
  {
    planned: false,
    label: 'Right away',
    hint: 'It goes live as soon as you publish it.',
  },
  {
    planned: true,
    label: 'Premiere on a date',
    hint: 'It goes live at the date and time you choose.',
  },
] as const

export function ScheduleReleaseDialog(props: ScheduleReleaseDialogProps) {
  return (
    <DraftEditorLoader
      artistId={props.artistId}
      onClose={props.onClose}
      releaseId={props.releaseId}
      renderDraft={(release) => (
        <ScheduleReleaseForm {...props} release={release} />
      )}
      statuses={TIMING_STATUSES}
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
  const { tMessage } = useI18n()
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
          Choose when listeners can hear it. You can change this until the
          release is published.
        </p>
        <fieldset className="space-y-2" disabled={busy}>
          <legend className="sr-only">When to release</legend>
          {TIMING_CHOICES.map((choice) => (
            <label className="artist-release-credit-role" key={choice.label}>
              <input
                checked={planned === choice.planned}
                data-initial-focus={
                  planned === choice.planned ? true : undefined
                }
                name={`${id}-timing`}
                onChange={() => {
                  update.reset()
                  form.setValue('planned', choice.planned, {
                    shouldDirty: true,
                    shouldValidate: form.formState.isSubmitted,
                  })
                }}
                type="radio"
              />
              <span>
                <span className="block font-medium">{choice.label}</span>
                <span className="block text-xs text-text-secondary">
                  {choice.hint}
                </span>
              </span>
            </label>
          ))}
        </fieldset>
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
        <p className="text-sm text-text-secondary">Time zone: UTC.</p>
        {update.error && (
          <p className="text-sm text-destructive" role="alert">
            {tMessage(update.error.message)}
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
