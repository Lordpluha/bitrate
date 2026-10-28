import { test } from '@playwright/test'
import {
  DESKTOP,
  openSignedIn,
  snap,
} from '../../../../tests/screenshot/screenshot'

test('lyrics desktop', async ({ page }) => {
  await openSignedIn({ page, path: '/main/lyrics', viewport: DESKTOP })
  await snap({
    name: 'lyrics-desktop.png',
    page,
    ready: page.locator('main').getByText('Hold the light a little longer'),
  })
})
