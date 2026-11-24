/**
 * Deletes support conversations 90 days after their last message (#567, Privacy Policy). One
 * job scheduler in the API process; the sweep is idempotent.
 */
export const SUPPORT_RETENTION_QUEUE = 'support-retention'
export const SUPPORT_RETENTION_JOB = 'purge'
export const SUPPORT_RETENTION_SCHEDULER_ID = 'support-retention-purge'
export const SUPPORT_RETENTION_EVERY_MS = 6 * 60 * 60 * 1000
