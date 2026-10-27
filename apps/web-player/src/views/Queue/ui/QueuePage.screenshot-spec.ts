import { test } from '@playwright/test'
import {
  DESKTOP,
  openSignedIn,
  snap,
} from '../../../../tests/screenshot/screenshot'

test('queue desktop', async ({ page }) => {
  await openSignedIn({ page, path: '/main/queue', viewport: DESKTOP })
  await snap({
    name: 'queue-desktop.png',
    page,
    ready: page.locator('main').getByText('Afterglow'),
  })
})
