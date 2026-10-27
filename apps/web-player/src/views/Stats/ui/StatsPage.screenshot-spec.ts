import { test } from '@playwright/test'
import {
  DESKTOP,
  MOBILE,
  openSignedIn,
  snap,
} from '../../../../tests/screenshot/screenshot'

test('stats desktop', async ({ page }) => {
  await openSignedIn({ page, path: '/main/stats', viewport: DESKTOP })
  await snap({
    name: 'stats-desktop.png',
    page,
    ready: page.locator('main').getByText('Kite Theory'),
  })
})

test('stats mobile', async ({ page }) => {
  await openSignedIn({ page, path: '/main/stats', viewport: MOBILE })
  await snap({
    name: 'stats-mobile.png',
    page,
    ready: page.locator('main').getByText('Luma Vale'),
  })
})
