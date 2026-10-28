import { test } from '@playwright/test'
import {
  DESKTOP,
  MOBILE,
  openSignedIn,
  snap,
} from '../../../../tests/screenshot/screenshot'

test('home desktop', async ({ page }) => {
  await openSignedIn({ page, path: '/main', viewport: DESKTOP })
  await snap({
    name: 'home-desktop.png',
    page,
    ready: page
      .locator('main')
      .getByRole('heading', { name: 'Recommended for you' }),
  })
})

test('home desktop light', async ({ page }) => {
  await openSignedIn({ page, path: '/main', viewport: DESKTOP, theme: 'light' })
  await snap({
    name: 'home-desktop-light.png',
    page,
    ready: page
      .locator('main')
      .getByRole('heading', { name: 'Recommended for you' }),
  })
})

test('home desktop dim', async ({ page }) => {
  await openSignedIn({ page, path: '/main', viewport: DESKTOP, theme: 'dim' })
  await snap({
    name: 'home-desktop-dim.png',
    page,
    ready: page
      .locator('main')
      .getByRole('heading', { name: 'Recommended for you' }),
  })
})

test('home mobile', async ({ page }) => {
  await openSignedIn({ page, path: '/main', viewport: MOBILE })
  await snap({
    name: 'home-mobile.png',
    page,
    ready: page
      .locator('main')
      .getByRole('heading', { name: 'Recommended for you' }),
  })
})
