import type { ReleaseWorkspace } from '@entities/release'
import type { TranslationKey } from '@shared/i18n'

type Status = ReleaseWorkspace['status']

/**
 * Why draft content cannot be edited in `status`, as a catalog key, or `null` while it is
 * still a draft.
 */
export function editLockReason(status: Status): TranslationKey | null {
  switch (status) {
    case 'DRAFT':
      return null
    case 'SUBMITTED':
      return 'workspace.lock.submitted'
    case 'REJECTED':
      return 'workspace.lock.rejected'
    case 'READY':
    case 'SCHEDULED':
    case 'PUBLISHING':
    case 'PUBLISH_FAILED':
      return 'workspace.lock.approved'
    case 'RELEASED':
    case 'UNPUBLISHED':
      return 'workspace.lock.released'
  }
}
