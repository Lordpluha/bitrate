import { Button, toast } from '@bitrate/ui-react'
import {
  type PromotionProfile,
  useSavePromotionProfile,
} from '@entities/promotion'
import { zodResolver } from '@hookform/resolvers/zod'
import { useI18n } from '@shared/i18n'
import { PanelIcon } from '@shared/ui'
import { Check, ShieldCheck } from 'lucide-react'
import { useForm } from 'react-hook-form'
import {
  type ProfileFormValues,
  profileFormDefaults,
  profileFormSchema,
  toProfileInput,
} from '../model/profileForm'
import { AudienceVoiceFields } from './AudienceVoiceFields'
import { GoalChannelsFields } from './GoalChannelsFields'

interface PromotionProfileFormProps {
  artistId: string
  /** Null before the first save. */
  profile: PromotionProfile | null
}

/** The promotion profile every release plan starts from (spec D-10). */
export function PromotionProfileForm({
  artistId,
  profile,
}: PromotionProfileFormProps) {
  const { t, tMessage } = useI18n()
  const save = useSavePromotionProfile(artistId)
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: profileFormDefaults(profile),
    mode: 'onTouched',
  })
  const busy = save.isPending || form.formState.isSubmitting
  const submit = async (values: ProfileFormValues) => {
    try {
      const saved = await save.mutateAsync(toProfileInput(values))
      form.reset(profileFormDefaults(saved))
      toast.success(t('promotion.profile.saved'))
    } catch {
      // Keep the entries when the write is rejected.
    }
  }
  return (
    <form
      aria-busy={busy}
      className="artist-release-stage"
      noValidate
      onSubmit={form.handleSubmit(submit)}
    >
      <div className="artist-release-stage-main grid gap-4">
        <GoalChannelsFields disabled={busy} form={form} />
        <AudienceVoiceFields disabled={busy} form={form} />
      </div>
      <div className="artist-release-stage-side">
        <section className="artist-release-workspace-panel" data-tone="info">
          <h2>
            <PanelIcon icon={ShieldCheck} />
            {t('promotion.profile.privacyTitle')}
          </h2>
          <p>{t('promotion.profile.privacy')}</p>
          <dl className="artist-promotion-kv">
            <div>
              <dt>{t('promotion.profile.provider')}</dt>
              <dd>{t('promotion.profile.providerValue')}</dd>
            </div>
            <div>
              <dt>{t('promotion.profile.training')}</dt>
              <dd>{t('promotion.profile.trainingValue')}</dd>
            </div>
          </dl>
          <Button className="mt-4 w-full" disabled={busy} type="submit">
            <Check aria-hidden="true" />
            {busy ? t('promotion.profile.saving') : t('promotion.profile.save')}
          </Button>
          {save.error && (
            <p className="mt-3 text-sm text-destructive" role="alert">
              {tMessage(save.error.message)}
            </p>
          )}
        </section>
      </div>
    </form>
  )
}
