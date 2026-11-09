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
  await waitForHydration(page)
  return response
}

/** A reload starts from server skeletons while Vite loads the route's browser modules again. */
export async function reloadHydrated(page: Page) {
  const response = await page.reload()
  await waitForHydration(page)
  await expect(page.locator('[data-skeleton="page"]')).toHaveCount(0, {
    timeout: 15_000,
  })
  return response
}

async function waitForHydration(page: Page) {
  await expect
    .poll(
      async () => {
        try {
          return await page.evaluate(() =>
            [...document.querySelectorAll('body *')].some((element) =>
              Object.keys(element).some((key) => key.startsWith('__react')),
            ),
          )
        } catch (error) {
          // A redirect can replace the document between goto() and this hydration check.
          if (
            error instanceof Error &&
            error.message.includes('Execution context was destroyed')
          )
            return false
          throw error
        }
      },
      // Cold, code-split dashboard bundles can take over five seconds on CI's four workers.
      { timeout: 15_000 },
    )
    .toBe(true)
}
