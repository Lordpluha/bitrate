import { test } from '@playwright/test'
import {
  DESKTOP,
  openSignedIn,
  snap,
} from '../../../../tests/screenshot/screenshot'

test('profile desktop', async ({ page }) => {
  await openSignedIn({ page, path: '/main/profile', viewport: DESKTOP })
  await snap({
    name: 'profile-desktop.png',
    page,
    ready: page
      .locator('main')
      .getByRole('heading', { name: 'Maya', exact: true }),
  })
})

test('public profile desktop', async ({ page }) => {
  await openSignedIn({ page, path: '/main/user/f2', viewport: DESKTOP })
  await snap({
    name: 'public-profile-desktop.png',
    page,
    ready: page.locator('main').getByRole('heading', { name: 'Jonah Pike' }),
  })
})
