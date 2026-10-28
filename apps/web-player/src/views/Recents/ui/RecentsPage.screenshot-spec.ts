import { test } from '@playwright/test'
import {
  DESKTOP,
  openSignedIn,
  snap,
} from '../../../../tests/screenshot/screenshot'

test('recents desktop', async ({ page }) => {
  await openSignedIn({ page, path: '/main/recents', viewport: DESKTOP })
  await snap({
    name: 'recents-desktop.png',
    page,
    ready: page.locator('main').getByText('Glass Coast'),
  })
})
