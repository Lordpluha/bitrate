import { test } from '@playwright/test'
import {
  DESKTOP,
  MOBILE,
  openSignedIn,
  snap,
} from '../../../../tests/screenshot/screenshot'

test('library desktop', async ({ page }) => {
  await openSignedIn({ page, path: '/main/library', viewport: DESKTOP })
  await snap({
    name: 'library-desktop.png',
    page,
    ready: page.locator('main').getByText('Focus Frequency'),
  })
})

test('library mobile', async ({ page }) => {
  await openSignedIn({ page, path: '/main/library', viewport: MOBILE })
  await snap({
    name: 'library-mobile.png',
    page,
    ready: page.locator('main').getByText('Focus Frequency'),
  })
})
