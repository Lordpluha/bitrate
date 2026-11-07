import { Button } from '@bitrate/ui-react'
import {
  releaseStatusLabels,
  releaseTypeLabels,
  StageRing,
} from '@entities/release'
import { Waveform } from '@features/now-playing/ui/Waveform'
import { useI18n } from '@shared/i18n'
import { Countdown, PanelIcon } from '@shared/ui'
import {
  ArrowRight,
  CircleAlert,
  Hash,
  LayoutGrid,
  Play,
  Timer,
} from 'lucide-react'

import {
  PREMIERE_AT,
  type StudioPreviewTab,
  WAVEFORM_PEAKS,
} from '../lib/studioPreview'

export function StudioDashboardPreview({
  onSelectTab,
}: {
  onSelectTab: (tab: StudioPreviewTab) => void
}) {
  const { t } = useI18n()
  return (
    <div className="artist-workspace-dashboard studio-preview-dashboard flex flex-col">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="studio-preview-title font-normal">
            {t('shell.nav.dashboard')}
          </p>
          <p className="mt-2 text-sm leading-[1.5] text-text-secondary lg:text-[0.9375rem]">
            {t('dashboard.subtitle')}
          </p>
        </div>
        <Button
          className="artist-layout-customize"
          size="sm"
          title={t('layout.customizeHint')}
          variant="outline"
        >
          <LayoutGrid aria-hidden="true" className="size-4" />
          <span className="artist-layout-customize-label">
            {t('layout.customize')}
          </span>
        </Button>
      </div>

      <div className="artist-layout">
        <div
          className="artist-layout-grid artist-dash-grid studio-preview-dashboard-grid"
          data-variant="thirds"
        >
          {/* 1:1 `CurrentReleaseTile` */}
          <div className="artist-layout-tile" data-size="M">
            <section
              aria-label={t('dashboard.current')}
              className="artist-release-workspace-panel artist-dash-current"
            >
              <div className="artist-dash-current-release">
                <img
                  alt="Night Signal cover"
                  className="artist-dash-current-cover"
                  src="/artwork/landing/night-signal.webp"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="artist-dash-current-title">Night Signal</p>
                    <span className="artist-release-chip" data-status="READY">
                      {t(releaseStatusLabels.READY)}
                    </span>
                  </div>
                  <p>
                    {t(releaseTypeLabels.EP)} ·{' '}
                    {t('dashboard.planned', { date: 'Nov 14, 2026' })}
                  </p>
                  <div
                    className="artist-track-player mt-3"
                    data-current={false}
                  >
                    <Button
                      aria-label={t('music.table.play', {
                        title: 'Night Signal',
                      })}
                      className="artist-track-player-toggle"
                      size="icon"
                      variant="primary"
                    >
                      <Play aria-hidden="true" className="size-4" />
                    </Button>
                    <Waveform
                      bars={120}
                      className="artist-track-player-wave"
                      currentTime={0}
                      duration={236}
                      label={t('music.player.seek', {
                        title: 'Night Signal',
                      })}
                      peaks={WAVEFORM_PEAKS}
                      progress={0}
                    />
                    <span className="artist-track-player-time">
                      0:00 / 3:56
                    </span>
                  </div>
                </div>
              </div>

              <div className="artist-dash-current-next">
                <StageRing
                  className="artist-dash-current-ring"
                  status="READY"
                />
                <div className="grid min-w-0 gap-2">
                  <h3>{t('workspace.next.ready')}</h3>
                  <p>{t('workspace.next.readyDescription')}</p>
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                    <Button
                      className="artist-workspace-primary rounded-full"
                      onClick={() => onSelectTab('workspace')}
                      variant="primary"
                    >
                      <ArrowRight aria-hidden="true" className="size-4" />
                      {t('music.create.open')}
                    </Button>
                    <p>{t('dashboard.draftSaved')}</p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* 1:1 `AttentionTile` */}
          <div className="artist-layout-tile" data-size="S">
            <section
              aria-label={t('dashboard.attention.title')}
              className="artist-release-workspace-panel artist-dash-attention"
            >
              <img
                alt=""
                aria-hidden="true"
                className="artist-dash-art"
                src="/artwork/dashboard/mastering-console.webp"
              />
              <div className="artist-dash-attention-head">
                <h2>
                  <PanelIcon icon={CircleAlert} />
                  {t('dashboard.attention.title')}
                </h2>
                <span>0</span>
              </div>
              <p className="mt-3">{t('dashboard.attention.clear')}</p>
            </section>
          </div>

          {/* 1:1 `NumbersTile` (`Your catalogue`) */}
          <div className="artist-layout-tile" data-size="M">
            <section
              aria-label={t('dashboard.numbers.title')}
              className="artist-release-workspace-panel artist-dash-catalogue"
            >
              <div className="artist-dash-catalogue-main">
                <h2>
                  <PanelIcon icon={Hash} />
                  {t('dashboard.numbers.title')}
                </h2>
                <dl className="artist-dash-numbers">
                  <div>
                    <dt>{t('dashboard.numbers.releases')}</dt>
                    <dd>4</dd>
                  </div>
                  <div>
                    <dt>{t('dashboard.numbers.tracks')}</dt>
                    <dd>6</dd>
                  </div>
                </dl>
                <div className="artist-dash-share">
                  <div aria-hidden="true" className="artist-dash-share-bar">
                    <span data-share="live" style={{ flexGrow: 2 }} />
                    <span data-share="review" style={{ flexGrow: 1 }} />
                    <span data-share="drafts" style={{ flexGrow: 1 }} />
                  </div>
                  <ul className="artist-dash-share-legend">
                    <li data-share="live">
                      {t('dashboard.numbers.live')} <b>2</b>
                    </li>
                    <li data-share="review">
                      {t('dashboard.numbers.review')} <b>1</b>
                    </li>
                    <li data-share="drafts">
                      {t('dashboard.numbers.drafts')} <b>1</b>
                    </li>
                  </ul>
                </div>
              </div>
              <div aria-hidden="true" className="artist-dash-fan">
                <img alt="" src="/demo/music/album-night-signal.webp" />
                <img alt="" src="/demo/music/album-afterglow.webp" />
                <img alt="" src="/demo/music/album-drift-control.webp" />
                <img alt="" src="/demo/music/album-static-lines.webp" />
              </div>
            </section>
          </div>

          {/* 1:1 `PremiereTile` */}
          <div className="artist-layout-tile" data-size="S">
            <section
              aria-label={t('dashboard.premiere.title')}
              className="artist-release-workspace-panel artist-dash-premiere"
            >
              <span aria-hidden="true" className="artist-cover-wash">
                <img alt="" src="/artwork/landing/night-signal.webp" />
              </span>
              <h2>
                <PanelIcon icon={Timer} />
                {t('dashboard.premiere.title')}
              </h2>
              <ul className="artist-dash-premiere-list">
                <li>
                  <a href="#landing-studio-stage">
                    <img alt="" src="/artwork/landing/night-signal.webp" />
                    <span className="artist-dash-premiere-meta">
                      <span className="artist-release-row-title">
                        Night Signal
                      </span>
                      <time dateTime="2026-11-14T18:00:00.000Z">
                        Sat, Nov 14, 6:00 PM UTC
                      </time>
                      <span
                        className="artist-dash-releases-status"
                        data-status="READY"
                      >
                        {t(releaseStatusLabels.READY)}
                      </span>
                    </span>
                  </a>
                </li>
              </ul>
              <Countdown to={PREMIERE_AT} />
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
