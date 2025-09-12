import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');

  // Expect the page to have a title that contains "Spotify"
  await expect(page).toHaveTitle(/Spotify/);
});

test('landing page shows discover text', async ({ page }) => {
  await page.goto('/');

  // Expects page to have heading with the word "Discover"
  await expect(page.getByText(/Discover/i).first()).toBeVisible();
});
