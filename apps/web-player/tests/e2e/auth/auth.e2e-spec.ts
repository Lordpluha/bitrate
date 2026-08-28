import { expect, test } from '@playwright/test'

test.describe('authentication pages', () => {
  test('validates the login form without sending an API request', async ({
    page,
  }) => {
    await page.goto('/auth/login')

    await page.getByRole('button', { name: 'Log in' }).click()

    await expect(page.getByText('Invalid email address')).toBeVisible()
    // Login accepts six characters on purpose, while registration demands
    // eight: an account created under an older policy must still be able to
    // sign in rather than be rejected by the form before the server sees it.
    await expect(
      page.getByText('Password must be at least 6 characters'),
    ).toBeVisible()
  })

  test('links login, registration, and password recovery flows', async ({
    page,
  }) => {
    await page.goto('/auth/login')

    await page.getByRole('link', { name: 'Sign up.' }).click()
    await expect(page).toHaveURL(/\/auth\/registration$/)
    await expect(
      page.getByRole('heading', {
        name: 'Create your account for free and start listening',
      }),
    ).toBeVisible()

    await page.goto('/auth/login')
    await page.getByRole('link', { name: 'Forgot password?' }).click()
    await expect(page).toHaveURL(/\/auth\/forgot-password$/)
  })
})
