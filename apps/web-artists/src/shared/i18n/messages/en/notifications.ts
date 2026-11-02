export const notifications = {
  'notifications.kind.changesRequested': 'The reviewer requested changes',
  'notifications.kind.deliveryFailed': 'Delivery to {store} failed',
  'notifications.kind.submitted': 'Submitted for Bitrate review',
  'notifications.kind.approved': 'Approved by Bitrate review',
  'notifications.kind.released': 'Live on Bitrate',
  'notifications.kind.publishFailed':
    'Publishing failed — Bitrate has been notified',
  'notifications.kind.deliveryLive': 'Live on {store}',
  'notifications.aStore': 'a store',
  'notifications.justNow': 'just now',
  'notifications.error.load': 'Could not load notifications. Please try again.',
  'notifications.error.markRead': 'Could not mark as read.',
  'notifications.error.loadSettings':
    'Could not load notification settings. Please try again.',
  'notifications.error.saveSettings':
    'Could not save notification settings. Please try again.',
  'notifications.category.review': 'Bitrate review',
  'notifications.category.reviewHint':
    'Submissions, approvals and requested changes',
  'notifications.category.delivery': 'Delivery and release',
  'notifications.category.deliveryHint':
    'Stores going live, failed deliveries and releases',
} as const
