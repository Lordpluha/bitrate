import type { ArtistDashboard } from '@entities/dashboard'
import type { I18n } from '@shared/i18n'

export type CurrentReleaseData = NonNullable<ArtistDashboard['currentRelease']>

/** What the artist does next with their current release, in the workspace language. */
export function nextStep(
  release: CurrentReleaseData,
  { t, tp }: Pick<I18n, 't' | 'tp'>,
) {
  const open = t('music.create.open')
  switch (release.status) {
    case 'DRAFT':
      return release.blockerCount > 0
        ? {
            title: t('dashboard.next.prepare'),
            detail: tp({
              count: release.blockerCount,
              key: 'dashboard.next.stepsLeft',
            }),
            label: t('dashboard.next.continue'),
          }
        : {
            title: t('workspace.next.submit'),
            detail: t('dashboard.next.ready'),
            label: t('dashboard.next.review'),
          }
    case 'SUBMITTED':
      return {
        title: t('dashboard.next.waiting'),
        detail: t('dashboard.next.waitingDescription'),
        label: t('workspace.next.viewReview'),
      }
    case 'REJECTED':
      return {
        title: t('workspace.next.rejected'),
        detail: t('workspace.next.rejectedDescription'),
        label: t('workspace.next.openFeedback'),
      }
    case 'READY':
      return {
        title: t('workspace.next.ready'),
        detail: t('workspace.next.readyDescription'),
        label: open,
      }
    case 'SCHEDULED':
      return {
        title: t('workspace.next.scheduled'),
        detail: t('workspace.next.scheduledDescription'),
        label: open,
      }
    case 'PUBLISHING':
      return {
        title: t('workspace.next.publishing'),
        detail: t('workspace.next.publishingDescription'),
        label: open,
      }
    case 'PUBLISH_FAILED':
      return {
        title: t('workspace.next.failed'),
        detail: t('workspace.next.failedDescription'),
        label: open,
      }
    case 'RELEASED':
      return {
        title: t('workspace.next.released'),
        detail: t('workspace.next.releasedDescription'),
        label: open,
      }
    case 'UNPUBLISHED':
      return {
        title: t('workspace.next.unpublished'),
        detail: t('workspace.next.unpublishedDescription'),
        label: open,
      }
  }
}
