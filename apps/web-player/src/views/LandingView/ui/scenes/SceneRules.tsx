'use client'

import { usePlayerStore } from '@entities/Player'
import { useSettingsStore } from '@entities/Settings'
import { TracksList } from '@entities/Track'
import { LanguageSwitcher } from '@features/SwitchLanguage'
import { ThemeSwitcher } from '@features/SwitchTheme'
import { useI18n } from '@shared/i18n'
import { SettingsCard, SettingsRow, SettingsSwitch } from '@shared/ui'
import { RightSidebar } from '@widgets/RightSidebar'
import { useState } from 'react'
import { lc } from '../../lib/styles/lc'
import { DEMO_TRACK_SETS } from '../../model/demo/demoSeeds'
import { useLandingCopy } from '../../model/useLandingCopy'
import { DemoFrame } from '../demo/DemoFrame'
import { Abs, SceneShell } from './parts'

/**
 * The player's own Settings controls, writing the same settings store the app reads: the
 * preview beside them (track rows, Now Playing panel) changes as they do.
 */
const DemoSettings = () => {
  const c = useLandingCopy()
  const { t } = useI18n()
  const compactLibrary = useSettingsStore((state) => state.compactLibrary)
  const nowPlayingPanel = useSettingsStore((state) => state.nowPlayingPanel)
  const toggleSetting = useSettingsStore((state) => state.toggleSetting)

  return (
    <div className="grid shrink-0 grid-cols-2 gap-4 max-[820px]:grid-cols-1 [&>section]:mb-0">
      <SettingsCard title={c('rules.appearance')}>
        <SettingsRow label={c('rules.theme')}>
          <ThemeSwitcher />
        </SettingsRow>
        <SettingsRow label={t('settings.language')}>
          <LanguageSwitcher />
        </SettingsRow>
      </SettingsCard>
      <SettingsCard title={t('settings.library')}>
        <SettingsRow label={t('settings.library.compact')}>
          <SettingsSwitch
            ariaLabel={t('settings.library.compact')}
            checked={compactLibrary}
            onChange={() => toggleSetting('compactLibrary')}
          />
        </SettingsRow>
        <SettingsRow label={t('settings.display.nowPlaying')}>
          <SettingsSwitch
            ariaLabel={t('settings.display.nowPlaying')}
            checked={nowPlayingPanel}
            onChange={() => toggleSetting('nowPlayingPanel')}
          />
        </SettingsRow>
      </SettingsCard>
    </div>
  )
}

/**
 * What the settings change: the track rows (compact or not) and, when the setting is on, the
 * Now Playing panel that opens with Play, as in the player. Its collapse button closes it until
 * the next track starts.
 */
const DemoPreview = () => {
  const nowPlayingPanel = useSettingsStore((state) => state.nowPlayingPanel)
  const isPlaying = usePlayerStore((state) => state.isPlaying)
  const sequence = usePlayerStore((state) => state.playbackSequence)
  const [closedAt, setClosedAt] = useState<number | null>(null)
  const isPanelOpen = nowPlayingPanel && isPlaying && closedAt !== sequence

  return (
    <div className="relative min-h-0 flex-1 overflow-hidden rounded-[14px] border border-border bg-card p-4 max-[820px]:hidden">
      <TracksList showDateAdded={false} tracks={[...DEMO_TRACK_SETS.preview]} />
      {isPanelOpen ? (
        <div className="absolute inset-y-0 right-0 w-70 border-l border-border bg-background shadow-2xl">
          <RightSidebar onCollapse={() => setClosedAt(sequence)} />
        </div>
      ) : null}
    </div>
  )
}

/** Scene "Your rules": the real Settings controls beside a preview they change live. */
export const SceneRules = () => {
  const c = useLandingCopy()
  const { t } = useI18n()
  return (
    <SceneShell id="rules" labelKey="rules.your_player_your_rules">
      <Abs h={340} markers="d-only" w={360} x={0} y={560}>
        <div className={lc('horizon', 'h-full')}></div>
      </Abs>
      <Abs extra="opacity-[.7]" h={120} markers="d-only" w={300} x={40} y={110}>
        <div className={lc('bands')} id="bands"></div>
      </Abs>
      <Abs w={320} x={50} y={236}>
        <div className={lc('eyebrow', 'mb-[18px]')} data-a="up">
          {c('rules.make_it_yours')}
        </div>
        <h2 className={lc('h h56')}>
          <span className={lc('line')}>
            <span>{c('rules.your_player')}</span>
          </span>
          <span className={lc('line')}>
            <span className={lc('hl')}>{c('rules.your_rules')}</span>
          </span>
        </h2>
        <p className={lc('lede', 'mt-[26px] text-foreground')} data-a="up">
          {c('rules.less_clutter_more_of_what_you_use')}
        </p>
        <p className={lc('lede s', 'mt-[14px]')} data-a="up">
          {c('rules.lede_settings')}
        </p>
      </Abs>
      <span
        className={lc('abs sig d-only')}
        style={{ '--x': '72', '--y': '834', '--w': '200' }}
      >
        {c('common.music_lives_on')}
      </span>
      <Abs data-a="win" h={690} markers="win" w={1008} x={392} y={126}>
        <DemoFrame
          className="flex h-full flex-col gap-4 p-5 max-[820px]:max-h-[52vh] max-[820px]:p-4"
          label={t('settings.title')}
        >
          <DemoSettings />
          <DemoPreview />
        </DemoFrame>
      </Abs>
    </SceneShell>
  )
}
