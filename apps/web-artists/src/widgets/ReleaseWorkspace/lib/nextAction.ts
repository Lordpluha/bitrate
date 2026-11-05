import type { ReleaseStage, ReleaseWorkspace } from '@entities/release'
import type { I18n, Translate } from '@shared/i18n'
import {
  CircleAlert,
  CircleCheck,
  Clock,
  type LucideIcon,
  PencilLine,
} from 'lucide-react'
import type { WorkspaceAction } from '../model/workspaceAction'

type Status = ReleaseWorkspace['status']

export const statusIcons: Record<Status, LucideIcon> = {
  DRAFT: PencilLine,
  SUBMITTED: Clock,
  REJECTED: CircleAlert,
  READY: CircleCheck,
  SCHEDULED: Clock,
  PUBLISHING: Clock,
  PUBLISH_FAILED: CircleAlert,
  RELEASED: CircleCheck,
  UNPUBLISHED: CircleAlert,
}

interface NextAction {
  title: string
  description: string
  label: string
  stage: ReleaseStage
  /** Section of that stage to scroll to. */
  hash?: string
  /** Opens this dialog on the page instead of navigating. */
  dialog?: WorkspaceAction
}

export function nextAction(
  release: ReleaseWorkspace,
  t: Translate,
  tp: I18n['tp'],
): NextAction {
  const blockers = release.readiness.blockers.length
  const launch = {
    label: t('workspace.next.openLaunch'),
    stage: 'launch',
  } as const
  switch (release.status) {
    case 'DRAFT':
      return blockers > 0
        ? {
            title: t('workspace.next.prepare'),
            description: tp({
              count: blockers,
              key: 'workspace.next.itemsLeft',
            }),
            label: t('common.continue'),
            stage: 'draft',
            hash: 'release-checklist-heading',
          }
        : {
            title: t('workspace.next.submit'),
            description: t('workspace.next.submitDescription'),
            label: t('workspace.next.submitLabel'),
            stage: 'draft',
            hash: 'release-submit-heading',
            dialog: { kind: 'submit' },
          }
    case 'SUBMITTED':
      return {
        title: t('workspace.review.waiting'),
        description: t('workspace.next.waitingDescription'),
        label: t('workspace.next.viewReview'),
        stage: 'review',
      }
    case 'REJECTED':
      return {
        title: t('workspace.next.rejected'),
        description: t('workspace.next.rejectedDescription'),
        label: t('workspace.next.openFeedback'),
        stage: 'review',
      }
    case 'READY':
      return {
        title: t('workspace.next.ready'),
        description: t('workspace.next.readyDescription'),
        ...launch,
      }
    case 'SCHEDULED':
      return {
        title: t('workspace.next.scheduled'),
        description: t('workspace.next.scheduledDescription'),
        ...launch,
      }
    case 'PUBLISHING':
      return {
        title: t('workspace.next.publishing'),
        description: t('workspace.next.publishingDescription'),
        ...launch,
      }
    case 'PUBLISH_FAILED':
      return {
        title: t('workspace.next.failed'),
        description: t('workspace.next.failedDescription'),
        ...launch,
      }
    case 'RELEASED':
      return {
        title: t('workspace.next.released'),
        description: t('workspace.next.releasedDescription'),
        ...launch,
      }
    case 'UNPUBLISHED':
      return {
        title: t('workspace.next.unpublished'),
        description: t('workspace.next.unpublishedDescription'),
        ...launch,
      }
  }
}
