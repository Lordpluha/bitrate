// Release statuses as the release workspace shows them: the header chip (labels.ts releaseStatus,
// nextAction.ts statusIcons), the next action (nextAction.ts) and the stage progress (stages.ts).

const DRAFT = { draft: 'Current', review: 'Upcoming', deliver: 'Upcoming', launch: 'Upcoming' }
const IN_REVIEW = { draft: 'Done', review: 'Current', deliver: 'Upcoming', launch: 'Upcoming' }
const APPROVED = { draft: 'Done', review: 'Done', deliver: 'Optional', launch: 'Current' }
const LIVE = { draft: 'Done', review: 'Done', deliver: 'Done', launch: 'Current' }

/* key → [chip tone, chip label, chip icon, next title, next detail, next action, stage progress] */
export const STATUS = {
  draft: [
    'Neutral',
    'Draft',
    'pencil-line',
    'Finish preparing your release',
    '3 items are left before Bitrate review.',
    'Continue',
    DRAFT,
  ],
  draftReady: [
    'Neutral',
    'Draft',
    'pencil-line',
    'Submit for Bitrate review',
    'Everything required is ready. Confirm and submit.',
    'Review and submit',
    DRAFT,
  ],
  submitted: [
    'Processing',
    'Submitted',
    'clock',
    'Waiting for a reviewer',
    'You will be notified when Bitrate decides.',
    'View review',
    IN_REVIEW,
  ],
  rejected: [
    'Error',
    'Rejected',
    'circle-alert',
    'Address the requested changes',
    'Bitrate asked for changes before approval.',
    'Open feedback',
    IN_REVIEW,
  ],
  approved: [
    'Ready',
    'Ready',
    'circle-check',
    'Publish on Bitrate',
    'Approved by Bitrate. Publish when you are ready.',
    'Open launch',
    APPROVED,
  ],
  scheduled: [
    'Ready',
    'Scheduled',
    'clock',
    'Premiere scheduled',
    'Your release goes live on Bitrate at the premiere time.',
    'Open launch',
    APPROVED,
  ],
  publishing: [
    'Processing',
    'Publishing',
    'clock',
    'Publishing on Bitrate',
    'Your tracks are being prepared for the player.',
    'Open launch',
    APPROVED,
  ],
  failed: [
    'Error',
    'Publishing failed',
    'circle-alert',
    'Publishing failed',
    'Bitrate has been notified and will retry.',
    'Open launch',
    APPROVED,
  ],
  released: [
    'Ready',
    'Released',
    'circle-check',
    'Your release is live on Bitrate',
    'Share it and follow the first signals.',
    'Open launch',
    LIVE,
  ],
  unpublished: [
    'Neutral',
    'Unpublished',
    'circle-alert',
    'Your release is offline',
    'Listeners cannot play it until it is published again.',
    'Open launch',
    LIVE,
  ],
}

/** Live once or offline: the release accepts post-publication changes (ReleaseChangesPanel). */
export const acceptsChanges = (status) => status === 'released' || status === 'unpublished'
