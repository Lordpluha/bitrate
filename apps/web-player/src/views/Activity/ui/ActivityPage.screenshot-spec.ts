import { test } from '@playwright/test'
import {
  DESKTOP,
  MOBILE,
  openSignedIn,
  snap,
} from '../../../../tests/screenshot/screenshot'

test('activity desktop', async ({ page }) => {
  await openSignedIn({ page, path: '/main/activity', viewport: DESKTOP })
  await snap({
    name: 'activity-desktop.png',
    page,
    ready: page.locator('main').getByText('Night Signal'),
  })
})

test('activity mobile', async ({ page }) => {
  await openSignedIn({ page, path: '/main/activity', viewport: MOBILE })
  await snap({
    name: 'activity-mobile.png',
    page,
    ready: page.locator('main').getByText('Night Signal'),
  })
})
