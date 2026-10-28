import type { ReleaseWorkspace } from '@entities/release'

type Status = ReleaseWorkspace['status']

/** Why draft content cannot be edited in `status`, or `null` while it is still a draft. */
export function editLockReason(status: Status): string | null {
  switch (status) {
    case 'DRAFT':
      return null
    case 'SUBMITTED':
      return 'Locked while Bitrate reviews this release. Withdraw it from review to edit.'
    case 'REJECTED':
      return 'Choose Start revising on the Review step to edit the draft.'
    case 'READY':
    case 'SCHEDULED':
    case 'PUBLISHING':
    case 'PUBLISH_FAILED':
      return 'Approved releases can no longer be edited.'
    case 'RELEASED':
    case 'UNPUBLISHED':
      return 'Released releases can no longer be edited.'
  }
}
