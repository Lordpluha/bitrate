import { test } from '@playwright/test'
import {
  DESKTOP,
  openSignedIn,
  snap,
} from '../../../../tests/screenshot/screenshot'

test('notifications desktop', async ({ page }) => {
  await openSignedIn({ page, path: '/main/notifications', viewport: DESKTOP })
  await snap({
    name: 'notifications-desktop.png',
    page,
    ready: page.locator('main').getByText('Jonah Pike started following you'),
  })
})
