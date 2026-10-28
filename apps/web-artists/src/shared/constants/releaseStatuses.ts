import type { ApiSchemas } from '@bitrate/contracts'

/** Every release status the API reports; schemas accept all of them so a new state never breaks a page. */
export const releaseStatuses = [
  'DRAFT',
  'SUBMITTED',
  'REJECTED',
  'READY',
  'SCHEDULED',
  'PUBLISHING',
  'PUBLISH_FAILED',
  'RELEASED',
  'UNPUBLISHED',
] as const satisfies readonly ApiSchemas['ReleaseStatus'][]
