import { expect, type Page, test } from '@playwright/test'

/** Scene regions in order, by their accessible names (English copy). */
const SCENES = [
  { id: 'hero', name: 'Your music, already where you are' },
  { id: 'loop', name: 'Play, save, return' },
  { id: 'workshop', name: 'Start with a feeling, finish with your playlist' },
  { id: 'rules', name: 'Your player, your rules' },
  { id: 'library', name: 'A library with a memory' },
  { id: 'discover', name: 'Follow the sound' },
  { id: 'devices', name: 'Same queue, new scene' },
  { id: 'social', name: 'Beyond the play button' },
  { id: 'partners', name: 'Our partners' },
  { id: 'team', name: 'About our team' },
  { id: 'cta', name: 'Pick up where the last track left off' },
] as const

/** The intro plays once per session; tests start with it already seen. */
const skipIntro = async (page: Page) => {
  await page.addInitScript(() => {
    sessionStorage.setItem('bitrate-landing-intro', '1')
  })
}
const activeScene = (page: Page) => page.locator('.landing .scene.is-active')
/** The engine is mounted once the dots reflect its state and the page is locked to scenes. */
const engineReady = (page: Page) =>
  expect(page.locator('html')).toHaveClass(/landing-lock/)

test.describe('landing page', () => {
  test('renders the eleven scenes and none of the old landing', async ({
    page,
  }) => {
    await page.goto('/')
    for (const { name } of SCENES)
      await expect(
        page.getByRole('region', { name, exact: true }),
      ).toBeAttached()
    await expect(page.locator('.landing .scene')).toHaveCount(SCENES.length)
    await expect(
      page.getByText('Discover a World of Music with Bitrate'),
    ).toHaveCount(0)
    await expect(
      page.getByText(/Premium Individual|Premium Duo|Premium Family/),
    ).toHaveCount(0)
  })

  test('calls to action point at the player and the auth pages for a guest', async ({
    page,
  }) => {
    await page.goto('/')
    const hero = page.getByRole('region', { name: SCENES[0].name })
    await expect(
      hero.getByRole('link', { name: 'Open web player' }),
    ).toHaveAttribute('href', '/main')
    await expect(
      hero.getByRole('link', { name: 'Create account' }),
    ).toHaveAttribute('href', '/auth/registration')
    const start = page.getByRole('region', { name: SCENES[10].name })
    await expect(start.getByRole('link', { name: 'Log in' })).toHaveAttribute(
      'href',
      '/auth/login',
    )
  })

  test('a signed-in visitor sees no account calls to action', async ({
    page,
    context,
    baseURL,
  }) => {
    await context.addCookies([
      {
        name: 'access_token',
        value: 'e2e',
        url: baseURL ?? 'http://localhost:3001',
      },
    ])
    await page.goto('/')
    await expect(
      page.getByRole('link', { name: 'Open web player' }).first(),
    ).toHaveAttribute('href', '/main')
    await expect(
      page.getByRole('link', { name: 'Create account' }),
    ).toHaveCount(0)
    await expect(page.getByRole('link', { name: 'Log in' })).toHaveCount(0)
  })
})

test.describe('landing without JavaScript', () => {
  test.use({ javaScriptEnabled: false })

  test('server HTML already holds the hero heading and its links', async ({
    page,
  }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1 })).toContainText(
      'Your music',
    )
    await expect(
      page.getByRole('link', { name: /Open web player/ }).first(),
    ).toHaveAttribute('href', '/main')
  })
})

test.describe('landing navigation on desktop', () => {
  test.skip(({ isMobile }) => isMobile, 'desktop gestures')

  test('keys, dots and wheel move between scenes and the hash follows', async ({
    page,
  }) => {
    await skipIntro(page)
    await page.goto('/')
    await engineReady(page)
    await expect(activeScene(page)).toHaveId('hero')

    await page.keyboard.press('ArrowDown')
    await expect(activeScene(page)).toHaveId('loop')
    await expect(page).toHaveURL(/#loop$/)

    await page.getByRole('button', { name: 'Go to Library' }).click()
    await expect(activeScene(page)).toHaveId('library')
    await expect(page).toHaveURL(/#library$/)

    await expect(page.locator('.landing')).not.toHaveClass(/is-static/)
    await page.mouse.move(400, 400)
    await expect(async () => {
      await page.mouse.wheel(0, 240)
      await expect(activeScene(page)).toHaveId('discover', { timeout: 1500 })
    }).toPass({ timeout: 8000 })

    await page.keyboard.press('End')
    await expect(activeScene(page)).toHaveId('cta')
  })

  test('a deep link opens its scene', async ({ page }) => {
    await skipIntro(page)
    await page.goto('/#library')
    await engineReady(page)
    await expect(activeScene(page)).toHaveId('library')
  })
})

/** Dispatches a vertical touch swipe starting on `selector` (GSAP Observer listens on window). */
const swipe = async ({
  page,
  selector,
  dy,
}: {
  page: Page
  selector: string
  dy: number
}) => {
  await page.evaluate(
    ({ selector, dy }) => {
      const el = document.querySelector(selector)
      if (!el) throw new Error(`missing ${selector}`)
      const r = el.getBoundingClientRect()
      const x = r.left + r.width / 2
      const y0 = r.top + r.height / 2
      const touch = (y: number) =>
        new Touch({ identifier: 1, target: el, clientX: x, clientY: y })
      const fire = (type: string, y: number) => {
        const t = touch(y)
        el.dispatchEvent(
          new TouchEvent(type, {
            bubbles: true,
            cancelable: true,
            touches: type === 'touchend' ? [] : [t],
            changedTouches: [t],
          }),
        )
      }
      fire('touchstart', y0)
      for (let k = 1; k <= 6; k++) fire('touchmove', y0 + (dy * k) / 6)
      fire('touchend', y0 + dy)
    },
    { selector, dy },
  )
}

test.describe('landing on touch screens', () => {
  test.skip(({ isMobile }) => !isMobile, 'touch gestures')

  test('a vertical swipe changes scenes; a swipe in a physics field does not', async ({
    page,
  }) => {
    await skipIntro(page)
    await page.goto('/')
    await engineReady(page)
    await swipe({ page, selector: '#hero .board', dy: -220 })
    await expect(activeScene(page)).toHaveId('loop')

    await page.goto('/#partners')
    await engineReady(page)
    await expect(activeScene(page)).toHaveId('partners')
    await swipe({ page, selector: '#partnerZone', dy: -220 })
    await page.waitForTimeout(1200)
    await expect(activeScene(page)).toHaveId('partners')
  })
})

test.describe('landing without WebGL', () => {
  test('the 2D fallbacks render and nothing throws', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (e) => errors.push(e.message))
    page.on('console', (m) => {
      if (m.type() === 'error') errors.push(m.text())
    })
    await page.addInitScript(() => {
      const original = HTMLCanvasElement.prototype.getContext
      Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
        value(this: HTMLCanvasElement, type: string, ...rest: unknown[]) {
          if (type === 'webgl' || type === 'webgl2') return null
          return Reflect.apply(original, this, [type, ...rest])
        },
      })
    })
    await skipIntro(page)
    await page.goto('/#partners')
    await engineReady(page)
    await expect(page.locator('#partnerZone .ball.tech').first()).toBeAttached()
    expect(
      errors.filter((e) => !/health\/ready|Failed to load resource/.test(e)),
    ).toEqual([])
  })
})

test.describe('landing with reduced motion', () => {
  test.use({ reducedMotion: 'reduce' })

  test('shows every scene on one static, scrollable page', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('.landing')).toHaveClass(/is-static/)
    await expect(page.locator('html')).not.toHaveClass(/landing-lock/)
    await expect(page.locator('.landing .scene.is-active')).toHaveCount(
      SCENES.length,
    )
    await expect(page.locator('.landing .intro')).toBeHidden()
    const scrollable = await page.evaluate(
      () =>
        document.scrollingElement !== null &&
        document.scrollingElement.scrollHeight > window.innerHeight * 2,
    )
    expect(scrollable).toBe(true)
  })
})
