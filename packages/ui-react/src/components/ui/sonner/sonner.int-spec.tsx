import { render, screen, waitFor } from '@testing-library/react'
import { act } from 'react'
import { describe, expect, it } from 'vitest'
import { Toaster, toast } from './sonner'

describe('Sonner integration', () => {
  it('displays a toast message triggered via the toast API', async () => {
    render(<Toaster />)
    act(() => {
      toast('Saved successfully')
    })
    await waitFor(() => expect(screen.getByText('Saved successfully')).toBeInTheDocument())
  })
})
