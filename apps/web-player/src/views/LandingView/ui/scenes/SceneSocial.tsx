'use client'

import { FriendRow, FriendTile } from '@entities/Friend'
import { usePlayerStore } from '@entities/Player'
import { ActivityRow } from '@entities/User'
import { useI18n } from '@shared/i18n'
import { SectionHeader } from '@shared/ui'
import { lc } from '../../lib/styles/lc'
import {
  DEMO_ACTIVITY,
  DEMO_FRIENDS,
  DEMO_TRACK_LIST,
} from '../../model/demo/demoData'
import { useLandingCopy } from '../../model/useLandingCopy'
import { DemoFrame } from '../demo/DemoFrame'
import { Abs, SceneShell, TryInPlayer } from './parts'

/** Scene "Social": the player's Friends (presence, online now) and Activity feed. */
export const SceneSocial = () => {
  const c = useLandingCopy()
  const { t } = useI18n()
  const play = usePlayerStore((state) => state.play)
  const online = DEMO_FRIENDS.filter(
    ({ presence }) => presence.status !== 'offline',
  )

  return (
    <SceneShell id="social" labelKey="social.beyond_the_play_button">
      <Abs w={330} x={48} y={120}>
        <div className={lc('eyebrow', 'mb-[18px]')} data-a="up">
          {c('social.music_is_a_conversation')}
        </div>
        <h2 className={lc('h h54')}>
          <span className={lc('line')}>
            <span>{c('social.beyond_the')}</span>
          </span>
          <span className={lc('line')}>
            <span className={lc('hl')}>{c('social.play_button')}</span>
          </span>
        </h2>
        <p className={lc('lede s', 'mt-[20px]')} data-a="up">
          {c('social.lede')}
        </p>
        <div className="mt-[14px]" data-a="up">
          <TryInPlayer />
        </div>
      </Abs>
      <Abs data-a="win" h={176} markers="win d-only" w={330} x={48} y={470}>
        <DemoFrame className="h-full p-5" label={t('friends.onlineNow')}>
          <h2 className="mb-3 text-base font-semibold">
            {t('friends.onlineNow')}
          </h2>
          <div className="flex gap-1">
            {online.map(({ presence, user }) => (
              <FriendTile key={user.id} presence={presence} user={user} />
            ))}
          </div>
        </DemoFrame>
      </Abs>
      <Abs
        data-a="win"
        h={580}
        markers="win scene-block"
        w={980}
        x={420}
        y={130}
      >
        <DemoFrame
          className="grid h-full grid-cols-2 gap-8 p-6 max-[820px]:max-h-[52vh] max-[820px]:grid-cols-1 max-[820px]:p-4"
          label={t('friends.title')}
        >
          <section className="min-w-0">
            <SectionHeader title={t('friends.title')} />
            {DEMO_FRIENDS.map(({ presence, user }) => (
              <FriendRow key={user.id} presence={presence} user={user} />
            ))}
          </section>
          <section className="min-w-0 max-[820px]:hidden">
            <SectionHeader title={t('activity.title')} />
            <ul className="flex flex-col">
              {DEMO_ACTIVITY.map((entry) => (
                <ActivityRow
                  entry={entry}
                  key={entry.user.id}
                  onPlay={() => {
                    const track = DEMO_TRACK_LIST.find(
                      ({ id }) => id === entry.track.id,
                    )
                    if (track) play(track)
                  }}
                />
              ))}
            </ul>
          </section>
        </DemoFrame>
      </Abs>
    </SceneShell>
  )
}
