'use client'

import { TracksList } from '@entities/Track'
import { useI18n } from '@shared/i18n'
import { SectionHeader } from '@shared/ui'
import { MobileIsland } from '@widgets/MobileIsland'
import { RightSidebar } from '@widgets/RightSidebar'
import { lc } from '../../lib/styles/lc'
import { DEMO_PLAYLISTS } from '../../model/demo/demoData'
import { DEMO_TRACK_SETS } from '../../model/demo/demoSeeds'
import type { LandingKey } from '../../model/messages/en'
import { useLandingCopy } from '../../model/useLandingCopy'
import { DemoFrame } from '../demo/DemoFrame'
import { DemoPlayerBar } from '../demo/DemoPlayerBar'
import { DeviceScreen } from '../demo/DeviceScreen'
import { Abs, SceneShell, TryInPlayer } from './parts'

/** The scene's two points: icon id, title and line. */
const POINTS: readonly (readonly [string, LandingKey, LandingKey])[] = [
  ['#i-layers', 'devices.now_playing_panel', 'devices.now_playing_panel_meta'],
  ['#i-phone', 'devices.mobile_island', 'devices.mobile_island_meta'],
]

/** The phone the island and sidebar are designed for (CSS pixels). */
const PHONE_WIDTH = 390

/** Scene "Devices": the desktop player with its Now Playing panel, and the phone's island. */
export const SceneDevices = () => {
  const c = useLandingCopy()
  const { t } = useI18n()
  const playlist = DEMO_PLAYLISTS[0]

  return (
    <SceneShell id="devices" labelKey="devices.same_queue_new_scene">
      <Abs h={274} markers="d-only" w={380} x={0} y={626}>
        <div className={lc('horizon', 'h-full')}></div>
      </Abs>
      <Abs w={280} x={48} y={120}>
        <div className={lc('eyebrow', 'mb-[18px]')} data-a="up">
          {c('devices.desktop_and_phone')}
        </div>
        <h2 className={lc('h h54')}>
          <span className={lc('line')}>
            <span>{c('devices.same_queue')}</span>
          </span>
          <span className={lc('line')}>
            <span className={lc('hl')}>{c('devices.new_scene')}</span>
          </span>
        </h2>
        <p className={lc('lede s', 'mt-[22px]')} data-a="up">
          {c('devices.lede')}
        </p>
        <div className="mt-[14px]" data-a="up">
          <TryInPlayer />
        </div>
        <div className={lc('col d-only', 'mt-[34px] gap-[20px]')}>
          {POINTS.map(([icon, title, meta]) => (
            <div className={lc('row', 'items-start')} data-a="up" key={title}>
              <svg aria-hidden="true" className={lc('i', 'text-accent')}>
                <use href={icon} />
              </svg>
              <div>
                <p className={lc('t-title')}>{c(title)}</p>
                <p className={lc('t-meta')}>{c(meta)}</p>
              </div>
            </div>
          ))}
        </div>
      </Abs>
      <Abs
        data-a="up"
        extra="justify-end"
        markers="row d-only"
        w={732}
        x={676}
        y={78}
      >
        <span className={lc('live')}>
          <i></i>
          <span
            className={lc('glitch glitch-auto label')}
            data-text={c('devices.now_playing_live')}
          >
            {c('devices.now_playing_live')}
          </span>
        </span>
      </Abs>
      <Abs data-a="win" h={716} markers="win d-only" w={732} x={676} y={116}>
        <DemoFrame
          className="flex h-full flex-col gap-4 p-4"
          label={t('queue.nowPlaying')}
        >
          <div className="flex min-h-0 flex-1 gap-4">
            <div className="flex min-w-0 flex-1 flex-col overflow-hidden pt-2">
              <SectionHeader title={playlist?.title ?? t('common.playlist')} />
              <TracksList
                layout="rows"
                showDateAdded={false}
                tracks={[...DEMO_TRACK_SETS.preview]}
              />
            </div>
            <div className="w-70 shrink-0 overflow-hidden rounded-[14px] bg-card">
              <RightSidebar showQueue={false} />
            </div>
          </div>
          <DemoPlayerBar className="shrink-0 shadow-none" compact />
        </DemoFrame>
      </Abs>
      <Abs
        data-a="win"
        extra="z-[2]"
        h={600}
        markers="phone"
        w={300}
        x={352}
        y={196}
      >
        <DemoFrame
          className="h-full rounded-[24px] max-[820px]:mx-auto max-[820px]:h-[min(56vh,calc(100svh-360px))] max-[820px]:min-h-[260px] max-[820px]:max-w-[300px]"
          label={t('nav.main')}
        >
          {/* laid out at a real phone's width, then scaled into the frame */}
          <DeviceScreen width={PHONE_WIDTH}>
            <div className="h-full overflow-hidden pb-24">
              <RightSidebar />
            </div>
            <MobileIsland
              className="absolute inset-x-4 bottom-4 z-10"
              onExpand={() => undefined}
            />
          </DeviceScreen>
        </DemoFrame>
      </Abs>
    </SceneShell>
  )
}
