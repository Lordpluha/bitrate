import { Button } from '@bitrate/ui-react'
import {
  participantRoleLabels,
  releaseTypeLabels,
  rightTypeLabels,
} from '@entities/release'
import { useI18n } from '@shared/i18n'
import { ROUTES } from '@shared/routes/routes'
import { PanelIcon } from '@shared/ui'
import { Link } from '@tanstack/react-router'
import {
  ArrowLeft,
  ArrowUpRight,
  CircleCheck,
  ShieldCheck,
  UsersRound,
  X,
} from 'lucide-react'
import { useEffect, useRef } from 'react'

export type StudioDetail =
  | 'details'
  | 'timing'
  | 'artwork'
  | 'credits'
  | 'rights'
export function StudioReleaseDetails({
  kind,
  onClose,
}: {
  kind: StudioDetail
  onClose: () => void
}) {
  const { t } = useI18n()
  const closeRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    closeRef.current?.focus({ preventScroll: true })
  }, [])
  const titleKeys = {
    details: 'release.roadmap.details',
    timing: 'release.roadmap.timing',
    artwork: 'release.roadmap.artwork',
    credits: 'workspace.credits.title',
    rights: 'workspace.rights.title',
  } as const
  const title = t(titleKeys[kind])
  return (
    <section
      aria-label={title}
      aria-modal="false"
      className="studio-preview-detail"
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          event.stopPropagation()
          onClose()
        }
      }}
      role="dialog"
    >
      <header>
        <Button
          className="studio-preview-detail-control"
          onClick={onClose}
          ref={closeRef}
          size="sm"
          variant="ghost"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          {t('landing.preview.back')}
        </Button>
        <h3 className="studio-preview-detail-title">{title}</h3>
        <Button
          aria-label={t('common.closeDialog')}
          className="studio-preview-detail-control"
          onClick={onClose}
          size="icon"
          variant="ghost"
        >
          <X aria-hidden="true" className="size-4" />
        </Button>
      </header>
      <div className="studio-preview-detail-body">
        {kind === 'credits' ? (
          <section
            aria-label={t('workspace.credits.title')}
            className="artist-release-workspace-panel artist-release-participants"
            data-hue="purple"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2>
                <PanelIcon icon={UsersRound} />
                {t('workspace.credits.title')} <span>(2)</span>
              </h2>
            </div>
            <p>{t('workspace.credits.description')}</p>
            <ul
              aria-label={t('workspace.credits.totals')}
              className="artist-release-credit-totals"
            >
              <li data-done={true}>
                <CircleCheck aria-hidden="true" />
                {t('workspace.credits.total', {
                  right: t(rightTypeLabels.RECORDING),
                  percent: 100,
                })}
              </li>
              <li data-done={true}>
                <CircleCheck aria-hidden="true" />
                {t('workspace.credits.total', {
                  right: t(rightTypeLabels.COMPOSITION),
                  percent: 100,
                })}
              </li>
            </ul>
            <ul className="artist-release-credit-list">
              {[
                {
                  name: 'Mira Sol',
                  roles: `${t(participantRoleLabels.PERFORMER)} · ${t(participantRoleLabels.PRODUCER)}`,
                  shares: `${t(rightTypeLabels.RECORDING)} 75% · ${t(rightTypeLabels.COMPOSITION)} 75%`,
                },
                {
                  name: 'Kite Harbor',
                  roles: t(participantRoleLabels.COMPOSER),
                  shares: `${t(rightTypeLabels.RECORDING)} 25% · ${t(rightTypeLabels.COMPOSITION)} 25%`,
                },
              ].map((person) => (
                <li data-missing-role={false} key={person.name}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h3>{person.name}</h3>
                      <p>{person.roles}</p>
                      <p>{person.shares}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <p className="artist-release-footnote">
              {t('workspace.credits.footnote')}
            </p>
          </section>
        ) : kind === 'rights' ? (
          <section
            aria-label={t('workspace.rights.title')}
            className="artist-release-workspace-panel artist-release-rights"
            data-hue="blue"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2>
                <PanelIcon icon={ShieldCheck} />
                {t('workspace.rights.title')}
              </h2>
            </div>
            <p>{t('workspace.rights.description')}</p>
            <ul className="artist-release-rights-list">
              <li data-done={true}>
                <CircleCheck aria-hidden="true" />
                <span>
                  {t('workspace.rights.masterOwner', {
                    owner: t('workspace.rights.thisArtist', {
                      name: 'Mira Sol',
                    }),
                  })}
                </span>
              </li>
            </ul>
            <div className="artist-release-identifiers">
              <h3>
                {t('workspace.rights.identifiers')}{' '}
                <span>{t('workspace.rights.optional')}</span>
              </h3>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p>
                  {t('workspace.rights.upc')} <span>196589402184</span>
                </p>
              </div>
              <p>{t('workspace.rights.identifiersNote')}</p>
            </div>
          </section>
        ) : (
          <div className="studio-preview-detail-summary">
            <img
              alt=""
              className="studio-preview-detail-artwork"
              src="/artwork/landing/night-signal.webp"
            />
            <h3>Night Signal</h3>
            <p>
              {kind === 'timing'
                ? t('release.roadmap.premiere', {
                    date: 'Nov 14, 2026, 6:00 PM',
                  })
                : `Mira Sol · ${t(releaseTypeLabels.SINGLE)}`}
            </p>
            <span className="artist-release-chip" data-status="READY">
              {t('workspace.ready')}
            </span>
          </div>
        )}
        <Link
          className="studio-preview-detail-cta"
          to={ROUTES.auth.registration}
        >
          {t('landing.createAccount')}
          <ArrowUpRight aria-hidden="true" className="size-4" />
        </Link>
      </div>
    </section>
  )
}
