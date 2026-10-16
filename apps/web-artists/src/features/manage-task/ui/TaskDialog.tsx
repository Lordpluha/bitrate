import { Button, Input, Textarea } from '@bitrate/ui-react'
import {
  dueDateToInstant,
  instantToDueDate,
  type ReleaseTask,
  type TaskFormValues,
  taskFormSchema,
  useCreateTask,
  useUpdateTask,
} from '@entities/task'
import { zodResolver } from '@hookform/resolvers/zod'
import { WorkspaceModal } from '@shared/ui/WorkspaceModal/WorkspaceModal'
import { useId } from 'react'
import { useForm } from 'react-hook-form'

interface TaskParticipant {
  id: string
  displayName: string
}

interface TaskDialogProps {
  artistId: string
  releaseId: string
  participants: TaskParticipant[]
  /** Edits this task; omitted to create one. */
  task?: ReleaseTask
  onClose: () => void
  onSaved: () => void
}

export function TaskDialog({
  artistId,
  releaseId,
  participants,
  task,
  onClose,
  onSaved,
}: TaskDialogProps) {
  const id = useId()
  const create = useCreateTask(artistId)
  const update = useUpdateTask(artistId)
  const mutation = task ? update : create
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: task?.title ?? '',
      notes: task?.notes ?? '',
      dueDate: instantToDueDate(task?.dueAt ?? null),
      assigneeContributorId: task?.assignee?.id ?? '',
    },
    mode: 'onTouched',
  })
  const { errors, isSubmitting, isDirty } = form.formState
  const busy = mutation.isPending || isSubmitting

  const submit = async (values: TaskFormValues) => {
    const fields = {
      title: values.title.trim(),
      notes: values.notes.trim() === '' ? null : values.notes.trim(),
      dueAt: dueDateToInstant(values.dueDate),
      assigneeContributorId:
        values.assigneeContributorId === ''
          ? null
          : values.assigneeContributorId,
    }
    try {
      if (task) {
        await update.mutateAsync({
          releaseId,
          taskId: task.id,
          input: { ...fields, expectedUpdatedAt: task.updatedAt },
        })
      } else {
        await create.mutateAsync({ releaseId, input: fields })
      }
      onSaved()
    } catch {
      // Keep the entries when the write is rejected or unconfirmed.
    }
  }

  return (
    <WorkspaceModal
      canClose={!busy}
      className="artist-release-credit-modal"
      onClose={onClose}
      title={task ? 'Edit task' : 'Add task'}
    >
      <form
        aria-busy={busy}
        className="space-y-5"
        noValidate
        onSubmit={form.handleSubmit(submit)}
      >
        <div className="space-y-2">
          <label className="block text-sm font-medium" htmlFor={`${id}-title`}>
            Task
          </label>
          <Input
            aria-describedby={errors.title ? `${id}-title-error` : undefined}
            aria-invalid={Boolean(errors.title)}
            autoComplete="off"
            data-initial-focus
            disabled={busy}
            id={`${id}-title`}
            maxLength={200}
            placeholder="For example: Approve the final master"
            {...form.register('title', { onChange: () => mutation.reset() })}
          />
          {errors.title && (
            <p
              className="text-sm text-destructive"
              id={`${id}-title-error`}
              role="alert"
            >
              {errors.title.message}
            </p>
          )}
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="block text-sm font-medium" htmlFor={`${id}-due`}>
              Due date
            </label>
            <Input
              aria-describedby={`${id}-due-hint`}
              disabled={busy}
              id={`${id}-due`}
              type="date"
              {...form.register('dueDate', {
                onChange: () => mutation.reset(),
              })}
            />
            <p className="text-xs text-text-secondary" id={`${id}-due-hint`}>
              Optional. Due by the end of the day, UTC.
            </p>
          </div>
          <div className="space-y-2">
            <label
              className="block text-sm font-medium"
              htmlFor={`${id}-assignee`}
            >
              Assignee
            </label>
            <select
              className="artist-music-control h-11 w-full px-3 text-sm"
              disabled={busy || participants.length === 0}
              id={`${id}-assignee`}
              {...form.register('assigneeContributorId', {
                onChange: () => mutation.reset(),
              })}
            >
              <option value="">Unassigned</option>
              {participants.map((person) => (
                <option key={person.id} value={person.id}>
                  {person.displayName}
                </option>
              ))}
            </select>
            <p className="text-xs text-text-secondary">
              {participants.length === 0
                ? 'Add contributors to the release to assign tasks.'
                : 'Credited participants of this release.'}
            </p>
          </div>
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium" htmlFor={`${id}-notes`}>
            Notes
          </label>
          <Textarea
            aria-describedby={errors.notes ? `${id}-notes-error` : undefined}
            aria-invalid={Boolean(errors.notes)}
            disabled={busy}
            id={`${id}-notes`}
            maxLength={2000}
            rows={4}
            {...form.register('notes', { onChange: () => mutation.reset() })}
          />
          {errors.notes && (
            <p
              className="text-sm text-destructive"
              id={`${id}-notes-error`}
              role="alert"
            >
              {errors.notes.message}
            </p>
          )}
        </div>
        {mutation.error && (
          <p className="text-sm text-destructive" role="alert">
            {mutation.error.message}
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
            disabled={busy || (task !== undefined && !isDirty)}
            type="submit"
            variant="primary"
          >
            {busy ? 'Saving…' : task ? 'Save task' : 'Add task'}
          </Button>
        </div>
      </form>
    </WorkspaceModal>
  )
}
