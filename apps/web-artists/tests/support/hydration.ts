import { expect, type Page } from '@playwright/test'

/**
 * Navigates and waits until React has adopted the server markup.
 *
 * Start streams real HTML, so every field is present and typable long before the bundle runs —
 * and hydration then resets each input to the value React rendered, discarding whatever was
 * typed in between. The failure looks nothing like a race: the field is simply empty, and a
 * filled address answers "Email is required".
 *
 * Waiting for visible text does not help, because that text came from the server too. The fiber
 * key React attaches to every host node is the first moment the DOM is observably React's.
 */
export async function gotoHydrated(page: Page, path: string) {
  const response = await page.goto(path)

  await expect
    .poll(() =>
      page.evaluate(() =>
        [...document.querySelectorAll('body *')].some((element) =>
          Object.keys(element).some((key) => key.startsWith('__react')),
        ),
      ),
    )
    .toBe(true)

  return response
}
