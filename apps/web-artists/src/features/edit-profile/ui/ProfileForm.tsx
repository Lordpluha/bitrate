import { Button, Input, Textarea } from '@bitrate/ui-react'
import {
  type ArtistProfile,
  type ProfileFormValues,
  profileFormDefaults,
  profileFormSchema,
  socialLinkKeys,
  socialLinkLabels,
  useUpdateProfile,
} from '@entities/artist-account'
import { zodResolver } from '@hookform/resolvers/zod'
import { countriesFor } from '@shared/constants/countries'
import { useI18n } from '@shared/i18n'
import { NativeSelect, PanelIcon } from '@shared/ui'
import { IdCard, Link2 } from 'lucide-react'
import { useId, useState } from 'react'
import { useForm } from 'react-hook-form'
import { socialLinkIcons } from './socialLinkIcons'

interface ProfileFormProps {
  artistId: string
  profile: ArtistProfile
  /** Live values for the preview, reported on every change. */
  onValuesChange: (values: ProfileFormValues) => void
}

const nullable = (value: string) => (value.trim() === '' ? null : value.trim())

/** Public handle, country, bio and links; saved together against the loaded version. */
export function ProfileForm({
  artistId,
  profile,
  onValuesChange,
}: ProfileFormProps) {
  const { t, tMessage, locale } = useI18n()
  const id = useId()
  const update = useUpdateProfile(artistId)
  const [saved, setSaved] = useState(false)
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: profileFormDefaults(profile),
    mode: 'onTouched',
  })
  const { errors, isDirty, isSubmitting } = form.formState
  const busy = update.isPending || isSubmitting
  const bioLength = form.watch('bio').length
  const field = (name: keyof ProfileFormValues) =>
    form.register(name, {
      onChange: () => {
        setSaved(false)
        update.reset()
        onValuesChange(form.getValues())
      },
    })

  const submit = async (values: ProfileFormValues) => {
    try {
      const saved = await update.mutateAsync({
        input: {
          username: values.username.trim(),
          bio: nullable(values.bio),
          country: nullable(values.country),
          socials: Object.fromEntries(
            socialLinkKeys.map((key) => [key, nullable(values[key])]),
          ),
          expectedUpdatedAt: profile.updatedAt,
        },
      })
      form.reset(profileFormDefaults(saved))
      setSaved(true)
    } catch {
      // Keep the entries when the write is rejected or unconfirmed.
    }
  }

  const error = (name: keyof ProfileFormValues) =>
    errors[name] && (
      <p
        className="text-sm text-destructive"
        id={`${id}-${name}-error`}
        role="alert"
      >
        {tMessage(errors[name]?.message)}
      </p>
    )

  return (
    <form
      aria-busy={busy}
      className="artist-profile-form"
      noValidate
      onSubmit={form.handleSubmit(submit)}
    >
      <section
        aria-labelledby={`${id}-details-heading`}
        className="artist-release-workspace-panel space-y-5"
      >
        <h2 id={`${id}-details-heading`}>
          <PanelIcon icon={IdCard} />
          {t('profile.details')}
        </h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <label
              className="block text-sm font-medium"
              htmlFor={`${id}-username`}
            >
              {t('profile.handle')}
            </label>
            <Input
              aria-describedby={`${id}-username-hint`}
              aria-invalid={Boolean(errors.username)}
              autoComplete="off"
              disabled={busy}
              id={`${id}-username`}
              maxLength={50}
              {...field('username')}
            />
            <p
              className="text-xs text-text-secondary"
              id={`${id}-username-hint`}
            >
              {t('profile.handleHint')}
            </p>
            {error('username')}
          </div>
          <div className="space-y-2">
            <label
              className="block text-sm font-medium"
              htmlFor={`${id}-country`}
            >
              {t('profile.country')}
            </label>
            <NativeSelect
              className="artist-music-control h-11 pl-3 text-sm"
              disabled={busy}
              id={`${id}-country`}
              {...field('country')}
            >
              <option value="">{t('profile.notShown')}</option>
              {countriesFor(locale).map((country) => (
                <option key={country.code} value={country.code}>
                  {country.name}
                </option>
              ))}
            </NativeSelect>
          </div>
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium" htmlFor={`${id}-bio`}>
            {t('profile.bio')}
          </label>
          <Textarea
            aria-describedby={`${id}-bio-count`}
            aria-invalid={Boolean(errors.bio)}
            disabled={busy}
            id={`${id}-bio`}
            maxLength={500}
            rows={9}
            {...field('bio')}
          />
          <p className="text-xs text-text-secondary" id={`${id}-bio-count`}>
            {bioLength}/500
          </p>
          {error('bio')}
        </div>
      </section>
      <section
        aria-labelledby={`${id}-links-heading`}
        className="artist-release-workspace-panel space-y-5"
      >
        <h2 id={`${id}-links-heading`}>
          <PanelIcon icon={Link2} />
          {t('profile.links')}
        </h2>
        <div className="grid gap-3">
          {socialLinkKeys.map((key) => {
            const Icon = socialLinkIcons[key]
            return (
              <div className="space-y-1" key={key}>
                <label
                  className="artist-profile-link-label"
                  htmlFor={`${id}-${key}`}
                >
                  <Icon aria-hidden="true" />
                  {t(socialLinkLabels[key])}
                </label>
                <Input
                  aria-invalid={Boolean(errors[key])}
                  autoComplete="url"
                  disabled={busy}
                  id={`${id}-${key}`}
                  inputMode="url"
                  placeholder="https://"
                  {...field(key)}
                />
                {error(key)}
              </div>
            )
          })}
        </div>
      </section>
      <div className="artist-profile-actions">
        {update.error && (
          <p className="text-sm text-destructive" role="alert">
            {tMessage(update.error.message)}
          </p>
        )}
        {saved && !isDirty && (
          <p className="text-sm text-text-secondary" role="status">
            {t('profile.saved')}
          </p>
        )}
        <Button
          disabled={busy || !isDirty}
          onClick={() => {
            form.reset(profileFormDefaults(profile))
            onValuesChange(profileFormDefaults(profile))
            update.reset()
          }}
          type="button"
          variant="outline"
        >
          {t('profile.discard')}
        </Button>
        <Button
          className="artist-workspace-primary"
          disabled={busy || !isDirty}
          type="submit"
          variant="primary"
        >
          {busy ? t('common.saving') : t('profile.save')}
        </Button>
      </div>
    </form>
  )
}
