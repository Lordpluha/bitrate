import { test } from '@playwright/test'
import {
  DESKTOP,
  MOBILE,
  openSignedIn,
  snap,
} from '../../../../tests/screenshot/screenshot'

test('artist desktop', async ({ page }) => {
  await openSignedIn({ page, path: '/main/artist/ar1', viewport: DESKTOP })
  await snap({
    name: 'artist-desktop.png',
    page,
    ready: page.locator('main').getByRole('heading', { name: 'Luma Vale' }),
  })
})

test('artist mobile', async ({ page }) => {
  await openSignedIn({ page, path: '/main/artist/ar1', viewport: MOBILE })
  await snap({
    name: 'artist-mobile.png',
    page,
    ready: page.locator('main').getByRole('heading', { name: 'Luma Vale' }),
  })
})
