import { Input } from '@bitrate/ui-react'
import { useId } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import {
  type CreateReleaseValues,
  releaseTypeLabels,
  releaseTypes,
} from '../model/release.schema'

export function ReleaseFields({
  form,
  busy,
  onChange,
}: {
  form: UseFormReturn<CreateReleaseValues>
  busy: boolean
  onChange: () => void
}) {
  const id = useId()
  const errors = form.formState.errors
  return (
    <>
      <div className="space-y-2">
        <label className="block text-sm font-medium" htmlFor={`${id}-title`}>
          Release title
        </label>
        <Input
          aria-describedby={errors.title ? `${id}-title-error` : undefined}
          aria-invalid={Boolean(errors.title)}
          aria-required="true"
          className="h-11 border-input bg-secondary text-foreground"
          data-initial-focus
          disabled={busy}
          id={`${id}-title`}
          maxLength={255}
          {...form.register('title', { onChange })}
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
      <div className="space-y-2">
        <label className="block text-sm font-medium" htmlFor={`${id}-type`}>
          Release type
        </label>
        <select
          aria-describedby={errors.type ? `${id}-type-error` : undefined}
          aria-invalid={Boolean(errors.type)}
          className="h-11 w-full rounded-md border border-input bg-secondary px-3 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          disabled={busy}
          id={`${id}-type`}
          {...form.register('type', { onChange })}
        >
          {releaseTypes.map((type) => (
            <option key={type} value={type}>
              {releaseTypeLabels[type]}
            </option>
          ))}
        </select>
        {errors.type && (
          <p
            className="text-sm text-destructive"
            id={`${id}-type-error`}
            role="alert"
          >
            {errors.type.message}
          </p>
        )}
      </div>
    </>
  )
}
