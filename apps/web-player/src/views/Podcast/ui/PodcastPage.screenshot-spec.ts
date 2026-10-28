import { test } from '@playwright/test'
import {
  DESKTOP,
  openSignedIn,
  snap,
} from '../../../../tests/screenshot/screenshot'

test('podcast desktop', async ({ page }) => {
  await openSignedIn({ page, path: '/main/podcast/pod1', viewport: DESKTOP })
  await snap({
    name: 'podcast-desktop.png',
    page,
    ready: page.locator('main').getByText('Mixing in mono'),
  })
})
