import { test } from '@playwright/test'
import {
  DESKTOP,
  MOBILE,
  openSignedIn,
  snap,
} from '../../../../tests/screenshot/screenshot'

test('search browse desktop', async ({ page }) => {
  await openSignedIn({ page, path: '/main/search', viewport: DESKTOP })
  await snap({
    name: 'search-browse-desktop.png',
    page,
    ready: page.locator('main').getByText('Electronic'),
  })
})

test('search results desktop', async ({ page }) => {
  await openSignedIn({ page, path: '/main/search?q=luma', viewport: DESKTOP })
  await snap({
    name: 'search-results-desktop.png',
    page,
    ready: page.locator('main').getByText('Night Signal'),
  })
})

test('search browse mobile', async ({ page }) => {
  await openSignedIn({ page, path: '/main/search', viewport: MOBILE })
  await snap({
    name: 'search-browse-mobile.png',
    page,
    ready: page.locator('main').getByText('Electronic'),
  })
})
