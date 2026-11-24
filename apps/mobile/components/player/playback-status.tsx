import { FormAlert } from '@/components/ui/form-alert'
import { ThemedText } from '@/components/themed-text'
import { useI18n } from '@/hooks/use-i18n'
import type { TranslationKey } from '@/lib/i18n/messages/en'
import type { PlaybackErrorKind } from '@/lib/player/playback-error'
import { usePlayerStore } from '@/lib/player/player-store'

const ERROR_MESSAGES: Record<PlaybackErrorKind, TranslationKey> = {
  'not-ready': 'player.error.notReady',
  protected: 'player.error.protected',
  'rate-limited': 'player.error.rateLimited',
  failed: 'player.error.failed',
}

/** The line under the transport: why a track failed, or that it is buffering. */
export function PlaybackStatus() {
  const { t } = useI18n()
  const status = usePlayerStore((player) => player.status)
  const error = usePlayerStore((player) => player.error)

  if (status === 'error' && error) return <FormAlert message={t(ERROR_MESSAGES[error])} />
  if (status === 'buffering') {
    return (
      <ThemedText accessibilityLiveRegion="polite" style={{ textAlign: 'center' }} tone="textSecondary" variant="caption">
        {t('player.buffering')}
      </ThemedText>
    )
  }
  return null
}
