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

    await page.getByRole('link', { name: 'Sign up' }).click()
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

  test('keeps more sign-in options folded until asked, and locked until the terms are accepted', async ({
    page,
  }) => {
    await page.goto('/auth/login')

    await expect(
      page.getByRole('button', { name: 'Continue with Google' }),
    ).toBeDisabled()
    await page.getByRole('button', { name: /More options · 10/ }).click()
    await expect(
      page.getByRole('heading', { name: 'More sign-in options' }),
    ).toBeVisible()
    await expect(page.getByText('Telegram')).toBeVisible()

    await page.getByRole('checkbox', { name: /at least 16 years old/ }).check()
    await expect(
      page.getByRole('link', { name: 'Continue with Google' }),
    ).toHaveAttribute('href', /acceptLegal=true/)
  })

  test('recovery screens explain a bad email and a broken link without the API', async ({
    page,
  }) => {
    await page.goto('/auth/forgot-password')
    await page.getByLabel('Email address').fill('maya@')
    await page.getByRole('button', { name: 'Send reset link' }).click()
    await expect(page.getByText('Enter a valid email address')).toBeVisible()

    await page.goto('/auth/reset-password')
    await expect(page.getByText('Link incomplete')).toBeVisible()
    await expect(
      page.getByRole('link', { name: 'Request another link' }),
    ).toHaveAttribute('href', '/auth/forgot-password')
  })

  test('the 2FA step refuses an incomplete code', async ({ page }) => {
    await page.goto('/auth/login/2fa')

    await page.getByLabel('Authentication code').fill('482')
    await page.getByRole('button', { name: 'Verify' }).click()
    await expect(page.getByText('Invalid or expired 2FA code')).toBeVisible()
  })
})

test.describe('authentication pages on a wide screen', () => {
  test.skip(({ isMobile }) => isMobile, 'the brand panel is desktop only')

  test('each split screen shows its own brand headline', async ({ page }) => {
    await page.goto('/auth/login')
    await expect(
      page.getByText('Your music, ready when you are.'),
    ).toBeVisible()
    await page.goto('/auth/registration')
    await expect(page.getByText('Start listening for free.')).toBeVisible()
    await page.goto('/auth/login/2fa')
    await expect(page.getByText('One more step.')).toBeVisible()
  })
})
