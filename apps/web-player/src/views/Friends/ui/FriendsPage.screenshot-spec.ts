import { test } from '@playwright/test'
import {
  DESKTOP,
  MOBILE,
  openSignedIn,
  snap,
} from '../../../../tests/screenshot/screenshot'

test('friends desktop', async ({ page }) => {
  await openSignedIn({ page, path: '/main/friends', viewport: DESKTOP })
  await snap({
    name: 'friends-desktop.png',
    page,
    ready: page.locator('main').getByText('Remy Cole'),
  })
})

test('friends mobile', async ({ page }) => {
  await openSignedIn({ page, path: '/main/friends', viewport: MOBILE })
  await snap({
    name: 'friends-mobile.png',
    page,
    ready: page.locator('main').getByText('Remy Cole'),
  })
})

test('friends find desktop', async ({ page }) => {
  await openSignedIn({ page, path: '/main/friends/find', viewport: DESKTOP })
  await page.getByRole('searchbox').fill('maya')
  await snap({
    name: 'friends-find-desktop.png',
    page,
    ready: page.locator('main').getByText('Mayan Echo'),
  })
})

test('friends requests desktop', async ({ page }) => {
  await openSignedIn({
    page,
    path: '/main/friends/requests',
    viewport: DESKTOP,
  })
  await snap({
    name: 'friends-requests-desktop.png',
    page,
    ready: page.locator('main').getByText('Lena Voss'),
  })
})
