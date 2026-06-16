import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { page } from 'vitest/browser'
import { Toaster } from './sonner'

describe('Sonner screenshots', () => {
  it('default toaster', async () => {
    render(<Toaster />)
    await expect(page.elementLocator(document.body)).toMatchScreenshot()
  })
})
