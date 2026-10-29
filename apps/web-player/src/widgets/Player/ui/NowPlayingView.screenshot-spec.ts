import { test } from '@playwright/test'
import {
  DESKTOP,
  MOBILE,
  openSignedIn,
  snap,
} from '../../../../tests/screenshot/screenshot'

/** The expanded now-playing view, opened the way a listener opens it on each layout. */
test('now playing desktop', async ({ page }) => {
  await openSignedIn({ page, path: '/main/charts', viewport: DESKTOP })
  await page.getByRole('button', { name: 'Open full player' }).first().click()
  await snap({
    name: 'now-playing-desktop.png',
    page,
    ready: page.getByRole('dialog', { name: 'Now playing Afterglow' }),
  })
})

test('now playing mobile', async ({ page }) => {
  await openSignedIn({ page, path: '/main/charts', viewport: MOBILE })
  /** `next dev`'s indicator sits over the island's corner and swallows a pointer click. */
  await page
    .getByRole('button', { name: 'Open now playing: Afterglow' })
    .dispatchEvent('click')
  await snap({
    name: 'now-playing-mobile.png',
    page,
    ready: page.getByRole('dialog', { name: 'Now playing Afterglow' }),
  })
})
