import {
  channelNames,
  promotionChannels,
  promotionGoals,
} from '@entities/promotion'
import { useI18n } from '@shared/i18n'
import { PanelIcon } from '@shared/ui'
import { Share2, Target } from 'lucide-react'
import type { UseFormReturn } from 'react-hook-form'
import type { ProfileFormValues } from '../model/profileForm'

const GOALS = {
  STREAMS: ['promotion.goal.streams', 'promotion.goal.streamsHint'],
  FOLLOWERS: ['promotion.goal.followers', 'promotion.goal.followersHint'],
  BUZZ: ['promotion.goal.buzz', 'promotion.goal.buzzHint'],
} as const

interface GoalChannelsFieldsProps {
  form: UseFormReturn<ProfileFormValues>
  disabled: boolean
}

/** The goal (one of three) and the channels the artist posts on (at least one). */
export function GoalChannelsFields({
  form,
  disabled,
}: GoalChannelsFieldsProps) {
  const { t, tMessage } = useI18n()
  const channelsError = form.formState.errors.channels?.message
  return (
    <>
      <fieldset
        aria-labelledby="promotion-goal-heading"
        className="artist-release-workspace-panel"
        disabled={disabled}
      >
        <h2 id="promotion-goal-heading">
          <PanelIcon icon={Target} />
          {t('promotion.profile.goal')}
        </h2>
        <div className="mt-4 grid gap-3">
          {promotionGoals.map((goal) => (
            <label className="flex items-start gap-3" key={goal}>
              <input
                className="mt-1"
                type="radio"
                value={goal}
                {...form.register('goal')}
              />
              <span className="grid">
                <span className="text-sm">{t(GOALS[goal][0])}</span>
                <span className="text-xs text-text-secondary">
                  {t(GOALS[goal][1])}
                </span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset
        aria-describedby={
          channelsError ? 'promotion-channels-error' : undefined
        }
        aria-labelledby="promotion-channels-heading"
        className="artist-release-workspace-panel"
        disabled={disabled}
      >
        <h2 id="promotion-channels-heading">
          <PanelIcon icon={Share2} />
          {t('promotion.profile.channels')}
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {promotionChannels.map((channel) => (
            <label className="flex items-center gap-3 text-sm" key={channel}>
              <input
                type="checkbox"
                value={channel}
                {...form.register('channels')}
              />
              {channelNames[channel]}
            </label>
          ))}
        </div>
        {channelsError && (
          <p
            className="mt-3 text-sm text-destructive"
            id="promotion-channels-error"
            role="alert"
          >
            {tMessage(channelsError)}
          </p>
        )}
      </fieldset>
    </>
  )
}
