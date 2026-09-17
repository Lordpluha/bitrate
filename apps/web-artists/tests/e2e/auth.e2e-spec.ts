import { expect, test } from '@playwright/test'
import { gotoHydrated } from '@tests/support/hydration'

/**
 * The auth pages are the whole app right now, and they are the part a migration is most likely
 * to break quietly: client-side routing, form validation and hydration all meet here, and none
 * of the three is visible to a unit test.
 */
test.describe('authentication pages', () => {
  test('walks between login, registration and password recovery', async ({
    page,
  }) => {
    await gotoHydrated(page, '/login')
    await expect(
      page.getByRole('heading', { name: 'Welcome back!' }),
    ).toBeVisible()

    await page.getByRole('link', { name: 'Sign up.' }).click()
    await expect(page).toHaveURL(/\/registration$/)
    await expect(
      page.getByRole('heading', {
        name: 'Sign up and immerse yourself in music',
      }),
    ).toBeVisible()

    await page.getByRole('link', { name: 'Log in.' }).click()
    await expect(page).toHaveURL(/\/login$/)

    await gotoHydrated(page, '/forgot-password')
    await expect(
      page.getByRole('heading', { name: 'Forgot password' }),
    ).toBeVisible()
  })

  test('validates the login form before sending anything to the API', async ({
    page,
  }) => {
    const requests: string[] = []
    page.on('request', (request) => {
      if (request.method() === 'POST') requests.push(request.url())
    })

    await gotoHydrated(page, '/login')
    await page.getByRole('button', { name: 'Continue' }).click()

    await expect(page.getByText('Email is required')).toBeVisible()
    await expect(page.getByText('Password is required')).toBeVisible()
    expect(requests).toEqual([])
  })

  /**
   * The distinction the schema goes out of its way to keep: an empty field is "required", a
   * malformed one is "invalid". A bare `z.email()` would collapse them into one message.
   */
  test('tells a malformed address apart from a missing one', async ({
    page,
  }) => {
    await gotoHydrated(page, '/login')

    await page.getByLabel('Email Address').fill('artist-at-bitrate')
    await page.getByRole('button', { name: 'Continue' }).click()

    await expect(
      page.getByText('Please enter a valid email address'),
    ).toBeVisible()
  })

  test('answers an unknown path with the app 404, not a bare paragraph', async ({
    page,
  }) => {
    const response = await gotoHydrated(page, '/no-such-page')

    expect(response?.status()).toBe(404)
    await expect(
      page.getByRole('heading', { name: "This page doesn't exist" }),
    ).toBeVisible()
    await expect(
      page.getByRole('link', { name: 'Back to Bitrate for Artists' }),
    ).toBeVisible()
  })
})
