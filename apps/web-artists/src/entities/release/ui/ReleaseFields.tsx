import { Input } from '@bitrate/ui-react'
import { useI18n } from '@shared/i18n'
import { useId } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import {
  type CreateReleaseValues,
  releaseTypeLabels,
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
  const { t, tMessage } = useI18n()
  const errors = form.formState.errors
  const type = form.watch('type')
  return (
    <>
      <div className="space-y-2">
        <label className="block text-sm font-medium" htmlFor={`${id}-title`}>
          {t('music.fields.title')}
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
            {tMessage(errors.title.message)}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <p className="text-sm font-medium">{t('music.fields.type')}</p>
        <p>{t(releaseTypeLabels[type])}</p>
        <p className="text-sm text-text-secondary">
          {t(
            type === 'COMPILATION'
              ? 'compilation.formatHint'
              : 'music.fields.typeAutomatic',
          )}
        </p>
      </div>
    </>
  )
}
