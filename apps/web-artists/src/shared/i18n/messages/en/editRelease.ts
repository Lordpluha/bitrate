export const editRelease = {
  'editRelease.loadingDraft': 'Loading the latest draft…',
  'editRelease.notEditable':
    'This release can no longer be edited here. Close the form and refresh Music to review its status.',
  'editRelease.editContributor': 'Edit contributor',
  'editRelease.loadingContributor': 'Loading the latest contributor…',
  'editRelease.notDraft':
    'This release is no longer a draft. Close the form and refresh Music to review its status.',
  'editRelease.deleteConfirm':
    'Delete {title} and its recordings? This cannot be undone.',
  'editRelease.keepDraft': 'Keep draft',
  'editRelease.deleting': 'Deleting…',
  'editRelease.editIntro':
    'Update the draft title and release type. Your music stays unpublished. Artwork and tracks are edited in the release workspace.',
  'editRelease.saveChanges': 'Save changes',
  'editRelease.savingChanges': 'Saving changes…',
  'editRelease.removeConfirm':
    'Remove {name} from the release? Their master and publishing shares are removed, so the splits must add up to 100% again.',
  'editRelease.thisContributor': 'this contributor',
  'editRelease.keepContributor': 'Keep contributor',
  'editRelease.removing': 'Removing…',
  'editRelease.creditSelf':
    'Credit {name} as performer, composer and lyricist with 100% of the master and publishing splits. You can add collaborators and divide the shares later.',
  'editRelease.crediting': 'Crediting…',
  'editRelease.creditMe': 'Credit me alone',
  'editRelease.contributorIntro':
    'Credit a person involved in this release and assign at least one role.',
  'editRelease.contributorName': 'Contributor name',
  'editRelease.roles': 'Assigned roles',
  'editRelease.rolesHint': 'Choose at least one role.',
  'editRelease.contributorNote':
    'Credits do not grant workspace access. Shares are set in the master and publishing splits.',
  'editRelease.saveContributor': 'Save contributor',
  'editRelease.savingContributor': 'Saving contributor…',
  'editRelease.saveCode': 'Save code',
  'editRelease.upcTitle': 'Release barcode',
  'editRelease.upcLabel': 'Release UPC/EAN',
  'editRelease.upcHint':
    'Optional. 12-digit UPC or 13-digit EAN. Leave empty if your distributor will assign one.',
  'editRelease.upcInvalid': 'Enter 12 or 13 digits with a valid check digit.',
  'editRelease.isrcTitle': 'Recording ISRC',
  'editRelease.isrcLabel': 'ISRC for {title}',
  'editRelease.thisRecording': 'this recording',
  'editRelease.isrcHint':
    'Optional. Format CC-XXX-YY-NNNNN. Leave empty if your distributor will assign one.',
  'editRelease.rightsTitle': 'Rights confirmation',
  'editRelease.rightsIntro':
    'Confirm what is true for this draft before review.',
  'editRelease.masterQuestion': 'Who controls the master recording?',
  'editRelease.otherOwner': 'Another owner, such as a label',
  'editRelease.ownerName': 'Master owner name',
  'editRelease.ownerTypeRequired': 'Choose who controls the master recording.',
  'editRelease.ownerNameRequired': 'Enter the master owner’s name.',
  'editRelease.confirmation': 'Confirmation',
  'editRelease.rightsNote':
    'Changing contributors later clears this confirmation. You confirm the whole draft is accurate once, when you submit it for review.',
  'editRelease.saveRights': 'Save rights',
  'editRelease.savingRights': 'Saving rights…',
  'editRelease.rightAway': 'Right away',
  'editRelease.rightAwayHint': 'It goes live as soon as you publish it.',
  'editRelease.premiere': 'Premiere on a date',
  'editRelease.premiereHint': 'It goes live at the date and time you choose.',
  'editRelease.timingIntro':
    'Choose when listeners can hear it. You can change this until the release is published.',
  'editRelease.whenToRelease': 'When to release',
  'editRelease.releaseDate': 'Release date',
  'editRelease.timeUtc': 'Time (UTC)',
  'editRelease.timeZone': 'Time zone: UTC.',
  'editRelease.dateInvalid': 'Choose a valid release date.',
  'editRelease.timeInvalid': 'Choose a valid time in UTC.',
  'editRelease.saveSchedule': 'Save schedule',
  'editRelease.savingSchedule': 'Saving schedule…',
  'editRelease.splitsTitle': 'Splits',
  'editRelease.splitsIntro':
    '{master} is the money from the recording itself; {publishing} is the money for the music and lyrics. Each column must reach exactly 100% before review; a draft can stay below.',
  'editRelease.masterTerm': 'Master',
  'editRelease.publishingTerm': 'publishing',
  'editRelease.noContributors': 'Add contributors before assigning splits.',
  'editRelease.sharesLegend': 'Shares in percent',
  'editRelease.contributor': 'Contributor',
  'editRelease.shareLabel': '{name} {right} share',
  'editRelease.shareFormat':
    '{right}: use a share between 0.01% and 100% with up to two decimals.',
  'editRelease.shareOverflow': '{right} shares cannot exceed 100%.',
  'editRelease.total': '{right} total {total} of 100%',
  'editRelease.saveSplits': 'Save splits',
  'editRelease.savingSplits': 'Saving splits…',
} as const
