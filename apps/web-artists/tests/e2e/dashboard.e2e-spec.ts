import type { ApiSchemas } from '@bitrate/contracts'
import { type BrowserContext, expect, type Page, test } from '@playwright/test'
import { gotoHydrated } from '@tests/support/hydration'

async function authenticate(
  context: BrowserContext,
  access = 'test-valid',
  refresh = 'test-refresh',
) {
  await context.addCookies([
    {
      name: 'access_token',
      value: access,
      url: 'http://localhost:3102',
      httpOnly: true,
    },
    {
      name: 'refresh_token',
      value: refresh,
      url: 'http://localhost:3102',
      httpOnly: true,
    },
  ])
}

/**
 * Every test gets its own slice of the API fixture's in-memory state (keyed by this cookie,
 * which reaches the fixture on :3103 because cookies ignore the port), so tests run in parallel.
 */
test.beforeEach(async ({ context }, testInfo) => {
  await context.addCookies([
    {
      name: 'e2e_scope',
      value: `${testInfo.testId}-${testInfo.retry}`,
      url: 'http://localhost:3102',
    },
  ])
})

async function openNavigation(page: Page) {
  if (await page.getByRole('dialog', { name: 'Workspace menu' }).isVisible())
    return
  const menu = page.getByRole('button', { name: 'Open workspace menu' })
  if (await menu.isVisible()) await menu.click()
}

async function openAppearance(page: Page) {
  const account = page.getByRole('dialog', { name: 'Artist account' })
  if (await account.isVisible())
    return account.getByRole('group', { name: 'Appearance' })
  await openNavigation(page)
  await page.getByRole('button', { name: 'Artist account menu' }).click()
  return account.getByRole('group', { name: 'Appearance' })
}

async function closeAccountMenu(page: Page) {
  const menu = page.getByRole('dialog', { name: 'Artist account' })
  if (await menu.isVisible())
    await menu.getByRole('button', { name: 'Close dialog' }).click()
}

async function openSeededDraft(page: Page, context: BrowserContext) {
  await authenticate(context)
  await page.request.post('http://localhost:3103/test/music')
  await gotoHydrated(page, '/dashboard/music?tab=releases')
  await page
    .getByRole('button', { name: 'Open Steel Ball Run', exact: true })
    .click()
  await page.getByRole('button', { name: 'Edit draft', exact: true }).click()
  return page.getByRole('dialog', { name: 'Edit draft', exact: true })
}

const workspaceDraftId = '019a0000-0000-7000-8000-000000000200'
const workspaceDemoId = '019a0000-0000-7000-8000-000000000201'

async function seedCredit(page: Page, context: BrowserContext) {
  await authenticate(context)
  await page.request.post('http://localhost:3103/test/music')
  const response = await page.request.get(
    `http://localhost:3103/api/v1/releases/${workspaceDraftId}`,
  )
  const release: ApiSchemas['ReleaseEntity'] = await response.json()
  const saved = await page.request.post(
    `http://localhost:3103/api/v1/releases/${workspaceDraftId}/contributors`,
    {
      data: {
        displayName: 'Taylor Reid',
        roles: ['PERFORMER', 'COMPOSER'],
        expectedUpdatedAt: release.updatedAt,
      },
    },
  )
  expect(saved.ok()).toBe(true)
  const credit: ApiSchemas['ReleaseContributorAddedEntity'] = await saved.json()
  return credit.participant.id
}

for (const theme of ['light', 'dark', 'dim']) {
  test(`${theme} missing contributor role can be corrected from its warning`, async ({
    page,
    context,
  }, testInfo) => {
    const creditId = await seedCredit(page, context)
    await page.addInitScript(
      (value) => localStorage.setItem('bitrate.artist-theme.v1', value),
      theme,
    )
    const workspaceUrl = `**/api/v1/releases/${workspaceDraftId}/workspace`
    const contributorUrl = `**/api/v1/releases/${workspaceDraftId}/contributors/${creditId}`
    await page.route(workspaceUrl, async (route) => {
      const response = await route.fetch()
      const data: ApiSchemas['ReleaseWorkspaceEntity'] = await response.json()
      await route.fulfill({
        response,
        json: {
          ...data,
          participants: data.participants.map((person) =>
            person.id === creditId ? { ...person, roles: [] } : person,
          ),
        },
      })
    })
    await page.route(contributorUrl, async (route) => {
      const response = await route.fetch()
      const data: ApiSchemas['ReleaseContributorEntity'] = await response.json()
      await route.fulfill({
        response,
        json: { ...data, participant: { ...data.participant, roles: [] } },
      })
    })
    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(error.message))
    await gotoHydrated(page, `/dashboard/music/${workspaceDraftId}`)
    const panel = page.getByRole('region', { name: 'Participants (1)' })
    await expect(panel.getByText('Needs role', { exact: true })).toBeVisible()
    const viewport = page.viewportSize()
    for (const width of [320, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 })
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true)
      await expect(
        panel.getByRole('button', {
          name: 'Edit roles for Taylor Reid',
          exact: true,
        }),
      ).toBeVisible()
    }
    if (viewport) await page.setViewportSize(viewport)
    await panel.screenshot({
      path: `../../output/playwright/contributor-roles/${theme}-${testInfo.project.name}.png`,
    })
    await panel
      .getByRole('button', { name: 'Edit roles for Taylor Reid', exact: true })
      .click()
    const dialog = page.getByRole('dialog', {
      name: 'Edit contributor',
      exact: true,
    })
    await expect(dialog.getByLabel('Contributor name')).toHaveValue(
      'Taylor Reid',
    )
    await dialog.getByLabel('Producer', { exact: true }).check()
    await page.unroute(workspaceUrl)
    await page.unroute(contributorUrl)
    await dialog
      .getByRole('button', { name: 'Save contributor', exact: true })
      .click()
    await expect(dialog).not.toBeVisible()
    await expect(panel.getByText('Needs role', { exact: true })).toHaveCount(0)
    await expect(panel.getByText('Producer', { exact: true })).toBeVisible()
    await page.reload()
    await expect(panel.getByText('Producer', { exact: true })).toBeVisible()
    await expect(panel.getByText('Needs role', { exact: true })).toHaveCount(0)
    expect(errors).toEqual([])
  })
}

test('missing contributor role stays visible on a non-draft without an edit action', async ({
  page,
  context,
}) => {
  await authenticate(context)
  await page.request.post('http://localhost:3103/test/music')
  await page.route(
    `**/api/v1/releases/${workspaceDemoId}/workspace`,
    async (route) => {
      const response = await route.fetch()
      const data: ApiSchemas['ReleaseWorkspaceEntity'] = await response.json()
      await route.fulfill({
        response,
        json: {
          ...data,
          participants: [
            { id: workspaceDraftId, displayName: 'Legacy credit', roles: [] },
          ],
          participantCount: 1,
        },
      })
    },
  )
  await gotoHydrated(page, `/dashboard/music/${workspaceDemoId}`)
  const panel = page.getByRole('region', { name: 'Participants (1)' })
  await expect(panel.getByText('Needs role', { exact: true })).toBeVisible()
  await expect(
    panel.getByRole('button', { name: /Edit roles|Edit contributor/ }),
  ).toHaveCount(0)
})

for (const theme of ['light', 'dark', 'dim']) {
  test(`${theme} contributor editing preserves identity and persists the new name and roles`, async ({
    page,
    context,
  }, testInfo) => {
    const originalViewport = page.viewportSize()
    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(error.message))
    const creditId = await seedCredit(page, context)
    await page.addInitScript(
      (value) => localStorage.setItem('bitrate.artist-theme.v1', value),
      theme,
    )
    await gotoHydrated(page, `/dashboard/music/${workspaceDraftId}`)
    await page
      .getByRole('button', {
        name: 'Edit contributor Taylor Reid',
        exact: true,
      })
      .click()
    const dialog = page.getByRole('dialog', {
      name: 'Edit contributor',
      exact: true,
    })
    await expect(dialog.getByLabel('Contributor name')).toHaveValue(
      'Taylor Reid',
    )
    await expect(dialog.getByLabel('Performer', { exact: true })).toBeChecked()
    await expect(
      dialog.getByRole('button', { name: 'Save contributor', exact: true }),
    ).toBeDisabled()
    await dialog.getByLabel('Contributor name').fill(' Taylor Reid Updated ')
    await dialog.getByLabel('Performer', { exact: true }).uncheck()
    await dialog.getByLabel('Producer', { exact: true }).check()
    for (const width of [320, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 })
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true)
      await expect(dialog.getByLabel('Contributor name')).toBeVisible()
    }
    if (originalViewport) await page.setViewportSize(originalViewport)
    await dialog
      .getByRole('heading', { name: 'Edit contributor', exact: true })
      .click()
    await page.screenshot({
      path: `../../output/playwright/contributor-edit/${theme}-${testInfo.project.name}.png`,
    })
    await dialog
      .getByRole('button', { name: 'Save contributor', exact: true })
      .click()
    await expect(dialog).not.toBeVisible()
    const panel = page.getByRole('region', { name: 'Participants (1)' })
    await expect(
      panel.getByRole('heading', { name: 'Taylor Reid Updated', exact: true }),
    ).toBeVisible()
    await expect(
      panel.getByText('Producer · Composer', { exact: true }),
    ).toBeVisible()
    await page.reload()
    await expect(
      panel.getByRole('heading', { name: 'Taylor Reid Updated', exact: true }),
    ).toBeVisible()
    const detail = await page.request.get(
      `http://localhost:3103/api/v1/releases/${workspaceDraftId}/contributors/${creditId}`,
    )
    expect(detail.ok()).toBe(true)
    const data = await detail.json()
    expect(data.participant).toMatchObject({
      id: creditId,
      displayName: 'Taylor Reid Updated',
    })
    expect(errors).toEqual([])
  })
}

for (const status of [404, 409, 503, 200]) {
  test(`contributor editing retains entries after ${status} without retrying`, async ({
    page,
    context,
  }) => {
    const creditId = await seedCredit(page, context)
    await gotoHydrated(page, `/dashboard/music/${workspaceDraftId}`)
    const trigger = page.getByRole('button', {
      name: 'Edit contributor Taylor Reid',
      exact: true,
    })
    await trigger.click()
    const dialog = page.getByRole('dialog', {
      name: 'Edit contributor',
      exact: true,
    })
    await dialog.getByLabel('Contributor name').fill('Updated credit')
    let writes = 0
    await page.route(
      `**/api/v1/releases/*/contributors/${creditId}`,
      async (route) => {
        if (route.request().method() !== 'PATCH') return route.continue()
        writes++
        await route.fulfill({
          status,
          contentType: 'application/json',
          body: '{}',
        })
      },
    )
    await dialog
      .getByRole('button', { name: 'Save contributor', exact: true })
      .click()
    await expect(dialog.getByRole('alert')).toContainText(
      status === 404
        ? 'no longer available'
        : status === 409
          ? 'release changed'
          : 'Could not confirm',
    )
    await expect(dialog.getByLabel('Contributor name')).toHaveValue(
      'Updated credit',
    )
    await expect(dialog.getByLabel('Composer', { exact: true })).toBeChecked()
    expect(writes).toBe(1)
    await dialog.getByRole('button', { name: 'Cancel', exact: true }).click()
    await expect(trigger).toBeFocused()
    await expect(
      page.getByRole('heading', { name: 'Updated credit', exact: true }),
    ).toHaveCount(0)
  })
}

test('contributor editing rejects a success response for a different participant', async ({
  page,
  context,
}) => {
  const creditId = await seedCredit(page, context)
  await gotoHydrated(page, `/dashboard/music/${workspaceDraftId}`)
  await page
    .getByRole('button', { name: 'Edit contributor Taylor Reid', exact: true })
    .click()
  const dialog = page.getByRole('dialog', {
    name: 'Edit contributor',
    exact: true,
  })
  await dialog.getByLabel('Contributor name').fill('Updated credit')
  let writes = 0
  await page.route(
    `**/api/v1/releases/*/contributors/${creditId}`,
    async (route) => {
      if (route.request().method() !== 'PATCH') return route.continue()
      writes++
      const response = await route.fetch()
      const data: ApiSchemas['ReleaseContributorEntity'] = await response.json()
      await route.fulfill({
        response,
        json: {
          ...data,
          participant: { ...data.participant, id: workspaceDemoId },
        },
      })
    },
  )
  await dialog
    .getByRole('button', { name: 'Save contributor', exact: true })
    .click()
  await expect(dialog.getByRole('alert')).toContainText('Could not confirm')
  await expect(dialog.getByLabel('Contributor name')).toHaveValue(
    'Updated credit',
  )
  expect(writes).toBe(1)
  await dialog.getByRole('button', { name: 'Cancel', exact: true }).click()
  await page.reload()
  await expect(
    page.getByRole('heading', { name: 'Updated credit', exact: true }),
  ).toBeVisible()
  await expect(
    page.getByRole('region', { name: 'Participants (1)' }),
  ).toBeVisible()
})

test('contributor editing retries a failed read explicitly and blocks unchanged or pending writes', async ({
  page,
  context,
}) => {
  const creditId = await seedCredit(page, context)
  await gotoHydrated(page, `/dashboard/music/${workspaceDraftId}`)
  const path = `**/api/v1/releases/*/contributors/${creditId}`
  let reads = 0
  let writes = 0
  let releaseWrite: () => void = () => {}
  const gate = new Promise<void>((resolve) => {
    releaseWrite = resolve
  })
  await page.route(path, async (route) => {
    if (route.request().method() === 'GET') {
      reads++
      if (reads === 1)
        return route.fulfill({
          status: 503,
          contentType: 'application/json',
          body: '{}',
        })
    } else {
      writes++
      await gate
    }
    return route.continue()
  })
  await page
    .getByRole('button', { name: 'Edit contributor Taylor Reid', exact: true })
    .click()
  const dialog = page.getByRole('dialog', {
    name: 'Edit contributor',
    exact: true,
  })
  await expect(dialog.getByRole('alert')).toContainText(
    'Could not load the latest contributor',
  )
  await expect(dialog.getByLabel('Contributor name')).toHaveCount(0)
  expect(reads).toBe(1)
  await dialog.getByRole('button', { name: 'Try again', exact: true }).click()
  const save = dialog.getByRole('button', {
    name: 'Save contributor',
    exact: true,
  })
  await expect(dialog.getByLabel('Contributor name')).toHaveValue('Taylor Reid')
  expect(reads).toBe(2)
  await dialog.getByLabel('Contributor name').fill(' Taylor Reid ')
  await expect(save).toBeDisabled()
  await dialog.getByLabel('Contributor name').fill('')
  await save.click()
  await expect(
    dialog.getByText('Enter a contributor name', { exact: true }),
  ).toBeVisible()
  await dialog.getByLabel('Contributor name').fill('Updated credit')
  await dialog.getByLabel('Performer', { exact: true }).uncheck()
  await dialog.getByLabel('Composer', { exact: true }).uncheck()
  await save.click()
  await expect(
    dialog.getByRole('alert').filter({ hasText: 'Choose at least one role' }),
  ).toBeVisible()
  await dialog.getByLabel('Producer', { exact: true }).check()
  try {
    await save.click()
    await expect(
      dialog.getByRole('button', { name: 'Saving contributor…', exact: true }),
    ).toBeDisabled()
    await expect(dialog.getByLabel('Contributor name')).toBeDisabled()
    await expect(dialog.getByLabel('Producer', { exact: true })).toBeDisabled()
    await expect(
      dialog.getByRole('button', { name: 'Close dialog' }),
    ).toBeDisabled()
    await page.keyboard.press('Escape')
    await expect(dialog).toBeVisible()
    expect(writes).toBe(1)
  } finally {
    releaseWrite()
  }
  await expect(dialog).not.toBeVisible()
  expect(writes).toBe(1)
})

test('contributor editing assigns missing roles to a legacy credit', async ({
  page,
  context,
}) => {
  const creditId = await seedCredit(page, context)
  await page.route(
    `**/api/v1/releases/*/contributors/${creditId}`,
    async (route) => {
      if (route.request().method() !== 'GET') return route.continue()
      const response = await route.fetch()
      const data: ApiSchemas['ReleaseContributorEntity'] = await response.json()
      await route.fulfill({
        response,
        json: { ...data, participant: { ...data.participant, roles: [] } },
      })
    },
  )
  await gotoHydrated(page, `/dashboard/music/${workspaceDraftId}`)
  await page
    .getByRole('button', { name: 'Edit contributor Taylor Reid', exact: true })
    .click()
  const dialog = page.getByRole('dialog', {
    name: 'Edit contributor',
    exact: true,
  })
  await expect(dialog.getByLabel('Contributor name')).toHaveValue('Taylor Reid')
  await expect(dialog.getByRole('checkbox', { checked: true })).toHaveCount(0)
  await dialog.getByLabel('Producer', { exact: true }).check()
  await dialog
    .getByRole('button', { name: 'Save contributor', exact: true })
    .click()
  await expect(dialog).not.toBeVisible()
  const detail = await page.request.get(
    `http://localhost:3103/api/v1/releases/${workspaceDraftId}/contributors/${creditId}`,
  )
  expect((await detail.json()).participant).toMatchObject({
    id: creditId,
    displayName: 'Taylor Reid',
    roles: ['PRODUCER'],
  })
})

test('contributor editing blocks a release that stopped being a draft before loading the form', async ({
  page,
  context,
}) => {
  const creditId = await seedCredit(page, context)
  await page.route(
    `**/api/v1/releases/*/contributors/${creditId}`,
    async (route) => {
      const response = await route.fetch()
      const data: ApiSchemas['ReleaseContributorEntity'] = await response.json()
      await route.fulfill({
        response,
        json: { ...data, release: { ...data.release, status: 'SUBMITTED' } },
      })
    },
  )
  await gotoHydrated(page, `/dashboard/music/${workspaceDraftId}`)
  await page
    .getByRole('button', { name: 'Edit contributor Taylor Reid', exact: true })
    .click()
  const dialog = page.getByRole('dialog', {
    name: 'Edit contributor',
    exact: true,
  })
  await expect(dialog.getByRole('alert')).toContainText('no longer a draft')
  await expect(dialog.getByLabel('Contributor name')).toHaveCount(0)
})

test('contributor editing rejects concurrent changes and reloads the current credit when reopened', async ({
  page,
  context,
}) => {
  const creditId = await seedCredit(page, context)
  await gotoHydrated(page, `/dashboard/music/${workspaceDraftId}`)
  await page
    .getByRole('button', { name: 'Edit contributor Taylor Reid', exact: true })
    .click()
  const dialog = page.getByRole('dialog', {
    name: 'Edit contributor',
    exact: true,
  })
  await dialog.getByLabel('Contributor name').fill('My update')
  const url = `http://localhost:3103/api/v1/releases/${workspaceDraftId}/contributors/${creditId}`
  const response = await page.request.get(url)
  const current: ApiSchemas['ReleaseContributorEntity'] = await response.json()
  const concurrent = await page.request.patch(url, {
    data: {
      displayName: 'Other update',
      roles: ['PRODUCER'],
      expectedUpdatedAt: current.release.updatedAt,
    },
  })
  expect(concurrent.ok()).toBe(true)
  await dialog
    .getByRole('button', { name: 'Save contributor', exact: true })
    .click()
  await expect(dialog.getByRole('alert')).toContainText('release changed')
  await expect(dialog.getByLabel('Contributor name')).toHaveValue('My update')
  await dialog.getByRole('button', { name: 'Cancel', exact: true }).click()
  await page
    .getByRole('button', { name: 'Edit contributor Taylor Reid', exact: true })
    .click()
  await expect(dialog.getByLabel('Contributor name')).toHaveValue(
    'Other update',
  )
  await expect(dialog.getByLabel('Producer', { exact: true })).toBeChecked()
  await dialog.getByLabel('Contributor name').fill('Final update')
  await dialog
    .getByRole('button', { name: 'Save contributor', exact: true })
    .click()
  await expect(dialog).not.toBeVisible()
  const saved = await page.request.get(url)
  const data = await saved.json()
  expect(data.participant).toMatchObject({
    id: creditId,
    displayName: 'Final update',
    roles: ['PRODUCER'],
  })
  await expect(
    page.getByRole('region', { name: 'Participants (1)' }),
  ).toBeVisible()
})

for (const status of [404, 409, 503, 201]) {
  test(`release contributor preserves entries after ${status} and never retries a write`, async ({
    page,
    context,
  }) => {
    await authenticate(context)
    await page.request.post('http://localhost:3103/test/music')
    await gotoHydrated(page, `/dashboard/music/${workspaceDraftId}`)
    const trigger = page.getByRole('button', {
      name: 'Add contributor',
      exact: true,
    })
    await trigger.click()
    const dialog = page.getByRole('dialog', {
      name: 'Add contributor',
      exact: true,
    })
    await dialog.getByLabel('Contributor name').fill('Jordan Lee')
    await dialog.getByLabel('Producer', { exact: true }).check()
    let writes = 0
    await page.route('**/api/v1/releases/*/contributors', async (route) => {
      writes++
      await route.fulfill({
        status,
        contentType: 'application/json',
        body: '{}',
      })
    })
    await dialog
      .getByRole('button', { name: 'Save contributor', exact: true })
      .click()
    await expect(dialog.getByRole('alert')).toContainText(
      status === 404
        ? 'no longer available'
        : status === 409
          ? 'release changed'
          : 'Could not confirm',
    )
    await expect(dialog.getByLabel('Contributor name')).toHaveValue(
      'Jordan Lee',
    )
    await expect(dialog.getByLabel('Producer', { exact: true })).toBeChecked()
    expect(writes).toBe(1)
    await expect(
      page.getByRole('heading', { name: 'Jordan Lee', exact: true }),
    ).toHaveCount(0)
    await dialog.getByRole('button', { name: 'Cancel', exact: true }).click()
    await expect(trigger).toBeFocused()
  })
}

test('release contributor validates name and roles and locks a pending save', async ({
  page,
  context,
}) => {
  await authenticate(context)
  await page.request.post('http://localhost:3103/test/music')
  await gotoHydrated(page, `/dashboard/music/${workspaceDraftId}`)
  await page
    .getByRole('button', { name: 'Add contributor', exact: true })
    .click()
  const dialog = page.getByRole('dialog', {
    name: 'Add contributor',
    exact: true,
  })
  await expect(dialog.getByLabel('Contributor name')).toBeFocused()
  await dialog
    .getByRole('button', { name: 'Save contributor', exact: true })
    .click()
  await expect(
    dialog.getByText('Enter a contributor name', { exact: true }),
  ).toBeVisible()
  await expect(
    dialog.getByRole('alert').filter({ hasText: 'Choose at least one role' }),
  ).toBeVisible()
  await dialog.getByLabel('Contributor name').fill('Jordan Lee')
  await dialog.getByLabel('Producer', { exact: true }).check()
  let releaseWrite: () => void = () => {}
  const gate = new Promise<void>((resolve) => {
    releaseWrite = resolve
  })
  await page.route('**/api/v1/releases/*/contributors', async (route) => {
    await gate
    await route.continue()
  })
  try {
    await dialog
      .getByRole('button', { name: 'Save contributor', exact: true })
      .click()
    await expect(
      dialog.getByRole('button', { name: 'Saving contributor…', exact: true }),
    ).toBeDisabled()
    await expect(dialog.getByLabel('Contributor name')).toBeDisabled()
    await expect(dialog.getByLabel('Producer', { exact: true })).toBeDisabled()
    await expect(
      dialog.getByRole('button', { name: 'Close dialog' }),
    ).toBeDisabled()
    await page.keyboard.press('Escape')
    await expect(dialog).toBeVisible()
  } finally {
    releaseWrite()
  }
  await expect(dialog).not.toBeVisible()
  await expect(
    page.getByRole('heading', { name: 'Jordan Lee', exact: true }),
  ).toBeVisible()
})

test('release contributor rejects a concurrent metadata edit and saves after reopening the latest draft', async ({
  page,
  context,
}) => {
  await authenticate(context)
  await page.request.post('http://localhost:3103/test/music')
  await gotoHydrated(page, `/dashboard/music/${workspaceDraftId}`)
  await page
    .getByRole('button', { name: 'Add contributor', exact: true })
    .click()
  const dialog = page.getByRole('dialog', {
    name: 'Add contributor',
    exact: true,
  })
  await dialog.getByLabel('Contributor name').fill('Jordan Lee')
  await dialog.getByLabel('Producer', { exact: true }).check()
  const releaseResponse = await page.request.get(
    `http://localhost:3103/api/v1/releases/${workspaceDraftId}`,
  )
  const before: ApiSchemas['ReleaseEntity'] = await releaseResponse.json()
  expect(
    (
      await page.request.patch(
        `http://localhost:3103/api/v1/releases/${workspaceDraftId}`,
        {
          data: {
            title: 'Concurrent title',
            expectedUpdatedAt: before.updatedAt,
          },
        },
      )
    ).ok(),
  ).toBe(true)
  await dialog
    .getByRole('button', { name: 'Save contributor', exact: true })
    .click()
  await expect(dialog.getByRole('alert')).toContainText('release changed')
  await dialog.getByRole('button', { name: 'Cancel', exact: true }).click()
  await page
    .getByRole('button', { name: 'Add contributor', exact: true })
    .click()
  await dialog.getByLabel('Contributor name').fill('Jordan Lee')
  await dialog.getByLabel('Producer', { exact: true }).check()
  await dialog
    .getByRole('button', { name: 'Save contributor', exact: true })
    .click()
  await expect(dialog).not.toBeVisible()
  await expect(
    page
      .getByRole('heading', { name: 'Concurrent title', exact: true })
      .first(),
  ).toBeVisible()
  await expect(
    page.getByRole('heading', { name: 'Jordan Lee', exact: true }),
  ).toBeVisible()
})

test('rights, splits and identifiers update the readiness checklist', async ({
  page,
  context,
}) => {
  await seedCredit(page, context)
  await gotoHydrated(page, `/dashboard/music/${workspaceDraftId}`)
  const checklist = page.getByRole('list', { name: 'Blockers' })
  await expect(checklist).toContainText('Choose the master owner')
  await expect(checklist).toContainText('Master splits total 0% of 100%')
  const submit = page.getByRole('button', {
    name: 'Submit for review',
    exact: true,
  })
  await expect(submit).toBeDisabled()

  await page.getByRole('button', { name: 'Edit rights', exact: true }).click()
  const rights = page.getByRole('dialog', { name: 'Rights confirmation' })
  await rights.getByLabel('Another owner, such as a label').check()
  await rights.getByLabel('Master owner name').fill('North Label')
  await rights.getByLabel('All songwriters and composers are listed').check()
  await rights.getByLabel('I confirm this information is accurate').check()
  await rights.getByRole('button', { name: 'Save rights', exact: true }).click()
  await expect(rights).not.toBeVisible()
  await expect(page.getByText('North Label', { exact: true })).toBeVisible()
  await expect(checklist).not.toContainText('Choose the master owner')

  await page
    .getByRole('button', { name: 'Edit master splits', exact: true })
    .click()
  const splits = page.getByRole('dialog', { name: 'Master splits' })
  await splits.getByLabel('Taylor Reid').fill('120')
  await expect(splits.getByRole('alert')).toContainText(
    'Use a share between 0.01% and 100%',
  )
  await splits.getByLabel('Taylor Reid').fill('100')
  await expect(splits.getByText('Total 100% of 100%')).toBeVisible()
  await splits.getByRole('button', { name: 'Save splits', exact: true }).click()
  await expect(splits).not.toBeVisible()
  await expect(checklist).not.toContainText('Master splits')
  // New splits change the rights data, so accuracy must be confirmed again.
  await expect(checklist).toContainText('Confirm the information is accurate')

  await page.getByRole('button', { name: 'Edit UPC', exact: true }).click()
  const upc = page.getByRole('dialog', { name: 'Release barcode' })
  await upc.getByLabel('Release UPC/EAN').fill('036000291453')
  await upc.getByRole('button', { name: 'Save code', exact: true }).click()
  await expect(upc.getByRole('alert')).toContainText('valid check digit')
  await upc.getByRole('button', { name: 'Cancel', exact: true }).click()

  await expect(checklist).toContainText('Add at least one track')
  await page.getByLabel('I reviewed the information in this draft.').check()
  await expect(submit).toBeDisabled()
})

test('release contributor action is unavailable outside DRAFT', async ({
  page,
  context,
}) => {
  await authenticate(context)
  await page.request.post('http://localhost:3103/test/music')
  await gotoHydrated(page, `/dashboard/music/${workspaceDemoId}`)
  await expect(
    page.getByRole('heading', { name: 'Afterglow', exact: true }).first(),
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Add contributor', exact: true }),
  ).toHaveCount(0)
})

for (const theme of ['light', 'dark', 'dim']) {
  test(`${theme} release contributor adds real credits and keeps them after reload`, async ({
    page,
    context,
  }, testInfo) => {
    const originalViewport = page.viewportSize()
    const pageErrors: string[] = []
    page.on('pageerror', (error) => pageErrors.push(error.message))
    await authenticate(context)
    await page.request.post('http://localhost:3103/test/music')
    await page.addInitScript(
      (value) => localStorage.setItem('bitrate.artist-theme.v1', value),
      theme,
    )
    await gotoHydrated(page, `/dashboard/music/${workspaceDraftId}`)
    await page
      .getByRole('button', { name: 'Add contributor', exact: true })
      .click()
    const dialog = page.getByRole('dialog', {
      name: 'Add contributor',
      exact: true,
    })
    await dialog.getByLabel('Contributor name').fill(' Taylor Reid ')
    await dialog.getByLabel('Performer', { exact: true }).check()
    await dialog.getByLabel('Composer', { exact: true }).check()
    for (const width of [320, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 })
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true)
      const bounds = await dialog.boundingBox()
      expect(
        bounds && bounds.x >= 0 && bounds.x + bounds.width <= width,
      ).toBeTruthy()
    }
    if (originalViewport) await page.setViewportSize(originalViewport)
    await dialog
      .getByRole('heading', { name: 'Add contributor', exact: true })
      .click()
    await page.screenshot({
      path: `../../output/playwright/release-contributors/${theme}-${testInfo.project.name}.png`,
    })
    const save = dialog.getByRole('button', {
      name: 'Save contributor',
      exact: true,
    })
    await save.click()
    await expect(dialog).not.toBeVisible()
    const panel = page.getByRole('region', { name: 'Participants (1)' })
    await expect(
      panel.getByRole('heading', { name: 'Taylor Reid' }),
    ).toBeVisible()
    await expect(
      panel.getByText('Performer · Composer', { exact: true }),
    ).toBeVisible()
    await page.reload()
    await expect(
      panel.getByRole('heading', { name: 'Taylor Reid' }),
    ).toBeVisible()
    await expect(
      page
        .getByRole('heading', { name: 'Steel Ball Run', exact: true })
        .first(),
    ).toBeVisible()
    expect(pageErrors).toEqual([])
  })
}

for (const theme of ['light', 'dark', 'dim']) {
  test(`${theme} release schedule saves an exact UTC instant, survives reload and can be cleared`, async ({
    page,
    context,
  }, testInfo) => {
    const pageErrors: string[] = []
    page.on('pageerror', (error) => pageErrors.push(error.message))
    await authenticate(context)
    await page.request.post('http://localhost:3103/test/music')
    await page.addInitScript(
      (value) => localStorage.setItem('bitrate.artist-theme.v1', value),
      theme,
    )
    await gotoHydrated(page, `/dashboard/music/${workspaceDraftId}`)
    await page
      .getByRole('button', { name: 'Edit schedule', exact: true })
      .click()
    const dialog = page.getByRole('dialog', {
      name: 'Release timing',
      exact: true,
    })
    await dialog.getByLabel('Set a planned release date').check()
    await dialog.getByLabel('Release date', { exact: true }).fill('2026-11-01')
    await dialog.getByLabel('Time (UTC)', { exact: true }).fill('12:30:15.125')
    await expect(
      dialog.getByRole('button', { name: 'Save schedule', exact: true }),
    ).toBeEnabled()
    await dialog
      .getByRole('heading', { name: 'Release timing', exact: true })
      .click()
    await page.screenshot({
      path: `../../output/playwright/release-schedule/${theme}-${testInfo.project.name}.png`,
    })
    for (const width of [320, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 })
      const box = await dialog.boundingBox()
      expect(box).not.toBeNull()
      expect(box?.x).toBeGreaterThanOrEqual(0)
      expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(width)
      expect(
        await dialog.evaluate(
          (element) => element.scrollWidth <= element.clientWidth,
        ),
      ).toBe(true)
    }
    const saved = page.waitForResponse(
      (response) => response.request().method() === 'PATCH',
    )
    await dialog
      .getByRole('button', { name: 'Save schedule', exact: true })
      .click()
    expect((await (await saved).json()).scheduledAt).toBe(
      '2026-11-01T12:30:15.125Z',
    )
    await expect(dialog).not.toBeVisible()
    await expect(
      page.getByText('Nov 1, 2026, 12:30 PM UTC', { exact: true }),
    ).toBeVisible()
    await page.reload()
    await expect(
      page.getByText('Nov 1, 2026, 12:30 PM UTC', { exact: true }),
    ).toBeVisible()
    await page
      .getByRole('button', { name: 'Edit schedule', exact: true })
      .click()
    await expect(dialog.getByLabel('Time (UTC)', { exact: true })).toHaveValue(
      '12:30:15.125',
    )
    await expect(
      dialog.getByRole('button', { name: 'Save schedule', exact: true }),
    ).toBeDisabled()
    await dialog.getByLabel('Set a planned release date').uncheck()
    await dialog
      .getByRole('button', { name: 'Save schedule', exact: true })
      .click()
    await expect(dialog).not.toBeVisible()
    await expect(page.getByText('Not scheduled', { exact: true })).toBeVisible()
    await page.reload()
    await expect(page.getByText('Not scheduled', { exact: true })).toBeVisible()
    const result = await page.request.get(
      `http://localhost:3103/api/v1/releases/${workspaceDraftId}`,
    )
    expect(await result.json()).toMatchObject({
      title: 'Steel Ball Run',
      type: 'SINGLE',
      status: 'DRAFT',
      scheduledAt: null,
    })
    expect(pageErrors).toEqual([])
  })
}

for (const failure of [409, 503, 'unconfirmed'] as const) {
  test(`release schedule keeps entries after ${failure} and never retries a write automatically`, async ({
    page,
    context,
  }) => {
    await authenticate(context)
    await page.request.post('http://localhost:3103/test/music')
    await gotoHydrated(page, `/dashboard/music/${workspaceDraftId}`)
    await page
      .getByRole('button', { name: 'Edit schedule', exact: true })
      .click()
    const dialog = page.getByRole('dialog', {
      name: 'Release timing',
      exact: true,
    })
    await dialog.getByLabel('Set a planned release date').check()
    await dialog.getByLabel('Release date', { exact: true }).fill('2026-11-01')
    let writes = 0
    await page.route('**/api/v1/releases/*', async (route) => {
      if (route.request().method() !== 'PATCH') return route.continue()
      writes++
      if (failure === 'unconfirmed') {
        const before = await page.request.get(
          `http://localhost:3103/api/v1/releases/${workspaceDraftId}`,
        )
        return route.fulfill({ json: await before.json() })
      }
      return route.fulfill({ status: failure, json: { message: 'Failed' } })
    })
    await dialog
      .getByRole('button', { name: 'Save schedule', exact: true })
      .click()
    await expect(dialog.getByRole('alert')).toContainText(
      failure === 409 ? 'changed or is no longer a draft' : 'Could not confirm',
    )
    expect(writes).toBe(1)
    await expect(
      dialog.getByLabel('Release date', { exact: true }),
    ).toHaveValue('2026-11-01')
    await expect(page.getByText('Not scheduled', { exact: true })).toBeVisible()
    await expect(
      page.getByRole('status').filter({ hasText: 'Draft updated.' }),
    ).not.toBeVisible()
    await dialog.getByRole('button', { name: 'Cancel', exact: true }).click()
    await expect(
      page.getByRole('button', { name: 'Edit schedule', exact: true }),
    ).toBeFocused()
  })
}

test('release schedule validates an enabled empty date and locks dismissal while saving', async ({
  page,
  context,
}) => {
  await authenticate(context)
  await page.request.post('http://localhost:3103/test/music')
  await gotoHydrated(page, `/dashboard/music/${workspaceDraftId}`)
  await page.getByRole('button', { name: 'Edit schedule', exact: true }).click()
  const dialog = page.getByRole('dialog', {
    name: 'Release timing',
    exact: true,
  })
  await dialog.getByLabel('Set a planned release date').check()
  await dialog
    .getByRole('button', { name: 'Save schedule', exact: true })
    .click()
  await expect(dialog.getByRole('alert')).toHaveText(
    'Choose a valid release date.',
  )
  await dialog.getByLabel('Release date', { exact: true }).fill('2026-11-01')
  let finish = () => {}
  const pending = new Promise<void>((resolve) => {
    finish = resolve
  })
  await page.route('**/api/v1/releases/*', async (route) => {
    if (route.request().method() !== 'PATCH') return route.continue()
    await pending
    return route.continue()
  })
  try {
    await dialog
      .getByRole('button', { name: 'Save schedule', exact: true })
      .click()
    await expect(
      dialog.getByRole('button', { name: 'Saving schedule…', exact: true }),
    ).toBeDisabled()
    await expect(
      dialog.getByRole('button', { name: 'Close dialog' }),
    ).toBeDisabled()
    await page.keyboard.press('Escape')
    await expect(dialog).toBeVisible()
    await expect(
      dialog.getByLabel('Release date', { exact: true }),
    ).toBeDisabled()
  } finally {
    finish()
  }
  await expect(dialog).not.toBeVisible()
})

test('release schedule reloads the fresh version after a concurrent metadata edit', async ({
  page,
  context,
}) => {
  await authenticate(context)
  await page.request.post('http://localhost:3103/test/music')
  await gotoHydrated(page, `/dashboard/music/${workspaceDraftId}`)
  await page.getByRole('button', { name: 'Edit schedule', exact: true }).click()
  const dialog = page.getByRole('dialog', {
    name: 'Release timing',
    exact: true,
  })
  await dialog.getByLabel('Set a planned release date').check()
  await dialog.getByLabel('Release date', { exact: true }).fill('2026-11-01')
  const before = await (
    await page.request.get(
      `http://localhost:3103/api/v1/releases/${workspaceDraftId}`,
    )
  ).json()
  const changed = await page.request.patch(
    `http://localhost:3103/api/v1/releases/${workspaceDraftId}`,
    {
      data: {
        title: 'Changed in another tab',
        expectedUpdatedAt: before.updatedAt,
      },
    },
  )
  expect(changed.status()).toBe(200)
  await dialog
    .getByRole('button', { name: 'Save schedule', exact: true })
    .click()
  await expect(dialog.getByRole('alert')).toContainText(
    'changed or is no longer a draft',
  )
  await dialog.getByRole('button', { name: 'Cancel', exact: true }).click()
  await page.getByRole('button', { name: 'Edit schedule', exact: true }).click()
  await dialog.getByLabel('Set a planned release date').check()
  await dialog.getByLabel('Release date', { exact: true }).fill('2026-11-01')
  await dialog
    .getByRole('button', { name: 'Save schedule', exact: true })
    .click()
  await expect(dialog).not.toBeVisible()
  await expect(
    page.getByRole('heading', { name: 'Changed in another tab', level: 1 }),
  ).toBeVisible()
})

test('release workspace waits for confirmed data before showing an empty state', async ({
  page,
  context,
}) => {
  await authenticate(context)
  await page.request.post('http://localhost:3103/test/music')
  let finish: () => void = () => {}
  const gate = new Promise<void>((resolve) => {
    finish = resolve
  })
  await page.route('**/api/v1/releases/*/workspace', async (route) => {
    await gate
    await route.continue()
  })
  try {
    await gotoHydrated(page, `/dashboard/music/${workspaceDraftId}`)
    await expect(page.getByRole('status')).toContainText(
      'Loading release workspace…',
    )
    await expect(
      page.getByText('No tracks linked yet. Track uploads are coming soon.'),
    ).toHaveCount(0)
  } finally {
    finish()
  }
  await expect(
    page.getByRole('heading', { name: 'Steel Ball Run', level: 1 }),
  ).toBeVisible()
})

test('release workspace wraps long release, recording and participant names across breakpoints', async ({
  page,
  context,
}) => {
  await authenticate(context)
  await page.request.post('http://localhost:3103/test/music')
  const title = 'LongReleaseTitle'.repeat(15)
  await page.route('**/api/v1/releases/*/workspace', async (route) => {
    const response = await route.fetch()
    const record: ApiSchemas['ReleaseWorkspaceEntity'] = await response.json()
    await route.fulfill({
      json: {
        ...record,
        title,
        status: 'DRAFT',
        trackDrafts: record.trackDrafts.map((track) => ({ ...track, title })),
        participants: [
          { id: workspaceDraftId, displayName: title, roles: ['OTHER'] },
        ],
        participantCount: 1,
      },
    })
  })
  await gotoHydrated(page, `/dashboard/music/${workspaceDemoId}`)
  await expect(
    page.getByRole('heading', { name: title, level: 1 }),
  ).toBeVisible()
  for (const width of [320, 390, 768, 991, 1440, 1920]) {
    await page.setViewportSize({ width, height: 1040 })
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true)
    const edit = page.getByRole('button', { name: 'Edit draft', exact: true })
    expect((await edit.boundingBox())?.width).toBeLessThan(width)
  }
})

for (const theme of ['light', 'dark', 'dim'] as const) {
  test(`${theme} release workspace follows the shared design geometry and shows real linked records`, async ({
    page,
    context,
    isMobile,
  }, testInfo) => {
    await page.setViewportSize({
      width: isMobile ? 390 : 1440,
      height: isMobile ? 2006 : 1040,
    })
    await page.addInitScript(
      (value) => localStorage.setItem('bitrate.artist-theme.v1', value),
      theme,
    )
    await authenticate(context)
    await page.request.post('http://localhost:3103/test/music')
    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(error.message))
    await gotoHydrated(page, '/dashboard/music?tab=releases')
    await page
      .getByRole('button', { name: 'Open Afterglow', exact: true })
      .click()
    await page
      .getByRole('link', { name: 'Open workspace', exact: true })
      .click()
    await expect(page).toHaveURL(
      new RegExp(`/dashboard/music/${workspaceDemoId}$`),
    )
    await expect(
      page.getByRole('heading', { name: 'Afterglow', level: 1 }),
    ).toBeVisible()
    await expect(
      page.getByRole('heading', { name: 'Tracks (1)', exact: true }),
    ).toBeVisible()
    await expect(
      page.getByRole('heading', { name: 'Participants (0)', exact: true }),
    ).toBeVisible()
    await expect(page.getByText('Needs changes', { exact: true })).toBeVisible()
    await expect(
      page.getByText('No credited participants yet.', { exact: true }),
    ).toBeVisible()
    await expect(page.getByText('Not scheduled', { exact: true })).toBeVisible()
    await expect(
      page.getByRole('button', { name: 'Edit draft', exact: true }),
    ).toHaveCount(0)
    const waveform = page.locator('.artist-release-waveform')
    await expect(waveform).toHaveJSProperty('naturalWidth', 2172)
    await page.evaluate(() => document.fonts.ready)
    const bounds = await page
      .getByRole('region', { name: 'Release summary' })
      .boundingBox()
    expect(bounds?.x).toBe(isMobile ? 24 : 296)
    expect(bounds?.width).toBe(isMobile ? 342 : 1096)
    expect(
      Math.abs((bounds?.y ?? 0) - (isMobile ? 282 : 224)),
    ).toBeLessThanOrEqual(2)
    await page.screenshot({
      path: `../../output/playwright/release-workspace/${theme}-${testInfo.project.name}.png`,
      fullPage: true,
      scale: 'css',
    })
    for (const width of [320, 390, 768, 991, 1440, 1920]) {
      await page.setViewportSize({ width, height: 1040 })
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true)
    }
    await page.reload()
    await expect(
      page.getByRole('heading', { name: 'Afterglow', level: 1 }),
    ).toBeVisible()
    expect(errors).toEqual([])
    await page
      .getByRole('link', { name: 'Back to music', exact: true })
      .filter({ visible: true })
      .click()
    await expect(
      page.getByRole('button', { name: 'Open Afterglow', exact: true }),
    ).toBeVisible()
  })
}

test('release workspace edits an owned draft, refreshes its summary and persists on reload', async ({
  page,
  context,
}) => {
  await authenticate(context)
  await page.request.post('http://localhost:3103/test/music')
  await gotoHydrated(page, `/dashboard/music/${workspaceDraftId}`)
  await expect(
    page.getByText('No tracks linked yet. Track uploads are coming soon.'),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Edit draft', exact: true }).click()
  const dialog = page.getByRole('dialog', { name: 'Edit draft', exact: true })
  await dialog.getByLabel('Release title').fill('Workspace draft updated')
  await dialog.getByLabel('Release type').selectOption('EP')
  await dialog
    .getByRole('button', { name: 'Save changes', exact: true })
    .click()
  await expect(dialog).not.toBeVisible()
  await expect(
    page.getByRole('heading', { name: 'Workspace draft updated', level: 1 }),
  ).toBeVisible()
  await expect(
    page.getByRole('status').filter({ hasText: 'Draft updated.' }),
  ).toBeVisible()
  await page.reload()
  await expect(
    page.getByRole('heading', { name: 'Workspace draft updated', level: 1 }),
  ).toBeVisible()
  await expect(page.locator('.artist-release-page-heading')).toContainText(
    'EP · Draft',
  )
})

test('release workspace shows scheduled UTC date, real credits and bounded recording counts', async ({
  page,
  context,
}) => {
  await authenticate(context)
  await page.request.post('http://localhost:3103/test/music')
  await page.route('**/api/v1/releases/*/workspace', async (route) => {
    const response = await route.fetch()
    const record: ApiSchemas['ReleaseWorkspaceEntity'] = await response.json()
    await route.fulfill({
      json: {
        ...record,
        scheduledAt: '2026-11-01T12:00:00Z',
        trackCount: 55,
        participantCount: 51,
        participants: [
          {
            id: workspaceDraftId,
            displayName: 'Credited producer',
            roles: ['PRODUCER', 'COMPOSER'],
          },
        ],
      },
    })
  })
  await gotoHydrated(page, `/dashboard/music/${workspaceDemoId}`)
  await expect(
    page.getByText('Nov 1, 2026, 12:00 PM UTC', { exact: true }),
  ).toBeVisible()
  await expect(
    page.getByText('Producer · Composer', { exact: true }),
  ).toBeVisible()
  await expect(
    page.getByText('Showing 1 of 51 participants.', { exact: true }),
  ).toBeVisible()
  await expect(page.getByText(/Showing 1 of 55 tracks/)).toBeVisible()
})

for (const status of [404, 503, 200]) {
  test(`release workspace handles ${status} without a false empty or private result and retries reads`, async ({
    page,
    context,
  }) => {
    await authenticate(context)
    await page.request.post('http://localhost:3103/test/music')
    let reads = 0
    await page.route('**/api/v1/releases/*/workspace', (route) => {
      reads++
      return route.fulfill({ status, json: {} })
    })
    await gotoHydrated(page, `/dashboard/music/${workspaceDemoId}`)
    await expect(page.getByRole('alert')).toContainText(
      status === 404
        ? 'no longer available'
        : 'Could not load this release workspace',
    )
    await expect(
      page.getByRole('heading', { name: 'Afterglow', level: 1 }),
    ).toHaveCount(0)
    expect(reads).toBe(1)
    await page.unroute('**/api/v1/releases/*/workspace')
    await page.getByRole('button', { name: 'Try again', exact: true }).click()
    await expect(
      page.getByRole('heading', { name: 'Afterglow', level: 1 }),
    ).toBeVisible()
  })
}

test('release workspace keeps a foreign release unavailable after switching artist', async ({
  page,
  context,
}) => {
  await authenticate(context)
  await page.request.post('http://localhost:3103/test/music')
  await gotoHydrated(page, `/dashboard/music/${workspaceDraftId}`)
  await expect(
    page.getByRole('heading', { name: 'Steel Ball Run', level: 1 }),
  ).toBeVisible()
  await authenticate(context, 'test-other')
  await page.reload()
  await expect(page.getByRole('alert')).toContainText(
    'This release is no longer available.',
  )
  await expect(
    page.getByRole('heading', { name: 'Steel Ball Run', level: 1 }),
  ).toHaveCount(0)
})

test('release workspace deep links require a server-verified artist session', async ({
  page,
}) => {
  await gotoHydrated(page, `/dashboard/music/${workspaceDraftId}`)
  await expect(page).toHaveURL(/\/login\?next=/)
  await expect(
    page.getByRole('heading', { name: 'Steel Ball Run', level: 1 }),
  ).toHaveCount(0)
})

test('draft editing validates entries, cancels without saving and keeps non-drafts read-only', async ({
  page,
  context,
}) => {
  let writes = 0
  page.on('request', (request) => {
    if (request.method() === 'PATCH') writes++
  })
  const dialog = await openSeededDraft(page, context)
  await expect(
    dialog.getByRole('button', { name: 'Save changes', exact: true }),
  ).toBeDisabled()
  await dialog.getByLabel('Release title').fill('   ')
  await dialog
    .getByRole('button', { name: 'Save changes', exact: true })
    .click()
  await expect(dialog.getByRole('alert')).toHaveText('Enter a release title')
  await dialog.getByLabel('Release title').fill('Do not save this')
  await dialog.getByRole('button', { name: 'Cancel', exact: true }).click()
  expect(writes).toBe(0)
  await expect(
    page.getByRole('button', { name: 'Open Steel Ball Run', exact: true }),
  ).toBeVisible()
  for (const title of ['Afterglow', 'Echoes EP']) {
    await page
      .getByRole('button', { name: `Open ${title}`, exact: true })
      .click()
    await expect(
      page.getByRole('button', { name: 'Edit draft', exact: true }),
    ).toHaveCount(0)
    await page.keyboard.press('Escape')
    await page
      .getByRole('button', { name: `Actions for ${title}`, exact: true })
      .click()
    await expect(
      page.getByRole('button', { name: 'Edit draft', exact: true }),
    ).toHaveCount(0)
    await page.keyboard.press('Escape')
  }
  await page
    .getByRole('button', { name: 'Actions for Steel Ball Run', exact: true })
    .click()
  await page.getByRole('button', { name: 'Edit draft', exact: true }).click()
  await expect(page.getByLabel('Release title')).toHaveValue('Steel Ball Run')
})

for (const status of [409, 503, 200]) {
  test(`draft editing preserves entries after ${status} without an automatic retry or false success`, async ({
    page,
    context,
  }) => {
    let writes = 0
    await page.route('**/api/v1/releases/*', (route) => {
      if (route.request().method() !== 'PATCH') return route.continue()
      writes++
      return route.fulfill({ status, json: {} })
    })
    const dialog = await openSeededDraft(page, context)
    await dialog.getByLabel('Release title').fill('Kept entries')
    await dialog.getByLabel('Release type').selectOption('ALBUM')
    await dialog
      .getByRole('button', { name: 'Save changes', exact: true })
      .click()
    await expect(dialog.getByRole('alert')).toContainText(
      status === 409
        ? 'This release changed'
        : 'Could not confirm your changes were saved',
    )
    await expect(dialog.getByLabel('Release title')).toHaveValue('Kept entries')
    await expect(dialog.getByLabel('Release type')).toHaveValue('ALBUM')
    await expect(
      page.getByRole('status').filter({ hasText: 'Draft updated:' }),
    ).toHaveCount(0)
    expect(writes).toBe(1)
    await dialog.getByRole('button', { name: 'Cancel', exact: true }).click()
    await page
      .getByRole('button', { name: 'Open Steel Ball Run', exact: true })
      .click()
    await page.getByRole('button', { name: 'Edit draft', exact: true }).click()
    await expect(page.getByLabel('Release title')).toHaveValue('Steel Ball Run')
    await page.unroute('**/api/v1/releases/*')
    await page.getByLabel('Release title').fill('Recovered edit')
    await page
      .getByRole('button', { name: 'Save changes', exact: true })
      .click()
    await expect(
      page.getByRole('button', { name: 'Open Recovered edit', exact: true }),
    ).toBeVisible()
  })
}

test('draft editing detects a real concurrent update and loads its new version on reopen', async ({
  page,
  context,
}) => {
  const dialog = await openSeededDraft(page, context)
  const url =
    'http://localhost:3103/api/v1/releases/019a0000-0000-7000-8000-000000000200'
  const before = (await (
    await page.request.get(url)
  ).json()) as ApiSchemas['ReleaseEntity']
  const response = await page.request.patch(url, {
    data: {
      title: 'Saved in another tab',
      type: 'EP',
      expectedUpdatedAt: before.updatedAt,
    },
  })
  expect(response.ok()).toBe(true)
  await dialog.getByLabel('Release title').fill('My unsaved edits')
  await dialog
    .getByRole('button', { name: 'Save changes', exact: true })
    .click()
  await expect(dialog.getByRole('alert')).toContainText('This release changed')
  await expect(dialog.getByLabel('Release title')).toHaveValue(
    'My unsaved edits',
  )
  await dialog.getByRole('button', { name: 'Cancel', exact: true }).click()
  await page
    .getByRole('button', { name: 'Open Steel Ball Run', exact: true })
    .click()
  await page.getByRole('button', { name: 'Edit draft', exact: true }).click()
  await expect(page.getByLabel('Release title')).toHaveValue(
    'Saved in another tab',
  )
  await expect(page.getByLabel('Release type')).toHaveValue('EP')
})

test('draft editing locks dismissal and repeated submits during an outstanding save', async ({
  page,
  context,
}) => {
  let writes = 0
  let resume!: () => void
  const gate = new Promise<void>((resolve) => {
    resume = resolve
  })
  await page.route('**/api/v1/releases/*', async (route) => {
    if (route.request().method() !== 'PATCH') return route.continue()
    writes++
    await gate
    await route.continue()
  })
  const dialog = await openSeededDraft(page, context)
  await dialog.getByLabel('Release title').fill('Pending edit')
  await dialog
    .getByRole('button', { name: 'Save changes', exact: true })
    .click()
  try {
    await expect(
      dialog.getByRole('button', { name: 'Saving changes…', exact: true }),
    ).toBeDisabled()
    await expect(
      dialog.getByRole('button', { name: 'Close dialog', exact: true }),
    ).toBeDisabled()
    await expect(
      dialog.getByRole('button', { name: 'Cancel', exact: true }),
    ).toBeDisabled()
    await expect(dialog.getByLabel('Release title')).toBeDisabled()
    await page.keyboard.press('Escape')
    await expect(dialog).toBeVisible()
    expect(writes).toBe(1)
  } finally {
    resume()
  }
  await expect(
    page.getByRole('button', { name: 'Open Pending edit', exact: true }),
  ).toBeVisible()
})

test('draft editing shows recoverable load errors and does not edit a newly submitted release', async ({
  page,
  context,
}) => {
  await page.route('**/api/v1/releases/*', (route) =>
    route.fulfill({ status: 503, json: {} }),
  )
  const dialog = await openSeededDraft(page, context)
  await expect(dialog.getByRole('alert')).toContainText(
    'Could not load the latest release',
  )
  await expect(dialog.getByLabel('Release title')).toHaveCount(0)
  await page.unroute('**/api/v1/releases/*')
  await page.route('**/api/v1/releases/*', async (route) => {
    const response = await route.fetch()
    const data = (await response.json()) as ApiSchemas['ReleaseEntity']
    await route.fulfill({ response, json: { ...data, status: 'SUBMITTED' } })
  })
  await dialog.getByRole('button', { name: 'Try again', exact: true }).click()
  await expect(dialog.getByRole('alert')).toContainText('no longer a draft')
  await expect(dialog.getByLabel('Release title')).toHaveCount(0)
})

for (const theme of ['light', 'dark', 'dim'] as const) {
  test(`${theme} draft editing saves title and type and survives reload`, async ({
    page,
    context,
  }, testInfo) => {
    await page.addInitScript(
      (value) => localStorage.setItem('bitrate.artist-theme.v1', value),
      theme,
    )
    await authenticate(context)
    await page.request.post('http://localhost:3103/test/music')
    const pageErrors: string[] = []
    page.on('pageerror', (error) => pageErrors.push(error.message))
    await gotoHydrated(page, '/dashboard/music?tab=releases')
    await page
      .getByRole('button', { name: 'Open Steel Ball Run', exact: true })
      .click()
    await page.getByRole('button', { name: 'Edit draft', exact: true }).click()
    const dialog = page.getByRole('dialog', { name: 'Edit draft', exact: true })
    await expect(dialog.getByLabel('Release title')).toHaveValue(
      'Steel Ball Run',
    )
    await expect(dialog.getByLabel('Release title')).toBeFocused()
    await dialog.getByLabel('Release title').fill('  Steel Ball Run Deluxe  ')
    await dialog.getByLabel('Release type').selectOption('EP')
    await page.screenshot({
      path: `../../output/playwright/artist-release-edit/${theme}-${testInfo.project.name}.png`,
      fullPage: true,
      scale: 'css',
    })
    await dialog
      .getByRole('button', { name: 'Save changes', exact: true })
      .click()
    await expect(dialog).not.toBeVisible()
    await expect(
      page
        .getByRole('status')
        .filter({ hasText: 'Draft updated: Steel Ball Run Deluxe' }),
    ).toBeVisible()
    const row = page.getByRole('row').filter({
      has: page.getByRole('button', {
        name: 'Open Steel Ball Run Deluxe',
        exact: true,
      }),
    })
    await expect(row).toContainText('EP')
    await expect(row).toContainText('Draft')
    await page.reload()
    await expect(
      page.getByRole('button', {
        name: 'Open Steel Ball Run Deluxe',
        exact: true,
      }),
    ).toBeVisible()
    expect(pageErrors).toEqual([])
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true)
  })
}

for (const theme of ['light', 'dark', 'dim'] as const) {
  test(`${theme} Music catalogue filters, previews, details and responsive table work`, async ({
    page,
    context,
  }, testInfo) => {
    await page.setViewportSize(
      testInfo.project.name === 'chromium'
        ? { width: 1440, height: 1040 }
        : { width: 390, height: 1380 },
    )
    await page.addInitScript(
      (value) => localStorage.setItem('bitrate.artist-theme.v1', value),
      theme,
    )
    await authenticate(context)
    await page.request.post('http://localhost:3103/test/music')
    const pageErrors: string[] = []
    const consoleErrors: string[] = []
    page.on('pageerror', (error) => pageErrors.push(error.message))
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text())
    })
    await gotoHydrated(page, '/dashboard/music')
    const table = page.getByRole('table', { name: 'Your tracks' })
    await expect(table.locator('tbody tr')).toHaveCount(6)
    await expect(
      page.getByRole('button', { name: 'Tracks 6', exact: true }),
    ).toBeVisible()
    await expect(
      page.getByRole('button', { name: 'Releases 3', exact: true }),
    ).toBeVisible()
    await expect
      .poll(() =>
        page
          .locator('.artist-music-cover[src]')
          .evaluateAll((images) =>
            images.every(
              (image) =>
                image instanceof HTMLImageElement &&
                image.complete &&
                image.naturalWidth > 0,
            ),
          ),
      )
      .toBe(true)
    await page
      .getByRole('button', { name: 'Play Night Signal', exact: true })
      .click()
    await expect(
      page.getByRole('button', { name: 'Pause Night Signal', exact: true }),
    ).toBeVisible()
    await page.screenshot({
      path: `../../output/playwright/artist-music/${theme}-${testInfo.project.name}-tracks.png`,
      fullPage: true,
      scale: 'css',
    })
    await page
      .getByRole('button', { name: 'Pause Night Signal', exact: true })
      .click()
    await page
      .getByRole('button', { name: 'Play Night Signal', exact: true })
      .click()
    await page
      .getByRole('button', { name: 'Play Afterglow', exact: true })
      .click()
    await expect
      .poll(() =>
        page
          .locator('audio')
          .evaluate(
            (audio) => audio instanceof HTMLAudioElement && !audio.paused,
          ),
      )
      .toBe(true)
    await expect(
      page.getByRole('button', { name: 'Play Night Signal', exact: true }),
    ).toBeVisible()
    await page
      .getByRole('button', { name: 'Pause Afterglow', exact: true })
      .click()
    await page.getByLabel('Status filter').selectOption('NEEDS_CHANGES')
    await page.getByLabel('Type filter').selectOption('REMASTER')
    await page.getByRole('textbox', { name: 'Search tracks' }).fill('After')
    await expect(table.locator('tbody tr')).toHaveCount(1)
    await expect(
      page.getByRole('button', { name: 'Open Afterglow', exact: true }),
    ).toBeVisible()
    await page
      .getByRole('textbox', { name: 'Search tracks' })
      .fill('nothing matches')
    await expect(
      page.getByRole('heading', { name: 'No matching tracks' }),
    ).toBeVisible()
    await page
      .getByRole('button', { name: 'Reset filters', exact: true })
      .click()
    await expect(table.locator('tbody tr')).toHaveCount(6)
    await page.getByLabel('Sort catalogue').selectOption('title')
    await expect(table.locator('tbody tr').first()).toContainText('Afterglow')
    await page
      .getByRole('button', { name: 'Open Night Signal', exact: true })
      .click()
    await expect(
      page.getByRole('dialog', { name: 'Night Signal', exact: true }),
    ).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(
      page.getByRole('button', { name: 'Open Night Signal', exact: true }),
    ).toBeFocused()
    await page
      .getByRole('button', { name: 'Actions for Afterglow', exact: true })
      .click()
    await page
      .getByRole('button', { name: 'View details', exact: true })
      .click()
    await expect(
      page.getByRole('dialog', { name: 'Afterglow', exact: true }),
    ).toBeVisible()
    await page.keyboard.press('Escape')
    await page
      .getByRole('button', { name: 'Upload track', exact: true })
      .click()
    await expect(
      page.getByRole('dialog', { name: 'Upload track', exact: true }),
    ).toContainText('coming soon')
    await page.keyboard.press('Escape')
    await page.getByRole('button', { name: 'Releases 3', exact: true }).click()
    await expect(
      page.getByRole('table', { name: 'Your releases' }).locator('tbody tr'),
    ).toHaveCount(3)
    await page.screenshot({
      path: `../../output/playwright/artist-music/${theme}-${testInfo.project.name}-releases.png`,
      fullPage: true,
      scale: 'css',
    })
    await gotoHydrated(page, page.url())
    await expect(
      page.getByRole('button', { name: 'Releases 3', exact: true }),
    ).toHaveAttribute('aria-pressed', 'true')
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
    ).toBe(false)
    expect(pageErrors).toEqual([])
    for (const tab of ['Releases 3', 'Tracks 6']) {
      await page.getByRole('button', { name: tab, exact: true }).click()
      for (const width of [320, 390, 768, 990, 991, 1440, 1920]) {
        await page.setViewportSize({ width, height: 900 })
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth > innerWidth,
          ),
        ).toBe(false)
        await expect(page.getByRole('table')).toBeVisible()
      }
    }
    expect(pageErrors).toEqual([])
    expect(consoleErrors).toEqual([])
  })
}

for (const theme of ['light', 'dark', 'dim'] as const) {
  test(`${theme} release drafts save through the API and appear in Music after reload`, async ({
    page,
    context,
  }, testInfo) => {
    await page.addInitScript(
      (value) => localStorage.setItem('bitrate.artist-theme.v1', value),
      theme,
    )
    await authenticate(context)
    await gotoHydrated(page, '/dashboard')
    await page
      .getByRole('button', { name: 'Create release', exact: true })
      .last()
      .click()
    const dialog = page.getByRole('dialog', {
      name: 'Create release',
      exact: true,
    })
    const title = `First release ${theme} ${testInfo.project.name}`
    await expect(dialog.getByLabel('Release title')).toBeFocused()
    await dialog.getByLabel('Release title').fill(`  ${title}  `)
    await dialog.getByLabel('Release type').selectOption('EP')
    await dialog
      .getByRole('button', { name: 'Create draft', exact: true })
      .click()
    await expect(page).toHaveURL(/\/dashboard\/music\?/)
    await expect(
      page.getByRole('button', { name: `Open ${title}`, exact: true }),
    ).toBeVisible()
    await expect(page.getByRole('status')).toContainText('Draft created')
    await expect(dialog).not.toBeVisible()
    await gotoHydrated(page, page.url())
    await expect(
      page.getByRole('button', { name: `Open ${title}`, exact: true }),
    ).toBeVisible()
    await page
      .getByRole('button', { name: 'Create release', exact: true })
      .last()
      .click()
    await expect(dialog.getByLabel('Release title')).toBeFocused()
    await dialog.getByRole('button', { name: 'Cancel', exact: true }).click()
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
    ).toBe(false)
  })
}

test('release drafts validate title locally and cancel without a write', async ({
  page,
  context,
}) => {
  let writes = 0
  page.on('request', (request) => {
    if (
      request.method() === 'POST' &&
      request.url().endsWith('/api/v1/releases')
    )
      writes++
  })
  await authenticate(context)
  await gotoHydrated(page, '/dashboard')
  const trigger = page.getByRole('button', {
    name: 'Create release',
    exact: true,
  })
  await trigger.click()
  const dialog = page.getByRole('dialog', {
    name: 'Create release',
    exact: true,
  })
  await dialog.getByLabel('Release title').fill('   ')
  await dialog
    .getByRole('button', { name: 'Create draft', exact: true })
    .click()
  await expect(dialog.getByRole('alert')).toHaveText('Enter a release title')
  await expect(dialog.getByLabel('Release title')).toBeFocused()
  await dialog.getByRole('button', { name: 'Cancel', exact: true }).click()
  await expect(dialog).not.toBeVisible()
  await expect(trigger).toBeFocused()
  expect(writes).toBe(0)
})

test('release drafts keep entered values after an API failure and allow retry', async ({
  page,
  context,
}, testInfo) => {
  await page.route('**/api/v1/releases', (route) =>
    route.fulfill({
      status: 503,
      json: { message: 'Internal database detail' },
    }),
  )
  await authenticate(context)
  await gotoHydrated(page, '/dashboard')
  await page
    .getByRole('button', { name: 'Create release', exact: true })
    .last()
    .click()
  const dialog = page.getByRole('dialog', {
    name: 'Create release',
    exact: true,
  })
  const title = `Recovered draft ${testInfo.project.name}`
  await dialog.getByLabel('Release title').fill(title)
  await dialog
    .getByRole('button', { name: 'Create draft', exact: true })
    .click()
  await expect(dialog.getByRole('alert')).toContainText(
    'Could not confirm your draft was saved',
  )
  await expect(dialog.getByLabel('Release title')).toHaveValue(title)
  await expect(page).toHaveURL(/\/dashboard$/)
  await expect(dialog).not.toContainText('Internal database detail')
  await page.unroute('**/api/v1/releases')
  await dialog
    .getByRole('button', { name: 'Create draft', exact: true })
    .click()
  await expect(
    page.getByRole('button', { name: `Open ${title}`, exact: true }),
  ).toBeVisible()
})

test('release drafts prevent repeated submits and dismissal while saving', async ({
  page,
  context,
}, testInfo) => {
  let writes = 0
  let resume!: () => void
  const gate = new Promise<void>((resolve) => {
    resume = resolve
  })
  await page.route('**/api/v1/releases', async (route) => {
    writes++
    await gate
    await route.continue()
  })
  await authenticate(context)
  await gotoHydrated(page, '/dashboard')
  await page
    .getByRole('button', { name: 'Create release', exact: true })
    .last()
    .click()
  const dialog = page.getByRole('dialog', {
    name: 'Create release',
    exact: true,
  })
  const title = `Pending draft ${testInfo.project.name}`
  await dialog.getByLabel('Release title').fill(title)
  await dialog
    .getByRole('button', { name: 'Create draft', exact: true })
    .click()
  try {
    await expect(
      dialog.getByRole('button', { name: 'Creating draft…', exact: true }),
    ).toBeDisabled()
    await expect(
      dialog.getByRole('button', { name: 'Close dialog' }),
    ).toBeDisabled()
    await expect(
      dialog.getByRole('button', { name: 'Cancel', exact: true }),
    ).toBeDisabled()
    await page.keyboard.press('Escape')
    await expect(dialog).toBeVisible()
    expect(writes).toBe(1)
  } finally {
    resume()
  }
  await expect(
    page.getByRole('button', { name: `Open ${title}`, exact: true }),
  ).toBeVisible()
  expect(writes).toBe(1)
})

for (const invalidResponse of [false, true]) {
  test(`release list recovers from ${invalidResponse ? 'invalid response data' : 'an API failure'} without displaying a fake empty state`, async ({
    page,
    context,
  }) => {
    await page.route('**/api/v1/artist-music/releases?*', (route) =>
      route.fulfill(
        invalidResponse
          ? { json: { data: [{}], total: 1, page: 1, limit: 20 } }
          : { status: 503, json: {} },
      ),
    )
    await authenticate(context)
    await gotoHydrated(page, '/dashboard/music?tab=releases')
    await expect(page.getByRole('alert')).toHaveText(
      'Could not load your releases. Please try again.',
    )
    await expect(
      page.getByRole('heading', { name: 'Your first release starts here' }),
    ).toHaveCount(0)
    await page.route('**/api/v1/artist-music/releases?*', (route) =>
      route.fulfill({ json: { data: [], total: 0, page: 1, limit: 20 } }),
    )
    await page.getByRole('button', { name: 'Try again', exact: true }).click()
    await expect(
      page.getByRole('heading', { name: 'Your first release starts here' }),
    ).toBeVisible()
  })
}

test('release list paginates and restores the selected page on reload', async ({
  page,
  context,
}) => {
  const records: ApiSchemas['MusicReleaseEntity'][] = Array.from(
    { length: 21 },
    (_, i) => ({
      id: `0199aee0-0000-7000-8000-${String(i + 1).padStart(12, '0')}`,
      title: `Release ${i + 1}`,
      artistName: 'Test artist',
      cover: null,
      isDemo: false,
      trackCount: 0,
      type: 'SINGLE',
      status: 'DRAFT',
      upc: null,
      scheduledAt: null,
      createdAt: '2026-10-02T10:00:00.000Z',
      updatedAt: '2026-10-02T10:00:00.000Z',
    }),
  )
  await page.route('**/api/v1/artist-music/releases?*', (route) => {
    const pageNumber = Number(
      new URL(route.request().url()).searchParams.get('page'),
    )
    return route.fulfill({
      json: {
        data: records.slice((pageNumber - 1) * 20, pageNumber * 20),
        total: 21,
        page: pageNumber,
        limit: 20,
      },
    })
  })
  await authenticate(context)
  await gotoHydrated(page, '/dashboard/music?tab=releases')
  await expect(
    page.getByRole('table', { name: 'Your releases' }).locator('tbody tr'),
  ).toHaveCount(20)
  await page.getByRole('button', { name: 'Next', exact: true }).click()
  await expect(page).toHaveURL(/page=2/)
  await expect(
    page.getByRole('button', { name: 'Open Release 21', exact: true }),
  ).toBeVisible()
  await expect(
    page.getByRole('table', { name: 'Your releases' }).locator('tbody tr'),
  ).toHaveCount(1)
  await gotoHydrated(page, page.url())
  await expect(
    page.getByRole('button', { name: 'Open Release 21', exact: true }),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Previous', exact: true }).click()
  await expect(
    page.getByRole('button', { name: 'Open Release 1', exact: true }),
  ).toBeVisible()
})

test('release drafts do not claim success for an unverified save response', async ({
  page,
  context,
}) => {
  await page.route('**/api/v1/releases', (route) =>
    route.fulfill({ status: 201, json: {} }),
  )
  await authenticate(context)
  await gotoHydrated(page, '/dashboard')
  await page
    .getByRole('button', { name: 'Create release', exact: true })
    .last()
    .click()
  const dialog = page.getByRole('dialog', {
    name: 'Create release',
    exact: true,
  })
  await dialog.getByLabel('Release title').fill('Unconfirmed draft')
  await dialog
    .getByRole('button', { name: 'Create draft', exact: true })
    .click()
  await expect(dialog.getByRole('alert')).toContainText(
    'Check Music before trying again',
  )
  await expect(page).toHaveURL(/\/dashboard$/)
  await expect(dialog.getByRole('status')).toHaveCount(0)
})

test('release list shows loading before an empty response is confirmed', async ({
  page,
  context,
}) => {
  let resume!: () => void
  const gate = new Promise<void>((resolve) => {
    resume = resolve
  })
  await page.route('**/api/v1/artist-music/releases?*', async (route) => {
    await gate
    await route.fulfill({ json: { data: [], total: 0, page: 1, limit: 20 } })
  })
  await authenticate(context)
  try {
    await gotoHydrated(page, '/dashboard/music?tab=releases')
    await expect(page.getByRole('status')).toHaveText('Loading your releases…')
    await expect(
      page.getByRole('heading', { name: 'Your first release starts here' }),
    ).toHaveCount(0)
  } finally {
    resume()
  }
  await expect(
    page.getByRole('heading', { name: 'Your first release starts here' }),
  ).toBeVisible()
})

test('release list belongs to the signed-in artist after signing out and switching accounts', async ({
  page,
  context,
}, testInfo) => {
  let refreshes = 0
  page.on('request', (request) => {
    if (request.url().endsWith('/api/v1/artists/auth/refresh')) refreshes++
  })
  await authenticate(context)
  await gotoHydrated(page, '/dashboard')
  await page
    .getByRole('button', { name: 'Create release', exact: true })
    .last()
    .click()
  const dialog = page.getByRole('dialog', {
    name: 'Create release',
    exact: true,
  })
  const title = `Private draft ${testInfo.project.name}`
  await dialog.getByLabel('Release title').fill(title)
  await dialog
    .getByRole('button', { name: 'Create draft', exact: true })
    .click()
  await expect(
    page.getByRole('button', { name: `Open ${title}`, exact: true }),
  ).toBeVisible()
  await openAppearance(page)
  await page.getByRole('button', { name: 'Sign out' }).click()
  await expect(page).toHaveURL(/\/login$/)
  await authenticate(context, 'test-other')
  await gotoHydrated(page, '/dashboard/music?tab=releases')
  await expect(
    page.getByRole('heading', { name: 'Your first release starts here' }),
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: `Open ${title}`, exact: true }),
  ).toHaveCount(0)
  expect(refreshes).toBe(0)
})

test('workspace theme switches all three palettes and persists across navigation and reload', async ({
  page,
  context,
}) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })
  await authenticate(context)
  await gotoHydrated(page, '/dashboard')
  await expect(page.locator('.artist-dashboard').first()).toHaveCSS(
    'background-color',
    'rgb(11, 13, 18)',
  )
  const initialCard = await page
    .getByRole('region', { name: 'Release workspace' })
    .boundingBox()
  for (const [name, background] of [
    ['Light', 'rgb(255, 255, 255)'],
    ['Dark', 'rgb(5, 6, 10)'],
    ['Dim', 'rgb(11, 13, 18)'],
  ] as const) {
    const appearance = await openAppearance(page)
    const option = appearance.getByRole('radio', { name, exact: true })
    await option.check()
    const currentAppearance = await openAppearance(page)
    await expect(
      currentAppearance.getByRole('radio', { name, exact: true }),
    ).toBeChecked()
    await expect(page.locator('.artist-dashboard').first()).toHaveCSS(
      'background-color',
      background,
    )
    await closeAccountMenu(page)
    await expect(
      page.getByRole('heading', { name: 'Dashboard', exact: true }),
    ).toBeVisible()
    expect(
      await page
        .getByRole('region', { name: 'Release workspace' })
        .boundingBox(),
    ).toEqual(initialCard)
    await openNavigation(page)
    await page.getByRole('link', { name: 'Music', exact: true }).click()
    await expect(page).toHaveURL(/\/dashboard\/music$/)
    await gotoHydrated(page, page.url())
    const restoredAppearance = await openAppearance(page)
    await expect(
      restoredAppearance.getByRole('radio', { name, exact: true }),
    ).toBeChecked()
    await expect(page.locator('.artist-dashboard').first()).toHaveCSS(
      'background-color',
      background,
    )
    await closeAccountMenu(page)
    await openNavigation(page)
    await page.getByRole('link', { name: 'Dashboard', exact: true }).click()
  }
  expect(errors).toEqual([])
})

test('workspace theme ignores invalid stored values and keeps authentication readable', async ({
  page,
  context,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem('bitrate.artist-theme.v1', 'invalid-theme')
  })
  await authenticate(context)
  await gotoHydrated(page, '/dashboard')
  await openAppearance(page)
  await expect(
    page.getByRole('radio', { name: 'Dim', exact: true }),
  ).toBeChecked()
  await page.getByRole('radio', { name: 'Light', exact: true }).check()
  await page.getByRole('button', { name: 'Sign out' }).click()
  await expect(page).toHaveURL(/\/login$/)
  await expect(page.locator('html')).toHaveClass('dark')
  await expect(page.getByLabel('Email Address')).toBeVisible()
})

test('workspace theme supports keyboard selection when browser storage is unavailable', async ({
  page,
  context,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', {
      get() {
        throw new DOMException('Storage disabled', 'SecurityError')
      },
    })
  })
  await authenticate(context)
  await gotoHydrated(page, '/dashboard')
  await openAppearance(page)
  const light = page.getByRole('radio', { name: 'Light', exact: true })
  await light.focus()
  await page.keyboard.press('Space')
  await expect(light).toBeChecked()
  await page.keyboard.press('ArrowRight')
  await expect(page.locator('html')).toHaveClass('dark')
  await openAppearance(page)
  await expect(
    page.getByRole('radio', { name: 'Dark', exact: true }),
  ).toBeChecked()
  await expect(page.locator('.artist-dashboard').first()).toHaveCSS(
    'background-color',
    'rgb(5, 6, 10)',
  )
})

for (const theme of ['dark', 'light', 'dim'] as const) {
  test(`${theme} design commands explain upcoming features and keep existing routes reachable`, async ({
    page,
    context,
    isMobile,
  }) => {
    await page.addInitScript(
      (value) => localStorage.setItem('bitrate.artist-theme.v1', value),
      theme,
    )
    await authenticate(context)
    await gotoHydrated(page, '/dashboard')
    await expect(
      page.getByRole('heading', { name: 'Dashboard', exact: true }),
    ).toBeVisible()
    for (const name of ['Promotion', 'Analytics', 'Profile', 'Settings']) {
      await openNavigation(page)
      await page.getByRole('button', { name, exact: true }).click()
      const notice = page.getByRole('dialog', { name, exact: true })
      await expect(
        notice.getByText('Coming soon', { exact: true }),
      ).toBeVisible()
      await expect(page.locator('body')).toHaveCSS('overflow', 'hidden')
      await notice.getByRole('button', { name: 'Close dialog' }).click()
    }
    const create = page.getByRole('button', {
      name: 'Create release',
      exact: true,
    })
    await create.click()
    const release = page.getByRole('dialog', {
      name: 'Create release',
      exact: true,
    })
    await expect(release.getByLabel('Release title')).toBeFocused()
    await expect(
      release.getByRole('button', { name: 'Create draft', exact: true }),
    ).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(create).toBeFocused()
    await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden')
    await page
      .getByRole('button', { name: 'Notifications', exact: true })
      .click()
    await expect(
      page.getByRole('dialog', { name: 'Notifications' }),
    ).toContainText('No notifications are available')
    await page.keyboard.press('Escape')
    if (isMobile)
      await page
        .getByRole('button', { name: 'Search workspace', exact: true })
        .click()
    else await page.keyboard.press('Control+k')
    const search = page.getByRole('dialog', {
      name: 'Search workspace',
      exact: true,
    })
    const query = search.getByRole('searchbox', {
      name: 'Search workspace',
      exact: true,
    })
    await expect(query).toBeFocused()
    await query.fill('no-such-section')
    await expect(search.getByRole('status')).toHaveText(
      'No matching workspace sections.',
    )
    await query.fill('Tasks')
    await search.getByRole('link', { name: 'Tasks', exact: true }).click()
    await expect(page).toHaveURL(/\/dashboard\/tasks$/)
    await expect(search).not.toBeVisible()
    await page
      .getByRole('button', { name: 'Search workspace', exact: true })
      .click()
    await page
      .getByRole('searchbox', { name: 'Search workspace', exact: true })
      .fill('Distribution')
    await page.getByRole('link', { name: 'Distribution', exact: true }).click()
    await expect(page).toHaveURL(/\/dashboard\/distribution$/)
    await openAppearance(page)
    const account = page.getByRole('dialog', {
      name: 'Artist account',
      exact: true,
    })
    const dark = account.getByRole('radio', { name: 'Dark', exact: true })
    await dark.check()
    await dark.focus()
    await page.keyboard.press('ArrowLeft')
    await expect(
      account.getByRole('radio', { name: 'Light', exact: true }),
    ).toBeChecked()
    await expect(account).toBeVisible()
    await account.getByRole('button', { name: 'Sign out', exact: true }).click()
    await expect(page).toHaveURL(/\/login$/)
    await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden')
  })
}

test('unverified artist can confirm email and then sign in', async ({
  page,
}) => {
  // page.request shares the browser context's cookies, so registration lands in this test's scope.
  await page.request.post(
    'http://localhost:3103/api/v1/artists/auth/registration',
    {
      data: {
        email: 'unverified@example.test',
        password: 'Password123!',
        username: 'Unverified',
      },
    },
  )
  await gotoHydrated(page, '/dashboard/tasks')
  await page.getByLabel('Email Address').fill('unverified@example.test')
  await page.getByLabel('Password', { exact: true }).fill('Password123!')
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await expect(page.getByRole('alert')).toContainText(
    'Verify your email before signing in.',
  )
  await page.getByRole('link', { name: 'Verify email' }).click()
  await expect(
    page.getByRole('heading', { name: 'Verify your email' }),
  ).toBeVisible()
  await expect(page.getByLabel('Email address')).toHaveValue(
    'unverified@example.test',
  )
  await page.screenshot({
    path: test.info().outputPath('verification-code.png'),
    fullPage: true,
  })
  await page.getByRole('button', { name: 'Resend verification email' }).click()
  await expect(page.getByRole('status')).toContainText(
    'If the account needs verification',
  )
  await page.getByLabel('Verification code').fill('000000')
  await page.getByRole('button', { name: 'Verify and continue' }).click()
  await expect(page.getByRole('alert')).toContainText(
    'This code is invalid or expired',
  )
  await page.getByLabel('Verification code').fill('123456')
  await page.getByRole('button', { name: 'Verify and continue' }).click()
  await expect(page.getByRole('status')).toContainText(
    'Your email has been verified',
  )
  await page.getByRole('link', { name: 'Back to login' }).click()
  await page.getByLabel('Email Address').fill('unverified@example.test')
  await page.getByLabel('Password', { exact: true }).fill('Password123!')
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await expect(page).toHaveURL(/\/dashboard\/tasks$/)
})

test('registration explains email verification instead of reporting a completed login', async ({
  page,
}) => {
  await gotoHydrated(page, '/registration')
  await page.getByLabel('Email Address').fill('unverified@example.test')
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await page.getByLabel('Password', { exact: true }).fill('Password123!')
  await page.getByRole('checkbox', { name: /at least 16 years old/i }).click()
  await page
    .getByRole('checkbox', { name: /accept the Artist Agreement/i })
    .click()
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await expect(page).toHaveURL(/\/verify-email\?email=/)
  await expect(
    page.getByRole('heading', { name: 'Verify your email' }),
  ).toBeVisible()
  await expect(page.getByLabel('Verification code')).toBeVisible()
  await expect(page.getByLabel('Email address')).toHaveValue(
    'unverified@example.test',
  )
})

test('email verification handles expired links and failed resend without losing the form', async ({
  page,
}) => {
  await gotoHydrated(
    page,
    '/verify-email?token=expired&email=unverified%40example.test',
  )
  await page.getByRole('button', { name: 'Verify email', exact: true }).click()
  await expect(page.getByRole('alert')).toContainText(
    'This verification link is invalid or expired.',
  )
  await page.route('**/api/v1/artists/auth/verify-email/resend', (route) =>
    route.fulfill({
      status: 503,
      json: { message: 'Unavailable' },
    }),
  )
  await page.getByRole('button', { name: 'Resend verification email' }).click()
  await expect(
    page
      .getByRole('alert')
      .filter({ hasText: 'Could not resend the verification email.' }),
  ).toBeVisible()
  await expect(page.getByLabel('Email address')).toHaveValue(
    'unverified@example.test',
  )
})

test('email verification preserves valid links and the dark auth background', async ({
  page,
}) => {
  await gotoHydrated(page, '/verify-email?token=test-verification')
  await expect(page.getByRole('main')).toHaveCSS(
    'background-color',
    'rgb(18, 18, 18)',
  )
  await page.getByRole('button', { name: 'Verify email', exact: true }).click()
  await expect(page.getByRole('status')).toContainText(
    'Your email has been verified',
  )
})

test('email verification distinguishes local codes from unavailable email delivery', async ({
  page,
}) => {
  await gotoHydrated(page, '/verify-email?email=unverified%40example.test')
  await page.route('**/api/v1/artists/auth/verify-email/resend', (route) =>
    route.fulfill({ json: { delivery: 'unavailable' } }),
  )
  await page.getByRole('button', { name: 'Resend verification email' }).click()
  await expect(page.getByRole('alert')).toContainText(
    'The verification email could not be sent',
  )
  await expect(page.getByRole('status')).toHaveCount(0)
  await page.route('**/api/v1/artists/auth/verify-email/resend', (route) =>
    route.fulfill({ json: { delivery: 'development' } }),
  )
  await page.getByRole('button', { name: 'Resend verification email' }).click()
  await expect(page.getByRole('status')).toContainText('API terminal')
  await expect(
    page.getByRole('button', { name: /Send again in/ }),
  ).toBeDisabled()
  await expect(page.getByLabel('Verification code')).toBeFocused()
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    ),
  ).toBe(false)
})

test('guest is redirected before any dashboard markup is rendered', async ({
  page,
  request,
}) => {
  const response = await request.get('/dashboard/music?draft=1', {
    maxRedirects: 0,
  })
  expect(response.status()).toBe(307)
  expect(response.headers().location).toContain('/login?next=')
  expect(await response.text()).not.toContain('Test artist')
  await gotoHydrated(page, '/dashboard/music?draft=1')
  const url = new URL(page.url())
  expect(url.pathname).toBe('/login')
  expect(url.searchParams.get('next')).toBe('/dashboard/music?draft=1')
})

test('authenticated shell supports navigation and signing out', async ({
  page,
  context,
}) => {
  await authenticate(context)
  await gotoHydrated(page, '/dashboard')
  await openNavigation(page)
  await expect(
    page.getByRole('img', { name: 'Test artist', exact: true }),
  ).toBeVisible()
  await expect(
    page.getByRole('heading', {
      name: /^(Dashboard|Make room for your next release)$/,
    }),
  ).toBeVisible()
  await openNavigation(page)
  await page.getByRole('link', { name: 'Music', exact: true }).click()
  await expect(page).toHaveURL(/\/dashboard\/music$/)
  await expect(
    page.getByRole('heading', { name: 'Music', exact: true }),
  ).toBeVisible()
  await openAppearance(page)
  await expect(page.getByRole('button', { name: 'Sign out' })).toBeVisible()
  await page.getByRole('button', { name: 'Sign out' }).click()
  await expect(page).toHaveURL(/\/login$/)
  await gotoHydrated(page, '/dashboard')
  await expect(page).toHaveURL(/\/login\?next=/)
})

test('server rendering isolates artist identities and disables private response caching', async ({
  request,
}) => {
  const [first, second] = await Promise.all([
    request.get('/dashboard', {
      headers: {
        Cookie: 'access_token=test-valid; refresh_token=test-refresh',
      },
    }),
    request.get('/dashboard', {
      headers: {
        Cookie: 'access_token=test-other; refresh_token=test-refresh',
      },
    }),
  ])
  expect(first.ok()).toBe(true)
  expect(second.ok()).toBe(true)
  for (const response of [first, second]) {
    expect(response.headers()['cache-control']).toContain('private')
    expect(response.headers()['cache-control']).toContain('no-store')
  }
  const firstHtml = await first.text()
  const secondHtml = await second.text()
  expect(firstHtml).toContain('Test artist')
  expect(firstHtml).not.toContain('Other artist')
  expect(secondHtml).toContain('Other artist')
  expect(secondHtml).not.toContain('Test artist')
})

test('login returns to the requested protected page', async ({ page }) => {
  await gotoHydrated(page, '/dashboard/tasks')
  await page.getByLabel('Email Address').fill('artist@example.test')
  await page.getByLabel('Password', { exact: true }).fill('Password123!')
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await expect(page).toHaveURL(/\/dashboard\/tasks$/)
  await expect(
    page.getByRole('heading', { name: 'Tasks', exact: true }),
  ).toBeVisible()
})

test('a forged refresh cookie does not unlock the workspace', async ({
  page,
  context,
}) => {
  await authenticate(context, 'test-expired', 'test-forged')
  await gotoHydrated(page, '/dashboard')
  await expect(page).toHaveURL(/\/login\?next=/)
  await expect(page.getByText('Test artist', { exact: true })).toHaveCount(0)
})

test('two-factor login verifies the code before returning to the protected page', async ({
  page,
  context,
}) => {
  await gotoHydrated(page, '/dashboard/tasks')
  await page.getByLabel('Email Address').fill('twofactor@example.test')
  await page.getByLabel('Password', { exact: true }).fill('Password123!')
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  const code = page.getByLabel('Authentication code')
  await expect(code).toBeVisible()
  await expect(code).toBeFocused()
  await expect(page).toHaveURL(/\/login\?next=/)
  await code.fill('000000')
  await page.getByRole('button', { name: 'Verify and sign in' }).click()
  await expect(page.getByRole('alert')).toContainText('Invalid or expired code')
  await expect(page.getByText('Test artist', { exact: true })).toHaveCount(0)
  await code.fill('123456')
  await page.getByRole('button', { name: 'Verify and sign in' }).click()
  await expect(page).toHaveURL(/\/dashboard\/tasks$/)
  const cookies = await context.cookies()
  expect(
    cookies.find((cookie) => cookie.name === 'pending_2fa_token'),
  ).toBeUndefined()
  expect(
    cookies.find((cookie) => cookie.name === 'access_token'),
  ).toMatchObject({
    value: 'test-valid',
    httpOnly: true,
  })
})

test('incorrect credentials show a visible error and allow another attempt', async ({
  page,
}) => {
  await gotoHydrated(page, '/login')
  await page.getByLabel('Email Address').fill('artist@example.test')
  await page.getByLabel('Password', { exact: true }).fill('WrongPassword123!')
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await expect(page.getByRole('alert')).toHaveText(
    'Invalid email or password. Please try again.',
  )
  await page.getByLabel('Password', { exact: true }).fill('Password123!')
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await expect(page).toHaveURL(/\/dashboard$/)
})

test('expired access token refreshes on the server and relays httpOnly cookies', async ({
  page,
  context,
}) => {
  await authenticate(context, 'test-expired')
  await gotoHydrated(page, '/dashboard')
  await openNavigation(page)
  await expect(
    page.getByRole('img', { name: 'Test artist', exact: true }),
  ).toBeVisible()
  const cookies = await context.cookies()
  expect(
    cookies.find((cookie) => cookie.name === 'access_token'),
  ).toMatchObject({ value: 'test-valid', httpOnly: true })
  expect(
    cookies.find((cookie) => cookie.name === 'refresh_token'),
  ).toMatchObject({ value: 'test-refresh-rotated', httpOnly: true })
})

test('session outage renders retry without private workspace content', async ({
  page,
  context,
}) => {
  await authenticate(context, 'test-outage')
  await gotoHydrated(page, '/dashboard')
  await expect(
    page.getByRole('heading', { name: "We couldn't check your session" }),
  ).toBeVisible()
  await expect(page.getByRole('button', { name: 'Try again' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Sign out' })).toHaveCount(0)
  await authenticate(context)
  await page.getByRole('button', { name: 'Try again' }).click()
  await expect(
    page.getByRole('heading', { name: 'Dashboard', exact: true }),
  ).toBeVisible()
  await openNavigation(page)
  await expect(
    page.getByRole('img', { name: 'Test artist', exact: true }),
  ).toBeVisible()
})

test('failed logout leaves the workspace visible and offers retry', async ({
  page,
  context,
}) => {
  await authenticate(context, 'test-valid', 'test-logout-failure')
  await gotoHydrated(page, '/dashboard')
  await openAppearance(page)
  await page.getByRole('button', { name: 'Sign out' }).click()
  await expect(page.getByRole('alert')).toHaveText(
    'Could not sign out. Please try again.',
  )
  await expect(page).toHaveURL(/\/dashboard$/)
})

test('mobile navigation closes on Escape and restores focus', async ({
  page,
  context,
  isMobile,
}) => {
  test.skip(!isMobile, 'Mobile navigation')
  await authenticate(context)
  await gotoHydrated(page, '/dashboard')
  const trigger = page.getByRole('button', { name: 'Open workspace menu' })
  await trigger.click()
  await expect(
    page.getByRole('link', { name: 'Music', exact: true }),
  ).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(trigger).toBeFocused()
  await expect(
    page.getByRole('link', { name: 'Music', exact: true }),
  ).toHaveCount(0)
  const overflows = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  )
  expect(overflows).toBe(false)
})

test('mobile drawer fills the viewport, locks background scrolling and closes on backdrop', async ({
  page,
  context,
  isMobile,
}) => {
  test.skip(!isMobile, 'Mobile navigation')
  await authenticate(context)
  await gotoHydrated(page, '/dashboard')
  for (const width of [320, 390, 425, 768, 990]) {
    await page.setViewportSize({ width, height: 844 })
    const trigger = page.getByRole('button', { name: 'Open workspace menu' })
    await trigger.click()
    const menu = page.getByRole('dialog', { name: 'Workspace menu' })
    await expect(menu).toBeVisible()
    const bounds = await menu.boundingBox()
    expect(bounds).toMatchObject({ x: 0, y: 0, height: 844 })
    expect(bounds?.width).toBeLessThanOrEqual(320)
    expect(bounds?.width).toBeLessThan(width)
    await expect(
      menu.getByRole('button', { name: 'Artist account menu' }),
    ).toBeVisible()
    await expect(page.locator('body')).toHaveCSS('overflow', 'hidden')
    const scrollBefore = await page.evaluate(() => scrollY)
    await page.mouse.move(width - 10, 300)
    await page.mouse.wheel(0, 200)
    expect(await page.evaluate(() => scrollY)).toBe(scrollBefore)
    await page.mouse.click(width - 10, 100)
    await expect(menu).not.toBeVisible()
    await expect(trigger).toBeFocused()
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
    ).toBe(false)
  }
})

test('mobile drawer keeps controls visible in landscape and releases scroll on desktop resize', async ({
  page,
  context,
  isMobile,
}) => {
  test.skip(!isMobile, 'Mobile navigation')
  await authenticate(context)
  await gotoHydrated(page, '/dashboard')
  await page.setViewportSize({ width: 650, height: 320 })
  await page.getByRole('button', { name: 'Open workspace menu' }).click()
  const menu = page.getByRole('dialog', { name: 'Workspace menu' })
  await expect(
    menu.getByRole('button', { name: 'Close workspace menu' }),
  ).toBeInViewport()
  await expect(
    menu.getByRole('button', { name: 'Artist account menu' }),
  ).toBeInViewport()
  await page.setViewportSize({ width: 1280, height: 844 })
  await expect(menu).not.toBeVisible()
  await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden')
  await expect(
    page.getByRole('navigation', { name: 'Artist workspace' }),
  ).toBeVisible()
})
