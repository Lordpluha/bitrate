import { test } from '@playwright/test'
import {
  DESKTOP,
  MOBILE,
  openSignedIn,
  snap,
} from '../../../../tests/screenshot/screenshot'

test('header profile menu', async ({ page }) => {
  await openSignedIn({ page, path: '/main/charts', viewport: DESKTOP })
  await page.getByRole('button', { name: 'Maya' }).click()
  await snap({
    name: 'header-profile-menu.png',
    page,
    ready: page.getByRole('link', { name: 'Your listening' }),
  })
})

test('header notifications', async ({ page }) => {
  await openSignedIn({ page, path: '/main/charts', viewport: DESKTOP })
  await page
    .getByRole('button', { name: /^Notifications/ })
    .first()
    .click()
  await snap({
    name: 'header-notifications.png',
    page,
    ready: page.getByText('Jonah Pike started following you'),
  })
})

test('header mobile menu', async ({ page }) => {
  await openSignedIn({ page, path: '/main/charts', viewport: MOBILE })
  await page.getByRole('button', { name: 'Open menu' }).click()
  await snap({
    name: 'header-mobile-menu.png',
    page,
    ready: page.getByRole('link', { name: 'Your listening' }),
  })
})
