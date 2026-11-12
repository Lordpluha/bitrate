export const releaseChanges = {
  'releaseChanges.field.RELEASE_TITLE': 'Release title',
  'releaseChanges.field.RELEASE_COVER': 'Cover',
  'releaseChanges.field.RECORDING_TITLE': 'Recording title',
  'releaseChanges.status.PENDING': 'In review',
  'releaseChanges.status.APPROVED': 'Approved',
  'releaseChanges.status.REJECTED': 'Rejected',
  'releaseChanges.status.WITHDRAWN': 'Withdrawn',
  'releaseChanges.status.CANCELLED': 'Cancelled',
  'releaseChanges.panel.title': 'Changes after publication',
  'releaseChanges.panel.hint':
    'Listeners keep seeing the current title and cover until Bitrate approves each change.',
  'releaseChanges.panel.empty': 'No changes proposed yet.',
  'releaseChanges.propose': 'Propose changes',
  'releaseChanges.renameRecording': 'Change title',
  'releaseChanges.withdraw': 'Withdraw',
  'releaseChanges.withdrawing': 'Withdrawing…',
  'releaseChanges.reviewerReason': 'Why it was rejected',
  'releaseChanges.reviewerComment': 'Comment from Bitrate',
  'releaseChanges.coverGone': 'Not kept',
  'releaseChanges.pendingBadge': 'Change in review',
  'releaseChanges.dialog.title': 'Propose changes to {title}',
  'releaseChanges.dialog.renameTitle': 'Change the title of {title}',
  'releaseChanges.dialog.intro':
    'Listeners keep seeing the current values until Bitrate approves each change. Leave a field as it is to keep it.',
  'releaseChanges.dialog.releaseTitle': 'Release title',
  'releaseChanges.dialog.cover': 'New cover',
  'releaseChanges.dialog.coverHint':
    'JPEG, PNG or WebP up to 20 MB. The cover is shared by every recording of this release.',
  'releaseChanges.dialog.recordings': 'Recording titles',
  'releaseChanges.dialog.recordingWarning':
    'A new recording title appears in every release and compilation that includes the recording.',
  'releaseChanges.dialog.recordingTitle': 'New title',
  'releaseChanges.dialog.pendingField': 'A change is already in review',
  'releaseChanges.dialog.submit': 'Send for review',
  'releaseChanges.dialog.sending': 'Sending…',
  'releaseChanges.form.titleRequired': 'Enter a title',
  'releaseChanges.form.titleTooLong': 'Use at most 255 characters',
  'releaseChanges.form.nothingChanged': 'Change at least one value',
  'releaseChanges.error.load': 'Could not load the proposed changes',
  'releaseChanges.error.invalid': 'Check the values and try again',
  'releaseChanges.error.unconfirmed':
    'We could not confirm the request. Reload the page to see whether it was saved.',
  'releaseChanges.error.conflict':
    'The release changed in the meantime. Reload the page and try again.',
  'releaseChanges.error.notAllowed':
    'Changes can be proposed only for a live release or one you took offline.',
  'releaseChanges.error.unchanged': 'A proposed value matches the current one.',
  'releaseChanges.error.alreadyPending':
    'A change to this title, cover or recording is already in review.',
  'releaseChanges.error.notPending':
    'Nothing in this request is waiting for review any more.',
  'releaseChanges.error.recordingLocked':
    'This recording can be renamed only from the release it first came out in.',
  'releaseChanges.loading': 'Loading the release…',
  'releaseChanges.sent': 'Sent for review',
  'releaseChanges.withdrawn': 'Request withdrawn',
} as const
