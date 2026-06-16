import { render } from '@testing-library/react'
import { page } from 'vitest/browser'
import { describe, expect, it } from 'vitest'
import { Toaster } from './sonner'

describe('Sonner screenshots', () => {
  it('default toaster', async () => {
    render(<Toaster />)
    await expect(page.elementLocator(document.body)).toMatchScreenshot()
  })
})
