import { render } from '@testing-library/react'
import { page } from '@vitest/browser/context'
import { describe, expect, it } from 'vitest'
import { Toaster } from './sonner'

describe('Sonner screenshots', () => {
  it('default toaster', async () => {
    render(<Toaster />)
    const { base64 } = await page.screenshot({ base64: true })
    expect(base64).toMatchSnapshot('sonner-default')
  })
})
