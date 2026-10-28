import { test } from '@playwright/test'
import {
  DESKTOP,
  openSignedIn,
  snap,
} from '../../../../tests/screenshot/screenshot'

test('album desktop', async ({ page }) => {
  await openSignedIn({ page, path: '/main/album/al1', viewport: DESKTOP })
  await snap({
    name: 'album-desktop.png',
    page,
    ready: page.locator('main').getByRole('heading', { name: 'Afterglow' }),
  })
})

test('album not found', async ({ page }) => {
  await openSignedIn({ page, path: '/main/album/missing', viewport: DESKTOP })
  await snap({
    name: 'album-not-found.png',
    page,
    ready: page
      .locator('main')
      .getByRole('heading', { name: 'Album not found.' }),
  })
})
