import { test } from '@playwright/test'
import {
  DESKTOP,
  MOBILE,
  openSignedIn,
  snap,
} from '../../../../tests/screenshot/screenshot'

test('playlist desktop', async ({ page }) => {
  await openSignedIn({ page, path: '/main/playlist/p1', viewport: DESKTOP })
  await snap({
    name: 'playlist-desktop.png',
    page,
    ready: page
      .locator('main')
      .getByRole('heading', { level: 1, name: 'Night Drive' }),
  })
})

test('playlist mobile', async ({ page }) => {
  await openSignedIn({ page, path: '/main/playlist/p1', viewport: MOBILE })
  await snap({
    name: 'playlist-mobile.png',
    page,
    ready: page
      .locator('main')
      .getByRole('heading', { level: 1, name: 'Night Drive' }),
  })
})

test('liked songs desktop', async ({ page }) => {
  await openSignedIn({ page, path: '/main/liked-songs', viewport: DESKTOP })
  await snap({
    name: 'liked-songs-desktop.png',
    page,
    ready: page.locator('main').getByText('Static Bloom'),
  })
})
