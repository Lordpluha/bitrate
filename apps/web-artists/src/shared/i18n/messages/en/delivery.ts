export const delivery = {
  'delivery.availability.notConnected': 'Not connected',
  'delivery.availability.unavailable': 'Unavailable',
  'delivery.availability.notSent': 'Not sent',
  'delivery.availability.pending': 'Pending',
  'delivery.availability.live': 'Live',
  'delivery.availability.failed': 'Failed',
  'delivery.availability.takenDown': 'Taken down',
  'delivery.noStores': 'No stores planned',
  'delivery.worldwide': 'Worldwide',
  'delivery.countries.one': '{count} country',
  'delivery.countries.other': '{count} countries',
  'delivery.error.load': 'Could not load the delivery plan. Please try again.',
  'delivery.error.loadList': 'Could not load distribution. Please try again.',
  'delivery.error.stale':
    'This release changed or is no longer a draft. Your choices are kept here; close and reopen the form to review the latest version.',
  'delivery.error.unconfirmed':
    'Could not confirm the delivery plan was saved. Close this form and check the release before trying again.',
  'delivery.error.invalid':
    'Choose stores and valid countries, then try again.',
  'delivery.lock.planLive':
    'The release is live; its delivery plan can no longer change.',
  'delivery.lock.planPublishing':
    'The delivery plan is locked while the release is being published.',
  'delivery.lock.planRejected':
    'Start revising on the Review step to change the delivery plan.',
  'delivery.lock.planReview':
    'The delivery plan is locked while Bitrate reviews this release.',
  'delivery.lock.scheduleLive':
    'The release is live; its timing can no longer change.',
  'delivery.lock.schedulePublishing':
    'The release timing is locked while the release is being published.',
  'delivery.lock.scheduleRejected':
    'Start revising on the Review step to change the release timing.',
  'delivery.lock.scheduleReview':
    'The release timing is locked while Bitrate reviews this release.',
  'delivery.title': 'Delivery plan',
  'delivery.loading': 'Loading delivery plan…',
  'delivery.check.approved': 'Bitrate review approved',
  'delivery.check.premiere': 'Premiere {date} UTC',
  'delivery.check.rightAway': 'Goes live right away when published',
  'delivery.check.noStores': 'No stores planned yet',
  'delivery.editSchedule': 'Edit schedule',
  'delivery.timingIntro':
    'When and where the release goes out. It stays a plan until a distribution partner delivers it.',
  'delivery.dateUtc': '{date} UTC',
  'delivery.premiereHint': 'A premiere: it goes live at this date and time.',
  'delivery.territories': 'Territories',
  'delivery.territoriesHint':
    'Countries where listeners can find it. Change them in the delivery plan.',
  'delivery.destinations': 'Destinations',
  'delivery.plannedCount': '{planned} of {total} planned',
  'delivery.stores': 'Stores',
  'delivery.inPlan': 'In the plan',
  'delivery.notInPlan': 'Not in the plan',
  'delivery.beforeContinue': 'Before you continue',
  'delivery.next.sent':
    'Store states below are reported by the distribution partner.',
  'delivery.next.choose': 'Choose the stores and territories for this release.',
  'delivery.next.partner':
    'Delivery starts once a distribution partner is connected.',
  'delivery.editPlan': 'Edit delivery plan',
  'delivery.honest.sent': 'Delivery has started through the connected partner.',
  'delivery.honest.notSent':
    'Nothing has been sent. Saving this plan does not send the release to any external platform.',
  'delivery.noStoresShort': 'No stores planned.',
  'delivery.notInPlanSr': '(not in the plan)',
  'delivery.chooseCountry':
    'Choose at least one country, or deliver worldwide.',
  'delivery.savePlan': 'Save plan',
  'delivery.planIntro':
    'Plan where this release should go. Saving the plan sends nothing: delivery starts only once a distribution partner is connected.',
  'delivery.selectedCountries': 'Selected countries',
  'delivery.searchCountries': 'Search countries',
  'delivery.noCountries': 'No countries selected',
  'delivery.selected': '{count} selected: {names}',
  'delivery.noMatch': 'No country matches “{query}”.',
  'delivery.page.subtitle':
    'Where your releases are planned to go, and what stores report back.',
  'delivery.page.noPartner':
    'No distribution partner is connected yet, so nothing has been sent to a streaming service. You can already plan stores and territories; delivery starts once a partner is connected.',
  'delivery.page.loading': 'Loading distribution…',
  'delivery.page.empty':
    'No releases yet. Create a release to plan its delivery.',
  'delivery.page.openMusic': 'Open Music',
  'delivery.page.sent': 'Sent to partner',
  'delivery.page.pages': 'Distribution pages',
} as const
