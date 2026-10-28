import { test } from '@playwright/test'
import {
  DESKTOP,
  MOBILE,
  openSignedIn,
  snap,
} from '../../../../tests/screenshot/screenshot'

test('charts desktop', async ({ page }) => {
  await openSignedIn({ page, path: '/main/charts', viewport: DESKTOP })
  await snap({
    name: 'charts-desktop.png',
    page,
    ready: page.locator('main').getByText('Night Signal'),
  })
})

test('charts mobile', async ({ page }) => {
  await openSignedIn({ page, path: '/main/charts', viewport: MOBILE })
  await snap({
    name: 'charts-mobile.png',
    page,
    ready: page.locator('main').getByText('Night Signal'),
  })
})
