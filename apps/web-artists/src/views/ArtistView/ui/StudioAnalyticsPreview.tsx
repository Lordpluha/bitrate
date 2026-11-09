import { Button, cn } from '@bitrate/ui-react'
import { useI18n } from '@shared/i18n'
import { PanelIcon } from '@shared/ui'
import { Change, StatTile } from '@views/AnalyticsView/ui/AnalyticsParts'
import { PlaysChart } from '@views/AnalyticsView/ui/PlaysChart'
import {
  Flame,
  Headphones,
  LayoutGrid,
  Repeat,
  Trophy,
  Users,
} from 'lucide-react'

import { DEMO_DAILY_PLAYS } from '../lib/studioPreview'

export function StudioAnalyticsPreview() {
  const { t, tp } = useI18n()
  return (
    <section className="artist-music studio-preview-analytics">
      <div className="artist-release-workspace-panel artist-analytics-hero">
        <img
          alt=""
          aria-hidden="true"
          className="artist-dash-art"
          src="/artwork/analytics/analytics-spectrum.webp"
        />
        <div>
          <p className="studio-preview-title font-normal">
            {t('shell.nav.analytics')}
          </p>
          <p className="artist-analytics-hero-subtitle">
            {t('analytics.subtitle')}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
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
          <nav
            aria-label={t('analytics.period')}
            className="flex gap-0.5 rounded-lg border border-border bg-secondary p-0.5"
          >
            {([7, 28, 90] as const).map((period) => (
              <span
                className={cn(
                  'flex min-h-9 items-center rounded-md border border-transparent px-3.5 text-sm transition-colors',
                  period === 28
                    ? 'border-primary bg-card text-foreground'
                    : 'text-text-secondary',
                )}
                key={period}
              >
                {tp({ count: period, key: 'analytics.days' })}
              </span>
            ))}
          </nav>
        </div>
      </div>

      <div className="artist-layout">
        <div
          className="artist-layout-grid studio-preview-analytics-grid"
          data-variant="thirds"
        >
          <div className="artist-layout-tile" data-size="M">
            <section
              aria-label={t('analytics.plays')}
              className="artist-release-workspace-panel"
            >
              <h2 className="artist-analytics-label">
                <PanelIcon icon={Headphones} />
                {t('analytics.plays')}
              </h2>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                <p className="artist-analytics-hero-value">14,820</p>
                <Change current={14820} previous={11240} />
              </div>
              <PlaysChart
                daily={DEMO_DAILY_PLAYS}
                formatDay={(d) => d.slice(5)}
                formatNumber={(n) => n.toLocaleString('en-US')}
              />
            </section>
          </div>

          <div className="artist-layout-tile" data-size="S">
            <div className="artist-analytics-side">
              <StatTile
                hue="blue"
                icon={Users}
                label={t('analytics.listeners')}
              >
                <p className="artist-analytics-value">4,390</p>
                <Change current={4390} previous={3610} />
              </StatTile>
              <StatTile
                hue="purple"
                icon={Repeat}
                label={t('analytics.perListener')}
              >
                <p className="artist-analytics-value">3.4</p>
                <p className="artist-analytics-hint">
                  {t('analytics.perListenerHint')}
                </p>
              </StatTile>
              <StatTile hue="amber" icon={Flame} label={t('analytics.bestDay')}>
                <p className="artist-analytics-value">11-05</p>
                <p className="artist-analytics-hint">1,040 plays</p>
              </StatTile>
            </div>
          </div>

          {/* 1:1 `TopTracks` tile */}
          <div className="artist-layout-tile" data-size="M">
            <section
              aria-label={t('analytics.top')}
              className="artist-release-workspace-panel artist-analytics-top-tile"
            >
              <span aria-hidden="true" className="artist-cover-wash">
                <img alt="" src="/demo/music/album-night-signal.webp" />
              </span>
              <h2>
                <PanelIcon icon={Trophy} />
                {t('analytics.top')}
              </h2>
              <section
                aria-label={t('analytics.top')}
                className="artist-analytics-table-scroll"
              >
                <table className="artist-analytics-top">
                  <thead>
                    <tr>
                      <th scope="col">
                        <span className="sr-only">#</span>
                      </th>
                      <th scope="col">{t('music.table.track')}</th>
                      <th scope="col">{t('analytics.plays')}</th>
                      <th scope="col">{t('analytics.listeners')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      {
                        rank: 1,
                        title: 'Night Signal',
                        cover: '/demo/music/album-night-signal.webp',
                        plays: '6,420',
                        listeners: '2,180',
                        width: '100%',
                      },
                      {
                        rank: 2,
                        title: 'Echoes in Motion',
                        cover: '/demo/music/album-echoes-in-motion.webp',
                        plays: '4,890',
                        listeners: '1,640',
                        width: '76%',
                      },
                      {
                        rank: 3,
                        title: 'Afterglow',
                        cover: '/demo/music/album-afterglow.webp',
                        plays: '3,510',
                        listeners: '1,120',
                        width: '55%',
                      },
                    ].map((track) => (
                      <tr key={track.title}>
                        <td className="artist-analytics-rank">{track.rank}</td>
                        <td className="min-w-0">
                          <span className="artist-analytics-track">
                            <img alt="" src={track.cover} />
                            <span className="min-w-0">
                              <span className="block truncate">
                                {track.title}
                              </span>
                              <span
                                aria-hidden="true"
                                className="artist-analytics-bar"
                              >
                                <span style={{ width: track.width }} />
                              </span>
                            </span>
                          </span>
                        </td>
                        <td className="tabular-nums">{track.plays}</td>
                        <td className="tabular-nums text-text-secondary">
                          {track.listeners}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            </section>
          </div>
        </div>
      </div>
    </section>
  )
}
