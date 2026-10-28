import { test } from '@playwright/test'
import {
  DESKTOP,
  MOBILE,
  openSignedIn,
  snap,
} from '../../../../tests/screenshot/screenshot'

test('settings desktop', async ({ page }) => {
  await openSignedIn({ page, path: '/main/preferences', viewport: DESKTOP })
  await snap({
    name: 'settings-desktop.png',
    page,
    ready: page.locator('main').getByText('maya@example.com'),
  })
})

test('settings mobile', async ({ page }) => {
  await openSignedIn({ page, path: '/main/preferences', viewport: MOBILE })
  await snap({
    name: 'settings-mobile.png',
    page,
    ready: page.locator('main').getByText('maya@example.com'),
  })
})
