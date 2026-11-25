import { Input, Textarea } from '@bitrate/ui-react'
import { useI18n } from '@shared/i18n'
import { PanelIcon } from '@shared/ui'
import { AudioLines, Clock } from 'lucide-react'
import { useId } from 'react'
import type { FieldPath, UseFormReturn } from 'react-hook-form'
import type { ProfileFormValues } from '../model/profileForm'

interface AudienceVoiceFieldsProps {
  form: UseFormReturn<ProfileFormValues>
  disabled: boolean
}

/** Weekly time, countries, audience, and the voice: three words and up to three example posts. */
export function AudienceVoiceFields({
  form,
  disabled,
}: AudienceVoiceFieldsProps) {
  const { t, tMessage } = useI18n()
  const id = useId()
  const { errors } = form.formState
  const describedBy = (name: string, hint?: boolean) =>
    [hint && `${id}-${name}-hint`, `${id}-${name}-error`]
      .filter(Boolean)
      .join(' ')
  const error = (
    name: FieldPath<ProfileFormValues>,
    message: string | undefined,
  ) =>
    message && (
      <p
        className="text-sm text-destructive"
        id={`${id}-${name}-error`}
        role="alert"
      >
        {tMessage(message)}
      </p>
    )
  return (
    <>
      <fieldset
        className="artist-release-workspace-panel grid gap-4"
        disabled={disabled}
      >
        <h2>
          <PanelIcon icon={Clock} />
          {t('promotion.profile.timeAudience')}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1 text-sm" htmlFor={`${id}-weeklyHours`}>
            {t('promotion.profile.weekly')}
            <Input
              aria-describedby={describedBy('weeklyHours')}
              aria-invalid={Boolean(errors.weeklyHours)}
              id={`${id}-weeklyHours`}
              inputMode="numeric"
              max={40}
              min={1}
              type="number"
              {...form.register('weeklyHours', { valueAsNumber: true })}
            />
            {error('weeklyHours', errors.weeklyHours?.message)}
          </label>
          <label className="grid gap-1 text-sm" htmlFor={`${id}-countries`}>
            {t('promotion.profile.countries')}
            <Input
              aria-describedby={describedBy('countries', true)}
              aria-invalid={Boolean(errors.countries)}
              id={`${id}-countries`}
              {...form.register('countries')}
            />
            <span
              className="text-xs text-text-secondary"
              id={`${id}-countries-hint`}
            >
              {t('promotion.profile.countriesHint')}
            </span>
            {error('countries', errors.countries?.message)}
          </label>
        </div>
        <label className="grid gap-1 text-sm" htmlFor={`${id}-audience`}>
          {t('promotion.profile.audience')}
          <Input
            aria-describedby={describedBy('audience')}
            aria-invalid={Boolean(errors.audience)}
            id={`${id}-audience`}
            maxLength={200}
            placeholder={t('promotion.profile.audiencePlaceholder')}
            {...form.register('audience')}
          />
          {error('audience', errors.audience?.message)}
        </label>
      </fieldset>
      <fieldset
        className="artist-release-workspace-panel grid gap-4"
        disabled={disabled}
      >
        <h2>
          <PanelIcon icon={AudioLines} />
          {t('promotion.profile.voice')}
        </h2>
        <label className="grid gap-1 text-sm" htmlFor={`${id}-voiceWords`}>
          {t('promotion.profile.voiceWords')}
          <Input
            aria-describedby={describedBy('voiceWords')}
            aria-invalid={Boolean(errors.voiceWords)}
            id={`${id}-voiceWords`}
            placeholder={t('promotion.profile.voiceWordsPlaceholder')}
            {...form.register('voiceWords')}
          />
          {error('voiceWords', errors.voiceWords?.message)}
        </label>
        {[0, 1, 2].map((index) => (
          <label
            className="grid gap-1 text-sm"
            htmlFor={`${id}-example-${index}`}
            key={index}
          >
            {t('promotion.profile.example', { number: index + 1 })}
            <Textarea
              aria-describedby={describedBy(`examples.${index}`)}
              aria-invalid={Boolean(errors.examples?.[index])}
              id={`${id}-example-${index}`}
              maxLength={500}
              placeholder={t('promotion.profile.examplePlaceholder')}
              rows={3}
              {...form.register(`examples.${index}`)}
            />
            {error(`examples.${index}`, errors.examples?.[index]?.message)}
          </label>
        ))}
        <p className="artist-release-footnote">
          {t('promotion.profile.examplesNote')}
        </p>
      </fieldset>
    </>
  )
}
