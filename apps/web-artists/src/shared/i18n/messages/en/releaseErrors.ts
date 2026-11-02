/** Messages `entities/release` reports from API calls and its own validation. */
export const releaseErrors = {
  'release.error.stale':
    'This release changed or is no longer a draft. Your entries are kept here; close and reopen the form to review the latest version.',
  'release.error.gone': 'This release is no longer available.',
  'release.error.upcTaken': 'This UPC is already used by another release.',
  'release.error.isrcTaken': 'This ISRC is already used by another recording.',
  'release.error.loadRelease':
    'Could not load the latest release. Please try again.',
  'release.error.loadWorkspace':
    'Could not load this release workspace. Please try again.',
  'release.error.updateUnconfirmed':
    'Could not confirm your changes were saved. Close this form and check Music before trying again.',
  'release.error.updateInvalid': 'Check the release details, then try again.',
  'release.error.deleteUnconfirmed':
    'Could not confirm the draft was deleted. Check Music before trying again.',
  'release.error.deleteStale':
    'This release changed or is no longer a draft. Reload Music to see its latest status.',
  'release.error.createUnconfirmed':
    'Could not confirm your draft was saved. Check Music before trying again.',
  'release.error.createInvalid':
    'Check the release title and type, then try again.',
  'release.error.rightsInvalid':
    'Choose the master owner and enter their name, then try again.',
  'release.error.rightsUnconfirmed':
    'Could not confirm the rights were saved. Close this form and check the release before trying again.',
  'release.error.splitsInvalid':
    'Each share must be above 0%, the total cannot exceed 100%, and every person must be credited on this release.',
  'release.error.splitsUnconfirmed':
    'Could not confirm the splits were saved. Close this form and check the release before trying again.',
  'release.error.isrcInvalid': 'Enter an ISRC such as US-RC1-76-07839.',
  'release.error.isrcUnconfirmed':
    'Could not confirm the ISRC was saved. Close this form and check the tracks before trying again.',
  'release.error.submitUnconfirmed':
    'Review request was not confirmed. Your saved draft remains; check the release and try again.',
  'release.error.submitInvalid': 'Confirm that you reviewed this draft.',
  'release.error.submitBlocked':
    'Resolve the remaining blockers before submission.',
  'release.error.withdrawInvalid':
    'Could not withdraw this release. Please try again.',
  'release.error.withdrawUnconfirmed':
    'Could not confirm the withdrawal. Check the release before trying again.',
  'release.error.withdrawConflict':
    'This release changed or is no longer awaiting review. Reload it to see its latest status.',
  'release.error.reviseInvalid':
    'Could not reopen this release. Please try again.',
  'release.error.reviseUnconfirmed':
    'Could not confirm the release was reopened. Check it before trying again.',
  'release.error.reviseConflict':
    'This release changed or no changes were requested. Reload it to see its latest status.',
  'release.error.publishInvalid':
    'Could not publish this release. Please try again.',
  'release.error.publishUnconfirmed':
    'Could not confirm publishing started. Reload the release before trying again.',
  'release.error.publishConflict':
    'This release changed or is no longer ready to publish. Reload it to see its latest status.',
  'release.error.cancelInvalid':
    'Could not cancel the premiere. Please try again.',
  'release.error.cancelUnconfirmed':
    'Could not confirm the premiere was cancelled. Reload the release before trying again.',
  'release.error.cancelConflict':
    'This release changed or has no scheduled premiere. Reload it to see its latest status.',
  'release.error.unpublishInvalid':
    'Could not take this release offline. Please try again.',
  'release.error.unpublishUnconfirmed':
    'Could not confirm the release went offline. Reload it before trying again.',
  'release.error.unpublishConflict':
    'This release changed or is not live. Reload it to see its latest status.',
  'release.error.republishInvalid':
    'Could not publish this release again. Please try again.',
  'release.error.republishUnconfirmed':
    'Could not confirm the release is live again. Reload it before trying again.',
  'release.error.republishConflict':
    'This release changed or cannot be published again. Reload it to see its latest status.',
  'release.error.contributorGone':
    'This release or contributor is no longer available.',
  'release.error.loadContributor':
    'Could not load the latest contributor. Please try again.',
  'release.error.contributorUnconfirmed':
    'Could not confirm the contributor was saved. Close this form and check Participants before trying again.',
  'release.error.contributorInvalid':
    'Check the contributor name and roles, then try again.',
  'release.error.removeContributorInvalid':
    'Could not remove this contributor. Please try again.',
  'release.error.removeContributorUnconfirmed':
    'Could not confirm the contributor was removed. Check Participants before trying again.',
  'release.error.creditSelfInvalid':
    'Could not credit you on this release. Please try again.',
  'release.error.creditSelfUnconfirmed':
    'Could not confirm you were credited. Check Participants before trying again.',
  'release.error.creditSelfConflict':
    'This release changed or already credits someone. Close this and review Participants.',
  'release.error.fileTooLarge': 'This file is larger than the upload limit.',
  'release.error.coverInvalid': 'Choose a JPEG, PNG or WebP image up to 20 MB.',
  'release.error.coverUnconfirmed':
    'Could not confirm the artwork was saved. Close this window and check the release before trying again.',
  'release.error.coverRemoveInvalid':
    'Could not remove the artwork. Please try again.',
  'release.error.coverRemoveUnconfirmed':
    'Could not confirm the artwork was removed. Check the release before trying again.',
  'release.error.audioInvalid':
    'Choose a WAV, FLAC, MP3 or OGG file up to 512 MB.',
  'release.error.audioUnconfirmed':
    'Could not confirm the audio was saved. Close this window and check the tracks before trying again.',
  'release.error.recordingRemoveInvalid':
    'Could not remove this recording. Please try again.',
  'release.error.recordingRemoveUnconfirmed':
    'Could not confirm the recording was removed. Check the tracks before trying again.',
  'release.error.titleInvalid': 'Enter a title of up to 255 characters.',
  'release.error.titleUnconfirmed':
    'Could not confirm the title was saved. Close this window and check the tracks before trying again.',
  'release.error.reorderInvalid':
    'Could not save the new order. Please try again.',
  'release.error.reorderUnconfirmed':
    'Could not confirm the new order. Check the tracks before trying again.',
  'release.error.reorderChanged':
    'A recording was added or removed meanwhile. Reload to see the latest list.',
  'release.error.nameRequired': 'Enter a contributor name',
  'release.error.nameTooLong': 'Use 255 characters or fewer',
  'release.error.roleRequired': 'Choose at least one role',
  'release.error.roleOnce': 'Choose each role once',
} as const
